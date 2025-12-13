import type { DrawingConfig } from "./config";
import type { DrawingLayers } from "./layers";
import type { DrawingState } from "./state";
import type { AlignmentType, DrawingElement, Point, StateChangeEvent } from "./types";

/**
 * Arrangement operation types
 */
type ArrangementOperation =
	| "group"
	| "ungroup"
	| "bringToFront"
	| "sendToBack"
	| "bringForward"
	| "sendBackward"
	| "alignLeft"
	| "alignRight"
	| "alignTop"
	| "alignBottom"
	| "alignCenterX"
	| "alignCenterY"
	| "distributeHorizontally"
	| "distributeVertically"
	| "flipHorizontal"
	| "flipVertical"
	| "rotateClockwise"
	| "rotateCounterClockwise"
	| "rotate90"
	| "rotate180"
	| "rotate270"
	| "lockAspectRatio"
	| "fitToContainer"
	| "centerInContainer";

/**
 * Bounds information for an element or group
 */
interface ElementBounds {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
	width: number;
	height: number;
	centerX: number;
	centerY: number;
}

/**
 * Group information
 */
interface GroupInfo {
	id: string;
	elementIds: string[];
	bounds: ElementBounds;
	createdAt: number;
	metadata?: {
		name?: string;
		description?: string;
		color?: string;
	};
}

/**
 * Result of an arrangement operation
 */
interface ArrangementResult {
	success: boolean;
	operation: ArrangementOperation;
	affectedElements: string[];
	changes: {
		elementId: string;
		before: Partial<DrawingElement>;
		after: Partial<DrawingElement>;
	}[];
	message: string;
}

/**
 * DrawingArrange - Handles element arrangement, grouping, and layout operations
 * Provides comprehensive tools for organizing and arranging drawing elements
 */
export class DrawingArrange {
	#config: DrawingConfig;
	#layers: DrawingLayers;
	#state: DrawingState;

	// Layout and arrangement state (for future implementation)
	// #snapPoints: Point[] = [];
	// #alignmentGuides: {
	// 	horizontal: number[];
	// 	vertical: number[];
	// } = { horizontal: [], vertical: [] };

	constructor(config: DrawingConfig, layers: DrawingLayers, state: DrawingState) {
		this.#config = config;
		this.#layers = layers;
		this.#state = state;
	}

	/**
	 * Group selected elements
	 */
	groupElements(
		selectedElements: string[],
		elements: DrawingElement[],
		metadata?: GroupInfo["metadata"]
	): ArrangementResult {
		if (selectedElements.length < 2) {
			return {
				success: false,
				operation: "group",
				affectedElements: [],
				changes: [],
				message: "Select at least 2 elements to group",
			};
		}

		const groupId = this.#generateGroupId();
		const groupElements = elements.filter((el) => selectedElements.includes(el.id));
		const bounds = this.#calculateGroupBounds(groupElements);

		// Create group info
		const groupInfo: GroupInfo = {
			id: groupId,
			elementIds: selectedElements,
			bounds,
			createdAt: Date.now(),
			metadata,
		};

		this.#state.groups.set(groupId, groupInfo);

		// Update elements with group ID
		const changes = selectedElements.map((elementId) => ({
			elementId,
			before: {},
			after: { groupId },
		}));

		const updatedElements = elements.map((element) =>
			selectedElements.includes(element.id) ? { ...element, groupId } : element
		);

		this.#triggerStateChange("updateElements", { elements: updatedElements });

		// If layers system is available, ensure grouped elements are on the same layer
		if (this.#layers) {
			const activeLayer = this.#layers.getActiveLayer();
			if (activeLayer) {
				this.#layers.moveElementsToLayer(selectedElements, activeLayer.id, updatedElements);
			}
		}

		this.#provideFeedback(`Grouped ${selectedElements.length} elements`);

		return {
			success: true,
			operation: "group",
			affectedElements: selectedElements,
			changes,
			message: `Grouped ${selectedElements.length} elements`,
		};
	}

