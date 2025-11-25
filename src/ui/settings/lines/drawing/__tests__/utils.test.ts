/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DrawingConfig } from "../config";
import type { DrawingCore } from "../core";
import type { DrawingElement, Point } from "../types";

import { DrawingUtils } from "../utils";

describe("DrawingUtils", () => {
	let utils: DrawingUtils;
	let coreMock: DrawingCore;
	let configMock: DrawingConfig;

	beforeEach(() => {
		// Mock DrawingCore
		coreMock = {
			mediaToDisplayCoords: vi.fn((point: Point) => point),
			distanceToLineSegment: vi.fn(() => 5),
			pointInPolygon: vi.fn(() => false),
		} as any;

		// Mock DrawingConfig
		configMock = {
			interactionThresholds: {
				line: 10,
				area: 10,
				curve: 10,
				point: 15,
			},
		} as any;

		utils = new DrawingUtils(coreMock, configMock);
	});

	describe("findElementNearMouse", () => {
		it("should find a line element near mouse", () => {
			const mousePos: Point = { x: 100, y: 100 };
			const elements: DrawingElement[] = [
				{
					id: "line-1",
					type: "line",
					points: [
						{ x: 90, y: 90 },
						{ x: 110, y: 110 },
					],
					completed: true,
					color: "#000000",
					info: {
						name: "Test Line",
						type: "DETECTION",
						direction: "left",
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			(coreMock.distanceToLineSegment as any).mockReturnValue(5);

			const result = utils.findElementNearMouse(mousePos, elements);
			expect(result).toBe("line-1");
		});

		it("should find a rectangle element near mouse", () => {
			const mousePos: Point = { x: 105, y: 105 };
			const elements: DrawingElement[] = [
				{
					id: "rect-1",
					type: "rectangle",
					points: [
						{ x: 100, y: 100 },
						{ x: 200, y: 200 },
					],
					completed: true,
					color: "#000000",
					info: {
						name: "Test Rectangle",
						type: "DETECTION",
						direction: "left",
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const result = utils.findElementNearMouse(mousePos, elements);
			expect(result).toBe("rect-1");
		});

		it("should find a circle element near mouse", () => {
			const mousePos: Point = { x: 110, y: 100 };
			const elements: DrawingElement[] = [
				{
					id: "circle-1",
					type: "circle",
					points: [
						{ x: 100, y: 100 },
						{ x: 150, y: 100 },
					],
					completed: true,
					color: "#000000",
					info: {
						name: "Test Circle",
						type: "DETECTION",
						direction: "left",
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const result = utils.findElementNearMouse(mousePos, elements);
			expect(result).toBe("circle-1");
		});

		it("should find an area element near mouse", () => {
			const mousePos: Point = { x: 105, y: 105 };
			const elements: DrawingElement[] = [
				{
					id: "area-1",
					type: "area",
					points: [
						{ x: 100, y: 100 },
						{ x: 200, y: 100 },
						{ x: 150, y: 200 },
					],
					completed: true,
					color: "#000000",
					info: {
						name: "Test Area",
						type: "DETECTION",
						direction: "left",
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			(coreMock.pointInPolygon as any).mockReturnValue(true);

			const result = utils.findElementNearMouse(mousePos, elements);
			expect(result).toBe("area-1");
		});

		it("should find a curve element near mouse", () => {
			const mousePos: Point = { x: 105, y: 105 };
			const elements: DrawingElement[] = [
				{
					id: "curve-1",
					type: "curve",
					points: [
						{ x: 100, y: 100 },
						{ x: 110, y: 110 },
						{ x: 120, y: 105 },
					],
					completed: true,
					color: "#000000",
					info: {
						name: "Test Curve",
						type: "DETECTION",
						direction: "left",
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			(coreMock.distanceToLineSegment as any).mockReturnValue(5);

			const result = utils.findElementNearMouse(mousePos, elements);
			expect(result).toBe("curve-1");
		});

		it("should return null if no element is near mouse", () => {
			const mousePos: Point = { x: 500, y: 500 };
			const elements: DrawingElement[] = [
				{
					id: "line-1",
					type: "line",
					points: [
						{ x: 90, y: 90 },
						{ x: 110, y: 110 },
					],
					completed: true,
					color: "#000000",
					info: {
						name: "Test Line",
						type: "DETECTION",
						direction: "left",
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			(coreMock.distanceToLineSegment as any).mockReturnValue(100);

			const result = utils.findElementNearMouse(mousePos, elements);
			expect(result).toBeNull();
		});
	});

	describe("findPointNearMouse", () => {
		it("should find a main point near mouse", () => {
			const mousePos: Point = { x: 102, y: 102 };
			const elements: DrawingElement[] = [
				{
					id: "line-1",
					type: "line",
					points: [
						{ x: 100, y: 100 },
						{ x: 200, y: 200 },
					],
					completed: true,
					color: "#000000",
					info: {
						name: "Test Line",
						type: "DETECTION",
						direction: "left",
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const result = utils.findPointNearMouse(mousePos, elements);
			expect(result).toEqual({
				elementId: "line-1",
				pointIndex: 0,
				pointType: "main",
			});
		});

		it("should find an entry detection point near mouse", () => {
			const mousePos: Point = { x: 52, y: 52 };
			const elements: DrawingElement[] = [
				{
					id: "line-1",
					type: "line",
					points: [
						{ x: 100, y: 100 },
						{ x: 200, y: 200 },
					],
					detection: {
						entry: [{ x: 50, y: 50 }],
						exit: [{ x: 250, y: 250 }],
					},
					completed: true,
					color: "#000000",
					info: {
						name: "Test Line",
						type: "DETECTION",
						direction: "left",
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const result = utils.findPointNearMouse(mousePos, elements);
			expect(result).toEqual({
				elementId: "line-1",
				pointIndex: 0,
				pointType: "entry",
			});
		});

		it("should find an exit detection point near mouse", () => {
			const mousePos: Point = { x: 252, y: 252 };
			const elements: DrawingElement[] = [
				{
					id: "line-1",
					type: "line",
					points: [
						{ x: 100, y: 100 },
						{ x: 200, y: 200 },
					],
					detection: {
						entry: [{ x: 50, y: 50 }],
						exit: [{ x: 250, y: 250 }],
					},
					completed: true,
					color: "#000000",
					info: {
						name: "Test Line",
						type: "DETECTION",
						direction: "left",
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const result = utils.findPointNearMouse(mousePos, elements);
			expect(result).toEqual({
				elementId: "line-1",
				pointIndex: 0,
				pointType: "exit",
			});
		});

		it("should find rectangle corners", () => {
			const mousePos: Point = { x: 102, y: 102 };
			const elements: DrawingElement[] = [
				{
					id: "rect-1",
					type: "rectangle",
					points: [
						{ x: 100, y: 100 },
						{ x: 200, y: 200 },
					],
					completed: true,
					color: "#000000",
					info: {
						name: "Test Rectangle",
						type: "DETECTION",
						direction: "left",
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const result = utils.findPointNearMouse(mousePos, elements);
			expect(result).toEqual({
				elementId: "rect-1",
				pointIndex: 0,
				pointType: "main",
			});
		});

		it("should return null if no point is near mouse", () => {
			const mousePos: Point = { x: 500, y: 500 };
			const elements: DrawingElement[] = [
				{
					id: "line-1",
					type: "line",
					points: [
						{ x: 100, y: 100 },
						{ x: 200, y: 200 },
					],
					completed: true,
					color: "#000000",
					info: {
						name: "Test Line",
						type: "DETECTION",
						direction: "left",
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const result = utils.findPointNearMouse(mousePos, elements);
			expect(result).toBeNull();
		});

		it("should skip incomplete elements", () => {
			const mousePos: Point = { x: 102, y: 102 };
			const elements: DrawingElement[] = [
				{
					id: "line-1",
					type: "line",
					points: [
						{ x: 100, y: 100 },
						{ x: 200, y: 200 },
					],
					completed: false,
					color: "#000000",
					info: {
						name: "Test Line",
						type: "DETECTION",
						direction: "left",
						distance: 0,
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const result = utils.findPointNearMouse(mousePos, elements);
			expect(result).toBeNull();
		});
	});

	describe("getMousePos", () => {
		it("should calculate mouse position relative to canvas", () => {
			const canvas = {
				getBoundingClientRect: vi.fn(() => ({
					left: 50,
					top: 100,
					right: 450,
					bottom: 500,
					width: 400,
					height: 400,
					x: 50,
					y: 100,
					toJSON: () => ({}),
				})),
			} as unknown as HTMLCanvasElement;

			const event = {
				clientX: 150,
				clientY: 250,
			} as MouseEvent;

			const result = utils.getMousePos(event, canvas);
			expect(result).toEqual({ x: 100, y: 150 });
		});

		it("should return zero point if canvas is null", () => {
			const event = {
				clientX: 150,
				clientY: 250,
			} as MouseEvent;

			const result = utils.getMousePos(event, null);
			expect(result).toEqual({ x: 0, y: 0 });
		});
	});

	describe("getElementBounds", () => {
		it("should calculate bounds for an element", () => {
			const element: DrawingElement = {
				id: "line-1",
				type: "line",
				points: [
					{ x: 100, y: 200 },
					{ x: 300, y: 150 },
					{ x: 200, y: 400 },
				],
				completed: true,
				color: "#000000",
				info: {
					name: "Test Line",
					type: "DETECTION",
					direction: "left",
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 0.8,
				},
			};

			const result = utils.getElementBounds(element);
			expect(result).toEqual({
				minX: 100,
				minY: 150,
				maxX: 300,
				maxY: 400,
			});
		});

		it("should return null for element with no points", () => {
			const element: DrawingElement = {
				id: "line-1",
				type: "line",
				points: [],
				completed: false,
				color: "#000000",
				info: {
					name: "Test Line",
					type: "DETECTION",
					direction: "left",
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 0.8,
				},
			};

			const result = utils.getElementBounds(element);
			expect(result).toBeNull();
		});
	});

	describe("generateElementId", () => {
		it("should generate unique IDs", () => {
			const id1 = utils.generateElementId();
			const id2 = utils.generateElementId();

			expect(id1).toBeTruthy();
			expect(id2).toBeTruthy();
			expect(id1).not.toBe(id2);
			expect(typeof id1).toBe("string");
			expect(typeof id2).toBe("string");
		});
	});

	describe("distance", () => {
		it("should calculate distance between two points", () => {
			const point1: Point = { x: 0, y: 0 };
			const point2: Point = { x: 3, y: 4 };

			const result = utils.distance(point1, point2);
			expect(result).toBe(5); // 3-4-5 triangle
		});

		it("should return zero for same point", () => {
			const point: Point = { x: 100, y: 100 };

			const result = utils.distance(point, point);
			expect(result).toBe(0);
		});
	});

	describe("getElementCenter", () => {
		it("should return circle center", () => {
			const element: DrawingElement = {
				id: "circle-1",
				type: "circle",
				points: [
					{ x: 100, y: 100 },
					{ x: 150, y: 100 },
				],
				completed: true,
				color: "#000000",
				info: {
					name: "Test Circle",
					type: "DETECTION",
					direction: "left",
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 0.8,
				},
			};

			const result = utils.getElementCenter(element);
			expect(result).toEqual({ x: 100, y: 100 });
		});

		it("should calculate centroid for other shapes", () => {
			const element: DrawingElement = {
				id: "line-1",
				type: "line",
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 0 },
					{ x: 100, y: 100 },
					{ x: 0, y: 100 },
				],
				completed: true,
				color: "#000000",
				info: {
					name: "Test Line",
					type: "DETECTION",
					direction: "left",
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 0.8,
				},
			};

			const result = utils.getElementCenter(element);
			expect(result).toEqual({ x: 50, y: 50 });
		});

		it("should return null for element with no points", () => {
			const element: DrawingElement = {
				id: "line-1",
				type: "line",
				points: [],
				completed: false,
				color: "#000000",
				info: {
					name: "Test Line",
					type: "DETECTION",
					direction: "left",
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 0.8,
				},
			};

			const result = utils.getElementCenter(element);
			expect(result).toBeNull();
		});
	});

	describe("isPointInBounds", () => {
		const mediaSize = { width: 1920, height: 1080 };

		it("should return true for point within bounds", () => {
			const point: Point = { x: 100, y: 100 };
			const result = utils.isPointInBounds(point, mediaSize);
			expect(result).toBe(true);
		});

		it("should return false for point outside left bound", () => {
			const point: Point = { x: -10, y: 100 };
			const result = utils.isPointInBounds(point, mediaSize);
			expect(result).toBe(false);
		});

		it("should return false for point outside right bound", () => {
			const point: Point = { x: 2000, y: 100 };
			const result = utils.isPointInBounds(point, mediaSize);
			expect(result).toBe(false);
		});

		it("should return false for point outside top bound", () => {
			const point: Point = { x: 100, y: -10 };
			const result = utils.isPointInBounds(point, mediaSize);
			expect(result).toBe(false);
		});

		it("should return false for point outside bottom bound", () => {
			const point: Point = { x: 100, y: 1100 };
			const result = utils.isPointInBounds(point, mediaSize);
			expect(result).toBe(false);
		});

		it("should return true for point at origin", () => {
			const point: Point = { x: 0, y: 0 };
			const result = utils.isPointInBounds(point, mediaSize);
			expect(result).toBe(true);
		});
	});

	describe("clampToCanvas", () => {
		const mediaSize = { width: 1920, height: 1080 };

		it("should return same point if within bounds", () => {
			const point: Point = { x: 100, y: 100 };
			const result = utils.clampToCanvas(point, mediaSize);
			expect(result).toEqual({ x: 100, y: 100 });
		});

		it("should clamp negative x to 0", () => {
			const point: Point = { x: -50, y: 100 };
			const result = utils.clampToCanvas(point, mediaSize);
			expect(result).toEqual({ x: 0, y: 100 });
		});

		it("should clamp negative y to 0", () => {
			const point: Point = { x: 100, y: -50 };
			const result = utils.clampToCanvas(point, mediaSize);
			expect(result).toEqual({ x: 100, y: 0 });
		});

		it("should clamp x beyond width", () => {
			const point: Point = { x: 2000, y: 100 };
			const result = utils.clampToCanvas(point, mediaSize);
			expect(result).toEqual({ x: 1919, y: 100 });
		});

		it("should clamp y beyond height", () => {
			const point: Point = { x: 100, y: 1500 };
			const result = utils.clampToCanvas(point, mediaSize);
			expect(result).toEqual({ x: 100, y: 1079 });
		});

		it("should clamp both x and y if both are out of bounds", () => {
			const point: Point = { x: -100, y: 2000 };
			const result = utils.clampToCanvas(point, mediaSize);
			expect(result).toEqual({ x: 0, y: 1079 });
		});
	});
});
