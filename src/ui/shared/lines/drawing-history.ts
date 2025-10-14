import type {
	DrawingElement,
	DrawingMode,
	FeedbackCallback,
	StateChangeCallback,
} from "./types";

/**
 * History entry representing a single operation that can be undone/redone
 */
interface HistoryEntry {
	id: string;
	timestamp: number;
	operation: HistoryOperation;
	description: string;
	/**
	 * State before the operation (for undo)
	 */
	beforeState: HistoryState;
	/**
	 * State after the operation (for redo)
	 */
	afterState: HistoryState;
}

/**
 * Different types of operations that can be recorded in history
 */
interface HistoryOperation {
	type:
		| "addElements"
		| "deleteElements"
		| "updateElements"
		| "moveElements"
		| "groupElements"
		| "ungroupElements"
		| "alignElements"
		| "duplicateElements"
		| "cutElements"
		| "pasteElements"
		| "clearAll"
		| "updateSelection"
		| "updateText"
		| "changeMode"
		| "bringToFront"
		| "sendToBack";
	/**
	 * Additional data specific to the operation type
	 */
	data?: unknown;
}

/**
 * Snapshot of the drawing state at a point in time
 */
interface HistoryState {
	elements: DrawingElement[];
	selectedElements: string[];
	drawingMode: DrawingMode;
	/**
	 * Additional metadata about the state
	 */
	metadata?: {
		elementCount: number;
		selectedCount: number;
		timestamp: number;
	};
}

/**
 * Configuration options for the history manager
 */
interface HistoryConfig {
	/**
	 * Maximum number of history entries to keep
	 * @default 50
	 */
	maxHistorySize: number;
	/**
	 * Whether to automatically create snapshots before operations
	 * @default true
	 */
	autoSnapshot: boolean;
	/**
	 * Minimum time between automatic snapshots (ms)
	 * @default 100
	 */
	minSnapshotInterval: number;
	/**
	 * Operations that should always create a snapshot
	 */
	alwaysSnapshot: HistoryOperation["type"][];
	/**
	 * Operations that should be merged if they happen in quick succession
	 */
	mergeableOperations: HistoryOperation["type"][];
}

/**
 * Callback interfaces for history operations
 */
