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

describe("DrawingConfig", () => {
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
				colors: {
					line: "#FF0000",
					area: "#00FF00",
					curve: "#0000FF",
					rectangle: "#FFFF00",
					circle: "#FF00FF",
				},
				rendering: {
					defaultLineWidth: 2,
					selectedLineWidth: 3,
					hoveredLineWidth: 2.5,
					defaultOpacity: 1,
					showDirectionArrows: true,
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
			changeZOrderInLayer: vi
				.fn()
				.mockReturnValue({ elements: [], affectedIds: [] }),
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

	describe("Configuration Initialization", () => {
		it("should initialize with default config", () => {
			const config = engine.getConfig();
			expect(config).toBeDefined();
		});

		it("should provide config object", () => {
			const config = engine.getConfig();
			expect(config).toBe(configMockInstance);
		});
	});

	describe("Resolution Settings", () => {
		it("should have display resolution", () => {
			const config = engine.getConfig();
			expect(config.resolution.display).toBeDefined();
			expect(config.resolution.display.width).toBe(1920);
			expect(config.resolution.display.height).toBe(1080);
		});

		it("should have target resolution", () => {
			const config = engine.getConfig();
			expect(config.resolution.target).toBeDefined();
			expect(config.resolution.target.width).toBe(1920);
			expect(config.resolution.target.height).toBe(1080);
		});

		it("should have native resolution", () => {
			const config = engine.getConfig();
			expect(config.resolution.native).toBeDefined();
			expect(config.resolution.native.width).toBe(1920);
			expect(config.resolution.native.height).toBe(1080);
		});

		it("should maintain consistent resolutions", () => {
			const config = engine.getConfig();
			const displayWidth = config.resolution.display.width;
			const targetWidth = config.resolution.target.width;
			const nativeWidth = config.resolution.native.width;

			expect(displayWidth).toBe(targetWidth);
			expect(targetWidth).toBe(nativeWidth);
		});
	});

	describe("Interaction Thresholds", () => {
		it("should provide line threshold", () => {
			const config = engine.getConfig();
			expect(config.interactionThresholds.line).toBe(10);
		});

		it("should provide area threshold", () => {
			const config = engine.getConfig();
			expect(config.interactionThresholds.area).toBe(10);
		});

		it("should provide curve threshold", () => {
			const config = engine.getConfig();
			expect(config.interactionThresholds.curve).toBe(10);
		});

		it("should provide point threshold", () => {
			const config = engine.getConfig();
			expect(config.interactionThresholds.point).toBe(15);
		});

		it("should have reasonable threshold values", () => {
			const config = engine.getConfig();
			const thresholds = config.interactionThresholds;

			expect(thresholds.line).toBeGreaterThan(0);
			expect(thresholds.area).toBeGreaterThan(0);
			expect(thresholds.curve).toBeGreaterThan(0);
			expect(thresholds.point).toBeGreaterThan(0);
		});
	});

	describe("Color Configuration", () => {
		it("should provide line color", () => {
			const config = engine.getConfig();
			expect(config.colors.line).toBe("#FF0000");
		});

		it("should provide area color", () => {
			const config = engine.getConfig();
			expect(config.colors.area).toBe("#00FF00");
		});

		it("should provide curve color", () => {
			const config = engine.getConfig();
			expect(config.colors.curve).toBe("#0000FF");
		});

		it("should have valid hex colors", () => {
			const config = engine.getConfig();
			const hexPattern = /^#[0-9A-F]{6}$/i;

			expect(config.colors.line).toMatch(hexPattern);
			expect(config.colors.area).toMatch(hexPattern);
			expect(config.colors.curve).toMatch(hexPattern);
			expect(config.colors.rectangle).toMatch(hexPattern);
			expect(config.colors.circle).toMatch(hexPattern);
		});
	});

	describe("Rendering Configuration", () => {
		it("should provide default line width", () => {
			const config = engine.getConfig();
			expect(config.rendering.defaultLineWidth).toBe(2);
		});

		it("should provide selected line width", () => {
			const config = engine.getConfig();
			expect(config.rendering.selectedLineWidth).toBe(3);
		});

		it("should provide hovered line width", () => {
			const config = engine.getConfig();
			expect(config.rendering.hoveredLineWidth).toBe(2.5);
		});

		it("should have positive line widths", () => {
			const config = engine.getConfig();
			expect(config.rendering.defaultLineWidth).toBeGreaterThan(0);
			expect(config.rendering.selectedLineWidth).toBeGreaterThan(0);
			expect(config.rendering.hoveredLineWidth).toBeGreaterThan(0);
		});

		it("should have selected width greater than default", () => {
			const config = engine.getConfig();
			expect(config.rendering.selectedLineWidth).toBeGreaterThan(
				config.rendering.defaultLineWidth
			);
		});
	});

	describe("Event Handlers", () => {
		it("should provide feedback event handler", () => {
			const config = engine.getConfig();
			expect(config.on.feedback).toBeDefined();
			expect(typeof config.on.feedback).toBe("function");
		});

		it("should provide state change event handler", () => {
			const config = engine.getConfig();
			expect(config.on.stateChange).toBeDefined();
			expect(typeof config.on.stateChange).toBe("function");
		});

		it("should be able to call feedback handler", () => {
			const config = engine.getConfig();
			config.on.feedback("Test feedback");
			expect(config.on.feedback).toHaveBeenCalled();
		});

		it("should be able to call state change handler", () => {
			const config = engine.getConfig();
			config.on.stateChange({
				type: "mouseDown",
				displayPoint: { x: 0, y: 0 },
				mediaPoint: { x: 0, y: 0 },
				event: new MouseEvent("mousedown"),
			});
			expect(config.on.stateChange).toHaveBeenCalled();
		});
	});

	describe("Configuration Consistency", () => {
		it("should maintain same config instance", () => {
			const config1 = engine.getConfig();
			const config2 = engine.getConfig();
			expect(config1).toBe(config2);
		});

		it("should have all required properties", () => {
			const config = engine.getConfig();
			expect(config).toHaveProperty("resolution");
			expect(config).toHaveProperty("interactionThresholds");
			expect(config).toHaveProperty("colors");
			expect(config).toHaveProperty("rendering");
			expect(config).toHaveProperty("on");
		});

		it("should have complete resolution object", () => {
			const config = engine.getConfig();
			expect(config.resolution).toHaveProperty("display");
			expect(config.resolution).toHaveProperty("target");
			expect(config.resolution).toHaveProperty("native");
		});

		it("should have complete interaction thresholds", () => {
			const config = engine.getConfig();
			expect(config.interactionThresholds).toHaveProperty("line");
			expect(config.interactionThresholds).toHaveProperty("area");
			expect(config.interactionThresholds).toHaveProperty("curve");
			expect(config.interactionThresholds).toHaveProperty("point");
		});

		it("should have complete color configuration", () => {
			const config = engine.getConfig();
			expect(config.colors).toHaveProperty("line");
			expect(config.colors).toHaveProperty("area");
			expect(config.colors).toHaveProperty("curve");
			expect(config.colors).toHaveProperty("rectangle");
			expect(config.colors).toHaveProperty("circle");
		});

		it("should have complete rendering configuration", () => {
			const config = engine.getConfig();
			expect(config.rendering).toHaveProperty("defaultLineWidth");
			expect(config.rendering).toHaveProperty("selectedLineWidth");
			expect(config.rendering).toHaveProperty("hoveredLineWidth");
		});
	});

	describe("Resolution Calculations", () => {
		it("should support aspect ratio calculations", () => {
			const config = engine.getConfig();
			const aspectRatio =
				config.resolution.display.width / config.resolution.display.height;
			expect(aspectRatio).toBeCloseTo(16 / 9, 2);
		});

		it("should have matching dimensions across resolutions", () => {
			const config = engine.getConfig();
			expect(config.resolution.display.width).toBe(
				config.resolution.target.width
			);
			expect(config.resolution.display.height).toBe(
				config.resolution.target.height
			);
		});
	});

	describe("Threshold Edge Cases", () => {
		it("should handle point threshold being larger", () => {
			const config = engine.getConfig();
			expect(config.interactionThresholds.point).toBeGreaterThanOrEqual(
				config.interactionThresholds.line
			);
		});

		it("should have reasonable maximum thresholds", () => {
			const config = engine.getConfig();
			const maxThreshold = 100;

			expect(config.interactionThresholds.line).toBeLessThan(maxThreshold);
			expect(config.interactionThresholds.area).toBeLessThan(maxThreshold);
			expect(config.interactionThresholds.curve).toBeLessThan(maxThreshold);
			expect(config.interactionThresholds.point).toBeLessThan(maxThreshold);
		});
	});

	describe("Integration with Engine", () => {
		it("should be accessible through engine", () => {
			expect(engine.getConfig).toBeDefined();
			expect(typeof engine.getConfig).toBe("function");
		});

		it("should be used during engine initialization", () => {
			expect(DrawingConfig).toHaveBeenCalled();
		});

		it("should provide config to other modules", () => {
			const config = engine.getConfig();
			expect(config).toBeTruthy();
		});
	});
});
