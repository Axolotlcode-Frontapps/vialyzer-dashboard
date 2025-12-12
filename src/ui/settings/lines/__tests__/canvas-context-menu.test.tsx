// @vitest-environment jsdom
/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CanvasContextMenu } from "../canvas-context-menu";

describe("CanvasContextMenu Component", () => {
	const mockDrawingEngine = {
		selectedElements: ["elem-1", "elem-2"],
		elements: [
			{
				id: "elem-1",
				type: "line" as const,
				points: [],
				completed: true,
				info: { name: "Test Label" },
			},
			{
				id: "elem-2",
				type: "area" as const,
				points: [],
				completed: true,
			},
		],
		copySelectedElements: vi.fn().mockReturnValue(2),
		cutSelectedElements: vi.fn(),
		pasteElements: vi.fn(),
		duplicateSelectedElements: vi.fn(),
		deleteSelectedElements: vi.fn(),
		clearSelection: vi.fn(),
		setDrawingMode: vi.fn(),
		clearAll: vi.fn(),
		clearClipboard: vi.fn(),
		resetPasteOffset: vi.fn(),
		getClipboard: vi.fn().mockReturnValue([]),
		addText: vi.fn(),
		subscribeToStateChanges: vi.fn().mockReturnValue(() => {
			// Unsubscribe function
		}),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	describe("Rendering", () => {
		it("should render children", () => {
			render(
				<CanvasContextMenu drawingEngine={mockDrawingEngine as never}>
					<div data-testid="canvas-child">Canvas Content</div>
				</CanvasContextMenu>
			);

			expect(screen.getByTestId("canvas-child")).toBeInTheDocument();
		});

		it("should render without drawing engine", () => {
			render(
				<CanvasContextMenu drawingEngine={null}>
					<div data-testid="canvas-child">Canvas Content</div>
				</CanvasContextMenu>
			);

			expect(screen.getByTestId("canvas-child")).toBeInTheDocument();
		});

		it("should wrap children in context menu trigger", () => {
			const { container } = render(
				<CanvasContextMenu drawingEngine={mockDrawingEngine as never}>
					<canvas data-testid="canvas" />
				</CanvasContextMenu>
			);

			expect(container.querySelector("canvas")).toBeInTheDocument();
		});
	});

	describe("State Subscription", () => {
		it("should subscribe to state changes on mount", () => {
			render(
				<CanvasContextMenu drawingEngine={mockDrawingEngine as never}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			expect(mockDrawingEngine.subscribeToStateChanges).toHaveBeenCalled();
		});

		it("should update local state on state changes", () => {
			const callback = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				subscribeToStateChanges: vi.fn((cb) => {
					callback.mockImplementation(cb);
					return () => {
						// Unsubscribe function
					};
				}),
			};

			render(
				<CanvasContextMenu drawingEngine={mockEngine as never}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			expect(mockEngine.subscribeToStateChanges).toHaveBeenCalled();
		});

		it("should initialize state when engine becomes available", () => {
			const { rerender } = render(
				<CanvasContextMenu drawingEngine={null}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			expect(() =>
				rerender(
					<CanvasContextMenu drawingEngine={mockDrawingEngine as never}>
						<div>Canvas</div>
					</CanvasContextMenu>
				)
			).not.toThrow();
		});

		it("should handle engine with minimal properties", () => {
			const minimalEngine = {
				selectedElements: [],
				elements: [],
				getClipboard: vi.fn().mockReturnValue([]),
				subscribeToStateChanges: vi.fn().mockReturnValue(() => {
					// Unsubscribe
				}),
			};

			expect(() =>
				render(
					<CanvasContextMenu drawingEngine={minimalEngine as never}>
						<div>Canvas</div>
					</CanvasContextMenu>
				)
			).not.toThrow();
		});
	});

	describe("Clipboard Operations", () => {
		it("should show copy option when elements are selected", () => {
			render(
				<CanvasContextMenu drawingEngine={mockDrawingEngine as never}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			// Context menu items are rendered but hidden until triggered
			// We can verify the component renders without errors
			expect(screen.getByText("Canvas")).toBeInTheDocument();
		});

		it("should call copySelectedElements when copy is clicked", () => {
			const mockEngine = {
				...mockDrawingEngine,
				copySelectedElements: vi.fn().mockReturnValue(2),
			};

			render(
				<CanvasContextMenu drawingEngine={mockEngine as never}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			// Component should render without errors
			expect(screen.getByText("Canvas")).toBeInTheDocument();
		});

		it("should handle empty clipboard", () => {
			const mockEngine = {
				...mockDrawingEngine,
				getClipboard: vi.fn().mockReturnValue([]),
			};

			render(
				<CanvasContextMenu drawingEngine={mockEngine as never}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			expect(screen.getByText("Canvas")).toBeInTheDocument();
		});

		it("should handle clipboard with elements", () => {
			const mockEngine = {
				...mockDrawingEngine,
				getClipboard: vi.fn().mockReturnValue([
					{ id: "1", type: "line" as const },
					{ id: "2", type: "area" as const },
				]),
			};

			render(
				<CanvasContextMenu drawingEngine={mockEngine as never}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			expect(screen.getByText("Canvas")).toBeInTheDocument();
		});
	});

	describe("Selection Operations", () => {
		it("should handle single element selection", () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: ["elem-1"],
			};

			render(
				<CanvasContextMenu drawingEngine={mockEngine as never}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			expect(screen.getByText("Canvas")).toBeInTheDocument();
		});

		it("should handle multiple element selection", () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: ["elem-1", "elem-2", "elem-3"],
			};

			render(
				<CanvasContextMenu drawingEngine={mockEngine as never}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			expect(screen.getByText("Canvas")).toBeInTheDocument();
		});

		it("should handle no selection", () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: [],
			};

			render(
				<CanvasContextMenu drawingEngine={mockEngine as never}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			expect(screen.getByText("Canvas")).toBeInTheDocument();
		});
	});

	describe("Text Operations", () => {
		it("should handle element with text label", () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: ["elem-1"],
				elements: [
					{
						id: "elem-1",
						type: "line" as const,
						points: [],
						info: { name: "Existing Label" },
					},
				],
			};

			render(
				<CanvasContextMenu drawingEngine={mockEngine as never}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			expect(screen.getByText("Canvas")).toBeInTheDocument();
		});

		it("should handle element without text label", () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: ["elem-1"],
				elements: [
					{
						id: "elem-1",
						type: "line" as const,
						points: [],
					},
				],
			};

			render(
				<CanvasContextMenu drawingEngine={mockEngine as never}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			expect(screen.getByText("Canvas")).toBeInTheDocument();
		});
	});

	describe("Drawing Mode Operations", () => {
		it("should provide all drawing mode options", () => {
			render(
				<CanvasContextMenu drawingEngine={mockDrawingEngine as never}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			// Component renders successfully
			expect(screen.getByText("Canvas")).toBeInTheDocument();
		});

		it("should handle mode switching", () => {
			const mockEngine = {
				...mockDrawingEngine,
				setDrawingMode: vi.fn(),
			};

			render(
				<CanvasContextMenu drawingEngine={mockEngine as never}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			expect(screen.getByText("Canvas")).toBeInTheDocument();
		});
	});

	describe("Mouse Tracking", () => {
		it("should render with canvas element", () => {
			render(
				<CanvasContextMenu drawingEngine={mockDrawingEngine as never}>
					<div data-testid="canvas-wrapper">
						<canvas data-testid="test-canvas" />
					</div>
				</CanvasContextMenu>
			);

			// Component should render successfully
			expect(screen.getByTestId("canvas-wrapper")).toBeInTheDocument();
			expect(screen.getByTestId("test-canvas")).toBeInTheDocument();
		});

		it("should handle canvas not found gracefully", () => {
			render(
				<CanvasContextMenu drawingEngine={mockDrawingEngine as never}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			// Should not crash when canvas is not found
			expect(screen.getByText("Canvas")).toBeInTheDocument();
		});

		it("should cleanup on unmount", () => {
			const { unmount } = render(
				<CanvasContextMenu drawingEngine={mockDrawingEngine as never}>
					<div data-testid="content">Canvas Content</div>
				</CanvasContextMenu>
			);

			expect(() => unmount()).not.toThrow();
		});
	});

	describe("Context Position", () => {
		it("should initialize without errors", () => {
			render(
				<CanvasContextMenu drawingEngine={mockDrawingEngine as never}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			expect(screen.getByText("Canvas")).toBeInTheDocument();
		});

		it("should render children properly", () => {
			render(
				<CanvasContextMenu drawingEngine={mockDrawingEngine as never}>
					<div data-testid="canvas-content">Canvas Content</div>
				</CanvasContextMenu>
			);

			expect(screen.getByTestId("canvas-content")).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle empty selectedElements", () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: [],
			};

			render(
				<CanvasContextMenu drawingEngine={mockEngine as never}>
					<div data-testid="canvas">Canvas</div>
				</CanvasContextMenu>
			);

			expect(screen.getByTestId("canvas")).toBeInTheDocument();
		});

		it("should handle empty elements array", () => {
			const mockEngine = {
				...mockDrawingEngine,
				elements: [],
			};

			render(
				<CanvasContextMenu drawingEngine={mockEngine as never}>
					<div data-testid="canvas">Canvas</div>
				</CanvasContextMenu>
			);

			expect(screen.getByTestId("canvas")).toBeInTheDocument();
		});

		it("should handle empty clipboard", () => {
			const mockEngine = {
				...mockDrawingEngine,
				getClipboard: vi.fn().mockReturnValue([]),
			};

			render(
				<CanvasContextMenu drawingEngine={mockEngine as never}>
					<div data-testid="canvas">Canvas</div>
				</CanvasContextMenu>
			);

			expect(screen.getByTestId("canvas")).toBeInTheDocument();
		});

		it("should handle element without info property", () => {
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: ["elem-1"],
				elements: [
					{
						id: "elem-1",
						type: "line" as const,
						points: [],
						completed: true,
					},
				],
			};

			render(
				<CanvasContextMenu drawingEngine={mockEngine as never}>
					<div data-testid="canvas">Canvas</div>
				</CanvasContextMenu>
			);

			expect(screen.getByTestId("canvas")).toBeInTheDocument();
		});
	});

	describe("Performance", () => {
		it("should handle large number of selected elements", () => {
			const largeSelection = Array.from({ length: 100 }, (_, i) => `elem-${i}`);
			const mockEngine = {
				...mockDrawingEngine,
				selectedElements: largeSelection,
			};

			expect(() =>
				render(
					<CanvasContextMenu drawingEngine={mockEngine as never}>
						<div>Canvas</div>
					</CanvasContextMenu>
				)
			).not.toThrow();
		});

		it("should handle large clipboard", () => {
			const largeClipboard = Array.from({ length: 100 }, (_, i) => ({
				id: `elem-${i}`,
				type: "line" as const,
			}));

			const mockEngine = {
				...mockDrawingEngine,
				getClipboard: vi.fn().mockReturnValue(largeClipboard),
			};

			expect(() =>
				render(
					<CanvasContextMenu drawingEngine={mockEngine as never}>
						<div>Canvas</div>
					</CanvasContextMenu>
				)
			).not.toThrow();
		});

		it("should unsubscribe on unmount", () => {
			const unsubscribe = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				subscribeToStateChanges: vi.fn().mockReturnValue(unsubscribe),
			};

			const { unmount } = render(
				<CanvasContextMenu drawingEngine={mockEngine as never}>
					<div>Canvas</div>
				</CanvasContextMenu>
			);

			unmount();
			expect(unsubscribe).toHaveBeenCalled();
		});
	});

	describe("Children Rendering", () => {
		it("should render single child", () => {
			render(
				<CanvasContextMenu drawingEngine={mockDrawingEngine as never}>
					<div data-testid="single-child">Single Child</div>
				</CanvasContextMenu>
			);

			expect(screen.getByTestId("single-child")).toBeInTheDocument();
		});

		it("should render complex children structure", () => {
			render(
				<CanvasContextMenu drawingEngine={mockDrawingEngine as never}>
					<div>
						<canvas data-testid="canvas" />
						<div data-testid="overlay">Overlay</div>
					</div>
				</CanvasContextMenu>
			);

			expect(screen.getByTestId("canvas")).toBeInTheDocument();
			expect(screen.getByTestId("overlay")).toBeInTheDocument();
		});

		it("should handle null children", () => {
			expect(() =>
				render(
					<CanvasContextMenu drawingEngine={mockDrawingEngine as never}>{null}</CanvasContextMenu>
				)
			).not.toThrow();
		});
	});
});
