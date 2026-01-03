import type { DrawingConfig } from "./config";
import type { DrawingCore } from "./core";
import type { DrawingState } from "./state";
import type { DrawingElement, MediaMatrix, Point } from "./types";
import type { DrawingUtils } from "./utils";

/**
 * DrawingActions - Handles copy, paste, duplicate, select, zoom, pan and other actions
 * Provides centralized action management for drawing operations
 */
export class DrawingActions {
	#core: DrawingCore;
	#config: DrawingConfig;
	#utils: DrawingUtils;
	#state: DrawingState;

	constructor(core: DrawingCore, config: DrawingConfig, utils: DrawingUtils, state: DrawingState) {
		this.#core = core;
		this.#config = config;
		this.#utils = utils;
		this.#state = state;
	}

	/**
	 * Copy selected elements to clipboard
	 */
	copySelectedElements(selectedElements: string[], elements: DrawingElement[]): number {
		const selectedEls = elements.filter((el) => selectedElements.includes(el.id));

		this.#state.clipboard = selectedEls.map((element) => ({
			...element,
			id: this.#utils.generateElementId(),
			points: element.points.map((point) => ({ ...point })),
			info: element.info
				? { ...element.info }
				: {
						name: "",
						description: undefined,
						type: "DETECTION" as const,
						direction: "top" as const,
						distance: 0,
						fontSize: 16,
						fontFamily: "Arial",
						backgroundColor: undefined,
						backgroundOpacity: 0.8,
					},
			direction: element.direction
				? {
						start: { ...element.direction.start },
						end: { ...element.direction.end },
					}
				: undefined,
			detection: element.detection
				? {
						entry: element.detection.entry.map((p) => ({ ...p })),
						exit: element.detection.exit.map((p) => ({ ...p })),
					}
				: undefined,
		}));

		this.#resetPasteOffset();

		this.#config.on.feedback(`Copied ${selectedEls.length} element(s) to clipboard`);

		return selectedEls.length;
	}

	/**
	 * Cut selected elements to clipboard
	 */
	cutSelectedElements(selectedElements: string[], elements: DrawingElement[]): number {
		const selectedEls = elements.filter((el) => selectedElements.includes(el.id));

		this.#state.clipboard = selectedEls.map((element) => ({
			...element,
			id: this.#utils.generateElementId(),
			points: element.points.map((point) => ({ ...point })),
			info: element.info
				? { ...element.info }
				: {
						name: "",
						description: undefined,
						type: "DETECTION" as const,
						direction: "top" as const,
						distance: 0,
						fontSize: 16,
						fontFamily: "Arial",
						backgroundColor: undefined,
						backgroundOpacity: 0.8,
					},
			direction: element.direction
				? {
						start: { ...element.direction.start },
						end: { ...element.direction.end },
					}
				: undefined,
			detection: element.detection
				? {
						entry: element.detection.entry.map((p) => ({ ...p })),
						exit: element.detection.exit.map((p) => ({ ...p })),
					}
				: undefined,
		}));

		this.#resetPasteOffset();

		// Remove selected elements from the drawing
		this.#config.on.stateChange({
			type: "action",
			action: "deleteElements",
			elementIds: selectedElements,
		});

		this.#config.on.feedback(`Cut ${selectedEls.length} element(s) to clipboard`);

		return selectedEls.length;
	}

	/**
	 * Paste elements from clipboard
	 */
	pasteElements(atPosition?: boolean, position?: Point): DrawingElement[] {
		if (this.#state.clipboard.length === 0) return [];

		const newElements = this.#state.clipboard.map((element, index) => {
			let newPoints: Point[];
			let newDetection: { entry: Point[]; exit: Point[] } | undefined;
			let newDirection: { start: Point; end: Point } | null | undefined;

			if (atPosition && position) {
				const mediaPosition = this.#core.displayToMediaCoords(position);
				const elementBounds = this.#utils.getElementBounds(element);

				if (elementBounds) {
					const elementCenterX = (elementBounds.minX + elementBounds.maxX) / 2;
					const elementCenterY = (elementBounds.minY + elementBounds.maxY) / 2;

					const offsetX = mediaPosition.x - elementCenterX;
					const offsetY = mediaPosition.y - elementCenterY + index * 20;

					newPoints = element.points.map((point) => ({
						x: point.x + offsetX,
						y: point.y + offsetY,
					}));

					// Also move detection points if they exist
					if (element.detection) {
						newDetection = {
							entry: element.detection.entry.map((point) => ({
								x: point.x + offsetX,
								y: point.y + offsetY,
							})),
							exit: element.detection.exit.map((point) => ({
								x: point.x + offsetX,
								y: point.y + offsetY,
							})),
						};
					}

					// Also move direction arrow points if they exist
					newDirection = element.direction
						? {
								start: {
									x: element.direction.start.x + offsetX,
									y: element.direction.start.y + offsetY,
								},
								end: {
									x: element.direction.end.x + offsetX,
									y: element.direction.end.y + offsetY,
								},
							}
						: element.direction;
				} else {
					newPoints = element.points.map((point) => ({ ...point }));
					newDetection = element.detection
						? {
								entry: element.detection.entry.map((point) => ({ ...point })),
								exit: element.detection.exit.map((point) => ({ ...point })),
							}
						: undefined;
					newDirection = element.direction
						? {
								start: { ...element.direction.start },
								end: { ...element.direction.end },
							}
						: element.direction;
				}
			} else {
				newPoints = element.points.map((point) => ({
					x: point.x + this.#state.pasteOffset.x,
					y: point.y + this.#state.pasteOffset.y,
				}));

				// Also move detection points if they exist
				if (element.detection) {
					newDetection = {
						entry: element.detection.entry.map((point) => ({
							x: point.x + this.#state.pasteOffset.x,
							y: point.y + this.#state.pasteOffset.y,
						})),
						exit: element.detection.exit.map((point) => ({
							x: point.x + this.#state.pasteOffset.x,
							y: point.y + this.#state.pasteOffset.y,
						})),
					};
				}

				// Also move direction arrow points if they exist
				newDirection = element.direction
					? {
							start: {
								x: element.direction.start.x + this.#state.pasteOffset.x,
								y: element.direction.start.y + this.#state.pasteOffset.y,
							},
							end: {
								x: element.direction.end.x + this.#state.pasteOffset.x,
								y: element.direction.end.y + this.#state.pasteOffset.y,
							},
						}
					: element.direction;
			}

			return {
				...element,
				id: this.#utils.generateElementId(),
				points: newPoints,
				detection: newDetection,
				direction: newDirection,
			};
		});

		if (!atPosition) {
			this.#state.pasteOffset = {
				x: this.#state.pasteOffset.x + 20,
				y: this.#state.pasteOffset.y + 20,
			};
		}

		this.#config.on.stateChange({
			type: "action",
			action: "addElements",
			elements: newElements,
			selectElements: true,
		});

		this.#config.on.feedback(`Pasted ${newElements.length} element(s)`);

		return newElements;
	}

	/**
	 * Duplicate selected elements
	 */
	duplicateSelectedElements(
		selectedElements: string[],
		elements: DrawingElement[]
	): DrawingElement[] {
		if (selectedElements.length === 0) return [];

		// First copy the elements
		this.copySelectedElements(selectedElements, elements);

		// Then paste them with offset
		return this.pasteElements(false);
	}

	/**
	 * Delete selected elements
	 * Elements that are 'new' (never saved) are removed immediately
	 * Elements that are 'saved' or 'edited' are marked as 'deleted' for backend sync
	 */
	deleteSelectedElements(selectedElements: string[], elements: DrawingElement[]): void {
		if (selectedElements.length === 0) return;

		const elementsToDelete = elements.filter((el) => selectedElements.includes(el.id));

		// Separate elements by sync state
		const newElements = elementsToDelete.filter((el) => el.syncState === "new");
		const syncedElements = elementsToDelete.filter(
			(el) => el.syncState === "saved" || el.syncState === "edited"
		);

		// Mark synced elements as deleted (they need to be sent to backend)
		syncedElements.forEach((el) => {
			el.syncState = "deleted";
		});

		// Remove new elements immediately (they were never saved)
		const elementIdsToRemove = newElements.map((el) => el.id);

		this.#config.on.stateChange({
			type: "action",
			action: "deleteElements",
			elementIds: elementIdsToRemove,
			markedAsDeleted: syncedElements.map((el) => el.id),
		});

		this.#config.on.feedback(`Deleted ${selectedElements.length} element(s)`);
	}

	/**
	 * Toggle element selection
	 */
	toggleElementSelection(elementId: string, selectedElements: string[]): string[] {
		const newSelection = selectedElements.includes(elementId)
			? selectedElements.filter((id) => id !== elementId)
			: [...selectedElements, elementId];

		this.#config.on.stateChange({
			type: "action",
			action: "updateSelection",
			selectedElements: newSelection,
		});

		return newSelection;
	}

	/**
	 * Select all elements
	 */
	selectAllElements(elements: DrawingElement[]): string[] {
		const allElementIds = elements
			.filter((element) => element.completed)
			.map((element) => element.id);

		this.#config.on.stateChange({
			type: "action",
			action: "updateSelection",
			selectedElements: allElementIds,
		});

		this.#config.on.feedback(`Selected ${allElementIds.length} element(s)`);

		return allElementIds;
	}

	/**
	 * Clear selection
	 */
	clearSelection(): string[] {
		this.#config.on.stateChange({
			type: "action",
			action: "updateSelection",
			selectedElements: [],
		});

		return [];
	}

	/**
	 * Clear all elements from drawing
	 */
	clearAll(): void {
		this.#config.on.stateChange({
			type: "action",
			action: "clearAll",
		});

		this.#config.on.feedback("Cleared all elements");
	}

	/**
	 * Undo last operation
	 */
	undoLast(): void {
		this.#config.on.stateChange({
			type: "action",
			action: "undo",
		});
	}

	/**
	 * Export drawing data
	 */
	exportDrawings(elements: DrawingElement[]): MediaMatrix | null {
		const matrixData = this.#core.generateMatrix(elements);

		this.#config.on.stateChange({
			type: "action",
			action: "export",
			data: matrixData,
		});

		this.#config.on.feedback("Drawing exported successfully");

		return matrixData;
	}

	/**
	 * Move selected elements by offset
	 */
	moveSelectedElements(
		selectedElements: string[],
		elements: DrawingElement[],
		offset: Point
	): void {
		if (selectedElements.length === 0) return;

		const updatedElements = elements.map((element) => {
			if (selectedElements.includes(element.id)) {
				return {
					...element,
					points: element.points.map((point) => ({
						x: point.x + offset.x,
						y: point.y + offset.y,
					})),
					// Also move detection points if they exist
					detection: element.detection
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
						: undefined,
					// Also move direction arrow points if they exist
					direction: element.direction
						? {
								start: {
									x: element.direction.start.x + offset.x,
									y: element.direction.start.y + offset.y,
								},
								end: {
									x: element.direction.end.x + offset.x,
									y: element.direction.end.y + offset.y,
								},
							}
						: element.direction,
				};
			}
			return element;
		});

		this.#config.on.stateChange({
			type: "action",
			action: "updateElements",
			elements: updatedElements,
		});
	}

	/**
	 * Group selected elements
	 */
	groupSelectedElements(
		selectedElements: string[],
		elements: DrawingElement[]
	): string | undefined {
		if (selectedElements.length < 2) {
			this.#config.on.feedback("Select at least 2 elements to group");
			return;
		}

		const groupId = this.#utils.generateElementId();
		const updatedElements = elements.map((element) => {
			if (selectedElements.includes(element.id)) {
				return {
					...element,
					groupId,
				};
			}
			return element;
		});

		this.#config.on.stateChange({
			type: "action",
			action: "updateElements",
			elements: updatedElements,
		});

		this.#config.on.feedback(`Grouped ${selectedElements.length} element(s)`);

		return groupId;
	}

	/**
	 * Ungroup selected elements
	 */
	ungroupSelectedElements(selectedElements: string[], elements: DrawingElement[]): void {
		const updatedElements = elements.map((element) => {
			if (selectedElements.includes(element.id) && element.groupId) {
				const { groupId: _groupId, ...elementWithoutGroup } = element;
				// Explicitly void the unused variable to satisfy linter
				void _groupId;
				return elementWithoutGroup;
			}
			return element;
		});

		this.#config.on.stateChange({
			type: "action",
			action: "updateElements",
			elements: updatedElements,
		});

		this.#config.on.feedback("Elements ungrouped");
	}

	/**
	 * Bring selected elements to front
	 */
	bringToFront(selectedElements: string[], elements: DrawingElement[]): DrawingElement[] {
		if (selectedElements.length === 0) return elements;

		const selectedEls = elements.filter((el) => selectedElements.includes(el.id));
		const otherEls = elements.filter((el) => !selectedElements.includes(el.id));
		const reorderedElements = [...otherEls, ...selectedEls];

		this.#config.on.stateChange({
			type: "action",
			action: "updateElements",
			elements: reorderedElements,
		});

		this.#config.on.feedback("Brought elements to front");

		return reorderedElements;
	}

	/**
	 * Send selected elements to back
	 */
	sendToBack(selectedElements: string[], elements: DrawingElement[]): DrawingElement[] {
		if (selectedElements.length === 0) return elements;

		const selectedEls = elements.filter((el) => selectedElements.includes(el.id));
		const otherEls = elements.filter((el) => !selectedElements.includes(el.id));
		const reorderedElements = [...selectedEls, ...otherEls];

		this.#config.on.stateChange({
			type: "action",
			action: "updateElements",
			elements: reorderedElements,
		});

		this.#config.on.feedback("Sent elements to back");

		return reorderedElements;
	}

	/**
	 * Align selected elements
	 */
	alignElements(selectedElements: string[], elements: DrawingElement[], alignment: string): void {
		if (selectedElements.length < 2) {
			this.#config.on.feedback("Select at least 2 elements to align");
			return;
		}

		const selectedEls = elements.filter((el) => selectedElements.includes(el.id));
		const bounds = selectedEls
			.map((el) => this.#utils.getElementBounds(el))
			.filter((b): b is NonNullable<typeof b> => b !== null);

		if (bounds.length === 0) return;

		let referenceValue: number;
		switch (alignment) {
			case "left":
				referenceValue = Math.min(...bounds.map((b) => b.minX));
				break;
			case "right":
				referenceValue = Math.max(...bounds.map((b) => b.maxX));
				break;
			case "top":
				referenceValue = Math.min(...bounds.map((b) => b.minY));
				break;
			case "bottom":
				referenceValue = Math.max(...bounds.map((b) => b.maxY));
				break;
			case "centerX": {
				const allCentersX = bounds.map((b) => (b.minX + b.maxX) / 2);
				referenceValue = allCentersX.reduce((a, b) => a + b, 0) / allCentersX.length;
				break;
			}
			case "centerY": {
				const allCentersY = bounds.map((b) => (b.minY + b.maxY) / 2);
				referenceValue = allCentersY.reduce((a, b) => a + b, 0) / allCentersY.length;
				break;
			}
			default:
				return;
		}

		const updatedElements = elements.map((element) => {
			if (!selectedElements.includes(element.id)) return element;

			const elementBounds = this.#utils.getElementBounds(element);
			if (!elementBounds) return element;

			const offset = { x: 0, y: 0 };

			switch (alignment) {
				case "left":
					offset.x = referenceValue - elementBounds.minX;
					break;
				case "right":
					offset.x = referenceValue - elementBounds.maxX;
					break;
				case "top":
					offset.y = referenceValue - elementBounds.minY;
					break;
				case "bottom":
					offset.y = referenceValue - elementBounds.maxY;
					break;
				case "centerX": {
					const currentCenterX = (elementBounds.minX + elementBounds.maxX) / 2;
					offset.x = referenceValue - currentCenterX;
					break;
				}
				case "centerY": {
					const currentCenterY = (elementBounds.minY + elementBounds.maxY) / 2;
					offset.y = referenceValue - currentCenterY;
					break;
				}
				default:
					break;
			}

			return {
				...element,
				points: element.points.map((point) => ({
					x: point.x + offset.x,
					y: point.y + offset.y,
				})),
				// Also move direction arrow points if they exist
				direction: element.direction
					? {
							start: {
								x: element.direction.start.x + offset.x,
								y: element.direction.start.y + offset.y,
							},
							end: {
								x: element.direction.end.x + offset.x,
								y: element.direction.end.y + offset.y,
							},
						}
					: element.direction,
			};
		});

		this.#config.on.stateChange({
			type: "action",
			action: "updateElements",
			elements: updatedElements,
		});

		this.#config.on.feedback(`Aligned elements: ${alignment}`);
	}

	/**
	 * Reset paste offset
	 */
	#resetPasteOffset(): void {
		this.#state.pasteOffset = { x: 20, y: 20 };
	}

	/**
	 * Get clipboard contents
	 */
	getClipboard(): DrawingElement[] {
		return this.#state.clipboard;
	}

	/**
	 * Clear clipboard
	 */
	clearClipboard(): void {
		this.#state.clipboard = [];

		this.#config.on.feedback("Clipboard cleared");
	}

	/**
	 * Reset paste offset (public method)
	 */
	resetPasteOffset(): void {
		this.#resetPasteOffset();
	}

	/**
	 * Get paste offset
	 */
	getPasteOffset(): Point {
		return this.#state.pasteOffset;
	}

	/**
	 * Set paste offset
	 */
	setPasteOffset(offset: Point): void {
		this.#state.pasteOffset = offset;
	}

	/**
	 * Check if clipboard has content
	 */
	hasClipboardContent(): boolean {
		return this.#state.clipboard.length > 0;
	}

	/**
	 * Get statistics about current clipboard
	 */
	getClipboardStats(): { total: number; types: Record<string, number> } {
		return {
			total: this.#state.clipboard.length,
			types: this.#state.clipboard.reduce((acc: Record<string, number>, element) => {
				acc[element.type] = (acc[element.type] || 0) + 1;
				return acc;
			}, {}),
		};
	}
}
