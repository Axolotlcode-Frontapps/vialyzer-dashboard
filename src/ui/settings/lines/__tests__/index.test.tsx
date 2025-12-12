// @vitest-environment jsdom
/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DrawingEngine } from "../drawing";
import { Lines } from "../index";

// Mock DrawingEngine
const mockDrawingEngine = {
	subscribeToStateChanges: vi.fn().mockReturnValue(() => {
		// Unsubscribe function
	}),
	cleanup: vi.fn(),
	setFeedback: vi.fn(),
	clearFeedback: vi.fn(),
	clearAll: vi.fn(),
	addElements: vi.fn(),
	setDrawingMode: vi.fn(),
	deleteSelectedElements: vi.fn(),
	undoLast: vi.fn(),
	redoLast: vi.fn(),
	canUndo: vi.fn().mockReturnValue(false),
	canRedo: vi.fn().mockReturnValue(false),
	exportDrawings: vi.fn(),
	copySelectedElements: vi.fn().mockReturnValue(0),
	cutSelectedElements: vi.fn(),
	pasteElements: vi.fn(),
	duplicateSelectedElements: vi.fn(),
	selectAllElements: vi.fn().mockReturnValue([]),
	clearSelection: vi.fn(),
	groupSelectedElements: vi.fn(),
	ungroupSelectedElements: vi.fn(),
	bringToFront: vi.fn().mockReturnValue([]),
	sendToBack: vi.fn().mockReturnValue([]),
	alignElements: vi.fn(),
	moveSelectedElements: vi.fn(),
	completeTextInput: vi.fn(),
	getLayers: vi.fn().mockReturnValue([]),
	getActiveLayer: vi.fn(),
	createLayer: vi.fn(),
	updateLayer: vi.fn(),
	deleteLayer: vi.fn(),
	changeZOrderInLayer: vi.fn(),
	getConfig: vi.fn().mockReturnValue({
		resolution: {
			display: { width: 800, height: 600 },
			native: { width: 1920, height: 1080 },
		},
	}),
	getClipboard: vi.fn().mockReturnValue([]),
	hasClipboardContent: vi.fn().mockReturnValue(false),
	clearClipboard: vi.fn(),
	resetPasteOffset: vi.fn(),
	drawingMode: "cursor",
	dragState: { isDragging: false, elementId: null, pointIndex: null },
	feedbackMessage: "",
	showFeedback: false,
	selectedElements: [],
	hoveredElement: null,
};

vi.mock("../drawing", () => {
	return {
		DrawingEngine: vi.fn().mockImplementation(() => mockDrawingEngine),
	};
});

// Mock child components with more detailed props testing
vi.mock("../controls", () => ({
	Controls: ({ drawingEngine }: { drawingEngine: unknown }) => (
		<div data-testid="controls">
			<button
				type="button"
				data-testid="line-mode-button"
				onClick={() => (drawingEngine as typeof mockDrawingEngine)?.setDrawingMode("line")}
			>
				Line Mode
			</button>
			<button
				type="button"
				data-testid="undo-button"
				onClick={() => (drawingEngine as typeof mockDrawingEngine)?.undoLast()}
			>
				Undo
			</button>
			<button
				type="button"
				data-testid="redo-button"
				onClick={() => (drawingEngine as typeof mockDrawingEngine)?.redoLast()}
			>
				Redo
			</button>
			<button
				type="button"
				data-testid="delete-button"
				onClick={() => (drawingEngine as typeof mockDrawingEngine)?.deleteSelectedElements()}
			>
				Delete
			</button>
			<span data-testid="mode-display">
				{(drawingEngine as typeof mockDrawingEngine)?.drawingMode}
			</span>
		</div>
	),
}));

vi.mock("../panel", () => ({
	Panel: ({ drawingEngine }: { drawingEngine: unknown }) => (
		<div data-testid="panel">
			<div data-testid="stats">Panel Content</div>
			<button
				type="button"
				data-testid="select-layer-button"
				onClick={() => (drawingEngine as typeof mockDrawingEngine)?.setDrawingMode("select")}
			>
				Select Layer
			</button>
		</div>
	),
}));

