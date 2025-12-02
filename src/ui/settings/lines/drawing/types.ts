/**
 * Drawing Engine Types
 * Core types and interfaces for the drawing engine system
 */

// ============================================================================
// Basic Types
// ============================================================================

export interface Point {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface DrawingColors {
	line: string;
	area: string;
	curve: string;
	rectangle: string;
	circle: string;
}

export interface InteractionThresholds {
	line: number;
	area: number;
	curve: number;
	point: number;
}

export interface HistoryOperation {
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
		| "sendToBack"
		| "createLayer"
		| "deleteLayer"
		| "duplicateLayer"
		| "renameLayer"
		| "reorderLayers"
		| "toggleLayerVisibility"
		| "setLayerOpacity"
		| "setActiveLayer";
	data?: unknown;
}

export interface HistoryConfig {
	/** Maximum number of history entries to keep */
	maxHistorySize: number;
	/** Whether to automatically create snapshots before operations */
	autoSnapshot: boolean;
	/** Minimum time between automatic snapshots (ms) */
	minSnapshotInterval: number;
	/** Operations that should always create a snapshot */
	alwaysSnapshot: HistoryOperation["type"][];
	/** Operations that should be merged if they happen in quick succession */
	mergeableOperations: HistoryOperation["type"][];
}

export interface RenderingConfig {
	/** Default line width for drawing elements */
	defaultLineWidth: number;
	/** Default opacity for drawing elements (0.0 to 1.0) */
	defaultOpacity: number;
	/** Line width for selected elements */
	selectedLineWidth: number;
	/** Line width for hovered elements */
	hoveredLineWidth: number;
	/** Whether to show direction arrows on lines and curves */
	showDirectionArrows: boolean;
	/** Size of direction arrows */
	arrowSize: number;
	/** Whether to anti-alias drawing elements */
	antiAlias: boolean;
}

export interface TextConfig {
	/** Default font size for text annotations */
	defaultFontSize: number;
	/** Default font family for text annotations */
	defaultFontFamily: string;
	/** Available font sizes for text editor */
	availableFontSizes: number[];
	/** Available font families for text editor */
	availableFontFamilies: string[];
	/** Default background opacity for text labels */
	defaultBackgroundOpacity: number;
	/** Default background color for text labels */
	defaultBackgroundColor: string;
}

export interface LayerConfig {
	/** Default layer name prefix */
	defaultPrefix: string;
	/** Maximum number of layers */
	max: number;
	/** Default opacity for new layers */
	defaultOpacity: number;
	/** Whether to auto-name layers */
	autoName: boolean;
	/** Layer colors for UI indication */
	colors: string[];
	/** Container bounds for fit operations */
	containerBounds?: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	/** Whether to enable layer grouping features */
	enableLayerGroups: boolean;
	defaultLayer?: Partial<
		Omit<LayerInfo, "id" | "zIndex" | "elementIds" | "createdAt" | "updatedAt">
	>;
}

export interface ArrangeConfig {
	/** Default spacing for distribution operations */
	defaultSpacing: number;
	/** Snap tolerance for alignment operations */
	snapTolerance: number;
	/** Whether to maintain aspect ratios during scaling */
	maintainAspectRatio: boolean;
	/** Default rotation angle in degrees */
	defaultRotationAngle: number;
	/** Container bounds for fit operations */
	containerBounds?: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
}

export interface CallbacksConfig {
	/** Callback for state change events */
	stateChange: StateChangeCallback;
	/** Callback for feedback messages */
	feedback: FeedbackCallback;
}

export interface ResolutionConfig {
	target: Size;
	native: Size;
	media: Size;
	display: Size;
}

export interface DrawingEngineConfig {
	/** Target processing resolution (media will be scaled to this resolution) */
	resolution?: Partial<ResolutionConfig>;
	/** Color configuration for drawing elements */
	colors?: Partial<DrawingColors>;
	/** Interaction threshold configuration */
	interactionThresholds?: Partial<InteractionThresholds>;
	/** History management configuration */
	history?: Partial<HistoryConfig>;
	/** Rendering configuration */
	rendering?: Partial<RenderingConfig>;
	/** Text and annotation configuration */
	text?: Partial<TextConfig>;
	/** Layer management configuration */
	layers?: Partial<LayerConfig>;
	/** Arrangement and alignment configuration */
	arrange?: Partial<ArrangeConfig>;
	/** Callback functions for engine events */
	on?: Partial<CallbacksConfig>;
}

// ============================================================================
// Layer Types
// ============================================================================

export type LayerVisibility = "visible" | "hidden" | "locked";

export interface LayerInfo {
	id: string;
	name: string; // layer name (user-defined)
	description: string;
	category: string[]; // vehicle ids (1..n)
	visibility: LayerVisibility;
	opacity: number; // 0.0 to 1.0
	zIndex: number;
	elementIds: string[];
	color?: string; // vehicle color
	createdAt: number;
	updatedAt: number;
	syncState?: ElementSyncState; // Track sync state with backend
	addedCategories?: string[]; // Vehicle IDs that were added (for sync)
	removedCategories?: string[]; // Vehicle IDs that were removed (for sync)
}

export interface HistoryState {
	elementCount: number;
	selectedCount: number;
	timestamp: number;
}

// ============================================================================
// Drawing Element Types
// ============================================================================

export type DrawingElementType =
	| "line"
	| "area"
	| "curve"
	| "rectangle"
	| "circle";

export type DrawingMode = "cursor" | "select" | "erase" | DrawingElementType;

export type ElementSyncState = "saved" | "new" | "edited" | "deleted";

export interface DrawingElement {
	id: string;
	type: DrawingElementType;
	points: Point[]; // UI representational
	detection?: {
		entry: Point[];
		exit: Point[];
	}; // Also will send to backend bu this is for detection vehicles
	color: string;
	completed: boolean;
	layerId?: string;
	groupId?: string;
	direction?: { start: Point; end: Point } | null;
	info: {
		name: string;
		description?: string;
		type: "DETECTION" | "CONFIGURATION" | "NEAR_MISS";
		direction: "left" | "right" | "top" | "bottom";
		distance: number;
		fontSize: number;
		fontFamily: string;
		backgroundColor?: string;
		backgroundOpacity: number;
	};
	// Track sync state with backend to avoid duplicates and handle updates
	syncState?: ElementSyncState;
}

export interface MediaMatrix {
	width: number;
	height: number;
	matrix: number[][];
	elements: DrawingElement[];
}

export interface DragState {
	isDragging: boolean;
	elementId: string | null;
	pointIndex: number | null;
	pointType?: "main" | "entry" | "exit" | null;
}

// ============================================================================
// State Change Events
// ============================================================================

export type StateChangeCallback = (stateChange: StateChangeEvent) => void;
export type FeedbackCallback = (message: string) => void;

// Mouse Events
export interface MouseDownEvent {
	type: "mouseDown";
	displayPoint: Point;
	mediaPoint: Point;
	event: MouseEvent;
}

export interface MouseMoveEvent {
	type: "mouseMove";
	displayPoint: Point;
	mediaPoint: Point;
	event: MouseEvent;
}

export interface MouseUpEvent {
	type: "mouseUp";
	event: MouseEvent;
}

export interface DoubleClickEvent {
	type: "doubleClick";
	displayPoint: Point;
	mediaPoint: Point;
	event: MouseEvent;
}

export interface MouseLeaveEvent {
	type: "mouseLeave";
	event: MouseEvent;
}

// Media Events
export interface MediaLoadedEvent {
	type: "mediaLoaded";
	mediaSize: Size;
	displaySize: Size;
}

export interface ResizeEvent {
	type: "resize";
	displaySize: Size;
}

export interface ImportCompleteEvent {
	type: "importComplete";
	elements: DrawingElement[];
	layers: LayerInfo[];
}

// Keyboard Shortcut Events
export interface ShortcutEvent {
	type: "shortcut";
	action: string;
	key: string;
	pasteAtPosition?: boolean;
	reverse?: boolean;
	direction?: string;
	step?: number;
	[key: string]: unknown;
}

// Action Events
export interface AddElementsAction {
	type: "action";
	action: "addElements";
	elements: DrawingElement[];
	selectElements?: boolean;
}

export interface UpdateElementsAction {
	type: "action";
	action: "updateElements";
	elements: DrawingElement[];
}

export interface DeleteElementsAction {
	type: "action";
	action: "deleteElements";
	elementIds: string[]; // IDs of elements to remove immediately (new elements)
	markedAsDeleted?: string[]; // IDs of elements marked as deleted (saved/edited elements)
}

export interface UpdateSelectionAction {
	type: "action";
	action: "updateSelection";
	selectedElements: string[];
	reason?: string;
}

export interface ClearAllAction {
	type: "action";
	action: "clearAll";
}

export interface UndoAction {
	type: "action";
	action: "undo";
}

export interface ExportAction {
	type: "action";
	action: "export";
	data: MediaMatrix;
}

export interface SaveAction {
	type: "action";
	action: "saveRequested";
}

export type ActionEvent =
	| AddElementsAction
	| UpdateElementsAction
	| DeleteElementsAction
	| UpdateSelectionAction
	| ClearAllAction
	| UndoAction
	| ExportAction
	| SaveAction;

// Annotation Events
export interface OpenTextEditorAnnotation {
	type: "annotation";
	action: "openTextEditor";
	elementId: string;
	currentText: string;
	currentDescription: string;
	currentType: "DETECTION" | "CONFIGURATION" | "NEAR_MISS";
	currentDirection: "left" | "right" | "top" | "bottom";
	currentDistance?: number;
	currentFontSize: number;
	currentBackgroundEnabled: boolean;
}

export interface UpdateElementTextAnnotation {
	type: "annotation";
	action: "updateElementText";
	elements: DrawingElement[];
}

export interface RemoveElementTextAnnotation {
	type: "annotation";
	action: "removeElementText";
	elements: DrawingElement[];
}

export interface AutoGenerateLabelsAnnotation {
	type: "annotation";
	action: "autoGenerateLabels";
	elements: DrawingElement[];
}

export interface BulkUpdateTextAnnotation {
	type: "annotation";
	action: "bulkUpdateText";
	elements: DrawingElement[];
}

export type AnnotationEvent =
	| OpenTextEditorAnnotation
	| UpdateElementTextAnnotation
	| RemoveElementTextAnnotation
	| AutoGenerateLabelsAnnotation
	| BulkUpdateTextAnnotation;

// Mode Change Events
export interface ModeChangeEvent {
	type: "modeChange";
	drawingMode: DrawingMode;
}

// Layer Events
export interface LayerCreatedAction {
	type: "layerAction";
	action: "layerCreated";
	layer: LayerInfo;
}

export interface LayerDeletedAction {
	type: "layerAction";
	action: "layerDeleted";
	layerId: string;
	affectedElements: DrawingElement[];
}

export interface LayerVisibilityChangedAction {
	type: "layerAction";
	action: "layerVisibilityChanged";
	layerId: string;
	visibility: LayerVisibility;
}

export interface LayerOpacityChangedAction {
	type: "layerAction";
	action: "layerOpacityChanged";
	layerId: string;
	opacity: number;
}

export interface LayerDuplicatedAction {
	type: "layerAction";
	action: "layerDuplicated";
	sourceLayerId: string;
	newLayer: LayerInfo;
}

export interface LayerRenamedAction {
	type: "layerAction";
	action: "layerRenamed";
	layerId: string;
	oldName: string;
	newName: string;
}

export interface LayerUpdatedAction {
	type: "layerAction";
	action: "layerUpdated";
	layer: LayerInfo;
}

export interface ActiveLayerChangedAction {
	type: "layerAction";
	action: "activeLayerChanged";
	previousLayerId: string | null;
	activeLayerId: string;
}

export interface LayerIsolationClearedAction {
	type: "layerAction";
	action: "layerIsolationCleared";
}

export interface LayerIsolatedAction {
	type: "layerAction";
	action: "layerIsolated";
	layerId: string;
}

export interface SyncLayerElementsAction {
	type: "layerAction";
	action: "syncLayerElements";
	elements: DrawingElement[];
}

export type LayerActionEvent =
	| LayerCreatedAction
	| LayerDeletedAction
	| LayerVisibilityChangedAction
	| LayerOpacityChangedAction
	| LayerDuplicatedAction
	| LayerRenamedAction
	| LayerUpdatedAction
	| ActiveLayerChangedAction
	| LayerIsolationClearedAction
	| LayerIsolatedAction
	| SyncLayerElementsAction;

// Effect Events
export interface EffectActionEvent {
	type: "effectAction";
	action: string;
	[key: string]: unknown;
}

// UI Events
export interface TogglePanelEvent {
	type: "togglePanel";
}

export interface FeedbackEvent {
	type: "feedback";
	message: string | null;
}

// Union type of all possible state change events
export type StateChangeEvent =
	| MouseDownEvent
	| MouseMoveEvent
	| MouseUpEvent
	| DoubleClickEvent
	| MouseLeaveEvent
	| MediaLoadedEvent
	| ResizeEvent
	| ImportCompleteEvent
	| ShortcutEvent
	| ActionEvent
	| AnnotationEvent
	| ModeChangeEvent
	| LayerActionEvent
	| EffectActionEvent
	| TogglePanelEvent
	| FeedbackEvent;

// ============================================================================
// Module Events Interfaces
// ============================================================================

export interface DrawingCallbacks {
	onStateChange: StateChangeCallback;
	onFeedback: FeedbackCallback;
}

// ============================================================================
// Text and Annotation Types
// ============================================================================

export interface TextData {
	name: string;
	content?: string; // Deprecated - use name instead
	description?: string;
	type: "DETECTION" | "CONFIGURATION" | "NEAR_MISS";
	direction: "left" | "right" | "top" | "bottom";
	distance: number;
	fontSize: number;
	fontFamily?: string;
	backgroundEnabled: boolean;
}

export interface TextFormattingOptions {
	fontSizes: number[];
	fontFamilies: string[];
	backgroundColors: string[];
}

export type LabelType = "type" | "index" | "coordinates" | "color";

// ============================================================================
// Statistics and Analysis Types
// ============================================================================

export interface DrawingStatistics {
	total: number;
	completed: number;
	withText: number;
	byType: {
		line: number;
		area: number;
		curve: number;
		rectangle: number;
		circle: number;
	};
	averagePoints: number;
	colors: ColorAnalysis;
	textStats: TextAnalysis;
}

export interface ColorAnalysis {
	unique: number;
	distribution: Record<string, number>;
	mostUsed: string | null;
}

export interface TextAnalysis {
	total: number;
	averageLength: number;
	fontSizes: number[];
	longestText: {
		content: string;
		length: number;
		elementType: string;
	} | null;
	shortestText: {
		content: string;
		length: number;
		elementType: string;
	} | null;
	withDescription: number;
	averageDescriptionLength: number;
}

// ============================================================================
// Validation and Accessibility Types
// ============================================================================

export interface ValidationError {
	elementId: string;
	elementIndex: number;
	type: string;
	message: string;
}

export interface AccessibilityIssue {
	elementId: string;
	elementIndex: number;
	type: string;
	severity: "error" | "warning" | "info";
	message: string;
}

export interface AccessibilityReport {
	totalIssues: number;
	issues: AccessibilityIssue[];
	summary: {
		errors: number;
		warnings: number;
		info: number;
	};
}

// ============================================================================
// Alignment and Arrangement Types
// ============================================================================

export type AlignmentType =
	| "left"
	| "right"
	| "top"
	| "bottom"
	| "centerX"
	| "centerY";

// ============================================================================
// Engine Interfaces
// ============================================================================

export interface DrawingEngineInterface {
	// Configuration
	getConfig(): {
		resolution: ResolutionConfig;
		colors: DrawingColors;
		interactionThresholds: InteractionThresholds;
		history: HistoryConfig;
		rendering: RenderingConfig;
		layers: LayerConfig;
		arrange: ArrangeConfig;
		text: TextConfig;
	};

