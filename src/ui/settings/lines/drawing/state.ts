import type {
	DragState,
	DrawingElement,
	DrawingMode,
	HistoryOperation,
	HistoryState,
	LayerInfo,
	StateChangeCallback,
} from "./types";

// Group information (from arrange module)
interface GroupInfo {
	id: string;
	elementIds: string[];
	bounds: {
		minX: number;
		minY: number;
		maxX: number;
		maxY: number;
		width: number;
		height: number;
		centerX: number;
		centerY: number;
	};
	createdAt: number;
	metadata?: {
		name?: string;
		description?: string;
		color?: string;
	};
}

export type { GroupInfo };

/**
 * History entry representing a single operation that can be undone/redone
 */
export interface HistoryEntry {
	id: string;
	timestamp: number;
	operation: HistoryOperation;
	description: string;
	beforeState: DrawingState;
	afterState: DrawingState;
}

/**
 * History management state
 */
export interface HistoryManagement {
	metadata: HistoryState;
	entries: HistoryEntry[];
	position: number;
	lastSnapshotTime: number;
	recording: boolean;
	isApplyingHistory: boolean;
}

export interface DrawingStateProperties {
	drawing: boolean;
	mode: DrawingMode;
	currentElement: DrawingElement | null;
	elements: DrawingElement[];
	selectedElements: string[];
	hoveredElement: string | null;
	drag: DragState;
	history: HistoryManagement;
	isEditingText: boolean;
	editingTextId: string | null;
	isMediaLoaded: boolean;
	clipboard: DrawingElement[];
	pasteOffset: { x: number; y: number };
	layers: Map<string, LayerInfo>;
	layerOrder: string[];
	activeLayerId: string | null;
	layerCounter: number;
	isolatedLayerId: string | null;
	groups: Map<string, GroupInfo>;
	groupCounter: number;
	feedbackMessage: string | null;
	showFeedback: boolean;
}

export class DrawingState implements DrawingStateProperties {
	drawing: boolean = false;
	mode: DrawingMode = "cursor";
	currentElement: DrawingElement | null = null;
	elements: DrawingElement[] = [];
	selectedElements: string[] = [];
	hoveredElement: string | null = null;
	drag: DragState = {
		isDragging: false,
		elementId: null,
		pointIndex: null,
	};
	history: HistoryManagement = {
		metadata: {
			elementCount: 0,
			selectedCount: 0,
			timestamp: Date.now(),
		},
		entries: [],
		position: -1,
		lastSnapshotTime: 0,
		recording: true,
		isApplyingHistory: false,
	};

	// Text editing state (transient - used by shortcuts and annotation modules)
	isEditingText: boolean = false;
	editingTextId: string | null = null;

	// Media loading state (internal - used by events module)
	isMediaLoaded: boolean = false;

	// Clipboard state (operational - used by actions module)
	clipboard: DrawingElement[] = [];
	pasteOffset: { x: number; y: number } = { x: 20, y: 20 };

	// Layer management state (management - used by layers module)
	layers: Map<string, LayerInfo> = new Map();
	layerOrder: string[] = [];
	activeLayerId: string | null = null;
	layerCounter: number = 0;
	isolatedLayerId: string | null = null;

	// Group management state (management - used by arrange module)
	groups: Map<string, GroupInfo> = new Map();
	groupCounter: number = 0;

	// Feedback state (UI feedback messages)
	feedbackMessage: string | null = null;
	showFeedback: boolean = false;

	// Additional state change subscribers
	subscribers: StateChangeCallback[] = [];

	constructor(init?: Partial<DrawingStateProperties>) {
		Object.assign(this, init);
	}

	updateMode(mode: DrawingMode) {
		this.mode = mode;
	}

	updateElements(elements: DrawingElement[]) {
		this.elements = elements;
	}

	updateSelectedElements(selectedElements: string[]) {
		this.selectedElements = selectedElements;
	}

	setFeedback(message: string | null, show: boolean = true) {
		this.feedbackMessage = message;
		this.showFeedback = show;
	}

	clearFeedback() {
		this.feedbackMessage = null;
		this.showFeedback = false;
	}

	generateTimestamp() {
		this.history.metadata = {
			elementCount: this.elements.length,
			selectedCount: this.selectedElements.length,
			timestamp: Date.now(),
		};
	}

	clone(): DrawingState {
		const state = DrawingState.cloneState(this);
		state.generateTimestamp();

		return state;
	}

	static cloneState(state: DrawingStateProperties): DrawingState {
		return new DrawingState({
			elements: this.cloneElements(state.elements),
			selectedElements: structuredClone(state.selectedElements),
			mode: state.mode,
			drawing: state.drawing,
			currentElement: state.currentElement
				? structuredClone(state.currentElement)
				: null,
			hoveredElement: state.hoveredElement,
			drag: { ...state.drag },
			isEditingText: state.isEditingText,
			editingTextId: state.editingTextId,
			isMediaLoaded: state.isMediaLoaded,
			clipboard: this.cloneElements(state.clipboard),
			pasteOffset: { ...state.pasteOffset },
			layers: new Map(state.layers),
			layerOrder: [...state.layerOrder],
			activeLayerId: state.activeLayerId,
			layerCounter: state.layerCounter,
			isolatedLayerId: state.isolatedLayerId,
			groups: new Map(state.groups),
			groupCounter: state.groupCounter,
			feedbackMessage: state.feedbackMessage,
			showFeedback: state.showFeedback,
			// Don't clone history - it stays managed by the DrawingHistory module
		});
	}

	/**
	 * Clone state for history snapshots (excludes history field to avoid circular refs)
	 * Also excludes transient UI state (drag, drawing, currentElement, hoveredElement, isEditingText, editingTextId),
	 * and operational state (isMediaLoaded, clipboard, pasteOffset)
	 * since these are ephemeral states that exist only during user interactions or are operational buffers.
	 *
	 * Layer state IS included to support undo/redo of layer operations (create, delete, rename, etc.)
	 * Group state is still excluded as groups are derived from elements.
	 */
	static cloneStateForHistory(state: DrawingStateProperties): DrawingState {
		const cloned = new DrawingState({
			elements: this.cloneElements(state.elements),
			selectedElements: structuredClone(state.selectedElements),
			mode: state.mode,
			// Include layer state for layer operation undo/redo
			layers: new Map(state.layers),
			layerOrder: [...state.layerOrder],
			activeLayerId: state.activeLayerId,
			layerCounter: state.layerCounter,
			isolatedLayerId: state.isolatedLayerId,
		});
		// Don't include history to avoid massive nested structures
		// Don't include transient UI state (drag, drawing, currentElement, hoveredElement, isEditingText, editingTextId)
		// Don't include operational state (isMediaLoaded, clipboard, pasteOffset)
		// Don't include group state (groups, groupCounter) - groups are derived from elements
		return cloned;
	}

	static cloneElements(elements: DrawingElement[]): DrawingElement[] {
		return structuredClone(elements);
	}
}
