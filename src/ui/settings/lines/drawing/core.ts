import type { DrawingConfig } from "./config";
import type {
	DragState,
	DrawingElement,
	DrawingElementType,
	DrawingMode,
	MediaMatrix,
	Point,
} from "./types";

/**
 * DrawingCore - Core drawing calculations and rendering functionality
 * Internal class used only by DrawingEngine for core drawing operations
 */
export class DrawingCore {
	#config: DrawingConfig;

	constructor(config: DrawingConfig) {
		this.#config = config;
	}

	// Coordinate transformation methods
	displayToMediaCoords(point: Point): Point {
		const { display, media } = this.#config.resolution;
		if (display.width === 0 || display.height === 0) {
			return point;
		}

		const scaleX = media.width / display.width;
		const scaleY = media.height / display.height;

		return {
			x: point.x * scaleX,
			y: point.y * scaleY,
		};
	}

	mediaToDisplayCoords(point: Point): Point {
		const { display, media } = this.#config.resolution;
		if (media.width === 0 || media.height === 0) return point;

		const scaleX = display.width / media.width;
		const scaleY = display.height / media.height;

		return {
			x: point.x * scaleX,
			y: point.y * scaleY,
		};
	}

	/**
	 * Converts media coordinates to target resolution coordinates.
	 * Used for taking snapshots at target resolution.
	 */
	mediaToTargetCoords(point: Point): Point {
		const { target, media } = this.#config.resolution;
		if (media.width === 0 || media.height === 0) return point;

		const scaleX = target.width / media.width;
		const scaleY = target.height / media.height;

		return {
			x: point.x * scaleX,
			y: point.y * scaleY,
		};
	}

	// Drawing creation methods
	createDrawingElement(
		drawingMode: DrawingElementType,
		mediaPoint: Point,
		elementId: string,
		layerId?: string
	): DrawingElement {
		return {
			id: elementId,
			type: drawingMode,
			points: [mediaPoint],
			color: this.#config.colors[drawingMode] || "#000000",
			completed: false,
			layerId,
			info: {
				name: "",
				description: undefined,
				type: "DETECTION",
				direction: "top",
				distance: 0,
				fontSize: 16,
				fontFamily: "Arial",
				backgroundColor: undefined,
				backgroundOpacity: 0.8,
			},
			syncState: "new", // Mark newly created elements as 'new'
		};
	}

	updateDrawingElement(
		currentElement: DrawingElement,
		mediaPoint: Point,
		drawingMode: DrawingMode,
		event?: MouseEvent
	): DrawingElement {
		if (drawingMode === "line") {
			return {
				...currentElement,
				points: [currentElement.points[0], mediaPoint],
			};
		}

		if (drawingMode === "rectangle") {
			let adjustedPoint = mediaPoint;

			if (event?.shiftKey) {
				const startPoint = currentElement.points[0];
				const width = Math.abs(mediaPoint.x - startPoint.x);
				const height = Math.abs(mediaPoint.y - startPoint.y);
				const size = Math.max(width, height);

				adjustedPoint = {
					x: startPoint.x + (mediaPoint.x >= startPoint.x ? size : -size),
					y: startPoint.y + (mediaPoint.y >= startPoint.y ? size : -size),
				};
			}

			return {
				...currentElement,
				points: [currentElement.points[0], adjustedPoint],
			};
		}

		if (drawingMode === "circle") {
			return {
				...currentElement,
				points: [currentElement.points[0], mediaPoint],
			};
		}

		if (drawingMode === "area" || drawingMode === "curve") {
			return {
				...currentElement,
				points: [...currentElement.points, mediaPoint],
			};
		}

		return currentElement;
	}

	completeElement(element: DrawingElement): DrawingElement {
		const direction = this.calculateDirection(element);
		// Only generate detection lines for DETECTION type elements
		const detection =
			element.info?.type === "DETECTION"
				? this.#updateDetectionLines(element)
				: undefined;

		return {
			...element,
			completed: true,
			direction:
				element.type === "line" || element.type === "curve" ? direction : null,
			detection,
		};
	}

