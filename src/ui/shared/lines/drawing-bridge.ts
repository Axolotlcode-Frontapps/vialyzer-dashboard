import type { DrawingElement, Point } from "./types";

/**
 * Configuration-based Drawing Bridge (Class-based implementation)
 *
 * Provides a flexible way to transform DrawingElement data into custom output formats
 * with configurable field mappings and transformation functions.
 */

// Transformation function type
export type TransformFunction<T = unknown> = (
	value: unknown,
	element: DrawingElement,
	elements?: DrawingElement[]
) => T;

// Scenario line interface for import
export interface ScenarioLineData {
	id?: string;
	name: string;
	description: string;
	coordinates: [number, number][];
	color: [number, number, number] | [number, number, number, number];
	location: string;
	active?: boolean;
	maps_coordinates?: [number, number];
}

// Field mapping configuration
export interface FieldMapping {
	[outputField: string]: string | TransformFunction;
}

// Bridge configuration
export interface BridgeConfig {
	output: {
		element: FieldMapping;
	};
	additionalInfo?: Record<string, unknown>;
}

// Bridge instance interface
export interface Bridge {
	export: (elements: DrawingElement[]) => Record<string, unknown>[];
	exportSingle: (element: DrawingElement) => Record<string, unknown>;
	import: (data: unknown[]) => DrawingElement[];
	importSingle: (data: unknown) => DrawingElement;
	updateConfig: (config: Partial<BridgeConfig>) => void;
	getConfig: () => BridgeConfig;
}

/**
 * Built-in transformation functions
 */
