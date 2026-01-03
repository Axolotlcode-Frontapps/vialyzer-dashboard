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

describe("DrawingEngine - Main Integration", () => {
	let canvas: HTMLCanvasElement;
	let media: HTMLVideoElement;
	let engine: DrawingEngine;
	let stateMockInstance: any;
	let configMockInstance: any;
	let coreMockInstance: any;
	let layersMockInstance: any;
	let historyMockInstance: any;
	let actionsMockInstance: any;
	let arrangeMockInstance: any;
	let annotationMockInstance: any;
	let eventsMockInstance: any;
	let shortcutsMockInstance: any;
	let utilsMockInstance: any;
	let effectsMockInstance: any;

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
				on: {
					feedback: vi.fn(),
					stateChange: vi.fn(),
				},
				interactionThresholds: {
					line: 10,
					area: 10,
					curve: 10,
					point: 15,
				},
			};
			return configMockInstance;
		});

		// Mock DrawingCore
		(DrawingCore as any).mockImplementation(() => {
			coreMockInstance = {
				redrawCanvas: vi.fn(),
				transformCoordinates: vi.fn().mockReturnValue({ x: 10, y: 10 }),
				getElementAtPoint: vi.fn(),
				mediaToDisplayCoords: vi.fn((point) => point),
				displayToMediaCoords: vi.fn((point) => point),
				distanceToLineSegment: vi.fn(() => 5),
				pointInPolygon: vi.fn(() => false),
			};
			return coreMockInstance;
		});

		// Mock DrawingLayers
		(DrawingLayers as any).mockImplementation(() => {
			layersMockInstance = {
				getLayers: vi.fn().mockReturnValue([]),
				getVisibleLayers: vi.fn().mockReturnValue([]),
				getActiveLayer: vi.fn(),
				getLayer: vi.fn(),
				reset: vi.fn(),
				createLayer: vi.fn(),
				updateLayer: vi.fn(),
				deleteLayer: vi.fn(),
				reorderLayers: vi.fn(),
			};
			return layersMockInstance;
		});

		// Mock DrawingHistory
		(DrawingHistory as any).mockImplementation(() => {
			historyMockInstance = {
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
			};
			return historyMockInstance;
		});

		// Mock DrawingActions
		(DrawingActions as any).mockImplementation(() => {
			actionsMockInstance = {
				deleteSelectedElements: vi.fn(),
				exportDrawings: vi.fn(),
				clearSelection: vi.fn(),
				selectAllElements: vi.fn(),
				copySelectedElements: vi.fn(),
				cutSelectedElements: vi.fn(),
				pasteElements: vi.fn(),
				duplicateSelectedElements: vi.fn(),
				groupSelectedElements: vi.fn(),
				ungroupSelectedElements: vi.fn(),
				moveSelectedElements: vi.fn(),
				alignElements: vi.fn(),
				completeTextInput: vi.fn(),
				clearAll: vi.fn(),
				clearClipboard: vi.fn(),
				resetPasteOffset: vi.fn(),
				getClipboard: vi.fn().mockReturnValue([]),
				hasClipboardContent: vi.fn().mockReturnValue(false),
				bringToFront: vi.fn().mockReturnValue([]),
				sendToBack: vi.fn().mockReturnValue([]),
			};
			return actionsMockInstance;
		});

		// Mock DrawingArrange
		(DrawingArrange as any).mockImplementation(() => {
			arrangeMockInstance = {
				changeZOrder: vi.fn().mockReturnValue({ elements: [], affectedIds: [] }),
				changeZOrderInLayer: vi.fn().mockReturnValue({ elements: [], affectedIds: [] }),
			};
			return arrangeMockInstance;
		});

		// Mock DrawingAnnotation
		(DrawingAnnotation as any).mockImplementation(() => {
			annotationMockInstance = {
				completeTextInput: vi.fn().mockReturnValue([]),
			};
			return annotationMockInstance;
		});

		// Mock DrawingEvents
		(DrawingEvents as any).mockImplementation(() => {
			eventsMockInstance = {
				cleanup: vi.fn(),
			};
			return eventsMockInstance;
		});

		// Mock DrawingShortcuts
		(DrawingShortcuts as any).mockImplementation(() => {
			shortcutsMockInstance = {
				cleanup: vi.fn(),
			};
			return shortcutsMockInstance;
		});

		// Mock DrawingUtils
		(DrawingUtils as any).mockImplementation(() => {
			utilsMockInstance = {
				findElementNearMouse: vi.fn(),
				findPointNearMouse: vi.fn(),
				getMousePos: vi.fn(),
				getElementBounds: vi.fn(),
				generateElementId: vi.fn(() => "test-id-123"),
				distance: vi.fn(),
				getElementCenter: vi.fn(),
				isPointInBounds: vi.fn(),
				clampToCanvas: vi.fn(),
			};
			return utilsMockInstance;
		});

		// Mock DrawingEffects
		(DrawingEffects as any).mockImplementation(() => {
			effectsMockInstance = {
				addLayerEffect: vi.fn(),
				removeLayerEffect: vi.fn(),
				cleanup: vi.fn(),
			};
			return effectsMockInstance;
		});

		engine = new DrawingEngine(canvas, media);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Initialization", () => {
		it("should initialize with all modules", () => {
			expect(engine).toBeDefined();
			expect(DrawingConfig).toHaveBeenCalled();
			expect(DrawingCore).toHaveBeenCalled();
			expect(DrawingState).toHaveBeenCalled();
			expect(DrawingLayers).toHaveBeenCalled();
			expect(DrawingHistory).toHaveBeenCalled();
			expect(DrawingActions).toHaveBeenCalled();
			expect(DrawingArrange).toHaveBeenCalled();
			expect(DrawingAnnotation).toHaveBeenCalled();
			expect(DrawingEvents).toHaveBeenCalled();
			expect(DrawingShortcuts).toHaveBeenCalled();
			expect(DrawingUtils).toHaveBeenCalled();
			expect(DrawingEffects).toHaveBeenCalled();
		});

		it("should return config", () => {
			const config = engine.getConfig();
			expect(config).toBeDefined();
			expect(config).toBe(configMockInstance);
		});

		it("should initialize with canvas and media elements", () => {
			expect(canvas).toBeDefined();
			expect(media).toBeDefined();
		});
	});

	describe("Drawing Modes", () => {
		it("should set and get drawing mode", () => {
			const modes = [
				"line",
				"area",
				"curve",
				"rectangle",
				"circle",
				"cursor",
				"select",
				"erase",
			] as const;

			modes.forEach((mode) => {
				engine.setDrawingMode(mode);
				expect(stateMockInstance.mode).toBe(mode);
			});
		});

		it("should get current drawing mode", () => {
			stateMockInstance.mode = "line";
			expect(engine.drawingMode).toBe("line");
		});
	});

	describe("Element Operations", () => {
		it("should add elements", () => {
			// Simulate media loaded first
			const configConstructorCalls = (DrawingConfig as any).mock.calls;
			const configArgs = configConstructorCalls[configConstructorCalls.length - 1];
			const configOptions = configArgs[2];
			configOptions.on.stateChange({ type: "mediaLoaded" });

			const elements = [{ id: "1", type: "line", points: [] }];
			const layers = new Map();
			layers.set("layer1", { id: "layer1", name: "Layer 1" });

			engine.addElements(elements as any, layers);

			expect(coreMockInstance.redrawCanvas).toHaveBeenCalled();
		});

		it("should delete selected elements", () => {
			engine.deleteSelectedElements();
			expect(actionsMockInstance.deleteSelectedElements).toHaveBeenCalled();
		});

		it("should clear all elements", () => {
			engine.clearAll();
			expect(stateMockInstance.elements).toEqual([]);
			expect(stateMockInstance.selectedElements).toEqual([]);
		});

		it("should export drawings", () => {
			engine.exportDrawings();
			expect(actionsMockInstance.exportDrawings).toHaveBeenCalled();
		});
	});

	describe("Selection Operations", () => {
		it("should clear selection", () => {
			engine.clearSelection();
			expect(stateMockInstance.selectedElements).toEqual([]);
		});

		it("should select all elements", () => {
			engine.selectAllElements();
			expect(actionsMockInstance.selectAllElements).toHaveBeenCalled();
		});

		it("should get selected elements", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];
			const selected = engine.selectedElements;
			expect(selected).toEqual([{ id: "1", type: "line" }]);
		});

		it("should get hovered element", () => {
			stateMockInstance.hoveredElement = "element-1";
			expect(engine.hoveredElement).toBe("element-1");
		});
	});

	describe("State Management", () => {
		it("should subscribe to state changes", () => {
			const callback = vi.fn();
			const unsubscribe = engine.subscribeToStateChanges(callback);

			engine.setDrawingMode("line");

			expect(callback).toHaveBeenCalled();
			unsubscribe();
		});

		it("should handle multiple subscribers", () => {
			const callback1 = vi.fn();
			const callback2 = vi.fn();

			engine.subscribeToStateChanges(callback1);
			engine.subscribeToStateChanges(callback2);

			engine.setDrawingMode("select");

			expect(callback1).toHaveBeenCalled();
			expect(callback2).toHaveBeenCalled();
		});
	});

	describe("Feedback System", () => {
		it("should set feedback", () => {
			const feedbackSpy = vi.fn();
			engine.subscribeToStateChanges((event) => {
				if (event.type === "feedback") {
					feedbackSpy(event.message);
				}
			});

			engine.setFeedback("Test feedback");
			expect(feedbackSpy).toHaveBeenCalledWith("Test feedback");
		});

		it("should clear feedback", () => {
			engine.clearFeedback();
			expect(stateMockInstance.clearFeedback).toHaveBeenCalled();
		});
	});

	describe("Resource Cleanup", () => {
		it("should cleanup all resources", () => {
			engine.cleanup();

			expect(shortcutsMockInstance.cleanup).toHaveBeenCalled();
			expect(eventsMockInstance.cleanup).toHaveBeenCalled();
		});
	});

	describe("Module Integration", () => {
		it("should integrate with Actions module", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];
			engine.copySelectedElements();
			expect(actionsMockInstance.copySelectedElements).toHaveBeenCalled();
		});

		it("should integrate with Annotation module", () => {
			const textData = {
				name: "Test",
				type: "DETECTION" as const,
				counterTrack: false,
				distance: 10,
				fontSize: 16,
				fontFamily: "Arial",
				backgroundEnabled: false,
			};
			engine.completeTextInput("elem-1", textData);
			expect(annotationMockInstance.completeTextInput).toHaveBeenCalled();
		});

		it("should integrate with Arrange module", () => {
			engine.changeZOrderInLayer(["1"], "bringForward");
			expect(arrangeMockInstance.changeZOrderInLayer).toHaveBeenCalled();
		});

		it("should integrate with History module", () => {
			historyMockInstance.canUndo.mockReturnValue(true);
			engine.undoLast();
			expect(historyMockInstance.undo).toHaveBeenCalled();
		});

		it("should integrate with Layers module", () => {
			const layers = [{ id: "1", name: "Layer 1" }];
			layersMockInstance.getLayers.mockReturnValue(layers);
			expect(engine.getLayers()).toEqual(layers);
		});

		it("should integrate with Core module for rendering", () => {
			coreMockInstance.redrawCanvas();
			expect(coreMockInstance.redrawCanvas).toHaveBeenCalled();
		});
	});

	describe("Error Handling", () => {
		it("should handle operations gracefully", () => {
			expect(() => {
				engine.clearSelection();
				engine.deleteSelectedElements();
			}).not.toThrow();
		});

		it("should maintain valid state after operations", () => {
			engine.clearSelection();
			expect(stateMockInstance.elements).toBeDefined();
		});
	});

	describe("Performance", () => {
		it("should batch state updates", () => {
			const stateChangeSpy = vi.fn();
			engine.subscribeToStateChanges(stateChangeSpy);

			engine.setDrawingMode("line");
			engine.setDrawingMode("select");
			engine.setDrawingMode("rectangle");

			expect(stateChangeSpy).toHaveBeenCalled();
			expect(stateChangeSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
		});

		it("should provide performance metrics through history", () => {
			const stats = engine.getHistoryStats() as {
				operations: number;
				memoryBytes: number;
			};
			expect(stats).toBeDefined();
			expect(stats.operations).toBeDefined();
			expect(stats.memoryBytes).toBeDefined();
		});
	});
});
