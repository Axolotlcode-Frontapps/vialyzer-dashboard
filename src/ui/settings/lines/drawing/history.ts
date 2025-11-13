import type { DrawingConfig } from "./config";
import type { HistoryEntry } from "./state";
import type { HistoryOperation } from "./types";

import { DrawingState } from "./state";

/**
 * Statistics about the history state
 */
interface HistoryStats {
	totalEntries: number;
	canUndo: boolean;
	canRedo: boolean;
	currentPosition: number;
	oldestEntry?: {
		timestamp: number;
		operation: string;
		description: string;
	};
	newestEntry?: {
		timestamp: number;
		operation: string;
		description: string;
	};
	memoryUsage: {
		estimatedBytes: number;
		entriesCount: number;
		statesCount: number;
	};
}

/**
 * DrawingHistory - Manages undo/redo functionality for drawing operations
 * Provides comprehensive history management with configurable options
 */
export class DrawingHistory {
	#config: DrawingConfig;
	#state: DrawingState;

	constructor(config: DrawingConfig, state: DrawingState) {
		this.#config = config;
		this.#state = state;
	}

	/**
	 * Record a new operation in history
	 */
	recordOperation(
		operation: HistoryOperation,
		newState: DrawingState,
		description?: string,
		beforeState?: DrawingState
	): void {
		if (!this.#state.history.recording || this.#state.history.isApplyingHistory)
			return;

		const now = Date.now();
		const shouldSnapshot =
			this.#config.history.autoSnapshot &&
			(this.#config.history.alwaysSnapshot.includes(operation.type) ||
				now - this.#state.history.lastSnapshotTime >=
					this.#config.history.minSnapshotInterval);

		if (!shouldSnapshot && this.#shouldMergeWithLastEntry(operation)) {
			this.#mergeWithLastEntry(operation, newState, description);
			return;
		}

		const entry: HistoryEntry = {
			id: this.#generateEntryId(),
			timestamp: now,
			operation,
			description: description || this.#getDefaultDescription(operation),
			beforeState: beforeState
				? DrawingState.cloneStateForHistory(beforeState)
				: DrawingState.cloneStateForHistory(this.#state),
			afterState: DrawingState.cloneStateForHistory(newState),
		};

		// Remove any entries after current position (redo history)
		if (this.#state.history.position < this.#state.history.entries.length - 1) {
			this.#state.history.entries = this.#state.history.entries.slice(
				0,
				this.#state.history.position + 1
			);
		}

		// Add new entry
		this.#state.history.entries.push(entry);
		this.#state.history.position = this.#state.history.entries.length - 1;

		// Update current state (only persistent drawing-related fields, not history management)
		// DO NOT update transient UI state (drag, drawing, currentElement, hoveredElement, mode)
		// as these are ephemeral states that exist only during user interactions
		this.#state.elements = DrawingState.cloneElements(newState.elements);
		this.#state.selectedElements = [...newState.selectedElements];
		// Mode is NOT updated - it's transient UI state

		// Update layer state
		this.#state.layers = new Map(newState.layers);
		this.#state.layerOrder = [...newState.layerOrder];
		this.#state.activeLayerId = newState.activeLayerId;
		this.#state.layerCounter = newState.layerCounter;
		this.#state.isolatedLayerId = newState.isolatedLayerId;

		// Update history metadata
		this.#state.history.lastSnapshotTime = now;
		this.#state.history.metadata = {
			elementCount: newState.elements.length,
			selectedCount: newState.selectedElements.length,
			timestamp: now,
		};

		// Trim history if it exceeds max size
		this.#trimHistory();

		// Provide feedback
		this.#provideFeedback(`Operation recorded: ${entry.description}`);
	}

	/**
	 * Undo the last operation
	 */
	undo(): boolean {
		if (!this.canUndo()) {
			this.#provideFeedback("Nothing to undo");
			return false;
		}

		const entry = this.#state.history.entries[this.#state.history.position];
		if (!entry) {
			console.error(
				"Undo: Entry not found at position",
				this.#state.history.position
			);
			this.#provideFeedback("Undo failed: Entry not found");
			return false;
		}

		if (!entry.beforeState) {
			console.error("Undo: No before state found for entry", entry.id);
			this.#provideFeedback("Undo failed: Invalid state");
			return false;
		}

		this.#state.history.isApplyingHistory = true;

		try {
			// Apply the before state
			this.#applyState(entry.beforeState);
			this.#state.history.position--;

			// Update drawing state (not history management fields or transient UI state)
			this.#state.elements = DrawingState.cloneElements(
				entry.beforeState.elements
			);
			this.#state.selectedElements = [...entry.beforeState.selectedElements];
			this.#state.mode = entry.beforeState.mode;

			// Restore layer state
			this.#state.layers = new Map(entry.beforeState.layers);
			this.#state.layerOrder = [...entry.beforeState.layerOrder];
			this.#state.activeLayerId = entry.beforeState.activeLayerId;
			this.#state.layerCounter = entry.beforeState.layerCounter;
			this.#state.isolatedLayerId = entry.beforeState.isolatedLayerId;

			// Clear any transient UI state when performing undo
			this.#state.currentElement = null;
			this.#state.drawing = false;
			this.#state.drag = {
				isDragging: false,
				elementId: null,
				pointIndex: null,
			};

			this.#provideFeedback(`Undid: ${entry.description}`);
			return true;
		} catch (error) {
			console.error("Undo operation failed:", error);
			this.#provideFeedback("Undo failed: Operation error");
			return false;
		} finally {
			this.#state.history.isApplyingHistory = false;
		}
	}

	/**
	 * Redo the next operation
	 */
	redo(): boolean {
		if (!this.canRedo()) {
			this.#provideFeedback("Nothing to redo");
			return false;
		}

		const entry = this.#state.history.entries[this.#state.history.position + 1];
		if (!entry) {
			console.error(
				"Redo: Entry not found at position",
				this.#state.history.position + 1
			);
			this.#provideFeedback("Redo failed: Entry not found");
			return false;
		}

		if (!entry.afterState) {
			console.error("Redo: No after state found for entry", entry.id);
			this.#provideFeedback("Redo failed: Invalid state");
			return false;
		}

		this.#state.history.isApplyingHistory = true;

		try {
			// Apply the after state
			this.#applyState(entry.afterState);
			this.#state.history.position++;

			// Update drawing state (not history management fields or transient UI state)
			this.#state.elements = DrawingState.cloneElements(
				entry.afterState.elements
			);
			this.#state.selectedElements = [...entry.afterState.selectedElements];
			this.#state.mode = entry.afterState.mode;

			// Restore layer state
			this.#state.layers = new Map(entry.afterState.layers);
			this.#state.layerOrder = [...entry.afterState.layerOrder];
			this.#state.activeLayerId = entry.afterState.activeLayerId;
			this.#state.layerCounter = entry.afterState.layerCounter;
			this.#state.isolatedLayerId = entry.afterState.isolatedLayerId;

			// Clear any transient UI state when performing redo
			this.#state.currentElement = null;
			this.#state.drawing = false;
			this.#state.drag = {
				isDragging: false,
				elementId: null,
				pointIndex: null,
			};

			this.#provideFeedback(`Redid: ${entry.description}`);
			return true;
		} catch (error) {
			console.error("Redo operation failed:", error);
			this.#provideFeedback("Redo failed: Operation error");
			return false;
		} finally {
			this.#state.history.isApplyingHistory = false;
		}
	}

	/**
	 * Check if undo is possible
	 */
	canUndo(): boolean {
		return this.#state.history.position >= 0;
	}

	/**
	 * Check if redo is possible
	 */
	canRedo(): boolean {
		return (
			this.#state.history.position < this.#state.history.entries.length - 1
		);
	}

	/**
	 * Go to a specific position in history
	 */
	goToPosition(position: number): boolean {
		if (position < -1 || position >= this.#state.history.entries.length) {
			return false;
		}

		this.#state.history.isApplyingHistory = true;

		try {
			let targetState: DrawingState;

			if (position === -1) {
				// Go to initial state (empty)
				targetState = new DrawingState();
			} else {
				targetState = this.#state.history.entries[position].afterState;
			}

			this.#applyState(targetState);
			this.#state.history.position = position;

			// Update drawing state (not history management fields or transient UI state)
			this.#state.elements = DrawingState.cloneElements(targetState.elements);
			this.#state.selectedElements = [...targetState.selectedElements];
			this.#state.mode = targetState.mode;

			// Restore layer state
			this.#state.layers = new Map(targetState.layers);
			this.#state.layerOrder = [...targetState.layerOrder];
			this.#state.activeLayerId = targetState.activeLayerId;
			this.#state.layerCounter = targetState.layerCounter;
			this.#state.isolatedLayerId = targetState.isolatedLayerId;

			// Clear any transient UI state when jumping to position
			this.#state.currentElement = null;
			this.#state.drawing = false;
			this.#state.drag = {
				isDragging: false,
				elementId: null,
				pointIndex: null,
			};

			return true;
		} finally {
			this.#state.history.isApplyingHistory = false;
		}
	}

	/**
	 * Clear all history
	 */
	clear(): void {
		this.#state.history.entries = [];
		this.#state.history.position = -1;
		this.#state.history.lastSnapshotTime = 0;
		this.#provideFeedback("History cleared");
	}

	/**
	 * Get history statistics
	 */
	getStats(): HistoryStats {
		const oldest = this.#state.history.entries[0];
		const newest =
			this.#state.history.entries[this.#state.history.entries.length - 1];

		return {
			totalEntries: this.#state.history.entries.length,
			canUndo: this.canUndo(),
			canRedo: this.canRedo(),
			currentPosition: this.#state.history.position,
			oldestEntry: oldest
				? {
						timestamp: oldest.timestamp,
						operation: oldest.operation.type,
						description: oldest.description,
					}
				: undefined,
			newestEntry: newest
				? {
						timestamp: newest.timestamp,
						operation: newest.operation.type,
						description: newest.description,
					}
				: undefined,
			memoryUsage: this.#calculateMemoryUsage(),
		};
	}

	/**
	 * Get the current history entries
	 */
	getHistory(): Array<{
		id: string;
		timestamp: number;
		operation: string;
		description: string;
		isCurrent: boolean;
	}> {
		return this.#state.history.entries.map((entry, index) => ({
			id: entry.id,
			timestamp: entry.timestamp,
			operation: entry.operation.type,
			description: entry.description,
			isCurrent: index === this.#state.history.position,
		}));
	}

	/**
	 * Toggle recording on/off
	 */
	setRecording(enabled: boolean): void {
		this.#state.history.recording = enabled;
		this.#provideFeedback(
			enabled ? "History recording enabled" : "History recording disabled"
		);
	}

	/**
	 * Check if currently recording
	 */
	isRecording(): boolean {
		return this.#state.history.recording;
	}

	// Private helper methods

	#shouldMergeWithLastEntry(operation: HistoryOperation): boolean {
		if (this.#state.history.entries.length === 0) return false;

		const lastEntry =
			this.#state.history.entries[this.#state.history.entries.length - 1];
		const timeDiff = Date.now() - lastEntry.timestamp;

		// Don't merge addElements operations - each drawn element should be its own history entry
		// This ensures undo removes one element at a time, not all elements since the last merge
		if (operation.type === "addElements") {
			return false;
		}

		return (
			this.#config.history.mergeableOperations.includes(operation.type) &&
			lastEntry.operation.type === operation.type &&
			timeDiff < this.#config.history.minSnapshotInterval
		);
	}

	#mergeWithLastEntry(
		_operation: HistoryOperation,
		newState: DrawingState,
		description?: string
	): void {
		const lastEntry =
			this.#state.history.entries[this.#state.history.entries.length - 1];

		// Update the after state of the last entry
		lastEntry.afterState = DrawingState.cloneStateForHistory(newState);
		lastEntry.timestamp = Date.now();

		if (description) {
			lastEntry.description = description;
		}

		// Update current state (only persistent drawing-related fields, not transient UI state)
		this.#state.elements = DrawingState.cloneElements(newState.elements);
		this.#state.selectedElements = [...newState.selectedElements];
		this.#state.mode = newState.mode;

		// Update layer state
		this.#state.layers = new Map(newState.layers);
		this.#state.layerOrder = [...newState.layerOrder];
		this.#state.activeLayerId = newState.activeLayerId;
		this.#state.layerCounter = newState.layerCounter;
		this.#state.isolatedLayerId = newState.isolatedLayerId;
	}

	#applyState(state: DrawingState): void {
		// Apply elements
		this.#config.on.stateChange({
			type: "action",
			action: "updateElements",
			elements: DrawingState.cloneElements(state.elements),
		});

		// Apply selection
		this.#config.on.stateChange({
			type: "action",
			action: "updateSelection",
			selectedElements: [...state.selectedElements],
		});

		// Apply drawing mode
		this.#config.on.stateChange({
			type: "modeChange",
			drawingMode: state.mode,
		});

		// Trigger layer synchronization after state restore
		this.#config.on.stateChange({
			type: "layerAction",
			action: "syncLayerElements",
			elements: DrawingState.cloneElements(state.elements),
		});
	}

	#trimHistory(): void {
		if (
			this.#state.history.entries.length <= this.#config.history.maxHistorySize
		)
			return;

		const entriesToRemove =
			this.#state.history.entries.length - this.#config.history.maxHistorySize;
		this.#state.history.entries =
			this.#state.history.entries.slice(entriesToRemove);
		this.#state.history.position = Math.max(
			-1,
			this.#state.history.position - entriesToRemove
		);
	}

	#generateEntryId(): string {
		return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	#getDefaultDescription(operation: HistoryOperation): string {
		const descriptions: Record<HistoryOperation["type"], string> = {
			addElements: "Add elements",
			deleteElements: "Delete elements",
			updateElements: "Update elements",
			moveElements: "Move elements",
			groupElements: "Group elements",
			ungroupElements: "Ungroup elements",
			alignElements: "Align elements",
			duplicateElements: "Duplicate elements",
			cutElements: "Cut elements",
			pasteElements: "Paste elements",
			clearAll: "Clear all",
			updateSelection: "Update selection",
			updateText: "Update text",
			changeMode: "Change drawing mode",
			bringToFront: "Bring to front",
			sendToBack: "Send to back",
			createLayer: "Create layer",
			deleteLayer: "Delete layer",
			duplicateLayer: "Duplicate layer",
			renameLayer: "Rename layer",
			reorderLayers: "Reorder layers",
			toggleLayerVisibility: "Toggle layer visibility",
			setLayerOpacity: "Set layer opacity",
			setActiveLayer: "Set active layer",
		};

		return descriptions[operation.type] || "Unknown operation";
	}

	#calculateMemoryUsage(): HistoryStats["memoryUsage"] {
		// Rough estimation of memory usage
		const bytesPerElement = 200; // Rough estimate per element
		const bytesPerEntry = 100; // Rough estimate per history entry

		const elementsCount = this.#state.history.entries.reduce(
			(total, entry) =>
				total +
				entry.beforeState.elements.length +
				entry.afterState.elements.length,
			0
		);

		return {
			estimatedBytes:
				this.#state.history.entries.length * bytesPerEntry +
				elementsCount * bytesPerElement,
			entriesCount: this.#state.history.entries.length,
			statesCount: this.#state.history.entries.length * 2, // before and after states
		};
	}

	#provideFeedback(message: string): void {
		this.#config.on.feedback(message);
	}

	/**
	 * Export history for debugging or persistence
	 */
	exportHistory(): unknown {
		return {
			config: this.#config,
			currentPosition: this.#state.history.position,
			history: this.#state.history.entries.map((entry) => ({
				id: entry.id,
				timestamp: entry.timestamp,
				operation: entry.operation,
				description: entry.description,
				// Note: States are not exported due to size, could be added if needed
			})),
		};
	}

	/**
	 * Get a preview of what undo/redo would do
	 */
	getUndoPreview(): string | null {
		if (!this.canUndo()) return null;
		return this.#state.history.entries[this.#state.history.position]
			.description;
	}

	getRedoPreview(): string | null {
		if (!this.canRedo()) return null;
		return this.#state.history.entries[this.#state.history.position + 1]
			.description;
	}

	/**
	 * Check if history is currently being applied (during undo/redo)
	 */
	get isApplyingHistory(): boolean {
		return this.#state.history.isApplyingHistory;
	}
}
