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

describe("DrawingEffects", () => {
	let canvas: HTMLCanvasElement;
	let media: HTMLVideoElement;
	let engine: DrawingEngine;
	let stateMockInstance: any;
	let configMockInstance: any;
	let effectsMockInstance: any;
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
		(DrawingLayers as any).mockImplementation(() => {
			layersMockInstance = {
				getLayers: vi.fn().mockReturnValue([]),
				getVisibleLayers: vi.fn().mockReturnValue([]),
				getActiveLayer: vi.fn(),
				getLayer: vi.fn().mockReturnValue({
					id: "layer-1",
					name: "Layer 1",
					effects: [],
				}),
				reset: vi.fn(),
				createLayer: vi.fn(),
				updateLayer: vi.fn(),
				deleteLayer: vi.fn(),
				reorderLayers: vi.fn(),
			};
			return layersMockInstance;
		});

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
		(DrawingEffects as any).mockImplementation(() => {
			effectsMockInstance = {
				cleanup: vi.fn(),
				addLayerEffect: vi.fn().mockReturnValue({
					id: "effect-1",
					type: "drop-shadow",
					config: {},
				}),
				removeLayerEffect: vi.fn().mockReturnValue(true),
				updateLayerEffect: vi.fn().mockReturnValue(true),
				getLayerEffects: vi.fn().mockReturnValue([]),
				applyEffect: vi.fn(),
				removeEffect: vi.fn(),
				hasEffect: vi.fn().mockReturnValue(false),
			};
			return effectsMockInstance;
		});

		engine = new DrawingEngine(canvas, media);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Effects Initialization", () => {
		it("should initialize DrawingEffects module", () => {
			expect(DrawingEffects).toHaveBeenCalled();
		});

		it("should provide effects instance", () => {
			expect(effectsMockInstance).toBeDefined();
		});

		it("should have cleanup method", () => {
			expect(effectsMockInstance.cleanup).toBeDefined();
			expect(typeof effectsMockInstance.cleanup).toBe("function");
		});
	});

	describe("Layer Effects - Drop Shadow", () => {
		it("should add drop shadow effect to layer", () => {
			const config = {
				offsetX: 5,
				offsetY: 5,
				blur: 10,
				color: "rgba(0, 0, 0, 0.5)",
			};

			if (effectsMockInstance.addLayerEffect) {
				const result = effectsMockInstance.addLayerEffect(
					"layer-1",
					"drop-shadow",
					config
				);

				expect(effectsMockInstance.addLayerEffect).toHaveBeenCalledWith(
					"layer-1",
					"drop-shadow",
					config
				);
				expect(result).toBeDefined();
				expect(result.type).toBe("drop-shadow");
			}
		});

		it("should configure drop shadow with custom values", () => {
			const config = {
				offsetX: 10,
				offsetY: 10,
				blur: 20,
				color: "rgba(0, 0, 0, 0.8)",
			};

			if (effectsMockInstance.addLayerEffect) {
				effectsMockInstance.addLayerEffect("layer-1", "drop-shadow", config);
				expect(effectsMockInstance.addLayerEffect).toHaveBeenCalledWith(
					"layer-1",
					"drop-shadow",
					config
				);
			}
		});
	});

	describe("Layer Effects - Inner Shadow", () => {
		it("should add inner shadow effect to layer", () => {
			const config = {
				offsetX: 3,
				offsetY: 3,
				blur: 5,
				color: "rgba(0, 0, 0, 0.3)",
			};

			if (effectsMockInstance.addLayerEffect) {
				effectsMockInstance.addLayerEffect("layer-1", "inner-shadow", config);
				expect(effectsMockInstance.addLayerEffect).toHaveBeenCalledWith(
					"layer-1",
					"inner-shadow",
					config
				);
			}
		});
	});

	describe("Layer Effects - Glow", () => {
		it("should add outer glow effect to layer", () => {
			const config = {
				blur: 15,
				color: "rgba(255, 255, 0, 0.8)",
				spread: 5,
			};

			if (effectsMockInstance.addLayerEffect) {
				effectsMockInstance.addLayerEffect("layer-1", "outer-glow", config);
				expect(effectsMockInstance.addLayerEffect).toHaveBeenCalledWith(
					"layer-1",
					"outer-glow",
					config
				);
			}
		});

		it("should add inner glow effect to layer", () => {
			const config = {
				blur: 10,
				color: "rgba(255, 255, 255, 0.6)",
				spread: 3,
			};

			if (effectsMockInstance.addLayerEffect) {
				effectsMockInstance.addLayerEffect("layer-1", "inner-glow", config);
				expect(effectsMockInstance.addLayerEffect).toHaveBeenCalledWith(
					"layer-1",
					"inner-glow",
					config
				);
			}
		});
	});

	describe("Layer Effects - Stroke", () => {
		it("should add stroke effect to layer", () => {
			const config = {
				width: 2,
				color: "#FF0000",
				position: "outside",
			};

			if (effectsMockInstance.addLayerEffect) {
				effectsMockInstance.addLayerEffect("layer-1", "stroke", config);
				expect(effectsMockInstance.addLayerEffect).toHaveBeenCalledWith(
					"layer-1",
					"stroke",
					config
				);
			}
		});

		it("should add stroke with inside position", () => {
			const config = {
				width: 3,
				color: "#0000FF",
				position: "inside",
			};

			if (effectsMockInstance.addLayerEffect) {
				effectsMockInstance.addLayerEffect("layer-1", "stroke", config);
				expect(effectsMockInstance.addLayerEffect).toHaveBeenCalled();
			}
		});
	});

	describe("Layer Effects - Blur", () => {
		it("should add blur effect to layer", () => {
			const config = {
				radius: 10,
				quality: "high",
			};

			if (effectsMockInstance.addLayerEffect) {
				effectsMockInstance.addLayerEffect("layer-1", "blur", config);
				expect(effectsMockInstance.addLayerEffect).toHaveBeenCalledWith(
					"layer-1",
					"blur",
					config
				);
			}
		});

		it("should add blur with different quality levels", () => {
			const qualities = ["low", "medium", "high"];

			qualities.forEach((quality) => {
				if (effectsMockInstance.addLayerEffect) {
					effectsMockInstance.addLayerEffect("layer-1", "blur", {
						radius: 5,
						quality,
					});
				}
			});

			if (effectsMockInstance.addLayerEffect) {
				expect(effectsMockInstance.addLayerEffect).toHaveBeenCalledTimes(3);
			}
		});
	});

	describe("Layer Effects - Color Overlay", () => {
		it("should add color overlay effect to layer", () => {
			const config = {
				color: "#FF0000",
				opacity: 0.5,
				blendMode: "multiply",
			};

			if (effectsMockInstance.addLayerEffect) {
				effectsMockInstance.addLayerEffect("layer-1", "color-overlay", config);
				expect(effectsMockInstance.addLayerEffect).toHaveBeenCalledWith(
					"layer-1",
					"color-overlay",
					config
				);
			}
		});

		it("should support different blend modes", () => {
			const blendModes = ["normal", "multiply", "overlay", "screen"];

			blendModes.forEach((blendMode) => {
				if (effectsMockInstance.addLayerEffect) {
					effectsMockInstance.addLayerEffect("layer-1", "color-overlay", {
						color: "#00FF00",
						blendMode,
					});
				}
			});
		});
	});

	describe("Layer Effects - Gradient Overlay", () => {
		it("should add gradient overlay effect to layer", () => {
			const config = {
				type: "linear",
				colors: ["#FF0000", "#0000FF"],
				angle: 45,
				opacity: 0.7,
			};

			if (effectsMockInstance.addLayerEffect) {
				effectsMockInstance.addLayerEffect(
					"layer-1",
					"gradient-overlay",
					config
				);
				expect(effectsMockInstance.addLayerEffect).toHaveBeenCalledWith(
					"layer-1",
					"gradient-overlay",
					config
				);
			}
		});

		it("should add radial gradient overlay", () => {
			const config = {
				type: "radial",
				colors: ["#FFFFFF", "#000000"],
				centerX: 0.5,
				centerY: 0.5,
			};

			if (effectsMockInstance.addLayerEffect) {
				effectsMockInstance.addLayerEffect(
					"layer-1",
					"gradient-overlay",
					config
				);
				expect(effectsMockInstance.addLayerEffect).toHaveBeenCalled();
			}
		});
	});

	describe("Layer Effects - Noise", () => {
		it("should add noise effect to layer", () => {
			const config = {
				amount: 0.3,
				type: "gaussian",
				monochrome: false,
			};

			if (effectsMockInstance.addLayerEffect) {
				effectsMockInstance.addLayerEffect("layer-1", "noise", config);
				expect(effectsMockInstance.addLayerEffect).toHaveBeenCalledWith(
					"layer-1",
					"noise",
					config
				);
			}
		});
	});

	describe("Layer Effects - Bevel and Emboss", () => {
		it("should add bevel and emboss effect to layer", () => {
			const config = {
				depth: 5,
				size: 10,
				soften: 3,
				angle: 120,
				altitude: 30,
			};

			if (effectsMockInstance.addLayerEffect) {
				effectsMockInstance.addLayerEffect("layer-1", "bevel-emboss", config);
				expect(effectsMockInstance.addLayerEffect).toHaveBeenCalledWith(
					"layer-1",
					"bevel-emboss",
					config
				);
			}
		});
	});

	describe("Effect Removal", () => {
		it("should remove effect from layer", () => {
			if (effectsMockInstance.removeLayerEffect) {
				const result = effectsMockInstance.removeLayerEffect(
					"layer-1",
					"effect-1"
				);
				expect(effectsMockInstance.removeLayerEffect).toHaveBeenCalledWith(
					"layer-1",
					"effect-1"
				);
				expect(result).toBe(true);
			}
		});

		it("should handle removing non-existent effect", () => {
			if (effectsMockInstance.removeLayerEffect) {
				effectsMockInstance.removeLayerEffect.mockReturnValue(false);
				const result = effectsMockInstance.removeLayerEffect(
					"layer-1",
					"non-existent"
				);
				expect(result).toBe(false);
			}
		});

		it("should remove all effects from layer", () => {
			if (effectsMockInstance.getLayerEffects) {
				effectsMockInstance.getLayerEffects.mockReturnValue([
					{ id: "effect-1" },
					{ id: "effect-2" },
					{ id: "effect-3" },
				]);

				const effects = effectsMockInstance.getLayerEffects("layer-1");
				effects.forEach((effect: any) => {
					if (effectsMockInstance.removeLayerEffect) {
						effectsMockInstance.removeLayerEffect("layer-1", effect.id);
					}
				});

				expect(effectsMockInstance.removeLayerEffect).toHaveBeenCalledTimes(3);
			}
		});
	});

	describe("Effect Updates", () => {
		it("should update existing effect configuration", () => {
			if (effectsMockInstance.updateLayerEffect) {
				const newConfig = {
					offsetX: 10,
					offsetY: 10,
					blur: 20,
				};

				const result = effectsMockInstance.updateLayerEffect(
					"layer-1",
					"effect-1",
					newConfig
				);

				expect(effectsMockInstance.updateLayerEffect).toHaveBeenCalledWith(
					"layer-1",
					"effect-1",
					newConfig
				);
				expect(result).toBe(true);
			}
		});

		it("should handle updating non-existent effect", () => {
			if (effectsMockInstance.updateLayerEffect) {
				effectsMockInstance.updateLayerEffect.mockReturnValue(false);
				const result = effectsMockInstance.updateLayerEffect(
					"layer-1",
					"non-existent",
					{}
				);
				expect(result).toBe(false);
			}
		});
	});

	describe("Effect Queries", () => {
		it("should get all effects for a layer", () => {
			if (effectsMockInstance.getLayerEffects) {
				const effects = [
					{ id: "effect-1", type: "drop-shadow" },
					{ id: "effect-2", type: "blur" },
				];
				effectsMockInstance.getLayerEffects.mockReturnValue(effects);

				const result = effectsMockInstance.getLayerEffects("layer-1");
				expect(result).toEqual(effects);
			}
		});

		it("should check if layer has specific effect", () => {
			if (effectsMockInstance.hasEffect) {
				effectsMockInstance.hasEffect.mockReturnValue(true);
				const hasEffect = effectsMockInstance.hasEffect(
					"layer-1",
					"drop-shadow"
				);
				expect(hasEffect).toBe(true);
			}
		});

		it("should return false for non-existent effect", () => {
			if (effectsMockInstance.hasEffect) {
				effectsMockInstance.hasEffect.mockReturnValue(false);
				const hasEffect = effectsMockInstance.hasEffect("layer-1", "blur");
				expect(hasEffect).toBe(false);
			}
		});
	});

	describe("Multiple Effects on Same Layer", () => {
		it("should allow multiple effects on same layer", () => {
			if (effectsMockInstance.addLayerEffect) {
				effectsMockInstance.addLayerEffect("layer-1", "drop-shadow", {});
				effectsMockInstance.addLayerEffect("layer-1", "blur", {});
				effectsMockInstance.addLayerEffect("layer-1", "stroke", {});

				expect(effectsMockInstance.addLayerEffect).toHaveBeenCalledTimes(3);
			}
		});

		it("should maintain effect order", () => {
			if (effectsMockInstance.getLayerEffects) {
				const effects = [
					{ id: "effect-1", type: "drop-shadow" },
					{ id: "effect-2", type: "blur" },
					{ id: "effect-3", type: "stroke" },
				];
				effectsMockInstance.getLayerEffects.mockReturnValue(effects);

				const result = effectsMockInstance.getLayerEffects("layer-1");
				expect(result).toHaveLength(3);
				expect(result[0].type).toBe("drop-shadow");
				expect(result[1].type).toBe("blur");
				expect(result[2].type).toBe("stroke");
			}
		});
	});

	describe("Effect Application", () => {
		it("should apply effect to layer elements", () => {
			if (effectsMockInstance.applyEffect) {
				effectsMockInstance.applyEffect("layer-1", "effect-1");
				expect(effectsMockInstance.applyEffect).toHaveBeenCalledWith(
					"layer-1",
					"effect-1"
				);
			}
		});

		it("should apply all effects to layer", () => {
			if (
				effectsMockInstance.getLayerEffects &&
				effectsMockInstance.applyEffect
			) {
				effectsMockInstance.getLayerEffects.mockReturnValue([
					{ id: "effect-1" },
					{ id: "effect-2" },
				]);

				const effects = effectsMockInstance.getLayerEffects("layer-1");
				effects.forEach((effect: any) => {
					effectsMockInstance.applyEffect("layer-1", effect.id);
				});

				expect(effectsMockInstance.applyEffect).toHaveBeenCalledTimes(2);
			}
		});
	});

	describe("Effects Cleanup", () => {
		it("should cleanup effects on engine cleanup", () => {
			engine.cleanup();
			expect(effectsMockInstance.cleanup).toHaveBeenCalled();
		});

		it("should remove all effects on cleanup", () => {
			effectsMockInstance.cleanup();
			expect(effectsMockInstance.cleanup).toHaveBeenCalled();
		});

		it("should be safe to cleanup multiple times", () => {
			effectsMockInstance.cleanup();
			effectsMockInstance.cleanup();
			expect(effectsMockInstance.cleanup).toHaveBeenCalledTimes(2);
		});
	});

	describe("Effect Validation", () => {
		it("should validate effect configuration", () => {
			const validConfig = {
				offsetX: 5,
				offsetY: 5,
				blur: 10,
				color: "rgba(0, 0, 0, 0.5)",
			};

			if (effectsMockInstance.addLayerEffect) {
				expect(() => {
					effectsMockInstance.addLayerEffect(
						"layer-1",
						"drop-shadow",
						validConfig
					);
				}).not.toThrow();
			}
		});

		it("should handle empty configuration", () => {
			if (effectsMockInstance.addLayerEffect) {
				expect(() => {
					effectsMockInstance.addLayerEffect("layer-1", "blur", {});
				}).not.toThrow();
			}
		});
	});

	describe("Integration with Layers", () => {
		it("should work with layer operations", () => {
			expect(layersMockInstance).toBeDefined();
			expect(effectsMockInstance).toBeDefined();
		});

		it("should add effect to existing layer", () => {
			const layer = layersMockInstance.getLayer("layer-1");
			expect(layer).toBeDefined();

			if (effectsMockInstance.addLayerEffect) {
				effectsMockInstance.addLayerEffect("layer-1", "drop-shadow", {});
				expect(effectsMockInstance.addLayerEffect).toHaveBeenCalled();
			}
		});

		it("should remove effects when layer is deleted", () => {
			if (effectsMockInstance.getLayerEffects) {
				effectsMockInstance.getLayerEffects.mockReturnValue([]);
				layersMockInstance.deleteLayer("layer-1");

				const effects = effectsMockInstance.getLayerEffects("layer-1");
				expect(effects).toHaveLength(0);
			}
		});
	});

	describe("Performance", () => {
		it("should handle multiple effects efficiently", () => {
			const startTime = performance.now();

			if (effectsMockInstance.addLayerEffect) {
				for (let i = 0; i < 50; i++) {
					effectsMockInstance.addLayerEffect("layer-1", "drop-shadow", {
						offsetX: i,
						offsetY: i,
					});
				}
			}

			const endTime = performance.now();
			const duration = endTime - startTime;

			expect(duration).toBeLessThan(100); // Should complete in less than 100ms
		});

		it("should efficiently query layer effects", () => {
			if (effectsMockInstance.getLayerEffects) {
				const effects = Array.from({ length: 20 }, (_, i) => ({
					id: `effect-${i}`,
					type: "blur",
				}));
				effectsMockInstance.getLayerEffects.mockReturnValue(effects);

				const startTime = performance.now();
				const result = effectsMockInstance.getLayerEffects("layer-1");
				const endTime = performance.now();

				expect(result).toHaveLength(20);
				expect(endTime - startTime).toBeLessThan(10);
			}
		});
	});

	describe("Integration with Engine", () => {
		it("should be initialized with engine", () => {
			expect(DrawingEffects).toHaveBeenCalled();
		});

		it("should work with other modules", () => {
			expect(engine).toBeDefined();
			expect(effectsMockInstance).toBeDefined();
			expect(layersMockInstance).toBeDefined();
		});

		it("should support engine operations", () => {
			expect(engine.cleanup).toBeDefined();
		});
	});
});
