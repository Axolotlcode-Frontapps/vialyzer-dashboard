import type { DrawingConfig } from "./config";
import type { DrawingCore } from "./core";
import type { DrawingElement, Point } from "./types";

export class DrawingUtils {
	#core: DrawingCore;
	#config: DrawingConfig;

	constructor(core: DrawingCore, config: DrawingConfig) {
		this.#core = core;
		this.#config = config;
	}

	/**
	 * Find the drawing element near the mouse position
	 */
	findElementNearMouse(mousePos: Point, elements: DrawingElement[]): string | null {
		const {
			line: lineThreshold,
			area: areaThreshold,
			curve: curveThreshold,
		} = this.#config.interactionThresholds;

		for (const element of elements) {
			const displayPoints = element.points.map((point) => this.#core.mediaToDisplayCoords(point));

			if (element.type === "line" && displayPoints.length >= 2) {
				const distance = this.#core.distanceToLineSegment(
					mousePos,
					displayPoints[0],
					displayPoints[1]
				);
				if (distance <= lineThreshold) return element.id;
			} else if (element.type === "rectangle" && displayPoints.length >= 2) {
				const x = Math.min(displayPoints[0].x, displayPoints[1].x);
				const y = Math.min(displayPoints[0].y, displayPoints[1].y);
				const width = Math.abs(displayPoints[1].x - displayPoints[0].x);
				const height = Math.abs(displayPoints[1].y - displayPoints[0].y);

				if (
					mousePos.x >= x - areaThreshold &&
					mousePos.x <= x + width + areaThreshold &&
					mousePos.y >= y - areaThreshold &&
					mousePos.y <= y + height + areaThreshold
				) {
					return element.id;
				}
			} else if (element.type === "circle" && displayPoints.length >= 2) {
				const centerX = displayPoints[0].x;
				const centerY = displayPoints[0].y;
				const radius = Math.sqrt(
					(displayPoints[1].x - centerX) ** 2 + (displayPoints[1].y - centerY) ** 2
				);
				const distance = Math.sqrt((mousePos.x - centerX) ** 2 + (mousePos.y - centerY) ** 2);

				if (distance <= radius + areaThreshold) return element.id;
			} else if (element.type === "area" && displayPoints.length >= 3) {
				if (this.#core.pointInPolygon(mousePos, displayPoints)) return element.id;

				for (let i = 0; i < displayPoints.length; i++) {
					const nextPoint = displayPoints[(i + 1) % displayPoints.length];
					const distance = this.#core.distanceToLineSegment(mousePos, displayPoints[i], nextPoint);
					if (distance <= areaThreshold) return element.id;
				}
			} else if (element.type === "curve" && displayPoints.length >= 2) {
				for (let i = 0; i < displayPoints.length - 1; i++) {
					const distance = this.#core.distanceToLineSegment(
						mousePos,
						displayPoints[i],
						displayPoints[i + 1]
					);
					if (distance <= curveThreshold) return element.id;
				}
			}
		}
		return null;
	}