	// Size and coordinate management
	// updateSizes(mediaSize: Size, displaySize: Size): void;
	displayToMediaCoords(point: Point): Point;
	mediaToDisplayCoords(point: Point): Point;
	getDisplaySize(): Size;
	getMediaSize(): Size;

	// Canvas rendering
	redrawCanvas(
		canvas: HTMLCanvasElement,
		elements: DrawingElement[],
		currentElement: DrawingElement | null,
		selectedElements: string[],
		hoveredElement: string | null,
		dragState: DragState
	): void;
	requestRedraw(): void;

	// Element operations
	calculateDirection(
		element: DrawingElement
	): { start: Point; end: Point } | null;
	generateMatrix(elements: DrawingElement[]): MediaMatrix;
	distanceToLineSegment(point: Point, lineStart: Point, lineEnd: Point): number;
	pointInPolygon(point: Point, polygon: Point[]): boolean;

	// State subscriptions
	subscribeToStateChanges(callback: StateChangeCallback): () => void;

	// Text operations
	completeTextInput(elementId: string, textData: TextData): void;
	cancelTextInput(): void;
	addText(): void;

	// Drawing mode
	setDrawingMode(mode: DrawingMode): void;

	// Element management
	deleteSelectedElements(): void;
	clearAll(): void;
	exportDrawings(): void;

