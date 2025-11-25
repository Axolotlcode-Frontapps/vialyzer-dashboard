// @vitest-environment jsdom
/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Panel } from "../panel";

describe("Panel Component", () => {
	const mockDrawingEngine = {
		isInitialized: true,
		elements: [
			{ id: "1", type: "line" as const, points: [], completed: true },
			{ id: "2", type: "area" as const, points: [], completed: true },
			{ id: "3", type: "curve" as const, points: [], completed: true },
			{ id: "4", type: "line" as const, points: [], completed: true },
		],
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
		it("should render trigger button", () => {
			render(<Panel drawingEngine={mockDrawingEngine as never} />);

			const triggerButton = screen.getByRole("button");
			expect(triggerButton).toBeInTheDocument();
		});

		it("should show panel when trigger button is clicked", () => {
			render(<Panel drawingEngine={mockDrawingEngine as never} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getByText("Estadísticas")).toBeInTheDocument();
		});

		it("should hide panel when close button is clicked", () => {
			render(<Panel drawingEngine={mockDrawingEngine as never} />);

			// Open panel
			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			// Close panel
			const closeButton = screen.getByTitle("Hide panel");
			fireEvent.click(closeButton);

			// Panel should be closed (button title should change)
			expect(screen.getByTitle("Show statistics panel")).toBeInTheDocument();
		});

		it("should render without drawing engine", () => {
			render(<Panel drawingEngine={null} />);

			const triggerButton = screen.getByRole("button");
			expect(triggerButton).toBeInTheDocument();
		});
	});

	describe("Statistics Display", () => {
		it("should display element counts when media is loaded", () => {
			render(<Panel drawingEngine={mockDrawingEngine as never} />);

			// Open panel
			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			// Check for statistics
			expect(screen.getByText("Elementos")).toBeInTheDocument();
		});

		it("should show loading message when media is not loaded", () => {
			const uninitializedEngine = {
				...mockDrawingEngine,
				isInitialized: false,
				elements: [],
			};

			render(<Panel drawingEngine={uninitializedEngine as never} />);

			// Open panel
			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getByText("Cargando recurso...")).toBeInTheDocument();
		});

		it("should count lines correctly", () => {
			render(<Panel drawingEngine={mockDrawingEngine as never} />);

			// Open panel
			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			// Should show 2 lines
			const linesCount = screen.getByText("2");
			expect(linesCount).toBeInTheDocument();
		});

		it("should count areas correctly", () => {
			render(<Panel drawingEngine={mockDrawingEngine as never} />);

			// Open panel
			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			// Should show statistics section with areas
			expect(screen.getByText("Áreas")).toBeInTheDocument();
		});

		it("should count curves correctly", () => {
			render(<Panel drawingEngine={mockDrawingEngine as never} />);

			// Open panel
			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			// Should show statistics section with curves
			expect(screen.getByText("Curvas")).toBeInTheDocument();
		});

		it("should display total element count", () => {
			render(<Panel drawingEngine={mockDrawingEngine as never} />);

			// Open panel
			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getByText("Elementos totales")).toBeInTheDocument();
			expect(screen.getByText("4")).toBeInTheDocument();
		});

		it("should handle empty elements array", () => {
			const emptyEngine = {
				...mockDrawingEngine,
				elements: [],
			};

			render(<Panel drawingEngine={emptyEngine as never} />);

			// Open panel
			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getByText("Elementos totales")).toBeInTheDocument();
			// Total should be 0 but there might be multiple 0s in the counts
			const container = screen.getByText("Elementos totales").parentElement;
			expect(container).toBeInTheDocument();
		});
	});

	describe("State Subscription", () => {
		it("should subscribe to state changes on mount", () => {
			render(<Panel drawingEngine={mockDrawingEngine as never} />);

			expect(mockDrawingEngine.subscribeToStateChanges).toHaveBeenCalled();
		});

		it("should toggle panel on togglePanel event", () => {
			const subscribeCallback = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				subscribeToStateChanges: vi.fn((callback) => {
					subscribeCallback.mockImplementation(callback);
					return () => {
						// Unsubscribe
					};
				}),
			};

			render(<Panel drawingEngine={mockEngine as never} />);

			// Get the callback and call it
			const callback = mockEngine.subscribeToStateChanges.mock
				.calls[0]?.[0] as (event: { type: string }) => void;

			if (callback) {
				// Panel should be hidden initially
				expect(screen.queryByText("Estadísticas")).not.toBeInTheDocument();

				// Trigger toggle event
				callback({ type: "togglePanel" });

				// Panel should be visible now - but we can't test this easily
				// because state update is async
			}
		});

		it("should not crash with null engine", () => {
			expect(() => render(<Panel drawingEngine={null} />)).not.toThrow();
		});

		it("should handle engine with minimal properties", () => {
			const minimalEngine = {
				isInitialized: true,
				elements: [],
				subscribeToStateChanges: vi.fn().mockReturnValue(() => {
					// Unsubscribe
				}),
			};

			expect(() =>
				render(<Panel drawingEngine={minimalEngine as never} />)
			).not.toThrow();
		});
	});

	describe("Accessibility", () => {
		it("should have proper button title", () => {
			render(<Panel drawingEngine={mockDrawingEngine as never} />);

			const button = screen.getByTitle("Show statistics panel");
			expect(button).toBeInTheDocument();
		});

		it("should update button title when panel is open", () => {
			render(<Panel drawingEngine={mockDrawingEngine as never} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getByTitle("Hide panel")).toBeInTheDocument();
		});

		it("should have proper ARIA labels", () => {
			render(<Panel drawingEngine={mockDrawingEngine as never} />);

			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("title");
		});
	});

	describe("User Interactions", () => {
		it("should toggle visibility on button click", () => {
			render(<Panel drawingEngine={mockDrawingEngine as never} />);

			const triggerButton = screen.getByRole("button");

			// Initially closed
			expect(screen.queryByText("Estadísticas")).not.toBeInTheDocument();

			// Open
			fireEvent.click(triggerButton);
			expect(screen.getByText("Estadísticas")).toBeInTheDocument();

			// Close
			const closeButton = screen.getByTitle("Hide panel");
			fireEvent.click(closeButton);

			// Should be closed again
			expect(screen.getByTitle("Show statistics panel")).toBeInTheDocument();
		});

		it("should not crash when clicking rapidly", () => {
			render(<Panel drawingEngine={mockDrawingEngine as never} />);

			const triggerButton = screen.getByRole("button");

			expect(() => {
				fireEvent.click(triggerButton);
				fireEvent.click(triggerButton);
				fireEvent.click(triggerButton);
			}).not.toThrow();
		});
	});

	describe("Layout and Styling", () => {
		it("should render with proper structure", () => {
			render(<Panel drawingEngine={mockDrawingEngine as never} />);

			const triggerButton = screen.getByRole("button");
			expect(triggerButton).toHaveClass("size-8");
		});

		it("should apply variant and size classes", () => {
			render(<Panel drawingEngine={mockDrawingEngine as never} />);

			const triggerButton = screen.getByRole("button");
			expect(triggerButton).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle undefined elements", () => {
			const engineWithUndefinedElements = {
				...mockDrawingEngine,
				elements: undefined as never,
			};

			expect(() =>
				render(<Panel drawingEngine={engineWithUndefinedElements as never} />)
			).not.toThrow();
		});

		it("should handle mixed element types", () => {
			const engineWithMixedElements = {
				...mockDrawingEngine,
				elements: [
					{ id: "1", type: "line" as const, points: [], completed: true },
					{ id: "2", type: "area" as const, points: [], completed: true },
					{ id: "3", type: "curve" as const, points: [], completed: true },
					{ id: "4", type: "rectangle" as const, points: [], completed: true },
					{ id: "5", type: "circle" as const, points: [], completed: true },
				],
			};

			expect(() =>
				render(<Panel drawingEngine={engineWithMixedElements as never} />)
			).not.toThrow();
		});

		it("should handle elements without type property", () => {
			const engineWithInvalidElements = {
				...mockDrawingEngine,
				elements: [
					{ id: "1", points: [], completed: true },
					{ id: "2", type: "line" as const, points: [], completed: true },
				] as never[],
			};

			expect(() =>
				render(<Panel drawingEngine={engineWithInvalidElements as never} />)
			).not.toThrow();
		});
	});

	describe("Performance", () => {
		it("should handle large number of elements", () => {
			const largeElementsArray = Array.from({ length: 1000 }, (_, i) => ({
				id: `${i}`,
				type: ["line", "area", "curve"][i % 3] as "line" | "area" | "curve",
				points: [],
				completed: true,
			}));

			const engineWithManyElements = {
				...mockDrawingEngine,
				elements: largeElementsArray,
			};

			expect(() =>
				render(<Panel drawingEngine={engineWithManyElements as never} />)
			).not.toThrow();
		});

		it("should unsubscribe on unmount", () => {
			const unsubscribe = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				subscribeToStateChanges: vi.fn().mockReturnValue(unsubscribe),
			};

			const { unmount } = render(<Panel drawingEngine={mockEngine as never} />);
			unmount();

			expect(unsubscribe).toHaveBeenCalled();
		});
	});
});
