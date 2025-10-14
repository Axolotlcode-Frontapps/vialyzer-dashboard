import type {
	DrawingElement,
	FeedbackCallback,
	StateChangeCallback,
} from "./types";

/**
 * Layer visibility states
 */
export type LayerVisibility = "visible" | "hidden" | "locked";

/**
 * Layer information
 */
export interface LayerInfo {
	id: string;
	name: string;
	visibility: LayerVisibility;
	opacity: number; // 0.0 to 1.0
	zIndex: number;
	elementIds: string[];
	color?: string; // Layer color indicator
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
 * Layer operation types
 */
type LayerOperation =
	| "createLayer"
	| "deleteLayer"
	| "duplicateLayer"
	| "mergeLayer"
	| "moveToLayer"
	| "reorderLayer"
	| "toggleVisibility"
	| "lockLayer"
	| "unlockLayer"
	| "setOpacity"
	| "renameLayer"
	| "clearLayer"
	| "selectLayer"
	| "isolateLayer"
	| "groupLayers"
	| "ungroupLayers";

/**
 * Layer configuration
 */
interface LayerConfig {
	/**
	 * Default layer name prefix
	 */
	defaultLayerPrefix: string;
	/**
	 * Maximum number of layers
	 */
	maxLayers: number;
	/**
	 * Default opacity for new layers
	 */
	defaultOpacity: number;
	/**
	 * Whether to auto-name layers
	 */
	autoNameLayers: boolean;
	/**
	 * Layer colors for UI indication
	 */
	layerColors: string[];
	/**
	 * Container bounds for fit operations
	 */
	containerBounds?: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	/**
	 * Whether to enable layer grouping features
	 */
	enableLayerGroups: boolean;
}

/**
 * Layer operation result
 */
interface LayerOperationResult {
	success: boolean;
	operation: LayerOperation;
	layerId?: string;
	affectedLayers: string[];
	affectedElements: string[];
	message: string;
	data?: {
		layer?: LayerInfo;
		layers?: LayerInfo[];
		elements?: DrawingElement[];
	};
}

/**
 * Layer group information (for future implementation)
 */
// interface LayerGroup {
// 	id: string;
// 	name: string;
// 	layerIds: string[];
// 	collapsed: boolean;
// 	color?: string;
// 	createdAt: number;
// }

/**
 * Layer filter criteria
 */
interface LayerFilter {
	visibility?: LayerVisibility[];
	opacity?: { min?: number; max?: number };
	hasElements?: boolean;
	namePattern?: RegExp;
	tags?: string[];
	category?: string;
}

/**
 * Callback interfaces for layer operations
 */
interface DrawingLayersCallbacks {
	onStateChange: StateChangeCallback;
	onFeedback: FeedbackCallback;
}

/**
 * DrawingLayers - Comprehensive layer management system
 * Provides advanced layering capabilities for organizing drawing elements
 */
export class DrawingLayers {
	#onStateChange: StateChangeCallback | null = null;
	#onFeedback: FeedbackCallback | null = null;
	#config: LayerConfig;

	// Layer management
	#layers: Map<string, LayerInfo> = new Map();
	#layerOrder: string[] = []; // Ordered from bottom to top
	#activeLayerId: string | null = null;
	#layerCounter = 0;

	// Future layer grouping implementation
	// #layerGroups: Map<string, LayerGroup> = new Map();
	// #groupCounter = 0;

	// State tracking
	#isolatedLayerId: string | null = null;
	#layerHistory: {
		operation: LayerOperation;
		timestamp: number;
		data: unknown;
	}[] = [];

