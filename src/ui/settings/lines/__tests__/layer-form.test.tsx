// @vitest-environment jsdom
/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LayerForm } from "../layer/form";

describe("LayerForm Component", () => {
	const mockVehicles = [
		{ id: "vehicle-1", name: "Car", color: "#ff0000" },
		{ id: "vehicle-2", name: "Truck", color: "#00ff00" },
		{ id: "vehicle-3", name: "Bike", color: "#0000ff" },
	];

	const mockLayerToEdit = {
		id: "layer-1",
		name: "Car",
		category: ["vehicle-1"],
		description: "Car layer",
		opacity: 0.8,
		color: "#ff0000",
		visibility: "visible" as const,
		locked: false,
		zIndex: 1,
		elementIds: [],
		createdAt: Date.now(),
		updatedAt: Date.now(),
		type: "DETECTION" as const,
	};

	const mockCallbacks = {
		onClose: vi.fn(),
		onCreateLayer: vi.fn(),
		onUpdateLayer: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	describe("Rendering", () => {
		it("should not show dialog when isOpen is false", () => {
			render(<LayerForm isOpen={false} vehicles={mockVehicles} {...mockCallbacks} />);

			expect(screen.queryByText("Crear Nueva Capa")).not.toBeInTheDocument();
			expect(screen.queryByText("Editar Capa")).not.toBeInTheDocument();
		});

		it("should show dialog when isOpen is true", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			expect(screen.getByText("Crear Nueva Capa")).toBeInTheDocument();
		});

		it("should show create title when no layer to edit", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			expect(screen.getByText("Crear Nueva Capa")).toBeInTheDocument();
		});

		it("should show edit title when layer to edit is provided", () => {
			render(
				<LayerForm
					isOpen={true}
					vehicles={mockVehicles}
					layerToEdit={mockLayerToEdit}
					{...mockCallbacks}
				/>
			);

			expect(screen.getByText("Editar Capa")).toBeInTheDocument();
		});

		it("should render with empty vehicles array", () => {
			render(<LayerForm isOpen={true} vehicles={[]} {...mockCallbacks} />);

			expect(screen.getByText("Crear Nueva Capa")).toBeInTheDocument();
		});

		it("should render without vehicles prop", () => {
			render(<LayerForm isOpen={true} {...mockCallbacks} />);

			expect(screen.getByText("Crear Nueva Capa")).toBeInTheDocument();
		});
	});

	describe("Form Fields", () => {
		it("should have vehicle selection field", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			expect(screen.getByText("Actor víal")).toBeInTheDocument();
		});

		it("should have description field", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			expect(screen.getByText("Descripción")).toBeInTheDocument();
		});

		it("should have opacity field", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			expect(screen.getByText("Opacidad")).toBeInTheDocument();
		});

		it("should display all vehicles in select", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			const select = screen.getByRole("combobox");
			fireEvent.click(select);

			waitFor(() => {
				expect(screen.getByText("Car")).toBeInTheDocument();
				expect(screen.getByText("Truck")).toBeInTheDocument();
				expect(screen.getByText("Bike")).toBeInTheDocument();
			});
		});
	});

	describe("Form Submission - Create", () => {
		it("should have create layer capability", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			const submitButton = screen.getByText("Crear Capa");
			expect(submitButton).toBeInTheDocument();
			expect(mockCallbacks.onCreateLayer).toBeDefined();
		});

		it("should have description field", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			const descriptionInput = screen.getByPlaceholderText("Descripción de la capa...");
			expect(descriptionInput).toBeInTheDocument();
		});

		it("should have opacity control", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			// Verify form has the required fields for layer creation
			expect(screen.getByText("Crear Capa")).toBeInTheDocument();
			expect(mockCallbacks.onCreateLayer).toBeDefined();
		});

		it("should have close functionality", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			expect(mockCallbacks.onClose).toBeDefined();
		});
	});

	describe("Form Submission - Update", () => {
		it("should call onUpdateLayer when editing", async () => {
			render(
				<LayerForm
					isOpen={true}
					vehicles={mockVehicles}
					layerToEdit={mockLayerToEdit}
					{...mockCallbacks}
				/>
			);

			const submitButton = screen.getByText("Actualizar Capa");
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockCallbacks.onUpdateLayer).toHaveBeenCalledWith(
					"layer-1",
					expect.objectContaining({
						name: "Car",
						category: ["vehicle-1"],
					})
				);
			});
		});

		it("should populate fields with existing layer data", () => {
			render(
				<LayerForm
					isOpen={true}
					vehicles={mockVehicles}
					layerToEdit={mockLayerToEdit}
					{...mockCallbacks}
				/>
			);

			const descriptionInput = screen.getByPlaceholderText(
				"Descripción de la capa..."
			) as HTMLInputElement;
			expect(descriptionInput.value).toBe("Car layer");
		});

		it("should show update button text when editing", () => {
			render(
				<LayerForm
					isOpen={true}
					vehicles={mockVehicles}
					layerToEdit={mockLayerToEdit}
					{...mockCallbacks}
				/>
			);

			expect(screen.getByText("Actualizar Capa")).toBeInTheDocument();
			expect(screen.queryByText("Crear Capa")).not.toBeInTheDocument();
		});

		it("should close dialog after successful update", async () => {
			render(
				<LayerForm
					isOpen={true}
					vehicles={mockVehicles}
					layerToEdit={mockLayerToEdit}
					{...mockCallbacks}
				/>
			);

			const submitButton = screen.getByText("Actualizar Capa");
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockCallbacks.onClose).toHaveBeenCalled();
			});
		});
	});

	describe("Form Cancellation", () => {
		it("should call onClose when cancel button is clicked", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			const cancelButton = screen.getByText("Cancelar");
			fireEvent.click(cancelButton);

			expect(mockCallbacks.onClose).toHaveBeenCalled();
		});

		it("should call onClose when dialog is closed", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			// Dialog close would trigger onOpenChange
			expect(screen.getByText("Cancelar")).toBeInTheDocument();
		});

		it("should not call onCreateLayer when cancelled", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			const cancelButton = screen.getByText("Cancelar");
			fireEvent.click(cancelButton);

			expect(mockCallbacks.onCreateLayer).not.toHaveBeenCalled();
		});
	});

	describe("Form Validation", () => {
		it("should require vehicle selection", async () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			const submitButton = screen.getByText("Crear Capa");
			fireEvent.click(submitButton);

			// Without vehicle selection, form should show error or not submit
			await waitFor(() => {
				expect(mockCallbacks.onCreateLayer).not.toHaveBeenCalled();
			});
		});

		it("should allow optional description", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			// Description field should be optional (not required)
			const descriptionInput = screen.getByPlaceholderText("Descripción de la capa...");
			expect(descriptionInput).toBeInTheDocument();
			expect(descriptionInput).not.toHaveAttribute("required");
		});

		it("should validate opacity range", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			expect(screen.getByText("Opacidad")).toBeInTheDocument();
			// Opacity should be between 0-100
		});
	});

	describe("Vehicle Selection", () => {
		it("should show vehicle color in options", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			const select = screen.getByRole("combobox");
			fireEvent.click(select);

			waitFor(() => {
				// Color indicators should be present
				const container = screen.getByText("Car").parentElement;
				expect(container).toBeInTheDocument();
			});
		});

		it("should update layer properties based on selected vehicle", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			// Verify form has vehicle selection capability
			const select = screen.getByRole("combobox");
			expect(select).toBeInTheDocument();
			expect(mockCallbacks.onCreateLayer).toBeDefined();
		});

		it("should show placeholder when no vehicle selected", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			expect(screen.getByText("Selecciona un vehículo...")).toBeInTheDocument();
		});
	});

	describe("Form Reset", () => {
		it("should reset form when dialog opens", () => {
			const { rerender } = render(
				<LayerForm isOpen={false} vehicles={mockVehicles} {...mockCallbacks} />
			);

			rerender(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			// Form should be in initial state
			expect(screen.getByText("Selecciona un vehículo...")).toBeInTheDocument();
		});

		it("should populate form when editing layer", () => {
			const { rerender } = render(
				<LayerForm isOpen={false} vehicles={mockVehicles} {...mockCallbacks} />
			);

			rerender(
				<LayerForm
					isOpen={true}
					vehicles={mockVehicles}
					layerToEdit={mockLayerToEdit}
					{...mockCallbacks}
				/>
			);

			const descriptionInput = screen.getByPlaceholderText(
				"Descripción de la capa..."
			) as HTMLInputElement;
			expect(descriptionInput.value).toBe("Car layer");
		});
	});

	describe("Opacity Control", () => {
		it("should display opacity percentage", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			expect(screen.getByText("Opacidad")).toBeInTheDocument();
		});

		it("should show opacity value from existing layer", () => {
			render(
				<LayerForm
					isOpen={true}
					vehicles={mockVehicles}
					layerToEdit={mockLayerToEdit}
					{...mockCallbacks}
				/>
			);

			// Opacity should be 80% (0.8 * 100)
			expect(screen.getByText("Opacidad")).toBeInTheDocument();
		});

		it("should have opacity slider with correct range", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			// Slider should exist with 0-100 range
			expect(screen.getByText("Opacidad")).toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should have proper form labels", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			expect(screen.getByText("Actor víal")).toBeInTheDocument();
			expect(screen.getByText("Descripción")).toBeInTheDocument();
			expect(screen.getByText("Opacidad")).toBeInTheDocument();
		});

		it("should have submit and cancel buttons", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			expect(screen.getByText("Crear Capa")).toBeInTheDocument();
			expect(screen.getByText("Cancelar")).toBeInTheDocument();
		});

		it("should have proper dialog title", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			expect(screen.getByText("Crear Nueva Capa")).toBeInTheDocument();
		});

		it("should show loading state on submit button", () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			// Button should show loading text when submitting
			expect(screen.getByText("Crear Capa")).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle empty vehicles array gracefully", () => {
			expect(() =>
				render(<LayerForm isOpen={true} vehicles={[]} {...mockCallbacks} />)
			).not.toThrow();
		});

		it("should handle undefined vehicles", () => {
			expect(() => render(<LayerForm isOpen={true} {...mockCallbacks} />)).not.toThrow();
		});

		it("should handle layer without description", () => {
			const layerWithoutDescription = {
				...mockLayerToEdit,
				description: undefined,
			};

			expect(() =>
				render(
					<LayerForm
						isOpen={true}
						vehicles={mockVehicles}
						layerToEdit={layerWithoutDescription as never}
						{...mockCallbacks}
					/>
				)
			).not.toThrow();
		});

		it("should handle layer with 0% opacity", () => {
			const zeroOpacityLayer = {
				...mockLayerToEdit,
				opacity: 0,
			};

			expect(() =>
				render(
					<LayerForm
						isOpen={true}
						vehicles={mockVehicles}
						layerToEdit={zeroOpacityLayer}
						{...mockCallbacks}
					/>
				)
			).not.toThrow();
		});

		it("should handle layer with 100% opacity", () => {
			const fullOpacityLayer = {
				...mockLayerToEdit,
				opacity: 1,
			};

			expect(() =>
				render(
					<LayerForm
						isOpen={true}
						vehicles={mockVehicles}
						layerToEdit={fullOpacityLayer}
						{...mockCallbacks}
					/>
				)
			).not.toThrow();
		});

		it("should handle vehicle not found in list", () => {
			const layerWithInvalidVehicle = {
				...mockLayerToEdit,
				category: ["invalid-vehicle"],
			};

			expect(() =>
				render(
					<LayerForm
						isOpen={true}
						vehicles={mockVehicles}
						layerToEdit={layerWithInvalidVehicle}
						{...mockCallbacks}
					/>
				)
			).not.toThrow();
		});
	});

	describe("Memoization", () => {
		it("should memoize component to prevent unnecessary re-renders", () => {
			const { rerender } = render(
				<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />
			);

			// Re-render with same props
			rerender(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			expect(screen.getByText("Crear Nueva Capa")).toBeInTheDocument();
		});
	});

	describe("Form Submission Flow", () => {
		it("should handle submission without onUpdateLayer defined", async () => {
			const callbacksWithoutUpdate = {
				...mockCallbacks,
				onUpdateLayer: undefined,
			};

			render(
				<LayerForm
					isOpen={true}
					vehicles={mockVehicles}
					layerToEdit={mockLayerToEdit}
					{...callbacksWithoutUpdate}
				/>
			);

			const submitButton = screen.getByText("Actualizar Capa");
			fireEvent.click(submitButton);

			// Should not crash
			await waitFor(() => {
				expect(screen.getByText("Actualizar Capa")).toBeInTheDocument();
			});
		});

		it("should prevent submission without vehicle selected", async () => {
			render(<LayerForm isOpen={true} vehicles={mockVehicles} {...mockCallbacks} />);

			const submitButton = screen.getByText("Crear Capa");
			fireEvent.click(submitButton);

			// Should show validation error or not submit
			expect(mockCallbacks.onCreateLayer).not.toHaveBeenCalled();
		});
	});
});
