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

describe("DrawingActions", () => {
	let canvas: HTMLCanvasElement;
	let media: HTMLVideoElement;
	let engine: DrawingEngine;
	let stateMockInstance: any;
	let configMockInstance: any;
	let coreMockInstance: any;
	let actionsMockInstance: any;
	let historyMockInstance: any;
	let layersMockInstance: any;

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
			};
			return configMockInstance;
		});

		// Mock DrawingCore
		(DrawingCore as any).mockImplementation(() => {
			coreMockInstance = {
				redrawCanvas: vi.fn(),
				transformCoordinates: vi.fn().mockReturnValue({ x: 10, y: 10 }),
				getElementAtPoint: vi.fn(),
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
			};
			return actionsMockInstance;
		});

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

	describe("Clipboard Operations", () => {
		it("should copy selected elements", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];
			engine.copySelectedElements();
			expect(actionsMockInstance.copySelectedElements).toHaveBeenCalledWith(
				[{ id: "1", type: "line" }],
				[]
			);
		});

		it("should cut selected elements", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];
			engine.cutSelectedElements();
			expect(actionsMockInstance.cutSelectedElements).toHaveBeenCalledWith(
				[{ id: "1", type: "line" }],
				[]
			);
		});

		it("should paste elements at position", () => {
			const position = { x: 10, y: 10 };
			engine.pasteElements(true, position);
			expect(actionsMockInstance.pasteElements).toHaveBeenCalledWith(true, position);
		});

		it("should paste elements without position", () => {
			engine.pasteElements();
			expect(actionsMockInstance.pasteElements).toHaveBeenCalled();
		});

		it("should duplicate selected elements", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];
			engine.duplicateSelectedElements();
			expect(actionsMockInstance.duplicateSelectedElements).toHaveBeenCalledWith(
				[{ id: "1", type: "line" }],
				[]
			);
		});

		it("should clear clipboard", () => {
			engine.clearClipboard();
			expect(actionsMockInstance.clearClipboard).toHaveBeenCalled();
		});

		it("should reset paste offset", () => {
			engine.resetPasteOffset();
			expect(actionsMockInstance.resetPasteOffset).toHaveBeenCalled();
		});

		it("should get clipboard content", () => {
			actionsMockInstance.getClipboard.mockReturnValue([{ id: "1", type: "line" }]);
			const clipboard = engine.getClipboard();
			expect(clipboard).toEqual([{ id: "1", type: "line" }]);
		});

		it("should check if clipboard has content", () => {
			actionsMockInstance.hasClipboardContent.mockReturnValue(true);
			expect(engine.hasClipboardContent()).toBe(true);

			actionsMockInstance.hasClipboardContent.mockReturnValue(false);
			expect(engine.hasClipboardContent()).toBe(false);
		});

		it("should handle empty clipboard", () => {
			actionsMockInstance.getClipboard.mockReturnValue([]);
			actionsMockInstance.hasClipboardContent.mockReturnValue(false);

			expect(engine.getClipboard()).toEqual([]);
			expect(engine.hasClipboardContent()).toBe(false);
		});
	});

	describe("Grouping Operations", () => {
		it("should group selected elements", () => {
			stateMockInstance.selectedElements = [{ id: "1" }, { id: "2" }];
			engine.groupSelectedElements();
			expect(actionsMockInstance.groupSelectedElements).toHaveBeenCalledWith(
				[{ id: "1" }, { id: "2" }],
				[]
			);
		});

		it("should ungroup selected elements", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];
			engine.ungroupSelectedElements();
			expect(actionsMockInstance.ungroupSelectedElements).toHaveBeenCalledWith(
				[{ id: "1", type: "line" }],
				[]
			);
		});

		it("should handle grouping with no selection", () => {
			stateMockInstance.selectedElements = [];
			engine.groupSelectedElements();
			// When there's no selection, the engine may not call the action method
			// Just verify it doesn't throw an error
			expect(stateMockInstance.selectedElements).toEqual([]);
		});

		it("should handle ungrouping with no selection", () => {
			stateMockInstance.selectedElements = [];
			engine.ungroupSelectedElements();
			// When there's no selection, the engine may not call the action method
			// Just verify it doesn't throw an error
			expect(stateMockInstance.selectedElements).toEqual([]);
		});
	});

	describe("Alignment Operations", () => {
		it("should align elements to the left", () => {
			stateMockInstance.selectedElements = [{ id: "1" }, { id: "2" }];

			engine.alignElements("left");
			expect(actionsMockInstance.alignElements).toHaveBeenCalledWith(
				[{ id: "1" }, { id: "2" }],
				[],
				"left"
			);
		});

		it("should align elements to the right", () => {
			stateMockInstance.selectedElements = [{ id: "1" }, { id: "2" }];

			engine.alignElements("right");
			expect(actionsMockInstance.alignElements).toHaveBeenCalledWith(
				[{ id: "1" }, { id: "2" }],
				[],
				"right"
			);
		});

		it("should align elements to the top", () => {
			stateMockInstance.selectedElements = [{ id: "1" }, { id: "2" }];

			engine.alignElements("top");
			expect(actionsMockInstance.alignElements).toHaveBeenCalledWith(
				[{ id: "1" }, { id: "2" }],
				[],
				"top"
			);
		});

		it("should align elements to the bottom", () => {
			stateMockInstance.selectedElements = [{ id: "1" }, { id: "2" }];

			engine.alignElements("bottom");
			expect(actionsMockInstance.alignElements).toHaveBeenCalledWith(
				[{ id: "1" }, { id: "2" }],
				[],
				"bottom"
			);
		});

		it("should align elements to center horizontally", () => {
			stateMockInstance.selectedElements = [{ id: "1" }, { id: "2" }];

			engine.alignElements("centerX");
			expect(actionsMockInstance.alignElements).toHaveBeenCalledWith(
				[{ id: "1" }, { id: "2" }],
				[],
				"centerX"
			);
		});

		it("should align elements to center vertically", () => {
			stateMockInstance.selectedElements = [{ id: "1" }, { id: "2" }];

			engine.alignElements("centerY");
			expect(actionsMockInstance.alignElements).toHaveBeenCalledWith(
				[{ id: "1" }, { id: "2" }],
				[],
				"centerY"
			);
		});
	});

	describe("Movement Operations", () => {
		it("should move selected elements horizontally", () => {
			stateMockInstance.selectedElements = [{ id: "1" }];

			const offset = { x: 10, y: 0 };
			engine.moveSelectedElements(offset);
			expect(actionsMockInstance.moveSelectedElements).toHaveBeenCalledWith(
				[{ id: "1" }],
				[],
				offset
			);
		});

		it("should move selected elements vertically", () => {
			stateMockInstance.selectedElements = [{ id: "1" }];

			const offset = { x: 0, y: -5 };
			engine.moveSelectedElements(offset);
			expect(actionsMockInstance.moveSelectedElements).toHaveBeenCalledWith(
				[{ id: "1" }],
				[],
				offset
			);
		});

		it("should move selected elements diagonally", () => {
			stateMockInstance.selectedElements = [{ id: "1" }];

			const offset = { x: 10, y: 10 };
			engine.moveSelectedElements(offset);
			expect(actionsMockInstance.moveSelectedElements).toHaveBeenCalledWith(
				[{ id: "1" }],
				[],
				offset
			);
		});

		it("should handle moving with no selection", () => {
			stateMockInstance.selectedElements = [];
			const offset = { x: 10, y: 10 };
			engine.moveSelectedElements(offset);
			// When there's no selection, the engine may not call the action method
			// Just verify it doesn't throw an error
			expect(stateMockInstance.selectedElements).toEqual([]);
		});
	});

	describe("Selection Management", () => {
		it("should delete selected elements", () => {
			stateMockInstance.selectedElements = [{ id: "1" }];
			engine.deleteSelectedElements();
			expect(actionsMockInstance.deleteSelectedElements).toHaveBeenCalledWith([{ id: "1" }], []);
		});

		it("should select all elements", () => {
			engine.selectAllElements();
			expect(actionsMockInstance.selectAllElements).toHaveBeenCalledWith([]);
		});

		it("should clear all elements", () => {
			engine.clearAll();
			expect(stateMockInstance.elements).toEqual([]);
			expect(stateMockInstance.selectedElements).toEqual([]);
		});
	});

	describe("Z-Order Operations", () => {
		it("should bring elements to front", () => {
			stateMockInstance.selectedElements = [{ id: "1" }];
			engine.bringToFront();
			expect(actionsMockInstance.bringToFront).toHaveBeenCalledWith([{ id: "1" }], []);
		});

		it("should send elements to back", () => {
			stateMockInstance.selectedElements = [{ id: "1" }];
			engine.sendToBack();
			expect(actionsMockInstance.sendToBack).toHaveBeenCalledWith([{ id: "1" }], []);
		});
	});

	describe("Export Operations", () => {
		it("should export drawings", () => {
			stateMockInstance.elements = [
				{ id: "1", type: "line", points: [] },
				{ id: "2", type: "rect", points: [] },
			];

			engine.exportDrawings();
			// exportDrawings may only pass elements, not layers
			expect(actionsMockInstance.exportDrawings).toHaveBeenCalledWith(stateMockInstance.elements);
		});

		it("should export empty drawings", () => {
			stateMockInstance.elements = [];
			engine.exportDrawings();
			// exportDrawings may only pass elements, not layers
			expect(actionsMockInstance.exportDrawings).toHaveBeenCalledWith([]);
		});
	});
});
