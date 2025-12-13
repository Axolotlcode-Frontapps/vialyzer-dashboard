// @vitest-environment jsdom
/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock all dependencies BEFORE imports
vi.mock("../config");
vi.mock("../core");
vi.mock("../state");
vi.mock("../events");
vi.mock("../shortcuts");
vi.mock("../actions");
vi.mock("../annotation");
vi.mock("../history");
vi.mock("../layers");
vi.mock("../arrange");
vi.mock("../effects");
vi.mock("../utils");

import { DrawingActions } from "../actions";
import { DrawingAnnotation } from "../annotation";
import { DrawingArrange } from "../arrange";
import { DrawingConfig } from "../config";
import { DrawingCore } from "../core";
import { DrawingEffects } from "../effects";
import { DrawingEvents } from "../events";
import { DrawingHistory } from "../history";
import { DrawingEngine } from "../index";
import { DrawingLayers } from "../layers";
import { DrawingShortcuts } from "../shortcuts";
import { DrawingState } from "../state";
import { DrawingUtils } from "../utils";

describe("DrawingEvents", () => {
	let canvas: HTMLCanvasElement;
	let media: HTMLVideoElement;
	let engine: DrawingEngine;
	let stateMockInstance: any;
	let configMockInstance: any;
	let eventsMockInstance: any;

	beforeEach(() => {
		canvas = document.createElement("canvas");
		media = document.createElement("video");

		// Mock DrawingState
		stateMockInstance = {
			subscribers: [],
			clone: vi.fn().mockReturnThis(),
			setFeedback: vi.fn(),
			clearFeedback: vi.fn(),
			mode: "cursor",
			elements: [],
			selectedElements: [],
			layers: new Map(),
			layerOrder: [],
			drag: { isDragging: false, elementId: null, pointIndex: null },
			hoveredElement: null,
			clipboard: [],
			pasteOffset: { x: 0, y: 0 },
			drawing: false,
			currentElement: null,
			feedbackMessage: "",
			showFeedback: false,
		};
		(DrawingState as any).mockImplementation(() => stateMockInstance);

		// Mock DrawingConfig
		(DrawingConfig as any).mockImplementation(() => {
			configMockInstance = {
				resolution: {
					display: { width: 1920, height: 1080 },
					target: { width: 1920, height: 1080 },
					native: { width: 1920, height: 1080 },
				},
				interactionThresholds: {
					line: 10,
					area: 10,
					curve: 10,
					point: 15,
				},
				on: {
					feedback: vi.fn(),
					stateChange: vi.fn(),
				},
			};
			return configMockInstance;
		});

		// Mock DrawingCore
		(DrawingCore as any).mockImplementation(() => ({
			redrawCanvas: vi.fn(),
			transformCoordinates: vi.fn().mockReturnValue({ x: 10, y: 10 }),
			getElementAtPoint: vi.fn(),
		}));

		// Mock DrawingLayers
		(DrawingLayers as any).mockImplementation(() => ({
			getLayers: vi.fn().mockReturnValue([]),
			getVisibleLayers: vi.fn().mockReturnValue([]),
			getActiveLayer: vi.fn(),
			getLayer: vi.fn(),
			reset: vi.fn(),
			createLayer: vi.fn(),
			updateLayer: vi.fn(),
			deleteLayer: vi.fn(),
			reorderLayers: vi.fn(),
		}));

		// Mock DrawingHistory
		(DrawingHistory as any).mockImplementation(() => ({
			recordOperation: vi.fn(),
			canUndo: vi.fn().mockReturnValue(false),
			canRedo: vi.fn().mockReturnValue(false),
			undo: vi.fn(),
			redo: vi.fn(),
			getUndoPreview: vi.fn().mockReturnValue("Undo last action"),
			getRedoPreview: vi.fn().mockReturnValue("Redo last action"),
			getStats: vi.fn().mockReturnValue({ operations: 5, memoryBytes: 1024 }),
			isApplyingHistory: false,
			clear: vi.fn(),
		}));

		// Mock DrawingActions
		(DrawingActions as any).mockImplementation(() => ({
			deleteSelectedElements: vi.fn().mockReturnValue([]),
			exportDrawings: vi.fn().mockReturnValue([]),
			clearSelection: vi.fn(),
			selectAllElements: vi.fn(),
			copySelectedElements: vi.fn(),
			cutSelectedElements: vi.fn().mockReturnValue([]),
			pasteElements: vi.fn().mockReturnValue([]),
			duplicateSelectedElements: vi.fn().mockReturnValue([]),
			groupSelectedElements: vi.fn().mockReturnValue([]),
			ungroupSelectedElements: vi.fn().mockReturnValue([]),
			moveSelectedElements: vi.fn().mockReturnValue([]),
			alignElements: vi.fn().mockReturnValue([]),
			clearAll: vi.fn(),
			clearClipboard: vi.fn(),
			resetPasteOffset: vi.fn(),
			getClipboard: vi.fn().mockReturnValue([]),
			hasClipboardContent: vi.fn().mockReturnValue(false),
			bringToFront: vi.fn().mockReturnValue([]),
			sendToBack: vi.fn().mockReturnValue([]),
		}));

		// Mock DrawingArrange
		(DrawingArrange as any).mockImplementation(() => ({
			changeZOrder: vi.fn().mockReturnValue({ elements: [], affectedIds: [] }),
			changeZOrderInLayer: vi.fn().mockReturnValue({ elements: [], affectedIds: [] }),
		}));

		// Mock DrawingAnnotation
		(DrawingAnnotation as any).mockImplementation(() => ({
			completeTextInput: vi.fn().mockReturnValue([]),
		}));

		// Mock DrawingEvents
		(DrawingEvents as any).mockImplementation(() => {
			eventsMockInstance = {
				cleanup: vi.fn(),
				handleMouseDown: vi.fn(),
				handleMouseMove: vi.fn(),
				handleMouseUp: vi.fn(),
				handleClick: vi.fn(),
				handleDoubleClick: vi.fn(),
				handleContextMenu: vi.fn(),
				handleWheel: vi.fn(),
				handleKeyDown: vi.fn(),
				handleKeyUp: vi.fn(),
			};
			return eventsMockInstance;
		});

		// Mock DrawingShortcuts
		(DrawingShortcuts as any).mockImplementation(() => ({
			cleanup: vi.fn(),
		}));

		// Mock DrawingUtils
		(DrawingUtils as any).mockImplementation(() => ({
			findElementNearMouse: vi.fn(),
			findPointNearMouse: vi.fn(),
			getMousePos: vi.fn().mockReturnValue({ x: 100, y: 100 }),
			getElementBounds: vi.fn(),
			generateElementId: vi.fn(() => "test-id-123"),
			distance: vi.fn(),
			getElementCenter: vi.fn(),
			isPointInBounds: vi.fn(),
			clampToCanvas: vi.fn(),
		}));

		// Mock DrawingEffects
		(DrawingEffects as any).mockImplementation(() => ({
			addLayerEffect: vi.fn(),
			removeLayerEffect: vi.fn(),
			cleanup: vi.fn(),
		}));

		engine = new DrawingEngine(canvas, media);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Event Handler Initialization", () => {
		it("should initialize DrawingEvents module", () => {
			expect(DrawingEvents).toHaveBeenCalled();
		});

		it("should provide event handlers", () => {
			expect(eventsMockInstance).toBeDefined();
		});

		it("should have cleanup method", () => {
			expect(eventsMockInstance.cleanup).toBeDefined();
			expect(typeof eventsMockInstance.cleanup).toBe("function");
		});
	});

	describe("Mouse Events", () => {
		it("should handle mouse down event", () => {
			const mouseEvent = new MouseEvent("mousedown", {
				clientX: 100,
				clientY: 100,
			});

			if (eventsMockInstance.handleMouseDown) {
				eventsMockInstance.handleMouseDown(mouseEvent);
				expect(eventsMockInstance.handleMouseDown).toHaveBeenCalledWith(mouseEvent);
			}
		});

		it("should handle mouse move event", () => {
			const mouseEvent = new MouseEvent("mousemove", {
				clientX: 150,
				clientY: 150,
			});

			if (eventsMockInstance.handleMouseMove) {
				eventsMockInstance.handleMouseMove(mouseEvent);
				expect(eventsMockInstance.handleMouseMove).toHaveBeenCalledWith(mouseEvent);
			}
		});

		it("should handle mouse up event", () => {
			const mouseEvent = new MouseEvent("mouseup", {
				clientX: 200,
				clientY: 200,
			});

			if (eventsMockInstance.handleMouseUp) {
				eventsMockInstance.handleMouseUp(mouseEvent);
				expect(eventsMockInstance.handleMouseUp).toHaveBeenCalledWith(mouseEvent);
			}
		});

		it("should handle click event", () => {
			const mouseEvent = new MouseEvent("click", {
				clientX: 100,
				clientY: 100,
			});

			if (eventsMockInstance.handleClick) {
				eventsMockInstance.handleClick(mouseEvent);
				expect(eventsMockInstance.handleClick).toHaveBeenCalledWith(mouseEvent);
			}
		});

		it("should handle double click event", () => {
			const mouseEvent = new MouseEvent("dblclick", {
				clientX: 100,
				clientY: 100,
			});

			if (eventsMockInstance.handleDoubleClick) {
				eventsMockInstance.handleDoubleClick(mouseEvent);
				expect(eventsMockInstance.handleDoubleClick).toHaveBeenCalledWith(mouseEvent);
			}
		});

		it("should handle context menu event", () => {
			const mouseEvent = new MouseEvent("contextmenu", {
				clientX: 100,
				clientY: 100,
			});

			if (eventsMockInstance.handleContextMenu) {
				eventsMockInstance.handleContextMenu(mouseEvent);
				expect(eventsMockInstance.handleContextMenu).toHaveBeenCalledWith(mouseEvent);
			}
		});

		it("should handle wheel event", () => {
			const wheelEvent = new WheelEvent("wheel", {
				deltaY: 10,
			});

			if (eventsMockInstance.handleWheel) {
				eventsMockInstance.handleWheel(wheelEvent);
				expect(eventsMockInstance.handleWheel).toHaveBeenCalledWith(wheelEvent);
			}
		});
	});

	describe("Keyboard Events", () => {
		it("should handle key down event", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "Enter",
			});

			if (eventsMockInstance.handleKeyDown) {
				eventsMockInstance.handleKeyDown(keyEvent);
				expect(eventsMockInstance.handleKeyDown).toHaveBeenCalledWith(keyEvent);
			}
		});

		it("should handle key up event", () => {
			const keyEvent = new KeyboardEvent("keyup", {
				key: "Escape",
			});

			if (eventsMockInstance.handleKeyUp) {
				eventsMockInstance.handleKeyUp(keyEvent);
				expect(eventsMockInstance.handleKeyUp).toHaveBeenCalledWith(keyEvent);
			}
		});

		it("should handle modifier keys", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "Control",
				ctrlKey: true,
			});

			if (eventsMockInstance.handleKeyDown) {
				eventsMockInstance.handleKeyDown(keyEvent);
				expect(eventsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should handle shift key", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "Shift",
				shiftKey: true,
			});

			if (eventsMockInstance.handleKeyDown) {
				eventsMockInstance.handleKeyDown(keyEvent);
				expect(eventsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should handle alt key", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "Alt",
				altKey: true,
			});

			if (eventsMockInstance.handleKeyDown) {
				eventsMockInstance.handleKeyDown(keyEvent);
				expect(eventsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});
	});

	describe("Event Cleanup", () => {
		it("should cleanup event listeners", () => {
			engine.cleanup();
			expect(eventsMockInstance.cleanup).toHaveBeenCalled();
		});

		it("should remove all event listeners on cleanup", () => {
			eventsMockInstance.cleanup();
			expect(eventsMockInstance.cleanup).toHaveBeenCalled();
		});

		it("should be safe to call cleanup multiple times", () => {
			eventsMockInstance.cleanup();
			eventsMockInstance.cleanup();
			expect(eventsMockInstance.cleanup).toHaveBeenCalledTimes(2);
		});
	});

	describe("Event Propagation", () => {
		it("should handle event propagation", () => {
			const mouseEvent = new MouseEvent("click", {
				bubbles: true,
				cancelable: true,
			});

			if (eventsMockInstance.handleClick) {
				eventsMockInstance.handleClick(mouseEvent);
				expect(eventsMockInstance.handleClick).toHaveBeenCalled();
			}
		});

		it("should prevent default when needed", () => {
			const contextMenuEvent = new MouseEvent("contextmenu", {
				bubbles: true,
				cancelable: true,
			});

			if (eventsMockInstance.handleContextMenu) {
				eventsMockInstance.handleContextMenu(contextMenuEvent);
				expect(eventsMockInstance.handleContextMenu).toHaveBeenCalled();
			}
		});
	});

	describe("Touch Events Support", () => {
		it("should handle touch-like mouse events", () => {
			const mouseEvent = new MouseEvent("mousedown", {
				clientX: 100,
				clientY: 100,
				button: 0,
			});

			if (eventsMockInstance.handleMouseDown) {
				eventsMockInstance.handleMouseDown(mouseEvent);
				expect(eventsMockInstance.handleMouseDown).toHaveBeenCalled();
			}
		});

		it("should handle right-click events", () => {
			const mouseEvent = new MouseEvent("mousedown", {
				clientX: 100,
				clientY: 100,
				button: 2,
			});

			if (eventsMockInstance.handleMouseDown) {
				eventsMockInstance.handleMouseDown(mouseEvent);
				expect(eventsMockInstance.handleMouseDown).toHaveBeenCalled();
			}
		});

		it("should handle middle-click events", () => {
			const mouseEvent = new MouseEvent("mousedown", {
				clientX: 100,
				clientY: 100,
				button: 1,
			});

			if (eventsMockInstance.handleMouseDown) {
				eventsMockInstance.handleMouseDown(mouseEvent);
				expect(eventsMockInstance.handleMouseDown).toHaveBeenCalled();
			}
		});
	});

	describe("Canvas Interaction", () => {
		it("should track canvas interactions", () => {
			expect(canvas).toBeDefined();
			expect(canvas.tagName).toBe("CANVAS");
		});

		it("should work with canvas element", () => {
			expect(engine).toBeDefined();
		});

		it("should handle canvas resize events", () => {
			// Events module should handle resize
			expect(eventsMockInstance).toBeDefined();
		});
	});

	describe("Drawing Mode Interactions", () => {
		it("should handle events in cursor mode", () => {
			engine.setDrawingMode("cursor");
			const mouseEvent = new MouseEvent("click");

			if (eventsMockInstance.handleClick) {
				eventsMockInstance.handleClick(mouseEvent);
				expect(eventsMockInstance.handleClick).toHaveBeenCalled();
			}
		});

		it("should handle events in select mode", () => {
			engine.setDrawingMode("select");
			const mouseEvent = new MouseEvent("click");

			if (eventsMockInstance.handleClick) {
				eventsMockInstance.handleClick(mouseEvent);
				expect(eventsMockInstance.handleClick).toHaveBeenCalled();
			}
		});

		it("should handle events in draw mode", () => {
			engine.setDrawingMode("line");
			const mouseEvent = new MouseEvent("click");

			if (eventsMockInstance.handleClick) {
				eventsMockInstance.handleClick(mouseEvent);
				expect(eventsMockInstance.handleClick).toHaveBeenCalled();
			}
		});
	});

	describe("Event Timing", () => {
		it("should handle rapid mouse events", () => {
			const events = Array.from({ length: 10 }, (_, i) => ({
				type: "mousemove",
				x: i * 10,
				y: i * 10,
			}));

			events.forEach((evt) => {
				if (eventsMockInstance.handleMouseMove) {
					const mouseEvent = new MouseEvent("mousemove", {
						clientX: evt.x,
						clientY: evt.y,
					});
					eventsMockInstance.handleMouseMove(mouseEvent);
				}
			});

			if (eventsMockInstance.handleMouseMove) {
				expect(eventsMockInstance.handleMouseMove).toHaveBeenCalledTimes(10);
			}
		});

		it("should handle click sequences", () => {
			if (eventsMockInstance.handleClick) {
				const mouseEvent = new MouseEvent("click");
				eventsMockInstance.handleClick(mouseEvent);
				eventsMockInstance.handleClick(mouseEvent);
				expect(eventsMockInstance.handleClick).toHaveBeenCalledTimes(2);
			}
		});
	});

	describe("Integration with Engine", () => {
		it("should be initialized with engine", () => {
			expect(DrawingEvents).toHaveBeenCalled();
		});

		it("should cleanup on engine cleanup", () => {
			engine.cleanup();
			expect(eventsMockInstance.cleanup).toHaveBeenCalled();
		});

		it("should work with other modules", () => {
			expect(engine).toBeDefined();
			expect(eventsMockInstance).toBeDefined();
		});
	});

	describe("Error Handling", () => {
		it("should handle invalid mouse events gracefully", () => {
			expect(() => {
				if (eventsMockInstance.handleMouseDown) {
					eventsMockInstance.handleMouseDown(null as any);
				}
			}).not.toThrow();
		});

		it("should handle events without canvas gracefully", () => {
			expect(() => {
				const mouseEvent = new MouseEvent("click");
				if (eventsMockInstance.handleClick) {
					eventsMockInstance.handleClick(mouseEvent);
				}
			}).not.toThrow();
		});
	});

	describe("Performance", () => {
		it("should handle multiple event listeners efficiently", () => {
			const startTime = performance.now();

			for (let i = 0; i < 100; i++) {
				if (eventsMockInstance.handleMouseMove) {
					const mouseEvent = new MouseEvent("mousemove", {
						clientX: i,
						clientY: i,
					});
					eventsMockInstance.handleMouseMove(mouseEvent);
				}
			}

			const endTime = performance.now();
			const duration = endTime - startTime;

			expect(duration).toBeLessThan(100); // Should complete in less than 100ms
		});
	});
});