	/**
	 * Group elements within the same layer
	 */
	groupElementsInLayer(
		selectedElements: string[],
		elements: DrawingElement[],
		layerId?: string,
		metadata?: GroupInfo["metadata"]
	): ArrangementResult {
		if (!this.#layers) {
			return this.groupElements(selectedElements, elements, metadata);
		}

		const targetLayerId = layerId || this.#layers.getActiveLayer()?.id;
		if (!targetLayerId) {
			return {
				success: false,
				operation: "group",
				affectedElements: [],
				changes: [],
				message: "No target layer available",
			};
		}

		// Filter elements to only include those in the target layer
		const layerElements = elements.filter(
			(el) => selectedElements.includes(el.id) && (el.layerId === targetLayerId || !el.layerId)
		);

		if (layerElements.length < 2) {
			return {
				success: false,
				operation: "group",
				affectedElements: [],
				changes: [],
				message: "Select at least 2 elements in the same layer to group",
			};
		}

		return this.groupElements(
			layerElements.map((el) => el.id),
			elements,
			metadata
		);
	}

	/**
	 * Ungroup selected elements
	 */
	ungroupElements(selectedElements: string[], elements: DrawingElement[]): ArrangementResult {
		const groupedElements = elements.filter((el) => selectedElements.includes(el.id) && el.groupId);

		if (groupedElements.length === 0) {
			return {
				success: false,
				operation: "ungroup",
				affectedElements: [],
				changes: [],
				message: "No grouped elements selected",
			};
		}

		const groupIds = new Set(groupedElements.map((el) => el.groupId).filter(Boolean));
		const changes: ArrangementResult["changes"] = [];

		// Remove group IDs from elements
		const updatedElements = elements.map((element) => {
			if (element.groupId && groupIds.has(element.groupId)) {
				changes.push({
					elementId: element.id,
					before: { groupId: element.groupId },
					after: {},
				});
				const { groupId: _groupId, ...elementWithoutGroup } = element;
				void _groupId; // Acknowledge the unused variable
				return elementWithoutGroup;
			}
			return element;
		});

		// Remove group info
		for (const groupId of groupIds) {
			if (groupId) {
				this.#state.groups.delete(groupId);
			}
		}

		this.#triggerStateChange("updateElements", { elements: updatedElements });

		return {
			success: true,
			operation: "ungroup",
			affectedElements: selectedElements,
			changes,
			message: `Ungrouped ${groupedElements.length} elements`,
		};
	}

	/**
	 * Move grouped elements to a different layer
	 */
	moveGroupToLayer(
		groupId: string,
		targetLayerId: string,
		elements: DrawingElement[]
	): ArrangementResult {
		if (!this.#layers) {
			return {
				success: false,
				operation: "group",
				affectedElements: [],
				changes: [],
				message: "Layers system not available",
			};
		}

		const groupInfo = this.#state.groups.get(groupId);
		if (!groupInfo) {
			return {
				success: false,
				operation: "group",
				affectedElements: [],
				changes: [],
				message: "Group not found",
			};
		}

		const result = this.#layers.moveElementsToLayer(groupInfo.elementIds, targetLayerId, elements);

		if (result.success) {
			return {
				success: true,
				operation: "group",
				affectedElements: groupInfo.elementIds,
				changes: [],
				message: `Moved group to layer`,
			};
		}

		return {
			success: false,
			operation: "group",
			affectedElements: [],
			changes: [],
			message: result.message,
		};
	}

