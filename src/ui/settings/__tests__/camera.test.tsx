// @vitest-environment jsdom
/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DrawingElement, LayerInfo } from "@/ui/settings/lines";

// Mock the DrawingBridge class first using vi.hoisted
const { mockExport, mockImport } = vi.hoisted(() => ({
	mockExport: vi.fn(),
	mockImport: vi.fn(),
}));

vi.mock("@/ui/settings/lines/drawing/bridge", () => ({
	DrawingBridge: vi.fn().mockImplementation(() => ({
		export: mockExport,
		import: mockImport,
	})),
}));

// Mock the hooks
vi.mock("@/hooks/settings/use-add-scenario", () => ({
	useAddScenarioLine: vi.fn(() => ({
		add: vi.fn().mockResolvedValue(undefined),
		loading: false,
		error: null,
	})),
}));

vi.mock("@/hooks/settings/use-get-previewy", () => ({
	useGetPreview: vi.fn(() => ({
		data: null,
		loading: false,
		error: null,
	})),
}));

vi.mock("@/hooks/settings/use-get-scenario-lines", () => ({
	useGetScenarioLines: vi.fn(() => ({
		data: [],
		loading: false,
		refetch: vi.fn(),
		error: null,
	})),
}));

vi.mock("@/hooks/settings/use-load-vehicles", () => ({
	useLoadVehicles: vi.fn(() => ({
		data: [],
		loading: false,
		error: null,
	})),
}));

vi.mock("@/hooks/settings/use-remove-scenario", () => ({
	useRemoveScenarioLine: vi.fn(() => ({
		remove: vi.fn().mockResolvedValue(undefined),
		loading: false,
		error: null,
	})),
}));

vi.mock("@/hooks/settings/use-update-scenario", () => ({
	useUpdateScenarioLine: vi.fn(() => ({
		update: vi.fn().mockResolvedValue(undefined),
		loading: false,
		error: null,
	})),
}));

// Mock the Lines component
vi.mock("@/ui/settings/lines", () => ({
	Lines: vi.fn(() => null),
}));

// Mock the Skeleton component
vi.mock("@/ui/shared/skeleton", () => ({
	Skeleton: vi.fn(({ className }: { className?: string }) => (
		<div className={className} data-testid="skeleton">
			Loading...
		</div>
	)),
}));

// Now import the mocked modules
import { useAddScenarioLine } from "@/hooks/settings/use-add-scenario";
import { useGetPreview } from "@/hooks/settings/use-get-previewy";
import { useGetScenarioLines } from "@/hooks/settings/use-get-scenario-lines";
import { useLoadVehicles } from "@/hooks/settings/use-load-vehicles";
import { useRemoveScenarioLine } from "@/hooks/settings/use-remove-scenario";
import { useUpdateScenarioLine } from "@/hooks/settings/use-update-scenario";
import { Lines } from "@/ui/settings/lines";
// Import the component
import { Camera } from "../camera";

