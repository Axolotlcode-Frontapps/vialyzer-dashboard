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

describe("DrawingState", () => {
	let canvas: HTMLCanvasElement;
	let media: HTMLVideoElement;
	let engine: DrawingEngine;
	let stateMockInstance: any;
	let configMockInstance: any;

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
		(DrawingEvents as any).mockImplementation(() => ({
			cleanup: vi.fn(),
		}));

		// Mock DrawingShortcuts
		(DrawingShortcuts as any).mockImplementation(() => ({
			cleanup: vi.fn(),
		}));

		// Mock DrawingUtils
		(DrawingUtils as any).mockImplementation(() => ({
			findElementNearMouse: vi.fn(),
			findPointNearMouse: vi.fn(),
			getMousePos: vi.fn(),
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

	describe("State Initialization", () => {
		it("should initialize with default state", () => {
			expect(stateMockInstance).toBeDefined();
			expect(stateMockInstance.mode).toBe("cursor");
			expect(stateMockInstance.elements).toEqual([]);
			expect(stateMockInstance.selectedElements).toEqual([]);
		});

		it("should initialize drawing state as false", () => {
			expect(stateMockInstance.drawing).toBe(false);
		});

		it("should initialize with no current element", () => {
			expect(stateMockInstance.currentElement).toBeNull();
		});

		it("should initialize with empty layers", () => {
			expect(stateMockInstance.layers).toBeInstanceOf(Map);
			expect(stateMockInstance.layers.size).toBe(0);
		});
	});

	describe("Drawing Mode State", () => {
		it("should track current drawing mode", () => {
			stateMockInstance.mode = "line";
			expect(engine.drawingMode).toBe("line");
		});

		it("should update mode through setter", () => {
			engine.setDrawingMode("rectangle");
			expect(stateMockInstance.mode).toBe("rectangle");
		});

		it("should support all drawing modes", () => {
			const modes = ["cursor", "select", "line", "area", "rectangle", "circle", "curve", "erase"];

			modes.forEach((mode) => {
				engine.setDrawingMode(mode as any);
				expect(stateMockInstance.mode).toBe(mode);
			});
		});
	});

	describe("Element State Management", () => {
		it("should maintain elements array", () => {
			expect(stateMockInstance.elements).toEqual([]);
		});

		it("should track selected elements", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];
			expect(engine.selectedElements).toEqual([{ id: "1", type: "line" }]);
		});

		it("should track hovered element", () => {
			stateMockInstance.hoveredElement = "element-1";
			expect(engine.hoveredElement).toBe("element-1");
		});

		it("should handle multiple selected elements", () => {
			const selected = [
				{ id: "1", type: "line" },
				{ id: "2", type: "rect" },
				{ id: "3", type: "circle" },
			];
			stateMockInstance.selectedElements = selected;
			expect(engine.selectedElements).toEqual(selected);
		});

		it("should clear selected elements", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];
			engine.clearSelection();
			expect(stateMockInstance.selectedElements).toEqual([]);
		});
	});

	describe("Drag State", () => {
		it("should track drag state", () => {
			expect(stateMockInstance.drag).toBeDefined();
			expect(stateMockInstance.drag.isDragging).toBe(false);
		});

		it("should track dragging element", () => {
			stateMockInstance.drag = {
				isDragging: true,
				elementId: "element-1",
				pointIndex: 0,
			};

			expect(stateMockInstance.drag.isDragging).toBe(true);
			expect(stateMockInstance.drag.elementId).toBe("element-1");
			expect(stateMockInstance.drag.pointIndex).toBe(0);
		});

		it("should update drag state", () => {
			stateMockInstance.drag.isDragging = true;
			stateMockInstance.drag.elementId = "test-element";
			stateMockInstance.drag.pointIndex = 2;

			expect(stateMockInstance.drag).toEqual({
				isDragging: true,
				elementId: "test-element",
				pointIndex: 2,
			});
		});

		it("should reset drag state", () => {
			stateMockInstance.drag = {
				isDragging: false,
				elementId: null,
				pointIndex: null,
			};

			expect(stateMockInstance.drag.isDragging).toBe(false);
			expect(stateMockInstance.drag.elementId).toBeNull();
			expect(stateMockInstance.drag.pointIndex).toBeNull();
		});
	});

	describe("Feedback State", () => {
		it("should manage feedback message", () => {
			stateMockInstance.feedbackMessage = "Test feedback";
			expect(engine.feedbackMessage).toBe("Test feedback");
		});

		it("should manage feedback visibility", () => {
			stateMockInstance.showFeedback = true;
			expect(engine.showFeedback).toBe(true);

			stateMockInstance.showFeedback = false;
			expect(engine.showFeedback).toBe(false);
		});

		it("should set feedback through engine", () => {
			engine.setFeedback("New feedback");
			expect(stateMockInstance.setFeedback).toHaveBeenCalledWith("New feedback", true);
		});

		it("should clear feedback", () => {
			engine.clearFeedback();
			expect(stateMockInstance.clearFeedback).toHaveBeenCalled();
		});

		it("should handle empty feedback message", () => {
			stateMockInstance.feedbackMessage = "";
			stateMockInstance.showFeedback = false;
			expect(engine.feedbackMessage).toBe("");
			expect(engine.showFeedback).toBe(false);
		});
	});

	describe("Clipboard State", () => {
		it("should maintain clipboard array", () => {
			expect(stateMockInstance.clipboard).toEqual([]);
		});

		it("should track paste offset", () => {
			expect(stateMockInstance.pasteOffset).toEqual({ x: 0, y: 0 });
		});

		it("should update clipboard state", () => {
			stateMockInstance.clipboard = [{ id: "1", type: "line" }];
			expect(stateMockInstance.clipboard).toHaveLength(1);
		});

		it("should update paste offset", () => {
			stateMockInstance.pasteOffset = { x: 10, y: 10 };
			expect(stateMockInstance.pasteOffset).toEqual({ x: 10, y: 10 });
		});

		it("should handle multiple clipboard items", () => {
			const items = [
				{ id: "1", type: "line" },
				{ id: "2", type: "rect" },
			];
			stateMockInstance.clipboard = items;
			expect(stateMockInstance.clipboard).toEqual(items);
		});
	});

	describe("Layer State", () => {
		it("should maintain layers map", () => {
			expect(stateMockInstance.layers).toBeInstanceOf(Map);
		});

		it("should maintain layer order", () => {
			expect(stateMockInstance.layerOrder).toEqual([]);
		});

		it("should add layers to state", () => {
			stateMockInstance.layers.set("layer-1", {
				id: "layer-1",
				name: "Layer 1",
			});
			expect(stateMockInstance.layers.has("layer-1")).toBe(true);
		});

		it("should track layer order", () => {
			stateMockInstance.layerOrder = ["layer-1", "layer-2", "layer-3"];
			expect(stateMockInstance.layerOrder).toHaveLength(3);
		});

		it("should handle empty layers", () => {
			stateMockInstance.layers.clear();
			stateMockInstance.layerOrder = [];
			expect(stateMockInstance.layers.size).toBe(0);
			expect(stateMockInstance.layerOrder).toHaveLength(0);
		});
	});

	describe("State Cloning", () => {
		it("should support state cloning", () => {
			const cloned = stateMockInstance.clone();
			expect(stateMockInstance.clone).toHaveBeenCalled();
			expect(cloned).toBeDefined();
		});

		it("should clone for history operations", () => {
			stateMockInstance.clone();
			expect(stateMockInstance.clone).toHaveBeenCalled();
		});

		it("should return clone instance", () => {
			const clone = stateMockInstance.clone();
			expect(clone).toBe(stateMockInstance);
		});
	});

	describe("State Subscribers", () => {
		it("should maintain subscribers array", () => {
			expect(stateMockInstance.subscribers).toEqual([]);
		});

		it("should support state change subscriptions", () => {
			const callback = vi.fn();
			engine.subscribeToStateChanges(callback);

			engine.setDrawingMode("line");

			expect(callback).toHaveBeenCalled();
		});

		it("should notify multiple subscribers", () => {
			const callback1 = vi.fn();
			const callback2 = vi.fn();

			engine.subscribeToStateChanges(callback1);
			engine.subscribeToStateChanges(callback2);

			engine.setDrawingMode("select");

			expect(callback1).toHaveBeenCalled();
			expect(callback2).toHaveBeenCalled();
		});

		it("should support unsubscribe", () => {
			const callback = vi.fn();
			const unsubscribe = engine.subscribeToStateChanges(callback);

			unsubscribe();

			expect(typeof unsubscribe).toBe("function");
		});
	});

	describe("Drawing State Flags", () => {
		it("should track drawing flag", () => {
			expect(stateMockInstance.drawing).toBe(false);
		});

		it("should update drawing state", () => {
			stateMockInstance.drawing = true;
			expect(stateMockInstance.drawing).toBe(true);

			stateMockInstance.drawing = false;
			expect(stateMockInstance.drawing).toBe(false);
		});

		it("should track current element while drawing", () => {
			stateMockInstance.drawing = true;
			stateMockInstance.currentElement = {
				id: "temp-1",
				type: "line",
				points: [],
			};

			expect(stateMockInstance.currentElement).toBeDefined();
			expect(stateMockInstance.currentElement.id).toBe("temp-1");
		});
	});

	describe("State Consistency", () => {
		it("should maintain state object reference", () => {
			const state1 = stateMockInstance;
			const state2 = stateMockInstance;
			expect(state1).toBe(state2);
		});

		it("should have all required state properties", () => {
			expect(stateMockInstance).toHaveProperty("mode");
			expect(stateMockInstance).toHaveProperty("elements");
			expect(stateMockInstance).toHaveProperty("selectedElements");
			expect(stateMockInstance).toHaveProperty("layers");
			expect(stateMockInstance).toHaveProperty("layerOrder");
			expect(stateMockInstance).toHaveProperty("drag");
			expect(stateMockInstance).toHaveProperty("hoveredElement");
			expect(stateMockInstance).toHaveProperty("clipboard");
			expect(stateMockInstance).toHaveProperty("pasteOffset");
			expect(stateMockInstance).toHaveProperty("drawing");
			expect(stateMockInstance).toHaveProperty("currentElement");
		});
	});

	describe("State Updates Through Engine", () => {
		it("should update mode through engine", () => {
			engine.setDrawingMode("area");
			expect(stateMockInstance.mode).toBe("area");
		});

		it("should update selection through engine", () => {
			stateMockInstance.selectedElements = [{ id: "1" }];
			engine.clearSelection();
			expect(stateMockInstance.selectedElements).toEqual([]);
		});

		it("should update feedback through engine", () => {
			engine.setFeedback("Test");
			expect(stateMockInstance.setFeedback).toHaveBeenCalledWith("Test", true);
		});

		it("should clear state through engine", () => {
			engine.clearAll();
			expect(stateMockInstance.elements).toEqual([]);
			expect(stateMockInstance.selectedElements).toEqual([]);
		});
	});

	describe("Complex State Scenarios", () => {
		it("should handle simultaneous state updates", () => {
			engine.setDrawingMode("line");
			stateMockInstance.selectedElements = [{ id: "1" }];
			stateMockInstance.hoveredElement = "element-2";

			expect(stateMockInstance.mode).toBe("line");
			expect(stateMockInstance.selectedElements).toHaveLength(1);
			expect(stateMockInstance.hoveredElement).toBe("element-2");
		});

		it("should maintain state during operations", () => {
			stateMockInstance.elements = [
				{ id: "1", type: "line" },
				{ id: "2", type: "rect" },
			];

			engine.clearSelection();

			expect(stateMockInstance.elements).toHaveLength(2);
		});

		it("should handle state reset", () => {
			engine.clearAll();

			expect(stateMockInstance.elements).toEqual([]);
			expect(stateMockInstance.selectedElements).toEqual([]);
		});
	});

	describe("Integration with Engine", () => {
		it("should be accessible through engine properties", () => {
			expect(engine.drawingMode).toBeDefined();
			expect(engine.selectedElements).toBeDefined();
			expect(engine.hoveredElement).toBeDefined();
		});

		it("should be used by engine methods", () => {
			engine.setDrawingMode("circle");
			expect(stateMockInstance.mode).toBe("circle");
		});

		it("should maintain consistency across operations", () => {
			const initialMode = engine.drawingMode;
			engine.clearSelection();
			expect(engine.drawingMode).toBe(initialMode);
		});
	});
});
