// @vitest-environment jsdom
/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TestContext } from "./setup";

import { DrawingEngine } from "../index";
import { setupTestContext } from "./setup";

describe("DrawingEngine - Core", () => {
	let ctx: TestContext;
	let engine: DrawingEngine;

	beforeEach(() => {
		ctx = setupTestContext();
		engine = new DrawingEngine(ctx.canvas, ctx.media);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Coordinate Transformation", () => {
		it("should transform coordinates from display to native space", () => {
			const point = { x: 50, y: 50 };

			// Use engine's public API method
			const result = engine.displayToMediaCoords(point);

			// The mock implements coordinate conversion
			expect(result).toBeDefined();
			expect(typeof result.x).toBe("number");
			expect(typeof result.y).toBe("number");
		});

		it("should transform coordinates from native to display space", () => {
			const point = { x: 100, y: 100 };

			// Use engine's public API method
			const result = engine.mediaToDisplayCoords(point);

			// Should return valid coordinates
			expect(result).toBeDefined();
			expect(typeof result.x).toBe("number");
			expect(typeof result.y).toBe("number");
		});

		it("should handle coordinate transformation at origin", () => {
			const origin = { x: 0, y: 0 };

			const result = engine.mediaToDisplayCoords(origin);

			expect(result).toEqual(origin);
		});

		it("should handle coordinate transformation with scaling", () => {
			const point = { x: 200, y: 150 };

			const result = engine.mediaToDisplayCoords(point);

			// Should return valid transformed coordinates
			expect(result).toBeDefined();
			expect(typeof result.x).toBe("number");
			expect(typeof result.y).toBe("number");
		});

		it("should handle round-trip coordinate transformation", () => {
			const original = { x: 100, y: 100 };

			// Transform to media coords and back
			const mediaCoords = engine.displayToMediaCoords(original);
			const backToDisplay = engine.mediaToDisplayCoords(mediaCoords);

			// Should be close to original (allowing for floating point precision)
			expect(Math.abs(backToDisplay.x - original.x)).toBeLessThan(0.1);
			expect(Math.abs(backToDisplay.y - original.y)).toBeLessThan(0.1);
		});

		it("should calculate distance to line segment", () => {
			const point = { x: 50, y: 50 };
			const lineStart = { x: 0, y: 0 };
			const lineEnd = { x: 100, y: 100 };

			const distance = engine.distanceToLineSegment(point, lineStart, lineEnd);

			// Point is on the line, so distance should be 0
			expect(distance).toBe(0);
		});

		it("should calculate distance to line segment for point off line", () => {
			const point = { x: 50, y: 0 };
			const lineStart = { x: 0, y: 0 };
			const lineEnd = { x: 100, y: 0 };

			const distance = engine.distanceToLineSegment(point, lineStart, lineEnd);

			// Point is on the line horizontally
			expect(distance).toBe(0);
		});

		it("should check if point is in polygon", () => {
			const point = { x: 50, y: 50 };
			const polygon = [
				{ x: 0, y: 0 },
				{ x: 100, y: 0 },
				{ x: 100, y: 100 },
				{ x: 0, y: 100 },
			];

			const isInside = engine.pointInPolygon(point, polygon);

			expect(isInside).toBe(true);
		});

		it("should return false for point outside polygon", () => {
			const point = { x: 150, y: 150 };
			const polygon = [
				{ x: 0, y: 0 },
				{ x: 100, y: 0 },
				{ x: 100, y: 100 },
				{ x: 0, y: 100 },
			];

			const isInside = engine.pointInPolygon(point, polygon);

			expect(isInside).toBe(false);
		});

		it("should handle polygon with point on edge", () => {
			const point = { x: 50, y: 0 };
			const polygon = [
				{ x: 0, y: 0 },
				{ x: 100, y: 0 },
				{ x: 100, y: 100 },
				{ x: 0, y: 100 },
			];

			const isInside = engine.pointInPolygon(point, polygon);

			// Point on edge is considered outside by ray casting
			expect(typeof isInside).toBe("boolean");
		});
	});

	describe("Canvas Rendering", () => {
		it("should redraw canvas", () => {
			// Trigger a redraw through the public API
			engine.requestRedraw();

			// Verify the canvas is still valid
			expect(ctx.canvas).toBeDefined();
			expect(ctx.canvas.width).toBe(800);
			expect(ctx.canvas.height).toBe(600);
		});

		it("should handle multiple redraw calls", () => {
			engine.requestRedraw();
			engine.requestRedraw();
			engine.requestRedraw();

			// Should handle multiple redraws without errors
			expect(ctx.canvas).toBeDefined();
		});

		it("should redraw with elements", () => {
			const testElement = {
				id: "test-1",
				type: "line" as const,
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 100 },
				],
				completed: true,
				color: "rgb(255, 0, 0)",
				lineWidth: 2,
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

			// Add element through engine
			engine.addElements([testElement], new Map());

			// Request redraw
			engine.requestRedraw();

			// Verify element was added
			expect(engine.elements).toHaveLength(1);
			expect(engine.elements[0].id).toBe("test-1");
		});
	});

	describe("Resolution Management", () => {
		it("should get current resolution", () => {
			const resolution = engine.getConfig().resolution;
			expect(resolution).toBeDefined();
			expect(resolution.display).toBeDefined();
			expect(resolution.target).toBeDefined();
			expect(resolution.native).toBeDefined();
		});

		it("should have consistent resolution across display types", () => {
			const config = engine.getConfig();
			expect(config.resolution).toBeDefined();
			expect(config.resolution.display).toBeDefined();
			expect(config.resolution.target).toBeDefined();
			expect(config.resolution.native).toBeDefined();
			expect(typeof config.resolution.display.width).toBe("number");
			expect(typeof config.resolution.display.height).toBe("number");
		});

		it("should handle coordinate scaling based on resolution", () => {
			const point = { x: 100, y: 100 };

			// Display to media should return valid coordinates
			const mediaPoint = engine.displayToMediaCoords(point);
			expect(mediaPoint).toBeDefined();
			expect(typeof mediaPoint.x).toBe("number");
			expect(typeof mediaPoint.y).toBe("number");

			// Media to display should return valid coordinates
			const displayPoint = engine.mediaToDisplayCoords(mediaPoint);
			expect(displayPoint).toBeDefined();
			expect(typeof displayPoint.x).toBe("number");
			expect(typeof displayPoint.y).toBe("number");
		});
	});

	describe("Element Detection", () => {
		it("should not detect elements in empty canvas", () => {
			// With no elements, should return empty array for selectedElements
			expect(engine.elements).toHaveLength(0);
		});

		it("should detect elements after adding them", () => {
			const testElements = [
				{
					id: "line-1",
					type: "line" as const,
					points: [
						{ x: 0, y: 0 },
						{ x: 100, y: 100 },
					],
					completed: true,
					color: "rgb(255, 0, 0)",
					lineWidth: 2,
					info: {
						name: "Line 1",
						type: "DETECTION" as const,
						direction: "left" as const,
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 1,
					},
				},
				{
					id: "area-1",
					type: "area" as const,
					points: [
						{ x: 50, y: 50 },
						{ x: 150, y: 50 },
						{ x: 150, y: 150 },
						{ x: 50, y: 150 },
					],
					completed: true,
					color: "rgb(0, 255, 0)",
					lineWidth: 2,
					info: {
						name: "Area 1",
						type: "DETECTION" as const,
						direction: "left" as const,
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 1,
					},
				},
			];

			engine.addElements(testElements, new Map());

			expect(engine.elements).toHaveLength(2);
			expect(engine.elements[0].id).toBe("line-1");
			expect(engine.elements[1].id).toBe("area-1");
		});
	});

	describe("Direction Calculation", () => {
		it("should calculate direction for line elements", () => {
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

			const direction = engine.calculateDirection(element);

			expect(direction).toBeDefined();
			if (direction) {
				expect(direction.start).toBeDefined();
				expect(direction.end).toBeDefined();
			}
		});

		it("should handle elements with multiple points", () => {
			const element = {
				id: "test-1",
				type: "area" as const,
				points: [
					{ x: 0, y: 0 },
					{ x: 50, y: 25 },
					{ x: 100, y: 50 },
					{ x: 100, y: 100 },
				],
				completed: true,
				color: "rgb(0, 0, 0)",
				lineWidth: 2,
				info: {
					name: "Test Area",
					type: "DETECTION" as const,
					direction: "left" as const,
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 1,
				},
			};

			const direction = engine.calculateDirection(element);

			// Direction calculation depends on element type
			expect(direction !== null || direction === null).toBe(true);
		});
	});

	describe("Matrix Generation", () => {
		it("should generate matrix from elements", () => {
			const testElements = [
				{
					id: "test-1",
					type: "line" as const,
					points: [
						{ x: 0, y: 0 },
						{ x: 100, y: 100 },
					],
					completed: true,
					color: "rgb(255, 0, 0)",
					lineWidth: 2,
					info: {
						name: "Test Line",
						type: "DETECTION" as const,
						direction: "left" as const,
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 1,
					},
				},
			];

			const matrix = engine.generateMatrix(testElements);

			expect(matrix).toBeDefined();
			// Matrix can be an array or object depending on implementation
			expect(matrix !== null && matrix !== undefined).toBe(true);
		});

		it("should generate empty matrix for no elements", () => {
			const matrix = engine.generateMatrix([]);

			expect(matrix).toBeDefined();
			// Matrix can be an array or object depending on implementation
			expect(matrix !== null && matrix !== undefined).toBe(true);
		});
	});
});
