import type {
	DrawingEngineInterface,
	DrawingEventsCallbacks,
	DrawingUtilsInterface,
	StateChangeCallback,
} from "./types";

/**
 * DrawingEvents - Handles all mouse events, resize events, and media loading
 * Manages user interactions with the drawing canvas
 */
export class DrawingEvents {
	#drawingEngine: DrawingEngineInterface;
	#drawingUtils: DrawingUtilsInterface;
	#canvas: HTMLCanvasElement | null = null;
	#mediaElement: HTMLVideoElement | HTMLImageElement | null = null;
	#resizeObserver: ResizeObserver | null = null;

	// Event callbacks
	#onStateChange: StateChangeCallback | null = null;

	// State
	#isMediaLoaded = false;
	#mediaSize = { width: 0, height: 0 };
	#displaySize = { width: 0, height: 0 };

	constructor(
		drawingEngine: DrawingEngineInterface,
		drawingUtils: DrawingUtilsInterface
	) {
		this.#drawingEngine = drawingEngine;
		this.#drawingUtils = drawingUtils;
	}

	/**
	 * Initialize with canvas and media elements
	 */
	initialize(
		canvas: HTMLCanvasElement,
		mediaElement: HTMLVideoElement | HTMLImageElement,
		callbacks: DrawingEventsCallbacks
	): void {
		this.#canvas = canvas;
		this.#mediaElement = mediaElement;
		this.#onStateChange = callbacks.onStateChange;

		this.#setupEventListeners();
	}