	// Snapshot operations
	takeSnapshot(format?: "png" | "jpeg", quality?: number): Promise<Blob>;
	takeSnapshotAndDownload(
		filename?: string,
		format?: "png" | "jpeg",
		quality?: number
	): { success: boolean; fallback: boolean };

	// Clipboard operations
	copySelectedElements(): number;
	cutSelectedElements(): void;
	pasteElements(atPosition?: boolean, position?: Point): void;
	duplicateSelectedElements(): void;
	clearSelection(): void;
	clearClipboard(): void;
	resetPasteOffset(): void;
	getClipboard(): DrawingElement[];
	hasClipboardContent(): boolean;

	// Selection operations
	selectAllElements(): string[];

	// Group operations
	groupSelectedElements(): string | undefined;
	ungroupSelectedElements(): void;

	// Z-order operations
	bringToFront(): DrawingElement[];
	sendToBack(): DrawingElement[];

	// Alignment operations
	alignElements(alignment: AlignmentType): void;

	// Movement operations
	moveSelectedElements(offset: Point): void;

	// History operations
	canUndo(): boolean;
	canRedo(): boolean;
	undoLast(): void;
	redoLast(): void;
	getUndoPreview(): string | null;
	getRedoPreview(): string | null;
	getHistoryStats(): unknown;

