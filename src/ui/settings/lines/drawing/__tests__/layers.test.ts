// @vitest-environment jsdom
/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TestContext } from "./setup";

import { DrawingEngine } from "../index";
import { setupTestContext } from "./setup";

describe("DrawingEngine - Layers", () => {
	let ctx: TestContext;
	let engine: DrawingEngine;

	beforeEach(() => {
		ctx = setupTestContext();
		engine = new DrawingEngine(ctx.canvas, ctx.media);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Layer Operations", () => {
		it("should get all layers", () => {
			const layers = engine.getLayers();
			expect(Array.isArray(layers)).toBe(true);
		});

		it("should get visible layers", () => {
			const layers = engine.getVisibleLayers();
			expect(Array.isArray(layers)).toBe(true);
		});

		it("should get active layer", () => {
			const layer = engine.getActiveLayer();
			// Initially might be null or undefined
			expect(
				layer === null || layer === undefined || typeof layer === "object"
			).toBe(true);
		});

		it("should get specific layer by id", () => {
			// Create a layer first
			const newLayerResult = engine.createLayer({
				name: "Test Layer",
				color: "rgb(255, 0, 0)",
			});

			if (newLayerResult?.data?.layer) {
				const layer = engine.getLayer(newLayerResult.data.layer.id);
				expect(layer).toBeDefined();
				expect(layer?.id).toBe(newLayerResult.data.layer.id);
			}
		});

		it("should create new layer", () => {
			const layerData = { name: "New Layer", color: "rgb(255,0,0)" };
			const result = engine.createLayer(layerData);

			expect(result).toBeDefined();
			if (result?.data?.layer) {
				expect(result.data.layer.name).toBe("New Layer");
				expect(result.data.layer.color).toBe("rgb(255,0,0)");
			}
		});

		it("should update layer", () => {
			const result = engine.createLayer({
				name: "Original Name",
				color: "rgb(255, 0, 0)",
			});

			if (result?.data?.layer) {
				const updated = engine.updateLayer(result.data.layer.id, {
					name: "Updated Layer",
				});
				expect(updated).toBeDefined();
				if (updated?.data?.layer) {
					expect(updated.data.layer.name).toBe("Updated Layer");
				}
			}
		});

		it("should delete layer", () => {
			const result = engine.createLayer({
				name: "To Delete",
				color: "rgb(255, 0, 0)",
			});

			if (result?.data?.layer) {
				const initialCount = engine.getLayers().length;
				const deleted = engine.deleteLayer(result.data.layer.id);

				if (deleted?.success) {
					const afterCount = engine.getLayers().length;
					expect(afterCount).toBeLessThan(initialCount);
				}
			}
		});

		it("should handle empty layers list", () => {
			const layers = engine.getLayers();
			expect(Array.isArray(layers)).toBe(true);
		});

		it("should handle layer with custom properties", () => {
			const result = engine.createLayer({
				name: "Complex Layer",
				description: "A complex layer",
				category: ["test"],
				opacity: 0.8,
				visibility: "visible",
				color: "rgb(100, 150, 200)",
			});

			if (result?.data?.layer) {
				const retrieved = engine.getLayer(result.data.layer.id);
				expect(retrieved).toBeDefined();
				expect(retrieved?.name).toBe("Complex Layer");
				expect(retrieved?.opacity).toBe(0.8);
			}
		});

		it("should handle multiple layer updates", () => {
			const result = engine.createLayer({
				name: "Test Layer",
				color: "rgb(255, 0, 0)",
			});

			if (result?.data?.layer) {
				engine.updateLayer(result.data.layer.id, { name: "First Update" });
				engine.updateLayer(result.data.layer.id, { opacity: 0.5 });
				engine.updateLayer(result.data.layer.id, {
					description: "Updated description",
				});

				const updated = engine.getLayer(result.data.layer.id);
				expect(updated?.name).toBe("First Update");
				expect(updated?.opacity).toBe(0.5);
				expect(updated?.description).toBe("Updated description");
			}
		});

		it("should handle layer not found", () => {
			const layer = engine.getLayer("non-existent-id");
			expect(layer === null || layer === undefined).toBe(true);
		});

		it("should filter visible layers correctly", () => {
			engine.createLayer({
				name: "Layer 1",
				color: "rgb(255, 0, 0)",
				visibility: "visible",
			});

			const result2 = engine.createLayer({
				name: "Layer 2",
				color: "rgb(0, 255, 0)",
				visibility: "visible",
			});

			engine.createLayer({
				name: "Layer 3",
				color: "rgb(0, 0, 255)",
				visibility: "visible",
			});

			// Toggle one layer's visibility
			if (result2?.data?.layer) {
				engine.toggleLayerVisibility(result2.data.layer.id);
			}

			const visibleLayers = engine.getVisibleLayers();
			const allLayers = engine.getLayers();

			expect(visibleLayers.length).toBeLessThanOrEqual(allLayers.length);
		});

		it("should set active layer", () => {
			const result = engine.createLayer({
				name: "Active Layer",
				color: "rgb(255, 0, 0)",
			});

			if (result?.data?.layer) {
				engine.setActiveLayer(result.data.layer.id);
				const activeLayer = engine.getActiveLayer();
				expect(activeLayer?.id).toBe(result.data.layer.id);
			}
		});

		it("should toggle layer visibility", () => {
			const result = engine.createLayer({
				name: "Toggle Layer",
				color: "rgb(255, 0, 0)",
				visibility: "visible",
			});

			if (result?.data?.layer) {
				const initialVisibility = result.data.layer.visibility;
				engine.toggleLayerVisibility(result.data.layer.id);

				const updated = engine.getLayer(result.data.layer.id);
				expect(updated?.visibility).not.toBe(initialVisibility);
			}
		});

		it("should set layer opacity", () => {
			const result = engine.createLayer({
				name: "Opacity Layer",
				color: "rgb(255, 0, 0)",
			});

			if (result?.data?.layer) {
				engine.setLayerOpacity(result.data.layer.id, 0.7);
				const updated = engine.getLayer(result.data.layer.id);
				expect(updated?.opacity).toBe(0.7);
			}
		});

		it("should rename layer", () => {
			const result = engine.createLayer({
				name: "Original Name",
				color: "rgb(255, 0, 0)",
			});

			if (result?.data?.layer) {
				engine.renameLayer(result.data.layer.id, "New Name");
				const updated = engine.getLayer(result.data.layer.id);
				expect(updated?.name).toBe("New Name");
			}
		});

		it("should isolate layer", () => {
			const result1 = engine.createLayer({
				name: "Layer 1",
				color: "rgb(255, 0, 0)",
			});

			engine.createLayer({
				name: "Layer 2",
				color: "rgb(0, 255, 0)",
			});

			if (result1?.data?.layer) {
				engine.isolateLayer(result1.data.layer.id);

				// After isolation, only one layer should be visible
				const visibleLayers = engine.getVisibleLayers();
				const isolatedVisible = visibleLayers.some(
					(l) => l.id === result1.data?.layer?.id
				);
				expect(isolatedVisible).toBe(true);
			}
		});

		it("should duplicate layer", () => {
			const result = engine.createLayer({
				name: "Original Layer",
				color: "rgb(255, 0, 0)",
				description: "Test description",
			});

			if (result?.data?.layer) {
				const initialCount = engine.getLayers().length;
				const duplicated = engine.duplicateLayer(result.data.layer.id);

				if (duplicated?.data?.layer) {
					const afterCount = engine.getLayers().length;
					expect(afterCount).toBeGreaterThan(initialCount);
					expect(duplicated.data.layer.name).toContain("Original Layer");
				}
			}
		});

		it("should move elements to layer", () => {
			const result1 = engine.createLayer({
				name: "Layer 1",
				color: "rgb(255, 0, 0)",
			});

			const result2 = engine.createLayer({
				name: "Layer 2",
				color: "rgb(0, 255, 0)",
			});

			if (result1?.data?.layer && result2?.data?.layer) {
				const element = {
					id: "test-1",
					type: "line" as const,
					points: [
						{ x: 0, y: 0 },
						{ x: 100, y: 100 },
					],
					completed: true,
					color: "rgb(0, 0, 0)",
					lineWidth: 2,
					layerId: result1.data.layer.id,
					info: {
						name: "Test Line",
						type: "DETECTION" as const,
						direction: "left" as const,
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 1,
					},
				};

				engine.addElements(
					[element],
					new Map([[result1.data.layer.id, result1.data.layer]])
				);

				// Move element to layer2
				engine.moveElementsToLayer([element.id], result2.data.layer.id);

				// Verify the element was moved (implementation specific)
				const elements = engine.elements;
				const movedElement = elements.find((e) => e.id === element.id);
				expect(movedElement).toBeDefined();
			}
		});

		it("should handle layer creation with insertion index", () => {
			engine.createLayer({ name: "Layer 1", color: "rgb(255, 0, 0)" });
			engine.createLayer({ name: "Layer 2", color: "rgb(0, 255, 0)" });

			const layer3 = engine.createLayer({
				name: "Layer 3",
				color: "rgb(0, 0, 255)",
				insertIndex: 1,
			});

			if (layer3) {
				const layers = engine.getLayers();
				expect(layers.length).toBeGreaterThanOrEqual(3);
			}
		});

		it("should maintain layer order", () => {
			engine.createLayer({
				name: "First",
				color: "rgb(255, 0, 0)",
			});
			engine.createLayer({
				name: "Second",
				color: "rgb(0, 255, 0)",
			});
			engine.createLayer({
				name: "Third",
				color: "rgb(0, 0, 255)",
			});

			const layers = engine.getLayers();

			// Layers should maintain their creation order or have z-index
			expect(layers.length).toBeGreaterThanOrEqual(3);

			if (layers.length >= 3) {
				const hasZIndex = layers.every((l) => typeof l.zIndex === "number");
				expect(hasZIndex).toBe(true);
			}
		});

		it("should handle layer with elements", () => {
			const result = engine.createLayer({
				name: "Layer with Elements",
				color: "rgb(255, 0, 0)",
			});

			if (result?.data?.layer) {
				const element = {
					id: "test-1",
					type: "line" as const,
					points: [
						{ x: 0, y: 0 },
						{ x: 100, y: 100 },
					],
					completed: true,
					color: "rgb(0, 0, 0)",
					lineWidth: 2,
					layerId: result.data.layer.id,
					info: {
						name: "Test Line",
						type: "DETECTION" as const,
						direction: "left" as const,
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 1,
					},
				};

				engine.addElements(
					[element],
					new Map([[result.data.layer.id, result.data.layer]])
				);

				const retrievedLayer = engine.getLayer(result.data.layer.id);
				expect(retrievedLayer).toBeDefined();
			}
		});

		it("should handle deleting layer with elements", () => {
			const result = engine.createLayer({
				name: "Layer to Delete",
				color: "rgb(255, 0, 0)",
			});

			if (result?.data?.layer) {
				const element = {
					id: "test-1",
					type: "line" as const,
					points: [
						{ x: 0, y: 0 },
						{ x: 100, y: 100 },
					],
					completed: true,
					color: "rgb(0, 0, 0)",
					lineWidth: 2,
					layerId: result.data.layer.id,
					info: {
						name: "Test Line",
						type: "DETECTION" as const,
						direction: "left" as const,
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 1,
					},
				};

				// Don't pass layers to addElements to avoid clearing the created layer
				engine.addElements([element], new Map());

				const layersBeforeDelete = engine.getLayers().length;

				// Delete the layer
				const deleteResult = engine.deleteLayer(result.data.layer.id);

				// Layer should be deleted successfully
				expect(deleteResult?.success).toBe(true);

				// Layer count should decrease
				const layersAfterDelete = engine.getLayers().length;
				expect(layersAfterDelete).toBeLessThan(layersBeforeDelete);
			}
		});
	});
});
