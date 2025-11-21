import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";

import type { LinesProps, StateChangeEvent } from "./types";

import { CanvasContextMenu } from "./canvas-context-menu";
import { Controls } from "./controls";
import { DrawingEngine } from "./drawing";
import { LabelForm } from "./label-form";
import { LayerPanel } from "./layer";
import { Panel } from "./panel";

export function Lines({
	src,
	type,
	onDrawingComplete,
	onSave,
	onLoad,
	vehicles = [],
}: LinesProps) {
	// Canvas and media references
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const mediaRef = useRef<HTMLVideoElement | HTMLImageElement | null>(null);

	// Core engine instance
	const drawingEngineRef = useRef<DrawingEngine | null>(null);

	// Guard to prevent onLoad from executing multiple times
	const onLoadExecutedRef = useRef<boolean>(false);

	// Stable refs for callbacks
	const handleStateChangeRef = useRef<(stateChange: StateChangeEvent) => void>(
		() => {
			// default empty
		}
	);
	const showToastFeedbackRef = useRef<(message: string) => void>(() => {
		// default empty
	});

	// Media state
	const [media, setMedia] = useState({
		size: { width: 0, height: 0 },
		display: { width: 0, height: 0 },
		loaded: false,
	});

	// Feedback state - now managed by DrawingEngine state
	const feedbackMessage = useSyncExternalStore(
		useCallback((callback) => {
			return (
				drawingEngineRef.current?.subscribeToStateChanges(() => {
					callback();
				}) ||
				(() => {
					// default empty
				})
			);
		}, []),
		() => drawingEngineRef.current?.feedbackMessage || "",
		() => ""
	);

	const showFeedback = useSyncExternalStore(
		useCallback((callback) => {
			return (
				drawingEngineRef.current?.subscribeToStateChanges(() => {
					callback();
				}) ||
				(() => {
					// default empty
				})
			);
		}, []),
		() => drawingEngineRef.current?.showFeedback || false,
		() => false
	);

	// Minimal state still needed for canvas cursor
	const drawingMode = drawingEngineRef.current?.drawingMode || "cursor";
	const dragState = useMemo(
		() =>
			drawingEngineRef.current?.dragState || {
				isDragging: false,
				elementId: null,
				pointIndex: null,
			},
		[]
	);

	// Toast feedback system - now uses DrawingEngine state
	const showToastFeedback = useCallback((message: string) => {
		if (drawingEngineRef.current) {
			drawingEngineRef.current.setFeedback(message);
		}
	}, []);

	// Central state change handler for drawing engine events
	const handleStateChange = useCallback(
		(stateChange: StateChangeEvent) => {
			switch (stateChange.type) {
				case "mediaLoaded":
					// Guard: prevent onLoad from executing multiple times
					if (onLoadExecutedRef.current) {
						console.log(
							"[Lines] onLoad already executed, skipping duplicate mediaLoaded event"
						);
						return;
					}

					setMedia({
						size: stateChange.mediaSize,
						display: stateChange.displaySize,
						loaded: true,
					});

					if (onLoad) {
						onLoadExecutedRef.current = true; // Mark as executed
						onLoad()
							.then(({ elements, layers }) => {
								if (drawingEngineRef.current && elements.length > 0) {
									drawingEngineRef.current.clearAll();
									drawingEngineRef.current.addElements(elements, layers);

									showToastFeedback(
										`Loaded ${elements.length} elements in ${layers.size} layers`
									);
								}
							})
							.catch((error) => {
								console.error("[Lines] onLoad failed:", error);
								showToastFeedback(`Load failed: ${error.message}`);
							});
					}
					break;
				case "resize":
					setMedia((prev) => ({
						...prev,
						display: stateChange.displaySize,
					}));
					break;
				case "annotation":
					break;
				case "importComplete":
					// Import completed - elements and layers have been added to the engine
					// This event is triggered after initial import from backend
					console.log("[Lines] Import complete", {
						elementsCount: stateChange.elements.length,
						layersCount: stateChange.layers.length,
					});
					break;
				case "action":
					if (stateChange.action === "export") {
						onDrawingComplete?.(stateChange.data);
					}
					break;
				default:
					break;
			}
		},
		[onDrawingComplete, onLoad, showToastFeedback]
	);

	// Update refs when callbacks change
	useEffect(() => {
		handleStateChangeRef.current = handleStateChange;
		showToastFeedbackRef.current = showToastFeedback;
	}, [handleStateChange, showToastFeedback]);

	// Initialize drawing engine when both refs are available
	const initializeEngine = useCallback(() => {
		const canvas = canvasRef.current;
		const media = mediaRef.current;

		if (canvas && media && !drawingEngineRef.current) {
			try {
				drawingEngineRef.current = new DrawingEngine(canvas, media, {
					resolution: {
						target: {
							width: 1080,
							height: 720,
						},
					},
					layers: {
						defaultLayer: vehicles[0]
							? {
									name: vehicles[0].name,
									category: vehicles[0].id,
									color: vehicles[0].color,
									description: "Capa por defecto",
								}
							: undefined,
					},
					on: {
						stateChange: (state) => handleStateChangeRef.current?.(state),
						feedback: (message) => showToastFeedbackRef.current?.(message),
					},
				});
			} catch (error) {
				console.error("[Lines] Error during initialization:", error);
			}
		}
	}, [vehicles]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (drawingEngineRef.current) {
				drawingEngineRef.current.cleanup();
				drawingEngineRef.current = null;
			}
		};
	}, []);

	// Canvas callback ref for initialization
	const canvasCallbackRef = useCallback(
		(canvas: HTMLCanvasElement | null) => {
			canvasRef.current = canvas;
			if (canvas) {
				initializeEngine();
			}
		},
		[initializeEngine]
	);

	// Media callback ref for initialization
	const mediaCallbackRef = useCallback(
		(media: HTMLVideoElement | HTMLImageElement | null) => {
			mediaRef.current = media;
			if (media) {
				initializeEngine();
			}
		},
		[initializeEngine]
	);

	return (
		<div className="w-full">
			<div className="w-full relative z-20 flex justify-between items-center gap-4 bg-muted rounded-t-md">
				<Controls drawingEngine={drawingEngineRef.current} onSave={onSave} />
				<div className="flex items-center gap-2">
					<Panel drawingEngine={drawingEngineRef.current} />
					<LayerPanel
						drawingEngine={drawingEngineRef.current}
						vehicles={vehicles}
					/>
				</div>

				<LabelForm drawingEngine={drawingEngineRef.current} />
			</div>

			<div className="w-full relative z-0">
				{/* Feedback Toast */}
				{showFeedback ? (
					<p className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-background text-foreground px-4 py-2 rounded-lg shadow-lg transition-all duration-300">
						{feedbackMessage}
					</p>
				) : null}
				{/* Media element */}
				{type === "video" ? (
					<video
						ref={
							mediaCallbackRef as (instance: HTMLVideoElement | null) => void
						}
						src={src}
						className="w-full aspect-video pointer-events-none"
						controls
						muted
						playsInline
						preload="metadata"
					/>
				) : (
					<img
						ref={
							mediaCallbackRef as (instance: HTMLImageElement | null) => void
						}
						src={src}
						alt="Training media"
						className="w-full aspect-video object-contain pointer-events-none"
						draggable={false}
					/>
				)}

				{/* Drawing canvas with context menu */}
				<CanvasContextMenu drawingEngine={drawingEngineRef.current}>
					<canvas
						ref={canvasCallbackRef}
						className={`absolute inset-0 w-full z-0 aspect-video pointer-events-auto ${
							dragState.isDragging
								? "cursor-grabbing"
								: drawingMode === "cursor"
									? "cursor-default"
									: drawingMode === "select"
										? "cursor-pointer"
										: drawingMode === "erase"
											? "cursor-not-allowed"
											: "cursor-crosshair"
						}`}
						style={{ pointerEvents: media.loaded ? "auto" : "none" }}
					/>
				</CanvasContextMenu>
			</div>
		</div>
	);
}

// Export the MediaMatrix interface for external use
export type { DrawingElement, LayerInfo, MediaMatrix, Point } from "./types";
