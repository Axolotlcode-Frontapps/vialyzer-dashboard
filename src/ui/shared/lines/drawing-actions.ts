import type {
	DrawingActionsCallbacks,
	DrawingElement,
	DrawingEngineInterface,
	DrawingUtilsInterface,
	FeedbackCallback,
	MediaMatrix,
	Point,
	StateChangeCallback,
} from "./types";

/**
 * DrawingActions - Handles copy, paste, duplicate, select, zoom, pan and other actions
 * Provides centralized action management for drawing operations
 */
export class DrawingActions {
	#drawingEngine: DrawingEngineInterface;
	#drawingUtils: DrawingUtilsInterface;
	#onStateChange: StateChangeCallback | null = null;
	#onFeedback: FeedbackCallback | null = null;

	// Clipboard state
	#clipboard: DrawingElement[] = [];
	#pasteOffset: Point = { x: 20, y: 20 };

	constructor(
		drawingEngine: DrawingEngineInterface,
		drawingUtils: DrawingUtilsInterface
	) {
		this.#drawingEngine = drawingEngine;
		this.#drawingUtils = drawingUtils;
	}

	/**
	 * Initialize with callbacks
	 */
	initialize(callbacks: DrawingActionsCallbacks): void {
		this.#onStateChange = callbacks.onStateChange;
		this.#onFeedback = callbacks.onFeedback;
	}