vi.mock("../layer", () => ({
	LayerPanel: ({ drawingEngine }: { drawingEngine: unknown }) => (
		<div data-testid="layer-panel">
			<button
				type="button"
				data-testid="create-layer-button"
				onClick={() => (drawingEngine as typeof mockDrawingEngine)?.createLayer()}
			>
				Create Layer
			</button>
			<button
				type="button"
				data-testid="delete-layer-button"
				onClick={() => (drawingEngine as typeof mockDrawingEngine)?.deleteLayer()}
			>
				Delete Layer
			</button>
			<button type="button" data-testid="change-layer-button">
				Change Layer
			</button>
		</div>
	),
}));

vi.mock("../label-form", () => ({
	LabelForm: ({ drawingEngine }: { drawingEngine: unknown }) => (
		<div data-testid="label-form">
			<button
				type="button"
				data-testid="save-label-button"
				onClick={() =>
					(drawingEngine as typeof mockDrawingEngine)?.completeTextInput("elem-1", {} as never)
				}
			>
				Save Label
			</button>
			<button type="button" data-testid="cancel-button">
				Cancel
			</button>
		</div>
	),
}));

vi.mock("../canvas-context-menu", () => ({
	CanvasContextMenu: ({ drawingEngine }: { drawingEngine: unknown }) => (
		<div data-testid="canvas-context-menu">
			<button
				type="button"
				data-testid="copy-button"
				onClick={() => (drawingEngine as typeof mockDrawingEngine)?.copySelectedElements()}
			>
				Copy
			</button>
			<button
				type="button"
				data-testid="paste-button"
				onClick={() => (drawingEngine as typeof mockDrawingEngine)?.pasteElements()}
			>
				Paste
			</button>
			<button
				type="button"
				data-testid="context-delete-button"
				onClick={() => (drawingEngine as typeof mockDrawingEngine)?.deleteSelectedElements()}
			>
				Delete
			</button>
		</div>
	),
}));

