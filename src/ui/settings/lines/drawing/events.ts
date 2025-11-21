import type { DrawingConfig } from "./config";
import type { DrawingCore } from "./core";
import type { DrawingState } from "./state";
import type { DrawingEngineInterface } from "./types";
import type { DrawingUtils } from "./utils";

/**
 * DrawingEvents - Handles all mouse events, resize events, and media loading
 * Manages user interactions with the drawing canvas
 */
export class DrawingEvents {
	#core: DrawingCore;
	#config: DrawingConfig;
	#utils: DrawingUtils;
	#engine: DrawingEngineInterface;
	#state: DrawingState;
	#resizeObserver: ResizeObserver | null = null;

	constructor(
		config: DrawingConfig,
		core: DrawingCore,
		engine: DrawingEngineInterface,
		utils: DrawingUtils,
		state: DrawingState
	) {
		this.#config = config;
		this.#core = core;
		this.#engine = engine;
		this.#utils = utils;
		this.#state = state;

		this.#setupEventListeners();
	}

	/**
	 * Setup all event listeners
	 */
	#setupEventListeners(): void {
		const { canvas, media } = this.#config;

		canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
		canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
		canvas.addEventListener("mouseup", this.#handleMouseUp.bind(this));
		canvas.addEventListener("dblclick", this.#handleDoubleClick.bind(this));
		canvas.addEventListener("mouseleave", this.#handleMouseLeave.bind(this));

		if (media.tagName.toLowerCase() === "video") {
			const video = media as HTMLVideoElement;

			media.addEventListener(
				"loadedmetadata",
				this.#handleMediaLoaded.bind(this)
			);

			// Error handling for video loading
			media.addEventListener("error", () => {
				console.error("[DrawingEvents] Video failed to load", {
					error: video.error,
					networkState: video.networkState,
					src: video.src,
				});
			});

			// If video metadata is already loaded, trigger immediately
			if (video.readyState >= 1) {
				setTimeout(() => this.#handleMediaLoaded(), 0);
			}
		} else {
			const img = media as HTMLImageElement;

			media.addEventListener("load", this.#handleMediaLoaded.bind(this));

			// Error handling for image loading
			media.addEventListener("error", () => {
				console.error("[DrawingEvents] Image failed to load", {
					src: img.src,
					complete: img.complete,
				});
			});

			// If image is already loaded, trigger immediately
			if (img.complete && img.naturalWidth > 0) {
				setTimeout(() => this.#handleMediaLoaded(), 0);
			}
		}
	}

	/**
	 * Handle mouse down events
	 */
	#handleMouseDown(event: MouseEvent): void {
		if (!this.#state.isMediaLoaded) {
			console.warn("[DrawingEvents] Mouse down ignored - media not loaded");
			return;
		}

		const displayPoint = this.#utils.getMousePos(event, this.#config.canvas);
		const mediaPoint = this.#core.displayToMediaCoords(displayPoint);

		// Emit state change with mouse down data
		this.#config.on.stateChange({
			type: "mouseDown",
			displayPoint,
			mediaPoint,
			event,
		});
	}

	/**
	 * Handle mouse move events
	 */
	#handleMouseMove(event: MouseEvent): void {
		if (!this.#state.isMediaLoaded) return;

		const displayPoint = this.#utils.getMousePos(event, this.#config.canvas);
		const mediaPoint = this.#core.displayToMediaCoords(displayPoint);

		// Update cursor based on interaction
		this.#updateCursor();

		// Emit state change with mouse move data
		this.#config.on.stateChange({
			type: "mouseMove",
			displayPoint,
			mediaPoint,
			event,
		});
	}

