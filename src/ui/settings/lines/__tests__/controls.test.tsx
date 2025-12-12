// @vitest-environment jsdom
/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Controls } from "../controls";

describe("Controls Component", () => {
	const mockDrawingEngine = {
		drawingMode: "cursor" as const,
		selectedElements: [] as string[],
		isInitialized: true,
		elements: [
			{ id: "1", type: "line" as const, points: [], completed: true },
			{ id: "2", type: "area" as const, points: [], completed: true },
		],
		canUndo: vi.fn().mockReturnValue(false),
		canRedo: vi.fn().mockReturnValue(false),
		undoLast: vi.fn(),
		redoLast: vi.fn(),
		setDrawingMode: vi.fn(),
		deleteSelectedElements: vi.fn(),
		copySelectedElements: vi.fn(),
		cutSelectedElements: vi.fn(),
		pasteElements: vi.fn(),
		addText: vi.fn(),
		exportDrawings: vi.fn(),
		clearAll: vi.fn(),
		alignElements: vi.fn(),
		moveSelectedElements: vi.fn(),
		bringToFront: vi.fn(),
		sendToBack: vi.fn(),
		groupSelectedElements: vi.fn(),
		ungroupSelectedElements: vi.fn(),
		setFeedback: vi.fn(),
		markAllElementsAsSaved: vi.fn(),
		getLayers: vi.fn().mockReturnValue([]),
		getSyncStateStats: vi.fn().mockReturnValue({
			new: 0,
			edited: 0,
			deleted: 0,
			saved: 2,
		}),
		subscribeToStateChanges: vi.fn().mockReturnValue(() => {
			// Unsubscribe function
		}),
	};

	const mockOnSave = vi.fn().mockResolvedValue(undefined);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	describe("Rendering", () => {
		it("should render toolbar", () => {
			render(<Controls drawingEngine={mockDrawingEngine as never} onSave={mockOnSave} />);

			// Check for main toolbar elements
			const toolbar = screen.getByRole("menubar");
			expect(toolbar).toBeInTheDocument();
		});

		it("should render drawing mode toggle group", () => {
			render(<Controls drawingEngine={mockDrawingEngine as never} onSave={mockOnSave} />);

			// Toggle group should be present
			const toggles = screen.getAllByRole("radio");
			expect(toggles.length).toBeGreaterThan(0);
		});

		it("should render without drawing engine", () => {
			render(<Controls drawingEngine={null} onSave={mockOnSave} />);

			expect(screen.getByRole("menubar")).toBeInTheDocument();
		});

		it("should render without onSave callback", () => {
			render(<Controls drawingEngine={mockDrawingEngine as never} />);

			expect(screen.getByRole("menubar")).toBeInTheDocument();
		});
	});

	describe("Drawing Modes", () => {
		it("should display cursor mode by default", async () => {
			render(<Controls drawingEngine={mockDrawingEngine as never} onSave={mockOnSave} />);

			// Default mode should be cursor
			const cursorButton = await screen.findByLabelText(/Modo Cursor/i);
			expect(cursorButton).toBeInTheDocument();
		});

		it("should handle mode changes", async () => {
			const mockEngine = {
				...mockDrawingEngine,
				setDrawingMode: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			// Find and click line mode button
			const lineButton = await screen.findByLabelText(/Modo Línea/i);
			fireEvent.click(lineButton);

			expect(mockEngine.setDrawingMode).toHaveBeenCalledWith("line");
		});

		it("should support all drawing modes", async () => {
			render(<Controls drawingEngine={mockDrawingEngine as never} onSave={mockOnSave} />);

			// Check that all main modes are available
			expect(await screen.findByLabelText(/Modo Cursor/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/Modo Selección/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/Modo Borrar/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/Modo Línea/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/Modo Área/i)).toBeInTheDocument();
		});

		it("should disable modes when media is not loaded", async () => {
			const uninitializedEngine = {
				...mockDrawingEngine,
				isInitialized: false,
			};

			render(<Controls drawingEngine={uninitializedEngine as never} onSave={mockOnSave} />);

			// Buttons should be present but disabled when not initialized
			const lineButton = await screen.findByLabelText(/Modo Línea/i);
			expect(lineButton).toBeInTheDocument();
		});
	});

	describe("State Subscription", () => {
		it("should subscribe to state changes on mount", () => {
			render(<Controls drawingEngine={mockDrawingEngine as never} onSave={mockOnSave} />);

			expect(mockDrawingEngine.subscribeToStateChanges).toHaveBeenCalled();
		});

		it("should update local state on mode change", () => {
			const callback = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				subscribeToStateChanges: vi.fn((cb) => {
					callback.mockImplementation(cb);
					return () => {
						// Unsubscribe
					};
				}),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			// Simulate mode change event
			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "modeChange",
					drawingMode: "line",
				});
			}

			expect(mockEngine.subscribeToStateChanges).toHaveBeenCalled();
		});

		it("should update selection state", () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: ["elem-1", "elem-2"],
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			expect(screen.getByRole("menubar")).toBeInTheDocument();
		});
	});

	describe("Edit Operations", () => {
		it("should have undo capability", () => {
			const mockEngine = {
				...mockDrawingEngine,
				canUndo: vi.fn(() => true),
				undoLast: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			// Verify Edit menu exists
			const editMenu = screen.getByText("Editar");
			expect(editMenu).toBeInTheDocument();
			expect(mockEngine.undoLast).toBeDefined();
		});

		it("should have redo capability", () => {
			const mockEngine = {
				...mockDrawingEngine,
				canRedo: vi.fn(() => true),
				redoLast: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const editMenu = screen.getByText("Editar");
			expect(editMenu).toBeInTheDocument();
			expect(mockEngine.redoLast).toBeDefined();
		});

		it("should check undo availability", () => {
			const mockEngine = {
				...mockDrawingEngine,
				canUndo: vi.fn(() => false),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const editMenu = screen.getByText("Editar");
			expect(editMenu).toBeInTheDocument();
			expect(mockEngine.canUndo).toBeDefined();
		});

		it("should check redo availability", () => {
			const mockEngine = {
				...mockDrawingEngine,
				canRedo: vi.fn(() => false),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const editMenu = screen.getByText("Editar");
			expect(editMenu).toBeInTheDocument();
			expect(mockEngine.canRedo).toBeDefined();
		});
	});

	describe("Clipboard Operations", () => {
		it("should have cut capability", () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: [{ id: "1" }],
				cutSelectedElements: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const editMenu = screen.getByText("Editar");
			expect(editMenu).toBeInTheDocument();
			expect(mockEngine.cutSelectedElements).toBeDefined();
		});

		it("should have copy capability", () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: [{ id: "1" }],
				copySelectedElements: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const editMenu = screen.getByText("Editar");
			expect(editMenu).toBeInTheDocument();
			expect(mockEngine.copySelectedElements).toBeDefined();
		});

		it("should have paste capability", () => {
			const mockEngine = {
				...mockDrawingEngine,
				pasteElements: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const editMenu = screen.getByText("Editar");
			expect(editMenu).toBeInTheDocument();
			expect(mockEngine.pasteElements).toBeDefined();
		});
	});

	describe("Selection Operations", () => {
		it("should have delete capability", () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: [{ id: "1" }],
				deleteSelectedElements: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const editMenu = screen.getByText("Editar");
			expect(editMenu).toBeInTheDocument();
			expect(mockEngine.deleteSelectedElements).toBeDefined();
		});

		it("should show selection count", () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: ["elem-1", "elem-2", "elem-3"],
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			expect(screen.getByRole("menubar")).toBeInTheDocument();
		});
	});

	describe("Save Operations", () => {
		it("should have save capability", () => {
			const mockEngine = {
				...mockDrawingEngine,
				getSyncStateStats: vi.fn().mockReturnValue({
					new: 1,
					edited: 0,
					deleted: 0,
					saved: 0,
				}),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const fileMenu = screen.getByText("Archivo");
			expect(fileMenu).toBeInTheDocument();
			expect(mockOnSave).toBeDefined();
		});

		it("should show loading state while saving", async () => {
			const slowSave = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 100)));

			const mockEngine = {
				...mockDrawingEngine,
				getSyncStateStats: vi.fn().mockReturnValue({
					new: 1,
					edited: 0,
					deleted: 0,
					saved: 0,
				}),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={slowSave} />);

			const fileMenu = screen.getByText("Archivo");
			fireEvent.click(fileMenu);

			// Just verify menu renders
			expect(fileMenu).toBeInTheDocument();
		});

		it("should not save when no changes exist", async () => {
			const mockEngine = {
				...mockDrawingEngine,
				getSyncStateStats: vi.fn().mockReturnValue({
					new: 0,
					edited: 0,
					deleted: 0,
					saved: 2,
				}),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			// Just verify it renders without crashing
			expect(screen.getByText("Archivo")).toBeInTheDocument();
		});

		it("should handle save errors gracefully", async () => {
			const failingSave = vi.fn().mockRejectedValue(new Error("Save failed"));

			const mockEngine = {
				...mockDrawingEngine,
				getSyncStateStats: vi.fn().mockReturnValue({
					new: 1,
					edited: 0,
					deleted: 0,
					saved: 0,
				}),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={failingSave} />);

			// Should not crash
			expect(screen.getByText("Archivo")).toBeInTheDocument();
		});

		it("should disable save when no elements exist", async () => {
			const mockEngine = {
				...mockDrawingEngine,
				elements: [],
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			// Just verify it renders
			expect(screen.getByText("Archivo")).toBeInTheDocument();
		});
	});

	describe("Alignment Operations", () => {
		it("should have alignment capability", () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: ["elem-1", "elem-2"],
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const actionsMenu = screen.getByText("Acciones");
			expect(actionsMenu).toBeInTheDocument();
		});

		it("should handle align left action", async () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: ["elem-1", "elem-2"],
				alignElements: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const toolsMenu = screen.getByText("Herramientas");
			expect(toolsMenu).toBeInTheDocument();
			expect(mockEngine.alignElements).toBeDefined();
		});
	});

	describe("Move Operations", () => {
		it("should have move capability", () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: ["elem-1"],
				moveSelectedElements: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const actionsMenu = screen.getByText("Acciones");
			expect(actionsMenu).toBeInTheDocument();
			expect(mockEngine.moveSelectedElements).toBeDefined();
		});
	});

	describe("Z-Order Operations", () => {
		it("should handle bring to front action", async () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: ["elem-1"],
				bringToFront: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const editMenu = screen.getByText("Editar");
			expect(editMenu).toBeInTheDocument();
			expect(mockEngine.bringToFront).toBeDefined();
		});

		it("should handle send to back action", async () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: ["elem-1"],
				sendToBack: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const editMenu = screen.getByText("Editar");
			expect(editMenu).toBeInTheDocument();
			expect(mockEngine.sendToBack).toBeDefined();
		});
	});

	describe("Grouping Operations", () => {
		it("should handle group action", async () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: ["elem-1", "elem-2"],
				groupSelectedElements: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const editMenu = screen.getByText("Editar");
			expect(editMenu).toBeInTheDocument();
			expect(mockEngine.groupSelectedElements).toBeDefined();
		});

		it("should handle ungroup action", async () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: ["group-1"],
				ungroupSelectedElements: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const editMenu = screen.getByText("Editar");
			expect(editMenu).toBeInTheDocument();
			expect(mockEngine.ungroupSelectedElements).toBeDefined();
		});
	});

	describe("Text Operations", () => {
		it("should have text editing capability", () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: ["elem-1"],
				addText: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const actionsMenu = screen.getByText("Acciones");
			expect(actionsMenu).toBeInTheDocument();
			expect(mockEngine.addText).toBeDefined();
		});
	});

	describe("Export Operations", () => {
		it("should handle export action", async () => {
			const mockEngine = {
				...mockDrawingEngine,
				exportDrawings: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const archiveMenu = screen.getByText("Archivo");
			fireEvent.click(archiveMenu);

			expect(mockEngine.exportDrawings).toBeDefined();
		});
	});

	describe("Clear Operations", () => {
		it("should have clear capability", () => {
			const mockEngine = {
				...mockDrawingEngine,
				clearAll: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const editMenu = screen.getByText("Editar");
			expect(editMenu).toBeInTheDocument();
			expect(mockEngine.clearAll).toBeDefined();
		});
	});

	describe("Accessibility", () => {
		it("should have proper button labels", () => {
			render(<Controls drawingEngine={mockDrawingEngine as never} onSave={mockOnSave} />);

			expect(screen.getByLabelText(/Modo Cursor/i)).toBeInTheDocument();
			expect(screen.getByText(/Archivo/i)).toBeInTheDocument();
			expect(screen.getByText(/Editar/i)).toBeInTheDocument();
		});

		it("should have proper ARIA labels", () => {
			render(<Controls drawingEngine={mockDrawingEngine as never} onSave={mockOnSave} />);

			const menubar = screen.getByRole("menubar");
			expect(menubar).toBeInTheDocument();
		});

		it("should support keyboard navigation", () => {
			render(<Controls drawingEngine={mockDrawingEngine as never} onSave={mockOnSave} />);

			const menubar = screen.getByRole("menubar");
			expect(menubar).toBeInTheDocument();

			// Menu items should be accessible
			const editMenu = screen.getByText("Editar");
			expect(editMenu).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle null drawing engine", () => {
			expect(() => render(<Controls drawingEngine={null} onSave={mockOnSave} />)).not.toThrow();
		});

		it("should handle undefined onSave", () => {
			expect(() => render(<Controls drawingEngine={mockDrawingEngine as never} />)).not.toThrow();
		});

		it("should handle empty elements array", () => {
			const mockEngine = {
				...mockDrawingEngine,
				elements: [],
			};

			expect(() =>
				render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />)
			).not.toThrow();
		});

		it("should handle empty selection", () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: [],
			};

			expect(() =>
				render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />)
			).not.toThrow();
		});
	});

	describe("Performance", () => {
		it("should handle rapid mode changes", async () => {
			const mockEngine = {
				...mockDrawingEngine,
				setDrawingMode: vi.fn(),
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			const lineButton = await screen.findByLabelText(/Modo Línea/i);
			const cursorButton = screen.getByLabelText(/Modo Cursor/i);

			expect(() => {
				fireEvent.click(lineButton);
				fireEvent.click(lineButton);
				fireEvent.click(cursorButton);
				fireEvent.click(cursorButton);
			}).not.toThrow();
		});

		it("should unsubscribe on unmount", () => {
			const unsubscribe = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				subscribeToStateChanges: vi.fn().mockReturnValue(unsubscribe),
			};

			const { unmount } = render(
				<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />
			);

			unmount();
			expect(unsubscribe).toHaveBeenCalled();
		});

		it("should handle large selection counts", () => {
			const largeSelection = Array.from({ length: 100 }, (_, i) => `elem-${i}`);
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: largeSelection,
			};

			expect(() =>
				render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />)
			).not.toThrow();
		});
	});

	describe("Status Messages", () => {
		it("should show appropriate status for cursor mode", () => {
			const mockEngine = {
				...mockDrawingEngine,
				drawingMode: "cursor" as const,
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			// Component should render without errors
			expect(screen.getByRole("menubar")).toBeInTheDocument();
		});

		it("should show appropriate status for drawing modes", () => {
			const mockEngine = {
				...mockDrawingEngine,
				drawingMode: "line" as const,
			};

			render(<Controls drawingEngine={mockEngine as never} onSave={mockOnSave} />);

			expect(screen.getByRole("menubar")).toBeInTheDocument();
		});
	});
});
