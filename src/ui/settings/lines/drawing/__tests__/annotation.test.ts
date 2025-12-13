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

describe("DrawingAnnotation", () => {
	let canvas: HTMLCanvasElement;
	let media: HTMLVideoElement;
	let engine: DrawingEngine;
	let stateMockInstance: any;
	let configMockInstance: any;
	let annotationMockInstance: any;

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
		(DrawingAnnotation as any).mockImplementation(() => {
			annotationMockInstance = {
				completeTextInput: vi.fn().mockReturnValue([
					{
						id: "text-1",
						type: "text",
						points: [{ x: 50, y: 50 }],
						completed: true,
						color: "#000000",
						lineWidth: 2,
						info: {
							name: "Test text",
							type: "label",
							fontSize: 16,
							fontFamily: "Arial",
						},
					},
				]),
			};
			return annotationMockInstance;
		});

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

	describe("Text Input Operations", () => {
		it("should complete text input with basic properties", () => {
			const textData = {
				name: "Test text",
				direction: "left" as const,
				distance: 0,
				fontSize: 16,
				fontFamily: "Arial",
				backgroundEnabled: false,
			};

			engine.completeTextInput("element-1", textData);

			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledWith(
				"element-1",
				textData,
				[]
			);
		});

		it("should complete text input with custom font size", () => {
			const textData = {
				name: "Large text",
				direction: "left" as const,
				distance: 0,
				fontSize: 24,
				fontFamily: "Arial",
				backgroundEnabled: false,
			};

			engine.completeTextInput("element-2", textData);

			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledWith(
				"element-2",
				textData,
				[]
			);
		});

		it("should complete text input with custom font family", () => {
			const textData = {
				name: "Custom font",
				direction: "left" as const,
				distance: 0,
				fontSize: 16,
				fontFamily: "Helvetica",
				backgroundEnabled: false,
			};

			engine.completeTextInput("element-3", textData);

			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledWith(
				"element-3",
				textData,
				[]
			);
		});

		it("should handle empty text input", () => {
			const textData = {
				name: "",
				direction: "left" as const,
				distance: 0,
				fontSize: 16,
				fontFamily: "Arial",
				backgroundEnabled: false,
			};

			engine.completeTextInput("element-4", textData);

			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledWith(
				"element-4",
				textData,
				[]
			);
		});

		it("should complete text input with multiple lines", () => {
			const textData = {
				name: "Line 1\nLine 2\nLine 3",
				direction: "left" as const,
				distance: 0,
				fontSize: 14,
				fontFamily: "Arial",
				backgroundEnabled: false,
			};

			engine.completeTextInput("element-5", textData);

			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledWith(
				"element-5",
				textData,
				[]
			);
		});

		it("should complete text input with special characters", () => {
			const textData = {
				name: "Special: @#$%^&*()",
				direction: "left" as const,
				distance: 0,
				fontSize: 16,
				fontFamily: "Arial",
				backgroundEnabled: false,
			};

			engine.completeTextInput("element-6", textData);

			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledWith(
				"element-6",
				textData,
				[]
			);
		});
	});

	describe("Font Customization", () => {
		it("should support various font sizes", () => {
			const fontSizes = [10, 12, 14, 16, 18, 20, 24, 32, 48];

			fontSizes.forEach((fontSize, index) => {
				const textData = {
					name: `Size ${fontSize}`,
					direction: "left" as const,
					distance: 0,
					fontSize,
					fontFamily: "Arial",
					backgroundEnabled: false,
				};

				engine.completeTextInput(`element-${index}`, textData);
			});

			// Verify all font sizes were processed
			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledTimes(fontSizes.length);
		});

		it("should support various font families", () => {
			const fontFamilies = [
				"Arial",
				"Helvetica",
				"Times New Roman",
				"Courier",
				"Verdana",
				"Georgia",
			];

			fontFamilies.forEach((fontFamily, index) => {
				const textData = {
					name: `Font: ${fontFamily}`,
					direction: "left" as const,
					distance: 0,
					fontSize: 16,
					fontFamily,
					backgroundEnabled: false,
				};

				engine.completeTextInput(`element-${index}`, textData);
			});

			// Verify all font families were processed
			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledTimes(fontFamilies.length);
		});
	});

	describe("Text Element Updates", () => {
		it("should update existing text element", () => {
			stateMockInstance.elements = [
				{
					id: "text-1",
					type: "text",
					points: [{ x: 100, y: 100 }],
					completed: true,
					color: "#000000",
					lineWidth: 2,
					info: {
						name: "Old text",
						type: "label",
						fontSize: 16,
						fontFamily: "Arial",
					},
				},
			];

			const newTextData = {
				name: "Updated text",
				direction: "left" as const,
				distance: 0,
				fontSize: 18,
				fontFamily: "Helvetica",
				backgroundEnabled: false,
			};

			engine.completeTextInput("text-1", newTextData);

			// Verify the text was updated
			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledWith(
				"text-1",
				newTextData,
				expect.arrayContaining([
					expect.objectContaining({
						id: "text-1",
						type: "text",
					}),
				])
			);
		});

		it("should handle text updates with same content", () => {
			const textData = {
				name: "Same text",
				direction: "left" as const,
				distance: 0,
				fontSize: 16,
				fontFamily: "Arial",
				backgroundEnabled: false,
			};

			engine.completeTextInput("text-1", textData);
			engine.completeTextInput("text-1", textData);

			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledTimes(2);
		});
	});

	describe("Text Validation", () => {
		it("should handle very long text", () => {
			const longText = "A".repeat(1000);
			const textData = {
				name: longText,
				direction: "left" as const,
				distance: 0,
				fontSize: 16,
				fontFamily: "Arial",
				backgroundEnabled: false,
			};

			engine.completeTextInput("element-long", textData);

			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledWith(
				"element-long",
				textData,
				[]
			);
		});

		it("should handle text with unicode characters", () => {
			const textData = {
				name: "Unicode: 你好世界 🌍 ñáéíóú",
				direction: "left" as const,
				distance: 0,
				fontSize: 16,
				fontFamily: "Arial",
				backgroundEnabled: false,
			};

			engine.completeTextInput("element-unicode", textData);

			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledWith(
				"element-unicode",
				textData,
				[]
			);
		});

		it("should handle text with numbers", () => {
			const textData = {
				name: "Numbers: 1234567890",
				direction: "left" as const,
				distance: 0,
				fontSize: 16,
				fontFamily: "Arial",
				backgroundEnabled: false,
			};

			engine.completeTextInput("element-numbers", textData);

			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledWith(
				"element-numbers",
				textData,
				[]
			);
		});
	});

	describe("Integration with State", () => {
		it("should update state after text completion", () => {
			const textData = {
				name: "New text",
				direction: "left" as const,
				distance: 0,
				fontSize: 16,
				fontFamily: "Arial",
				backgroundEnabled: false,
			};
			engine.completeTextInput("new-text", textData);

			// Verify the annotation module was called
			expect(annotationMockInstance.completeTextInput).toHaveBeenCalled();
		});

		it("should work with empty elements array", () => {
			stateMockInstance.elements = [];

			const textData = {
				name: "First text",
				direction: "left" as const,
				distance: 0,
				fontSize: 16,
				fontFamily: "Arial",
				backgroundEnabled: false,
			};

			engine.completeTextInput("first-text", textData);

			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledWith(
				"first-text",
				textData,
				[]
			);
		});
	});

	describe("Edge Cases", () => {
		it("should handle whitespace-only text", () => {
			const textData = {
				name: "   ",
				direction: "left" as const,
				distance: 0,
				fontSize: 16,
				fontFamily: "Arial",
				backgroundEnabled: false,
			};

			engine.completeTextInput("whitespace", textData);

			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledWith(
				"whitespace",
				textData,
				[]
			);
		});

		it("should handle text with tabs and newlines", () => {
			const textData = {
				name: "Line 1\t\tTabbed\nLine 2",
				direction: "left" as const,
				distance: 0,
				fontSize: 16,
				fontFamily: "Arial",
				backgroundEnabled: false,
			};

			engine.completeTextInput("formatted", textData);

			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledWith(
				"formatted",
				textData,
				[]
			);
		});

		it("should handle minimum font size", () => {
			const textData = {
				name: "Tiny text",
				direction: "left" as const,
				distance: 0,
				fontSize: 1,
				fontFamily: "Arial",
				backgroundEnabled: false,
			};

			engine.completeTextInput("tiny", textData);

			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledWith("tiny", textData, []);
		});

		it("should handle maximum font size", () => {
			const textData = {
				name: "Huge text",
				direction: "left" as const,
				distance: 0,
				fontSize: 200,
				fontFamily: "Arial",
				backgroundEnabled: false,
			};

			engine.completeTextInput("huge", textData);

			expect(annotationMockInstance.completeTextInput).toHaveBeenCalledWith("huge", textData, []);
		});
	});
});
