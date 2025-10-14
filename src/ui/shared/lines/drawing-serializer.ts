import type { LayerInfo, LayerVisibility } from "./drawing-layers";
import type { DrawingElement } from "./types";

/**
 * Serialization format version for backward compatibility
 */
export const SERIALIZATION_VERSION = "1.0.0";

/**
 * Drawing project data structure
 */
export interface DrawingProject {
	version: string;
	metadata: {
		name?: string;
		description?: string;
		createdAt: number;
		updatedAt: number;
		author?: string;
		tags?: string[];
		mediaInfo?: {
			width: number;
			height: number;
			type: "image" | "video";
			duration?: number;
			fps?: number;
		};
	};
	layers: SerializedLayer[];
	elements: DrawingElement[];
	groups?: SerializedGroup[];
	history?: SerializedHistoryEntry[];
	settings?: ProjectSettings;
}

/**
 * Serialized layer information
 */
export interface SerializedLayer {
	id: string;
	name: string;
	visibility: LayerVisibility;
	opacity: number;
	zIndex: number;
	elementIds: string[];
	color?: string;
	createdAt: number;
	updatedAt: number;
	metadata?: {
		description?: string;
		tags?: string[];
		category?: string;
		[key: string]: unknown;
	};
}

/**
 * Serialized group information
 */
export interface SerializedGroup {
	id: string;
	elementIds: string[];
	layerId?: string;
	bounds: {
		minX: number;
		minY: number;
		maxX: number;
		maxY: number;
		width: number;
		height: number;
		centerX: number;
		centerY: number;
	};
	createdAt: number;
	metadata?: {
		name?: string;
		description?: string;
		color?: string;
	};
}

/**
 * Serialized history entry
 */
export interface SerializedHistoryEntry {
	id: string;
	timestamp: number;
	operation: string;
	description: string;
	affectedLayers: string[];
	affectedElements: string[];
}

/**
 * Project settings
 */
export interface ProjectSettings {
	canvas: {
		backgroundColor?: string;
		gridEnabled?: boolean;
		gridSize?: number;
		snapToGrid?: boolean;
	};
	drawing: {
		defaultStrokeWidth?: number;
		defaultColors?: string[];
		enablePressure?: boolean;
	};
	layers: {
		defaultOpacity?: number;
		maxLayers?: number;
	};
	export: {
		format?: "json" | "svg" | "png" | "pdf";
		quality?: number;
		includeMetadata?: boolean;
	};
}

/**
 * Export options
 */
export interface ExportOptions {
	format: "json" | "svg" | "png" | "pdf" | "csv";
	includeHiddenLayers?: boolean;
	includeLockedLayers?: boolean;
	includeMetadata?: boolean;
	includeHistory?: boolean;
	visibleLayersOnly?: boolean;
	selectedLayersOnly?: string[];
	compression?: boolean;
	quality?: number; // For image formats
}

/**
 * Import options
 */
export interface ImportOptions {
	mergeWithExisting?: boolean;
	preserveLayerStructure?: boolean;
	preserveGrouping?: boolean;
	createNewLayers?: boolean;
	targetLayerId?: string;
	replaceExisting?: boolean;
}

/**
 * DrawingSerializer namespace - Handles import/export of drawing data with layer support
 */
export class DrawingSerializer {
	/**
	 * Serialize drawing data to JSON format
	 */
	static serialize(
		layers: LayerInfo[],
		elements: DrawingElement[],
		groups?: SerializedGroup[],
		metadata?: Partial<DrawingProject["metadata"]>,
		settings?: ProjectSettings
	): DrawingProject {
		const now = Date.now();

		// Serialize layers
		const serializedLayers: SerializedLayer[] = layers.map((layer) => ({
			id: layer.id,
			name: layer.name,
			visibility: layer.visibility,
			opacity: layer.opacity,
			zIndex: layer.zIndex,
			elementIds: layer.elementIds,
			color: layer.color,
			createdAt: layer.createdAt,
			updatedAt: layer.updatedAt,
			metadata: layer.metadata,
		}));

		// Serialize groups
		const serializedGroups: SerializedGroup[] = groups || [];

		return {
			version: SERIALIZATION_VERSION,
			metadata: {
				createdAt: now,
				updatedAt: now,
				...metadata,
			},
			layers: serializedLayers,
			elements: elements.map((el) => ({ ...el })), // Deep copy
			groups: serializedGroups,
			settings,
		};
	}