	/**
	 * Copy selected elements to clipboard
	 */
	copySelectedElements(
		selectedElements: string[],
		elements: DrawingElement[]
	): number {
		const selectedEls = elements.filter((el) =>
			selectedElements.includes(el.id)
		);

		this.#clipboard = selectedEls.map((element) => ({
			...element,
			id: this.#drawingUtils.generateElementId(),
			points: element.points.map((point) => ({ ...point })),
			text: element.text ? { ...element.text } : undefined,
			direction: element.direction
				? {
						start: { ...element.direction.start },
						end: { ...element.direction.end },
					}
				: undefined,
		}));

		this.#resetPasteOffset();

		if (this.#onFeedback) {
			this.#onFeedback(`Copied ${selectedEls.length} element(s) to clipboard`);
		}

		return selectedEls.length;
	}

	/**
	 * Cut selected elements to clipboard
	 */
	cutSelectedElements(
		selectedElements: string[],
		elements: DrawingElement[]
	): number {
		const selectedEls = elements.filter((el) =>
			selectedElements.includes(el.id)
		);

		this.#clipboard = selectedEls.map((element) => ({
			...element,
			id: this.#drawingUtils.generateElementId(),
			points: element.points.map((point) => ({ ...point })),
			text: element.text ? { ...element.text } : undefined,
			direction: element.direction
				? {
						start: { ...element.direction.start },
						end: { ...element.direction.end },
					}
				: undefined,
		}));

		this.#resetPasteOffset();

		// Remove selected elements from the drawing
		if (this.#onStateChange) {
			this.#onStateChange({
				type: "action",
				action: "deleteElements",
				elementIds: selectedElements,
			});
		}

		if (this.#onFeedback) {
			this.#onFeedback(`Cut ${selectedEls.length} element(s) to clipboard`);
		}

		return selectedEls.length;
	}

	/**
	 * Paste elements from clipboard
	 */
	pasteElements(atPosition?: boolean, position?: Point): DrawingElement[] {
		if (this.#clipboard.length === 0 || !this.#drawingEngine) return [];

		const newElements = this.#clipboard.map((element, index) => {
			let newPoints: Point[];

			if (atPosition && position) {
				const mediaPosition =
					this.#drawingEngine.displayToMediaCoords(position);
				const elementBounds = this.#drawingUtils.getElementBounds(element);

				if (elementBounds) {
					const elementCenterX = (elementBounds.minX + elementBounds.maxX) / 2;
					const elementCenterY = (elementBounds.minY + elementBounds.maxY) / 2;

					const offsetX = mediaPosition.x - elementCenterX;
					const offsetY = mediaPosition.y - elementCenterY + index * 20;

					newPoints = element.points.map((point) => ({
						x: point.x + offsetX,
						y: point.y + offsetY,
					}));
				} else {
					newPoints = element.points.map((point) => ({ ...point }));
				}
			} else {
				newPoints = element.points.map((point) => ({
					x: point.x + this.#pasteOffset.x,
					y: point.y + this.#pasteOffset.y,
				}));
			}

			return {
				...element,
				id: this.#drawingUtils.generateElementId(),
				points: newPoints,
			};
		});

		if (!atPosition) {
			this.#pasteOffset = {
				x: this.#pasteOffset.x + 20,
				y: this.#pasteOffset.y + 20,
			};
		}

		if (this.#onStateChange) {
			this.#onStateChange({
				type: "action",
				action: "addElements",
				elements: newElements,
				selectElements: true,
			});
		}

		if (this.#onFeedback) {
			this.#onFeedback(`Pasted ${newElements.length} element(s)`);
		}

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
	 */
	deleteSelectedElements(selectedElements: string[]): void {
		if (selectedElements.length === 0) return;

		if (this.#onStateChange) {
			this.#onStateChange({
				type: "action",
				action: "deleteElements",
				elementIds: selectedElements,
			});
		}

		if (this.#onFeedback) {
			this.#onFeedback(`Deleted ${selectedElements.length} element(s)`);
		}
	}

	/**
	 * Toggle element selection
	 */
	toggleElementSelection(
		elementId: string,
		selectedElements: string[]
	): string[] {
		const newSelection = selectedElements.includes(elementId)
			? selectedElements.filter((id) => id !== elementId)
			: [...selectedElements, elementId];

		if (this.#onStateChange) {
			this.#onStateChange({
				type: "action",
				action: "updateSelection",
				selectedElements: newSelection,
			});
		}

		return newSelection;
	}

	/**
	 * Select all elements
	 */
	selectAllElements(elements: DrawingElement[]): string[] {
		const allElementIds = elements
			.filter((element) => element.completed)
			.map((element) => element.id);

		if (this.#onStateChange) {
			this.#onStateChange({
				type: "action",
				action: "updateSelection",
				selectedElements: allElementIds,
			});
		}

		if (this.#onFeedback) {
			this.#onFeedback(`Selected ${allElementIds.length} element(s)`);
		}

		return allElementIds;
	}

	/**
	 * Clear selection
	 */
	clearSelection(): string[] {
		if (this.#onStateChange) {
			this.#onStateChange({
				type: "action",
				action: "updateSelection",
				selectedElements: [],
			});
		}

		return [];
	}

	/**
	 * Clear all elements from drawing
	 */
	clearAll(): void {
		if (this.#onStateChange) {
			this.#onStateChange({
				type: "action",
				action: "clearAll",
			});
		}

		if (this.#onFeedback) {
			this.#onFeedback("Cleared all elements");
		}
	}

	/**
	 * Undo last operation
	 */
	undoLast(): void {
		if (this.#onStateChange) {
			this.#onStateChange({
				type: "action",
				action: "undo",
			});
		}
	}

	/**
	 * Export drawing data
	 */
	exportDrawings(elements: DrawingElement[]): MediaMatrix | null {
		if (!this.#drawingEngine) return null;

		const matrixData = this.#drawingEngine.generateMatrix(elements);

		if (this.#onStateChange) {
			this.#onStateChange({
				type: "action",
				action: "export",
				data: matrixData,
			});
		}

		if (this.#onFeedback) {
			this.#onFeedback("Drawing exported successfully");
		}

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
				};
			}
			return element;
		});

		if (this.#onStateChange) {
			this.#onStateChange({
				type: "action",
				action: "updateElements",
				elements: updatedElements,
			});
		}
	}

	/**
	 * Group selected elements
	 */
	groupSelectedElements(
		selectedElements: string[],
		elements: DrawingElement[]
	): string | undefined {
		if (selectedElements.length < 2) {
			if (this.#onFeedback) {
				this.#onFeedback("Select at least 2 elements to group");
			}
			return;
		}

		const groupId = this.#drawingUtils.generateElementId();
		const updatedElements = elements.map((element) => {
			if (selectedElements.includes(element.id)) {
				return {
					...element,
					groupId,
				};
			}
			return element;
		});

		if (this.#onStateChange) {
			this.#onStateChange({
				type: "action",
				action: "updateElements",
				elements: updatedElements,
			});
		}

		if (this.#onFeedback) {
			this.#onFeedback(`Grouped ${selectedElements.length} element(s)`);
		}

		return groupId;
	}

	/**
	 * Ungroup selected elements
	 */
	ungroupSelectedElements(
		selectedElements: string[],
		elements: DrawingElement[]
	): void {
		const updatedElements = elements.map((element) => {
			if (selectedElements.includes(element.id) && element.groupId) {
				const { groupId: _groupId, ...elementWithoutGroup } = element;
				// Explicitly void the unused variable to satisfy linter
				void _groupId;
				return elementWithoutGroup;
			}
			return element;
		});

		if (this.#onStateChange) {
			this.#onStateChange({
				type: "action",
				action: "updateElements",
				elements: updatedElements,
			});
		}

		if (this.#onFeedback) {
			this.#onFeedback("Elements ungrouped");
		}
	}

	/**
	 * Bring selected elements to front
	 */
	bringToFront(
		selectedElements: string[],
		elements: DrawingElement[]
	): DrawingElement[] {
		if (selectedElements.length === 0) return elements;

		const selectedEls = elements.filter((el) =>
			selectedElements.includes(el.id)
		);
		const otherEls = elements.filter((el) => !selectedElements.includes(el.id));
		const reorderedElements = [...otherEls, ...selectedEls];

		if (this.#onStateChange) {
			this.#onStateChange({
				type: "action",
				action: "updateElements",
				elements: reorderedElements,
			});
		}

		if (this.#onFeedback) {
			this.#onFeedback("Brought elements to front");
		}

		return reorderedElements;
	}

	/**
	 * Send selected elements to back
	 */
	sendToBack(
		selectedElements: string[],
		elements: DrawingElement[]
	): DrawingElement[] {
		if (selectedElements.length === 0) return elements;

		const selectedEls = elements.filter((el) =>
			selectedElements.includes(el.id)
		);
		const otherEls = elements.filter((el) => !selectedElements.includes(el.id));
		const reorderedElements = [...selectedEls, ...otherEls];

		if (this.#onStateChange) {
			this.#onStateChange({
				type: "action",
				action: "updateElements",
				elements: reorderedElements,
			});
		}

		if (this.#onFeedback) {
			this.#onFeedback("Sent elements to back");
		}

		return reorderedElements;
	}

	/**
	 * Align selected elements
	 */
	alignElements(
		selectedElements: string[],
		elements: DrawingElement[],
		alignment: string
	): void {
		if (selectedElements.length < 2) {
			if (this.#onFeedback) {
				this.#onFeedback("Select at least 2 elements to align");
			}
			return;
		}

		const selectedEls = elements.filter((el) =>
			selectedElements.includes(el.id)
		);
		const bounds = selectedEls
			.map((el) => this.#drawingUtils.getElementBounds(el))
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
				referenceValue =
					allCentersX.reduce((a, b) => a + b, 0) / allCentersX.length;
				break;
			}
			case "centerY": {
				const allCentersY = bounds.map((b) => (b.minY + b.maxY) / 2);
				referenceValue =
					allCentersY.reduce((a, b) => a + b, 0) / allCentersY.length;
				break;
			}
			default:
				return;
		}

		const updatedElements = elements.map((element) => {
			if (!selectedElements.includes(element.id)) return element;

			const elementBounds = this.#drawingUtils.getElementBounds(element);
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
			};
		});

		if (this.#onStateChange) {
			this.#onStateChange({
				type: "action",
				action: "updateElements",
				elements: updatedElements,
			});
		}

		if (this.#onFeedback) {
			this.#onFeedback(`Aligned elements: ${alignment}`);
		}
	}

	/**
	 * Reset paste offset
	 */
	#resetPasteOffset(): void {
		this.#pasteOffset = { x: 20, y: 20 };
	}

	/**
	 * Get clipboard contents
	 */
	getClipboard(): DrawingElement[] {
		return this.#clipboard;
	}

	/**
	 * Clear clipboard
	 */
	clearClipboard(): void {
		this.#clipboard = [];

		if (this.#onFeedback) {
			this.#onFeedback("Clipboard cleared");
		}
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
		return this.#pasteOffset;
	}

	/**
	 * Set paste offset
	 */
	setPasteOffset(offset: Point): void {
		this.#pasteOffset = offset;
	}

	/**
	 * Update drawing engine and utils references
	 */
	updateReferences(
		drawingEngine: DrawingEngineInterface,
		drawingUtils: DrawingUtilsInterface
	): void {
		this.#drawingEngine = drawingEngine;
		this.#drawingUtils = drawingUtils;
	}

	/**
	 * Check if clipboard has content
	 */
	hasClipboardContent(): boolean {
		return this.#clipboard.length > 0;
	}

	/**
	 * Get statistics about current clipboard
	 */
	getClipboardStats(): { total: number; types: Record<string, number> } {
		return {
			total: this.#clipboard.length,
			types: this.#clipboard.reduce((acc: Record<string, number>, element) => {
				acc[element.type] = (acc[element.type] || 0) + 1;
				return acc;
			}, {}),
		};
	}
}
