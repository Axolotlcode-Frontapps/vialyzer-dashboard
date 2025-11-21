import type {
	ActionEvent,
	AlignmentType,
	AnnotationEvent,
	CallbacksConfig,
	DoubleClickEvent,
	DragState,
	DrawingElement,
	DrawingElementType,
	DrawingEngineConfig,
	DrawingEngineInterface,
	DrawingMode,
	EffectActionEvent,
	HistoryOperation,
	LayerActionEvent,
	LayerInfo,
	LayerVisibility,
	MediaMatrix,
	ModeChangeEvent,
	MouseDownEvent,
	MouseMoveEvent,
	Point,
	ShortcutEvent,
	StateChangeCallback,
	StateChangeEvent,
	TextData,
} from "./types";

import { DrawingActions } from "./actions";
import { DrawingAnnotation } from "./annotation";
import { DrawingArrange } from "./arrange";
import { DrawingConfig } from "./config";
import { DrawingCore } from "./core";
import { DrawingEffects } from "./effects";
import { DrawingEvents } from "./events";
import { DrawingHistory } from "./history";
import { DrawingLayers } from "./layers";
import { DrawingShortcuts } from "./shortcuts";
import { DrawingState } from "./state";
import { DrawingUtils } from "./utils";

/**
 * DrawingEngine - Main orchestrator for the drawing system
 * Manages all modules and provides the public API for framework wrappers
 */
export class DrawingEngine implements DrawingEngineInterface {
	// Core properties
	#initialized = false;
	#mediaLoaded = false; // Track if media has actually loaded

	// Core drawing functionality
	#core: DrawingCore;
	#config: DrawingConfig;
	#utils: DrawingUtils;

	// Module instances
	#events: DrawingEvents;
	#shortcuts: DrawingShortcuts;
	#actions: DrawingActions;
	#annotation: DrawingAnnotation;
	#history: DrawingHistory;
	#layers: DrawingLayers;
	#arrange: DrawingArrange;
	#effects: DrawingEffects;

	// State management
	#state: DrawingState = new DrawingState();

	#on: CallbacksConfig;

