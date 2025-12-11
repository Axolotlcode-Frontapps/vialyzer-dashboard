import type { DrawingConfig } from "./config";
import type { DrawingState } from "./state";
import type {
	DrawingElement,
	LayerInfo,
	LayerVisibility,
	StateChangeEvent,
} from "./types";

// Re-export for backward compatibility
export type { LayerInfo, LayerVisibility };

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
	| "updateLayer"
	| "clearLayer"
	| "selectLayer"
	| "isolateLayer"
	| "groupLayers"
	| "ungroupLayers";

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
	category?: string[];
}

/**
 * DrawingLayers - Comprehensive layer management system
 * Provides advanced layering capabilities for organizing drawing elements
 */
export class DrawingLayers {
	#config: DrawingConfig;
	#state: DrawingState;
	#recordHistory: (operationType: string, description: string) => void;
	#generateElementId: () => string;

	constructor(
		config: DrawingConfig,
		state: DrawingState,
		recordHistory: (operationType: string, description: string) => void
	) {
		this.#config = config;
		this.#state = state;
		this.#recordHistory = recordHistory;
		// Use the same ID generation utility from the engine
		this.#generateElementId = () =>
			`element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		// Create default layer if none exist
		if (this.#state.layers.size === 0) {
			this.#createDefaultLayer();
		}
	}

	/**
	 * Create a new layer
	 */
	createLayer(options: {
		name: string;
		description: string;
		type?: "DETECTION" | "CONFIGURATION" | "NEAR_MISS";
		category: string[];
		opacity?: number;
		visibility?: LayerVisibility;
		color?: string;
		insertIndex?: number;
	}): LayerOperationResult {
		if (this.#state.layers.size >= this.#config.layers.max) {
			return {
				success: false,
				operation: "createLayer",
				affectedLayers: [],
				affectedElements: [],
				message: `Maximum layer limit (${this.#config.layers.max}) reached`,
			};
		}

		const layerId = this.#generateLayerId();
		const layerName = options.name;

		const layer: LayerInfo = {
			id: layerId,
			name: layerName,
			description: options.description,
			type: options.type || "CONFIGURATION",
			category: options.category,
			visibility: options.visibility || "visible",
			opacity: options.opacity ?? this.#config.layers.defaultOpacity,
			zIndex: this.#state.layerOrder.length,
			elementIds: [],
			color: options.color || this.#getNextLayerColor(),
			createdAt: Date.now(),
			updatedAt: Date.now(),
			syncState: "new",
			addedCategories: [],
			removedCategories: [],
		};

		this.#state.layers.set(layerId, layer);

		// Insert at specified index or at the top
		const insertIndex = options.insertIndex ?? this.#state.layerOrder.length;
		this.#state.layerOrder.splice(insertIndex, 0, layerId);
		this.#updateLayerZIndices();

		// Set as active layer if it's the first layer or no active layer
		if (!this.#state.activeLayerId || this.#state.layers.size === 1) {
			this.#state.activeLayerId = layerId;
		}
		this.#triggerStateChange("layerAction", {
			action: "layerCreated",
			layer,
		});
		this.#provideFeedback(`Created layer: ${layerName}`);

		// Record in history
		this.#recordHistory("createLayer", `Created layer: ${layerName}`);

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
		const layer = this.#state.layers.get(layerId);
		if (!layer) {
			return {
				success: false,
				operation: "deleteLayer",
				affectedLayers: [],
				affectedElements: [],
				message: "Layer not found",
			};
		}

		if (this.#state.layers.size === 1) {
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
		this.#state.layers.delete(layerId);
		this.#state.layerOrder = this.#state.layerOrder.filter(
			(id) => id !== layerId
		);
		this.#updateLayerZIndices();

		// Update active layer if necessary
		if (this.#state.activeLayerId === layerId) {
			this.#state.activeLayerId = this.#state.layerOrder[0] || null;
		}

		// Clear isolation if this layer was isolated
		if (this.#state.isolatedLayerId === layerId) {
			this.#state.isolatedLayerId = null;
		}

		// Delete all elements that belong to this layer
		if (affectedElements.length > 0) {
			// Filter out elements that belong to the deleted layer
			this.#state.elements = this.#state.elements.filter(
				(el) => !affectedElements.includes(el.id)
			);

			// Clear selection if any deleted elements were selected
			this.#state.selectedElements = this.#state.selectedElements.filter(
				(id) => !affectedElements.includes(id)
			);
		}

		this.#triggerStateChange("layerAction", {
			action: "layerDeleted",
			layerId,
			affectedElements,
		});
		this.#provideFeedback(
			`Deleted layer: ${layer.name} and ${affectedElements.length} element(s)`
		);

		// Record in history
		this.#recordHistory(
			"deleteLayer",
			`Deleted layer: ${layer.name} and ${affectedElements.length} element(s)`
		);

		return {
			success: true,
			operation: "deleteLayer",
			layerId,
			affectedLayers: [layerId],
			affectedElements,
			message: `Layer "${layer.name}" deleted successfully with ${affectedElements.length} element(s)`,
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
		const targetLayer = this.#state.layers.get(targetLayerId);
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
		for (const layer of this.#state.layers.values()) {
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
		const layer = this.#state.layers.get(layerId);
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

		// Mark layer as edited if it was previously saved
		if (layer.syncState === "saved") {
			layer.syncState = "edited";
		}

		this.#triggerStateChange("layerAction", {
			action: "layerVisibilityChanged",
			layerId,
			visibility: newVisibility,
		});
		this.#provideFeedback(`Layer "${layer.name}" is now ${newVisibility}`);

		// Record in history
		this.#recordHistory(
			"toggleLayerVisibility",
			`Layer "${layer.name}" is now ${newVisibility}`
		);

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
		const layer = this.#state.layers.get(layerId);
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

		// Mark layer as edited if it was previously saved
		if (layer.syncState === "saved") {
			layer.syncState = "edited";
		}

		this.#triggerStateChange("layerAction", {
			action: "layerOpacityChanged",
			layerId,
			opacity: clampedOpacity,
		});
		this.#provideFeedback(
			`Layer opacity set to ${Math.round(clampedOpacity * 100)}%`
		);

		// Record in history
		this.#recordHistory(
			"setLayerOpacity",
			`Layer "${layer.name}" opacity set to ${Math.round(clampedOpacity * 100)}%`
		);

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
		const validIds = newOrder.filter((id) => this.#state.layers.has(id));
		if (validIds.length !== this.#state.layers.size) {
			return {
				success: false,
				operation: "reorderLayer",
				affectedLayers: [],
				affectedElements: [],
				message: "Invalid layer order provided",
			};
		}

		this.#state.layerOrder = [...validIds];
		this.#updateLayerZIndices();

		this.#triggerStateChange("layersReordered", { layerOrder: validIds });
		this.#provideFeedback("Layers reordered");

		// Record in history
		this.#recordHistory("reorderLayers", "Reordered layers");

		return {
			success: true,
			operation: "reorderLayer",
			affectedLayers: validIds,
			affectedElements: [],
			message: "Layer order updated",
		};
	}

	/**
	 * Duplicate a layer and all its elements
	 */
	duplicateLayer(layerId: string): LayerOperationResult {
		const sourceLayer = this.#state.layers.get(layerId);
		if (!sourceLayer) {
			return {
				success: false,
				operation: "duplicateLayer",
				affectedLayers: [],
				affectedElements: [],
				message: "Source layer not found",
			};
		}

		// Get elements from the source layer
		const sourceElements = this.#state.elements.filter((el) =>
			sourceLayer.elementIds.includes(el.id)
		);

		// Duplicate elements with new IDs and assign to new layer
		const newLayerId = this.#generateLayerId();
		const duplicatedElements: DrawingElement[] = sourceElements.map(
			(element) => {
				const newId = this.#generateElementId();
				return {
					...element,
					id: newId,
					layerId: newLayerId,
					// Deep copy points
					points: element.points.map((point) => ({ ...point })),
					// Deep copy detection if exists
					detection: element.detection
						? {
								entry: element.detection.entry.map((point) => ({ ...point })),
								exit: element.detection.exit.map((point) => ({ ...point })),
							}
						: undefined,
					// Deep copy direction if exists
					direction: element.direction
						? {
								start: { ...element.direction.start },
								end: { ...element.direction.end },
							}
						: undefined,
					// Deep copy info (always required)
					info: { ...element.info },
					// Mark as new for sync tracking
					syncState: "new" as const,
				};
			}
		);

		const duplicatedElementIds = duplicatedElements.map((el) => el.id);

		const duplicatedLayer: LayerInfo = {
			id: newLayerId,
			name: `${sourceLayer.name} Copy`,
			description: sourceLayer.description,
			type: sourceLayer.type,
			category: [...sourceLayer.category],
			visibility: sourceLayer.visibility,
			opacity: sourceLayer.opacity,
			zIndex: sourceLayer.zIndex,
			elementIds: duplicatedElementIds, // Include duplicated element IDs
			color: sourceLayer.color,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			syncState: "new",
			addedCategories: [],
			removedCategories: [],
		};

		this.#state.layers.set(newLayerId, duplicatedLayer);

		// Insert above the source layer
		const sourceIndex = this.#state.layerOrder.indexOf(layerId);
		this.#state.layerOrder.splice(sourceIndex + 1, 0, newLayerId);
		this.#updateLayerZIndices();

		// Add duplicated elements to state
		this.#state.elements.push(...duplicatedElements);

		this.#triggerStateChange("layerAction", {
			action: "layerDuplicated",
			sourceLayerId: layerId,
			newLayer: duplicatedLayer,
			elements: duplicatedElements,
		});
		this.#provideFeedback(
			`Duplicated layer: ${sourceLayer.name} with ${duplicatedElements.length} element(s)`
		);

		// Record in history
		this.#recordHistory(
			"duplicateLayer",
			`Duplicated layer: ${sourceLayer.name} with ${duplicatedElements.length} element(s)`
		);

		return {
			success: true,
			operation: "duplicateLayer",
			layerId: newLayerId,
			affectedLayers: [newLayerId],
			affectedElements: duplicatedElementIds,
			message: `Layer "${sourceLayer.name}" duplicated successfully with ${duplicatedElements.length} element(s)`,
			data: { layer: duplicatedLayer, elements: duplicatedElements },
		};
	}

	/**
	 * Rename a layer
	 */
	renameLayer(layerId: string, newName: string): LayerOperationResult {
		const layer = this.#state.layers.get(layerId);
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

		// Mark layer as edited if it was previously saved
		if (layer.syncState === "saved") {
			layer.syncState = "edited";
		}

		this.#triggerStateChange("layerAction", {
			action: "layerRenamed",
			layerId,
			oldName,
			newName: trimmedName,
		});
		this.#provideFeedback(
			`Layer renamed from "${oldName}" to "${trimmedName}"`
		);

		// Record in history
		this.#recordHistory(
			"renameLayer",
			`Renamed layer from "${oldName}" to "${trimmedName}"`
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

	updateLayer(
		layerId: string,
		updates: Partial<Omit<LayerInfo, "id">>
	): LayerOperationResult {
		const layer = this.#state.layers.get(layerId);
		if (!layer) {
			return {
				success: false,
				operation: "updateLayer",
				affectedLayers: [],
				affectedElements: [],
				message: "Layer not found",
			};
		}

		// Track category changes if category is being updated
		if (updates.category) {
			const oldCategories = new Set(layer.category);
			const newCategories = new Set(updates.category);

			// Initialize tracking arrays if they don't exist
			if (!layer.addedCategories) layer.addedCategories = [];
			if (!layer.removedCategories) layer.removedCategories = [];

			// Track added categories (in new but not in old)
			newCategories.forEach((cat) => {
				if (!oldCategories.has(cat) && !layer.addedCategories!.includes(cat)) {
					layer.addedCategories!.push(cat);
				}
			});

			// Track removed categories (in old but not in new)
			oldCategories.forEach((cat) => {
				if (
					!newCategories.has(cat) &&
					!layer.removedCategories!.includes(cat)
				) {
					layer.removedCategories!.push(cat);
				}
			});

			// Remove from addedCategories if it was re-removed
			layer.addedCategories = layer.addedCategories.filter((cat) =>
				newCategories.has(cat)
			);

			// Remove from removedCategories if it was re-added
			layer.removedCategories = layer.removedCategories.filter(
				(cat) => !newCategories.has(cat)
			);
		}

		Object.assign(layer, updates, { updatedAt: Date.now() });

		// Mark layer as edited if it was previously saved
		if (layer.syncState === "saved") {
			layer.syncState = "edited";
		}

		this.#triggerStateChange("layerAction", {
			action: "layerUpdated",
			layer,
		});

		this.#provideFeedback(`Updated layer: ${layer.name}`);

		this.#recordHistory("updateLayer", `Updated layer: ${layer.name}`);

		return {
			success: true,
			operation: "updateLayer",
			layerId,
			affectedLayers: [layerId],
			affectedElements: layer.elementIds,
			message: `Layer "${layer.name}" updated successfully`,
			data: { layer },
		};
	}

	/**
	 * Set active layer
	 */
	setActiveLayer(layerId: string): LayerOperationResult {
		if (!this.#state.layers.has(layerId)) {
			return {
				success: false,
				operation: "selectLayer",
				affectedLayers: [],
				affectedElements: [],
				message: "Layer not found",
			};
		}

		const previousActiveId = this.#state.activeLayerId;
		this.#state.activeLayerId = layerId;

		this.#triggerStateChange("layerAction", {
			action: "activeLayerChanged",
			previousLayerId: previousActiveId,
			activeLayerId: layerId,
		});

		// Record in history
		const layer = this.#state.layers.get(layerId);
		this.#recordHistory(
			"setActiveLayer",
			`Set active layer: ${layer?.name || layerId}`
		);

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
		const layer = this.#state.layers.get(layerId);
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
		if (this.#state.isolatedLayerId === layerId) {
			this.#state.isolatedLayerId = null;
			this.#triggerStateChange("layerAction", {
				action: "layerIsolationCleared",
			});
			this.#provideFeedback("Layer isolation cleared");
		} else {
			this.#state.isolatedLayerId = layerId;
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
			message: this.#state.isolatedLayerId
				? `Layer "${layer.name}" isolated`
				: "Layer isolation cleared",
		};
	}

	/**
	 * Get all layers in order (bottom to top)
	 */
	getLayers(): LayerInfo[] {
		return this.#state.layerOrder
			.map((id) => this.#state.layers.get(id))
			.filter((layer): layer is LayerInfo => layer !== undefined);
	}

	/**
	 * Get layer by ID
	 */
	getLayer(layerId: string): LayerInfo | undefined {
		return this.#state.layers.get(layerId);
	}

	/**
	 * Get active layer
	 */
	getActiveLayer(): LayerInfo | null {
		return this.#state.activeLayerId
			? this.#state.layers.get(this.#state.activeLayerId) || null
			: null;
	}

	/**
	 * Get visible layers (respecting isolation)
	 */
	getVisibleLayers(): LayerInfo[] {
		const allLayers = this.getLayers();

		if (this.#state.isolatedLayerId) {
			const isolatedLayer = this.#state.layers.get(this.#state.isolatedLayerId);
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
			if (
				filter.category &&
				!filter.category.some((cat) => layer.category.includes(cat))
			) {
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
			isolatedLayer: this.#state.isolatedLayerId,
		};
	}

	/**
	 * Clear all layers and reset to default
	 */
	reset(): void {
		this.#state.layers.clear();
		this.#state.layerOrder = [];
		this.#state.activeLayerId = null;
		this.#state.isolatedLayerId = null;
		this.#state.layerCounter = 0;
		this.#createDefaultLayer();
	}

	// Private helper methods

	#createDefaultLayer(): void {
		const defaultLayerId = this.#generateLayerId();
		const defaultLayerConfig = this.#config.layers.defaultLayer;

		const defaultLayer: LayerInfo = {
			id: defaultLayerId,
			name:
				defaultLayerConfig?.name || `${this.#config.layers.defaultPrefix} 1`,
			description:
				defaultLayerConfig?.description || "Default layer description",
			type: "CONFIGURATION",
			category: defaultLayerConfig?.category || [],
			visibility: defaultLayerConfig?.visibility || "visible",
			opacity:
				defaultLayerConfig?.opacity ?? this.#config.layers.defaultOpacity,
			zIndex: 0,
			elementIds: [],
			color: defaultLayerConfig?.color || this.#config.layers.colors[0],
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		this.#state.layers.set(defaultLayerId, defaultLayer);
		this.#state.layerOrder.push(defaultLayerId);
		this.#state.activeLayerId = defaultLayerId;
	}

	#generateLayerId(): string {
		return `layer_${++this.#state.layerCounter}_${Date.now()}`;
	}

	#getNextLayerColor(): string {
		const colorIndex =
			this.#state.layers.size % this.#config.layers.colors.length;
		return this.#config.layers.colors[colorIndex];
	}

	#updateLayerZIndices(): void {
		this.#state.layerOrder.forEach((layerId, index) => {
			const layer = this.#state.layers.get(layerId);
			if (layer) {
				layer.zIndex = index;
			}
		});
	}

	#triggerStateChange(action: string, data: Record<string, unknown>): void {
		this.#config.on.stateChange({
			type: "layerAction",
			action,
			...data,
		} as StateChangeEvent);
	}

	#provideFeedback(message: string): void {
		this.#config.on.feedback(message);
	}
}