	/**
	 * Align elements based on alignment type
	 */
	alignElements(
		selectedElements: string[],
		elements: DrawingElement[],
		alignment: AlignmentType
	): ArrangementResult {
		if (selectedElements.length < 2) {
			return {
				success: false,
				operation:
					`align${alignment.charAt(0).toUpperCase()}${alignment.slice(1)}` as ArrangementOperation,
				affectedElements: [],
				changes: [],
				message: "Select at least 2 elements to align",
			};
		}

		const selectedEls = elements.filter((el) => selectedElements.includes(el.id));
		const bounds = selectedEls.map((el) => ({
			element: el,
			bounds: this.#getElementBounds(el),
		}));

		const validBounds = bounds.filter((b) => b.bounds !== null);
		if (validBounds.length === 0) {
			return {
				success: false,
				operation:
					`align${alignment.charAt(0).toUpperCase()}${alignment.slice(1)}` as ArrangementOperation,
				affectedElements: [],
				changes: [],
				message: "No valid elements to align",
			};
		}

		// Calculate reference point
		const referenceValue = this.#calculateAlignmentReference(
			validBounds.map((b) => b.bounds as ElementBounds),
			alignment
		);

		const changes: ArrangementResult["changes"] = [];
		const updatedElements = elements.map((element) => {
			if (!selectedElements.includes(element.id)) return element;

			const elementBounds = this.#getElementBounds(element);
			if (!elementBounds) return element;

			const offset = this.#calculateAlignmentOffset(elementBounds, alignment, referenceValue);

			if (offset.x === 0 && offset.y === 0) return element;

			const newPoints = element.points.map((point) => ({
				x: point.x + offset.x,
				y: point.y + offset.y,
			}));

			// Also move detection points if they exist
			const newDetection = element.detection
				? {
						entry: element.detection.entry.map((point) => ({
							x: point.x + offset.x,
							y: point.y + offset.y,
						})),
						exit: element.detection.exit.map((point) => ({
							x: point.x + offset.x,
							y: point.y + offset.y,
						})),
					}
				: undefined;

			changes.push({
				elementId: element.id,
				before: { points: element.points },
				after: { points: newPoints },
			});

			return {
				...element,
				points: newPoints,
				detection: newDetection,
			};
		});

		this.#triggerStateChange("updateElements", { elements: updatedElements });

		this.#provideFeedback(`Aligned elements: ${alignment}`);