	constructor(config?: Partial<LayerConfig>) {
		this.#config = {
			defaultLayerPrefix: "Layer",
			maxLayers: 100,
			defaultOpacity: 1.0,
			autoNameLayers: true,
			layerColors: [
				"#FF6B6B", // Red
				"#4ECDC4", // Teal
				"#45B7D1", // Blue
				"#96CEB4", // Green
				"#FECA57", // Yellow
				"#FF9FF3", // Pink
				"#54A0FF", // Light Blue
				"#5F27CD", // Purple
				"#00D2D3", // Cyan
				"#FF9F43", // Orange
			],
			enableLayerGroups: false,
			...config,
		};

		// Create default layer
		this.#createDefaultLayer();
	}

	/**
	 * Initialize with callbacks
	 */
	initialize(callbacks: DrawingLayersCallbacks): void {
		this.#onStateChange = callbacks.onStateChange;
		this.#onFeedback = callbacks.onFeedback;
	}

	/**
	 * Create a new layer
	 */
	createLayer(
		name?: string,
		options?: {
			opacity?: number;
			visibility?: LayerVisibility;
			color?: string;
			insertIndex?: number;
		}
	): LayerOperationResult {
		if (this.#layers.size >= this.#config.maxLayers) {
			return {
				success: false,
				operation: "createLayer",
				affectedLayers: [],
				affectedElements: [],
				message: `Maximum layer limit (${this.#config.maxLayers}) reached`,
			};
		}

		const layerId = this.#generateLayerId();
		const layerName =
			name ||
			(this.#config.autoNameLayers
				? `${this.#config.defaultLayerPrefix} ${this.#layerCounter}`
				: `${this.#config.defaultLayerPrefix}`);

		const layer: LayerInfo = {
			id: layerId,
			name: layerName,
			visibility: options?.visibility || "visible",
			opacity: options?.opacity ?? this.#config.defaultOpacity,
			zIndex: this.#layerOrder.length,
			elementIds: [],
			color: options?.color || this.#getNextLayerColor(),
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		this.#layers.set(layerId, layer);

		// Insert at specified index or at the top
		const insertIndex = options?.insertIndex ?? this.#layerOrder.length;
		this.#layerOrder.splice(insertIndex, 0, layerId);
		this.#updateLayerZIndices();

		// Set as active layer if it's the first layer or no active layer
		if (!this.#activeLayerId || this.#layers.size === 1) {
			this.#activeLayerId = layerId;
		}

		this.#recordOperation("createLayer", { layer });
		this.#triggerStateChange("layerAction", {
			action: "layerCreated",
			layer,
		});
		this.#provideFeedback(`Created layer: ${layerName}`);

		return {
			success: true,
			operation: "createLayer",
			layerId,
			affectedLayers: [layerId],
			affectedElements: [],
			message: `Layer "${layerName}" created successfully`,
			data: { layer },
		};
	}

	/**
	 * Delete a layer
	 */
	deleteLayer(layerId: string): LayerOperationResult {
		const layer = this.#layers.get(layerId);
		if (!layer) {
			return {
				success: false,
				operation: "deleteLayer",
				affectedLayers: [],
				affectedElements: [],
				message: "Layer not found",
			};
		}

		if (this.#layers.size === 1) {
			return {
				success: false,
				operation: "deleteLayer",
				affectedLayers: [],
				affectedElements: [],
				message: "Cannot delete the last layer",
			};
		}

		const affectedElements = [...layer.elementIds];

		// Remove layer
		this.#layers.delete(layerId);
		this.#layerOrder = this.#layerOrder.filter((id) => id !== layerId);
		this.#updateLayerZIndices();

		// Update active layer if necessary
		if (this.#activeLayerId === layerId) {
			this.#activeLayerId = this.#layerOrder[0] || null;
		}

		// Clear isolation if this layer was isolated
		if (this.#isolatedLayerId === layerId) {
			this.#isolatedLayerId = null;
		}

		// Move elements to active layer or delete them
		if (affectedElements.length > 0) {
			this.#triggerStateChange("moveElementsToLayer", {
				elementIds: affectedElements,
				targetLayerId: this.#activeLayerId,
				sourceLayerId: layerId,
			});
		}

		this.#recordOperation("deleteLayer", { layerId, layer });
		this.#triggerStateChange("layerAction", {
			action: "layerDeleted",
			layerId,
			affectedElements,
		});
		this.#provideFeedback(`Deleted layer: ${layer.name}`);

		return {
			success: true,
			operation: "deleteLayer",
			layerId,
			affectedLayers: [layerId],
			affectedElements,
			message: `Layer "${layer.name}" deleted successfully`,
		};
	}

	/**
	 * Move elements to a specific layer
	 */
	moveElementsToLayer(
		elementIds: string[],
		targetLayerId: string,
		elements: DrawingElement[]
	): LayerOperationResult {
		const targetLayer = this.#layers.get(targetLayerId);
		if (!targetLayer) {
			return {
				success: false,
				operation: "moveToLayer",
				affectedLayers: [],
				affectedElements: [],
				message: "Target layer not found",
			};
		}

		const validElementIds = elementIds.filter((id) =>
			elements.some((el) => el.id === id)
		);

		if (validElementIds.length === 0) {
			return {
				success: false,
				operation: "moveToLayer",
				affectedLayers: [],
				affectedElements: [],
				message: "No valid elements to move",
			};
		}

		const affectedLayers: string[] = [];

		// Remove elements from their current layers
		for (const layer of this.#layers.values()) {
			const originalLength = layer.elementIds.length;
			layer.elementIds = layer.elementIds.filter(
				(id) => !validElementIds.includes(id)
			);
			if (layer.elementIds.length !== originalLength) {
				affectedLayers.push(layer.id);
				layer.updatedAt = Date.now();
			}
		}

		// Add elements to target layer
		targetLayer.elementIds.push(...validElementIds);
		targetLayer.updatedAt = Date.now();
		if (!affectedLayers.includes(targetLayerId)) {
			affectedLayers.push(targetLayerId);
		}

		// Update elements with layer information
		const updatedElements = elements.map((element) => {
			if (validElementIds.includes(element.id)) {
				return { ...element, layerId: targetLayerId };
			}
			return element;
		});

		this.#recordOperation("moveToLayer", {
			elementIds: validElementIds,
			targetLayerId,
		});
		this.#triggerStateChange("updateElements", { elements: updatedElements });
		this.#triggerStateChange("elementsMovedToLayer", {
			elementIds: validElementIds,
			targetLayerId,
			affectedLayers,
		});
		this.#provideFeedback(
			`Moved ${validElementIds.length} elements to layer: ${targetLayer.name}`
		);

		return {
			success: true,
			operation: "moveToLayer",
			layerId: targetLayerId,
			affectedLayers,
			affectedElements: validElementIds,
			message: `Elements moved to layer "${targetLayer.name}"`,
		};
	}

	/**
	 * Toggle layer visibility
	 */
	toggleLayerVisibility(layerId: string): LayerOperationResult {
		const layer = this.#layers.get(layerId);
		if (!layer) {
			return {
				success: false,
				operation: "toggleVisibility",
				affectedLayers: [],
				affectedElements: [],
				message: "Layer not found",
			};
		}

		const newVisibility = layer.visibility === "visible" ? "hidden" : "visible";
		layer.visibility = newVisibility;
		layer.updatedAt = Date.now();

		this.#recordOperation("toggleVisibility", { layerId, newVisibility });
		this.#triggerStateChange("layerAction", {
			action: "layerVisibilityChanged",
			layerId,
			visibility: newVisibility,
		});
		this.#provideFeedback(`Layer "${layer.name}" is now ${newVisibility}`);

		return {
			success: true,
			operation: "toggleVisibility",
			layerId,
			affectedLayers: [layerId],
			affectedElements: layer.elementIds,
			message: `Layer visibility changed to ${newVisibility}`,
		};
	}

	/**
	 * Set layer opacity
	 */
	setLayerOpacity(layerId: string, opacity: number): LayerOperationResult {
		const layer = this.#layers.get(layerId);
		if (!layer) {
			return {
				success: false,
				operation: "setOpacity",
				affectedLayers: [],
				affectedElements: [],
				message: "Layer not found",
			};
		}

		const clampedOpacity = Math.max(0, Math.min(1, opacity));
		layer.opacity = clampedOpacity;
		layer.updatedAt = Date.now();

		this.#recordOperation("setOpacity", { layerId, opacity: clampedOpacity });
		this.#triggerStateChange("layerAction", {
			action: "layerOpacityChanged",
			layerId,
			opacity: clampedOpacity,
		});

		return {
			success: true,
			operation: "setOpacity",
			layerId,
			affectedLayers: [layerId],
			affectedElements: layer.elementIds,
			message: `Layer opacity set to ${Math.round(clampedOpacity * 100)}%`,
		};
	}

	/**
	 * Reorder layers
	 */
	reorderLayers(newOrder: string[]): LayerOperationResult {
		// Validate that all layer IDs exist
		const validIds = newOrder.filter((id) => this.#layers.has(id));
		if (validIds.length !== this.#layers.size) {
			return {
				success: false,
				operation: "reorderLayer",
				affectedLayers: [],
				affectedElements: [],
				message: "Invalid layer order provided",
			};
		}

		this.#layerOrder = [...validIds];
		this.#updateLayerZIndices();

		this.#recordOperation("reorderLayer", { newOrder: validIds });
		this.#triggerStateChange("layersReordered", { layerOrder: validIds });

		return {
			success: true,
			operation: "reorderLayer",
			affectedLayers: validIds,
			affectedElements: [],
			message: "Layer order updated",
		};
	}

	/**
	 * Duplicate a layer
	 */
	duplicateLayer(layerId: string): LayerOperationResult {
		const sourceLayer = this.#layers.get(layerId);
		if (!sourceLayer) {
			return {
				success: false,
				operation: "duplicateLayer",
				affectedLayers: [],
				affectedElements: [],
				message: "Source layer not found",
			};
		}

		const newLayerId = this.#generateLayerId();
		const duplicatedLayer: LayerInfo = {
			...sourceLayer,
			id: newLayerId,
			name: `${sourceLayer.name} Copy`,
			elementIds: [], // Elements are not duplicated, only layer structure
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		this.#layers.set(newLayerId, duplicatedLayer);

		// Insert above the source layer
		const sourceIndex = this.#layerOrder.indexOf(layerId);
		this.#layerOrder.splice(sourceIndex + 1, 0, newLayerId);
		this.#updateLayerZIndices();

		this.#recordOperation("duplicateLayer", {
			sourceLayerId: layerId,
			newLayerId,
		});
		this.#triggerStateChange("layerAction", {
			action: "layerDuplicated",
			sourceLayerId: layerId,
			newLayer: duplicatedLayer,
		});
		this.#provideFeedback(`Duplicated layer: ${sourceLayer.name}`);

		return {
			success: true,
			operation: "duplicateLayer",
			layerId: newLayerId,
			affectedLayers: [newLayerId],
			affectedElements: [],
			message: `Layer "${sourceLayer.name}" duplicated successfully`,
			data: { layer: duplicatedLayer },
		};
	}

	/**
	 * Rename a layer
	 */
	renameLayer(layerId: string, newName: string): LayerOperationResult {
		const layer = this.#layers.get(layerId);
		if (!layer) {
			return {
				success: false,
				operation: "renameLayer",
				affectedLayers: [],
				affectedElements: [],
				message: "Layer not found",
			};
		}

		const trimmedName = newName.trim();
		if (!trimmedName) {
			return {
				success: false,
				operation: "renameLayer",
				affectedLayers: [],
				affectedElements: [],
				message: "Layer name cannot be empty",
			};
		}

		const oldName = layer.name;
		layer.name = trimmedName;
		layer.updatedAt = Date.now();

		this.#recordOperation("renameLayer", {
			layerId,
			oldName,
			newName: trimmedName,
		});
		this.#triggerStateChange("layerAction", {
			action: "layerRenamed",
			layerId,
			oldName,
			newName: trimmedName,
		});
		this.#provideFeedback(
			`Layer renamed from "${oldName}" to "${trimmedName}"`
		);

		return {
			success: true,
			operation: "renameLayer",
			layerId,
			affectedLayers: [layerId],
			affectedElements: layer.elementIds,
			message: `Layer renamed to "${trimmedName}"`,
		};
	}

	/**
	 * Set active layer
	 */
	setActiveLayer(layerId: string): LayerOperationResult {
		if (!this.#layers.has(layerId)) {
			return {
				success: false,
				operation: "selectLayer",
				affectedLayers: [],
				affectedElements: [],
				message: "Layer not found",
			};
		}

		const previousActiveId = this.#activeLayerId;
		this.#activeLayerId = layerId;

		this.#triggerStateChange("layerAction", {
			action: "activeLayerChanged",
			previousLayerId: previousActiveId,
			activeLayerId: layerId,
		});

		return {
			success: true,
			operation: "selectLayer",
			layerId,
			affectedLayers: [layerId],
			affectedElements: [],
			message: "Active layer changed",
		};
	}

	/**
	 * Isolate a layer (hide all others)
	 */
	isolateLayer(layerId: string): LayerOperationResult {
		const layer = this.#layers.get(layerId);
		if (!layer) {
			return {
				success: false,
				operation: "isolateLayer",
				affectedLayers: [],
				affectedElements: [],
				message: "Layer not found",
			};
		}

		// If already isolated, un-isolate
		if (this.#isolatedLayerId === layerId) {
			this.#isolatedLayerId = null;
			this.#triggerStateChange("layerAction", {
				action: "layerIsolationCleared",
			});
			this.#provideFeedback("Layer isolation cleared");
		} else {
			this.#isolatedLayerId = layerId;
			this.#triggerStateChange("layerAction", {
				action: "layerIsolated",
				layerId,
			});
			this.#provideFeedback(`Isolated layer: ${layer.name}`);
		}

		return {
			success: true,
			operation: "isolateLayer",
			layerId,
			affectedLayers: [layerId],
			affectedElements: [],
			message: this.#isolatedLayerId
				? `Layer "${layer.name}" isolated`
				: "Layer isolation cleared",
		};
	}

	/**
	 * Get all layers in order (bottom to top)
	 */
	getLayers(): LayerInfo[] {
		return this.#layerOrder
			.map((id) => this.#layers.get(id))
			.filter((layer): layer is LayerInfo => layer !== undefined);
	}

	/**
	 * Get layer by ID
	 */
	getLayer(layerId: string): LayerInfo | null {
		return this.#layers.get(layerId) || null;
	}

	/**
	 * Get active layer
	 */
	getActiveLayer(): LayerInfo | null {
		return this.#activeLayerId
			? this.#layers.get(this.#activeLayerId) || null
			: null;
	}

	/**
	 * Get visible layers (respecting isolation)
	 */
	getVisibleLayers(): LayerInfo[] {
		const allLayers = this.getLayers();

		if (this.#isolatedLayerId) {
			const isolatedLayer = this.#layers.get(this.#isolatedLayerId);
			return isolatedLayer ? [isolatedLayer] : [];
		}

		return allLayers.filter((layer) => layer.visibility === "visible");
	}

	/**
	 * Get layers by filter criteria
	 */
	getLayersByFilter(filter: LayerFilter): LayerInfo[] {
		return this.getLayers().filter((layer) => {
			if (filter.visibility && !filter.visibility.includes(layer.visibility)) {
				return false;
			}
			if (filter.opacity) {
				if (
					filter.opacity.min !== undefined &&
					layer.opacity < filter.opacity.min
				) {
					return false;
				}
				if (
					filter.opacity.max !== undefined &&
					layer.opacity > filter.opacity.max
				) {
					return false;
				}
			}
			if (filter.hasElements !== undefined) {
				const hasElements = layer.elementIds.length > 0;
				if (filter.hasElements !== hasElements) {
					return false;
				}
			}
			if (filter.namePattern && !filter.namePattern.test(layer.name)) {
				return false;
			}
			if (filter.tags && layer.metadata?.tags) {
				const hasMatchingTag = filter.tags.some((tag) =>
					layer.metadata?.tags?.includes(tag)
				);
				if (!hasMatchingTag) {
					return false;
				}
			}
			if (filter.category && layer.metadata?.category !== filter.category) {
				return false;
			}
			return true;
		});
	}

	/**
	 * Get layer statistics
	 */
	getLayerStats(): {
		totalLayers: number;
		visibleLayers: number;
		lockedLayers: number;
		layersWithElements: number;
		totalElements: number;
		isolatedLayer: string | null;
	} {
		const layers = this.getLayers();

		return {
			totalLayers: layers.length,
			visibleLayers: layers.filter((l) => l.visibility === "visible").length,
			lockedLayers: layers.filter((l) => l.visibility === "locked").length,
			layersWithElements: layers.filter((l) => l.elementIds.length > 0).length,
			totalElements: layers.reduce((sum, l) => sum + l.elementIds.length, 0),
			isolatedLayer: this.#isolatedLayerId,
		};
	}

	/**
	 * Update layer configuration
	 */
	updateConfig(config: Partial<LayerConfig>): void {
		this.#config = { ...this.#config, ...config };
	}

	/**
	 * Get current configuration
	 */
	getConfig(): LayerConfig {
		return { ...this.#config };
	}

	/**
	 * Clear all layers and reset to default
	 */
	reset(): void {
		this.#layers.clear();
		this.#layerOrder = [];
		this.#activeLayerId = null;
		this.#isolatedLayerId = null;
		this.#layerCounter = 0;
		this.#layerHistory = [];
		this.#createDefaultLayer();
	}

	// Private helper methods

	#createDefaultLayer(): void {
		const defaultLayerId = this.#generateLayerId();
		const defaultLayer: LayerInfo = {
			id: defaultLayerId,
			name: `${this.#config.defaultLayerPrefix} 1`,
			visibility: "visible",
			opacity: this.#config.defaultOpacity,
			zIndex: 0,
			elementIds: [],
			color: this.#config.layerColors[0],
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		this.#layers.set(defaultLayerId, defaultLayer);
		this.#layerOrder.push(defaultLayerId);
		this.#activeLayerId = defaultLayerId;
	}

	#generateLayerId(): string {
		return `layer_${++this.#layerCounter}_${Date.now()}`;
	}

	#getNextLayerColor(): string {
		const colorIndex = this.#layers.size % this.#config.layerColors.length;
		return this.#config.layerColors[colorIndex];
	}

	#updateLayerZIndices(): void {
		this.#layerOrder.forEach((layerId, index) => {
			const layer = this.#layers.get(layerId);
			if (layer) {
				layer.zIndex = index;
			}
		});
	}

	#recordOperation(operation: LayerOperation, data: unknown): void {
		this.#layerHistory.push({
			operation,
			timestamp: Date.now(),
			data,
		});

		// Keep only last 100 operations
		if (this.#layerHistory.length > 100) {
			this.#layerHistory = this.#layerHistory.slice(-100);
		}
	}

	#triggerStateChange(action: string, data: Record<string, unknown>): void {
		if (this.#onStateChange) {
			this.#onStateChange({
				type: "layerAction",
				action,
				...data,
			});
		}
	}

	#provideFeedback(message: string): void {
		if (this.#onFeedback) {
			this.#onFeedback(message);
		}
	}
}
