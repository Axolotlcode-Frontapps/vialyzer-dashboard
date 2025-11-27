import type { DrawingElement, LayerInfo, Point } from "./types";

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

// Generic type to extract all nested key paths from an object
export type NestedKeyOf<T extends object> = {
	[Key in keyof T & (string | number)]: T[Key] extends (infer U)[]
		? U extends object
			? `${Key}` | `${Key}.${NestedKeyOf<U>}`
			: `${Key}`
		: NonNullable<T[Key]> extends object
			? `${Key}` | `${Key}.${NestedKeyOf<NonNullable<T[Key]>>}`
			: `${Key}`;
}[keyof T & (string | number)];

// Type for valid dot-notation paths in a DrawingElement
export type DrawingElementPaths = NestedKeyOf<DrawingElement>;

// Transformation function groups
type ColorTransforms = "rgb" | "rgba";
type NumberTransforms = "int" | "float";
type TextTransforms = "textLength" | "upperCase" | "lowerCase";
type CoordinateTransforms =
	| "coordinatesArray"
	| "firstPoint"
	| "lastPoint"
	| "centerPoint"
	| "pointCount";

// Point-related path types for better contextual typing
type PointSubPaths = "x" | "y";
type PointArrayPaths = "points" | "detection.entry" | "detection.exit";
type PointPaths = "direction.start" | "direction.end";

// Contextual type that allows only valid transformations for a given path
export type AllowedTransforms<P extends DrawingElementPaths> =
	// Color fields
	P extends "color" | "info.backgroundColor"
		? `${ColorTransforms}(${P})`
		: // Text fields
			P extends
					| "type"
					| "info.name"
					| "info.description"
					| "info.fontFamily"
					| "info.type"
					| "info.direction"
			? `${TextTransforms}(${P})`
			: // Number fields
				P extends "info.distance" | "info.fontSize" | "info.backgroundOpacity"
				? `${NumberTransforms}(${P})`
				: // Numeric sub-fields of Point arrays (e.g., 'points.x')
					P extends `${PointArrayPaths}.${PointSubPaths}`
					? `${NumberTransforms}(${P})`
					: // Numeric sub-fields of Point objects (e.g., 'direction.start.x')
						P extends `${PointPaths}.${PointSubPaths}`
						? `${NumberTransforms}(${P})`
						: // Point array fields
							P extends PointArrayPaths
							? `${CoordinateTransforms}(${P})`
							: // Fields that should not have string transformations
								P extends "id" | "completed" | "layerId" | "groupId"
								? never
								: never;

// The final mapping string for a single field
export type MappingString =
	| DrawingElementPaths
	| AllowedTransforms<DrawingElementPaths>;

// Path for a field within an array of points, possibly with a transform
type PointArrayFieldPath =
	| `${PointArrayPaths}.${PointSubPaths}`
	| `${NumberTransforms}(${PointArrayPaths}.${PointSubPaths})`;

// Type for the array mapping syntax, e.g., "[int(points.x), int(points.y)][]"
// This syntax is restricted to point arrays like 'points' or 'detection.entry'
export type ArrayMappingString =
	`[${PointArrayFieldPath}, ${PointArrayFieldPath}][]`;

// Field mapping configuration
export interface FieldMapping {
	[outputField: string]: MappingString | ArrayMappingString | TransformFunction;
}

// Reverse field mapping for import
export type SourcePath<T> = T extends object ? NestedKeyOf<T> : string;

type TransformedSourcePath<T> = `${string}(${SourcePath<T>})`;

type InputField<T> = SourcePath<T> | TransformedSourcePath<T>;

// Custom field mapping with transform function
export interface CustomFieldMapping<TValue = unknown> {
	key: string;
	transform: (value: TValue) => unknown;
}

export type ReverseFieldMapping<TSource> = {
	[key in InputField<TSource>]?: DrawingElementPaths | CustomFieldMapping;
};

// Layer paths for LayerInfo
type LayerInfoPaths = NestedKeyOf<LayerInfo>;

