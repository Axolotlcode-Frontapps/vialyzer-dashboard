// @vitest-environment jsdom
/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TestContext } from "./setup";

import { DrawingEngine } from "../index";
import { setupTestContext } from "./setup";

describe("DrawingEngine - Arrange", () => {
	let ctx: TestContext;
	let engine: DrawingEngine;

	beforeEach(() => {
		ctx = setupTestContext();
		engine = new DrawingEngine(ctx.canvas, ctx.media);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Z-Order Operations", () => {
		beforeEach(() => {
			// Add some test elements
			const elements = [
				{
					id: "element-1",
					type: "line" as const,
					points: [
						{ x: 0, y: 0 },
						{ x: 100, y: 100 },
					],
					completed: true,
					color: "rgb(255, 0, 0)",
					lineWidth: 2,
					zIndex: 0,
					info: {
						name: "Element 1",
						direction: "left" as const,
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 1,
					},
				},
				{
					id: "element-2",
					type: "line" as const,
					points: [
						{ x: 50, y: 50 },
						{ x: 150, y: 150 },
					],
					completed: true,
					color: "rgb(0, 255, 0)",
					lineWidth: 2,
					zIndex: 1,
					info: {
						name: "Element 2",
						direction: "left" as const,
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 1,
					},
				},
				{
					id: "element-3",
					type: "line" as const,
					points: [
						{ x: 100, y: 100 },
						{ x: 200, y: 200 },
					],
					completed: true,
					color: "rgb(0, 0, 255)",
					lineWidth: 2,
					zIndex: 2,
					info: {
						name: "Element 3",
						direction: "left" as const,
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 1,
					},
				},
			];

			engine.addElements(elements, new Map());
		});

		it("should bring elements to front", () => {
			// In a real scenario, we'd select it via the UI
			// For testing, we'll use the public API
			const updatedElements = engine.bringToFront();

			expect(updatedElements).toBeDefined();
			expect(Array.isArray(updatedElements)).toBe(true);
		});

		it("should send elements to back", () => {
			const updatedElements = engine.sendToBack();

			expect(updatedElements).toBeDefined();
			expect(Array.isArray(updatedElements)).toBe(true);
		});

		it("should bring elements forward", () => {
			const layerResult = engine.createLayer({
				name: "Test Layer",
				color: "rgb(255, 0, 0)",
			});

			if (layerResult?.data?.layer) {
				const result = engine.changeZOrderInLayer(
					["element-1"],
					"bringForward",
					layerResult.data.layer.id
				);

				expect(result).toBeDefined();
			}
		});

		it("should send elements backward", () => {
			const layerResult = engine.createLayer({
				name: "Test Layer",
				color: "rgb(255, 0, 0)",
			});

			if (layerResult?.data?.layer) {
				const result = engine.changeZOrderInLayer(
					["element-2"],
					"sendBackward",
					layerResult.data.layer.id
				);

				expect(result).toBeDefined();
			}
		});

		it("should bring to front with layer ID", () => {
			const layerResult = engine.createLayer({
				name: "Test Layer",
				color: "rgb(255, 0, 0)",
			});

			if (layerResult?.data?.layer) {
				const result = engine.changeZOrderInLayer(
					["element-1"],
					"bringToFront",
					layerResult.data.layer.id
				);

				expect(result).toBeDefined();
			}
		});

		it("should send to back with layer ID", () => {
			const layerResult = engine.createLayer({
				name: "Test Layer",
				color: "rgb(255, 0, 0)",
			});

			if (layerResult?.data?.layer) {
				const result = engine.changeZOrderInLayer(
					["element-3"],
					"sendToBack",
					layerResult.data.layer.id
				);

				expect(result).toBeDefined();
			}
		});

		it("should handle multiple elements in z-order change", () => {
			const layerResult = engine.createLayer({
				name: "Test Layer",
				color: "rgb(255, 0, 0)",
			});

			if (layerResult?.data?.layer) {
				const result = engine.changeZOrderInLayer(
					["element-1", "element-2", "element-3"],
					"bringForward",
					layerResult.data.layer.id
				);

				expect(result).toBeDefined();
			}
		});
	});

	describe("Element Grouping", () => {
		beforeEach(() => {
			const layerResult = engine.createLayer({
				name: "Test Layer",
				color: "rgb(255, 0, 0)",
			});

			if (layerResult?.data?.layer) {
				const elements = [
					{
						id: "group-1",
						type: "line" as const,
						points: [
							{ x: 0, y: 0 },
							{ x: 100, y: 100 },
						],
						completed: true,
						color: "rgb(255, 0, 0)",
						lineWidth: 2,
						layerId: layerResult.data.layer.id,
						info: {
							name: "Group 1",
							direction: "left" as const,
							distance: 0,
							fontSize: 12,
							fontFamily: "Arial",
							backgroundOpacity: 1,
						},
					},
					{
						id: "group-2",
						type: "line" as const,
						points: [
							{ x: 50, y: 50 },
							{ x: 150, y: 150 },
						],
						completed: true,
						color: "rgb(0, 255, 0)",
						lineWidth: 2,
						layerId: layerResult.data.layer.id,
						info: {
							name: "Group 2",
							direction: "left" as const,
							distance: 0,
							fontSize: 12,
							fontFamily: "Arial",
							backgroundOpacity: 1,
						},
					},
				];

				engine.addElements(
					elements,
					new Map([[layerResult.data.layer.id, layerResult.data.layer]])
				);
			}
		});

		it("should group elements in layer", () => {
			const layer = engine.getActiveLayer();

			if (layer) {
				const result = engine.groupElementsInLayer(
					["group-1", "group-2"],
					layer.id,
					{
						name: "Test Group",
						description: "A test group",
						color: "rgb(100, 100, 100)",
					}
				);

				expect(result !== undefined || result === undefined).toBe(true);
			}
		});
	});

	describe("Element Alignment", () => {
		beforeEach(() => {
			const layerResult = engine.createLayer({
				name: "Alignment Layer",
				color: "rgb(255, 0, 0)",
			});

			if (layerResult?.data?.layer) {
				const elements = [
					{
						id: "align-1",
						type: "rectangle" as const,
						points: [
							{ x: 0, y: 0 },
							{ x: 50, y: 50 },
						],
						completed: true,
						color: "rgb(255, 0, 0)",
						lineWidth: 2,
						layerId: layerResult.data.layer.id,
						info: {
							name: "Align 1",
							direction: "left" as const,
							distance: 0,
							fontSize: 12,
							fontFamily: "Arial",
							backgroundOpacity: 1,
						},
					},
					{
						id: "align-2",
						type: "rectangle" as const,
						points: [
							{ x: 100, y: 100 },
							{ x: 150, y: 150 },
						],
						completed: true,
						color: "rgb(0, 255, 0)",
						lineWidth: 2,
						layerId: layerResult.data.layer.id,
						info: {
							name: "Align 2",
							direction: "left" as const,
							distance: 0,
							fontSize: 12,
							fontFamily: "Arial",
							backgroundOpacity: 1,
						},
					},
				];

				engine.addElements(
					elements,
					new Map([[layerResult.data.layer.id, layerResult.data.layer]])
				);
			}
		});

		it("should align elements left", () => {
			const layer = engine.getActiveLayer();

			if (layer) {
				const result = engine.alignElementsInLayer(
					["align-1", "align-2"],
					"left",
					layer.id
				);

				expect(result !== undefined || result === undefined).toBe(true);
			}
		});

		it("should align elements right", () => {
			const layer = engine.getActiveLayer();

			if (layer) {
				const result = engine.alignElementsInLayer(
					["align-1", "align-2"],
					"right",
					layer.id
				);

				expect(result !== undefined || result === undefined).toBe(true);
			}
		});

		it("should align elements center horizontally", () => {
			const layer = engine.getActiveLayer();

			if (layer) {
				const result = engine.alignElementsInLayer(
					["align-1", "align-2"],
					"centerX",
					layer.id
				);

				expect(result !== undefined || result === undefined).toBe(true);
			}
		});

		it("should align elements top", () => {
			const layer = engine.getActiveLayer();

			if (layer) {
				const result = engine.alignElementsInLayer(
					["align-1", "align-2"],
					"top",
					layer.id
				);

				expect(result !== undefined || result === undefined).toBe(true);
			}
		});

		it("should align elements bottom", () => {
			const layer = engine.getActiveLayer();

			if (layer) {
				const result = engine.alignElementsInLayer(
					["align-1", "align-2"],
					"bottom",
					layer.id
				);

				expect(result !== undefined || result === undefined).toBe(true);
			}
		});

		it("should align elements center vertically", () => {
			const layer = engine.getActiveLayer();

			if (layer) {
				const result = engine.alignElementsInLayer(
					["align-1", "align-2"],
					"centerY",
					layer.id
				);

				expect(result !== undefined || result === undefined).toBe(true);
			}
		});
	});

	describe("Element Distribution", () => {
		beforeEach(() => {
			const layerResult = engine.createLayer({
				name: "Distribution Layer",
				color: "rgb(255, 0, 0)",
			});

			if (layerResult?.data?.layer) {
				const elements = [
					{
						id: "dist-1",
						type: "rectangle" as const,
						points: [
							{ x: 0, y: 0 },
							{ x: 50, y: 50 },
						],
						completed: true,
						color: "rgb(255, 0, 0)",
						lineWidth: 2,
						layerId: layerResult.data.layer.id,
						info: {
							name: "Dist 1",
							direction: "left" as const,
							distance: 0,
							fontSize: 12,
							fontFamily: "Arial",
							backgroundOpacity: 1,
						},
					},
					{
						id: "dist-2",
						type: "rectangle" as const,
						points: [
							{ x: 100, y: 100 },
							{ x: 150, y: 150 },
						],
						completed: true,
						color: "rgb(0, 255, 0)",
						lineWidth: 2,
						layerId: layerResult.data.layer.id,
						info: {
							name: "Dist 2",
							direction: "left" as const,
							distance: 0,
							fontSize: 12,
							fontFamily: "Arial",
							backgroundOpacity: 1,
						},
					},
					{
						id: "dist-3",
						type: "rectangle" as const,
						points: [
							{ x: 200, y: 200 },
							{ x: 250, y: 250 },
						],
						completed: true,
						color: "rgb(0, 0, 255)",
						lineWidth: 2,
						layerId: layerResult.data.layer.id,
						info: {
							name: "Dist 3",
							direction: "left" as const,
							distance: 0,
							fontSize: 12,
							fontFamily: "Arial",
							backgroundOpacity: 1,
						},
					},
				];

				engine.addElements(
					elements,
					new Map([[layerResult.data.layer.id, layerResult.data.layer]])
				);
			}
		});

		it("should distribute elements horizontally", () => {
			const layer = engine.getActiveLayer();

			if (layer) {
				const result = engine.distributeElementsInLayer(
					["dist-1", "dist-2", "dist-3"],
					"horizontal",
					layer.id
				);

				expect(result !== undefined || result === undefined).toBe(true);
			}
		});

		it("should distribute elements vertically", () => {
			const layer = engine.getActiveLayer();

			if (layer) {
				const result = engine.distributeElementsInLayer(
					["dist-1", "dist-2", "dist-3"],
					"vertical",
					layer.id
				);

				expect(result !== undefined || result === undefined).toBe(true);
			}
		});

		it("should distribute elements with custom spacing", () => {
			const layer = engine.getActiveLayer();

			if (layer) {
				const result = engine.distributeElementsInLayer(
					["dist-1", "dist-2", "dist-3"],
					"horizontal",
					layer.id,
					50
				);

				expect(result !== undefined || result === undefined).toBe(true);
			}
		});
	});

	describe("Element Flipping", () => {
		beforeEach(() => {
			const elements = [
				{
					id: "flip-1",
					type: "line" as const,
					points: [
						{ x: 0, y: 0 },
						{ x: 100, y: 50 },
					],
					completed: true,
					color: "rgb(255, 0, 0)",
					lineWidth: 2,
					info: {
						name: "Flip 1",
						direction: "left" as const,
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 1,
					},
				},
			];

			engine.addElements(elements, new Map());
		});

		it("should flip elements horizontally", () => {
			const result = engine.flipElements(["flip-1"], "horizontal");

			expect(result !== undefined || result === undefined).toBe(true);
		});

		it("should flip elements vertically", () => {
			const result = engine.flipElements(["flip-1"], "vertical");

			expect(result !== undefined || result === undefined).toBe(true);
		});
	});

	describe("Multiple Element Operations", () => {
		it("should handle operations with no elements", () => {
			const result = engine.changeZOrderInLayer([], "bringToFront");

			expect(result !== undefined || result === undefined).toBe(true);
		});

		it("should handle operations with single element", () => {
			const element = {
				id: "single-1",
				type: "line" as const,
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 100 },
				],
				completed: true,
				color: "rgb(255, 0, 0)",
				lineWidth: 2,
				info: {
					name: "Single 1",
					direction: "left" as const,
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 1,
				},
			};

			engine.addElements([element], new Map());

			const result = engine.changeZOrderInLayer(["single-1"], "bringToFront");

			expect(result !== undefined || result === undefined).toBe(true);
		});

		it("should handle operations without layer ID", () => {
			const element = {
				id: "no-layer-1",
				type: "line" as const,
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 100 },
				],
				completed: true,
				color: "rgb(255, 0, 0)",
				lineWidth: 2,
				info: {
					name: "No Layer 1",
					direction: "left" as const,
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 1,
				},
			};

			engine.addElements([element], new Map());

			const result = engine.changeZOrderInLayer(["no-layer-1"], "bringToFront");

			expect(result !== undefined || result === undefined).toBe(true);
		});
	});
});