export const transformations = {
	// Color transformations
	rgb: (color: string): [number, number, number] => {
		// Convert hex to RGB format
		const hex = color.replace("#", "");
		const r = parseInt(hex.substr(0, 2), 16);
		const g = parseInt(hex.substr(2, 2), 16);
		const b = parseInt(hex.substr(4, 2), 16);
		return [r, g, b];
	},

	rgba: (
		color: string,
		alpha: number = 1
	): [number, number, number, number] => {
		const hex = color.replace("#", "");
		const r = parseInt(hex.substr(0, 2), 16);
		const g = parseInt(hex.substr(2, 2), 16);
		const b = parseInt(hex.substr(4, 2), 16);
		return [r, g, b, alpha];
	},

	// Number transformations
	int: (value: unknown): number => {
		if (typeof value === "number") return Math.floor(value);
		if (typeof value === "string") {
			const parsed = parseInt(value, 10);
			return Number.isNaN(parsed) ? 0 : parsed;
		}
		return 0;
	},

	float: (value: unknown): number => {
		if (typeof value === "number") return value;
		if (typeof value === "string") {
			const parsed = parseFloat(value);
			return Number.isNaN(parsed) ? 0.0 : parsed;
		}
		return 0.0;
	},

	// Coordinate transformations
	coordinatesArray: (points: Point[]): [number, number][] => {
		return points.map((point) => [point.x, point.y]);
	},

	firstPoint: (points: Point[]): [number, number] => {
		const first = points[0];
		return first ? [first.x, first.y] : [0, 0];
	},

	lastPoint: (points: Point[]): [number, number] => {
		const last = points[points.length - 1];
		return last ? [last.x, last.y] : [0, 0];
	},

	centerPoint: (points: Point[]): [number, number] => {
		if (points.length === 0) return [0, 0];
		const sumX = points.reduce((sum, p) => sum + p.x, 0);
		const sumY = points.reduce((sum, p) => sum + p.y, 0);
		return [sumX / points.length, sumY / points.length];
	},

	// Text transformations
	textLength: (text: string): number => text?.length || 0,

	upperCase: (text: string): string => text?.toUpperCase() || "",

	lowerCase: (text: string): string => text?.toLowerCase() || "",

	// Utility transformations
	timestamp: (): string => new Date().toISOString(),

	elementIndex: (
		_value: unknown,
		element: DrawingElement,
		elements?: DrawingElement[]
	): number => {
		if (elements) {
			return elements.indexOf(element);
		}
		return 0;
	},

	// Type-based transformations
	isCompleted: (element: DrawingElement): boolean => element.completed,

	pointCount: (points: Point[]): number => points.length,

	// ID transformations
	generateId: (element: DrawingElement): string => {
		return (
			element.id ||
			`element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		);
	},
};

/**
 * Reverse transformation functions for import
 */
export const reverseTransformations = {
	// Reverse color transformations
	rgb: (value: [number, number, number]): string => {
		if (!Array.isArray(value) || value.length < 3) return "#000000";
		const [r, g, b] = value;
		return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
	},

	rgba: (value: [number, number, number, number]): string => {
		if (!Array.isArray(value) || value.length < 3) return "#000000";
		const [r, g, b] = value;
		return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
	},

	// Reverse number transformations
	int: (value: number): number => {
		return typeof value === "number" ? Math.floor(value) : 0;
	},

	float: (value: number): number => {
		return typeof value === "number" ? value : 0.0;
	},

	// Reverse coordinate transformations
	coordinatesArray: (value: [number, number][]): Point[] => {
		if (!Array.isArray(value)) return [];
		return value.map(([x, y]) => ({ x: x || 0, y: y || 0 }));
	},

	firstPoint: (value: [number, number]): Point[] => {
		if (!Array.isArray(value) || value.length < 2) return [];
		return [{ x: value[0], y: value[1] }];
	},

	lastPoint: (value: [number, number]): Point[] => {
		if (!Array.isArray(value) || value.length < 2) return [];
		return [{ x: value[0], y: value[1] }];
	},

	centerPoint: (value: [number, number]): Point[] => {
		if (!Array.isArray(value) || value.length < 2) return [];
		return [{ x: value[0], y: value[1] }];
	},

	// Reverse text transformations
	textLength: (): string => {
		return ""; // Can't reverse text length to original text
	},

	upperCase: (value: string): string => {
		return typeof value === "string" ? value.toLowerCase() : "";
	},

	lowerCase: (value: string): string => {
		return typeof value === "string" ? value.toUpperCase() : "";
	},

	// Reverse utility transformations
	timestamp: (value: string): string => {
		return typeof value === "string" ? value : "";
	},

	pointCount: (): Point[] => {
		// Can't reverse point count to original points
		return [];
	},

	isCompleted: (value: boolean): boolean => {
		return Boolean(value);
	},

	generateId: (value: string): string => {
		return typeof value === "string" ? value : "";
	},
};

/**
 * Main Drawing Bridge class
 */
export class DrawingBridge implements Bridge {
	// Private fields using native # syntax
	#config: BridgeConfig;

	constructor(config: BridgeConfig) {
		this.#config = { ...config };
	}

	/**
	 * Export multiple drawing elements
	 */
	export<T>(elements: DrawingElement[]): T[] {
		return elements
			.filter((element) => element.completed) // Only export completed elements
			.map((element) => this.exportSingle(element)) as T[];
	}

	/**
	 * Export single drawing element
	 */
	exportSingle<T>(element: DrawingElement): T {
		const result: Record<string, unknown> = {};

		// Apply element field mappings
		for (const [outputField, mapping] of Object.entries(
			this.#config.output.element
		)) {
			try {
				result[outputField] = this.#resolveFieldValue(mapping, element);
			} catch (error) {
				console.warn(
					`Failed to resolve field mapping for ${outputField}:`,
					error
				);
				result[outputField] = null;
			}
		}

		// Add additional info
		if (this.#config.additionalInfo) {
			Object.assign(result, this.#config.additionalInfo);
		}

		return result as T;
	}

	/**
	 * Import multiple elements with automatic reverse transformation
	 */
	import(data: unknown[]): DrawingElement[] {
		return data.map((item) => this.importSingle(item));
	}

	/**
	 * Import single element with automatic reverse transformation
	 */
	importSingle(data: unknown): DrawingElement {
		const inputData = data as Record<string, unknown>;
		const element: Partial<DrawingElement> = {
			id: "",
			type: "line",
			points: [],
			color: "#000000",
			completed: true,
		};

		// Reverse apply field mappings
		for (const [outputField, mapping] of Object.entries(
			this.#config.output.element
		)) {
			const value = inputData[outputField];
			if (value !== undefined) {
				try {
					this.#reverseFieldMapping(mapping, value, element);
				} catch (error) {
					console.warn(
						`Failed to reverse field mapping for ${outputField}:`,
						error
					);
				}
			}
		}

		// Ensure required fields have default values
		const finalElement: DrawingElement = {
			id: element.id || `imported-${Date.now()}`,
			type: element.type || "line",
			points: element.points || [],
			color: element.color || "#000000",
			completed: element.completed ?? true,
			layerId: element.layerId,
			groupId: element.groupId,
			direction: element.direction,
			text: element.text || {
				content: "",
				fontSize: 16,
				fontFamily: "Arial",
				backgroundOpacity: 0.8,
			},
		};

		return finalElement;
	}

	/**
	 * Update bridge configuration
	 */
	updateConfig(newConfig: Partial<BridgeConfig>): void {
		this.#config = {
			...this.#config,
			...newConfig,
			output: {
				...this.#config.output,
				...newConfig.output,
				element: {
					...this.#config.output.element,
					...newConfig.output?.element,
				},
			},
		};
	}

	/**
	 * Get current configuration
	 */
	getConfig(): BridgeConfig {
		return { ...this.#config };
	}

	/**
	 * Parse and resolve field mapping value
	 */
	#resolveFieldValue(
		mapping: string | TransformFunction,
		element: DrawingElement,
		elements?: DrawingElement[]
	): unknown {
		// If it's a function, call it directly
		if (typeof mapping === "function") {
			return mapping(element, element, elements);
		}

		// If it's a string, parse it
		const mappingStr = mapping as string;

		// Handle transformation functions like "rgb(color)"
		const functionMatch = mappingStr.match(/^(\w+)\(([^)]+)\)$/);
		if (functionMatch) {
			const [, funcName, fieldPath] = functionMatch;
			const fieldValue = this.#getNestedValue(element, fieldPath);

			if (transformations[funcName as keyof typeof transformations]) {
				const transformFn = transformations[
					funcName as keyof typeof transformations
				] as (value: unknown, element: DrawingElement) => unknown;
				return transformFn(fieldValue, element);
			}

			throw new Error(`Unknown transformation function: ${funcName}`);
		}

		// Handle array notation like "[int(points.x), int(points.y)][]" or "[points.x, points.y][]"
		const arrayMatch = mappingStr.match(/^\[([^,]+),\s*([^,]+)\]\[\]$/);
		if (arrayMatch) {
			const [, xPath, yPath] = arrayMatch;

			// Extract transformation functions if present
			const xTransformMatch = xPath.match(/^(\w+)\(([^)]+)\)$/);
			const yTransformMatch = yPath.match(/^(\w+)\(([^)]+)\)$/);

			const actualXPath = xTransformMatch ? xTransformMatch[2] : xPath;
			const actualYPath = yTransformMatch ? yTransformMatch[2] : yPath;
			const xTransform = xTransformMatch ? xTransformMatch[1] : null;
			const yTransform = yTransformMatch ? yTransformMatch[1] : null;

			const baseField = actualXPath.split(".")[0]; // Get 'points' from 'points.x'
			const arrayValue = this.#getNestedValue(element, baseField);

			if (Array.isArray(arrayValue)) {
				return arrayValue.map((item) => {
					let xValue = this.#getNestedValue(
						{ [baseField]: [item] },
						actualXPath.replace(baseField, `${baseField}.0`)
					);
					let yValue = this.#getNestedValue(
						{ [baseField]: [item] },
						actualYPath.replace(baseField, `${baseField}.0`)
					);

					// Apply transformations if specified
					if (
						xTransform &&
						transformations[xTransform as keyof typeof transformations]
					) {
						const transformFn = transformations[
							xTransform as keyof typeof transformations
						] as (value: unknown) => unknown;
						xValue = transformFn(xValue);
					}
					if (
						yTransform &&
						transformations[yTransform as keyof typeof transformations]
					) {
						const transformFn = transformations[
							yTransform as keyof typeof transformations
						] as (value: unknown) => unknown;
						yValue = transformFn(yValue);
					}

					return [xValue, yValue];
				});
			}

			return [];
		}

		// Handle direct field access with dot notation
		const value = this.#getNestedValue(element, mappingStr);

		// Apply fallbacks for optional text fields
		if (value === undefined || value === null || value === "") {
			// Check if this is a text.content field
			if (mappingStr === "text.content") {
				return `${element.layerId || "unknown"}_${element.type}_name`;
			}
			// Check if this is a text.description field
			if (mappingStr === "text.description") {
				return `${element.layerId || "unknown"}_${element.type}_description`;
			}
		}

		return value;
	}

	/**
	 * Get nested value from object using dot notation
	 */
	#getNestedValue(obj: unknown, path: string): unknown {
		return path.split(".").reduce((current, key) => {
			if (current && typeof current === "object" && current !== null) {
				return (current as Record<string, unknown>)[key];
			}
			return undefined;
		}, obj);
	}

	/**
	 * Set nested value in object using dot notation
	 */
	#setNestedValue(
		obj: Record<string, unknown>,
		path: string,
		value: unknown
	): void {
		const keys = path.split(".");
		const lastKey = keys.pop();
		if (!lastKey) return;

		let current = obj;
		for (const key of keys) {
			if (
				!(key in current) ||
				typeof current[key] !== "object" ||
				current[key] === null
			) {
				current[key] = {};
			}
			current = current[key] as Record<string, unknown>;
		}
		current[lastKey] = value;
	}

	/**
	 * Reverse field mapping value for import
	 */
	#reverseFieldMapping(
		mapping: string | TransformFunction,
		value: unknown,
		targetElement: Partial<DrawingElement>
	): void {
		// If it's a function, we can't automatically reverse it
		if (typeof mapping === "function") {
			return;
		}

		const mappingStr = mapping as string;

		// Handle transformation functions like "rgb(color)"
		const functionMatch = mappingStr.match(/^(\w+)\(([^)]+)\)$/);
		if (functionMatch) {
			const [, funcName, fieldPath] = functionMatch;

			if (
				reverseTransformations[funcName as keyof typeof reverseTransformations]
			) {
				const reverseFn = reverseTransformations[
					funcName as keyof typeof reverseTransformations
				] as (value: unknown) => unknown;
				const reversedValue = reverseFn(value);
				this.#setNestedValue(
					targetElement as Record<string, unknown>,
					fieldPath,
					reversedValue
				);
			}
			return;
		}

		// Handle array notation like "[int(points.x), int(points.y)][]" or "[points.x, points.y][]"
		const arrayMatch = mappingStr.match(/^\[([^,]+),\s*([^,]+)\]\[\]$/);
		if (arrayMatch) {
			const [, xPath, yPath] = arrayMatch;

			// Extract transformation functions if present
			const xTransformMatch = xPath.match(/^(\w+)\(([^)]+)\)$/);
			const yTransformMatch = yPath.match(/^(\w+)\(([^)]+)\)$/);

			const actualXPath = xTransformMatch ? xTransformMatch[2] : xPath;
			const xTransform = xTransformMatch ? xTransformMatch[1] : null;
			const yTransform = yTransformMatch ? yTransformMatch[1] : null;

			const baseField = actualXPath.split(".")[0]; // Get 'points' from 'points.x'

			if (Array.isArray(value)) {
				const points = value.map((coord: unknown) => {
					if (Array.isArray(coord) && coord.length >= 2) {
						let xValue = coord[0];
						let yValue = coord[1];

						// Apply reverse transformations if needed
						if (
							xTransform &&
							reverseTransformations[
								xTransform as keyof typeof reverseTransformations
							]
						) {
							const reverseFn = reverseTransformations[
								xTransform as keyof typeof reverseTransformations
							] as (value: unknown) => unknown;
							xValue = reverseFn(xValue);
						}
						if (
							yTransform &&
							reverseTransformations[
								yTransform as keyof typeof reverseTransformations
							]
						) {
							const reverseFn = reverseTransformations[
								yTransform as keyof typeof reverseTransformations
							] as (value: unknown) => unknown;
							yValue = reverseFn(yValue);
						}

						return { x: xValue as number, y: yValue as number };
					}
					return { x: 0, y: 0 };
				});
				this.#setNestedValue(
					targetElement as Record<string, unknown>,
					baseField,
					points
				);
			}
			return;
		}

		// Handle direct field access with dot notation
		this.#setNestedValue(
			targetElement as Record<string, unknown>,
			mappingStr,
			value
		);

		// Handle fallback values for text fields during import
		if (mappingStr === "text.content" && typeof value === "string") {
			// Check if this looks like a generated fallback name
			const fallbackPattern = /^(.+)_(.+)_name$/;
			const match = value.match(fallbackPattern);
			if (match) {
				const [, layerId, type] = match;
				// If it's a fallback, we can extract layerId and type
				if (!targetElement.layerId) {
					this.#setNestedValue(
						targetElement as Record<string, unknown>,
						"layerId",
						layerId
					);
				}
				if (!targetElement.type) {
					this.#setNestedValue(
						targetElement as Record<string, unknown>,
						"type",
						type
					);
				}
			}
		}
	}
}

/**
 * Create a bridge instance with configuration
 */
export function createBridge(config: BridgeConfig): DrawingBridge {
	return new DrawingBridge(config);
}

/**
 * Create a bridge for scenario line format (backward compatibility)
 */
export function createScenarioLineBridge(options: {
	location: string;
	mapsCoordinates: [number, number];
}): DrawingBridge {
	const config: BridgeConfig = {
		output: {
			element: {
				name: "text.content",
				description: "text.description",
				coordinates: "[points.x, points.y][]",
				color: (_value: unknown, element: DrawingElement) =>
					transformations.rgb(element.color),
				location: () => options.location,
			},
		},
		additionalInfo: {
			maps_coordinates: options.mapsCoordinates,
			timestamp: new Date().toISOString(),
		},
	};

	return new DrawingBridge(config);
}

/**
 * Create a bridge for simple JSON export
 */
export function createJsonBridge(): DrawingBridge {
	const config: BridgeConfig = {
		output: {
			element: {
				id: "id",
				type: "type",
				points: "points",
				color: "color",
				completed: "completed",
				text_content: "text.content",
				text_description: "text.description",
				layer_id: "layerId",
				group_id: "groupId",
			},
		},
	};

	return new DrawingBridge(config);
}

/**
 * Create a bridge for CSV export
 */
export function createCsvBridge(): DrawingBridge {
	const config: BridgeConfig = {
		output: {
			element: {
				id: "id",
				type: "type",
				point_count: (_value: unknown, element: DrawingElement) =>
					transformations.pointCount(element.points),
				center_x: (_value: unknown, element: DrawingElement) =>
					transformations.centerPoint(element.points)[0],
				center_y: (_value: unknown, element: DrawingElement) =>
					transformations.centerPoint(element.points)[1],
				color_rgb: (_value: unknown, element: DrawingElement) =>
					transformations.rgb(element.color),
				text: "text.content",
				completed: "completed",
			},
		},
	};

	return new DrawingBridge(config);
}

/**
 * Validation functions
 */
export function validateBridgeConfig(config: BridgeConfig): string[] {
	const errors: string[] = [];

	if (!config.output || !config.output.element) {
		errors.push("Bridge configuration must have output.element mapping");
	}

	if (
		config.output?.element &&
		Object.keys(config.output.element).length === 0
	) {
		errors.push("Bridge configuration must have at least one field mapping");
	}

	return errors;
}

/**
 * Debug function to preview transformation
 */
export function previewTransformation(
	config: BridgeConfig,
	sampleElement: DrawingElement
): Record<string, unknown> {
	const bridge = new DrawingBridge(config);
	const result = bridge.exportSingle(sampleElement);
	return result as Record<string, unknown>;
}

// Export the old DrawingBridge class for backward compatibility
// Legacy imports for backward compatibility
// Note: Import these from the legacy file when needed