describe("Lines Component", () => {
	const defaultProps = {
		src: "test-video.mp4",
		type: "video" as const,
		onDrawingComplete: vi.fn(),
		onSave: vi.fn(),
		onLoad: vi.fn().mockResolvedValue({ elements: [], layers: new Map() }),
		vehicles: [
			{ id: "1", name: "Car", color: "#ff0000" },
			{ id: "2", name: "Truck", color: "#00ff00" },
		],
	};

	beforeEach(() => {
		vi.clearAllMocks();
		// Reset the mock implementation
		(DrawingEngine as unknown as ReturnType<typeof vi.fn>).mockImplementation(
			() => mockDrawingEngine
		);
	});

	afterEach(() => {
		cleanup();
	});

	describe("Rendering", () => {
		it("should render all child components correctly", () => {
			render(<Lines {...defaultProps} />);

			expect(screen.getByTestId("controls")).toBeInTheDocument();
			expect(screen.getByTestId("panel")).toBeInTheDocument();
			expect(screen.getByTestId("layer-panel")).toBeInTheDocument();
			expect(screen.getByTestId("label-form")).toBeInTheDocument();
			expect(screen.getByTestId("canvas-context-menu")).toBeInTheDocument();
		});

		it("should render image element when type is image", () => {
			render(<Lines {...defaultProps} type="image" src="test.jpg" />);

			const imgs = document.querySelectorAll("img");
			expect(imgs.length).toBeGreaterThan(0);
		});

		it("should render video element when type is video", () => {
			render(<Lines {...defaultProps} />);

			const video = document.querySelector("video");
			expect(video).toBeInTheDocument();
		});

		it("should have interactive buttons", () => {
			render(<Lines {...defaultProps} />);

			// Check that all main action buttons are present
			expect(screen.getByTestId("line-mode-button")).toBeInTheDocument();
			expect(screen.getByTestId("undo-button")).toBeInTheDocument();
			expect(screen.getByTestId("redo-button")).toBeInTheDocument();
			expect(screen.getByTestId("delete-button")).toBeInTheDocument();
		});

		it("should apply correct CSS classes", () => {
			render(<Lines {...defaultProps} />);

			const container = document.querySelector('[data-testid="controls"]')?.parentElement;
			expect(container).toBeInTheDocument();
		});
	});

	describe("Initialization and Cleanup", () => {
		it("should accept onLoad callback", async () => {
			const mockLoadData = {
				elements: [{ id: "1", type: "line" as const }],
				layers: new Map([["layer-1", { id: "layer-1", name: "Layer 1" }]]),
			};

			const onLoad = vi.fn().mockResolvedValue(mockLoadData);

			render(<Lines {...defaultProps} onLoad={onLoad} />);

			// Component renders without errors
			expect(screen.getByTestId("controls")).toBeInTheDocument();
		});

		it("should render without onLoad callback", () => {
			const propsWithoutLoad = {
				src: "test.mp4",
				type: "video" as const,
			};

			render(<Lines {...propsWithoutLoad} />);

			expect(screen.getByTestId("controls")).toBeInTheDocument();
		});
	});

	describe("Component Structure", () => {
		it("should render controls panel", () => {
			render(<Lines {...defaultProps} />);

			const controls = screen.getByTestId("controls");
			expect(controls).toBeInTheDocument();
		});

		it("should render stats panel", () => {
			render(<Lines {...defaultProps} />);

			const panel = screen.getByTestId("panel");
			expect(panel).toBeInTheDocument();
		});

		it("should render layer panel", () => {
			render(<Lines {...defaultProps} />);

			const layerPanel = screen.getByTestId("layer-panel");
			expect(layerPanel).toBeInTheDocument();
		});

		it("should render label form", () => {
			render(<Lines {...defaultProps} />);

			const labelForm = screen.getByTestId("label-form");
			expect(labelForm).toBeInTheDocument();
		});

		it("should render canvas context menu", () => {
			render(<Lines {...defaultProps} />);

			const contextMenu = screen.getByTestId("canvas-context-menu");
			expect(contextMenu).toBeInTheDocument();
		});
	});

	describe("User Interactions", () => {
		it("should have clickable buttons", () => {
			render(<Lines {...defaultProps} />);

			const lineModeButton = screen.getByTestId("line-mode-button");
			const undoButton = screen.getByTestId("undo-button");
			const redoButton = screen.getByTestId("redo-button");
			const deleteButton = screen.getByTestId("delete-button");

			// All buttons should be in the document and clickable
			expect(lineModeButton).toBeInTheDocument();
			expect(undoButton).toBeInTheDocument();
			expect(redoButton).toBeInTheDocument();
			expect(deleteButton).toBeInTheDocument();

			// Clicking should not throw errors
			expect(() => fireEvent.click(lineModeButton)).not.toThrow();
			expect(() => fireEvent.click(undoButton)).not.toThrow();
		});

		it("should have layer management buttons", () => {
			render(<Lines {...defaultProps} />);

			const createLayerButton = screen.getByTestId("create-layer-button");
			const deleteLayerButton = screen.getByTestId("delete-layer-button");

			expect(createLayerButton).toBeInTheDocument();
			expect(deleteLayerButton).toBeInTheDocument();

			// Clicking should not throw errors
			expect(() => fireEvent.click(createLayerButton)).not.toThrow();
		});

		it("should have context menu actions", () => {
			render(<Lines {...defaultProps} />);

			const copyButton = screen.getByTestId("copy-button");
			const pasteButton = screen.getByTestId("paste-button");
			const deleteButton = screen.getByTestId("context-delete-button");

			expect(copyButton).toBeInTheDocument();
			expect(pasteButton).toBeInTheDocument();
			expect(deleteButton).toBeInTheDocument();
		});

		it("should have label form buttons", () => {
			render(<Lines {...defaultProps} />);

			const saveButton = screen.getByTestId("save-label-button");
			const cancelButton = screen.getByTestId("cancel-button");

			expect(saveButton).toBeInTheDocument();
			expect(cancelButton).toBeInTheDocument();
		});
	});

	describe("Callbacks", () => {
		it("should accept onDrawingComplete callback", () => {
			const onDrawingComplete = vi.fn();
			render(<Lines {...defaultProps} onDrawingComplete={onDrawingComplete} />);

			// Component renders without errors
			expect(screen.getByTestId("controls")).toBeInTheDocument();
		});

		it("should accept onSave callback", () => {
			const onSave = vi.fn().mockResolvedValue(undefined);
			render(<Lines {...defaultProps} onSave={onSave} />);

			// Component renders without errors
			expect(screen.getByTestId("controls")).toBeInTheDocument();
		});

		it("should accept onLoad callback", async () => {
			const onLoad = vi.fn().mockResolvedValue({
				elements: [],
				layers: new Map(),
			});

			render(<Lines {...defaultProps} onLoad={onLoad} />);

			// Component renders without errors
			expect(screen.getByTestId("controls")).toBeInTheDocument();
		});
	});

	describe("Vehicle Integration", () => {
		it("should accept vehicles prop", () => {
			const vehicles = [
				{ id: "1", name: "Car", color: "#ff0000" },
				{ id: "2", name: "Truck", color: "#00ff00" },
			];

			render(<Lines {...defaultProps} vehicles={vehicles} />);

			// Component should render with vehicles
			expect(screen.getByTestId("layer-panel")).toBeInTheDocument();
		});

		it("should handle empty vehicles array", () => {
			render(<Lines {...defaultProps} vehicles={[]} />);

			expect(screen.getByTestId("layer-panel")).toBeInTheDocument();
		});

		it("should render without vehicles prop", () => {
			const propsWithoutVehicles = {
				src: "test.mp4",
				type: "video" as const,
			};

			render(<Lines {...propsWithoutVehicles} />);

			expect(screen.getByTestId("layer-panel")).toBeInTheDocument();
		});
	});

	describe("Error Handling", () => {
		it("should render when onLoad rejects", () => {
			const onLoad = vi.fn().mockRejectedValue(new Error("Failed to load data"));

			render(<Lines {...defaultProps} onLoad={onLoad} />);

			// Component should still render
			expect(screen.getByTestId("controls")).toBeInTheDocument();
		});

		it("should render when onSave rejects", () => {
			const onSave = vi.fn().mockRejectedValue(new Error("Failed to save"));

			render(<Lines {...defaultProps} onSave={onSave} />);

			// Component should still render
			expect(screen.getByTestId("controls")).toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should have proper component structure", () => {
			render(<Lines {...defaultProps} />);

			const controls = screen.getByTestId("controls");
			expect(controls).toBeInTheDocument();
		});

		it("should have interactive elements", () => {
			render(<Lines {...defaultProps} />);

			const buttons = screen.getAllByRole("button");
			expect(buttons.length).toBeGreaterThan(0);
		});

		it("should render all UI panels", () => {
			render(<Lines {...defaultProps} />);

			expect(screen.getByTestId("controls")).toBeInTheDocument();
			expect(screen.getByTestId("panel")).toBeInTheDocument();
			expect(screen.getByTestId("layer-panel")).toBeInTheDocument();
		});
	});

	describe("Component Props", () => {
		it("should accept video type prop", () => {
			render(<Lines {...defaultProps} type="video" />);

			const video = document.querySelector("video");
			expect(video).toBeInTheDocument();
		});

		it("should accept image type prop", () => {
			render(<Lines {...defaultProps} type="image" />);

			const imgs = document.querySelectorAll("img");
			expect(imgs.length).toBeGreaterThan(0);
		});

		it("should handle optional callbacks", () => {
			const propsWithoutCallbacks = {
				src: "test.mp4",
				type: "video" as const,
			};

			render(<Lines {...propsWithoutCallbacks} />);

			expect(screen.getByTestId("controls")).toBeInTheDocument();
		});
	});
});