	// Layer management
	createLayer(options: {
		name: string;
		description?: string;
		category?: string[];
		opacity?: number;
		visibility?: "visible" | "hidden" | "locked";
		color?: string;
		insertIndex?: number;
	}): unknown;
	deleteLayer(layerId: string): unknown;
	duplicateLayer(layerId: string): unknown;
	moveElementsToLayer(elementIds: string[], targetLayerId: string): unknown;
	toggleLayerVisibility(layerId: string): unknown;
	setLayerOpacity(layerId: string, opacity: number): unknown;
	setActiveLayer(layerId: string): unknown;
	renameLayer(layerId: string, name: string): unknown;
	updateLayer(
		layerId: string,
		updates: Partial<Omit<LayerInfo, "id">>
	): unknown;
	isolateLayer(layerId: string): unknown;
	getLayer(layerId: string): unknown;
	getLayers(): unknown[];
	getActiveLayer(): unknown;
	getVisibleLayers(): unknown[];

	// Arrangement operations
	groupElementsInLayer(
		selectedElements: string[],
		layerId?: string,
		metadata?: unknown
	): unknown;
	alignElementsInLayer(
		selectedElements: string[],
		alignment: AlignmentType,
		layerId?: string
	): unknown;
	distributeElementsInLayer(
		selectedElements: string[],
		direction: "horizontal" | "vertical",
		layerId?: string,
		spacing?: number
	): unknown;
	changeZOrderInLayer(
		selectedElements: string[],
		operation: "bringToFront" | "sendToBack" | "bringForward" | "sendBackward",
		layerId?: string
	): unknown;
	flipElements(
		selectedElements: string[],
		direction: "horizontal" | "vertical"
	): unknown;