		return {
			success: true,
			operation:
				`align${alignment.charAt(0).toUpperCase()}${alignment.slice(1)}` as ArrangementOperation,
			affectedElements: selectedElements,
			changes,
			message: `Aligned elements: ${alignment}`,
		};
	}

	/**
	 * Align elements within a specific layer
	 */
	alignElementsInLayer(
		selectedElements: string[],
		elements: DrawingElement[],
		alignment: AlignmentType,
		layerId?: string
	): ArrangementResult {
		if (!this.#layers) {
			return this.alignElements(selectedElements, elements, alignment);
		}

		const targetLayerId = layerId || this.#layers.getActiveLayer()?.id;
		if (!targetLayerId) {
			return {
				success: false,
				operation:
					`align${alignment.charAt(0).toUpperCase()}${alignment.slice(1)}` as ArrangementOperation,
				affectedElements: [],
				changes: [],
				message: "No target layer available",
			};
		}

		// Filter elements to only include those in the target layer and visible
		const layerElements = elements.filter((el) => {
			if (!selectedElements.includes(el.id)) return false;

			const elementLayerId = el.layerId || this.#layers?.getActiveLayer()?.id;
			if (elementLayerId !== targetLayerId) return false;

			const layer = this.#layers?.getLayer(elementLayerId);
			return layer?.visibility === "visible";
		});

		if (layerElements.length < 2) {
			return {
				success: false,
				operation:
					`align${alignment.charAt(0).toUpperCase()}${alignment.slice(1)}` as ArrangementOperation,
				affectedElements: [],
				changes: [],
				message: "Select at least 2 visible elements in the same layer to align",
			};
		}

		return this.alignElements(
			layerElements.map((el) => el.id),
			elements,
			alignment
		);
	}

	/**
	 * Distribute elements evenly
	 */
	distributeElements(
		selectedElements: string[],
		elements: DrawingElement[],
		direction: "horizontal" | "vertical",
		spacing?: number
	): ArrangementResult {
		if (selectedElements.length < 3) {
			return {
				success: false,
				operation: direction === "horizontal" ? "distributeHorizontally" : "distributeVertically",
				affectedElements: [],
				changes: [],
				message: "Select at least 3 elements to distribute",
			};
		}

		const selectedEls = elements.filter((el) => selectedElements.includes(el.id));
		const boundsArray = selectedEls
			.map((el) => ({
				element: el,
				bounds: this.#getElementBounds(el),
			}))
			.filter((b) => b.bounds !== null);

		if (boundsArray.length < 3) {
			return {
				success: false,
				operation: direction === "horizontal" ? "distributeHorizontally" : "distributeVertically",
				affectedElements: [],
				changes: [],
				message: "Need at least 3 valid elements to distribute",
			};
		}

		// Sort by position
		const isHorizontal = direction === "horizontal";
		boundsArray.sort((a, b) => {
			const posA = isHorizontal
				? (a.bounds as ElementBounds).centerX
				: (a.bounds as ElementBounds).centerY;
			const posB = isHorizontal
				? (b.bounds as ElementBounds).centerX
				: (b.bounds as ElementBounds).centerY;
			return posA - posB;
		});

		const first = boundsArray[0];
		const last = boundsArray[boundsArray.length - 1];
		const totalDistance = isHorizontal
			? (last.bounds as ElementBounds).centerX - (first.bounds as ElementBounds).centerX
			: (last.bounds as ElementBounds).centerY - (first.bounds as ElementBounds).centerY;

		const gaps = boundsArray.length - 1;
		const gapSize = spacing || totalDistance / gaps;

		const changes: ArrangementResult["changes"] = [];
		const updatedElements = elements.map((element) => {
			const boundsIndex = boundsArray.findIndex((b) => b.element.id === element.id);
			if (boundsIndex === -1 || boundsIndex === 0 || boundsIndex === boundsArray.length - 1) {
				return element; // Don't move first and last elements
			}

			const bounds = boundsArray[boundsIndex].bounds as ElementBounds;
			const targetPosition = isHorizontal
				? (first.bounds as ElementBounds).centerX + boundsIndex * gapSize
				: (first.bounds as ElementBounds).centerY + boundsIndex * gapSize;
			const currentPosition = isHorizontal ? bounds.centerX : bounds.centerY;
			const offset = targetPosition - currentPosition;

			const newPoints = element.points.map((point) => ({
				x: point.x + (isHorizontal ? offset : 0),
				y: point.y + (isHorizontal ? 0 : offset),
			}));

			// Also move detection points if they exist
			const newDetection = element.detection
				? {
						entry: element.detection.entry.map((point) => ({
							x: point.x + (isHorizontal ? offset : 0),
							y: point.y + (isHorizontal ? 0 : offset),
						})),
						exit: element.detection.exit.map((point) => ({
							x: point.x + (isHorizontal ? offset : 0),
							y: point.y + (isHorizontal ? 0 : offset),
						})),
					}
				: undefined;

			changes.push({
				elementId: element.id,
				before: { points: element.points },
				after: { points: newPoints },
			});

			return {
				...element,
				points: newPoints,
				detection: newDetection,
			};
		});

		this.#triggerStateChange("updateElements", { elements: updatedElements });

		return {
			success: true,
			operation: direction === "horizontal" ? "distributeHorizontally" : "distributeVertically",
			affectedElements: selectedElements,
			changes,
			message: `Distributed elements ${direction}ly`,
		};
	}

	/**
	 * Distribute elements within a specific layer
	 */
	distributeElementsInLayer(
		selectedElements: string[],
		elements: DrawingElement[],
		direction: "horizontal" | "vertical",
		layerId?: string,
		spacing?: number
	): ArrangementResult {
		if (!this.#layers) {
			return this.distributeElements(selectedElements, elements, direction, spacing);
		}

		const targetLayerId = layerId || this.#layers.getActiveLayer()?.id;
		if (!targetLayerId) {
			return {
				success: false,
				operation: direction === "horizontal" ? "distributeHorizontally" : "distributeVertically",
				affectedElements: [],
				changes: [],
				message: "No target layer available",
			};
		}

		// Filter elements to only include those in the target layer
		const layerElements = elements.filter((el) => {
			if (!selectedElements.includes(el.id)) return false;

			const elementLayerId = el.layerId || this.#layers?.getActiveLayer()?.id;
			return elementLayerId === targetLayerId;
		});

		if (layerElements.length < 3) {
			return {
				success: false,
				operation: direction === "horizontal" ? "distributeHorizontally" : "distributeVertically",
				affectedElements: [],
				changes: [],
				message: "Select at least 3 elements in the same layer to distribute",
			};
		}

		return this.distributeElements(
			layerElements.map((el) => el.id),
			elements,
			direction,
			spacing
		);
	}

	/**
	 * Change z-order of selected elements
	 */
	changeZOrder(
		selectedElements: string[],
		elements: DrawingElement[],
		operation: "bringToFront" | "sendToBack" | "bringForward" | "sendBackward"
	): ArrangementResult {
		if (selectedElements.length === 0) {
			return {
				success: false,
				operation,
				affectedElements: [],
				changes: [],
				message: "No elements selected",
			};
		}

		const selectedEls = elements.filter((el) => selectedElements.includes(el.id));
		const otherEls = elements.filter((el) => !selectedElements.includes(el.id));

		let reorderedElements: DrawingElement[] = [];

		switch (operation) {
			case "bringToFront":
				reorderedElements = [...otherEls, ...selectedEls];
				break;
			case "sendToBack":
				reorderedElements = [...selectedEls, ...otherEls];
				break;
			case "bringForward":
				reorderedElements = this.#moveElementsForward(elements, selectedElements);
				break;
			case "sendBackward":
				reorderedElements = this.#moveElementsBackward(elements, selectedElements);
				break;
			default:
				break;
		}

		this.#triggerStateChange("updateElements", { elements: reorderedElements });

		// Update layer element order if layers system is available
		if (this.#layers) {
			this.#updateLayerElementOrder(reorderedElements);
		}

		return {
			success: true,
			operation,
			affectedElements: selectedElements,
			changes: [], // Z-order changes don't modify element properties
			message: `${operation.replace(/([A-Z])/g, " $1").toLowerCase()}`,
		};
	}

	/**
	 * Change z-order of elements within their respective layers
	 */
	changeZOrderInLayer(
		selectedElements: string[],
		elements: DrawingElement[],
		operation: "bringToFront" | "sendToBack" | "bringForward" | "sendBackward",
		layerId?: string
	): ArrangementResult {
		if (!this.#layers) {
			return this.changeZOrder(selectedElements, elements, operation);
		}

		const targetLayerId = layerId || this.#layers.getActiveLayer()?.id;
		if (!targetLayerId) {
			return {
				success: false,
				operation,
				affectedElements: [],
				changes: [],
				message: "No target layer available",
			};
		}

		// Filter elements to only include those in the target layer
		const layerElements = elements.filter((el) => {
			const elementLayerId = el.layerId || this.#layers?.getActiveLayer()?.id;
			return elementLayerId === targetLayerId;
		});

		const selectedInLayer = layerElements.filter((el) => selectedElements.includes(el.id));

		if (selectedInLayer.length === 0) {
			return {
				success: false,
				operation,
				affectedElements: [],
				changes: [],
				message: "No selected elements in target layer",
			};
		}

		// Perform z-order change only within the layer
		const result = this.changeZOrder(
			selectedInLayer.map((el) => el.id),
			layerElements,
			operation
		);

		// Rebuild full elements array maintaining layer order
		const otherElements = elements.filter((el) => {
			const elementLayerId = el.layerId || this.#layers?.getActiveLayer()?.id;
			return elementLayerId !== targetLayerId;
		});

		const finalElements = [...otherElements, ...layerElements];
		this.#triggerStateChange("updateElements", { elements: finalElements });

		return {
			...result,
			message: `${operation.replace(/([A-Z])/g, " $1").toLowerCase()} within layer`,
		};
	}

	/**
	 * Flip elements horizontally or vertically
	 */
	flipElements(
		selectedElements: string[],
		elements: DrawingElement[],
		direction: "horizontal" | "vertical"
	): ArrangementResult {
		if (selectedElements.length === 0) {
			return {
				success: false,
				operation: direction === "horizontal" ? "flipHorizontal" : "flipVertical",
				affectedElements: [],
				changes: [],
				message: "No elements selected",
			};
		}

		const changes: ArrangementResult["changes"] = [];
		const updatedElements = elements.map((element) => {
			if (!selectedElements.includes(element.id)) return element;

			const bounds = this.#getElementBounds(element);
			if (!bounds) return element;

			const centerX = bounds.centerX;
			const centerY = bounds.centerY;

			const newPoints = element.points.map((point) => {
				if (direction === "horizontal") {
					return {
						x: 2 * centerX - point.x,
						y: point.y,
					};
				} else {
					return {
						x: point.x,
						y: 2 * centerY - point.y,
					};
				}
			});

			changes.push({
				elementId: element.id,
				before: { points: element.points },
				after: { points: newPoints },
			});

			return { ...element, points: newPoints };
		});

		this.#triggerStateChange("updateElements", { elements: updatedElements });

		this.#provideFeedback(`Flipped elements ${direction}ly`);

		return {
			success: true,
			operation: direction === "horizontal" ? "flipHorizontal" : "flipVertical",
			affectedElements: selectedElements,
			changes,
			message: `Flipped elements ${direction}ly`,
		};
	}

	/**
	 * Get all groups in a specific layer
	 */
	getGroupsInLayer(layerId: string): GroupInfo[] {
		if (!this.#layers) {
			return this.getGroups();
		}

		const layer = this.#layers.getLayer(layerId);
		if (!layer) {
			return [];
		}

		return this.getGroups().filter((group) =>
			group.elementIds.some((elementId) => layer.elementIds.includes(elementId))
		);
	}

	/**
	 * Get arrangement statistics for a layer
	 */
	getLayerArrangementStats(layerId: string): {
		totalElements: number;
		groupedElements: number;
		groups: number;
		ungroupedElements: number;
	} {
		if (!this.#layers) {
			return {
				totalElements: 0,
				groupedElements: 0,
				groups: 0,
				ungroupedElements: 0,
			};
		}

		const layer = this.#layers.getLayer(layerId);
		if (!layer) {
			return {
				totalElements: 0,
				groupedElements: 0,
				groups: 0,
				ungroupedElements: 0,
			};
		}

		const groups = this.getGroupsInLayer(layerId);
		const groupedElementIds = new Set(groups.flatMap((group) => group.elementIds));

		return {
			totalElements: layer.elementIds.length,
			groupedElements: groupedElementIds.size,
			groups: groups.length,
			ungroupedElements: layer.elementIds.length - groupedElementIds.size,
		};
	}

	/**
	 * Get all groups
	 */
	getGroups(): GroupInfo[] {
		return Array.from(this.#state.groups.values());
	}

	/**
	 * Get group by ID
	 */
	getGroup(groupId: string): GroupInfo | null {
		return this.#state.groups.get(groupId) || null;
	}

	// Private helper methods

	#generateGroupId(): string {
		return `group_${++this.#state.groupCounter}_${Date.now()}`;
	}

	#getElementBounds(element: DrawingElement): ElementBounds | null {
		if (element.points.length === 0) return null;

		const xs = element.points.map((p) => p.x);
		const ys = element.points.map((p) => p.y);

		const minX = Math.min(...xs);
		const minY = Math.min(...ys);
		const maxX = Math.max(...xs);
		const maxY = Math.max(...ys);

		return {
			minX,
			minY,
			maxX,
			maxY,
			width: maxX - minX,
			height: maxY - minY,
			centerX: (minX + maxX) / 2,
			centerY: (minY + maxY) / 2,
		};
	}

	#calculateGroupBounds(elements: DrawingElement[]): ElementBounds {
		const allBounds = elements
			.map((el) => this.#getElementBounds(el))
			.filter((b): b is ElementBounds => b !== null);

		if (allBounds.length === 0) {
			return {
				minX: 0,
				minY: 0,
				maxX: 0,
				maxY: 0,
				width: 0,
				height: 0,
				centerX: 0,
				centerY: 0,
			};
		}

		const minX = Math.min(...allBounds.map((b) => b.minX));
		const minY = Math.min(...allBounds.map((b) => b.minY));
		const maxX = Math.max(...allBounds.map((b) => b.maxX));
		const maxY = Math.max(...allBounds.map((b) => b.maxY));

		return {
			minX,
			minY,
			maxX,
			maxY,
			width: maxX - minX,
			height: maxY - minY,
			centerX: (minX + maxX) / 2,
			centerY: (minY + maxY) / 2,
		};
	}

	#calculateAlignmentReference(bounds: ElementBounds[], alignment: AlignmentType): number {
		switch (alignment) {
			case "left":
				return Math.min(...bounds.map((b) => b.minX));
			case "right":
				return Math.max(...bounds.map((b) => b.maxX));
			case "top":
				return Math.min(...bounds.map((b) => b.minY));
			case "bottom":
				return Math.max(...bounds.map((b) => b.maxY));
			case "centerX": {
				const centers = bounds.map((b) => b.centerX);
				return centers.reduce((a, b) => a + b, 0) / centers.length;
			}
			case "centerY": {
				const centers = bounds.map((b) => b.centerY);
				return centers.reduce((a, b) => a + b, 0) / centers.length;
			}
			default:
				return 0;
		}
	}

	#calculateAlignmentOffset(
		bounds: ElementBounds,
		alignment: AlignmentType,
		referenceValue: number
	): Point {
		const offset = { x: 0, y: 0 };

		switch (alignment) {
			case "left":
				offset.x = referenceValue - bounds.minX;
				break;
			case "right":
				offset.x = referenceValue - bounds.maxX;
				break;
			case "top":
				offset.y = referenceValue - bounds.minY;
				break;
			case "bottom":
				offset.y = referenceValue - bounds.maxY;
				break;
			case "centerX":
				offset.x = referenceValue - bounds.centerX;
				break;
			case "centerY":
				offset.y = referenceValue - bounds.centerY;
				break;
			default:
				break;
		}

		return offset;
	}

	#moveElementsForward(elements: DrawingElement[], selectedElements: string[]): DrawingElement[] {
		const result = [...elements];

		for (let i = result.length - 2; i >= 0; i--) {
			if (selectedElements.includes(result[i].id)) {
				const element = result[i];
				result[i] = result[i + 1];
				result[i + 1] = element;
			}
		}

		return result;
	}

	#moveElementsBackward(elements: DrawingElement[], selectedElements: string[]): DrawingElement[] {
		const result = [...elements];

		for (let i = 1; i < result.length; i++) {
			if (selectedElements.includes(result[i].id)) {
				const element = result[i];
				result[i] = result[i - 1];
				result[i - 1] = element;
			}
		}

		return result;
	}

	#updateLayerElementOrder(elements: DrawingElement[]): void {
		if (!this.#layers) return;

		// Group elements by layer
		const elementsByLayer = new Map<string, string[]>();
		elements.forEach((element) => {
			const layerId = element.layerId || this.#layers?.getActiveLayer()?.id;
			if (layerId) {
				if (!elementsByLayer.has(layerId)) {
					elementsByLayer.set(layerId, []);
				}
				elementsByLayer.get(layerId)?.push(element.id);
			}
		});

		// Update each layer's element order
		elementsByLayer.forEach((elementIds, layerId) => {
			const layer = this.#layers?.getLayer(layerId);
			if (layer) {
				layer.elementIds = elementIds;
				layer.updatedAt = Date.now();
			}
		});
	}

	#triggerStateChange(action: string, data: Record<string, unknown>): void {
		this.#config.on.stateChange({
			type: "action",
			action,
			...data,
		} as StateChangeEvent);
	}

	#provideFeedback(message: string): void {
		this.#config.on.feedback(message);
	}
}