// Reverse field mapping for layer import
export type ReverseFieldMappingLayer<TSource> = {
	[key in InputField<TSource>]?: LayerInfoPaths | CustomFieldMapping;
};

// Bridge configuration
// biome-ignore lint/suspicious/noExplicitAny: Neccessary
export interface BridgeConfig<TSource = any> {
	output: FieldMapping;
	input: {
		elements: ReverseFieldMapping<TSource>;
		layers: ReverseFieldMappingLayer<TSource>;
	};
}

// Bridge instance interface
// biome-ignore lint/suspicious/noExplicitAny: Neccessary
export interface Bridge<TSource = any> {
	export: <T>(elements: DrawingElement[]) => T[];
	import: (data: TSource[]) => {
		elements: DrawingElement[];
		layers: Map<string, LayerInfo>;
	};
	updateConfig: (config: Partial<BridgeConfig<TSource>>) => void;
	getConfig: () => BridgeConfig<TSource>;
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

	time: (dateString: string): number => {
		if (!dateString) return Date.now();
		const timestamp = new Date(dateString).getTime();
		return Number.isNaN(timestamp) ? Date.now() : timestamp;
	},

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
	hex: (value: [number, number, number]): string => {
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
	points: (value: [number, number][]): Point[] => {
		if (!Array.isArray(value)) return [];
		return value.map(([x, y]) => ({ x: x || 0, y: y || 0 }));
	},

	firstPoint: (value: [number, number][]): Point | null => {
		if (!Array.isArray(value) || value.length === 0) return null;
		const [x, y] = value[0];
		return { x: x || 0, y: y || 0 };
	},

	lastPoint: (value: [number, number][]): Point | null => {
		if (!Array.isArray(value) || value.length === 0) return null;
		const [x, y] = value[value.length - 1];
		return { x: x || 0, y: y || 0 };
	},

	endPoint: (value: [number, number][]): Point | null => {
		if (!Array.isArray(value) || value.length === 0) return null;
		const [x, y] = value[value.length - 1];
		return { x: x || 0, y: y || 0 };
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

	time: (value: number): number => {
		if (typeof value !== "number" || Number.isNaN(value))
			return new Date().getTime();

		return new Date(value).getTime();
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
export class DrawingBridge<TSource> implements Bridge<TSource> {
	// Private fields using native # syntax
	#config: BridgeConfig<TSource>;

	constructor(config: BridgeConfig<TSource>) {
		this.#config = { ...config };
	}

	/**
	 * Export multiple drawing elements
	 */
	export<T>(elements: DrawingElement[]): T[] {
		return elements
			.filter((element) => element.completed) // Only export completed elements
			.map((element) => this.#exportSingle(element)) as T[];
	}

	/**
	 * Export single drawing element
	 */
	#exportSingle<T>(element: DrawingElement): T {
		const result: Record<string, unknown> = {};

		// Apply element field mappings
		for (const [outputField, mapping] of Object.entries(this.#config.output)) {
			try {
				result[outputField] = this.#resolveFieldValue(mapping, element);
			} catch (error) {
				console.warn(
					`[Bridge] Failed to resolve field mapping for ${outputField}:`,
					error
				);
				result[outputField] = null;
			}
		}

		return result as T;
	}

	/**
	 * Import multiple elements with automatic reverse transformation
	 * The bridge is responsible for building and populating layers with their elementIds
	 */
	import(data: TSource[]): {
		elements: DrawingElement[];
		layers: Map<string, LayerInfo>;
	} {
		// Step 1: Import and transform all elements
		const importedElements = data.map((item) => {
			return this.#importSingle(item);
		});

		// Step 2: Validate and filter elements
		const validElements = importedElements.filter((item) => {
			const isValid = this.#validItem(item);
			return isValid;
		});

		// Step 3: Import and build layers
		const layers = this.#importLayers(data);

		// Step 4: Populate elementIds in layers based on valid elements
		// This is the responsibility of the bridge - to prepare complete, ready-to-use layers
		validElements.forEach((element) => {
			if (element.layerId) {
				const layer = layers.get(element.layerId);
				if (layer) {
					// Only add if not already present (avoid duplicates)
					if (!layer.elementIds.includes(element.id)) {
						layer.elementIds.push(element.id);
						layer.updatedAt = Date.now();
					}
				} else {
					console.warn(
						`[Bridge] Element ${element.id} references non-existent layer: ${element.layerId}`
					);
				}
			} else {
				console.warn(`[Bridge] Element ${element.id} has no layerId assigned`);
			}
		});

		return { elements: validElements, layers };
	}

	#validItem(item: DrawingElement): boolean {
		const hasId = typeof item.id === "string" && item.id.trim() !== "";
		const hasType = typeof item.type === "string" && item.type.trim() !== "";
		const hasPoints = Array.isArray(item.points) && item.points.length > 0;
		const hasValidDetection =
			(Array.isArray(item.detection?.entry) &&
				item.detection.entry.length > 0 &&
				Array.isArray(item.detection?.exit) &&
				item.detection.exit.length > 0) ||
			typeof item.detection === "undefined";
		const hasColor = typeof item.color === "string" && item.color.trim() !== "";
		const hasCompleted = typeof item.completed === "boolean";
		const hasValidLayerId =
			(typeof item.layerId === "string" && item.layerId.trim() !== "") ||
			typeof item.layerId === "undefined";
		const hasValidGroupId =
			(typeof item.groupId === "string" && item.groupId.trim() !== "") ||
			typeof item.groupId === "undefined";
		const hasInfo = typeof item.info === "object" && item.info !== null;
		const hasInfoName =
			hasInfo &&
			typeof item.info.name === "string" &&
			item.info.name.trim() !== "";
		const hasValidInfoDescription =
			!hasInfo ||
			(typeof item.info.description === "string" &&
				item.info.description.trim() !== "") ||
			typeof item.info.description === "undefined";
		const hasInfoType =
			hasInfo &&
			typeof item.info.type === "string" &&
			item.info.type.trim() !== "";
		// const hasInfoDirection = typeof item.info.direction === 'string' && item.info.direction.trim() !== '';
		const hasInfoDistance =
			hasInfo &&
			typeof item.info.distance === "number" &&
			!Number.isNaN(item.info.distance);
		const hasInfoFontSize =
			hasInfo &&
			typeof item.info.fontSize === "number" &&
			!Number.isNaN(item.info.fontSize);
		const hasInfoFontFamily =
			hasInfo &&
			typeof item.info.fontFamily === "string" &&
			item.info.fontFamily.trim() !== "";
		const hasValidInfoBackgroundColor =
			!hasInfo ||
			(typeof item.info.backgroundColor === "string" &&
				item.info.backgroundColor.trim() !== "") ||
			typeof item.info.backgroundColor === "undefined";
		const hasInfoBackgroundOpacity =
			hasInfo &&
			typeof item.info.backgroundOpacity === "number" &&
			!Number.isNaN(item.info.backgroundOpacity);

		return (
			hasId &&
			hasType &&
			hasPoints &&
			hasValidDetection &&
			hasColor &&
			hasCompleted &&
			hasValidLayerId &&
			hasValidGroupId &&
			hasInfo &&
			hasInfoName &&
			hasValidInfoDescription &&
			hasInfoType &&
			// hasInfoDirection &&
			hasInfoDistance &&
			hasInfoFontSize &&
			hasInfoFontFamily &&
			hasValidInfoBackgroundColor &&
			hasInfoBackgroundOpacity
		);
	}

	#validLayer(layer: LayerInfo): boolean {
		const hasId = typeof layer.id === "string" && layer.id.trim() !== "";
		const hasName = typeof layer.name === "string" && layer.name.trim() !== "";
		const hasDescription = typeof layer.description === "string"; // Can be empty
		const hasCategory = typeof layer.category === "string"; // Can be empty
		const hasVisibility =
			layer.visibility === "visible" ||
			layer.visibility === "hidden" ||
			layer.visibility === "locked";
		const hasOpacity =
			typeof layer.opacity === "number" &&
			!Number.isNaN(layer.opacity) &&
			layer.opacity >= 0 &&
			layer.opacity <= 1;
		const hasZIndex =
			typeof layer.zIndex === "number" && !Number.isNaN(layer.zIndex);
		const hasElementIds = Array.isArray(layer.elementIds);
		const hasValidColor =
			(typeof layer.color === "string" && layer.color.trim() !== "") ||
			typeof layer.color === "undefined";
		const hasCreatedAt =
			typeof layer.createdAt === "number" && !Number.isNaN(layer.createdAt);
		const hasUpdatedAt =
			typeof layer.updatedAt === "number" && !Number.isNaN(layer.updatedAt);

		return (
			hasId &&
			hasName &&
			hasDescription &&
			hasCategory &&
			hasVisibility &&
			hasOpacity &&
			hasZIndex &&
			hasElementIds &&
			hasValidColor &&
			hasCreatedAt &&
			hasUpdatedAt
		);
	}

	/**
	 * Import single element with automatic reverse transformation
	 */
	#importSingle(item: TSource): DrawingElement {
		const inputData = item as Record<string, unknown>;
		const element = {} as Partial<DrawingElement>;

		// Track which nested fields were successfully set
		const nestedFieldsSet: Record<string, Set<string>> = {};
		// Track which nested fields were attempted
		const nestedFieldsAttempted: Record<string, Set<string>> = {};

		// Process each field mapping from the input configuration
		for (const [sourceMapping, destinationConfig] of Object.entries(
			this.#config.input.elements
		)) {
			try {
				// Skip function mappings (they should be handled by the user outside the bridge)
				if (typeof destinationConfig === "function") {
					continue;
				}

				// Check if destinationConfig is a custom mapping with transform
				const isCustomMapping =
					typeof destinationConfig === "object" &&
					destinationConfig !== null &&
					"key" in destinationConfig &&
					"transform" in destinationConfig;

				const destinationPath = isCustomMapping
					? (destinationConfig as CustomFieldMapping).key
					: (destinationConfig as string);

				// Parse the source mapping key
				const functionMatch = sourceMapping.match(/^(\w+)\(([^)]+)\)$/);
				let sourcePath: string;
				let transformFuncName: string | null = null;

				if (functionMatch) {
					transformFuncName = functionMatch[1];
					sourcePath = functionMatch[2];
				} else {
					sourcePath = sourceMapping;
				}

				// Get the value from the source data
				const sourceValue = this.#getNestedValue(
					inputData,
					sourcePath as string
				);

				// Track attempted nested fields
				const parentPath = destinationPath.split(".").slice(0, -1).join(".");
				if (parentPath) {
					const childField = destinationPath.split(".").pop()!;
					if (!nestedFieldsAttempted[parentPath]) {
						nestedFieldsAttempted[parentPath] = new Set();
					}
					nestedFieldsAttempted[parentPath].add(childField);
				}

				if (sourceValue === undefined) {
					continue;
				}

				// Track successfully set nested fields
				if (parentPath) {
					const childField = destinationPath.split(".").pop()!;
					if (!nestedFieldsSet[parentPath]) {
						nestedFieldsSet[parentPath] = new Set();
					}
					nestedFieldsSet[parentPath].add(childField);
				}

				// Apply transformation if any
				let transformedValue: unknown = sourceValue;

				// First check for custom transform function
				if (isCustomMapping) {
					const customTransform = (destinationConfig as CustomFieldMapping)
						.transform;
					transformedValue = customTransform(sourceValue);
				} else if (transformFuncName) {
					// Then check for built-in transform functions
					if (
						reverseTransformations[
							transformFuncName as keyof typeof reverseTransformations
						]
					) {
						const transformFn = reverseTransformations[
							transformFuncName as keyof typeof reverseTransformations
						] as (value: unknown) => unknown;
						transformedValue = transformFn(sourceValue);
					}
				}

				// Set the value on the element object
				this.#setNestedValue(
					element as unknown as Record<string, unknown>,
					destinationPath as string,
					transformedValue
				);
			} catch (error) {
				console.warn(
					`[Bridge] Failed to process input mapping for "${sourceMapping}":`,
					error
				);
			}
		}

