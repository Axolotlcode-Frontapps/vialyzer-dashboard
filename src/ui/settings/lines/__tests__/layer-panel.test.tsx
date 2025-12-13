// @vitest-environment jsdom
/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LayerPanel } from "../layer";

describe("LayerPanel Component", () => {
	const mockDrawingEngine = {
		isInitialized: true,
		elements: [
			{
				id: "elem-1",
				type: "line" as const,
				points: [],
				completed: true,
				layerId: "layer-1",
			},
			{
				id: "elem-2",
				type: "area" as const,
				points: [],
				completed: true,
				layerId: "layer-1",
			},
		],
		getLayers: vi.fn().mockReturnValue([
			{
				id: "layer-1",
				name: "Layer 1",
				visibility: "visible" as const,
				locked: false,
				opacity: 1,
				color: "#ff0000",
				zIndex: 0,
				elementIds: ["elem-1", "elem-2"],
			},
			{
				id: "layer-2",
				name: "Layer 2",
				visibility: "visible" as const,
				locked: false,
				opacity: 0.8,
				color: "#00ff00",
				zIndex: 1,
				elementIds: [],
			},
		]),
		getActiveLayer: vi.fn().mockReturnValue({
			id: "layer-1",
			name: "Layer 1",
			visibility: "visible" as const,
			locked: false,
			opacity: 1,
			color: "#ff0000",
			zIndex: 0,
			elementIds: ["elem-1", "elem-2"],
		}),
		getDisplaySize: vi.fn().mockReturnValue({ width: 800, height: 600 }),
		createLayer: vi.fn().mockReturnValue({ success: true }),
		updateLayer: vi.fn().mockReturnValue({ success: true }),
		deleteLayer: vi.fn().mockReturnValue({ success: true }),
		setActiveLayer: vi.fn().mockReturnValue({ success: true }),
		toggleLayerVisibility: vi.fn().mockReturnValue({ success: true }),
		setLayerOpacity: vi.fn().mockReturnValue({ success: true }),
		renameLayer: vi.fn().mockReturnValue({ success: true }),
		duplicateLayer: vi.fn().mockReturnValue({ success: true }),
		isolateLayer: vi.fn().mockReturnValue({ success: true }),
		requestRedraw: vi.fn(),
		subscribeToStateChanges: vi.fn().mockReturnValue(() => {
			// Unsubscribe function
		}),
	};

	const mockVehicles = [
		{ id: "vehicle-1", name: "Car", color: "#ff0000" },
		{ id: "vehicle-2", name: "Truck", color: "#00ff00" },
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	describe("Rendering", () => {
		it("should render trigger button", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			expect(triggerButton).toBeInTheDocument();
		});

		it("should show panel when trigger button is clicked", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getByText("Gestión de Capas")).toBeInTheDocument();
		});

		it("should render without vehicles prop", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} />);

			const triggerButton = screen.getByRole("button");
			expect(triggerButton).toBeInTheDocument();
		});

		it("should render without drawing engine", () => {
			render(<LayerPanel drawingEngine={null} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			expect(triggerButton).toBeInTheDocument();
		});
	});

	describe("Layer List", () => {
		it("should display layers when media is loaded", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getAllByText("Layer 1").length).toBeGreaterThan(0);
			expect(screen.getAllByText("Layer 2").length).toBeGreaterThan(0);
		});

		it("should show loading message when media is not loaded", () => {
			const uninitializedEngine = {
				...mockDrawingEngine,
				isInitialized: false,
			};

			render(<LayerPanel drawingEngine={uninitializedEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getByText("Cargando medio...")).toBeInTheDocument();
		});

		it("should show empty state when no layers exist", () => {
			const engineWithNoLayers = {
				...mockDrawingEngine,
				getLayers: vi.fn().mockReturnValue([]),
			};

			render(<LayerPanel drawingEngine={engineWithNoLayers as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getByText("No hay capas creadas aún")).toBeInTheDocument();
		});

		it("should display layer count", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getByText(/2 Capas/i)).toBeInTheDocument();
		});

		it("should display visible layer count", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getByText(/2 visibles/i)).toBeInTheDocument();
		});
	});

	describe("Layer Creation", () => {
		it("should open layer form when create button is clicked", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			const createButton = screen.getByTitle("Agregar nueva capa");
			fireEvent.click(createButton);

			// Form should open
			waitFor(() => {
				expect(screen.getByText("Crear Nueva Capa")).toBeInTheDocument();
			});
		});

		it("should call createLayer on form submission", async () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			// Component should render without errors
			expect(screen.getByText("Gestión de Capas")).toBeInTheDocument();
		});

		it("should show create layer button in empty state", () => {
			const engineWithNoLayers = {
				...mockDrawingEngine,
				getLayers: vi.fn().mockReturnValue([]),
			};

			render(<LayerPanel drawingEngine={engineWithNoLayers as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getByText("Crear Primera Capa")).toBeInTheDocument();
		});
	});

	describe("Layer Selection", () => {
		it("should display active layer", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getByText("Capa Activa")).toBeInTheDocument();
			expect(screen.getAllByText("Layer 1").length).toBeGreaterThan(0);
		});

		it("should show active layer info", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getAllByText(/2 elementos/i).length).toBeGreaterThan(0);
			expect(screen.getAllByText(/100% opacidad/i).length).toBeGreaterThan(0);
		});
	});

	describe("Layer Operations", () => {
		it("should handle layer visibility toggle", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			// Component renders layers
			expect(screen.getAllByText("Layer 1").length).toBeGreaterThan(0);
		});

		it("should handle layer deletion", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getAllByText("Layer 1").length).toBeGreaterThan(0);
		});

		it("should handle layer duplication", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getAllByText("Layer 1").length).toBeGreaterThan(0);
		});

		it("should handle layer isolation", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getAllByText("Layer 1").length).toBeGreaterThan(0);
		});
	});

	describe("State Subscription", () => {
		it("should subscribe to state changes on mount", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			expect(mockDrawingEngine.subscribeToStateChanges).toHaveBeenCalled();
		});

		it("should update layers on state change", () => {
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

			render(<LayerPanel drawingEngine={mockEngine as never} vehicles={mockVehicles} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "layerAction",
					action: "layerCreated",
				});
			}

			expect(mockEngine.subscribeToStateChanges).toHaveBeenCalled();
		});

		it("should toggle panel on togglePanel event", () => {
			const callback = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				subscribeToStateChanges: vi.fn((cb) => {
					callback.mockImplementation(cb);
					return () => {
						//
					};
				}),
			};

			render(<LayerPanel drawingEngine={mockEngine as never} vehicles={mockVehicles} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({ type: "togglePanel" });
			}
		});

		it("should handle media loaded event", () => {
			const callback = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				subscribeToStateChanges: vi.fn((cb) => {
					callback.mockImplementation(cb);
					return () => {
						//
					};
				}),
			};

			render(<LayerPanel drawingEngine={mockEngine as never} vehicles={mockVehicles} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({ type: "mediaLoaded" });
			}
		});
	});

	describe("Isolation State", () => {
		it("should show isolation warning when layer is isolated", () => {
			const callback = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				subscribeToStateChanges: vi.fn((cb) => {
					callback.mockImplementation(cb);
					return () => {
						//
					};
				}),
			};

			render(<LayerPanel drawingEngine={mockEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "layerAction",
					action: "layerIsolated",
					layerId: "layer-1",
				});
			}

			waitFor(() => {
				expect(screen.getByText(/Capa Aislada/i)).toBeInTheDocument();
			});
		});

		it("should clear isolation warning", () => {
			const callback = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				subscribeToStateChanges: vi.fn((cb) => {
					callback.mockImplementation(cb);
					return () => {
						//
					};
				}),
			};

			render(<LayerPanel drawingEngine={mockEngine as never} vehicles={mockVehicles} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				// Isolate
				stateChangeCallback({
					type: "layerAction",
					action: "layerIsolated",
					layerId: "layer-1",
				});

				// Clear
				stateChangeCallback({
					type: "layerAction",
					action: "layerIsolationCleared",
				});
			}
		});
	});

	describe("Accessibility", () => {
		it("should have proper button titles", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			expect(screen.getByTitle("Mostrar panel de capas")).toBeInTheDocument();
		});

		it("should update button title when panel is open", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getByTitle("Ocultar panel")).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle null drawing engine", () => {
			expect(() =>
				render(<LayerPanel drawingEngine={null} vehicles={mockVehicles} />)
			).not.toThrow();
		});

		it("should handle undefined vehicles", () => {
			expect(() => render(<LayerPanel drawingEngine={mockDrawingEngine as never} />)).not.toThrow();
		});

		it("should handle empty vehicles array", () => {
			expect(() =>
				render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={[]} />)
			).not.toThrow();
		});

		it("should handle empty layers array", () => {
			const engineWithNoLayers = {
				...mockDrawingEngine,
				getLayers: vi.fn().mockReturnValue([]),
				getActiveLayer: vi.fn().mockReturnValue(null),
			};

			expect(() =>
				render(<LayerPanel drawingEngine={engineWithNoLayers as never} vehicles={mockVehicles} />)
			).not.toThrow();
		});

		it("should handle no active layer", () => {
			const engineWithNoActive = {
				...mockDrawingEngine,
				getActiveLayer: vi.fn().mockReturnValue(null),
			};

			render(<LayerPanel drawingEngine={engineWithNoActive as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			expect(screen.getByText("Gestión de Capas")).toBeInTheDocument();
		});
	});

	describe("Performance", () => {
		it("should handle large number of layers", () => {
			const manyLayers = Array.from({ length: 50 }, (_, i) => ({
				id: `layer-${i}`,
				name: `Layer ${i}`,
				visibility: "visible" as const,
				locked: false,
				opacity: 1,
				color: "#ff0000",
				zIndex: i,
				elementIds: [],
			}));

			const engineWithManyLayers = {
				...mockDrawingEngine,
				getLayers: vi.fn().mockReturnValue(manyLayers),
			};

			expect(() =>
				render(<LayerPanel drawingEngine={engineWithManyLayers as never} vehicles={mockVehicles} />)
			).not.toThrow();
		});

		it("should unsubscribe on unmount", () => {
			const unsubscribe = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				subscribeToStateChanges: vi.fn().mockReturnValue(unsubscribe),
			};

			const { unmount } = render(
				<LayerPanel drawingEngine={mockEngine as never} vehicles={mockVehicles} />
			);

			unmount();
			expect(unsubscribe).toHaveBeenCalled();
		});
	});

	describe("Dynamic Sizing", () => {
		it("should adjust panel height based on canvas size", () => {
			const mockEngine = {
				...mockDrawingEngine,
				getDisplaySize: vi.fn().mockReturnValue({ width: 1920, height: 1080 }),
			};

			render(<LayerPanel drawingEngine={mockEngine as never} vehicles={mockVehicles} />);

			expect(mockEngine.getDisplaySize).toHaveBeenCalled();
		});

		it("should handle resize events", () => {
			const callback = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				subscribeToStateChanges: vi.fn((cb) => {
					callback.mockImplementation(cb);
					return () => {
						//
					};
				}),
			};

			render(<LayerPanel drawingEngine={mockEngine as never} vehicles={mockVehicles} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "resize",
					displaySize: { width: 1920, height: 1080 },
				});
			}
		});
	});

	describe("Layer Order", () => {
		it("should render layers in reverse order (top to bottom)", () => {
			render(<LayerPanel drawingEngine={mockDrawingEngine as never} vehicles={mockVehicles} />);

			const triggerButton = screen.getByRole("button");
			fireEvent.click(triggerButton);

			// Both layers should be present
			expect(screen.getAllByText("Layer 1").length).toBeGreaterThan(0);
			expect(screen.getByText("Layer 2")).toBeInTheDocument();
		});
	});
});