	// Point dragging operations
	updatePointDragging(
		elements: DrawingElement[],
		dragState: DragState,
		mediaPoint: Point,
		event?: MouseEvent
	): DrawingElement[] {
		return elements.map((element) => {
			if (element.id !== dragState.elementId) {
				return element;
			}

			const { pointIndex, pointType } = dragState;
			const updatedElement = { ...element };

			if (pointIndex === null) return element;

			switch (pointType) {
				case "entry":
				case "exit": {
					if (!updatedElement.detection) break;

					const pivotPoint =
						pointType === "entry"
							? updatedElement.points[0]
							: updatedElement.points[updatedElement.points.length - 1];

					const vector = {
						x: mediaPoint.x - pivotPoint.x,
						y: mediaPoint.y - pivotPoint.y,
					};

					const newPoint1 = {
						x: pivotPoint.x + vector.x,
						y: pivotPoint.y + vector.y,
					};
					const newPoint2 = {
						x: pivotPoint.x - vector.x,
						y: pivotPoint.y - vector.y,
					};

					if (pointIndex === 0) {
						updatedElement.detection[pointType] = [newPoint1, newPoint2];
					} else {
						updatedElement.detection[pointType] = [newPoint2, newPoint1];
					}
					break;
				}

				case "main":
				default: {
					let newPoints = [...element.points];
					const oldPoint = newPoints[pointIndex]; // Capture old point before update

					if (element.type === "rectangle" && newPoints.length >= 2) {
						newPoints = this.#updateRectanglePoints(
							newPoints,
							pointIndex,
							mediaPoint,
							event
						);
					} else {
						newPoints[pointIndex] = mediaPoint;
					}

					updatedElement.points = newPoints;

					// Update direction for all line/curve types when points are dragged
					if (
						(element.type === "line" || element.type === "curve") &&
						updatedElement.completed
					) {
						updatedElement.direction = this.calculateDirection(updatedElement);

						// If a start or end point was moved, transform the corresponding detection line
						// (only for DETECTION type elements that have detection lines)
						if (
							updatedElement.detection &&
							(pointIndex === 0 || pointIndex === newPoints.length - 1)
						) {
							const isEntry = pointIndex === 0;
							const lineToUpdate = isEntry ? "entry" : "exit";
							const detectionLine = updatedElement.detection[lineToUpdate];
							const newPivot = mediaPoint;
							const oldPivot = oldPoint;

							// Define old and new line segments to get rotation
							const oldSegmentVector = isEntry
								? {
										x: element.points[1].x - oldPivot.x,
										y: element.points[1].y - oldPivot.y,
									}
								: {
										x: oldPivot.x - element.points[element.points.length - 2].x,
										y: oldPivot.y - element.points[element.points.length - 2].y,
									};

							const newSegmentVector = isEntry
								? {
										x: newPoints[1].x - newPivot.x,
										y: newPoints[1].y - newPivot.y,
									}
								: {
										x: newPivot.x - newPoints[newPoints.length - 2].x,
										y: newPivot.y - newPoints[newPoints.length - 2].y,
									};

							const oldAngle = Math.atan2(
								oldSegmentVector.y,
								oldSegmentVector.x
							);
							const newAngle = Math.atan2(
								newSegmentVector.y,
								newSegmentVector.x
							);
							const rotation = newAngle - oldAngle;

							const cos = Math.cos(rotation);
							const sin = Math.sin(rotation);

							const transformedDetectionLine = detectionLine.map((p) => {
								// 1. Translate to origin
								const px = p.x - oldPivot.x;
								const py = p.y - oldPivot.y;

								// 2. Rotate
								const rotatedX = px * cos - py * sin;
								const rotatedY = px * sin + py * cos;

								// 3. Translate to new pivot
								return {
									x: rotatedX + newPivot.x,
									y: rotatedY + newPivot.y,
								};
							});

							updatedElement.detection = {
								...updatedElement.detection,
								[lineToUpdate]: transformedDetectionLine,
							};
						}
					}
					break;
				}
			}

			return updatedElement;
		});
	}
	#updateRectanglePoints(
		points: Point[],
		pointIndex: number,
		mediaPoint: Point,
		event?: MouseEvent
	): Point[] {
		const x1 = Math.min(points[0].x, points[1].x);
		const y1 = Math.min(points[0].y, points[1].y);
		const x2 = Math.max(points[0].x, points[1].x);
		const y2 = Math.max(points[0].y, points[1].y);

		let adjustedPoint = mediaPoint;

		if (event?.shiftKey) {
			const centerX = (x1 + x2) / 2;
			const centerY = (y1 + y2) / 2;
			const width = Math.abs(mediaPoint.x - centerX);
			const height = Math.abs(mediaPoint.y - centerY);
			const size = Math.max(width, height);

			adjustedPoint = {
				x: centerX + (mediaPoint.x >= centerX ? size : -size),
				y: centerY + (mediaPoint.y >= centerY ? size : -size),
			};
		}

		switch (pointIndex) {
			case 0:
				return [
					{ x: adjustedPoint.x, y: adjustedPoint.y },
					{ x: x2, y: y2 },
				];
			case 1:
				return [
					{ x: x1, y: adjustedPoint.y },
					{ x: adjustedPoint.x, y: y2 },
				];
			case 2:
				return [
					{ x: x1, y: y1 },
					{ x: adjustedPoint.x, y: adjustedPoint.y },
				];
			case 3:
				return [
					{ x: adjustedPoint.x, y: y1 },
					{ x: x2, y: adjustedPoint.y },
				];
			default:
				return points;
		}
	}

	// Mathematical calculations
	catmullRomSpline(
		p0: Point,
		p1: Point,
		p2: Point,
		p3: Point,
		t: number
	): Point {
		const t2 = t * t;
		const t3 = t2 * t;

		return {
			x:
				0.5 *
				(2 * p1.x +
					(-p0.x + p2.x) * t +
					(2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
					(-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
			y:
				0.5 *
				(2 * p1.y +
					(-p0.y + p2.y) * t +
					(2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
					(-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
		};
	}

	calculateDirection(
		element: DrawingElement
	): { start: Point; end: Point } | null {
		if (element.points.length < 2) return null;

		if (element.type === "line") {
			return {
				start: element.points[0],
				end: element.points[element.points.length - 1],
			};
		} else if (element.type === "curve") {
			const points = element.points;
			if (points.length === 2) {
				return {
					start: points[0],
					end: points[1],
				};
			} else if (points.length >= 3) {
				const lastPoint = points[points.length - 1];
				const secondLastPoint = points[points.length - 2];
				return {
					start: secondLastPoint,
					end: lastPoint,
				};
			}
		}

		return null;
	}

	distanceToLineSegment(
		point: Point,
		lineStart: Point,
		lineEnd: Point
	): number {
		const A = point.x - lineStart.x;
		const B = point.y - lineStart.y;
		const C = lineEnd.x - lineStart.x;
		const D = lineEnd.y - lineStart.y;

		const dot = A * C + B * D;
		const lenSq = C * C + D * D;

		if (lenSq === 0) return Math.sqrt(A * A + B * B);

		let param = dot / lenSq;
		param = Math.max(0, Math.min(1, param));

		const xx = lineStart.x + param * C;
		const yy = lineStart.y + param * D;

		const dx = point.x - xx;
		const dy = point.y - yy;

		return Math.sqrt(dx * dx + dy * dy);
	}

	pointInPolygon(point: Point, polygon: Point[]): boolean {
		let inside = false;
		for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
			if (
				polygon[i].y > point.y !== polygon[j].y > point.y &&
				point.x <
					((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) /
						(polygon[j].y - polygon[i].y) +
						polygon[i].x
			) {
				inside = !inside;
			}
		}
		return inside;
	}

	// Rendering methods
	drawArrow(
		ctx: CanvasRenderingContext2D,
		point: Point,
		direction: Point,
		color: string,
		size: number = 12
	): void {
		const angle = Math.atan2(direction.y - point.y, direction.x - point.x);

		const arrowHead1 = {
			x: point.x - size * Math.cos(angle - Math.PI / 6),
			y: point.y - size * Math.sin(angle - Math.PI / 6),
		};
		const arrowHead2 = {
			x: point.x - size * Math.cos(angle + Math.PI / 6),
			y: point.y - size * Math.sin(angle + Math.PI / 6),
		};

		ctx.strokeStyle = color;
		ctx.fillStyle = color;
		ctx.lineWidth = 2;

		ctx.beginPath();
		ctx.moveTo(point.x, point.y);
		ctx.lineTo(arrowHead1.x, arrowHead1.y);
		ctx.moveTo(point.x, point.y);
		ctx.lineTo(arrowHead2.x, arrowHead2.y);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(point.x, point.y);
		ctx.lineTo(arrowHead1.x, arrowHead1.y);
		ctx.lineTo(arrowHead2.x, arrowHead2.y);
		ctx.closePath();
		ctx.fill();
	}

	drawElement(
		ctx: CanvasRenderingContext2D,
		element: DrawingElement,
		selectedElements: string[],
		hoveredElement: string | null,
		dragState: DragState
	): void {
		if (element.points.length === 0) return;

		const displayPoints = element.points.map((point) =>
			this.mediaToDisplayCoords(point)
		);
		const isSelected = selectedElements.includes(element.id);
		const isHovered = hoveredElement === element.id;

		ctx.strokeStyle = isSelected
			? "#ffff00"
			: isHovered
				? "#ff8800"
				: element.color;
		ctx.lineWidth = isSelected
			? this.#config.rendering.selectedLineWidth
			: isHovered
				? this.#config.rendering.hoveredLineWidth
				: this.#config.rendering.defaultLineWidth;
		ctx.beginPath();

		// Draw based on element type
		if (element.type === "line") {
			if (displayPoints.length >= 2) {
				ctx.moveTo(displayPoints[0].x, displayPoints[0].y);
				ctx.lineTo(displayPoints[1].x, displayPoints[1].y);
			} else if (displayPoints.length === 1) {
				ctx.arc(displayPoints[0].x, displayPoints[0].y, 2, 0, 2 * Math.PI);
			}
		} else if (element.type === "area") {
			if (displayPoints.length > 0) {
				ctx.moveTo(displayPoints[0].x, displayPoints[0].y);
				for (let i = 1; i < displayPoints.length; i++) {
					ctx.lineTo(displayPoints[i].x, displayPoints[i].y);
				}
				if (element.completed && displayPoints.length > 2) {
					ctx.closePath();
					ctx.fillStyle = element.color + "20";
					ctx.fill();
				}
			}
		} else if (element.type === "curve") {
			if (displayPoints.length >= 2) {
				ctx.moveTo(displayPoints[0].x, displayPoints[0].y);
				if (displayPoints.length === 2) {
					ctx.lineTo(displayPoints[1].x, displayPoints[1].y);
				} else {
					for (let i = 0; i < displayPoints.length - 1; i++) {
						const p0 = i > 0 ? displayPoints[i - 1] : displayPoints[i];
						const p1 = displayPoints[i];
						const p2 = displayPoints[i + 1];
						const p3 =
							i < displayPoints.length - 2
								? displayPoints[i + 2]
								: displayPoints[i + 1];

						for (let t = 0.1; t <= 1; t += 0.1) {
							const point = this.catmullRomSpline(p0, p1, p2, p3, t);
							ctx.lineTo(point.x, point.y);
						}
					}
				}
			}
		} else if (element.type === "rectangle" && displayPoints.length >= 2) {
			const x = Math.min(displayPoints[0].x, displayPoints[1].x);
			const y = Math.min(displayPoints[0].y, displayPoints[1].y);
			const width = Math.abs(displayPoints[1].x - displayPoints[0].x);
			const height = Math.abs(displayPoints[1].y - displayPoints[0].y);

			ctx.rect(x, y, width, height);
			if (element.completed) {
				ctx.fillStyle = element.color + "20";
				ctx.fill();
			}
		} else if (element.type === "circle" && displayPoints.length >= 2) {
			const centerX = displayPoints[0].x;
			const centerY = displayPoints[0].y;
			const radius = Math.sqrt(
				(displayPoints[1].x - centerX) ** 2 +
					(displayPoints[1].y - centerY) ** 2
			);

			ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
			if (element.completed) {
				ctx.fillStyle = element.color + "20";
				ctx.fill();
			}
		}

		ctx.stroke();

		// Draw detection lines (only for DETECTION type elements)
		// Skip if selected/hovered - they'll be drawn with highlight below
		if (
			element.detection &&
			element.info?.type === "DETECTION" &&
			(element.type === "line" || element.type === "curve") &&
			!isSelected &&
			!isHovered
		) {
			ctx.save();
			ctx.strokeStyle = element.color; // Use element's color
			ctx.lineWidth = 1;
			ctx.setLineDash([5, 5]);

			const entry = element.detection.entry.map((p) =>
				this.mediaToDisplayCoords(p)
			);
			if (entry.length === 2) {
				ctx.beginPath();
				ctx.moveTo(entry[0].x, entry[0].y);
				ctx.lineTo(entry[1].x, entry[1].y);
				ctx.stroke();
			}

			const exit = element.detection.exit.map((p) =>
				this.mediaToDisplayCoords(p)
			);
			if (exit.length === 2) {
				ctx.beginPath();
				ctx.moveTo(exit[0].x, exit[0].y);
				ctx.lineTo(exit[1].x, exit[1].y);
				ctx.stroke();
			}

			ctx.restore();
		}

		// Draw selection highlight
		if (isSelected || isHovered) {
			ctx.save();
			ctx.strokeStyle = isSelected ? "#ffff00" : "#ff8800";
			ctx.lineWidth = 8;
			ctx.globalAlpha = isSelected ? 0.4 : 0.25;
			ctx.stroke();
			ctx.restore();
		}

		// Draw detection line highlights when selected or hovered
		if (
			element.detection &&
			element.info?.type === "DETECTION" &&
			(element.type === "line" || element.type === "curve") &&
			(isSelected || isHovered)
		) {
			ctx.save();
			ctx.strokeStyle = isSelected ? "#ffff00" : "#ff8800";
			ctx.lineWidth = 3;
			ctx.globalAlpha = isSelected ? 0.5 : 0.3;
			ctx.setLineDash([5, 5]);

			const entry = element.detection.entry.map((p) =>
				this.mediaToDisplayCoords(p)
			);
			if (entry.length === 2) {
				ctx.beginPath();
				ctx.moveTo(entry[0].x, entry[0].y);
				ctx.lineTo(entry[1].x, entry[1].y);
				ctx.stroke();
			}

			const exit = element.detection.exit.map((p) =>
				this.mediaToDisplayCoords(p)
			);
			if (exit.length === 2) {
				ctx.beginPath();
				ctx.moveTo(exit[0].x, exit[0].y);
				ctx.lineTo(exit[1].x, exit[1].y);
				ctx.stroke();
			}

			ctx.restore();
		}

		// Draw direction arrows for lines and curves
		if (
			this.#config.rendering.showDirectionArrows &&
			element.completed &&
			(element.type === "line" || element.type === "curve")
		) {
			const direction = element.direction || this.calculateDirection(element);
			if (direction && displayPoints.length >= 2) {
				const displayStart = this.mediaToDisplayCoords(direction.start);
				const displayEnd = this.mediaToDisplayCoords(direction.end);

				let arrowPoint: Point;
				if (element.type === "line") {
					const t = 0.75;
					arrowPoint = {
						x: displayStart.x + (displayEnd.x - displayStart.x) * t,
						y: displayStart.y + (displayEnd.y - displayStart.y) * t,
					};
				} else {
					// curve
					const n = displayPoints.length;
					if (n >= 3) {
						const p0 = displayPoints[n - 3];
						const p1 = displayPoints[n - 2];
						const p2 = displayPoints[n - 1];
						const p3 = displayPoints[n - 1]; // End point is repeated for p3
						arrowPoint = this.catmullRomSpline(p0, p1, p2, p3, 0.5); // 50% along the last curve segment
					} else {
						// Fallback for 2-point curve (straight line)
						const t = 0.75;
						arrowPoint = {
							x:
								displayPoints[0].x +
								(displayPoints[1].x - displayPoints[0].x) * t,
							y:
								displayPoints[0].y +
								(displayPoints[1].y - displayPoints[0].y) * t,
						};
					}
				}

				this.drawArrow(
					ctx,
					arrowPoint,
					displayEnd,
					element.color,
					this.#config.rendering.arrowSize
				);
			}
		}

		// Draw handles/points
		displayPoints.forEach((point, index) => {
			const isDraggable = element.completed;
			const radius = isDraggable ? 6 : 4;
			const isBeingDragged =
				dragState.isDragging &&
				dragState.elementId === element.id &&
				dragState.pointIndex === index;

			ctx.beginPath();
			ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
			ctx.fillStyle = isBeingDragged ? "#ffff00" : element.color;
			ctx.fill();

			if (isDraggable) {
				ctx.beginPath();
				ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
				ctx.strokeStyle = isBeingDragged ? "#ff0000" : "#fff";
				ctx.lineWidth = isBeingDragged ? 2 : 1;
				ctx.stroke();
			}

			if (element.type === "area" || element.type === "curve") {
				ctx.fillStyle = "#fff";
				ctx.font = "12px Arial";
				ctx.textAlign = "center";
				ctx.fillText((index + 1).toString(), point.x, point.y + 4);
			}
		});

		// Draw handles for detection points (only for DETECTION type elements)
		if (element.detection && element.info?.type === "DETECTION") {
			const allDetectionPoints = [
				...element.detection.entry,
				...element.detection.exit,
			].map((p) => this.mediaToDisplayCoords(p));

			allDetectionPoints.forEach((point) => {
				const size = 8; // Draggable square handle size
				const halfSize = size / 2;
				ctx.fillStyle = element.color;
				ctx.fillRect(point.x - halfSize, point.y - halfSize, size, size);
				ctx.strokeStyle = "#fff";
				ctx.lineWidth = 1;
				ctx.strokeRect(point.x - halfSize, point.y - halfSize, size, size);
			});
		}

		// Draw info label if present
		if (element.info?.name && element.completed) {
			this.drawElementText(ctx, element, displayPoints);
		}
	}

	drawElementText(
		ctx: CanvasRenderingContext2D,
		element: DrawingElement,
		displayPoints: Point[]
	): void {
		if (!element.info?.name || displayPoints.length === 0) return;

		const textData = element.info;
		let textPoint: Point;

		// Position text based on element type
		if (element.type === "rectangle" && displayPoints.length >= 2) {
			const x1 = Math.min(displayPoints[0].x, displayPoints[1].x);
			const y1 = Math.min(displayPoints[0].y, displayPoints[1].y);
			const x2 = Math.max(displayPoints[0].x, displayPoints[1].x);
			const y2 = Math.max(displayPoints[0].y, displayPoints[1].y);
			textPoint = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
		} else if (element.type === "circle" && displayPoints.length >= 2) {
			textPoint = displayPoints[0];
		} else if (element.type === "area" && displayPoints.length >= 3) {
			const centroidX =
				displayPoints.reduce((sum, p) => sum + p.x, 0) / displayPoints.length;
			const centroidY =
				displayPoints.reduce((sum, p) => sum + p.y, 0) / displayPoints.length;
			textPoint = { x: centroidX, y: centroidY };
		} else {
			const midIndex = Math.floor(displayPoints.length / 2);
			if (displayPoints.length === 2) {
				textPoint = {
					x: (displayPoints[0].x + displayPoints[1].x) / 2,
					y: (displayPoints[0].y + displayPoints[1].y) / 2,
				};
			} else {
				textPoint = displayPoints[midIndex];
			}
		}

		ctx.font = `${textData.fontSize}px ${textData.fontFamily}`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		const metrics = ctx.measureText(textData.name);
		const textWidth = metrics.width;
		const textHeight = textData.fontSize;

		if (textData.backgroundColor) {
			// Save current globalAlpha (could be layer opacity)
			const previousAlpha = ctx.globalAlpha;

			ctx.fillStyle = textData.backgroundColor;
			ctx.globalAlpha = textData.backgroundOpacity * previousAlpha;
			ctx.fillRect(
				textPoint.x - textWidth / 2 - 4,
				textPoint.y - textHeight / 2 - 2,
				textWidth + 8,
				textHeight + 4
			);

			// Restore previous globalAlpha instead of hardcoding to 1
			ctx.globalAlpha = previousAlpha;
		}

		ctx.fillStyle = "#000000";
		ctx.fillText(textData.name, textPoint.x, textPoint.y);
	}

	redrawCanvas(
		canvas: HTMLCanvasElement,
		elements: DrawingElement[],
		currentElement: DrawingElement | null,
		selectedElements: string[],
		hoveredElement: string | null,
		dragState: DragState,
		layers?: Map<string, { opacity: number }>
	): void {
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.imageSmoothingEnabled = this.#config.rendering.antiAlias;
		ctx.imageSmoothingQuality = this.#config.rendering.antiAlias
			? "high"
			: "low";

		// If layers are provided, group elements by layer and render with layer properties
		if (layers && layers.size > 0) {
			// Group elements by layer
			const elementsByLayer = new Map<string, DrawingElement[]>();
			const elementsWithoutLayer: DrawingElement[] = [];

			elements.forEach((element) => {
				if (element.layerId && layers.has(element.layerId)) {
					if (!elementsByLayer.has(element.layerId)) {
						elementsByLayer.set(element.layerId, []);
					}
					const layerElements = elementsByLayer.get(element.layerId);
					if (layerElements) {
						layerElements.push(element);
					}
				} else {
					elementsWithoutLayer.push(element);
				}
			});

			// Render elements without layer (backward compatibility) with default settings
			elementsWithoutLayer.forEach((element) => {
				this.drawElement(
					ctx,
					element,
					selectedElements,
					hoveredElement,
					dragState
				);
			});

			// Render each layer with its properties
			Array.from(layers.entries())
				.sort(
					([, a], [, b]) =>
						(a as { zIndex?: number }).zIndex ||
						0 - ((b as { zIndex?: number }).zIndex || 0)
				)
				.forEach(([layerId, layerProps]) => {
					const layerElements = elementsByLayer.get(layerId);
					if (!layerElements || layerElements.length === 0) return;

					// Save context state
					ctx.save();

					// Apply layer opacity
					ctx.globalAlpha = layerProps.opacity;

					// Reset to normal composite operation
					ctx.globalCompositeOperation = "source-over";

					// Render all elements in this layer
					layerElements.forEach((element) => {
						this.drawElement(
							ctx,
							element,
							selectedElements,
							hoveredElement,
							dragState
						);
					});

					// Restore context state
					ctx.restore();
				});
		} else {
			// Fallback to simple rendering without layer properties
			elements.forEach((element) => {
				this.drawElement(
					ctx,
					element,
					selectedElements,
					hoveredElement,
					dragState
				);
			});
		}

		// Render current element (always on top)
		if (currentElement) {
			// Save context state
			ctx.save();

			// Apply layer properties to current element if it has a layer
			if (
				currentElement.layerId &&
				layers &&
				layers.has(currentElement.layerId)
			) {
				const layerProps = layers.get(currentElement.layerId);
				if (!layerProps) {
					ctx.restore();
					return;
				}
				ctx.globalAlpha = layerProps.opacity;

				// Reset to normal composite operation
				ctx.globalCompositeOperation = "source-over";
			}

			this.drawElement(
				ctx,
				currentElement,
				selectedElements,
				hoveredElement,
				dragState
			);

			// Restore context state
			ctx.restore();
		}
	}

	// Matrix generation methods
	generateMatrix(elements: DrawingElement[]): MediaMatrix {
		const { media } = this.#config.resolution;
		const matrix: number[][] = new Array(media.height)
			.fill(null)
			.map(() => new Array(media.width).fill(0));

		elements.forEach((element) => {
			const value =
				element.type === "line" ? 1 : element.type === "area" ? 2 : 3;

			if (element.type === "line" && element.points.length >= 2) {
				this.#drawLineInMatrix(
					matrix,
					element.points[0],
					element.points[1],
					value
				);
			} else if (element.type === "area" && element.points.length >= 3) {
				this.#fillPolygonInMatrix(matrix, element.points, value);
			} else if (element.type === "curve" && element.points.length >= 3) {
				this.#drawCurveInMatrix(matrix, element.points, value);
			} else if (element.type === "rectangle" && element.points.length >= 2) {
				const x1 = Math.min(element.points[0].x, element.points[1].x);
				const y1 = Math.min(element.points[0].y, element.points[1].y);
				const x2 = Math.max(element.points[0].x, element.points[1].x);
				const y2 = Math.max(element.points[0].y, element.points[1].y);

				for (
					let y = Math.max(0, Math.floor(y1));
					y <= Math.min(media.height - 1, Math.floor(y2));
					y++
				) {
					for (
						let x = Math.max(0, Math.floor(x1));
						x <= Math.min(media.width - 1, Math.floor(x2));
						x++
					) {
						matrix[y][x] = 4;
					}
				}
			} else if (element.type === "circle" && element.points.length >= 2) {
				const centerX = element.points[0].x;
				const centerY = element.points[0].y;
				const radius = Math.sqrt(
					(element.points[1].x - centerX) ** 2 +
						(element.points[1].y - centerY) ** 2
				);

				const minX = Math.max(0, Math.floor(centerX - radius));
				const maxX = Math.min(media.width - 1, Math.ceil(centerX + radius));
				const minY = Math.max(0, Math.floor(centerY - radius));
				const maxY = Math.min(media.height - 1, Math.ceil(centerY + radius));

				for (let y = minY; y <= maxY; y++) {
					for (let x = minX; x <= maxX; x++) {
						const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
						if (distance <= radius) {
							matrix[y][x] = 5;
						}
					}
				}
			}
		});

		return {
			width: media.width,
			height: media.height,
			matrix,
			elements,
		};
	}

	#drawLineInMatrix(
		matrix: number[][],
		start: Point,
		end: Point,
		value: number
	): void {
		const { media } = this.#config.resolution;

		const x0 = Math.round(start.x);
		const y0 = Math.round(start.y);
		const x1 = Math.round(end.x);
		const y1 = Math.round(end.y);

		const dx = Math.abs(x1 - x0);
		const dy = Math.abs(y1 - y0);
		const sx = x0 < x1 ? 1 : -1;
		const sy = y0 < y1 ? 1 : -1;
		let err = dx - dy;

		let x = x0;
		let y = y0;

		while (true) {
			if (x >= 0 && x < media.width && y >= 0 && y < media.height) {
				matrix[y][x] = value;
			}

			if (x === x1 && y === y1) break;

			const e2 = 2 * err;
			if (e2 > -dy) {
				err -= dy;
				x += sx;
			}
			if (e2 < dx) {
				err += dx;
				y += sy;
			}
		}
	}

	#fillPolygonInMatrix(
		matrix: number[][],
		points: Point[],
		value: number
	): void {
		if (points.length < 3) return;
		const { media } = this.#config.resolution;

		const minY = Math.max(0, Math.floor(Math.min(...points.map((p) => p.y))));
		const maxY = Math.min(
			media.height - 1,
			Math.ceil(Math.max(...points.map((p) => p.y)))
		);

		for (let y = minY; y <= maxY; y++) {
			const intersections: number[] = [];

			for (let i = 0; i < points.length; i++) {
				const p1 = points[i];
				const p2 = points[(i + 1) % points.length];

				if ((p1.y <= y && p2.y > y) || (p2.y <= y && p1.y > y)) {
					const x = p1.x + ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y);
					intersections.push(x);
				}
			}

			intersections.sort((a, b) => a - b);

			for (let i = 0; i < intersections.length; i += 2) {
				if (i + 1 < intersections.length) {
					const startX = Math.max(0, Math.ceil(intersections[i]));
					const endX = Math.min(
						media.width - 1,
						Math.floor(intersections[i + 1])
					);

					for (let x = startX; x <= endX; x++) {
						matrix[y][x] = value;
					}
				}
			}
		}
	}

	#drawCurveInMatrix(matrix: number[][], points: Point[], value: number): void {
		if (points.length < 3) return;
		const { media } = this.#config.resolution;

		for (let i = 0; i < points.length - 1; i++) {
			const p0 = i > 0 ? points[i - 1] : points[i];
			const p1 = points[i];
			const p2 = points[i + 1];
			const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1];

			for (let t = 0; t <= 1; t += 0.01) {
				const point = this.catmullRomSpline(p0, p1, p2, p3, t);
				const x = Math.round(point.x);
				const y = Math.round(point.y);

				if (x >= 0 && x < media.width && y >= 0 && y < media.height) {
					matrix[y][x] = value;
				}
			}
		}
	}

	#calculatePerpendicularLine(
		point: Point,
		vector: Point,
		length: number
	): [Point, Point] {
		const perpendicularVector = { x: -vector.y, y: vector.x };
		const magnitude = Math.sqrt(
			perpendicularVector.x ** 2 + perpendicularVector.y ** 2
		);
		if (magnitude === 0) {
			// Handle zero-length vector case, default to a horizontal line
			return [
				{ x: point.x, y: point.y - length / 2 },
				{ x: point.x, y: point.y + length / 2 },
			];
		}
		const normalizedVector = {
			x: perpendicularVector.x / magnitude,
			y: perpendicularVector.y / magnitude,
		};

		const halfLength = length / 2;
		const p1 = {
			x: point.x + normalizedVector.x * halfLength,
			y: point.y + normalizedVector.y * halfLength,
		};
		const p2 = {
			x: point.x - normalizedVector.x * halfLength,
			y: point.y - normalizedVector.y * halfLength,
		};
		return [p1, p2];
	}

	#updateDetectionLines(
		element: DrawingElement
	): { entry: Point[]; exit: Point[] } | undefined {
		if (
			(element.type !== "line" && element.type !== "curve") ||
			element.points.length < 2
		) {
			return undefined;
		}

		const entryPoint = element.points[0];
		const exitPoint = element.points[element.points.length - 1];
		const entryVector = {
			x: element.points[1].x - entryPoint.x,
			y: element.points[1].y - entryPoint.y,
		};

		// For a 2-point line, the exit vector is the same as the entry vector.
		const exitVectorSourceIndex =
			element.points.length > 2 ? element.points.length - 2 : 0;
		const exitVector = {
			x: exitPoint.x - element.points[exitVectorSourceIndex].x,
			y: exitPoint.y - element.points[exitVectorSourceIndex].y,
		};

		const entryLine = this.#calculatePerpendicularLine(
			entryPoint,
			entryVector,
			40
		);
		const exitLine = this.#calculatePerpendicularLine(
			exitPoint,
			exitVector,
			40
		);

		return {
			entry: entryLine,
			exit: exitLine,
		};
	}

	/**
	 * Takes a snapshot of the canvas with the media behind and all drawn elements.
	 * Returns a Promise that resolves to a Blob containing the image data.
	 *
	 * @param elements - Array of drawing elements to render
	 * @param layers - Optional map of layer properties for opacity
	 * @param format - Image format ('png' or 'jpeg')
	 * @param quality - Image quality for JPEG format (0 to 1)
	 * @returns Promise<Blob> - The snapshot as an image blob
	 */
	async takeSnapshot(
		elements: DrawingElement[],
		layers?: Map<string, { opacity: number }>,
		format: "png" | "jpeg" = "png",
		quality: number = 0.92
	): Promise<Blob> {
		const { media, canvas } = this.#config;
		const { display } = this.#config.resolution;

		// Validate display dimensions - use canvas dimensions as fallback
		let snapshotWidth = display.width;
		let snapshotHeight = display.height;

		if (snapshotWidth <= 0 || snapshotHeight <= 0) {
			// Fallback to actual canvas CSS dimensions
			const canvasRect = canvas.getBoundingClientRect();
			snapshotWidth = canvasRect.width;
			snapshotHeight = canvasRect.height;
		}

		if (snapshotWidth <= 0 || snapshotHeight <= 0) {
			throw new Error(
				`Invalid snapshot dimensions: ${snapshotWidth}x${snapshotHeight}`
			);
		}

		// Create a temporary canvas for the snapshot
		const snapshotCanvas = document.createElement("canvas");
		snapshotCanvas.width = snapshotWidth;
		snapshotCanvas.height = snapshotHeight;

		const ctx = snapshotCanvas.getContext("2d");
		if (!ctx) {
			throw new Error("Failed to get canvas 2d context for snapshot");
		}

		// Configure context
		ctx.imageSmoothingEnabled = this.#config.rendering.antiAlias;
		ctx.imageSmoothingQuality = this.#config.rendering.antiAlias
			? "high"
			: "low";

		// Draw the media (video frame or image) first
		ctx.drawImage(media, 0, 0, snapshotWidth, snapshotHeight);

		// Draw elements on top (without selection/hover highlighting for a clean snapshot)
		// Create a temporary empty drag state for clean rendering
		const cleanDragState: DragState = {
			isDragging: false,
			elementId: null,
			pointIndex: null,
		};

		// Filter out deleted elements
		const visibleElements = elements.filter((el) => el.syncState !== "deleted");

		// Render elements similar to redrawCanvas but without selection/hover states
		if (layers && layers.size > 0) {
			// Group elements by layer
			const elementsByLayer = new Map<string, DrawingElement[]>();
			const elementsWithoutLayer: DrawingElement[] = [];

			visibleElements.forEach((element) => {
				if (element.layerId && layers.has(element.layerId)) {
					if (!elementsByLayer.has(element.layerId)) {
						elementsByLayer.set(element.layerId, []);
					}
					const layerElements = elementsByLayer.get(element.layerId);
					if (layerElements) {
						layerElements.push(element);
					}
				} else {
					elementsWithoutLayer.push(element);
				}
			});

			// Render elements without layer
			elementsWithoutLayer.forEach((element) => {
				this.drawElement(ctx, element, [], null, cleanDragState);
			});

			// Render each layer with its properties
			Array.from(layers.entries())
				.sort(
					([, a], [, b]) =>
						(a as { zIndex?: number }).zIndex ||
						0 - ((b as { zIndex?: number }).zIndex || 0)
				)
				.forEach(([layerId, layerProps]) => {
					const layerElements = elementsByLayer.get(layerId);
					if (!layerElements || layerElements.length === 0) return;

					ctx.save();
					ctx.globalAlpha = layerProps.opacity;
					ctx.globalCompositeOperation = "source-over";

					layerElements.forEach((element) => {
						this.drawElement(ctx, element, [], null, cleanDragState);
					});

					ctx.restore();
				});
		} else {
			// Simple rendering without layer properties
			visibleElements.forEach((element) => {
				this.drawElement(ctx, element, [], null, cleanDragState);
			});
		}

		// Convert canvas to blob
		return new Promise<Blob>((resolve, reject) => {
			const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
			try {
				snapshotCanvas.toBlob(
					(blob) => {
						if (blob) {
							resolve(blob);
						} else {
							reject(new Error("Failed to create snapshot blob"));
						}
					},
					mimeType,
					quality
				);
			} catch (error) {
				reject(
					new Error(
						`toBlob failed: ${error instanceof Error ? error.message : String(error)}`
					)
				);
			}
		});
	}

	/**
	 * Takes a snapshot and triggers a download with the specified filename.
	 * This method is synchronous to preserve the user gesture context for downloads.
	 * If cross-origin media cannot be captured, falls back to capturing just the drawing canvas.
	 *
	 * @param elements - Array of drawing elements to render
	 * @param layers - Optional map of layer properties
	 * @param filename - The filename for the downloaded image (without extension)
	 * @param format - Image format ('png' or 'jpeg')
	 * @param quality - Image quality for JPEG format (0 to 1)
	 * @returns Object with success status and whether fallback was used
	 */
	takeSnapshotAndDownload(
		elements: DrawingElement[],
		layers?: Map<string, { opacity: number }>,
		filename: string = "snapshot",
		format: "png" | "jpeg" = "png",
		quality: number = 1
	): { success: boolean; fallback: boolean } {
		const { media } = this.#config;
		const { target } = this.#config.resolution;

		// Use target resolution for the snapshot
		const snapshotWidth = target.width;
		const snapshotHeight = target.height;

		if (snapshotWidth <= 0 || snapshotHeight <= 0) {
			throw new Error(
				`Invalid target resolution: ${snapshotWidth}x${snapshotHeight}`
			);
		}

		// Create a temporary canvas for the snapshot at target resolution
		const snapshotCanvas = document.createElement("canvas");
		snapshotCanvas.width = snapshotWidth;
		snapshotCanvas.height = snapshotHeight;

		const ctx = snapshotCanvas.getContext("2d");
		if (!ctx) {
			throw new Error("Failed to get canvas 2d context for snapshot");
		}

		// Configure context
		ctx.imageSmoothingEnabled = this.#config.rendering.antiAlias;
		ctx.imageSmoothingQuality = this.#config.rendering.antiAlias
			? "high"
			: "low";

		// Try to draw the media (video frame or image) first at target resolution
		let mediaDrawn = false;
		try {
			ctx.drawImage(media, 0, 0, snapshotWidth, snapshotHeight);
			// Test if the canvas is tainted by trying to get image data
			ctx.getImageData(0, 0, 1, 1);
			mediaDrawn = true;
		} catch {
			// Cross-origin media - clear and use white background instead
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(0, 0, snapshotWidth, snapshotHeight);
		}

		// Draw elements on top using target coordinates
		const visibleElements = elements.filter((el) => el.syncState !== "deleted");

		// Helper to draw element at target resolution
		const drawElementAtTarget = (element: DrawingElement) => {
			this.#drawElementAtTargetResolution(ctx, element);
		};

		if (layers && layers.size > 0) {
			const elementsByLayer = new Map<string, DrawingElement[]>();
			const elementsWithoutLayer: DrawingElement[] = [];

			visibleElements.forEach((element) => {
				if (element.layerId && layers.has(element.layerId)) {
					if (!elementsByLayer.has(element.layerId)) {
						elementsByLayer.set(element.layerId, []);
					}
					const layerElements = elementsByLayer.get(element.layerId);
					if (layerElements) {
						layerElements.push(element);
					}
				} else {
					elementsWithoutLayer.push(element);
				}
			});

			elementsWithoutLayer.forEach(drawElementAtTarget);

			Array.from(layers.entries())
				.sort(
					([, a], [, b]) =>
						(a as { zIndex?: number }).zIndex ||
						0 - ((b as { zIndex?: number }).zIndex || 0)
				)
				.forEach(([layerId, layerProps]) => {
					const layerElements = elementsByLayer.get(layerId);
					if (!layerElements || layerElements.length === 0) return;

					ctx.save();
					ctx.globalAlpha = layerProps.opacity;
					ctx.globalCompositeOperation = "source-over";

					layerElements.forEach(drawElementAtTarget);

					ctx.restore();
				});
		} else {
			visibleElements.forEach(drawElementAtTarget);
		}

		// Use toDataURL for download (synchronous)
		const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
		const dataUrl = snapshotCanvas.toDataURL(mimeType, quality);

		// Create and trigger download immediately (synchronous to preserve user gesture)
		const link = document.createElement("a");
		link.href = dataUrl;
		link.download = `${filename}.${format}`;
		link.style.display = "none";

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		return { success: true, fallback: !mediaDrawn };
	}

	/**
	 * Draws an element at target resolution coordinates.
	 * Similar to drawElement but uses mediaToTargetCoords instead of mediaToDisplayCoords.
	 * Does not draw selection highlights or drag handles (for clean snapshot output).
	 */
	#drawElementAtTargetResolution(
		ctx: CanvasRenderingContext2D,
		element: DrawingElement
	): void {
		if (element.points.length === 0) return;

		// Convert points from media coordinates to target coordinates
		const targetPoints = element.points.map((point) =>
			this.mediaToTargetCoords(point)
		);

		ctx.strokeStyle = element.color;
		ctx.lineWidth = this.#config.rendering.defaultLineWidth;
		ctx.beginPath();

		// Draw based on element type (matching drawElement logic)
		if (element.type === "line") {
			if (targetPoints.length >= 2) {
				ctx.moveTo(targetPoints[0].x, targetPoints[0].y);
				ctx.lineTo(targetPoints[1].x, targetPoints[1].y);
			} else if (targetPoints.length === 1) {
				ctx.arc(targetPoints[0].x, targetPoints[0].y, 2, 0, 2 * Math.PI);
			}
		} else if (element.type === "area") {
			if (targetPoints.length > 0) {
				ctx.moveTo(targetPoints[0].x, targetPoints[0].y);
				for (let i = 1; i < targetPoints.length; i++) {
					ctx.lineTo(targetPoints[i].x, targetPoints[i].y);
				}
				if (element.completed && targetPoints.length > 2) {
					ctx.closePath();
					ctx.fillStyle = element.color + "20";
					ctx.fill();
				}
			}
		} else if (element.type === "curve") {
			if (targetPoints.length >= 2) {
				ctx.moveTo(targetPoints[0].x, targetPoints[0].y);
				if (targetPoints.length === 2) {
					ctx.lineTo(targetPoints[1].x, targetPoints[1].y);
				} else {
					for (let i = 0; i < targetPoints.length - 1; i++) {
						const p0 = i > 0 ? targetPoints[i - 1] : targetPoints[i];
						const p1 = targetPoints[i];
						const p2 = targetPoints[i + 1];
						const p3 =
							i < targetPoints.length - 2
								? targetPoints[i + 2]
								: targetPoints[i + 1];

						for (let t = 0.1; t <= 1; t += 0.1) {
							const point = this.catmullRomSpline(p0, p1, p2, p3, t);
							ctx.lineTo(point.x, point.y);
						}
					}
				}
			}
		} else if (element.type === "rectangle" && targetPoints.length >= 2) {
			const x = Math.min(targetPoints[0].x, targetPoints[1].x);
			const y = Math.min(targetPoints[0].y, targetPoints[1].y);
			const width = Math.abs(targetPoints[1].x - targetPoints[0].x);
			const height = Math.abs(targetPoints[1].y - targetPoints[0].y);

			ctx.rect(x, y, width, height);
			if (element.completed) {
				ctx.fillStyle = element.color + "20";
				ctx.fill();
			}
		} else if (element.type === "circle" && targetPoints.length >= 2) {
			const centerX = targetPoints[0].x;
			const centerY = targetPoints[0].y;
			const radius = Math.sqrt(
				(targetPoints[1].x - centerX) ** 2 + (targetPoints[1].y - centerY) ** 2
			);

			ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
			if (element.completed) {
				ctx.fillStyle = element.color + "20";
				ctx.fill();
			}
		}

		ctx.stroke();

		// Draw detection lines (only for DETECTION type elements)
		if (
			element.detection &&
			element.info?.type === "DETECTION" &&
			(element.type === "line" || element.type === "curve")
		) {
			ctx.save();
			ctx.strokeStyle = element.color;
			ctx.lineWidth = 1;
			ctx.setLineDash([5, 5]);

			const entry = element.detection.entry.map((p) =>
				this.mediaToTargetCoords(p)
			);
			if (entry.length === 2) {
				ctx.beginPath();
				ctx.moveTo(entry[0].x, entry[0].y);
				ctx.lineTo(entry[1].x, entry[1].y);
				ctx.stroke();
			}

			const exit = element.detection.exit.map((p) =>
				this.mediaToTargetCoords(p)
			);
			if (exit.length === 2) {
				ctx.beginPath();
				ctx.moveTo(exit[0].x, exit[0].y);
				ctx.lineTo(exit[1].x, exit[1].y);
				ctx.stroke();
			}

			ctx.restore();
		}

		// Draw direction arrows for lines and curves
		if (
			this.#config.rendering.showDirectionArrows &&
			element.completed &&
			(element.type === "line" || element.type === "curve")
		) {
			const direction = element.direction || this.calculateDirection(element);
			if (direction && targetPoints.length >= 2) {
				const targetStart = this.mediaToTargetCoords(direction.start);
				const targetEnd = this.mediaToTargetCoords(direction.end);

				let arrowPoint: Point;
				if (element.type === "line") {
					const t = 0.75;
					arrowPoint = {
						x: targetStart.x + (targetEnd.x - targetStart.x) * t,
						y: targetStart.y + (targetEnd.y - targetStart.y) * t,
					};
				} else {
					// curve
					const n = targetPoints.length;
					if (n >= 3) {
						const p0 = targetPoints[n - 3];
						const p1 = targetPoints[n - 2];
						const p2 = targetPoints[n - 1];
						const p3 = targetPoints[n - 1];
						arrowPoint = this.catmullRomSpline(p0, p1, p2, p3, 0.5);
					} else {
						const t = 0.75;
						arrowPoint = {
							x:
								targetPoints[0].x + (targetPoints[1].x - targetPoints[0].x) * t,
							y:
								targetPoints[0].y + (targetPoints[1].y - targetPoints[0].y) * t,
						};
					}
				}

				this.drawArrow(
					ctx,
					arrowPoint,
					targetEnd,
					element.color,
					this.#config.rendering.arrowSize
				);
			}
		}

		// Draw handles/points (dots)
		targetPoints.forEach((point, index) => {
			const isDraggable = element.completed;
			const radius = isDraggable ? 6 : 4;

			ctx.beginPath();
			ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
			ctx.fillStyle = element.color;
			ctx.fill();

			if (isDraggable) {
				ctx.beginPath();
				ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
				ctx.strokeStyle = "#fff";
				ctx.lineWidth = 1;
				ctx.stroke();
			}

			// Draw point numbers for area and curve
			if (element.type === "area" || element.type === "curve") {
				ctx.fillStyle = "#fff";
				ctx.font = "12px Arial";
				ctx.textAlign = "center";
				ctx.fillText((index + 1).toString(), point.x, point.y + 4);
			}
		});

		// Draw handles for detection points (only for DETECTION type elements)
		if (element.detection && element.info?.type === "DETECTION") {
			const allDetectionPoints = [
				...element.detection.entry,
				...element.detection.exit,
			].map((p) => this.mediaToTargetCoords(p));

			allDetectionPoints.forEach((point) => {
				const size = 8;
				const halfSize = size / 2;
				ctx.fillStyle = element.color;
				ctx.fillRect(point.x - halfSize, point.y - halfSize, size, size);
				ctx.strokeStyle = "#fff";
				ctx.lineWidth = 1;
				ctx.strokeRect(point.x - halfSize, point.y - halfSize, size, size);
			});
		}

		// Draw text annotation if present
		if (element.info?.name && element.completed) {
			this.#drawElementTextAtTargetResolution(ctx, element, targetPoints);
		}
	}

	/**
	 * Draws element text annotation at target resolution.
	 * Matches the original drawElementText method logic.
	 */
	#drawElementTextAtTargetResolution(
		ctx: CanvasRenderingContext2D,
		element: DrawingElement,
		targetPoints: Point[]
	): void {
		if (!element.info?.name || targetPoints.length === 0) return;

		const textData = element.info;
		let textPoint: Point;

		// Position text based on element type (matching drawElementText logic)
		if (element.type === "rectangle" && targetPoints.length >= 2) {
			const x1 = Math.min(targetPoints[0].x, targetPoints[1].x);
			const y1 = Math.min(targetPoints[0].y, targetPoints[1].y);
			const x2 = Math.max(targetPoints[0].x, targetPoints[1].x);
			const y2 = Math.max(targetPoints[0].y, targetPoints[1].y);
			textPoint = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
		} else if (element.type === "circle" && targetPoints.length >= 2) {
			textPoint = targetPoints[0];
		} else if (element.type === "area" && targetPoints.length >= 3) {
			const centroidX =
				targetPoints.reduce((sum, p) => sum + p.x, 0) / targetPoints.length;
			const centroidY =
				targetPoints.reduce((sum, p) => sum + p.y, 0) / targetPoints.length;
			textPoint = { x: centroidX, y: centroidY };
		} else {
			const midIndex = Math.floor(targetPoints.length / 2);
			if (targetPoints.length === 2) {
				textPoint = {
					x: (targetPoints[0].x + targetPoints[1].x) / 2,
					y: (targetPoints[0].y + targetPoints[1].y) / 2,
				};
			} else {
				textPoint = targetPoints[midIndex];
			}
		}

		const fontSize = textData.fontSize || this.#config.text.defaultFontSize;
		const fontFamily =
			textData.fontFamily || this.#config.text.defaultFontFamily;

		ctx.font = `${fontSize}px ${fontFamily}`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		const metrics = ctx.measureText(textData.name);
		const textWidth = metrics.width;
		const textHeight = fontSize;

		// Draw background if enabled
		if (textData.backgroundColor) {
			const previousAlpha = ctx.globalAlpha;
			ctx.fillStyle = textData.backgroundColor;
			ctx.globalAlpha =
				(textData.backgroundOpacity ??
					this.#config.text.defaultBackgroundOpacity) * previousAlpha;
			ctx.fillRect(
				textPoint.x - textWidth / 2 - 4,
				textPoint.y - textHeight / 2 - 2,
				textWidth + 8,
				textHeight + 4
			);
			ctx.globalAlpha = previousAlpha;
		}

		// Draw text (black color to match original)
		ctx.fillStyle = "#000000";
		ctx.fillText(textData.name, textPoint.x, textPoint.y);
	}
}