	/**
	 * Handle mouse up events
	 */
	#handleMouseUp(event: MouseEvent): void {
		// Emit state change with mouse up data
		this.#config.on.stateChange({
			type: "mouseUp",
			event,
		});
	}

	/**
	 * Handle double click events
	 */
	#handleDoubleClick(event: MouseEvent): void {
		if (!this.#state.isMediaLoaded) return;

		const displayPoint = this.#utils.getMousePos(event, this.#config.canvas);
		const mediaPoint = this.#core.displayToMediaCoords(displayPoint);

		// Emit state change with double click data
		this.#config.on.stateChange({
			type: "doubleClick",
			displayPoint,
			mediaPoint,
			event,
		});
	}

	/**
	 * Handle mouse leave events
	 */
	#handleMouseLeave(event: MouseEvent): void {
		// Emit state change to clean up any drag states
		this.#config.on.stateChange({
			type: "mouseLeave",
			event,
		});
	}

	/**
	 * Handle media loaded events (video or image)
	 */
	#handleMediaLoaded(): void {
		// Guard: prevent mediaLoaded from firing multiple times
		if (this.#state.isMediaLoaded) {
			console.log(
				"[DrawingEvents] Media already loaded, ignoring duplicate mediaLoaded event"
			);
			return;
		}

		const { media, canvas } = this.#config;

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
			console.warn("[DrawingEvents] Media not ready yet");
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
		if (!ctx) {
			console.error("[DrawingEvents] Failed to get canvas 2d context!");
			return;
		}

		ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform first to prevent compounding
		ctx.scale(pixelRatio, pixelRatio);

		// Update drawing engine sizes
		this.#config.updateResolution({
			native: { width: mediaWidth, height: mediaHeight },
			media: { width: mediaWidth, height: mediaHeight },
			display: { width: displayWidth, height: displayHeight },
		});

		this.#state.isMediaLoaded = true;

		// Setup resize observer after media is loaded
		this.#setupResizeObserver();

		// Emit state change with media loaded data
		this.#config.on.stateChange({
			type: "mediaLoaded",
			mediaSize: this.#config.resolution.media,
			displaySize: this.#config.resolution.display,
		});

		// Request initial redraw
		this.#engine.requestRedraw();
	}

	/**
	 * Handle resize with proper aspect ratio maintenance
	 */
	#handleResize(): void {
		if (!this.#state.isMediaLoaded) return;
		const { media, canvas } = this.#config;

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
			ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform first to prevent compounding
			ctx.scale(pixelRatio, pixelRatio);
		}

		// Update drawing engine sizes
		this.#config.updateResolution({
			native: this.#config.resolution.native,
			media: this.#config.resolution.media,
			display: { width: rect.width, height: rect.height },
		});

		// if (this.#engine) {
		//   this.#engine.updateSizes(this.#mediaSize, this.#displaySize);
		// }

		// Emit state change with resize data
		this.#config.on.stateChange({
			type: "resize",
			displaySize: this.#config.resolution.display,
		});

		// Request redraw
		this.#engine.requestRedraw();
	}

	/**
	 * Setup ResizeObserver for responsive behavior
	 */
	#setupResizeObserver(): void {
		const { media } = this.#config;

		// Clean up existing observer
		if (this.#resizeObserver) {
			this.#resizeObserver.disconnect();
		}

		// Create new ResizeObserver
		this.#resizeObserver = new ResizeObserver(() => {
			requestAnimationFrame(() => this.#handleResize());
		});

		// Observe the container
		this.#resizeObserver.observe(media);
	}

	/**
	 * Update cursor based on current interaction state
	 */
	#updateCursor(): void {
		const { canvas } = this.#config;

		// This will be called from the main component with current state
		// For now, we'll just set a default cursor
		canvas.style.cursor = "crosshair";
	}

	/**
	 * Set cursor style
	 */
	setCursor(cursorStyle: string): void {
		const { canvas } = this.#config;

		canvas.style.cursor = cursorStyle;
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
			mediaSize: this.#config.resolution.media,
			displaySize: this.#config.resolution.display,
			isMediaLoaded: this.#state.isMediaLoaded,
		};
	}

	/**
	 * Cleanup event listeners and observers
	 */
	cleanup(): void {
		const { canvas, media } = this.#config;

		canvas.removeEventListener("mousedown", this.#handleMouseDown);
		canvas.removeEventListener("mousemove", this.#handleMouseMove);
		canvas.removeEventListener("mouseup", this.#handleMouseUp);
		canvas.removeEventListener("dblclick", this.#handleDoubleClick);
		canvas.removeEventListener("mouseleave", this.#handleMouseLeave);

		if (media.tagName.toLowerCase() === "video") {
			media.removeEventListener("loadedmetadata", this.#handleMediaLoaded);
		} else {
			media.removeEventListener("load", this.#handleMediaLoaded);
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
}