interface DrawingHistoryCallbacks {
	onStateChange: StateChangeCallback;
	onFeedback: FeedbackCallback;
}

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
	#onStateChange: StateChangeCallback | null = null;
	#onFeedback: FeedbackCallback | null = null;
	#config: HistoryConfig;

	// History management
	#history: HistoryEntry[] = [];
	#currentPosition = -1; // Points to the current state in history
	#lastSnapshotTime = 0;
	#isRecording = true;
	#isApplyingHistory = false; // Prevents recursive history creation

	// Current state tracking
	#currentState: HistoryState;

	constructor(config?: Partial<HistoryConfig>) {
		this.#config = {
			maxHistorySize: 50,
			autoSnapshot: true,
			minSnapshotInterval: 100,
			alwaysSnapshot: [
				"deleteElements",
				"clearAll",
				"cutElements",
				"pasteElements",
				"duplicateElements",
			],
			mergeableOperations: ["moveElements", "updateElements"],
			...config,
		};

		this.#currentState = {
			elements: [],
			selectedElements: [],
			drawingMode: "cursor",
			metadata: {
				elementCount: 0,
				selectedCount: 0,
				timestamp: Date.now(),
			},
		};
	}

	/**
	 * Initialize with callbacks
	 */
	initialize(callbacks: DrawingHistoryCallbacks): void {
		this.#onStateChange = callbacks.onStateChange;
		this.#onFeedback = callbacks.onFeedback;
	}

	/**
	 * Record a new operation in history
	 */
	recordOperation(
		operation: HistoryOperation,
		newState: HistoryState,
		description?: string
	): void {
		if (!this.#isRecording || this.#isApplyingHistory) return;

		const now = Date.now();
		const shouldSnapshot =
			this.#config.autoSnapshot &&
			(this.#config.alwaysSnapshot.includes(operation.type) ||
				now - this.#lastSnapshotTime >= this.#config.minSnapshotInterval);

		if (!shouldSnapshot && this.#shouldMergeWithLastEntry(operation)) {
			this.#mergeWithLastEntry(operation, newState, description);
			return;
		}

		const entry: HistoryEntry = {
			id: this.#generateEntryId(),
			timestamp: now,
			operation,
			description: description || this.#getDefaultDescription(operation),
			beforeState: this.#cloneState(this.#currentState),
			afterState: this.#cloneState(newState),
		};

		// Remove any entries after current position (redo history)
		if (this.#currentPosition < this.#history.length - 1) {
			this.#history = this.#history.slice(0, this.#currentPosition + 1);
		}

		// Add new entry
		this.#history.push(entry);
		this.#currentPosition = this.#history.length - 1;

		// Update current state
		this.#currentState = this.#cloneState(newState);
		this.#lastSnapshotTime = now;

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

		const entry = this.#history[this.#currentPosition];
		if (!entry) {
			console.error("Undo: Entry not found at position", this.#currentPosition);
			this.#provideFeedback("Undo failed: Entry not found");
			return false;
		}

		if (!entry.beforeState) {
			console.error("Undo: No before state found for entry", entry.id);
			this.#provideFeedback("Undo failed: Invalid state");
			return false;
		}

		this.#isApplyingHistory = true;

		try {
			// Apply the before state
			this.#applyState(entry.beforeState);
			this.#currentPosition--;
			this.#currentState = this.#cloneState(entry.beforeState);

			this.#provideFeedback(`Undid: ${entry.description}`);
			return true;
		} catch (error) {
			console.error("Undo operation failed:", error);
			this.#provideFeedback("Undo failed: Operation error");
			return false;
		} finally {
			this.#isApplyingHistory = false;
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

		const entry = this.#history[this.#currentPosition + 1];
		if (!entry) {
			console.error(
				"Redo: Entry not found at position",
				this.#currentPosition + 1
			);
			this.#provideFeedback("Redo failed: Entry not found");
			return false;
		}

		if (!entry.afterState) {
			console.error("Redo: No after state found for entry", entry.id);
			this.#provideFeedback("Redo failed: Invalid state");
			return false;
		}

		this.#isApplyingHistory = true;

		try {
			// Apply the after state
			this.#applyState(entry.afterState);
			this.#currentPosition++;
			this.#currentState = this.#cloneState(entry.afterState);

			this.#provideFeedback(`Redid: ${entry.description}`);
			return true;
		} catch (error) {
			console.error("Redo operation failed:", error);
			this.#provideFeedback("Redo failed: Operation error");
			return false;
		} finally {
			this.#isApplyingHistory = false;
		}
	}

	/**
	 * Check if undo is possible
	 */
	canUndo(): boolean {
		return this.#currentPosition >= 0;
	}

	/**
	 * Check if redo is possible
	 */
	canRedo(): boolean {
		return this.#currentPosition < this.#history.length - 1;
	}

	/**
	 * Go to a specific position in history
	 */
	goToPosition(position: number): boolean {
		if (position < -1 || position >= this.#history.length) {
			return false;
		}

		this.#isApplyingHistory = true;

		try {
			let targetState: HistoryState;

			if (position === -1) {
				// Go to initial state (empty)
				targetState = {
					elements: [],
					selectedElements: [],
					drawingMode: "cursor",
					metadata: {
						elementCount: 0,
						selectedCount: 0,
						timestamp: Date.now(),
					},
				};
			} else {
				targetState = this.#history[position].afterState;
			}

			this.#applyState(targetState);
			this.#currentPosition = position;
			this.#currentState = this.#cloneState(targetState);

			return true;
		} finally {
			this.#isApplyingHistory = false;
		}
	}

	/**
	 * Clear all history
	 */
	clear(): void {
		this.#history = [];
		this.#currentPosition = -1;
		this.#lastSnapshotTime = 0;
		this.#provideFeedback("History cleared");
	}

	/**
	 * Get history statistics
	 */
	getStats(): HistoryStats {
		const oldest = this.#history[0];
		const newest = this.#history[this.#history.length - 1];

		return {
			totalEntries: this.#history.length,
			canUndo: this.canUndo(),
			canRedo: this.canRedo(),
			currentPosition: this.#currentPosition,
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
		return this.#history.map((entry, index) => ({
			id: entry.id,
			timestamp: entry.timestamp,
			operation: entry.operation.type,
			description: entry.description,
			isCurrent: index === this.#currentPosition,
		}));
	}

	/**
	 * Update current state (call this when state changes outside of operations)
	 */
	updateCurrentState(
		elements: DrawingElement[],
		selectedElements: string[],
		drawingMode: DrawingMode
	): void {
		this.#currentState = {
			elements: this.#cloneElements(elements),
			selectedElements: [...selectedElements],
			drawingMode,
			metadata: {
				elementCount: elements.length,
				selectedCount: selectedElements.length,
				timestamp: Date.now(),
			},
		};
	}

	/**
	 * Toggle recording on/off
	 */
	setRecording(enabled: boolean): void {
		this.#isRecording = enabled;
		this.#provideFeedback(
			enabled ? "History recording enabled" : "History recording disabled"
		);
	}

	/**
	 * Check if currently recording
	 */
	isRecording(): boolean {
		return this.#isRecording;
	}

	/**
	 * Update configuration
	 */
	updateConfig(config: Partial<HistoryConfig>): void {
		this.#config = { ...this.#config, ...config };
	}

	/**
	 * Get current configuration
	 */
	getConfig(): HistoryConfig {
		return { ...this.#config };
	}

	// Private helper methods

	#shouldMergeWithLastEntry(operation: HistoryOperation): boolean {
		if (this.#history.length === 0) return false;

		const lastEntry = this.#history[this.#history.length - 1];
		const timeDiff = Date.now() - lastEntry.timestamp;

		// Don't merge addElements operations - each drawn element should be its own history entry
		// This ensures undo removes one element at a time, not all elements since the last merge
		if (operation.type === "addElements") {
			return false;
		}

		return (
			this.#config.mergeableOperations.includes(operation.type) &&
			lastEntry.operation.type === operation.type &&
			timeDiff < this.#config.minSnapshotInterval
		);
	}

	#mergeWithLastEntry(
		_operation: HistoryOperation,
		newState: HistoryState,
		description?: string
	): void {
		const lastEntry = this.#history[this.#history.length - 1];

		// Update the after state of the last entry
		lastEntry.afterState = this.#cloneState(newState);
		lastEntry.timestamp = Date.now();

		if (description) {
			lastEntry.description = description;
		}

		this.#currentState = this.#cloneState(newState);
	}

	#applyState(state: HistoryState): void {
		if (!this.#onStateChange) return;

		// Apply elements
		this.#onStateChange({
			type: "action",
			action: "updateElements",
			elements: this.#cloneElements(state.elements),
		});

		// Apply selection
		this.#onStateChange({
			type: "action",
			action: "updateSelection",
			selectedElements: [...state.selectedElements],
		});

		// Apply drawing mode
		this.#onStateChange({
			type: "modeChange",
			drawingMode: state.drawingMode,
		});

		// Trigger layer synchronization after state restore
		this.#onStateChange({
			type: "layerAction",
			action: "syncLayerElements",
			elements: this.#cloneElements(state.elements),
		});
	}

	#cloneState(state: HistoryState): HistoryState {
		return {
			elements: this.#cloneElements(state.elements),
			selectedElements: [...state.selectedElements],
			drawingMode: state.drawingMode,
			metadata: state.metadata ? { ...state.metadata } : undefined,
		};
	}

	#cloneElements(elements: DrawingElement[]): DrawingElement[] {
		return elements.map((element) => ({
			...element,
			points: element.points.map((point) => ({ ...point })),
			text: element.text ? { ...element.text } : undefined,
			direction: element.direction
				? {
						start: { ...element.direction.start },
						end: { ...element.direction.end },
					}
				: undefined,
		}));
	}

	#trimHistory(): void {
		if (this.#history.length <= this.#config.maxHistorySize) return;

		const entriesToRemove = this.#history.length - this.#config.maxHistorySize;
		this.#history = this.#history.slice(entriesToRemove);
		this.#currentPosition = Math.max(
			-1,
			this.#currentPosition - entriesToRemove
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
		};

		return descriptions[operation.type] || "Unknown operation";
	}

	#calculateMemoryUsage(): HistoryStats["memoryUsage"] {
		// Rough estimation of memory usage
		const bytesPerElement = 200; // Rough estimate per element
		const bytesPerEntry = 100; // Rough estimate per history entry

		const elementsCount = this.#history.reduce(
			(total, entry) =>
				total +
				entry.beforeState.elements.length +
				entry.afterState.elements.length,
			0
		);

		return {
			estimatedBytes:
				this.#history.length * bytesPerEntry + elementsCount * bytesPerElement,
			entriesCount: this.#history.length,
			statesCount: this.#history.length * 2, // before and after states
		};
	}

	#provideFeedback(message: string): void {
		if (this.#onFeedback) {
			this.#onFeedback(message);
		}
	}

	/**
	 * Export history for debugging or persistence
	 */
	exportHistory(): unknown {
		return {
			config: this.#config,
			currentPosition: this.#currentPosition,
			history: this.#history.map((entry) => ({
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
		return this.#history[this.#currentPosition].description;
	}

	getRedoPreview(): string | null {
		if (!this.canRedo()) return null;
		return this.#history[this.#currentPosition + 1].description;
	}

	/**
	 * Check if history is currently being applied (during undo/redo)
	 */
	get isApplyingHistory(): boolean {
		return this.#isApplyingHistory;
	}
}
