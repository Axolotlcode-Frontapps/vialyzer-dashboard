export interface Point {
	x: number;
	y: number;
}

export interface DrawingElement {
	id: string;
	type: "line" | "area" | "curve" | "rectangle" | "circle";
	points: Point[];
	color: string;
	completed: boolean;
	/**
	 * Optional layer ID for organizing elements into layers.
	 * Elements with the same layerId are on the same layer for visibility and organization.
	 */
	layerId?: string;
	/**
	 * Optional group ID for grouping multiple elements together.
	 * Elements with the same groupId are treated as a group for operations.
	 */
	groupId?: string;
	/**
	 * Direction vector for lines and curves to show vehicle movement direction.
	 * Contains start and end points that define the direction arrow.
	 * Automatically calculated when element is completed or points are modified.
	 */
	direction?: { start: Point; end: Point } | null;
	/**
	 * Optional text label that can be attached to any drawing element.
	 * Used for annotations like "Car", "Lane 1", "Speed 50mph", etc.
	 */
	text?: {
		content: string;
		description?: string;
		fontSize: number;
		fontFamily: string;
		backgroundColor?: string;
		backgroundOpacity: number;
	};
}

export interface MediaMatrix {
	width: number;
	height: number;
	matrix: number[][];
	elements: DrawingElement[];
}

export type DrawingMode =
	| "cursor"
	| "select"
	| "erase"
	| "line"
	| "area"
	| "curve"
	| "rectangle"
	| "circle";

export interface DragState {
	isDragging: boolean;
	elementId: string | null;
	pointIndex: number | null;
}

export interface LinesProps {
	src: string;
	type: "video" | "image";
	onDrawingComplete?: (matrixData: MediaMatrix) => void;
	onSave?: (elements: DrawingElement[]) => Promise<void>;
	onLoad?: () => Promise<DrawingElement[]>;
}

// Callback interfaces for modules
export type StateChangeCallback = (stateChange: StateChangeEvent) => void;

export type FeedbackCallback = (message: string) => void;

// State change event types
export interface StateChangeEvent {
	type: string;
	[key: string]: unknown;
}

export interface MouseEventData {
	type: "mouseDown" | "mouseMove" | "mouseUp" | "doubleClick" | "mouseLeave";
	displayPoint?: Point;
	mediaPoint?: Point;
	event?: MouseEvent;
}

export interface ShortcutEventData {
	type: "shortcut";
	action: string;
	key: string;
	pasteAtPosition?: boolean;
	reverse?: boolean;
	direction?: string;
	step?: number;
}

export interface ActionEventData {
	type: "action";
	action: string;
	elements?: DrawingElement[];
	elementIds?: string[];
	selectedElements?: string[];
	selectElements?: boolean;
	data?: unknown;
}

export interface AnnotationEventData {
	type: "annotation";
	action: string;
	elementId?: string;
	currentText?: string;
	currentFontSize?: number;
	currentBackgroundEnabled?: boolean;
	currentDescription?: string;
	elements?: DrawingElement[];
}

// Engine interfaces
export interface DrawingEngineInterface {
	updateSizes(
		mediaSize: { width: number; height: number },
		displaySize: { width: number; height: number }
	): void;
	displayToMediaCoords(point: Point): Point;
	mediaToDisplayCoords(point: Point): Point;
	redrawCanvas(
		canvas: HTMLCanvasElement,
		elements: DrawingElement[],
		currentElement: DrawingElement | null,
		selectedElements: string[],
		hoveredElement: string | null,
		dragState: DragState
	): void;
	calculateDirection(
		element: DrawingElement
	): { start: Point; end: Point } | null;
	generateMatrix(elements: DrawingElement[]): MediaMatrix;
	distanceToLineSegment(point: Point, lineStart: Point, lineEnd: Point): number;
	pointInPolygon(point: Point, polygon: Point[]): boolean;
	subscribeToStateChanges(callback: StateChangeCallback): () => void;
	completeTextInput(elementId: string, textData: TextData): void;
	cancelTextInput(): void;
	requestRedraw(): void;
	setDrawingMode(mode: DrawingMode): void;
	deleteSelectedElements(): void;
	undoLast(): void;
	clearAll(): void;
	exportDrawings(): void;
	addText(): void;
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
	redoLast(): void;
	getUndoPreview(): string | null;
	getRedoPreview(): string | null;

	// Layer management
	createLayer(
		name?: string,
		options?: {
			opacity?: number;
			visibility?: "visible" | "hidden" | "locked";
			color?: string;
			insertIndex?: number;
		}
	): unknown;
	deleteLayer(layerId: string): unknown;
	moveElementsToLayer(elementIds: string[], targetLayerId: string): unknown;
	toggleLayerVisibility(layerId: string): unknown;
	setLayerOpacity(layerId: string, opacity: number): unknown;
	setActiveLayer(layerId: string): unknown;
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
	getHistoryStats(): unknown;

	// Getters for state access
	readonly drawingMode: DrawingMode;
	readonly selectedElements: string[];
	readonly elements: DrawingElement[];
	readonly isInitialized: boolean;
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
	getMousePos(
		event: React.MouseEvent<HTMLCanvasElement>,
		canvas: HTMLCanvasElement | null
	): Point;
	getElementBounds(
		element: DrawingElement
	): { minX: number; minY: number; maxX: number; maxY: number } | null;
	generateElementId(): string;
	updateDrawingEngine(drawingEngine: DrawingEngineInterface): void;
}

// Initialization callback interfaces
export interface DrawingEventsCallbacks {
	onStateChange: StateChangeCallback;
}

export interface DrawingShortcutsCallbacks {
	onStateChange: StateChangeCallback;
}

export interface DrawingActionsCallbacks {
	onStateChange: StateChangeCallback;
	onFeedback: FeedbackCallback;
}

export interface DrawingAnnotationCallbacks {
	onStateChange: StateChangeCallback;
	onFeedback: FeedbackCallback;
}

// Text data interfaces
export interface TextData {
	content: string;
	description?: string;
	fontSize: number;
	fontFamily?: string;
	backgroundEnabled: boolean;
}

export interface TextFormattingOptions {
	fontSizes: number[];
	fontFamilies: string[];
	backgroundColors: string[];
}

// Statistics interfaces
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

// Error and validation interfaces
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

// Alignment types
export type AlignmentType =
	| "left"
	| "right"
	| "top"
	| "bottom"
	| "centerX"
	| "centerY";

// Label generation types
export type LabelType = "type" | "index" | "coordinates" | "color";

export interface CanvasContextMenuProps {
	drawingEngine: DrawingEngineInterface | null;
}

export interface ControlsProps {
	drawingEngine: DrawingEngineInterface | null;
	onSave?: (elements: DrawingElement[]) => Promise<void>;
}

export interface PanelProps {
	drawingEngine: DrawingEngineInterface | null;
}

export interface LabelFormProps {
	drawingEngine: DrawingEngineInterface | null;
}

export interface LayerFormProps {
	isOpen: boolean;
	onClose: () => void;
	onCreateLayer: (layerData: {
		name: string;
		description: string;
		opacity: number;
		color: string;
		metadata?: { description?: string };
	}) => void;
}
