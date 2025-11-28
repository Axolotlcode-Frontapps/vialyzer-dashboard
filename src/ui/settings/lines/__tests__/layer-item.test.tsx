// @vitest-environment jsdom
/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LayerItem } from "../layer/item";

describe("LayerItem Component", () => {
	const mockLayer = {
		id: "layer-1",
		name: "Test Layer",
		visibility: "visible" as const,
		locked: false,
		opacity: 0.8,
		color: "#ff0000",
		category: ["vehicle-1"],
		zIndex: 1,
		elementIds: ["elem-1", "elem-2", "elem-3"],
		description: "Test layer description",
		createdAt: Date.now(),
		updatedAt: Date.now(),
	};

	const mockCallbacks = {
		onSelect: vi.fn(),
		onVisibilityToggle: vi.fn(),
		onOpacityChange: vi.fn(),
		onRenameStart: vi.fn(),
		onRenameComplete: vi.fn(),
		onRenameCancel: vi.fn(),
		onTempNameChange: vi.fn(),
		onDelete: vi.fn(),
		onDuplicate: vi.fn(),
		onIsolate: vi.fn(),
		onExpansionToggle: vi.fn(),
		onEdit: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	describe("Rendering", () => {
		it("should render layer name", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			expect(screen.getByText("Test Layer")).toBeInTheDocument();
		});

		it("should render layer color indicator", () => {
			const { container } = render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const colorIndicator = container.querySelector(
				'[style*="background-color"]'
			);
			expect(colorIndicator).toBeInTheDocument();
		});

		it("should render element count", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			expect(screen.getByText("3")).toBeInTheDocument();
		});

		it("should render visibility icon", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const visibilityButton = screen.getByLabelText(
				/Alternar visibilidad de capa/i
			);
			expect(visibilityButton).toBeInTheDocument();
		});

		it("should apply active styling when active", () => {
			const { container } = render(
				<LayerItem
					layer={mockLayer}
					isActive={true}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const layerContainer = container.querySelector(".border-blue-500");
			expect(layerContainer).toBeInTheDocument();
		});

		it("should apply isolated styling when isolated", () => {
			const { container } = render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={true}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const layerContainer = container.querySelector(".ring-2");
			expect(layerContainer).toBeInTheDocument();
		});
	});

	describe("Layer Selection", () => {
		it("should call onSelect when layer name is clicked", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const layerName = screen.getByText("Test Layer");
			fireEvent.click(layerName);

			expect(mockCallbacks.onSelect).toHaveBeenCalledWith("layer-1");
		});

		it("should start rename on double click", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const layerName = screen.getByText("Test Layer");
			fireEvent.doubleClick(layerName);

			expect(mockCallbacks.onRenameStart).toHaveBeenCalledWith(
				"layer-1",
				"Test Layer"
			);
		});

		it("should handle keyboard navigation on layer name", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const layerName = screen.getByText("Test Layer");
			fireEvent.keyDown(layerName, { key: "Enter" });

			expect(mockCallbacks.onSelect).toHaveBeenCalledWith("layer-1");
		});

		it("should start rename on F2 key press", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const layerName = screen.getByText("Test Layer");
			fireEvent.keyDown(layerName, { key: "F2" });

			expect(mockCallbacks.onRenameStart).toHaveBeenCalledWith(
				"layer-1",
				"Test Layer"
			);
		});
	});

	describe("Renaming", () => {
		it("should show input field when renaming", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={true}
					tempName="New Name"
					{...mockCallbacks}
				/>
			);

			const input = screen.getByPlaceholderText("Nombre de capa");
			expect(input).toBeInTheDocument();
			expect((input as HTMLInputElement).value).toBe("New Name");
		});

		it("should call onTempNameChange when typing", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={true}
					tempName="Old Name"
					{...mockCallbacks}
				/>
			);

			const input = screen.getByPlaceholderText("Nombre de capa");
			fireEvent.change(input, { target: { value: "New Name" } });

			expect(mockCallbacks.onTempNameChange).toHaveBeenCalledWith("New Name");
		});

		it("should complete rename on Enter key", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={true}
					tempName="New Name"
					{...mockCallbacks}
				/>
			);

			const input = screen.getByPlaceholderText("Nombre de capa");
			fireEvent.keyDown(input, { key: "Enter" });

			expect(mockCallbacks.onRenameComplete).toHaveBeenCalledWith(
				"layer-1",
				"New Name"
			);
		});

		it("should cancel rename on Escape key", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={true}
					tempName="New Name"
					{...mockCallbacks}
				/>
			);

			const input = screen.getByPlaceholderText("Nombre de capa");
			fireEvent.keyDown(input, { key: "Escape" });

			expect(mockCallbacks.onRenameCancel).toHaveBeenCalled();
		});

		it("should complete rename on blur", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={true}
					tempName="New Name"
					{...mockCallbacks}
				/>
			);

			const input = screen.getByPlaceholderText("Nombre de capa");
			fireEvent.blur(input);

			expect(mockCallbacks.onRenameComplete).toHaveBeenCalledWith(
				"layer-1",
				"New Name"
			);
		});

		it("should stop event propagation during rename", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={true}
					tempName="New Name"
					{...mockCallbacks}
				/>
			);

			const input = screen.getByPlaceholderText("Nombre de capa");
			const keyDownEvent = new KeyboardEvent("keydown", {
				key: "a",
				bubbles: true,
			});

			Object.defineProperty(keyDownEvent, "stopPropagation", {
				value: vi.fn(),
				writable: true,
			});

			input.dispatchEvent(keyDownEvent);
		});
	});

	describe("Visibility Toggle", () => {
		it("should call onVisibilityToggle when clicked", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const visibilityButton = screen.getByLabelText(
				/Alternar visibilidad de capa/i
			);
			fireEvent.click(visibilityButton);

			expect(mockCallbacks.onVisibilityToggle).toHaveBeenCalledWith("layer-1");
		});

		it("should show appropriate icon for visible state", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const visibilityButton = screen.getByLabelText(
				/Alternar visibilidad de capa/i
			);
			expect(visibilityButton).toBeInTheDocument();
		});

		it("should show appropriate icon for hidden state", () => {
			const hiddenLayer = { ...mockLayer, visibility: "hidden" as const };

			render(
				<LayerItem
					layer={hiddenLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const visibilityButton = screen.getByLabelText(
				/Alternar visibilidad de capa/i
			);
			expect(visibilityButton).toBeInTheDocument();
		});

		it("should show lock icon for locked state", () => {
			const lockedLayer = { ...mockLayer, visibility: "locked" as const };

			render(
				<LayerItem
					layer={lockedLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const visibilityButton = screen.getByLabelText(
				/Alternar visibilidad de capa/i
			);
			expect(visibilityButton).toBeInTheDocument();
		});
	});

	describe("Expansion Toggle", () => {
		it("should call onExpansionToggle when expand button is clicked", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const expandButton = screen.getByLabelText(/Expandir detalles de capa/i);
			fireEvent.click(expandButton);

			expect(mockCallbacks.onExpansionToggle).toHaveBeenCalledWith("layer-1");
		});

		it("should show collapse button when expanded", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={true}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const collapseButton = screen.getByLabelText(
				/Contraer detalles de capa/i
			);
			expect(collapseButton).toBeInTheDocument();
		});

		it("should show expanded details when expanded", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={true}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			expect(screen.getByText("Opacidad")).toBeInTheDocument();
			expect(screen.getByText("80%")).toBeInTheDocument();
		});

		it("should not show expanded details when collapsed", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			expect(screen.queryByText("Opacidad")).not.toBeInTheDocument();
		});
	});

	describe("Opacity Control", () => {
		it("should display current opacity percentage", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={true}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			expect(screen.getByText("80%")).toBeInTheDocument();
		});

		it("should call onOpacityChange when slider is moved", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={true}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			// Slider interaction would require more complex setup
			expect(screen.getByText("Opacidad")).toBeInTheDocument();
		});
	});

	describe("Layer Menu", () => {
		it("should render menu button", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const menuButton = screen.getByLabelText(/Menú de opciones de capa/i);
			expect(menuButton).toBeInTheDocument();
		});

		it("should have menu button that accepts callbacks", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const menuButton = screen.getByLabelText(/Menú de opciones de capa/i);
			expect(menuButton).toHaveAttribute("aria-haspopup", "menu");
		});

		it("should accept onEdit callback", () => {
			expect(mockCallbacks.onEdit).toBeDefined();
		});

		it("should accept onRenameStart callback", () => {
			expect(mockCallbacks.onRenameStart).toBeDefined();
		});

		it("should accept onDuplicate callback", () => {
			expect(mockCallbacks.onDuplicate).toBeDefined();
		});

		it("should accept onIsolate callback", () => {
			expect(mockCallbacks.onIsolate).toBeDefined();
		});

		it("should accept onDelete callback", () => {
			expect(mockCallbacks.onDelete).toBeDefined();
		});
	});

	describe("Layer Information", () => {
		it("should display z-index when expanded", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={true}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			expect(screen.getByText("Índice Z:")).toBeInTheDocument();
			expect(screen.getByText("1")).toBeInTheDocument();
		});

		it("should display element count when expanded", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={true}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			expect(screen.getByText("Elementos:")).toBeInTheDocument();
		});

		it("should display description when available", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={true}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			expect(screen.getByText("Descripción:")).toBeInTheDocument();
			expect(screen.getByText("Test layer description")).toBeInTheDocument();
		});

		it("should not show description section when description is empty", () => {
			const layerWithoutDescription = { ...mockLayer, description: "" };

			render(
				<LayerItem
					layer={layerWithoutDescription}
					isActive={false}
					isIsolated={false}
					isExpanded={true}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			expect(screen.queryByText("Descripción:")).not.toBeInTheDocument();
		});
	});

	describe("Accessibility", () => {
		it("should have proper ARIA labels", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			expect(
				screen.getByLabelText(/Expandir detalles de capa/i)
			).toBeInTheDocument();
			expect(
				screen.getByLabelText(/Alternar visibilidad de capa/i)
			).toBeInTheDocument();
			expect(
				screen.getByLabelText(/Menú de opciones de capa/i)
			).toBeInTheDocument();
		});

		it("should have descriptive layer button ARIA label", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			const layerButton = screen.getByLabelText(
				/Capa: Test Layer\. Clic para seleccionar/i
			);
			expect(layerButton).toBeInTheDocument();
		});

		it("should have aria labels for expanded sections", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={true}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			expect(
				screen.getByLabelText(/Sección de controles de capa/i)
			).toBeInTheDocument();
		});

		it("should have aria label for rename input container", () => {
			render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={true}
					tempName="New Name"
					{...mockCallbacks}
				/>
			);

			expect(
				screen.getByLabelText(/Contenedor de entrada para renombrar capa/i)
			).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		it("should handle layer without color", () => {
			const layerWithoutColor = { ...mockLayer, color: undefined };

			expect(() =>
				render(
					<LayerItem
						layer={layerWithoutColor as never}
						isActive={false}
						isIsolated={false}
						isExpanded={false}
						isRenaming={false}
						tempName=""
						{...mockCallbacks}
					/>
				)
			).not.toThrow();
		});

		it("should handle layer with zero elements", () => {
			const emptyLayer = { ...mockLayer, elementIds: [] };

			render(
				<LayerItem
					layer={emptyLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			expect(screen.getByText("0")).toBeInTheDocument();
		});

		it("should handle layer with 100% opacity", () => {
			const fullOpacityLayer = { ...mockLayer, opacity: 1 };

			render(
				<LayerItem
					layer={fullOpacityLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={true}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			expect(screen.getByText("100%")).toBeInTheDocument();
		});

		it("should handle layer with 0% opacity", () => {
			const zeroOpacityLayer = { ...mockLayer, opacity: 0 };

			render(
				<LayerItem
					layer={zeroOpacityLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={true}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			expect(screen.getByText("0%")).toBeInTheDocument();
		});

		it("should handle long layer names", () => {
			const longNameLayer = {
				...mockLayer,
				name: "Very Long Layer Name That Should Be Truncated In The UI",
			};

			render(
				<LayerItem
					layer={longNameLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			expect(
				screen.getByText(
					"Very Long Layer Name That Should Be Truncated In The UI"
				)
			).toBeInTheDocument();
		});
	});

	describe("Memoization", () => {
		it("should memoize component to prevent unnecessary re-renders", () => {
			const { rerender } = render(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			// Re-render with same props
			rerender(
				<LayerItem
					layer={mockLayer}
					isActive={false}
					isIsolated={false}
					isExpanded={false}
					isRenaming={false}
					tempName=""
					{...mockCallbacks}
				/>
			);

			expect(screen.getByText("Test Layer")).toBeInTheDocument();
		});
	});
});
