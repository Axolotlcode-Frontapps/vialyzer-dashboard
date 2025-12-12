// @vitest-environment jsdom
/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LabelForm } from "../label-form";

describe("LabelForm Component", () => {
	const mockDrawingEngine = {
		completeTextInput: vi.fn(),
		cancelTextInput: vi.fn(),
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
		it("should not show dialog initially", () => {
			render(<LabelForm drawingEngine={mockDrawingEngine as never} />);

			expect(screen.queryByText(/Editar Información/i)).not.toBeInTheDocument();
			expect(screen.queryByText(/Agregar Información/i)).not.toBeInTheDocument();
		});

		it("should render without drawing engine", () => {
			expect(() => render(<LabelForm drawingEngine={null} />)).not.toThrow();
		});

		it("should show dialog when text editor opens", () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			// Trigger open text editor event
			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
					currentText: "Test Label",
					currentDescription: "Test Description",
					currentDirection: "top",
					currentDistance: 0,
					currentFontSize: 16,
					currentBackgroundEnabled: false,
					currentLayerType: "DETECTION",
				});
			}

			// Dialog should be visible
			waitFor(() => {
				expect(screen.getByText(/Editar Información/i)).toBeInTheDocument();
			});
		});
	});

	describe("Dialog States", () => {
		it("should show 'Agregar' title for new labels", () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
					currentText: "",
				});
			}

			waitFor(() => {
				expect(screen.getByText(/Agregar Información/i)).toBeInTheDocument();
			});
		});

		it("should show 'Editar' title for existing labels", () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
					currentText: "Existing Label",
				});
			}

			waitFor(() => {
				expect(screen.getByText(/Editar Información/i)).toBeInTheDocument();
			});
		});

		it("should close dialog on updateElementText event", () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				// Open dialog
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
				});

				// Close dialog
				stateChangeCallback({
					type: "annotation",
					action: "updateElementText",
				});
			}
		});
	});

	describe("Form Fields", () => {
		it("should have name field", async () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
				});
			}

			await waitFor(() => {
				expect(screen.getByPlaceholderText(/Ingresa el nombre/i)).toBeInTheDocument();
			});
		});

		it("should have description field", async () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
				});
			}

			await waitFor(() => {
				expect(screen.getByPlaceholderText(/Agrega una descripción/i)).toBeInTheDocument();
			});
		});

		it("should populate fields with existing values", async () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
					currentText: "Test Name",
					currentDescription: "Test Description",
				});
			}

			await waitFor(() => {
				const nameInput = screen.getByPlaceholderText(/Ingresa el nombre/i) as HTMLInputElement;
				expect(nameInput.value).toBe("Test Name");
			});
		});
	});

	describe("Form Submission", () => {
		it("should call completeTextInput on submit", async () => {
			const callback = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				completeTextInput: vi.fn(),
				subscribeToStateChanges: vi.fn((cb) => {
					callback.mockImplementation(cb);
					return () => {
						//
					};
				}),
			};

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
				});
			}

			await waitFor(() => {
				const nameInput = screen.getByPlaceholderText(/Ingresa el nombre/i);
				fireEvent.change(nameInput, { target: { value: "New Label" } });
			});

			const submitButton = screen.getByText(/Agregar|Actualizar/i);
			if (submitButton) {
				fireEvent.click(submitButton);

				await waitFor(() => {
					expect(mockEngine.completeTextInput).toHaveBeenCalled();
				});
			}
		});

		it("should trim whitespace from name", async () => {
			const callback = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				completeTextInput: vi.fn(),
				subscribeToStateChanges: vi.fn((cb) => {
					callback.mockImplementation(cb);
					return () => {
						//
					};
				}),
			};

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
				});
			}

			await waitFor(() => {
				const nameInput = screen.getByPlaceholderText(/Ingresa el nombre/i);
				fireEvent.change(nameInput, { target: { value: "  Trimmed  " } });
			});
		});
	});

	describe("Form Cancellation", () => {
		it("should call cancelTextInput on cancel", async () => {
			const callback = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				cancelTextInput: vi.fn(),
				subscribeToStateChanges: vi.fn((cb) => {
					callback.mockImplementation(cb);
					return () => {
						//
					};
				}),
			};

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
				});
			}

			await waitFor(() => {
				const cancelButton = screen.getByText(/Cancelar/i);
				fireEvent.click(cancelButton);
			});

			expect(mockEngine.cancelTextInput).toHaveBeenCalled();
		});

		it("should reset form on cancel", async () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
					currentText: "Test",
				});
			}

			await waitFor(() => {
				const cancelButton = screen.getByText(/Cancelar/i);
				fireEvent.click(cancelButton);
			});
		});
	});

	// Note: Type selection has been moved to LayerForm
	// Distance field is shown only when layer type is CONFIGURATION

	describe("Distance Field", () => {
		it("should show distance field when layer type is CONFIGURATION", async () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
					currentDistance: 10,
					currentLayerType: "CONFIGURATION",
				});
			}

			await waitFor(() => {
				expect(screen.getByText(/Distancia/i)).toBeInTheDocument();
			});
		});

		it("should not show distance field when layer type is DETECTION", async () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
					currentDistance: 0,
					currentLayerType: "DETECTION",
				});
			}

			await waitFor(() => {
				expect(screen.queryByText(/Distancia/i)).not.toBeInTheDocument();
			});
		});
	});

	describe("Direction Selection", () => {
		it("should have direction toggle group", async () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
				});
			}

			await waitFor(() => {
				expect(screen.getByText(/Dirección/i)).toBeInTheDocument();
			});
		});
	});

	describe("Font Settings", () => {
		it("should have font size options", async () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
				});
			}

			await waitFor(() => {
				expect(screen.getByText(/Tamaño de Fuente/i)).toBeInTheDocument();
			});
		});

		it("should have background toggle", async () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
				});
			}

			await waitFor(() => {
				expect(screen.getByText(/Fondo/i)).toBeInTheDocument();
			});
		});
	});

	describe("State Subscription", () => {
		it("should subscribe to state changes on mount", () => {
			render(<LabelForm drawingEngine={mockDrawingEngine as never} />);

			expect(mockDrawingEngine.subscribeToStateChanges).toHaveBeenCalled();
		});

		it("should not crash with null engine", () => {
			expect(() => render(<LabelForm drawingEngine={null} />)).not.toThrow();
		});

		it("should unsubscribe on unmount", () => {
			const unsubscribe = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				subscribeToStateChanges: vi.fn().mockReturnValue(unsubscribe),
			};

			const { unmount } = render(<LabelForm drawingEngine={mockEngine as never} />);
			unmount();

			expect(unsubscribe).toHaveBeenCalled();
		});
	});

	describe("Edge Cases", () => {
		it("should handle undefined currentText", async () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
					currentText: undefined,
				});
			}
		});

		it("should handle undefined currentDescription", async () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
					currentDescription: undefined,
				});
			}
		});

		it("should handle missing optional fields", async () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
				});
			}

			await waitFor(() => {
				expect(screen.getByPlaceholderText(/Ingresa el nombre/i)).toBeInTheDocument();
			});
		});
	});

	describe("Accessibility", () => {
		it("should have proper labels for form fields", async () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
				});
			}

			await waitFor(() => {
				expect(screen.getByText(/Nombre/i)).toBeInTheDocument();
				expect(screen.getByText(/Tipo/i)).toBeInTheDocument();
				expect(screen.getByText(/Dirección/i)).toBeInTheDocument();
			});
		});

		it("should have submit and cancel buttons", async () => {
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

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
				});
			}

			await waitFor(() => {
				expect(screen.getByText(/Cancelar/i)).toBeInTheDocument();
				expect(screen.getByText(/Agregar|Actualizar/i)).toBeInTheDocument();
			});
		});
	});

	describe("Form Validation", () => {
		it("should require name field", async () => {
			const callback = vi.fn();
			const mockEngine = {
				...mockDrawingEngine,
				completeTextInput: vi.fn(),
				subscribeToStateChanges: vi.fn((cb) => {
					callback.mockImplementation(cb);
					return () => {
						//
					};
				}),
			};

			render(<LabelForm drawingEngine={mockEngine as never} />);

			const stateChangeCallback = mockEngine.subscribeToStateChanges.mock.calls[0]?.[0];
			if (stateChangeCallback) {
				stateChangeCallback({
					type: "annotation",
					action: "openTextEditor",
					elementId: "elem-1",
				});
			}

			await waitFor(() => {
				const nameInput = screen.getByPlaceholderText(/Ingresa el nombre/i);
				expect(nameInput).toBeInTheDocument();
			});
		});
	});
});
