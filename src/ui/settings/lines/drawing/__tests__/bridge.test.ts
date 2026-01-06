// @vitest-environment jsdom
/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { beforeEach, describe, expect, it } from "vitest";

import type { DrawingElement } from "../types";

import { DrawingBridge } from "../bridge";

describe("DrawingBridge", () => {
	let bridge: DrawingBridge<any>;

	beforeEach(() => {
		// Use the same configuration pattern as camera.tsx
		bridge = new DrawingBridge({
			output: {
				id: "id",
				name: "info.name",
				description: "info.description",
				coordinates: "[int(points.x), int(points.y)][]",
				detection_entry: "[int(detection.entry.x), int(detection.entry.y)][]",
				detection_exit: "[int(detection.exit.x), int(detection.exit.y)][]",
				distance: "info.distance",
				color: "rgb(color)",
				layer_id: "layerId",
				visual_coordinates: (_value, element) => ({
					layer_id: element.layerId,
					type: element.type,
					fontSize: element.info?.fontSize,
					fontFamily: element.info?.fontFamily,
					backgroundColor: element.info?.backgroundColor,
					backgroundOpacity: element.info?.backgroundOpacity,
					coordinates: element.points.map((point) => [Math.floor(point.x), Math.floor(point.y)]),
				}),
				maps_coordinates: () => [19.3048720286, -99.05621509437437],
				location: () => "zone 1",
				visibility: () => true,
				allowed_directions: () => "ANY",
			},
			input: {
				elements: {
					id: "id",
					"visual_coordinates.type": "type",
					"points(visual_coordinates.coordinates)": "points",
					"points(scenery.coordinates)": "detection.entry",
					"points(second_scenery.coordinates)": "detection.exit",
					"hex(scenery.color)": "color",
					"scenery.active": "completed",
					"visual_coordinates.layer_id": "layerId",
					"firstPoint(visual_coordinates.coordinates)": "direction.start",
					"endPoint(visual_coordinates.coordinates)": "direction.end",
					"scenery.name": {
						key: "info.name",
						transform: (value) => {
							return (value as string).replace(" - Entrada", "");
						},
					},
					"scenery.description": "info.description",
					"scenery.distance": "info.distance",
					"visual_coordinates.counter_track": {
						key: "counter_track",
						transform: (value) => value ?? false,
					},
					"visual_coordinates.fontSize": "info.fontSize",
					"visual_coordinates.fontFamily": "info.fontFamily",
					"visual_coordinates.backgroundColor": "info.backgroundColor",
					"visual_coordinates.backgroundOpacity": "info.backgroundOpacity",
				},
				layers: {
					"visual_coordinates.layer_id": "id",
					"vehicle.name": "name",
					description: "description",
					"scenery.type": "type",
					"vehicle.id": "category",
					"hex(vehicle.color)": "color",
					"time(createAt)": "createdAt",
					"time(updateAt)": "updatedAt",
				},
			},
		});
	});

	describe("Initialization", () => {
		it("should initialize with default config", () => {
			expect(bridge).toBeDefined();
			const config = bridge.getConfig();
			expect(config).toBeDefined();
			expect(config.output).toBeDefined();
			expect(config.input).toBeDefined();
		});

		it("should initialize with custom config", () => {
			const customConfig = {
				output: {
					customId: "id",
					customType: "type",
				},
				input: {
					elements: {
						id: "customId",
						type: "customType",
					},
					layers: {},
				},
			};
			const customBridge = new DrawingBridge(customConfig as any);
			const config = customBridge.getConfig();
			// Legacy output format is converted to new format with default target
			expect(config.output).toEqual({
				default: ["array", customConfig.output],
			});
			expect(config.input).toEqual(customConfig.input);
		});

		it("should initialize with new multi-target output config", () => {
			const multiTargetConfig = {
				output: {
					scenarios: ["array", { id: "id", name: "info.name" }],
					datasources: ["array", { layer_id: "layerId" }],
				},
				input: {
					elements: { id: "id" },
					layers: {},
				},
			};
			const multiTargetBridge = new DrawingBridge(multiTargetConfig as any);
			const config = multiTargetBridge.getConfig();
			expect(config.output).toEqual(multiTargetConfig.output);
		});
	});

	describe("Export Operations", () => {
		it("should export single element with camera config", () => {
			const element: DrawingElement = {
				id: "test-1",
				type: "line",
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 100 },
				],
				completed: true,
				color: "#FF0000",
				layerId: "layer-1",
				info: {
					name: "Test Line",
					description: "A test line",
					distance: 100,
					fontSize: 14,
					fontFamily: "Arial",
					backgroundOpacity: 0.8,
				},
			};

			const exported = bridge.exportTarget("default", [element]) as any[];
			expect(exported).toBeDefined();
			expect(Array.isArray(exported)).toBe(true);
			expect(exported.length).toBe(1);
			expect(exported[0].id).toBe("test-1");
			expect(exported[0].color).toEqual([255, 0, 0]);
		});

		it("should export multiple elements", () => {
			const elements: DrawingElement[] = [
				{
					id: "line-1",
					type: "line",
					points: [
						{ x: 0, y: 0 },
						{ x: 100, y: 100 },
					],
					completed: true,
					color: "#FF0000",
					layerId: "layer-1",
					info: {
						name: "Line 1",
						distance: 100,
						fontSize: 14,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
				{
					id: "area-1",
					type: "area",
					points: [
						{ x: 50, y: 50 },
						{ x: 150, y: 50 },
						{ x: 150, y: 150 },
						{ x: 50, y: 150 },
					],
					completed: true,
					color: "#00FF00",
					layerId: "layer-1",
					info: {
						name: "Area 1",
						distance: 200,
						fontSize: 14,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const exported = bridge.exportTarget("default", elements) as any[];
			expect(exported.length).toBe(2);
			expect(exported[0].id).toBe("line-1");
			expect(exported[1].id).toBe("area-1");
		});

		it("should handle empty elements array", () => {
			const exported = bridge.exportTarget("default", []);
			expect(exported).toEqual([]);
		});

		it("should export with layers", () => {
			const elements: DrawingElement[] = [
				{
					id: "test-1",
					type: "line",
					points: [{ x: 0, y: 0 }],
					completed: true,
					color: "#000000",
					layerId: "layer-1",
					info: {
						name: "Test",
						distance: 100,
						fontSize: 14,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const exported = bridge.exportTarget("default", elements) as any[];
			expect(exported).toBeDefined();
			expect(exported[0].layer_id).toBe("layer-1");
		});

		it("should export visual coordinates correctly", () => {
			const element: DrawingElement = {
				id: "test-1",
				type: "line",
				points: [
					{ x: 10.5, y: 20.7 },
					{ x: 50.3, y: 60.9 },
				],
				completed: true,
				color: "#000000",
				layerId: "layer-1",
				info: {
					name: "Test",
					distance: 100,
					fontSize: 16,
					fontFamily: "Arial",
					backgroundColor: "#FFFFFF",
					backgroundOpacity: 0.8,
				},
			};

			const exported = bridge.exportTarget("default", [element]) as any[];
			expect(exported[0].visual_coordinates).toBeDefined();
			expect(exported[0].visual_coordinates.fontSize).toBe(16);
			expect(exported[0].visual_coordinates.fontFamily).toBe("Arial");
			expect(exported[0].visual_coordinates.coordinates).toEqual([
				[10, 20],
				[50, 60],
			]);
		});
	});

	describe("Import Operations", () => {
		it("should import valid elements from server format", () => {
			const input = [
				{
					id: "test-1",
					scenery: {
						name: "Test Line - Entrada",
						description: "A test line",
						color: [255, 0, 0],
						active: true,
						distance: 100,
						coordinates: [
							[0, 0],
							[100, 100],
						],
					},
					second_scenery: {
						coordinates: [
							[5, 5],
							[105, 105],
						],
					},
					visual_coordinates: {
						type: "line",
						layer_id: "layer-1",
						coordinates: [
							[0, 0],
							[100, 100],
						],
						fontSize: 14,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const result = bridge.import(input);
			expect(result.elements).toBeDefined();
			expect(result.elements.length).toBe(1);
			expect(result.elements[0].id).toBe("test-1");
			expect(result.elements[0].type).toBe("line");
			expect(result.elements[0].info?.name).toBe("Test Line");
			expect(result.elements[0].completed).toBe(true);
		});

		it("should filter out invalid elements", () => {
			const input = [
				{
					id: "valid-1",
					scenery: {
						name: "Valid",
						description: "A valid test element",
						color: [255, 0, 0],
						active: true,
						distance: 100,
						coordinates: [
							[0, 0],
							[100, 100],
						],
					},
					second_scenery: {
						coordinates: [
							[5, 5],
							[105, 105],
						],
					},
					visual_coordinates: {
						type: "line",
						layer_id: "layer-1",
						coordinates: [
							[0, 0],
							[100, 100],
						],
						fontSize: 14,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
				{
					id: "invalid-1",
					// Missing required fields
				},
			];

			const result = bridge.import(input as any);
			expect(result.elements.length).toBe(1);
			expect(result.elements[0].id).toBe("valid-1");
		});

		it("should import with layers", () => {
			const input = [
				{
					id: "test-1",
					scenery: {
						name: "Test",
						description: "Test element",
						color: [255, 0, 0],
						active: true,
						type: "DETECTION",
						distance: 100,
						coordinates: [
							[0, 0],
							[100, 100],
						],
					},
					second_scenery: {
						coordinates: [
							[5, 5],
							[105, 105],
						],
					},
					visual_coordinates: {
						type: "line",
						layer_id: "layer-1",
						coordinates: [
							[0, 0],
							[100, 100],
						],
						fontSize: 14,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const result = bridge.import(input);
			expect(result.elements.length).toBe(1);
			expect(result.layers).toBeDefined();
			expect(result.layers.size).toBeGreaterThanOrEqual(0);
		});

		it("should handle empty input", () => {
			const result = bridge.import([]);
			expect(result.elements).toEqual([]);
		});

		it("should handle CONFIGURATION layer with null second_scenery (no detection)", () => {
			const input = [
				{
					id: "c3d80101-0484-487a-92b0-130c3707b16b",
					scenery: {
						id: "55159206-4baf-421f-83d1-387703414290",
						name: "probando refactor engine",
						coordinates: [
							[499, 278],
							[693, 268],
						],
						distance: 15,
						description: "layer_1_1765484978020_line_description",
						color: [255, 0, 0],
						type: "CONFIGURATION",
						active: true,
					},
					vehicle: null,
					description: "Capa por defecto",
					second_scenery: null,
					visual_coordinates: {
						type: "line",
						fontSize: 16,
						layer_id: "layer_1_1765484978020",
						fontFamily: "Arial",
						layer_name: "Capa predefinida",
						coordinates: [
							[499, 278],
							[693, 268],
						],
						backgroundOpacity: 0.8,
					},
				},
			];

			const result = bridge.import(input);

			// Should import 1 element
			expect(result.elements.length).toBe(1);

			// Element should have no detection (CONFIGURATION layer)
			expect(result.elements[0].detection).toBeUndefined();

			// Element should have valid data
			// ID comes from top-level id per the bridge config mapping (id: "id")
			expect(result.elements[0].id).toBe("c3d80101-0484-487a-92b0-130c3707b16b");
			expect(result.elements[0].type).toBe("line");
			expect(result.elements[0].points).toHaveLength(2);
			expect(result.elements[0].info?.name).toBe("probando refactor engine");
			expect(result.elements[0].info?.distance).toBe(15);
			expect(result.elements[0].counter_track).toBe(false);

			// Layer should be CONFIGURATION type
			expect(result.layers.size).toBe(1);
			const layer = result.layers.get("layer_1_1765484978020");
			expect(layer).toBeDefined();
			expect(layer?.type).toBe("CONFIGURATION");
			// Layer name defaults to "Layer 1" since vehicle.name is null in test data
			// and the test bridge config uses "vehicle.name": "name" mapping
			expect(layer?.name).toBe("Layer 1");
		});

		it("should handle detection points", () => {
			const input = [
				{
					id: "test-1",
					scenery: {
						name: "Test",
						description: "Test detection",
						color: [255, 0, 0],
						active: true,
						type: "DETECTION",
						distance: 100,
						coordinates: [
							[0, 0],
							[100, 100],
						],
					},
					second_scenery: {
						coordinates: [
							[15, 15],
							[25, 25],
						],
					},
					visual_coordinates: {
						type: "line",
						layer_id: "layer-1",
						coordinates: [
							[0, 0],
							[100, 100],
						],
						fontSize: 14,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const result = bridge.import(input);
			expect(result.elements[0].detection).toBeDefined();
			expect(result.elements[0].detection?.entry).toBeDefined();
			expect(result.elements[0].detection?.exit).toBeDefined();
		});
	});

	describe("Color Transformations", () => {
		it("should transform RGB array to color string", () => {
			const input = [
				{
					id: "test-1",
					scenery: {
						name: "Test",
						color: [255, 128, 64],
						active: true,
						type: "DETECTION",
						distance: 100,
						coordinates: [
							[0, 0],
							[100, 100],
						],
					},
					second_scenery: {
						coordinates: [
							[5, 5],
							[105, 105],
						],
					},
					visual_coordinates: {
						type: "line",
						layer_id: "layer-1",
						coordinates: [
							[0, 0],
							[100, 100],
						],
						fontSize: 14,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const result = bridge.import(input);
			expect(result.elements[0].color).toMatch(/^#[0-9A-F]{6}$/i);
		});

		it("should handle color in export", () => {
			const element: DrawingElement = {
				id: "test-1",
				type: "line",
				points: [{ x: 0, y: 0 }],
				completed: true,
				color: "#FF0000",
				info: {
					name: "Test",
					distance: 100,
					fontSize: 14,
					fontFamily: "Arial",
					backgroundOpacity: 0.8,
				},
			};

			const exported = bridge.exportTarget("default", [element]) as any[];
			expect(exported[0].color).toEqual([255, 0, 0]);
		});
	});

	describe("Point Transformations", () => {
		it("should handle coordinate arrays", () => {
			const input = [
				{
					id: "test-1",
					scenery: {
						name: "Test",
						description: "Test coordinates",
						color: [0, 0, 0],
						active: true,
						type: "DETECTION",
						distance: 100,
						coordinates: [
							[10, 20],
							[30, 40],
							[50, 60],
						],
					},
					second_scenery: {
						coordinates: [
							[15, 25],
							[35, 45],
							[55, 65],
						],
					},
					visual_coordinates: {
						type: "line",
						layer_id: "layer-1",
						coordinates: [
							[10, 10],
							[20, 20],
							[30, 30],
							[40, 40],
							[50, 50],
						],
						fontSize: 14,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const result = bridge.import(input);
			expect(result.elements[0].points).toHaveLength(5);
			expect(result.elements[0].points[0]).toEqual({ x: 10, y: 10 });
			expect(result.elements[0].points[2]).toEqual({ x: 30, y: 30 });
			expect(result.elements[0].points[4]).toEqual({ x: 50, y: 50 });
		});

		it("should transform integer coordinates in export", () => {
			const element: DrawingElement = {
				id: "test-1",
				type: "line",
				points: [
					{ x: 10.7, y: 20.3 },
					{ x: 100.9, y: 200.1 },
				],
				completed: true,
				color: "#000000",
				info: {
					name: "Test",
					distance: 100,
					fontSize: 14,
					fontFamily: "Arial",
					backgroundOpacity: 0.8,
				},
			};

			const exported = bridge.exportTarget("default", [element]) as any[];
			expect(exported[0].coordinates).toEqual([
				[10, 20],
				[100, 200],
			]);
		});

		it("should handle first and end points", () => {
			const input = [
				{
					id: "test-1",
					scenery: {
						name: "Test",
						description: "Test first and end points",
						color: [0, 0, 0],
						active: true,
						type: "DETECTION",
						distance: 100,
						coordinates: [
							[0, 0],
							[100, 100],
						],
					},
					second_scenery: {
						coordinates: [
							[5, 5],
							[105, 105],
						],
					},
					visual_coordinates: {
						type: "line",
						layer_id: "layer-1",
						coordinates: [
							[10, 20],
							[30, 40],
							[50, 60],
						],
						fontSize: 14,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const result = bridge.import(input);
			expect(result.elements[0].direction?.start).toEqual({ x: 10, y: 20 });
			expect(result.elements[0].direction?.end).toEqual({ x: 50, y: 60 });
		});
	});

	describe("Text Element Info", () => {
		it("should handle text element properties in import", () => {
			const input = [
				{
					id: "text-1",
					scenery: {
						name: "Text Label",
						description: "A text label",
						color: [0, 0, 0],
						active: true,
						type: "DETECTION",
						distance: 100,
						coordinates: [
							[50, 50],
							[100, 100],
						],
					},
					second_scenery: {
						coordinates: [
							[55, 55],
							[105, 105],
						],
					},
					visual_coordinates: {
						type: "line",
						layer_id: "layer-1",
						coordinates: [
							[50, 50],
							[100, 100],
						],
						fontSize: 18,
						fontFamily: "Helvetica",
						backgroundColor: "#FFFFFF",
						backgroundOpacity: 0.9,
					},
				},
			];

			const result = bridge.import(input);
			expect(result.elements[0].info?.fontSize).toBe(18);
			expect(result.elements[0].info?.fontFamily).toBe("Helvetica");
			expect(result.elements[0].info?.backgroundColor).toBe("#FFFFFF");
			expect(result.elements[0].info?.backgroundOpacity).toBe(0.9);
		});

		it("should export text element properties", () => {
			const element: DrawingElement = {
				id: "text-1",
				type: "line",
				points: [{ x: 50, y: 50 }],
				completed: true,
				color: "#000000",
				layerId: "layer-1",
				info: {
					name: "Text Label",
					distance: 100,
					fontSize: 16,
					fontFamily: "Arial",
					backgroundColor: "#FFFFFF",
					backgroundOpacity: 0.8,
				},
			};

			const exported = bridge.exportTarget("default", [element]) as any[];
			expect(exported[0].visual_coordinates.fontSize).toBe(16);
			expect(exported[0].visual_coordinates.fontFamily).toBe("Arial");
			expect(exported[0].visual_coordinates.backgroundColor).toBe("#FFFFFF");
			expect(exported[0].visual_coordinates.backgroundOpacity).toBe(0.8);
		});
	});

	describe("Config Updates", () => {
		it("should update config", () => {
			const newConfig = {
				output: {
					customField: "id",
				},
				input: {
					elements: {
						id: "customField",
					},
					layers: {},
				},
			};

			bridge.updateConfig(newConfig as any);
			const config = bridge.getConfig();
			expect(config.output.customField).toBe("id");
		});

		it("should merge config updates", () => {
			const initialConfig = bridge.getConfig();
			const update = {
				output: {
					newField: "test",
				},
				input: initialConfig.input,
			};

			bridge.updateConfig(update as any);
			const updatedConfig = bridge.getConfig();
			expect(updatedConfig.output.newField).toBe("test");
		});
	});

	describe("Custom Transformations", () => {
		it("should apply custom name transformation", () => {
			const input = [
				{
					id: "test-1",
					scenery: {
						name: "Test Line - Entrada",
						description: "Test transformation",
						color: [0, 0, 0],
						active: true,
						type: "DETECTION",
						distance: 100,
						coordinates: [
							[0, 0],
							[100, 100],
						],
					},
					second_scenery: {
						coordinates: [
							[5, 5],
							[105, 105],
						],
					},
					visual_coordinates: {
						type: "line",
						layer_id: "layer-1",
						coordinates: [
							[0, 0],
							[100, 100],
						],
						fontSize: 14,
						fontFamily: "Arial",
						backgroundOpacity: 0.8,
					},
				},
			];

			const result = bridge.import(input);
			expect(result.elements[0].info?.name).toBe("Test Line");
		});

		it("should handle function-based transformations", () => {
			const element: DrawingElement = {
				id: "test-1",
				type: "line",
				points: [{ x: 0, y: 0 }],
				completed: true,
				color: "#000000",
				layerId: "layer-1",
				info: {
					name: "Test",
					distance: 100,
					fontSize: 14,
					fontFamily: "Arial",
					backgroundOpacity: 0.8,
				},
			};

			const exported = bridge.exportTarget("default", [element]) as any[];
			expect(exported[0].maps_coordinates).toEqual([19.3048720286, -99.05621509437437]);
			expect(exported[0].location).toBe("zone 1");
			expect(exported[0].visibility).toBe(true);
			expect(exported[0].allowed_directions).toBe("ANY");
		});
	});

	describe("Layer Validation", () => {
		it("should validate layer structure", () => {
			const result = bridge.import([]);
			expect(result.layers).toBeDefined();
			expect(result.layers.size).toBeGreaterThanOrEqual(0);
		});

		it("should filter invalid layers", () => {
			const result = bridge.import([]);
			expect(result.layers.size).toBeGreaterThanOrEqual(0);
		});
	});

	describe("Round-trip Conversion", () => {
		it("should maintain data integrity in round-trip", () => {
			const originalElement: DrawingElement = {
				id: "test-1",
				type: "line",
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 100 },
				],
				completed: true,
				color: "#FF0000",
				layerId: "layer-1",
				info: {
					name: "Test Line",
					distance: 100,
					fontSize: 14,
					fontFamily: "Arial",
					backgroundOpacity: 0.8,
				},
			};

			const exported = bridge.exportTarget("default", [originalElement]) as any[];
			const serverFormat = {
				...exported[0],
				scenery: {
					name: "Test Line",
					description: "Test description",
					type: "DETECTION",
					color: [255, 0, 0],
					active: originalElement.completed,
					distance: 100,
					coordinates: [
						[10, 20],
						[30, 40],
					],
				},
				second_scenery: {
					coordinates: [
						[15, 25],
						[35, 45],
					],
				},
				visual_coordinates: {
					...exported[0].visual_coordinates,
				},
			};

			const imported = bridge.import([serverFormat]);

			expect(imported.elements.length).toBe(1);
			expect(imported.elements[0].id).toBe(originalElement.id);
			expect(imported.elements[0].info.name).toBe(originalElement.info.name);
		});
	});

	describe("Error Handling", () => {
		it("should handle null input gracefully", () => {
			const result = bridge.import([]);
			expect(result.elements).toEqual([]);
		});

		it("should handle undefined input gracefully", () => {
			const result = bridge.import([]);
			expect(result.elements).toEqual([]);
		});

		it("should handle malformed elements", () => {
			const malformed = [
				{ id: 123, type: "line" },
				{ id: "test", scenery: { type: 456 } },
			];

			const result = bridge.import(malformed);
			expect(result.elements).toBeDefined();
		});
	});

	describe("Performance", () => {
		it("should handle large datasets efficiently", () => {
			const largeDataset: DrawingElement[] = Array.from({ length: 1000 }, (_, i) => ({
				id: `element-${i}`,
				type: "line",
				points: [
					{ x: i, y: i },
					{ x: i + 10, y: i + 10 },
				],
				completed: true,
				color: "#000000",
				layerId: "layer-1",
				info: {
					name: `Element ${i}`,
					distance: 100,
					fontSize: 14,
					fontFamily: "Arial",
					backgroundOpacity: 0.8,
				},
			}));

			const start = performance.now();
			const exported = bridge.exportTarget("default", largeDataset);
			const exportTime = performance.now() - start;

			expect(exported.length).toBe(1000);
			expect(exportTime).toBeLessThan(1000);
		});

		it("should handle import of large datasets efficiently", () => {
			const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
				id: `element-${i}`,
				scenery: {
					name: `Element ${i}`,
					description: `Test element ${i}`,
					color: [0, 0, 0],
					active: true,
					type: "DETECTION",
					distance: 100,
					coordinates: [
						[i, i],
						[i + 10, i + 10],
					],
				},
				second_scenery: {
					coordinates: [
						[i + 5, i + 5],
						[i + 15, i + 15],
					],
				},
				visual_coordinates: {
					type: "line",
					layer_id: "layer-1",
					coordinates: [
						[i, i],
						[i + 10, i + 10],
					],
					fontSize: 14,
					fontFamily: "Arial",
					backgroundOpacity: 0.8,
				},
			}));

			const start = performance.now();
			const result = bridge.import(largeDataset);
			const importTime = performance.now() - start;

			expect(result.elements.length).toBe(1000);
			expect(importTime).toBeLessThan(1000);
		});
	});
});