	/**
	 * Setup all event listeners
	 */
	#setupEventListeners(): void {
		if (this.#canvas) {
			this.#canvas.addEventListener(
				"mousedown",
				this.#handleMouseDown.bind(this)
			);
			this.#canvas.addEventListener(
				"mousemove",
				this.#handleMouseMove.bind(this)
			);
			this.#canvas.addEventListener("mouseup", this.#handleMouseUp.bind(this));
			this.#canvas.addEventListener(
				"dblclick",
				this.#handleDoubleClick.bind(this)
			);
			this.#canvas.addEventListener(
				"mouseleave",
				this.#handleMouseLeave.bind(this)
			);
		}

		if (this.#mediaElement) {
			if (this.#mediaElement.tagName.toLowerCase() === "video") {
				this.#mediaElement.addEventListener(
					"loadedmetadata",
					this.#handleMediaLoaded.bind(this)
				);
			} else {
				this.#mediaElement.addEventListener(
					"load",
					this.#handleMediaLoaded.bind(this)
				);
			}
		}
	}

	/**
	 * Handle mouse down events
	 */
	#handleMouseDown(event: MouseEvent): void {
		if (!this.#isMediaLoaded || !this.#drawingEngine) return;

		const displayPoint = this.#drawingUtils.getMousePos(
			event as unknown as React.MouseEvent<HTMLCanvasElement>,
			this.#canvas
		);
		const mediaPoint = this.#drawingEngine.displayToMediaCoords(displayPoint);

		// Emit state change with mouse down data
		if (this.#onStateChange) {
			this.#onStateChange({
				type: "mouseDown",
				displayPoint,
				mediaPoint,
				event,
			});
		}
	}

	/**
	 * Handle mouse move events
	 */
	#handleMouseMove(event: MouseEvent): void {
		if (!this.#isMediaLoaded || !this.#drawingEngine) return;

		const displayPoint = this.#drawingUtils.getMousePos(
			event as unknown as React.MouseEvent<HTMLCanvasElement>,
			this.#canvas
		);
		const mediaPoint = this.#drawingEngine.displayToMediaCoords(displayPoint);

		// Update cursor based on interaction
		this.#updateCursor();

		// Emit state change with mouse move data
		if (this.#onStateChange) {
			this.#onStateChange({
				type: "mouseMove",
				displayPoint,
				mediaPoint,
				event,
			});
		}
	}

	/**
	 * Handle mouse up events
	 */
	#handleMouseUp(event: MouseEvent): void {
		// Emit state change with mouse up data
		if (this.#onStateChange) {
			this.#onStateChange({
				type: "mouseUp",
				event,
			});
		}
	}

	/**
	 * Handle double click events
	 */
	#handleDoubleClick(event: MouseEvent): void {
		if (!this.#isMediaLoaded || !this.#drawingEngine) return;

		const displayPoint = this.#drawingUtils.getMousePos(
			event as unknown as React.MouseEvent<HTMLCanvasElement>,
			this.#canvas
		);
		const mediaPoint = this.#drawingEngine.displayToMediaCoords(displayPoint);

		// Emit state change with double click data
		if (this.#onStateChange) {
			this.#onStateChange({
				type: "doubleClick",
				displayPoint,
				mediaPoint,
				event,
			});
		}
	}

	/**
	 * Handle mouse leave events
	 */
	#handleMouseLeave(event: MouseEvent): void {
		// Emit state change to clean up any drag states
		if (this.#onStateChange) {
			this.#onStateChange({
				type: "mouseLeave",
				event,
			});
		}
	}

	/**
	 * Handle media loaded events (video or image)
	 */
	#handleMediaLoaded(): void {
		if (!this.#mediaElement || !this.#canvas) return;

		const media = this.#mediaElement;
		const canvas = this.#canvas;

		let mediaWidth: number;
		let mediaHeight: number;

		// Get actual media dimensions
		if (media.tagName.toLowerCase() === "video" && "videoWidth" in media) {
			mediaWidth = media.videoWidth;
			mediaHeight = media.videoHeight;
		} else if (
			media.tagName.toLowerCase() === "img" &&
			"naturalWidth" in media
		) {
			mediaWidth = media.naturalWidth;
			mediaHeight = media.naturalHeight;
		} else {
			return; // Media not ready yet
		}

		// Get displayed media dimensions
		const rect = media.getBoundingClientRect();
		const displayWidth = rect.width;
		const displayHeight = rect.height;
		const pixelRatio = window.devicePixelRatio || 1;

		// Set canvas size to match the displayed media size with high DPI support
		canvas.width = displayWidth * pixelRatio;
		canvas.height = displayHeight * pixelRatio;
		canvas.style.width = `${displayWidth}px`;
		canvas.style.height = `${displayHeight}px`;

		// Scale context for high DPI
		const ctx = canvas.getContext("2d");
		if (ctx) {
			ctx.scale(pixelRatio, pixelRatio);
		}

		this.#mediaSize = { width: mediaWidth, height: mediaHeight };
		this.#displaySize = { width: displayWidth, height: displayHeight };
		this.#isMediaLoaded = true;

		// Update drawing engine sizes
		if (this.#drawingEngine) {
			this.#drawingEngine.updateSizes(this.#mediaSize, this.#displaySize);
		}

		// Setup resize observer after media is loaded
		this.#setupResizeObserver();

		// Emit state change with media loaded data
		if (this.#onStateChange) {
			this.#onStateChange({
				type: "mediaLoaded",
				mediaSize: this.#mediaSize,
				displaySize: this.#displaySize,
			});
		}

		// Request initial redraw
		this.#drawingEngine.requestRedraw();
	}

	/**
	 * Handle resize with proper aspect ratio maintenance
	 */
	#handleResize(): void {
		if (!this.#mediaElement || !this.#canvas || !this.#isMediaLoaded) return;

		const media = this.#mediaElement;
		const canvas = this.#canvas;
		const rect = media.getBoundingClientRect();
		const pixelRatio = window.devicePixelRatio || 1;

		// Update canvas size maintaining aspect ratio
		canvas.width = rect.width * pixelRatio;
		canvas.height = rect.height * pixelRatio;
		canvas.style.width = `${rect.width}px`;
		canvas.style.height = `${rect.height}px`;

		// Rescale context
		const ctx = canvas.getContext("2d");
		if (ctx) {
			ctx.scale(pixelRatio, pixelRatio);
		}

		this.#displaySize = { width: rect.width, height: rect.height };

		// Update drawing engine sizes
		if (this.#drawingEngine) {
			this.#drawingEngine.updateSizes(this.#mediaSize, this.#displaySize);
		}

		// Emit state change with resize data
		if (this.#onStateChange) {
			this.#onStateChange({
				type: "resize",
				displaySize: this.#displaySize,
			});
		}

		// Request redraw
		this.#drawingEngine.requestRedraw();
	}

	/**
	 * Setup ResizeObserver for responsive behavior
	 */
	#setupResizeObserver(): void {
		if (!this.#mediaElement) return;

		// Clean up existing observer
		if (this.#resizeObserver) {
			this.#resizeObserver.disconnect();
		}

		// Create new ResizeObserver
		this.#resizeObserver = new ResizeObserver(() => {
			requestAnimationFrame(() => this.#handleResize());
		});

		// Observe the container
		this.#resizeObserver.observe(this.#mediaElement);
	}

	/**
	 * Update cursor based on current interaction state
	 */
	#updateCursor(): void {
		if (!this.#canvas) return;

		// This will be called from the main component with current state
		// For now, we'll just set a default cursor
		this.#canvas.style.cursor = "crosshair";
	}

	/**
	 * Set cursor style
	 */
	setCursor(cursorStyle: string): void {
		if (this.#canvas) {
			this.#canvas.style.cursor = cursorStyle;
		}
	}

	/**
	 * Get current media and display sizes
	 */
	getSizes(): {
		mediaSize: { width: number; height: number };
		displaySize: { width: number; height: number };
		isMediaLoaded: boolean;
	} {
		return {
			mediaSize: this.#mediaSize,
			displaySize: this.#displaySize,
			isMediaLoaded: this.#isMediaLoaded,
		};
	}

	/**
	 * Update drawing engine and utils references
	 */
	updateReferences(
		drawingEngine: DrawingEngineInterface,
		drawingUtils: DrawingUtilsInterface
	): void {
		this.#drawingEngine = drawingEngine;
		this.#drawingUtils = drawingUtils;
	}

	/**
	 * Cleanup event listeners and observers
	 */
	cleanup(): void {
		if (this.#canvas) {
			this.#canvas.removeEventListener("mousedown", this.#handleMouseDown);
			this.#canvas.removeEventListener("mousemove", this.#handleMouseMove);
			this.#canvas.removeEventListener("mouseup", this.#handleMouseUp);
			this.#canvas.removeEventListener("dblclick", this.#handleDoubleClick);
			this.#canvas.removeEventListener("mouseleave", this.#handleMouseLeave);
		}

		if (this.#mediaElement) {
			if (this.#mediaElement.tagName.toLowerCase() === "video") {
				this.#mediaElement.removeEventListener(
					"loadedmetadata",
					this.#handleMediaLoaded
				);
			} else {
				this.#mediaElement.removeEventListener("load", this.#handleMediaLoaded);
			}
		}

		if (this.#resizeObserver) {
			this.#resizeObserver.disconnect();
			this.#resizeObserver = null;
		}
	}

	/**
	 * Force a resize check (useful for external layout changes)
	 */
	checkResize(): void {
		this.#handleResize();
	}

	/**
	 * Get canvas element
	 */
	getCanvas(): HTMLCanvasElement | null {
		return this.#canvas;
	}

	/**
	 * Get media element
	 */
	getMediaElement(): HTMLVideoElement | HTMLImageElement | null {
		return this.#mediaElement;
	}
}