	constructor(
		canvas: HTMLCanvasElement,
		media: HTMLVideoElement | HTMLImageElement,
		config?: DrawingEngineConfig
	) {
		this.#on = {
			stateChange:
				config?.on?.stateChange ??
				(() => {
					// No-op by default
				}),
			feedback:
				config?.on?.feedback ??
				(() => {
					// No-op by default
				}),
		};
		this.#config = new DrawingConfig(canvas, media, {
			...config,
			on: {
				stateChange: (state) => this.#handleStateChange(state),
				feedback: (message) => this.#handleFeedback(message),
			},
		});
		this.#core = new DrawingCore(this.#config);
		this.#utils = new DrawingUtils(this.#core, this.#config);

		this.#events = new DrawingEvents(
			this.#config,
			this.#core,
			this,
			this.#utils,
			this.#state
		);
		this.#shortcuts = new DrawingShortcuts(this.#config, this.#state);
		this.#actions = new DrawingActions(
			this.#core,
			this.#config,
			this.#utils,
			this.#state
		);
		this.#annotation = new DrawingAnnotation(this.#config);
		this.#history = new DrawingHistory(this.#config, this.#state);
		this.#layers = new DrawingLayers(
			this.#config,
			this.#state,
			(operationType: string, description: string) =>
				this.#safeRecordHistoryOperation(
					operationType as HistoryOperation["type"],
					description
				)
		);
		this.#arrange = new DrawingArrange(this.#config, this.#layers, this.#state);
		this.#effects = new DrawingEffects(this.#config);

		// Core uses target resolution, not native media size
		this.#initialized = true;
	}

	// Public config accessor for modules
	getConfig(): DrawingConfig {
		return this.#config;
	}

	// History operation recording
	#recordHistoryOperation(
		operationType: HistoryOperation["type"],
		description: string,
		beforeState?: DrawingState
	): void {
		this.#history.recordOperation(
			{ type: operationType, data: {} },
			this.#state.clone(),
			description,
			beforeState
		);
	}

	// Central feedback handler - routes through centralized state
	#handleFeedback(message: string): void {
		// Set feedback in centralized state
		this.setFeedback(message);

		// Also call the external callback if provided (for backward compatibility)
		this.#on.feedback?.(message);
	}

	// Central state change handler
	#handleStateChange(stateChange: StateChangeEvent): void {
		// Notify all subscribers
		this.#state.subscribers.forEach((callback) => {
			try {
				callback(stateChange);
			} catch (error) {
				console.error("Error in state change subscriber:", error);
			}
		});

		switch (stateChange.type) {
			case "mouseDown":
			case "mouseMove":
			case "doubleClick":
				// Type narrowing: these all have displayPoint and mediaPoint
				if (stateChange.type === "mouseDown") {
					this.#handleMouseDown(stateChange);
				} else if (stateChange.type === "mouseMove") {
					this.#handleMouseMove(stateChange);
				} else {
					this.#handleDoubleClick(stateChange);
				}
				break;
			case "mouseUp":
				this.#handleMouseUp();
				break;
			case "mouseLeave":
				this.#handleMouseLeave();
				break;
			case "mediaLoaded":
			case "resize":
				// These events are handled by the events module and don't need processing here
				// Mark media as loaded when mediaLoaded event fires
				if (stateChange.type === "mediaLoaded") {
					this.#mediaLoaded = true;
				}
				// Forward to React wrapper for UI updates
				this.#on.stateChange(stateChange);
				break;
			case "importComplete":
				// Forward import completion to React wrapper for UI updates
				// This event is triggered after initial import from backend
				this.#on.stateChange(stateChange);
				break;
			case "shortcut":
				this.#handleShortcut(stateChange);
				break;
			case "action":
				this.#handleAction(stateChange);
				break;
			case "annotation":
				this.#handleAnnotation(stateChange);
				break;
			case "modeChange":
				this.#handleModeChange(stateChange);
				break;
			case "layerAction":
				this.#handleLayerAction(stateChange);
				break;
			case "effectAction":
				this.#handleEffectAction(stateChange);
				break;
			case "togglePanel":
				// Forward to React wrapper for UI handling
				this.#on.stateChange(stateChange);
				break;
			default:
				console.warn(
					`[DrawingEngine] Unhandled state change type: ${stateChange.type}`
				);
				break;
		}

		// Handle layer visibility changes
		if (
			stateChange.type === "layerAction" &&
			stateChange.action === "layerVisibilityChanged"
		) {
			this.#clearHiddenElementSelections();
		}

		// Trigger redraw after state changes
		this.#redraw();
	}

	// Mouse event handlers
	#handleMouseDown(data: MouseDownEvent): void {
		const { displayPoint, mediaPoint, event } = data;
		if (!this.#utils) return;

		if (this.#state.mode === "cursor") {
			const pointHit = this.#utils.findPointNearMouse(
				displayPoint,
				this.#state.elements
			);
			if (pointHit) {
				this.#state.drag = {
					isDragging: true,
					elementId: pointHit.elementId,
					pointIndex: pointHit.pointIndex,
					pointType: pointHit.pointType,
				};
			}
			return;
		}

		if (this.#state.mode === "select") {
			const elementId = this.#utils.findElementNearMouse(
				displayPoint,
				this.#state.elements
			);
			if (elementId) {
				if (event?.ctrlKey || event?.metaKey) {
					this.#toggleElementSelection(elementId);
				} else {
					this.#state.selectedElements = [elementId];
				}
			} else {
				this.#state.selectedElements = [];
			}
			return;
		}

		if (this.#state.mode === "erase") {
			const elementId = this.#utils.findElementNearMouse(
				displayPoint,
				this.#state.elements
			);
			if (elementId) {
				this.#state.elements = this.#state.elements.filter(
					(element) => element.id !== elementId
				);
			}
			return;
		}

		// Check for point dragging first
		const pointHit = this.#utils.findPointNearMouse(
			displayPoint,
			this.#state.elements
		);
		if (pointHit) {
			this.#state.drag = {
				isDragging: true,
				elementId: pointHit.elementId,
				pointIndex: pointHit.pointIndex,
				pointType: pointHit.pointType,
			};
			return;
		}

		// Start drawing new element
		if (
			["line", "area", "curve", "rectangle", "circle"].includes(
				this.#state.mode
			)
		) {
			this.#startDrawing(mediaPoint);
		}
	}

	#handleMouseMove(data: MouseMoveEvent): void {
		const { displayPoint, mediaPoint, event } = data;
		if (!this.#utils) return;

		// Update hover state
		if (this.#state.mode === "select" || this.#state.mode === "erase") {
			const hoveredElementId = this.#utils.findElementNearMouse(
				displayPoint,
				this.#state.elements
			);
			this.#state.hoveredElement = hoveredElementId || null;
		} else {
			this.#state.hoveredElement = null;
		}

		// Handle point dragging
		if (
			this.#state.drag.isDragging &&
			this.#state.drag.elementId &&
			this.#state.drag.pointIndex !== null
		) {
			this.#handlePointDragging(mediaPoint, event);
			return;
		}

		// Update cursor
		const pointHit = this.#utils.findPointNearMouse(
			displayPoint,
			this.#state.elements
		);
		this.#events?.setCursor(pointHit ? "grab" : "crosshair");

		// Handle drawing
		if (this.#state.drawing && this.#state.currentElement) {
			this.#handleDrawingMove(mediaPoint, event);
		}
	}

	#handleMouseUp(): void {
		if (this.#state.drag.isDragging) {
			this.#state.drag = {
				isDragging: false,
				elementId: null,
				pointIndex: null,
			};
			return;
		}

		if (
			this.#state.drawing &&
			this.#state.currentElement &&
			["line", "rectangle", "circle"].includes(this.#state.mode)
		) {
			this.#completeElement();
		}
	}

	#handleDoubleClick(data: DoubleClickEvent): void {
		const { displayPoint } = data;
		if (!this.#utils) return;

		if (
			(this.#state.mode === "area" || this.#state.mode === "curve") &&
			this.#state.currentElement &&
			this.#state.currentElement.points.length >= 3
		) {
			this.#completeElement();
		} else if (this.#state.mode === "select" || this.#state.mode === "cursor") {
			const elementId = this.#utils.findElementNearMouse(
				displayPoint,
				this.#state.elements
			);
			if (elementId) {
				const element = this.#state.elements.find((el) => el.id === elementId);
				if (element?.completed) {
					this.#openTextEditor(elementId, element);
				}
			}
		}
	}

	#handleMouseLeave(): void {
		this.#state.drag = { isDragging: false, elementId: null, pointIndex: null };
		this.#state.hoveredElement = null;
	}

	// Drawing methods
	#startDrawing(mediaPoint: Point): void {
		if (!this.#utils) return;

		const elementId = this.#utils.generateElementId();
		const activeLayerId = this.#layers?.getActiveLayer()?.id;
		const newElement = this.#core.createDrawingElement(
			this.#state.mode as DrawingElementType,
			mediaPoint,
			elementId,
			activeLayerId
		);

		if (this.#state.mode === "area" || this.#state.mode === "curve") {
			if (!this.#state.currentElement) {
				this.#state.currentElement = newElement;
			} else {
				this.#state.currentElement = this.#core.updateDrawingElement(
					this.#state.currentElement,
					mediaPoint,
					this.#state.mode
				);
			}
		} else {
			this.#state.currentElement = newElement;
			this.#state.drawing = true;
		}
	}

	#handleDrawingMove(mediaPoint: Point, event?: MouseEvent): void {
		if (!this.#state.currentElement) return;

		this.#state.currentElement = this.#core.updateDrawingElement(
			this.#state.currentElement,
			mediaPoint,
			this.#state.mode,
			event
		);
	}

	#handlePointDragging(mediaPoint: Point, event?: MouseEvent): void {
		const updatedElements = this.#core.updatePointDragging(
			this.#state.elements,
			this.#state.drag,
			mediaPoint,
			event
		);

		// Only update and record if elements actually changed
		if (updatedElements !== this.#state.elements) {
			// Capture state BEFORE modification for history
			const beforeState = this.#state.clone();

			this.#state.elements = updatedElements;

			// Mark element as edited if it was saved
			if (this.#state.drag.elementId) {
				this.#markElementAsEdited(this.#state.drag.elementId);
			}

			// Record the point dragging operation
			this.#safeRecordHistoryOperation(
				"updateElements",
				"Dragged element point",
				beforeState
			);
		}
	}

	#completeElement(): void {
		if (!this.#state.currentElement) return;

		const completedElement = this.#core.completeElement(
			this.#state.currentElement
		);

		// Capture state BEFORE modification for history
		const beforeState = this.#state.clone();

		this.#state.elements = [...this.#state.elements, completedElement];

		// Add element to the layer's elementIds if it has a layerId
		if (completedElement.layerId && this.#layers) {
			const layer = this.#layers.getLayer(completedElement.layerId);
			if (layer && !layer.elementIds.includes(completedElement.id)) {
				layer.elementIds.push(completedElement.id);
				layer.updatedAt = Date.now();
			}
		}

		// Record the element addition in history
		this.#safeRecordHistoryOperation(
			"addElements",
			`Added ${this.#state.mode} element`,
			beforeState
		);

		this.#state.currentElement = null;
		this.#state.drawing = false;

		// Auto-open scenario info modal for the newly completed element
		this.#openTextEditor(completedElement.id, completedElement);
	}

	// Shortcut handlers
	#handleShortcut(data: ShortcutEvent): void {
		const { action } = data;

		switch (action) {
			case "cursor":
			case "select":
			case "erase":
			case "line":
			case "area":
			case "curve":
			case "rectangle":
			case "circle":
				this.setDrawingMode(action);
				break;
			case "addText":
				this.#handleAddText();
				break;
			case "copy":
				if (this.#state.selectedElements.length > 0) {
					this.#actions?.copySelectedElements(
						this.#state.selectedElements,
						this.#state.elements
					);
				}
				break;
			case "cut":
				if (this.#state.selectedElements.length > 0) {
					this.#actions?.cutSelectedElements(
						this.#state.selectedElements,
						this.#state.elements
					);
				}
				break;
			case "paste":
				if (data.pasteAtPosition) {
					this.#actions?.pasteElements(true, { x: 0, y: 0 });
				} else {
					this.#actions?.pasteElements(false);
				}
				break;
			case "duplicate":
				if (this.#state.selectedElements.length > 0) {
					this.#actions?.duplicateSelectedElements(
						this.#state.selectedElements,
						this.#state.elements
					);
				}
				break;
			case "undo":
				this.#undoLast();
				break;
			case "redo":
				this.#redoLast();
				break;
			case "selectAll":
				this.#actions?.selectAllElements(this.#state.elements);
				break;
			case "clearSelection":
				this.#state.selectedElements = [];
				this.#actions?.clearSelection();
				break;
			case "delete":
				if (this.#state.selectedElements.length > 0) {
					this.#actions?.deleteSelectedElements(
						this.#state.selectedElements,
						this.#state.elements
					);
				}
				break;
			case "save":
				this.#config.on.feedback("Save functionality coming soon");
				break;
			case "open":
				this.#config.on.feedback("Open functionality coming soon");
				break;
			case "export":
				this.#exportDrawings();
				break;
			case "clearAll":
				this.#clearAll();
				break;
			case "togglePanel":
				// Forward to React wrapper for UI handling
				this.#on.stateChange({
					type: "togglePanel",
				});
				break;
			case "zoomIn":
			case "zoomOut":
			case "resetZoom":
				this.#config.on.feedback("Zoom functionality coming soon");
				break;
			case "moveElements":
				if (
					this.#state.selectedElements.length > 0 &&
					data.direction &&
					data.step
				) {
					const displayOffset = { x: 0, y: 0 };
					switch (data.direction) {
						case "up":
							displayOffset.y = -data.step;
							break;
						case "down":
							displayOffset.y = data.step;
							break;
						case "left":
							displayOffset.x = -data.step;
							break;
						case "right":
							displayOffset.x = data.step;
							break;
						default:
							break;
					}

					// Convert display offset to media offset using scale factors
					if (
						this.#config.resolution.display.width === 0 ||
						this.#config.resolution.display.height === 0
					) {
						console.warn("Cannot move elements: display size not initialized");
						return;
					}

					const scaleX =
						this.#config.resolution.target.width /
						this.#config.resolution.display.width;
					const scaleY =
						this.#config.resolution.target.height /
						this.#config.resolution.display.height;
					const mediaOffset = {
						x: displayOffset.x * scaleX,
						y: displayOffset.y * scaleY,
					};

					this.#actions?.moveSelectedElements(
						this.#state.selectedElements,
						this.#state.elements,
						mediaOffset
					);
				}
				break;
			case "editText":
				if (this.#state.selectedElements.length === 1) {
					this.#handleAddText();
				}
				break;
			case "redraw":
				this.#redraw();
				break;
			case "completeElement":
				if (
					(this.#state.mode === "area" || this.#state.mode === "curve") &&
					this.#state.currentElement &&
					this.#state.currentElement.points.length >= 3
				) {
					this.#completeElement();
				}
				break;
			case "cancel":
				this.#state.currentElement = null;
				this.#state.drawing = false;
				this.#state.drag = {
					isDragging: false,
					elementId: null,
					pointIndex: null,
				};
				this.#state.selectedElements = [];
				break;
			case "group":
				if (this.#state.selectedElements.length >= 2) {
					this.#actions?.groupSelectedElements(
						this.#state.selectedElements,
						this.#state.elements
					);
				}
				break;
			case "ungroup":
				if (this.#state.selectedElements.length > 0) {
					this.#actions?.ungroupSelectedElements(
						this.#state.selectedElements,
						this.#state.elements
					);
				}
				break;
			case "bringToFront":
				if (this.#state.selectedElements.length > 0) {
					this.#actions?.bringToFront(
						this.#state.selectedElements,
						this.#state.elements
					);
				}
				break;
			case "sendToBack":
				if (this.#state.selectedElements.length > 0) {
					this.#actions?.sendToBack(
						this.#state.selectedElements,
						this.#state.elements
					);
				}
				break;
			case "alignLeft":
			case "alignRight":
			case "alignCenterX":
			case "alignTop":
			case "alignBottom":
			case "alignCenterY":
				if (this.#state.selectedElements.length >= 2) {
					const alignmentMap: Record<string, AlignmentType> = {
						alignLeft: "left",
						alignRight: "right",
						alignCenterX: "centerX",
						alignTop: "top",
						alignBottom: "bottom",
						alignCenterY: "centerY",
					};
					this.#actions?.alignElements(
						this.#state.selectedElements,
						this.#state.elements,
						alignmentMap[action]
					);
				}
				break;
			default:
				console.warn(`[DrawingEngine] Unhandled shortcut action: ${action}`);
				break;
		}
	}

	// Action handlers
	#handleAction(data: ActionEvent): void {
		const { action } = data;

		switch (action) {
			case "addElements":
				// Handle internal add operations (paste, duplicate, etc.)
				if (data.elements && data.elements.length > 0) {
					// Capture state BEFORE modification for history
					const beforeState = this.#state.clone();

					this.#state.elements = [...this.#state.elements, ...data.elements];
					if (data.selectElements) {
						this.#state.selectedElements = data.elements.map((el) => el.id);
					}
					this.#safeRecordHistoryOperation(
						"addElements",
						`Added ${data.elements.length} element(s)`,
						beforeState
					);
				}
				break;
			case "updateElements":
				if (data.elements) {
					// Capture state BEFORE modification for history
					const beforeState = this.#state.clone();

					this.#state.elements = data.elements;
					// Don't record history when this is called from history redo/undo
					this.#safeRecordHistoryOperation(
						"updateElements",
						"Updated elements",
						beforeState
					);
				}
				break;
			case "deleteElements":
				if (data.elementIds && Array.isArray(data.elementIds)) {
					const elementIds = data.elementIds;

					// Capture state BEFORE modification for history
					const beforeStateDelete = this.#state.clone();

					// Remove elements from their layers' elementIds arrays
					if (this.#layers) {
						const elementsToDelete = this.#state.elements.filter((el) =>
							elementIds.includes(el.id)
						);
						for (const element of elementsToDelete) {
							if (element.layerId) {
								const layer = this.#layers.getLayer(element.layerId);
								if (layer) {
									layer.elementIds = layer.elementIds.filter(
										(id) => id !== element.id
									);
									layer.updatedAt = Date.now();
								}
							}
						}
					}

					// Remove elements that were immediately deleted (new elements)
					this.#state.elements = this.#state.elements.filter(
						(el) => !elementIds.includes(el.id)
					);

					// Note: Elements in markedAsDeleted are already marked in the actions module
					// They remain in the elements array with syncState='deleted' until markAllElementsAsSaved is called

					this.#state.selectedElements = [];

					const totalDeleted =
						elementIds.length + (data.markedAsDeleted?.length || 0);
					this.#safeRecordHistoryOperation(
						"deleteElements",
						`Deleted ${totalDeleted} element(s)`,
						beforeStateDelete
					);
				}
				break;
			case "updateSelection":
				if (data.selectedElements) {
					// Capture state BEFORE modification for history
					const beforeState = this.#state.clone();

					this.#state.selectedElements = data.selectedElements;
					// Don't record history when this is called from history redo/undo
					this.#safeRecordHistoryOperation(
						"updateSelection",
						"Updated selection",
						beforeState
					);
				}
				break;
			case "clearAll":
				this.#clearAll();
				break;
			case "undo":
				this.#undoLast();
				break;
			case "export":
				// Forward export data to React wrapper
				this.#on.stateChange({
					type: "action",
					action: "export",
					data: data.data,
				});
				break;
			default:
				console.warn(`[DrawingEngine] Unhandled action type: ${action}`);
				break;
		}
	}

	// Mode change handler
	#handleModeChange(data: ModeChangeEvent): void {
		this.#state.mode = data.drawingMode;
		// Don't record history when this is called from history redo/undo
		this.#safeRecordHistoryOperation(
			"changeMode",
			`Changed mode to ${data.drawingMode}`
		);
	}

	// Layer action handler
	#handleLayerAction(data: LayerActionEvent): void {
		// Forward layer actions to React wrapper for UI updates
		this.#on.stateChange(data);

		// Trigger redraw for visual changes
		if (
			data.action === "layerOpacityChanged" ||
			data.action === "layerVisibilityChanged" ||
			data.action === "layerIsolated"
		) {
			this.#redraw();
		}
	}

	// Effects action handler
	#handleEffectAction(data: EffectActionEvent): void {
		// Forward effect actions to React wrapper for UI updates
		this.#on.stateChange(data);
	}

	// Helper method to check if we're currently applying history state
	#isApplyingHistoryState(): boolean {
		return this.#history?.isApplyingHistory || false;
	}

	// Helper method to safely record history operations
	#safeRecordHistoryOperation(
		operationType: HistoryOperation["type"],
		description: string,
		beforeState?: DrawingState
	): void {
		if (this.#isApplyingHistoryState()) {
			// Don't record history when applying history states (undo/redo)
			return;
		}
		this.#recordHistoryOperation(operationType, description, beforeState);
	}

	// Annotation handlers
	#handleAnnotation(data: AnnotationEvent): void {
		const { action } = data;

		switch (action) {
			case "openTextEditor":
				this.#state.editingTextId = data.elementId || null;
				this.#state.isEditingText = true;

				// Forward to React wrapper for UI handling
				this.#on.stateChange({
					type: "annotation",
					action: "openTextEditor",
					elementId: data.elementId,
					currentText: data.currentText,
					currentDescription: data.currentDescription,
					currentType: data.currentType,
					currentDirection: data.currentDirection,
					currentDistance: data.currentDistance,
					currentFontSize: data.currentFontSize,
					currentBackgroundEnabled: data.currentBackgroundEnabled,
				});
				break;
			case "updateElementText":
			case "removeElementText":
			case "autoGenerateLabels":
			case "bulkUpdateText":
				if (data.elements) {
					// Capture state BEFORE modification for history
					const beforeState = this.#state.clone();

					this.#state.elements = data.elements;
					this.#safeRecordHistoryOperation(
						"updateText",
						"Updated text",
						beforeState
					);
				}
				break;
			default:
				console.warn(`[DrawingEngine] Unhandled annotation action: ${action}`);
				break;
		}
	}

	// Utility methods
	#toggleElementSelection(elementId: string): void {
		// Capture state BEFORE modification for history
		const beforeState = this.#state.clone();

		if (this.#state.selectedElements.includes(elementId)) {
			this.#state.selectedElements = this.#state.selectedElements.filter(
				(id) => id !== elementId
			);
		} else {
			this.#state.selectedElements = [
				...this.#state.selectedElements,
				elementId,
			];
		}
		this.#safeRecordHistoryOperation(
			"updateSelection",
			"Updated selection",
			beforeState
		);
	}

	#handleAddText(): void {
		if (this.#state.selectedElements.length === 1) {
			const element = this.#state.elements.find(
				(el) => el.id === this.#state.selectedElements[0]
			);
			if (element?.completed) {
				this.#openTextEditor(this.#state.selectedElements[0], element);
			}
		}
	}

	#openTextEditor(elementId: string, element?: DrawingElement): void {
		if (!element) {
			element = this.#state.elements.find((el) => el.id === elementId);
		}
		if (element?.completed) {
			this.#annotation?.openTextEditor(elementId, element);
		}
	}

	#undoLast(): void {
		if (this.#history?.canUndo()) {
			this.#history.undo();
		} else {
			// Fallback to simple undo if history is not available
			if (this.#state.currentElement) {
				this.#state.currentElement = null;
				this.#state.drawing = false;
			} else if (this.#state.elements.length > 0) {
				this.#state.elements = this.#state.elements.slice(0, -1);
			}
			this.#state.drag = {
				isDragging: false,
				elementId: null,
				pointIndex: null,
			};
			this.#state.selectedElements = [];
			this.#state.hoveredElement = null;
		}
	}

	#redoLast(): void {
		if (this.#history?.canRedo()) {
			this.#history.redo();
		} else {
			this.#config.on.feedback("Nothing to redo");
		}
	}

	#clearAll(): void {
		// Capture state BEFORE modification for history
		const beforeState = this.#state.clone();

		this.#state.elements = [];
		this.#state.selectedElements = [];
		this.#state.currentElement = null;
		this.#state.drawing = false;
		this.#state.drag = { isDragging: false, elementId: null, pointIndex: null };
		this.#state.hoveredElement = null;
		this.#safeRecordHistoryOperation(
			"clearAll",
			"Cleared all elements",
			beforeState
		);
	}

	#exportDrawings(): void {
		if (this.#actions) {
			this.#actions.exportDrawings(this.#state.elements);
		}
	}

	// Internal redraw method that uses current state
	#redraw(): void {
		if (!this.#initialized) {
			return;
		}

		if (!this.#mediaLoaded) {
			return;
		}

		const { canvas } = this.#config;

		// Filter elements by layer visibility
		const visibleElements = this.#getVisibleElements();

		// Filter current element by layer visibility
		const visibleCurrentElement = this.#isCurrentElementVisible()
			? this.#state.currentElement
			: null;

		// Filter selected elements by layer visibility
		const visibleSelectedElements = this.#getVisibleSelectedElements();

		// Get layer properties for rendering
		const layerProps = new Map<string, { opacity: number; zIndex: number }>();
		if (this.#layers) {
			const layers = this.#layers.getLayers();
			layers.forEach((layer) => {
				if (layer.visibility === "visible") {
					layerProps.set(layer.id, {
						opacity: layer.opacity,
						zIndex: layer.zIndex,
					});
				}
			});
		}

		this.#core.redrawCanvas(
			canvas,
			visibleElements,
			visibleCurrentElement,
			visibleSelectedElements,
			this.#state.hoveredElement,
			this.#state.drag,
			layerProps
		);
	}

	/**
	 * Get elements that should be visible based on layer visibility and isolation
	 */
	#getVisibleElements(): DrawingElement[] {
		if (!this.#layers) {
			// Filter out deleted elements
			return this.#state.elements.filter((el) => el.syncState !== "deleted");
		}

		const visibleLayers = this.#layers.getVisibleLayers();
		const visibleLayerIds = new Set(visibleLayers.map((layer) => layer.id));

		return this.#state.elements.filter((element) => {
			// Don't show deleted elements
			if (element.syncState === "deleted") return false;

			// If element has no layerId, show it (for backward compatibility)
			if (!element.layerId) {
				return true;
			}

			// Only show elements from visible layers
			return visibleLayerIds.has(element.layerId);
		});
	}

	/**
	 * Check if current element should be visible based on layer visibility
	 */
	#isCurrentElementVisible(): boolean {
		if (!this.#state.currentElement || !this.#layers) {
			return true;
		}

		// If current element has no layerId, it belongs to active layer
		const elementLayerId =
			this.#state.currentElement.layerId || this.#layers.getActiveLayer()?.id;

		if (!elementLayerId) {
			return true;
		}

		const layer = this.#layers.getLayer(elementLayerId);
		return layer?.visibility === "visible";
	}

	/**
	 * Get selected elements that are visible based on layer visibility
	 */
	#getVisibleSelectedElements(): string[] {
		if (!this.#layers) {
			return this.#state.selectedElements;
		}

		const visibleLayerIds = new Set(
			this.#layers.getVisibleLayers().map((layer) => layer.id)
		);

		return this.#state.selectedElements.filter((elementId) => {
			const element = this.#state.elements.find((el) => el.id === elementId);
			if (!element) return false;

			// If element has no layerId, show it (for backward compatibility)
			if (!element.layerId) {
				return true;
			}

			// Only include elements from visible layers
			return visibleLayerIds.has(element.layerId);
		});
	}

	/**
	 * Clear selections of elements that are no longer visible due to layer changes
	 */
	#clearHiddenElementSelections(): void {
		if (!this.#layers) return;

		const visibleLayerIds = new Set(
			this.#layers.getVisibleLayers().map((layer) => layer.id)
		);

		const visibleSelectedElements = this.#state.selectedElements.filter(
			(elementId) => {
				const element = this.#state.elements.find((el) => el.id === elementId);
				if (!element) return false;

				// If element has no layerId, keep it selected (for backward compatibility)
				if (!element.layerId) {
					return true;
				}

				// Only keep elements from visible layers
				return visibleLayerIds.has(element.layerId);
			}
		);

		// Update selection if it changed
		if (
			visibleSelectedElements.length !== this.#state.selectedElements.length
		) {
			this.#state.selectedElements = visibleSelectedElements;
			this.#on.stateChange({
				type: "action",
				action: "updateSelection",
				selectedElements: visibleSelectedElements,
				reason: "layerVisibilityChange",
			});
		}
	}

	/**
	 * Synchronize layer-element associations after history restore
	 */
	/**
	 * Mark element as edited if it was previously saved
	 */
	#markElementAsEdited(elementId: string): void {
		const element = this.#state.elements.find((el) => el.id === elementId);
		if (!element) return;

		// Only change 'saved' to 'edited'
		// 'new' elements stay 'new', 'deleted' elements stay 'deleted'
		if (element.syncState === "saved") {
			element.syncState = "edited";
		} else if (!element.syncState) {
			// Handle legacy elements without syncState - treat as saved
			element.syncState = "edited";
		}
	}

	// Public API methods for framework wrappers

	// Mode management
	setDrawingMode(mode: DrawingMode): void {
		this.#state.mode = mode;
		this.#state.currentElement = null;
		this.#state.drawing = false;
		if (mode !== "select") {
			this.#state.selectedElements = [];
		}
		this.#state.hoveredElement = null;

		// Record mode change in history
		this.#safeRecordHistoryOperation("changeMode", `Changed to ${mode} mode`);

		// Notify subscribers of mode change
		this.#state.subscribers.forEach((callback) => {
			try {
				callback({
					type: "modeChange",
					drawingMode: mode,
				});
			} catch (error) {
				console.error("Error in state change subscriber:", error);
			}
		});

		// Request redraw to update visual state
		this.#redraw();
	}

	// Text operations
	completeTextInput(elementId: string, textData: TextData): void {
		if (this.#annotation) {
			// Capture state BEFORE modification for history
			const beforeState = this.#state.clone();

			const updatedElements = this.#annotation.completeTextInput(
				elementId,
				textData,
				this.#state.elements
			);
			if (updatedElements) {
				this.#state.elements = updatedElements;

				// Mark element as edited if it was saved
				this.#markElementAsEdited(elementId);

				// Record the text update in history
				this.#safeRecordHistoryOperation(
					"updateElements",
					"Updated scenario info",
					beforeState
				);
			}
		}
		this.#state.isEditingText = false;
		this.#state.editingTextId = null;
	}

	cancelTextInput(): void {
		this.#state.isEditingText = false;
		this.#state.editingTextId = null;
	}

	addText(): void {
		this.#handleAddText();
	}

	/**
	 * Add elements to the drawing (typically during import from backend)
	 * The bridge should provide fully processed elements and layers - this method only adds them
	 *
	 * @param elements - Array of drawing elements to add (already processed by bridge)
	 * @param layers - Map of complete LayerInfo objects with elementIds already populated by the bridge
	 */
	addElements(
		elements: DrawingElement[],
		layers: Map<string, LayerInfo>
	): void {
		if (!elements || elements.length === 0) return;

		const beforeState = this.#state.clone();

		// Clear existing layers and add new ones
		if (layers.size > 0) {
			// Clear existing layers
			this.#state.layers.clear();
			this.#state.layerOrder = [];
			this.#state.activeLayerId = null;

			// Add imported layers (already validated and populated by bridge)
			layers.forEach((layer, layerId) => {
				// Use the complete LayerInfo object from bridge, only adjusting zIndex for order
				const newLayer: LayerInfo = {
					...layer,
					zIndex: this.#state.layerOrder.length,
				};

				this.#state.layers.set(layerId, newLayer);
				this.#state.layerOrder.push(layerId);
				this.#state.layerCounter++;
			});

			// Set first imported layer as active
			if (this.#state.layerOrder.length > 0) {
				this.#state.activeLayerId = this.#state.layerOrder[0];
			}
		}

		// Add elements directly - NO processing, bridge already did everything
		this.#state.elements.push(...elements);

		// Record history operation
		this.#safeRecordHistoryOperation(
			"addElements",
			`Added ${elements.length} element${elements.length !== 1 ? "s" : ""}`,
			beforeState
		);

		// Trigger redraw
		this.#redraw();

		// Forward notification to React wrapper (using custom event type to avoid triggering #handleAction)
		this.#on.stateChange({
			type: "importComplete",
			elements: elements,
			layers: Array.from(this.#state.layers.values()),
		} as StateChangeEvent);
	}

	// Element operations
	deleteSelectedElements(): void {
		if (this.#actions) {
			this.#actions.deleteSelectedElements(
				this.#state.selectedElements,
				this.#state.elements
			);
		}
	}

	// Clipboard operations
	copySelectedElements(): number {
		if (this.#state.selectedElements.length > 0 && this.#actions) {
			return this.#actions.copySelectedElements(
				this.#state.selectedElements,
				this.#state.elements
			);
		}
		return 0;
	}

	cutSelectedElements(): void {
		if (this.#state.selectedElements.length > 0 && this.#actions) {
			this.#actions.cutSelectedElements(
				this.#state.selectedElements,
				this.#state.elements
			);
		}
	}

	pasteElements(atPosition?: boolean, position?: Point): void {
		if (this.#actions) {
			this.#actions.pasteElements(atPosition || false, position);
		}
	}

	duplicateSelectedElements(): void {
		if (this.#state.selectedElements.length > 0 && this.#actions) {
			this.#actions.duplicateSelectedElements(
				this.#state.selectedElements,
				this.#state.elements
			);
		}
	}

	clearSelection(): void {
		// Capture state BEFORE modification for history
		const beforeState = this.#state.clone();

		this.#state.selectedElements = [];
		this.#safeRecordHistoryOperation(
			"updateSelection",
			"Cleared selection",
			beforeState
		);
	}

	clearClipboard(): void {
		if (this.#actions) {
			this.#actions.clearClipboard();
		}
	}

	resetPasteOffset(): void {
		if (this.#actions) {
			this.#actions.resetPasteOffset();
		}
	}

	getClipboard(): DrawingElement[] {
		return this.#actions?.getClipboard() || [];
	}

	hasClipboardContent(): boolean {
		return this.#actions?.hasClipboardContent() || false;
	}

	// Selection operations
	selectAllElements(): string[] {
		if (this.#actions) {
			return this.#actions.selectAllElements(this.#state.elements);
		}
		return [];
	}

	// Group operations
	groupSelectedElements(): string | undefined {
		if (this.#state.selectedElements.length >= 2 && this.#actions) {
			return this.#actions.groupSelectedElements(
				this.#state.selectedElements,
				this.#state.elements
			);
		}
		return undefined;
	}

	ungroupSelectedElements(): void {
		if (this.#state.selectedElements.length > 0 && this.#actions) {
			this.#actions.ungroupSelectedElements(
				this.#state.selectedElements,
				this.#state.elements
			);
		}
	}

	// Z-order operations
	bringToFront(): DrawingElement[] {
		if (this.#state.selectedElements.length > 0 && this.#actions) {
			return this.#actions.bringToFront(
				this.#state.selectedElements,
				this.#state.elements
			);
		}
		return this.#state.elements;
	}

	sendToBack(): DrawingElement[] {
		if (this.#state.selectedElements.length > 0 && this.#actions) {
			return this.#actions.sendToBack(
				this.#state.selectedElements,
				this.#state.elements
			);
		}
		return this.#state.elements;
	}

	// Alignment operations
	alignElements(alignment: AlignmentType): void {
		if (this.#state.selectedElements.length >= 2 && this.#actions) {
			this.#actions.alignElements(
				this.#state.selectedElements,
				this.#state.elements,
				alignment
			);
		}
	}

	// Movement operations
	moveSelectedElements(offset: Point): void {
		if (this.#state.selectedElements.length > 0 && this.#actions) {
			// Safety check
			if (
				this.#config.resolution.display.width === 0 ||
				this.#config.resolution.display.height === 0
			) {
				console.warn("Cannot move elements: display size not initialized");
				return;
			}

			// Convert display offset to media offset using scale factors
			const scaleX =
				this.#config.resolution.target.width /
				this.#config.resolution.display.width;
			const scaleY =
				this.#config.resolution.target.height /
				this.#config.resolution.display.height;
			const mediaOffset = {
				x: offset.x * scaleX,
				y: offset.y * scaleY,
			};

			this.#actions.moveSelectedElements(
				this.#state.selectedElements,
				this.#state.elements,
				mediaOffset
			);
		}
	}

	// History operations
	canUndo(): boolean {
		return this.#history?.canUndo() || false;
	}

	canRedo(): boolean {
		return this.#history?.canRedo() || false;
	}

	undoLast(): void {
		this.#undoLast();
	}

	redoLast(): void {
		this.#redoLast();
	}

	getUndoPreview(): string | null {
		return this.#history?.getUndoPreview() || null;
	}

	getRedoPreview(): string | null {
		return this.#history?.getRedoPreview() || null;
	}

	getHistoryStats(): unknown {
		return this.#history?.getStats() || null;
	}

	// System operations
	clearAll(): void {
		this.#clearAll();
	}

	exportDrawings(): void {
		this.#exportDrawings();
	}

	requestRedraw(): void {
		this.#redraw();
	}

	cleanup(): void {
		this.#events?.cleanup();
		this.#shortcuts?.cleanup();
		this.#layers?.reset();
		this.#effects?.cleanup();
		this.#initialized = false;
	}

	// State getters for React wrapper
	get isDrawing(): boolean {
		return this.#state.drawing;
	}

	get drawingMode(): DrawingMode {
		return this.#state.mode;
	}

	get currentElement(): DrawingElement | null {
		return this.#state.currentElement;
	}

	get elements(): DrawingElement[] {
		return this.#state.elements;
	}

	get selectedElements(): string[] {
		return this.#state.selectedElements;
	}

	get hoveredElement(): string | null {
		return this.#state.hoveredElement;
	}

	get dragState(): DragState {
		return this.#state.drag;
	}

	get isEditingText(): boolean {
		return this.#state.isEditingText;
	}

	get editingTextId(): string | null {
		return this.#state.editingTextId;
	}

	get isInitialized(): boolean {
		return this.#initialized && this.#mediaLoaded;
	}

	get feedbackMessage(): string | null {
		return this.#state.feedbackMessage;
	}

	get showFeedback(): boolean {
		return this.#state.showFeedback;
	}

	// Feedback methods
	setFeedback(message: string, duration: number = 2000): void {
		this.#state.setFeedback(message, true);

		// Auto-clear after duration
		if (duration > 0) {
			setTimeout(() => this.clearFeedback(), duration);
		}

		// Notify subscribers
		for (const subscriptor of this.#state.subscribers) {
			subscriptor({
				type: "feedback",
				message,
			});
		}
	}

	clearFeedback(): void {
		this.#state.clearFeedback();

		// Notify subscribers
		for (const subscriptor of this.#state.subscribers) {
			subscriptor({
				type: "feedback",
				message: null,
			});
		}
	}

	// Subscribe to state changes
	subscribeToStateChanges(callback: StateChangeCallback): () => void {
		this.#state.subscribers.push(callback);

		// Return unsubscribe function
		return () => {
			const index = this.#state.subscribers.indexOf(callback);
			if (index > -1) {
				this.#state.subscribers.splice(index, 1);
			}
		};
	}

	// Core drawing methods delegated to DrawingCore
	displayToMediaCoords(point: Point): Point {
		// This converts display coords to target resolution coords (where points are stored)
		return this.#core.displayToMediaCoords(point);
	}

	mediaToDisplayCoords(point: Point): Point {
		// This converts target resolution coords to display coords
		return this.#core.mediaToDisplayCoords(point);
	}

	catmullRomSpline(
		p0: Point,
		p1: Point,
		p2: Point,
		p3: Point,
		t: number
	): Point {
		return this.#core.catmullRomSpline(p0, p1, p2, p3, t);
	}

	drawArrow(
		ctx: CanvasRenderingContext2D,
		point: Point,
		direction: Point,
		color: string,
		size: number = 12
	): void {
		this.#core.drawArrow(ctx, point, direction, color, size);
	}

	calculateDirection(
		element: DrawingElement
	): { start: Point; end: Point } | null {
		return this.#core.calculateDirection(element);
	}

	drawElement(
		ctx: CanvasRenderingContext2D,
		element: DrawingElement,
		selectedElements: string[],
		hoveredElement: string | null,
		dragState: DragState
	): void {
		this.#core.drawElement(
			ctx,
			element,
			selectedElements,
			hoveredElement,
			dragState
		);
	}

	redrawCanvas(
		canvas: HTMLCanvasElement,
		elements: DrawingElement[],
		currentElement: DrawingElement | null,
		selectedElements: string[],
		hoveredElement: string | null,
		dragState: DragState
	): void {
		this.#core.redrawCanvas(
			canvas,
			elements,
			currentElement,
			selectedElements,
			hoveredElement,
			dragState
		);
	}

	generateMatrix(elements: DrawingElement[]): MediaMatrix {
		// Matrix is generated at target resolution, not native media size
		return this.#core.generateMatrix(elements);
	}

	distanceToLineSegment(
		point: Point,
		lineStart: Point,
		lineEnd: Point
	): number {
		return this.#core.distanceToLineSegment(point, lineStart, lineEnd);
	}

	pointInPolygon(point: Point, polygon: Point[]): boolean {
		return this.#core.pointInPolygon(point, polygon);
	}

	// Layer management methods
	createLayer(options: {
		name: string;
		description?: string;
		category?: string;
		opacity?: number;
		visibility?: LayerVisibility;
		color?: string;
		insertIndex?: number;
	}) {
		return this.#layers?.createLayer({
			...options,
			description: options.description ?? "",
			category: options.category ?? "",
		});
	}

	deleteLayer(layerId: string) {
		return this.#layers?.deleteLayer(layerId);
	}

	duplicateLayer(layerId: string) {
		return this.#layers?.duplicateLayer(layerId);
	}

	moveElementsToLayer(elementIds: string[], targetLayerId: string) {
		return this.#layers?.moveElementsToLayer(
			elementIds,
			targetLayerId,
			this.#state.elements
		);
	}

	toggleLayerVisibility(layerId: string) {
		return this.#layers?.toggleLayerVisibility(layerId);
	}

	setLayerOpacity(layerId: string, opacity: number) {
		return this.#layers?.setLayerOpacity(layerId, opacity);
	}

	setActiveLayer(layerId: string) {
		return this.#layers?.setActiveLayer(layerId);
	}

	getLayers() {
		return this.#layers?.getLayers() || [];
	}

	getActiveLayer() {
		return this.#layers?.getActiveLayer();
	}

	getVisibleLayers() {
		return this.#layers?.getVisibleLayers() || [];
	}

	renameLayer(layerId: string, newName: string) {
		return this.#layers?.renameLayer(layerId, newName);
	}

	updateLayer(layerId: string, updates: Partial<Omit<LayerInfo, "id">>) {
		return this.#layers?.updateLayer(layerId, updates);
	}

	isolateLayer(layerId: string) {
		return this.#layers?.isolateLayer(layerId);
	}

	getLayer(layerId: string) {
		return this.#layers?.getLayer(layerId);
	}

	// Arrangement methods
	groupElementsInLayer(
		selectedElements: string[],
		layerId?: string,
		metadata?: { name?: string; description?: string; color?: string }
	) {
		return this.#arrange?.groupElementsInLayer(
			selectedElements,
			this.#state.elements,
			layerId,
			metadata
		);
	}

	alignElementsInLayer(
		selectedElements: string[],
		alignment: AlignmentType,
		layerId?: string
	) {
		return this.#arrange?.alignElementsInLayer(
			selectedElements,
			this.#state.elements,
			alignment,
			layerId
		);
	}

	distributeElementsInLayer(
		selectedElements: string[],
		direction: "horizontal" | "vertical",
		layerId?: string,
		spacing?: number
	) {
		return this.#arrange?.distributeElementsInLayer(
			selectedElements,
			this.#state.elements,
			direction,
			layerId,
			spacing
		);
	}

	changeZOrderInLayer(
		selectedElements: string[],
		operation: "bringToFront" | "sendToBack" | "bringForward" | "sendBackward",
		layerId?: string
	) {
		return this.#arrange?.changeZOrderInLayer(
			selectedElements,
			this.#state.elements,
			operation,
			layerId
		);
	}

	flipElements(
		selectedElements: string[],
		direction: "horizontal" | "vertical"
	) {
		return this.#arrange?.flipElements(
			selectedElements,
			this.#state.elements,
			direction
		);
	}

	// Effects methods
	addLayerEffect(
		layerId: string,
		effectType: string,
		config: Record<string, unknown> = {}
	) {
		return this.#effects?.addLayerEffect(
			layerId,
			effectType as
				| "drop-shadow"
				| "inner-shadow"
				| "outer-glow"
				| "inner-glow"
				| "bevel-emboss"
				| "color-overlay"
				| "gradient-overlay"
				| "stroke"
				| "blur"
				| "noise",
			config
		);
	}

	removeLayerEffect(layerId: string, effectId: string) {
		return this.#effects?.removeLayerEffect(layerId, effectId);
	}

	updateLayerEffect(
		layerId: string,
		effectId: string,
		updates: Record<string, unknown>
	) {
		return this.#effects?.updateLayerEffect(layerId, effectId, updates);
	}

	getLayerEffects(layerId: string) {
		return this.#effects?.getLayerEffects(layerId) || [];
	}

	enableSmartGuide(guideType: string, config: Record<string, unknown> = {}) {
		return this.#effects?.enableSmartGuide(
			guideType as
				| "alignment"
				| "distribution"
				| "spacing"
				| "rotation"
				| "snap-to-grid"
				| "snap-to-element"
				| "smart-spacing",
			config
		);
	}

	disableSmartGuide(guideId: string) {
		return this.#effects?.disableSmartGuide(guideId);
	}

	getEnabledGuides() {
		return this.#effects?.getEnabledGuides() || [];
	}

	getVisualGuides() {
		return this.#effects?.getVisualGuides() || [];
	}

	startDrag() {
		this.#effects?.startDrag();
	}

	endDrag() {
		this.#effects?.endDrag();
	}

	// Size getters
	getDisplaySize() {
		return { ...this.#config.resolution.display };
	}

	getMediaSize() {
		return { ...this.#config.resolution.media };
	}

	/**
	 * Get the native (original) media size before any scaling
	 */
	getNativeMediaSize() {
		return { ...this.#config.resolution.native };
	}

	/**
	 * Get the target processing resolution (where points are stored)
	 */
	getTargetResolution() {
		return this.#config.resolution.target;
	}

	// Sync state methods for backend synchronization
	getNewElements(): DrawingElement[] {
		return this.#state.elements.filter((el) => el.syncState === "new");
	}

	getEditedElements(): DrawingElement[] {
		return this.#state.elements.filter((el) => el.syncState === "edited");
	}

	getSavedElements(): DrawingElement[] {
		return this.#state.elements.filter((el) => el.syncState === "saved");
	}

	getUnsyncedElements(): DrawingElement[] {
		return this.#state.elements.filter(
			(el) =>
				el.syncState === "new" ||
				el.syncState === "edited" ||
				el.syncState === "deleted"
		);
	}

	markAllElementsAsSaved(): void {
		// Mark new/edited elements as saved
		this.#state.elements.forEach((el) => {
			if (el.syncState === "new" || el.syncState === "edited") {
				el.syncState = "saved";
			}
		});

		// Remove elements marked as deleted (they've been synced to backend)
		this.#state.elements = this.#state.elements.filter(
			(el) => el.syncState !== "deleted"
		);

		// Request redraw to update visual state
		this.#redraw();
	}

	getSyncStateStats(): {
		new: number;
		edited: number;
		deleted: number;
		saved: number;
		total: number;
	} {
		const newCount = this.#state.elements.filter(
			(el) => el.syncState === "new"
		).length;
		const editedCount = this.#state.elements.filter(
			(el) => el.syncState === "edited"
		).length;
		const deletedCount = this.#state.elements.filter(
			(el) => el.syncState === "deleted"
		).length;
		const savedCount = this.#state.elements.filter(
			(el) => el.syncState === "saved"
		).length;

		return {
			new: newCount,
			edited: editedCount,
			deleted: deletedCount,
			saved: savedCount,
			total: this.#state.elements.length,
		};
	}

	/**
	 * Get elements that have been marked as deleted
	 * These need to be sent to backend for deletion
	 */
	getDeletedElements(): DrawingElement[] {
		return this.#state.elements.filter((el) => el.syncState === "deleted");
	}
}

export type {
	DrawingColors,
	DrawingEngineConfig,
	HistoryConfig,
	InteractionThresholds,
	RenderingConfig,
	Size,
	TextConfig,
} from "./types";