	/**
	 * Export drawing data with options
	 */
	static exportData(
		layers: LayerInfo[],
		elements: DrawingElement[],
		options: ExportOptions,
		groups?: SerializedGroup[],
		metadata?: Partial<DrawingProject["metadata"]>
	): string | Blob {
		// Filter layers based on export options
		let filteredLayers = layers;
		let filteredElements = elements;

		if (options.visibleLayersOnly) {
			filteredLayers = layers.filter((layer) => layer.visibility === "visible");
			const visibleLayerIds = new Set(filteredLayers.map((l) => l.id));
			filteredElements = elements.filter(
				(el) => !el.layerId || visibleLayerIds.has(el.layerId)
			);
		}

		if (options.selectedLayersOnly) {
			const selectedLayerIds = new Set(options.selectedLayersOnly);
			filteredLayers = layers.filter((layer) => selectedLayerIds.has(layer.id));
			filteredElements = elements.filter(
				(el) => !el.layerId || selectedLayerIds.has(el.layerId)
			);
		}

		if (!options.includeHiddenLayers) {
			filteredLayers = filteredLayers.filter(
				(layer) => layer.visibility !== "hidden"
			);
			const visibleLayerIds = new Set(filteredLayers.map((l) => l.id));
			filteredElements = filteredElements.filter(
				(el) => !el.layerId || visibleLayerIds.has(el.layerId)
			);
		}

		if (!options.includeLockedLayers) {
			filteredLayers = filteredLayers.filter(
				(layer) => layer.visibility !== "locked"
			);
			const unlockedLayerIds = new Set(filteredLayers.map((l) => l.id));
			filteredElements = filteredElements.filter(
				(el) => !el.layerId || unlockedLayerIds.has(el.layerId)
			);
		}

		switch (options.format) {
			case "json":
				return DrawingSerializer.exportToJSON(
					filteredLayers,
					filteredElements,
					options,
					groups,
					metadata
				);

			case "svg":
				return DrawingSerializer.exportToSVG(
					filteredLayers,
					filteredElements,
					options
				);

			case "csv":
				return DrawingSerializer.exportToCSV(filteredLayers, filteredElements);

			case "png":
			case "pdf":
				throw new Error(
					`${options.format} export requires canvas rendering - not implemented yet`
				);

			default:
				throw new Error(`Unsupported export format: ${options.format}`);
		}
	}

	/**
	 * Export to JSON format
	 */
	private static exportToJSON(
		layers: LayerInfo[],
		elements: DrawingElement[],
		options: ExportOptions,
		groups?: SerializedGroup[],
		metadata?: Partial<DrawingProject["metadata"]>
	): string {
		const project = DrawingSerializer.serialize(
			layers,
			elements,
			groups,
			metadata
		);

		const projectCopy = { ...project };
		if (!options.includeMetadata) {
			delete (projectCopy as Partial<DrawingProject>).metadata;
		}

		if (!options.includeHistory) {
			delete (projectCopy as Partial<DrawingProject>).history;
		}

		const jsonString = JSON.stringify(
			projectCopy,
			null,
			options.compression ? 0 : 2
		);
		return jsonString;
	}

	/**
	 * Export to SVG format
	 */
	private static exportToSVG(
		layers: LayerInfo[],
		elements: DrawingElement[],
		_options: ExportOptions
	): string {
		// Calculate canvas bounds
		const allPoints = elements.flatMap((el) => el.points);
		if (allPoints.length === 0) {
			return '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>';
		}

		const minX = Math.min(...allPoints.map((p) => p.x));
		const minY = Math.min(...allPoints.map((p) => p.y));
		const maxX = Math.max(...allPoints.map((p) => p.x));
		const maxY = Math.max(...allPoints.map((p) => p.y));
		const width = maxX - minX + 20; // Add padding
		const height = maxY - minY + 20;

		let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX - 10} ${minY - 10} ${width} ${height}">`;

		if (_options.includeMetadata) {
			svg += `\n  <metadata>
    <title>Drawing Export</title>
    <description>Exported from drawing application with ${layers.length} layers</description>
  </metadata>`;
		}

		// Group elements by layer and render in order
		const layerOrder = [...layers].sort((a, b) => a.zIndex - b.zIndex);