	// Effect operations
	addLayerEffect(
		layerId: string,
		effectType: string,
		config?: unknown
	): unknown;
	removeLayerEffect(layerId: string, effectId: string): unknown;
	updateLayerEffect(
		layerId: string,
		effectId: string,
		updates: unknown
	): unknown;
	getLayerEffects(layerId: string): unknown[];

	// Smart guides
	enableSmartGuide(guideType: string, config?: unknown): unknown;
	disableSmartGuide(guideId: string): unknown;
	getEnabledGuides(): unknown[];
	getVisualGuides(): unknown[];
	startDrag(): void;
	endDrag(): void;

	// State getters (readonly)
	readonly drawingMode: DrawingMode;
	readonly selectedElements: string[];
	readonly elements: DrawingElement[];
	readonly isInitialized: boolean;
	readonly feedbackMessage: string | null;
	readonly showFeedback: boolean;

	// Sync state methods
	markAllLayersAsSaved(): void;
	getLayerSyncStateStats(): {
		new: number;
		edited: number;
		saved: number;
		total: number;
	};
	getUnsyncedLayers(): LayerInfo[];

	// Feedback methods
	setFeedback(message: string, duration?: number): void;
	clearFeedback(): void;
}

export interface DrawingUtilsInterface {
	findElementNearMouse(
		mousePos: Point,
		elements: DrawingElement[]
	): string | null;
	findPointNearMouse(
		mousePos: Point,
		elements: DrawingElement[]
	): { elementId: string; pointIndex: number } | null;
	getMousePos(event: MouseEvent, canvas: HTMLCanvasElement | null): Point;
	getElementBounds(
		element: DrawingElement
	): { minX: number; minY: number; maxX: number; maxY: number } | null;
	generateElementId(): string;
	updateDrawingEngine(drawingEngine: DrawingEngineInterface): void;
}