describe("Camera Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockExport.mockClear();
		mockImport.mockClear();

		// Set default return values for bridge mocks
		mockExport.mockReturnValue([]);
		mockImport.mockReturnValue({ elements: [], layers: new Map() });

		// Default mock implementations
		vi.mocked(useLoadVehicles).mockReturnValue({
			data: [],
			loading: false,
			error: null,
			refetch: vi.fn(),
		});

		vi.mocked(useGetScenarioLines).mockReturnValue({
			data: [],
			loading: false,
			refetch: vi.fn(),
			error: null,
		});

		vi.mocked(useGetPreview).mockReturnValue({
			data: undefined,
			loading: false,
			error: null,
			refetch: vi.fn(),
		});

		vi.mocked(useAddScenarioLine).mockReturnValue({
			add: vi.fn().mockResolvedValue(undefined),
			loading: false,
			error: null,
		});

		vi.mocked(useRemoveScenarioLine).mockReturnValue({
			remove: vi.fn().mockResolvedValue(undefined),
			loading: false,
			error: null,
		});

		vi.mocked(useUpdateScenarioLine).mockReturnValue({
			update: vi.fn().mockResolvedValue(undefined),
			loading: false,
			error: null,
		});

		vi.mocked(Lines).mockImplementation(() => (
			<div data-testid="lines-component">Lines Component</div>
		));
	});

	describe("Rendering", () => {
		it("should render loading state when vehicles are loading", () => {
			vi.mocked(useLoadVehicles).mockReturnValue({
				data: [],
				loading: true,
				error: null,
				refetch: vi.fn(),
			});

			render(<Camera />);
			expect(screen.getByTestId("skeleton")).toBeInTheDocument();
			expect(screen.getByText("Loading...")).toBeInTheDocument();
		});

		it("should render loading state when lines are loading", () => {
			vi.mocked(useGetScenarioLines).mockReturnValue({
				data: [],
				loading: true,
				refetch: vi.fn(),
				error: null,
			});

			render(<Camera />);
			expect(screen.getByTestId("skeleton")).toBeInTheDocument();
		});

		it("should render Lines component when data is loaded", () => {
			vi.mocked(useLoadVehicles).mockReturnValue({
				data: [
					{
						id: "1",
						name: "Car",
						model_id: 1,
						color: [255, 0, 0],
						active: true,
					},
				],
				loading: false,
				error: null,
				refetch: vi.fn(),
			});

			vi.mocked(useGetScenarioLines).mockReturnValue({
				data: [],
				loading: false,
				refetch: vi.fn(),
				error: null,
			});

			render(<Camera />);
			expect(screen.getByTestId("lines-component")).toBeInTheDocument();
		});

		it("should use preview image when available", () => {
			vi.mocked(useGetPreview).mockReturnValue({
				// Partial mock of Camera type - only testing previewImageUrl property
				data: {
					previewImageUrl: "http://example.com/preview.jpg",
				} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
				loading: false,
				error: null,
				refetch: vi.fn(),
			});

			render(<Camera />);

			const callArgs = vi.mocked(Lines).mock.calls[0][0];
			expect(callArgs).toMatchObject({
				src: "http://example.com/preview.jpg",
				type: "image",
			});
		});

		it("should use default image when preview is not available", () => {
			vi.mocked(useGetPreview).mockReturnValue({
				data: undefined,
				loading: false,
				error: null,
				refetch: vi.fn(),
			});

			render(<Camera />);

			const callArgs = vi.mocked(Lines).mock.calls[0][0];
			expect(callArgs).toMatchObject({
				type: "image",
			});
		});
	});

	describe("Vehicle Mapping", () => {
		it("should correctly map vehicles for Lines component", () => {
			const mockVehicles = [
				{
					id: "v1",
					name: "Car",
					model_id: 1,
					color: [255, 0, 0] as [number, number, number],
					active: true,
				},
				{
					id: "v2",
					name: "Truck",
					model_id: 2,
					color: [0, 255, 0] as [number, number, number],
					active: true,
				},
			];

			vi.mocked(useLoadVehicles).mockReturnValue({
				data: mockVehicles,
				loading: false,
				error: null,
				refetch: vi.fn(),
			});

			render(<Camera />);

			const callArgs = vi.mocked(Lines).mock.calls[0][0];
			expect(callArgs).toMatchObject({
				vehicles: [
					{ id: "v1", name: "Car", color: "rgb(255, 0, 0)" },
					{ id: "v2", name: "Truck", color: "rgb(0, 255, 0)" },
				],
			});
		});

		it("should handle empty vehicles array", () => {
			vi.mocked(useLoadVehicles).mockReturnValue({
				data: [],
				loading: false,
				error: null,
				refetch: vi.fn(),
			});

			render(<Camera />);

			const callArgs = vi.mocked(Lines).mock.calls[0][0];
			expect(callArgs).toMatchObject({
				vehicles: [],
			});
		});
	});

	describe("Drawing Complete Handler", () => {
		it("should handle drawing completion", () => {
			const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {
				//
			});

			render(<Camera />);

			// Get the onDrawingComplete callback
			const onDrawingComplete = vi.mocked(Lines).mock.calls[0][0].onDrawingComplete;

			expect(onDrawingComplete).toBeDefined();

			// Call the handler
			onDrawingComplete?.({
				width: 100,
				height: 100,
				matrix: [
					[1, 0],
					[0, 1],
				],
				elements: [],
			});

			expect(consoleLogSpy).toHaveBeenCalledWith(
				"Drawing complete, matrix data:",
				expect.objectContaining({
					width: 100,
					height: 100,
					matrix: expect.arrayContaining([[1, 0]]),
					elements: [],
				})
			);

			consoleLogSpy.mockRestore();
		});
	});

	describe("Save Elements Handler", () => {
		it("should handle saving new elements", async () => {
			const mockAdd = vi.fn().mockResolvedValue(undefined);
			const mockRefetch = vi.fn();

			vi.mocked(useAddScenarioLine).mockReturnValue({
				add: mockAdd,
				loading: false,
				error: null,
			});

			vi.mocked(useGetScenarioLines).mockReturnValue({
				data: [],
				loading: false,
				refetch: mockRefetch,
				error: null,
			});

			mockExport.mockReturnValue([
				{
					id: "1",
					name: "Test Line",
					description: "Test Description",
					coordinates: [
						[0, 0],
						[100, 100],
					],
					detection_entry: [[0, 0]],
					detection_exit: [[100, 100]],
					distance: 100,
					color: "rgb(255,0,0)",
					type: "DETECTION",
					layer_id: "layer1",
					visual_coordinates: {
						layer_id: "layer1",
						type: "line",
						fontSize: 12,
						fontFamily: "Arial",
						backgroundColor: "#ffffff",
						backgroundOpacity: 0.8,
						coordinates: [
							[0, 0],
							[100, 100],
						],
					},
					maps_coordinates: [19.3048720286, -99.05621509437437],
					location: "zone 1",
					visibility: true,
					allowed_directions: "ANY",
				},
			]);

			render(<Camera />);

			// Get the onSave callback
			const onSave = vi.mocked(Lines).mock.calls[0][0].onSave;

			const elements: DrawingElement[] = [
				{
					id: "1",
					type: "line",
					points: [
						{ x: 0, y: 0 },
						{ x: 100, y: 100 },
					],
					syncState: "new",
					layerId: "layer1",
					color: "rgb(255,0,0)",
					completed: true,
					info: {
						name: "Test Line",
						description: "Test Description",
						distance: 100,
						direction: "right",
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
					detection: {
						entry: [{ x: 0, y: 0 }],
						exit: [{ x: 100, y: 100 }],
					},
				},
			];

			const layers: LayerInfo[] = [
				{
					id: "layer1",
					name: "Layer 1",
					description: "Test Layer",
					category: ["vehicle1"],
					visibility: "visible",
					opacity: 1,
					zIndex: 0,
					elementIds: ["1"],
					createdAt: Date.now(),
					updatedAt: Date.now(),
					type: "DETECTION",
				},
			];

			await onSave?.(elements, layers);

			await waitFor(() => {
				expect(mockExport).toHaveBeenCalledWith(elements);
				expect(mockAdd).toHaveBeenCalledWith([
					expect.objectContaining({
						name: "Test Line",
						description: "Test Description",
						layer: {
							id: "layer1",
							name: "Layer 1",
							description: "Test Layer",
							category: ["vehicle1"],
						},
					}),
				]);
				expect(mockRefetch).toHaveBeenCalled();
			});
		});

		it("should handle updating existing elements", async () => {
			const mockUpdate = vi.fn().mockResolvedValue(undefined);
			const mockRefetch = vi.fn();

			// Partial mock of SourceLine - only testing id and name for update scenario
			const mockServerLines = [
				{
					id: "1",
					name: "Existing Line",
				} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
			];

			vi.mocked(useUpdateScenarioLine).mockReturnValue({
				update: mockUpdate,
				loading: false,
				error: null,
			});

			vi.mocked(useGetScenarioLines).mockReturnValue({
				data: mockServerLines,
				loading: false,
				refetch: mockRefetch,
				error: null,
			});

			mockExport.mockReturnValue([
				{
					id: "1",
					name: "Updated Line",
					description: "Updated Description",
					layer_id: "layer1",
				},
			]);

			render(<Camera />);

			const onSave = vi.mocked(Lines).mock.calls[0][0].onSave;

			const elements: DrawingElement[] = [
				{
					id: "1",
					type: "line",
					points: [],
					syncState: "edited",
					layerId: "layer1",
					color: "#000000",
					completed: true,
					info: {
						name: "Updated Line",
						distance: 100,
						direction: "right",
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
					detection: {
						entry: [],
						exit: [],
					},
				},
			];

			const layers: LayerInfo[] = [
				{
					id: "layer1",
					name: "Layer 1",
					description: "Test Layer",
					category: ["vehicle1"],
					visibility: "visible",
					opacity: 1,
					zIndex: 0,
					elementIds: ["1"],
					createdAt: Date.now(),
					updatedAt: Date.now(),
					type: "DETECTION",
				},
			];

			await onSave?.(elements, layers);

			await waitFor(() => {
				expect(mockUpdate).toHaveBeenCalledWith({
					lines: expect.arrayContaining([
						expect.objectContaining({
							id: "1",
							name: "Updated Line",
						}),
					]),
					serverLines: mockServerLines,
				});
				expect(mockRefetch).toHaveBeenCalled();
			});
		});

		it("should handle deleting elements", async () => {
			const mockRemove = vi.fn().mockResolvedValue(undefined);
			const mockRefetch = vi.fn();

			// Partial mock of SourceLine - only testing id and name for deletion
			const mockServerLines = [
				{
					id: "1",
					name: "Line to delete",
				} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
			];

			vi.mocked(useRemoveScenarioLine).mockReturnValue({
				remove: mockRemove,
				loading: false,
				error: null,
			});

			vi.mocked(useGetScenarioLines).mockReturnValue({
				data: mockServerLines,
				loading: false,
				refetch: mockRefetch,
				error: null,
			});

			render(<Camera />);

			const onSave = vi.mocked(Lines).mock.calls[0][0].onSave;

			const elements: DrawingElement[] = [
				{
					id: "1",
					type: "line",
					points: [],
					syncState: "deleted",
					layerId: "layer1",
					color: "#000000",
					completed: true,
					info: {
						name: "Line to delete",
						distance: 100,
						direction: "right",
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
					detection: {
						entry: [],
						exit: [],
					},
				},
			];

			const layers: LayerInfo[] = [];

			await onSave?.(elements, layers);

			await waitFor(() => {
				expect(mockRemove).toHaveBeenCalledWith([
					expect.objectContaining({
						id: "1",
						name: "Line to delete",
					}),
				]);
				expect(mockRefetch).toHaveBeenCalled();
			});
		});

		it("should not make API calls when no changes", async () => {
			const mockAdd = vi.fn();
			const mockUpdate = vi.fn();
			const mockRemove = vi.fn();

			vi.mocked(useAddScenarioLine).mockReturnValue({
				add: mockAdd,
				loading: false,
				error: null,
			});

			vi.mocked(useUpdateScenarioLine).mockReturnValue({
				update: mockUpdate,
				loading: false,
				error: null,
			});

			vi.mocked(useRemoveScenarioLine).mockReturnValue({
				remove: mockRemove,
				loading: false,
				error: null,
			});

			render(<Camera />);

			const onSave = vi.mocked(Lines).mock.calls[0][0].onSave;

			const elements: DrawingElement[] = [
				{
					id: "1",
					type: "line",
					points: [],
					syncState: "saved",
					layerId: "layer1",
					color: "#000000",
					completed: true,
					info: {
						name: "Unchanged Line",
						distance: 100,
						direction: "right",
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
					detection: {
						entry: [],
						exit: [],
					},
				},
			];

			const layers: LayerInfo[] = [];

			await onSave?.(elements, layers);

			expect(mockAdd).not.toHaveBeenCalled();
			expect(mockUpdate).not.toHaveBeenCalled();
			expect(mockRemove).not.toHaveBeenCalled();
		});

		it("should handle elements without matching layers", async () => {
			const mockAdd = vi.fn().mockResolvedValue(undefined);

			vi.mocked(useAddScenarioLine).mockReturnValue({
				add: mockAdd,
				loading: false,
				error: null,
			});

			mockExport.mockReturnValue([
				{
					id: "1",
					name: "Test Line",
					layer_id: "nonexistent-layer",
				},
			]);

			render(<Camera />);

			const onSave = vi.mocked(Lines).mock.calls[0][0].onSave;

			const elements: DrawingElement[] = [
				{
					id: "1",
					type: "line",
					points: [],
					syncState: "new",
					layerId: "nonexistent-layer",
					color: "#000000",
					completed: true,
					info: {
						name: "Test Line",
						distance: 100,
						direction: "right",
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
					detection: {
						entry: [],
						exit: [],
					},
				},
			];

			const layers: LayerInfo[] = [
				{
					id: "layer1",
					name: "Layer 1",
					description: "Test Layer",
					category: ["vehicle1"],
					visibility: "visible",
					opacity: 1,
					zIndex: 0,
					elementIds: [],
					createdAt: Date.now(),
					updatedAt: Date.now(),
					type: "DETECTION",
				},
			];

			await onSave?.(elements, layers);

			await waitFor(() => {
				expect(mockAdd).toHaveBeenCalledWith([]);
			});
		});
	});

	describe("Load Elements Handler", () => {
		it("should load and import server lines", async () => {
			// Partial mock of SourceLine - includes minimal required fields for load test
			const mockServerLines = [
				{
					id: "1",
					scenery: {
						name: "Test Line",
						description: "Test Description",
						type: "DETECTION",
						active: true,
						coordinates: [
							[0, 0],
							[100, 100],
						],
					},
					visual_coordinates: {
						layer_id: "layer1",
						type: "line",
						coordinates: [
							[0, 0],
							[100, 100],
						],
					},
					layer: {
						id: "layer1",
						name: "Layer 1",
						description: "Test Layer",
						category: ["vehicle1"],
					},
				} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
			];

			vi.mocked(useGetScenarioLines).mockReturnValue({
				data: mockServerLines,
				loading: false,
				refetch: vi.fn(),
				error: null,
			});

			const mockImportResult = {
				elements: [
					{
						id: "1",
						type: "line" as const,
						points: [
							{ x: 0, y: 0 },
							{ x: 100, y: 100 },
						],
						syncState: "saved" as const,
						layerId: "layer1",
						color: "#000000",
						completed: true,
						info: {
							name: "Test Line",
							description: "Test Description",
							distance: 100,
							direction: "right",
							fontSize: 12,
							fontFamily: "Arial",
							backgroundOpacity: 0.8,
						},
						detection: {
							entry: [{ x: 0, y: 0 }],
							exit: [{ x: 100, y: 100 }],
						},
					},
				],
				layers: new Map([
					[
						"layer1",
						{
							id: "layer1",
							name: "Layer 1",
							description: "Test Layer",
							category: ["vehicle1"],
							color: "#000000",
							visibility: "visible" as const,
							opacity: 1,
							zIndex: 0,
							elementIds: [],
							createdAt: Date.now(),
							updatedAt: Date.now(),
							type: "DETECTION" as const,
						},
					],
				]),
			};

			mockImport.mockReturnValue(mockImportResult);

			render(<Camera />);

			const onLoad = vi.mocked(Lines).mock.calls[0][0].onLoad;

			const result = await onLoad?.();

			expect(mockImport).toHaveBeenCalledWith(mockServerLines);
			expect(result).toEqual(mockImportResult);
		});

		it("should handle empty server lines", async () => {
			vi.mocked(useGetScenarioLines).mockReturnValue({
				data: [],
				loading: false,
				refetch: vi.fn(),
				error: null,
			});

			mockImport.mockReturnValue({
				elements: [],
				layers: new Map(),
			});

			render(<Camera />);

			const onLoad = vi.mocked(Lines).mock.calls[0][0].onLoad;

			const result = await onLoad?.();

			expect(mockImport).toHaveBeenCalledWith([]);
			expect(result?.elements).toEqual([]);
			expect(result?.layers).toBeInstanceOf(Map);
		});
	});

	describe("Error Handling", () => {
		it("should handle errors in add operation", async () => {
			const mockAdd = vi.fn().mockRejectedValue(new Error("Add failed"));
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
				//
			});

			vi.mocked(useAddScenarioLine).mockReturnValue({
				add: mockAdd,
				loading: false,
				error: null,
			});

			mockExport.mockReturnValue([
				{
					id: "1",
					name: "Test Line",
					layer_id: "layer1",
				},
			]);

			render(<Camera />);

			const onSave = vi.mocked(Lines).mock.calls[0][0].onSave;

			const elements: DrawingElement[] = [
				{
					id: "1",
					type: "line",
					points: [],
					syncState: "new",
					layerId: "layer1",
					color: "#000000",
					completed: true,
					info: {
						name: "Test Line",
						distance: 100,
						direction: "right",
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
					detection: {
						entry: [],
						exit: [],
					},
				},
			];

			const layers: LayerInfo[] = [
				{
					id: "layer1",
					name: "Layer 1",
					description: "Test Layer",
					category: ["vehicle1"],
					visibility: "visible",
					opacity: 1,
					zIndex: 0,
					elementIds: [],
					createdAt: Date.now(),
					updatedAt: Date.now(),
					type: "DETECTION",
				},
			];

			await expect(onSave?.(elements, layers)).rejects.toThrow("Add failed");

			consoleErrorSpy.mockRestore();
		});

		it("should handle errors in update operation", async () => {
			const mockUpdate = vi.fn().mockRejectedValue(new Error("Update failed"));
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
				//
			});

			vi.mocked(useUpdateScenarioLine).mockReturnValue({
				update: mockUpdate,
				loading: false,
				error: null,
			});

			vi.mocked(useGetScenarioLines).mockReturnValue({
				// Minimal SourceLine mock for error testing
				data: [{ id: "1" } as any], // eslint-disable-line @typescript-eslint/no-explicit-any
				loading: false,
				refetch: vi.fn(),
				error: null,
			});

			mockExport.mockReturnValue([
				{
					id: "1",
					name: "Updated Line",
					layer_id: "layer1",
				},
			]);

			render(<Camera />);

			const onSave = vi.mocked(Lines).mock.calls[0][0].onSave;

			const elements: DrawingElement[] = [
				{
					id: "1",
					type: "line",
					points: [],
					syncState: "edited",
					layerId: "layer1",
					color: "#000000",
					completed: true,
					info: {
						name: "Updated Line",
						distance: 100,
						direction: "right",
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
					detection: {
						entry: [],
						exit: [],
					},
				},
			];

			const layers: LayerInfo[] = [
				{
					id: "layer1",
					name: "Layer 1",
					description: "Test Layer",
					category: ["vehicle1"],
					visibility: "visible",
					opacity: 1,
					zIndex: 0,
					elementIds: [],
					createdAt: Date.now(),
					updatedAt: Date.now(),
					type: "DETECTION",
				},
			];

			await expect(onSave?.(elements, layers)).rejects.toThrow("Update failed");

			consoleErrorSpy.mockRestore();
		});

		it("should handle errors in remove operation", async () => {
			const mockRemove = vi.fn().mockRejectedValue(new Error("Remove failed"));
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
				//
			});

			vi.mocked(useRemoveScenarioLine).mockReturnValue({
				remove: mockRemove,
				loading: false,
				error: null,
			});

			vi.mocked(useGetScenarioLines).mockReturnValue({
				// Minimal SourceLine mock for error testing
				data: [{ id: "1" } as any], // eslint-disable-line @typescript-eslint/no-explicit-any
				loading: false,
				refetch: vi.fn(),
				error: null,
			});

			render(<Camera />);

			const onSave = vi.mocked(Lines).mock.calls[0][0].onSave;

			const elements: DrawingElement[] = [
				{
					id: "1",
					type: "line",
					points: [],
					syncState: "deleted",
					layerId: "layer1",
					color: "#000000",
					completed: true,
					info: {
						name: "Line to delete",
						distance: 100,
						direction: "right",
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
					detection: {
						entry: [],
						exit: [],
					},
				},
			];

			const layers: LayerInfo[] = [];

			await expect(onSave?.(elements, layers)).rejects.toThrow("Remove failed");

			consoleErrorSpy.mockRestore();
		});
	});

	describe("Integration with DrawingBridge", () => {
		it("should correctly export elements through bridge", async () => {
			const mockAdd = vi.fn().mockResolvedValue(undefined);

			vi.mocked(useAddScenarioLine).mockReturnValue({
				add: mockAdd,
				loading: false,
				error: null,
			});

			mockExport.mockReturnValue([
				{
					id: "1",
					name: "Test Line",
					description: "Test Description",
					coordinates: [
						[0, 0],
						[100, 100],
					],
					maps_coordinates: [19.3048720286, -99.05621509437437],
					location: "zone 1",
					visibility: true,
					allowed_directions: "ANY",
					layer_id: "layer1",
				},
			]);

			render(<Camera />);

			const onSave = vi.mocked(Lines).mock.calls[0][0].onSave;

			const elements: DrawingElement[] = [
				{
					id: "1",
					type: "line",
					points: [
						{ x: 0, y: 0 },
						{ x: 100, y: 100 },
					],
					syncState: "new",
					layerId: "layer1",
					color: "#000000",
					completed: true,
					info: {
						name: "Test Line",
						description: "Test Description",
						distance: 100,
						direction: "right",
						fontSize: 12,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
					detection: {
						entry: [],
						exit: [],
					},
				},
			];

			const layers: LayerInfo[] = [
				{
					id: "layer1",
					name: "Layer 1",
					description: "Test Layer",
					category: ["vehicle1"],
					visibility: "visible",
					opacity: 1,
					zIndex: 0,
					elementIds: [],
					createdAt: Date.now(),
					updatedAt: Date.now(),
					type: "DETECTION",
				},
			];

			await onSave?.(elements, layers);

			await waitFor(() => {
				expect(mockExport).toHaveBeenCalledWith(elements);
				const exportedData = mockExport.mock.results[0].value;
				expect(exportedData[0]).toMatchObject({
					coordinates: expect.arrayContaining([
						[0, 0],
						[100, 100],
					]),
					maps_coordinates: expect.any(Array),
					location: expect.any(String),
					visibility: expect.any(Boolean),
					allowed_directions: expect.any(String),
				});
			});
		});

		it("should correctly import elements through bridge", async () => {
			// Partial mock of SourceLine for bridge import integration test
			const mockServerLines = [
				{
					id: "1",
					scenery: {
						name: "Test Line",
						color: [255, 0, 0],
						active: true,
						coordinates: [
							[0, 0],
							[100, 100],
						],
					},
					visual_coordinates: {
						layer_id: "layer1",
						type: "line",
						coordinates: [
							[0, 0],
							[100, 100],
						],
					},
				} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
			];

			vi.mocked(useGetScenarioLines).mockReturnValue({
				data: mockServerLines,
				loading: false,
				refetch: vi.fn(),
				error: null,
			});

			mockImport.mockReturnValue({
				elements: [
					{
						id: "1",
						type: "line",
						points: [
							{ x: 0, y: 0 },
							{ x: 100, y: 100 },
						],
						completed: true,
						syncState: "saved",
						layerId: "layer1",
						color: "#ff0000",
						info: {
							name: "Test Line",
							distance: 100,
							direction: "right",
							fontSize: 12,
							fontFamily: "Arial",
							backgroundOpacity: 0.8,
						},
						detection: {
							entry: [],
							exit: [],
						},
					},
				],
				layers: new Map(),
			});

			render(<Camera />);

			const onLoad = vi.mocked(Lines).mock.calls[0][0].onLoad;

			const result = await onLoad?.();

			expect(mockImport).toHaveBeenCalledWith(mockServerLines);
			expect(result?.elements[0]).toMatchObject({
				id: "1",
				type: "line",
				points: expect.arrayContaining([
					{ x: 0, y: 0 },
					{ x: 100, y: 100 },
				]),
				completed: true,
				syncState: "saved",
			});
		});
	});

	describe("Performance and Optimization", () => {
		it("should not re-render unnecessarily", () => {
			const { rerender } = render(<Camera />);
			const initialCallCount = vi.mocked(Lines).mock.calls.length;

			rerender(<Camera />);

			// Should have rendered twice (initial + rerender)
			expect(vi.mocked(Lines).mock.calls.length).toBe(initialCallCount + 1);
		});

		it("should handle large datasets efficiently", async () => {
			// Partial mocks of SourceLine for performance testing with 100 items
			const largeDataset = Array.from(
				{ length: 100 },
				(_, i) =>
					({
						id: `${i}`,
						scenery: {
							name: `Line ${i}`,
							coordinates: [
								[i, i],
								[i + 10, i + 10],
							],
						},
						visual_coordinates: {
							layer_id: `layer${i % 5}`,
							type: "line",
							coordinates: [
								[i, i],
								[i + 10, i + 10],
							],
						},
					}) as any // eslint-disable-line @typescript-eslint/no-explicit-any
			);

			vi.mocked(useGetScenarioLines).mockReturnValue({
				data: largeDataset,
				loading: false,
				refetch: vi.fn(),
				error: null,
			});

			mockImport.mockReturnValue({
				elements: [],
				layers: new Map(),
			});

			render(<Camera />);

			const onLoad = vi.mocked(Lines).mock.calls[0][0].onLoad;
			const result = await onLoad?.();

			expect(mockImport).toHaveBeenCalledWith(largeDataset);
			expect(result).toBeDefined();
		});
	});
});