		for (const layer of layerOrder) {
			if (layer.visibility === "hidden") continue;

			const layerElements = elements.filter(
				(el) => el.layerId === layer.id || (!el.layerId && layer.zIndex === 0)
			);

			if (layerElements.length === 0) continue;

			svg += `\n  <g id="layer-${layer.id}" opacity="${layer.opacity}">`;
			svg += `\n    <!-- Layer: ${layer.name} -->`;

			for (const element of layerElements) {
				svg += DrawingSerializer.elementToSVG(element);
			}

			svg += `\n  </g>`;
		}

		svg += `\n</svg>`;
		return svg;
	}

	/**
	 * Convert drawing element to SVG
	 */
	private static elementToSVG(element: DrawingElement): string {
		const { points, color, type } = element;
		if (points.length === 0) return "";

		switch (type) {
			case "line":
				if (points.length >= 2) {
					return `\n    <line x1="${points[0].x}" y1="${points[0].y}" x2="${points[1].x}" y2="${points[1].y}" stroke="${color}" stroke-width="2.5" fill="none"/>`;
				}
				break;

			case "area":
				if (points.length >= 3) {
					const pathData =
						`M${points[0].x},${points[0].y} ` +
						points
							.slice(1)
							.map((p) => `L${p.x},${p.y}`)
							.join(" ") +
						" Z";
					return `\n    <path d="${pathData}" stroke="${color}" stroke-width="2.5" fill="${color}20"/>`;
				}
				break;

			case "curve":
				if (points.length >= 2) {
					const pathData =
						points.length === 2
							? `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`
							: `M${points[0].x},${points[0].y} ` +
								points
									.slice(1)
									.map((p) => `L${p.x},${p.y}`)
									.join(" ");
					return `\n    <path d="${pathData}" stroke="${color}" stroke-width="2.5" fill="none"/>`;
				}
				break;

			case "rectangle":
				if (points.length >= 2) {
					const x = Math.min(points[0].x, points[1].x);
					const y = Math.min(points[0].y, points[1].y);
					const width = Math.abs(points[1].x - points[0].x);
					const height = Math.abs(points[1].y - points[0].y);
					return `\n    <rect x="${x}" y="${y}" width="${width}" height="${height}" stroke="${color}" stroke-width="2.5" fill="${color}20"/>`;
				}
				break;

			case "circle":
				if (points.length >= 2) {
					const cx = points[0].x;
					const cy = points[0].y;
					const r = Math.sqrt(
						(points[1].x - cx) ** 2 + (points[1].y - cy) ** 2
					);
					return `\n    <circle cx="${cx}" cy="${cy}" r="${r}" stroke="${color}" stroke-width="2.5" fill="${color}20"/>`;
				}
				break;
			default:
				break;
		}

		return "";
	}

	/**
	 * Export to CSV format
	 */
	private static exportToCSV(
		layers: LayerInfo[],
		elements: DrawingElement[]
	): string {
		const headers = [
			"Element ID",
			"Layer ID",
			"Layer Name",
			"Type",
			"Color",
			"Points Count",
			"Completed",
			"Has Text",
			"Group ID",
			"Created Layer At",
		];

		const rows = elements.map((element) => {
			const layer = layers.find((l) => l.id === element.layerId);
			return [
				element.id,
				element.layerId || "",
				layer?.name || "Default",
				element.type,
				element.color,
				element.points.length.toString(),
				element.completed.toString(),
				element.text ? "Yes" : "No",
				element.groupId || "",
				layer?.createdAt ? new Date(layer.createdAt).toISOString() : "",
			];
		});

		const csvContent = [headers, ...rows]
			.map((row) => row.map((cell) => `"${cell}"`).join(","))
			.join("\n");

		return csvContent;
	}

	/**
	 * Parse and import drawing data
	 */
	static importData(
		data: string | DrawingProject,
		options: ImportOptions = {}
	): {
		layers: LayerInfo[];
		elements: DrawingElement[];
		groups?: SerializedGroup[];
		metadata?: DrawingProject["metadata"];
		settings?: ProjectSettings;
	} {
		let project: DrawingProject;

		if (typeof data === "string") {
			try {
				project = JSON.parse(data);
			} catch {
				throw new Error("Invalid JSON format");
			}
		} else {
			project = data;
		}

		// Validate version compatibility
		if (project.version !== SERIALIZATION_VERSION) {
			console.warn(
				`Version mismatch: expected ${SERIALIZATION_VERSION}, got ${project.version}`
			);
		}

		// Process layers
		let layers: LayerInfo[] = project.layers || [];
		let elements: DrawingElement[] = project.elements || [];

		if (!options.preserveLayerStructure) {
			// Flatten all elements to active layer
			elements = elements.map((el) => ({
				...el,
				layerId: options.targetLayerId,
			}));
			if (options.targetLayerId) {
				layers = layers.filter((l) => l.id === options.targetLayerId);
			}
		}

		if (!options.preserveGrouping) {
			// Remove group information
			elements = elements.map((el) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { groupId, ...elementWithoutGroup } = el;
				return elementWithoutGroup;
			});
		}

		if (options.createNewLayers) {
			// Generate new layer IDs to avoid conflicts
			const layerIdMap = new Map<string, string>();
			layers = layers.map((layer) => {
				const newId = `imported_${layer.id}_${Date.now()}`;
				layerIdMap.set(layer.id, newId);
				return {
					...layer,
					id: newId,
					name: `${layer.name} (Imported)`,
					updatedAt: Date.now(),
				};
			});

			// Update element layer references
			elements = elements.map((el) => ({
				...el,
				layerId: el.layerId ? layerIdMap.get(el.layerId) : undefined,
			}));
		}

		return {
			layers,
			elements,
			groups: project.groups,
			metadata: project.metadata,
			settings: project.settings,
		};
	}

	/**
	 * Validate drawing project data
	 */
	static validate(project: DrawingProject): {
		valid: boolean;
		errors: string[];
		warnings: string[];
	} {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Check required fields
		if (!project.version) {
			errors.push("Missing version field");
		}

		if (!project.layers || !Array.isArray(project.layers)) {
			errors.push("Missing or invalid layers array");
		}

		if (!project.elements || !Array.isArray(project.elements)) {
			errors.push("Missing or invalid elements array");
		}

		// Validate layers
		const layerIds = new Set<string>();
		project.layers?.forEach((layer, index) => {
			if (!layer.id) {
				errors.push(`Layer ${index} missing ID`);
			} else if (layerIds.has(layer.id)) {
				errors.push(`Duplicate layer ID: ${layer.id}`);
			} else {
				layerIds.add(layer.id);
			}

			if (!layer.name) {
				warnings.push(`Layer ${layer.id || index} missing name`);
			}

			if (layer.opacity < 0 || layer.opacity > 1) {
				errors.push(`Layer ${layer.id} has invalid opacity: ${layer.opacity}`);
			}
		});

		// Validate elements
		const elementIds = new Set<string>();
		project.elements?.forEach((element, index) => {
			if (!element.id) {
				errors.push(`Element ${index} missing ID`);
			} else if (elementIds.has(element.id)) {
				errors.push(`Duplicate element ID: ${element.id}`);
			} else {
				elementIds.add(element.id);
			}

			if (
				!element.type ||
				!["line", "area", "curve", "rectangle", "circle"].includes(element.type)
			) {
				errors.push(
					`Element ${element.id || index} has invalid type: ${element.type}`
				);
			}

			if (!element.points || !Array.isArray(element.points)) {
				errors.push(
					`Element ${element.id || index} missing or invalid points array`
				);
			}

			if (element.layerId && !layerIds.has(element.layerId)) {
				warnings.push(
					`Element ${element.id} references non-existent layer: ${element.layerId}`
				);
			}
		});

		return {
			valid: errors.length === 0,
			errors,
			warnings,
		};
	}

	/**
	 * Create a backup of current state
	 */
	static createBackup(
		layers: LayerInfo[],
		elements: DrawingElement[],
		metadata?: Partial<DrawingProject["metadata"]>
	): string {
		const backup = DrawingSerializer.serialize(layers, elements, undefined, {
			...metadata,
			name: `Backup - ${new Date().toISOString()}`,
			description: "Automatic backup created by drawing application",
		});

		return JSON.stringify(backup, null, 2);
	}

	/**
	 * Generate export filename with timestamp
	 */
	static generateFilename(
		baseName: string = "drawing",
		format: string = "json",
		includeTimestamp: boolean = true
	): string {
		const timestamp = includeTimestamp
			? `_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}`
			: "";

		return `${baseName}${timestamp}.${format}`;
	}
}