		// Clean up incomplete optional nested objects
		// If not ALL attempted fields were successfully set, remove the parent object
		for (const [parentPath, attemptedFields] of Object.entries(
			nestedFieldsAttempted
		)) {
			const setFields = nestedFieldsSet[parentPath] || new Set();

			// Check if all attempted fields were successfully set
			const allFieldsSet = Array.from(attemptedFields).every((field) =>
				setFields.has(field)
			);

			// If not all fields were set, remove the entire parent object
			if (!allFieldsSet) {
				this.#setNestedValue(
					element as unknown as Record<string, unknown>,
					parentPath,
					undefined
				);
			}
		}

		// Cast to DrawingElement - validation happens in #validItem
		const finalElement = element as DrawingElement;

		// Mark as 'saved' since it came from backend
		finalElement.syncState = "saved";

		return finalElement;
	}

	/**
	 * Import layers with automatic transformation
	 * Note: elementIds start empty and are populated by the import() method after element validation
	 */
	#importLayers(data: TSource[]): Map<string, LayerInfo> {
		const layerMap = new Map<string, LayerInfo>();
		let skippedItems = 0;
		let duplicateLayerIds = 0;

		data.forEach((item) => {
			const inputData = item as Record<string, unknown>;
			const layerObj = {} as Partial<LayerInfo>;

			// Apply field mappings from the input.layers config
			for (const [sourceMapping, destinationConfig] of Object.entries(
				this.#config.input.layers || {}
			)) {
				// Check if destinationConfig is a custom mapping with transform
				const isCustomMapping =
					typeof destinationConfig === "object" &&
					destinationConfig !== null &&
					"key" in destinationConfig &&
					"transform" in destinationConfig;

				const destinationPath = isCustomMapping
					? (destinationConfig as CustomFieldMapping).key
					: (destinationConfig as string);

				if (typeof destinationPath !== "string") {
					continue;
				}

				try {
					// Parse the source mapping key
					const functionMatch = sourceMapping.match(/^(\w+)\(([^)]+)\)$/);
					let sourcePath: string;
					let transformFuncName: string | null = null;

					if (functionMatch) {
						transformFuncName = functionMatch[1];
						sourcePath = functionMatch[2];
					} else {
						sourcePath = sourceMapping;
					}

					// Get the value from the source data
					const sourceValue = this.#getNestedValue(inputData, sourcePath);

					if (sourceValue === undefined) {
						continue;
					}

					// Apply transformation if any
					let transformedValue: unknown = sourceValue;

					// First check for custom transform function
					if (isCustomMapping) {
						const customTransform = (destinationConfig as CustomFieldMapping)
							.transform;
						transformedValue = customTransform(sourceValue);
					} else if (transformFuncName) {
						// Then check for built-in transform functions
						if (
							reverseTransformations[
								transformFuncName as keyof typeof reverseTransformations
							]
						) {
							const transformFn = reverseTransformations[
								transformFuncName as keyof typeof reverseTransformations
							] as (value: unknown) => unknown;
							transformedValue = transformFn(sourceValue) as Record<
								string,
								unknown
							>;
						}
					}

					// Set the value on the layer object
					this.#setNestedValue(
						layerObj as unknown as Record<string, unknown>,
						destinationPath,
						transformedValue
					);
				} catch (error) {
					console.warn(
						`[Bridge] Failed to process layer mapping for "${sourceMapping}":`,
						error
					);
				}
			}

			// Get layer ID - skip if no valid ID could be extracted
			const layerId = layerObj.id;

			if (!layerId || typeof layerId !== "string" || layerId.trim() === "") {
				skippedItems++;
				console.warn(
					`[Bridge] Skipping element - no valid layer ID. Extracted:`,
					layerId
				);
				return; // Skip this item - no valid layer ID
			}

			// Only create layer if it doesn't exist yet (deduplicate by ID)
			if (!layerMap.has(layerId)) {
				const layer: LayerInfo = {
					id: layerId,
					name: layerObj.name || `Layer ${layerMap.size + 1}`,
					description: layerObj.description || "",
					category: layerObj.category || "",
					visibility: layerObj.visibility || "visible",
					opacity: layerObj.opacity ?? 1.0,
					zIndex: layerMap.size, // Use map size for sequential zIndex
					elementIds: [], // Empty - DrawingEngine will populate this
					color: layerObj.color,
					createdAt: layerObj.createdAt || Date.now(),
					updatedAt: layerObj.updatedAt || Date.now(),
				};

				layerMap.set(layerId, layer);
			} else {
				duplicateLayerIds++;
			}
		});

		// Filter out invalid layers
		const validLayerMap = new Map<string, LayerInfo>();

		layerMap.forEach((layer, layerId) => {
			const isValid = this.#validLayer(layer);
			if (isValid) {
				validLayerMap.set(layerId, layer);
			}
		});

		return validLayerMap;
	}

	/**
	 * Update bridge configuration
	 */
	updateConfig(newConfig: Partial<BridgeConfig<TSource>>): void {
		this.#config = {
			...this.#config,
			...newConfig,
			output: {
				...this.#config.output,
				...newConfig.output,
			},
			input: {
				elements: {
					...this.#config.input.elements,
					...newConfig.input?.elements,
				},
				layers: {
					...this.#config.input.layers,
					...newConfig.input?.layers,
				},
			},
		};
	}

	/**
	 * Get current configuration
	 */
	getConfig(): BridgeConfig<TSource> {
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

		// Handle array notation like "[int(points.x), int(points.y)][]" or "[int(detection.entry.x), int(detection.entry.y)][]"
		const arrayMatch = mappingStr.match(/^\[([^,]+),\s*([^,]+)\]\[\]$/);
		if (arrayMatch) {
			const [, xPath, yPath] = arrayMatch;

			// Extract transformation functions if present
			const xTransformMatch = xPath.match(/^(\w+)\(([^)]+)\)$/);
			const yTransformMatch = yPath.match(/^(\w+)\(([^)]+)\)$/);

			const actualXPath = xTransformMatch ? xTransformMatch[2] : xPath.trim();
			const actualYPath = yTransformMatch ? yTransformMatch[2] : yPath.trim();
			const xTransform = xTransformMatch ? xTransformMatch[1] : null;
			const yTransform = yTransformMatch ? yTransformMatch[1] : null;

			const xPathParts = actualXPath.split(".");
			const yPathParts = actualYPath.split(".");

			// Find the common base path that is an array
			let baseFieldPath = "";
			let arrayValue: unknown;
			// Find the longest prefix path that resolves to an array
			for (let i = xPathParts.length - 1; i > 0; i--) {
				const testPath = xPathParts.slice(0, i).join(".");
				const testValue = this.#getNestedValue(element, testPath);
				if (Array.isArray(testValue)) {
					baseFieldPath = testPath;
					arrayValue = testValue;
					break;
				}
			}

			// Fallback for simple array path like 'points'
			if (!baseFieldPath) {
				const testValue = this.#getNestedValue(element, xPathParts[0]);
				if (Array.isArray(testValue)) {
					baseFieldPath = xPathParts[0];
					arrayValue = testValue;
				} else {
					// No array found in the path, cannot process as array mapping
					return [];
				}
			}

			if (Array.isArray(arrayValue)) {
				const basePathPartsCount = baseFieldPath.split(".").length;
				const xSubPath = xPathParts.slice(basePathPartsCount).join(".");
				const ySubPath = yPathParts.slice(basePathPartsCount).join(".");

				return arrayValue.map((item) => {
					let xValue = this.#getNestedValue(item, xSubPath);
					let yValue = this.#getNestedValue(item, ySubPath);

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
			// Check if this is a info.name field
			if (mappingStr === "info.name") {
				return `${element.layerId || "unknown"}_${element.type}_name`;
			}
			// Check if this is a info.description field
			if (mappingStr === "info.description") {
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
}