	/**
	 * Find a draggable point near the mouse position
	 */
	findPointNearMouse(
		mousePos: Point,
		elements: DrawingElement[]
	): {
		elementId: string;
		pointIndex: number;
		pointType: "main" | "entry" | "exit";
	} | null {
		const threshold = this.#config.interactionThresholds.point;

		for (let i = elements.length - 1; i >= 0; i--) {
			const element = elements[i];
			if (!element.completed) continue;

			// Check detection points first (as they are smaller targets)
			if (element.detection) {
				// Check entry points
				const entryDisplayPoints = element.detection.entry.map((point) =>
					this.#core.mediaToDisplayCoords(point)
				);
				for (let j = 0; j < entryDisplayPoints.length; j++) {
					const point = entryDisplayPoints[j];
					const distance = Math.sqrt((mousePos.x - point.x) ** 2 + (mousePos.y - point.y) ** 2);
					if (distance <= threshold) {
						return { elementId: element.id, pointIndex: j, pointType: "entry" };
					}
				}

				// Check exit points
				const exitDisplayPoints = element.detection.exit.map((point) =>
					this.#core.mediaToDisplayCoords(point)
				);
				for (let j = 0; j < exitDisplayPoints.length; j++) {
					const point = exitDisplayPoints[j];
					const distance = Math.sqrt((mousePos.x - point.x) ** 2 + (mousePos.y - point.y) ** 2);
					if (distance <= threshold) {
						return { elementId: element.id, pointIndex: j, pointType: "exit" };
					}
				}
			}

			// Check main points
			const displayPoints = element.points.map((point) => this.#core.mediaToDisplayCoords(point));

			if (element.type === "rectangle" && displayPoints.length >= 2) {
				const x1 = Math.min(displayPoints[0].x, displayPoints[1].x);
				const y1 = Math.min(displayPoints[0].y, displayPoints[1].y);
				const x2 = Math.max(displayPoints[0].x, displayPoints[1].x);
				const y2 = Math.max(displayPoints[0].y, displayPoints[1].y);

				const corners = [
					{ x: x1, y: y1 },
					{ x: x2, y: y1 },
					{ x: x2, y: y2 },
					{ x: x1, y: y2 },
				];

				for (let j = 0; j < corners.length; j++) {
					const corner = corners[j];
					const distance = Math.sqrt((mousePos.x - corner.x) ** 2 + (mousePos.y - corner.y) ** 2);
					if (distance <= threshold) {
						return { elementId: element.id, pointIndex: j, pointType: "main" };
					}
				}
			} else {
				for (let j = 0; j < displayPoints.length; j++) {
					const point = displayPoints[j];
					const distance = Math.sqrt((mousePos.x - point.x) ** 2 + (mousePos.y - point.y) ** 2);

					if (distance <= threshold) {
						return { elementId: element.id, pointIndex: j, pointType: "main" };
					}
				}
			}
		}

		return null;
	}

	/**
	 * Get mouse position relative to canvas
	 */
	getMousePos(event: MouseEvent, canvas: HTMLCanvasElement | null): Point {
		if (!canvas) return { x: 0, y: 0 };

		const rect = canvas.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
		};
	}

	/**
	 * Calculate element bounds in media coordinates
	 */
	getElementBounds(
		element: DrawingElement
	): { minX: number; minY: number; maxX: number; maxY: number } | null {
		if (element.points.length === 0) return null;

		return {
			minX: Math.min(...element.points.map((p) => p.x)),
			minY: Math.min(...element.points.map((p) => p.y)),
			maxX: Math.max(...element.points.map((p) => p.x)),
			maxY: Math.max(...element.points.map((p) => p.y)),
		};
	}

	/**
	 * Generate a unique ID for drawing elements
	 */
	generateElementId(): string {
		return Date.now().toString() + Math.random().toString(36).substr(2, 9);
	}

	/**
	 * Calculate distance between two points
	 */
	distance(point1: Point, point2: Point): number {
		return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
	}

	/**
	 * Calculate the center point of an element
	 */
	getElementCenter(element: DrawingElement): Point | null {
		if (element.points.length === 0) return null;

		if (element.type === "circle" && element.points.length >= 1) {
			return element.points[0]; // Circle center is the first point
		}

		// For other shapes, calculate centroid
		const sumX = element.points.reduce((sum, point) => sum + point.x, 0);
		const sumY = element.points.reduce((sum, point) => sum + point.y, 0);

		return {
			x: sumX / element.points.length,
			y: sumY / element.points.length,
		};
	}

	/**
	 * Check if a point is within canvas bounds
	 */
	isPointInBounds(point: Point, mediaSize: { width: number; height: number }): boolean {
		return point.x >= 0 && point.x < mediaSize.width && point.y >= 0 && point.y < mediaSize.height;
	}

	/**
	 * Clamp a point to canvas bounds
	 */
	clampToCanvas(point: Point, mediaSize: { width: number; height: number }): Point {
		return {
			x: Math.max(0, Math.min(mediaSize.width - 1, point.x)),
			y: Math.max(0, Math.min(mediaSize.height - 1, point.y)),
		};
	}
}
