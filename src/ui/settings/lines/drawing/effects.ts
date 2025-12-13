import type { DrawingConfig } from "./config";
import type { LayerInfo } from "./layers";
import type { DrawingElement, FeedbackCallback, Point, StateChangeCallback } from "./types";

/**
 * Layer effect types
 */
export type LayerEffectType =
	| "drop-shadow"
	| "inner-shadow"
	| "outer-glow"
	| "inner-glow"
	| "bevel-emboss"
	| "color-overlay"
	| "gradient-overlay"
	| "stroke"
	| "blur"
	| "noise";

/**
 * Smart guide types
 */
export type SmartGuideType =
	| "alignment"
	| "distribution"
	| "spacing"
	| "rotation"
	| "snap-to-grid"
	| "snap-to-element"
	| "smart-spacing";

/**
 * Layer effect configuration
 */
export interface LayerEffect {
	id: string;
	type: LayerEffectType;
	enabled: boolean;
	opacity: number;
	config: LayerEffectConfig;
}

/**
 * Effect-specific configurations
 */
export interface LayerEffectConfig {
	// Drop Shadow / Inner Shadow
	shadowColor?: string;
	shadowOffset?: Point;
	shadowBlur?: number;
	shadowSpread?: number;

	// Glow effects
	glowColor?: string;
	glowSize?: number;
	glowSpread?: number;
	glowNoise?: number;

	// Bevel & Emboss
	bevelStyle?: "outer-bevel" | "inner-bevel" | "emboss" | "pillow-emboss";
	bevelSize?: number;
	bevelSoften?: number;
	highlightColor?: string;
	highlightOpacity?: number;
	shadowAngle?: number;
	shadowAltitude?: number;

	// Color/Gradient Overlay
	overlayColor?: string;
	gradientStops?: Array<{
		position: number;
		color: string;
		opacity: number;
	}>;
	gradientType?: "linear" | "radial" | "angular";
	gradientAngle?: number;

	// Stroke
	strokeWidth?: number;
	strokeColor?: string;
	strokePosition?: "inside" | "center" | "outside";
	strokeStyle?: "solid" | "dashed" | "dotted";

	// Blur
	blurRadius?: number;
	blurType?: "gaussian" | "motion" | "radial";
	blurAngle?: number;

	// Noise
	noiseAmount?: number;
	noiseType?: "uniform" | "gaussian";
	noiseMonochromatic?: boolean;
}

/**
 * Smart guide configuration
 */
export interface SmartGuide {
	id: string;
	type: SmartGuideType;
	enabled: boolean;
	tolerance: number;
	showVisualFeedback: boolean;
	config: SmartGuideConfig;
}

/**
 * Smart guide specific configurations
 */
export interface SmartGuideConfig {
	// Grid snapping
	gridSize?: number;
	gridSubdivisions?: number;
	gridColor?: string;
	gridOpacity?: number;

	// Element snapping
	snapToCenter?: boolean;
	snapToEdges?: boolean;
	snapToCorners?: boolean;
	snapDistance?: number;

	// Alignment guides
	showAlignmentLines?: boolean;
	alignmentLineColor?: string;
	alignmentLineThickness?: number;

	// Distribution guides
	showDistributionMarkers?: boolean;
	distributionMarkerColor?: string;

	// Smart spacing
	suggestEvenSpacing?: boolean;
	spacingTolerance?: number;
	minimumSpacing?: number;

	// Rotation snapping
	rotationSnapAngle?: number;
	showRotationIndicator?: boolean;
}

/**
 * Guide line for visual feedback
 */
export interface GuideLine {
	id: string;
	type: "horizontal" | "vertical" | "angled";
	start: Point;
	end: Point;
	color: string;
	thickness: number;
	style: "solid" | "dashed" | "dotted";
	temporary: boolean;
}

/**
 * Snap point for element positioning
 */
export interface SnapPoint {
	id: string;
	point: Point;
	type: "center" | "edge" | "corner" | "grid" | "custom";
	elementId?: string;
	layerId?: string;
	magnetic: boolean;
	tolerance: number;
}

/**
 * Effect operation result
 */
export interface EffectOperationResult {
	success: boolean;
	operation: string;
	affectedLayers: string[];
	message: string;
	data?: {
		effect?: LayerEffect;
		guide?: SmartGuide;
		snapPoints?: SnapPoint[];
	};
}

/**
 * Callback interfaces for effect operations
 */
export interface DrawingEffectsCallbacks {
	onStateChange: StateChangeCallback;
	onFeedback: FeedbackCallback;
}

/**
 * Element bounds interface
 */
interface ElementBounds {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
	centerX: number;
	centerY: number;
}

/**
 * Guide application result
 */
interface GuideApplicationResult {
	snapped: boolean;
	position: Point;
	snapPoints: SnapPoint[];
	guideLines: GuideLine[];
}

/**
 * DrawingEffects - Advanced layer effects and smart guide system
 * Provides professional-grade visual effects and intelligent drawing assistance
 */
export class DrawingEffects {
	#config: DrawingConfig;

	// Effect management
	#layerEffects: Map<string, LayerEffect[]> = new Map();
	#effectCounter = 0;

	// Smart guides
	#smartGuides: Map<string, SmartGuide> = new Map();
	#activeGuideLines: Map<string, GuideLine> = new Map();
	#snapPoints: Map<string, SnapPoint> = new Map();
	#guideCounter = 0;

	// State tracking
	#isDragging = false;
	#temporaryGuides: string[] = [];

	constructor(config: DrawingConfig) {
		this.#config = config;

		this.#initializeDefaultGuides();
	}

	// === LAYER EFFECTS ===

	/**
	 * Add effect to layer
	 */
	addLayerEffect(
		layerId: string,
		effectType: LayerEffectType,
		config: LayerEffectConfig = {}
	): EffectOperationResult {
		const effectId = this.#generateEffectId();
		const effect: LayerEffect = {
			id: effectId,
			type: effectType,
			enabled: true,
			opacity: 1.0,
			config: this.#getDefaultEffectConfig(effectType, config),
		};

		// Get or create effects array for layer
		const layerEffects = this.#layerEffects.get(layerId) || [];
		layerEffects.push(effect);
		this.#layerEffects.set(layerId, layerEffects);

		this.#triggerStateChange("effectAdded", {
			layerId,
			effectId,
			effect,
		});

		this.#provideFeedback(`Added ${effectType} effect to layer`);

		return {
			success: true,
			operation: "addEffect",
			affectedLayers: [layerId],
			message: `${effectType} effect added successfully`,
			data: { effect },
		};
	}

	/**
	 * Remove effect from layer
	 */
	removeLayerEffect(layerId: string, effectId: string): EffectOperationResult {
		const layerEffects = this.#layerEffects.get(layerId);
		if (!layerEffects) {
			return {
				success: false,
				operation: "removeEffect",
				affectedLayers: [],
				message: "Layer not found",
			};
		}

		const effectIndex = layerEffects.findIndex((e) => e.id === effectId);
		if (effectIndex === -1) {
			return {
				success: false,
				operation: "removeEffect",
				affectedLayers: [],
				message: "Effect not found",
			};
		}

		const removedEffect = layerEffects.splice(effectIndex, 1)[0];

		this.#triggerStateChange("effectRemoved", {
			layerId,
			effectId,
		});

		this.#provideFeedback(`Removed ${removedEffect.type} effect`);

		return {
			success: true,
			operation: "removeEffect",
			affectedLayers: [layerId],
			message: "Effect removed successfully",
		};
	}

	/**
	 * Update effect configuration
	 */
	updateLayerEffect(
		layerId: string,
		effectId: string,
		updates: Partial<LayerEffect>
	): EffectOperationResult {
		const layerEffects = this.#layerEffects.get(layerId);
		if (!layerEffects) {
			return {
				success: false,
				operation: "updateEffect",
				affectedLayers: [],
				message: "Layer not found",
			};
		}

		const effect = layerEffects.find((e) => e.id === effectId);
		if (!effect) {
			return {
				success: false,
				operation: "updateEffect",
				affectedLayers: [],
				message: "Effect not found",
			};
		}

		// Apply updates
		Object.assign(effect, updates);
		if (updates.config) {
			Object.assign(effect.config, updates.config);
		}

		this.#triggerStateChange("effectUpdated", {
			layerId,
			effectId,
			effect,
		});

		return {
			success: true,
			operation: "updateEffect",
			affectedLayers: [layerId],
			message: "Effect updated successfully",
			data: { effect },
		};
	}

	/**
	 * Get effects for layer
	 */
	getLayerEffects(layerId: string): LayerEffect[] {
		return this.#layerEffects.get(layerId) || [];
	}

	/**
	 * Toggle effect enabled state
	 */
	toggleLayerEffect(layerId: string, effectId: string): EffectOperationResult {
		const layerEffects = this.#layerEffects.get(layerId);
		const effect = layerEffects?.find((e) => e.id === effectId);

		if (!effect) {
			return {
				success: false,
				operation: "toggleEffect",
				affectedLayers: [],
				message: "Effect not found",
			};
		}

		effect.enabled = !effect.enabled;

		this.#triggerStateChange("effectToggled", {
			layerId,
			effectId,
			enabled: effect.enabled,
		});

		return {
			success: true,
			operation: "toggleEffect",
			affectedLayers: [layerId],
			message: `Effect ${effect.enabled ? "enabled" : "disabled"}`,
		};
	}

	// === SMART GUIDES ===

	/**
	 * Enable smart guide
	 */
	enableSmartGuide(
		guideType: SmartGuideType,
		config: SmartGuideConfig = {}
	): EffectOperationResult {
		const guideId = this.#generateGuideId();
		const guide: SmartGuide = {
			id: guideId,
			type: guideType,
			enabled: true,
			tolerance: 5,
			showVisualFeedback: true,
			config: this.#getDefaultGuideConfig(guideType, config),
		};

		this.#smartGuides.set(guideId, guide);

		this.#triggerStateChange("guideEnabled", {
			guideId,
			guide,
		});

		this.#provideFeedback(`Smart ${guideType} guide enabled`);

		return {
			success: true,
			operation: "enableGuide",
			affectedLayers: [],
			message: `${guideType} guide enabled`,
			data: { guide },
		};
	}

	/**
	 * Disable smart guide
	 */
	disableSmartGuide(guideId: string): EffectOperationResult {
		const guide = this.#smartGuides.get(guideId);
		if (!guide) {
			return {
				success: false,
				operation: "disableGuide",
				affectedLayers: [],
				message: "Guide not found",
			};
		}

		this.#smartGuides.delete(guideId);

		this.#triggerStateChange("guideDisabled", {
			guideId,
		});

		return {
			success: true,
			operation: "disableGuide",
			affectedLayers: [],
			message: "Guide disabled",
		};
	}

	/**
	 * Update element position with smart guides
	 */
	updateElementWithGuides(
		elementId: string,
		newPosition: Point,
		elements: DrawingElement[],
		layers: LayerInfo[]
	): {
		adjustedPosition: Point;
		snapPoints: SnapPoint[];
		guideLines: GuideLine[];
	} {
		const element = elements.find((el) => el.id === elementId);
		if (!element) {
			return {
				adjustedPosition: newPosition,
				snapPoints: [],
				guideLines: [],
			};
		}

		let adjustedPosition = { ...newPosition };
		const activeSnapPoints: SnapPoint[] = [];
		const activeGuideLines: GuideLine[] = [];

		// Generate snap points from other elements
		this.#generateSnapPoints(elements, layers, elementId);

		// Check each enabled guide
		for (const guide of this.#smartGuides.values()) {
			if (!guide.enabled) continue;

			const result = this.#applySmartGuide(guide, element, adjustedPosition, elements);

			if (result.snapped) {
				adjustedPosition = result.position;
				activeSnapPoints.push(...result.snapPoints);
				activeGuideLines.push(...result.guideLines);
			}
		}

		// Update temporary guides
		this.#updateTemporaryGuides(activeGuideLines);

		return {
			adjustedPosition,
			snapPoints: activeSnapPoints,
			guideLines: activeGuideLines,
		};
	}

	/**
	 * Start dragging operation
	 */
	startDrag(): void {
		this.#isDragging = true;
		this.#clearTemporaryGuides();
	}

	/**
	 * End dragging operation
	 */
	endDrag(): void {
		this.#isDragging = false;
		this.#clearTemporaryGuides();
	}

	/**
	 * Get visual guide lines for rendering
	 */
	getVisualGuides(): GuideLine[] {
		return Array.from(this.#activeGuideLines.values());
	}

	/**
	 * Get current snap points
	 */
	getSnapPoints(): SnapPoint[] {
		return Array.from(this.#snapPoints.values());
	}

	/**
	 * Get enabled smart guides
	 */
	getEnabledGuides(): SmartGuide[] {
		return Array.from(this.#smartGuides.values()).filter((g) => g.enabled);
	}

	// === RENDERING SUPPORT ===

	/**
	 * Apply layer effects to canvas context
	 */
	applyLayerEffects(
		ctx: CanvasRenderingContext2D,
		layerId: string,
		renderCallback: () => void
	): void {
		const effects = this.#layerEffects.get(layerId);
		if (!effects || effects.length === 0) {
			renderCallback();
			return;
		}

		ctx.save();

		// Apply effects in order
		for (const effect of effects) {
			if (!effect.enabled) continue;

			this.#applyEffect(ctx, effect);
		}

		// Render the layer content
		renderCallback();

		ctx.restore();
	}

	/**
	 * Render smart guide visuals
	 */
	renderSmartGuides(ctx: CanvasRenderingContext2D): void {
		if (!this.#isDragging) return;

		// Render guide lines
		for (const guideLine of this.#activeGuideLines.values()) {
			this.#renderGuideLine(ctx, guideLine);
		}

		// Render snap points
		for (const snapPoint of this.#snapPoints.values()) {
			if (snapPoint.magnetic) {
				this.#renderSnapPoint(ctx, snapPoint);
			}
		}
	}

	// === PRIVATE METHODS ===

	#initializeDefaultGuides(): void {
		// Enable basic smart guides by default
		this.enableSmartGuide("alignment", {
			showAlignmentLines: true,
			alignmentLineColor: "#00ff00",
			alignmentLineThickness: 1,
		});

		this.enableSmartGuide("snap-to-element", {
			snapToCenter: true,
			snapToEdges: true,
			snapDistance: 10,
		});

		this.enableSmartGuide("snap-to-grid", {
			gridSize: 20,
			gridColor: "#cccccc",
			gridOpacity: 0.3,
		});
	}

	#generateEffectId(): string {
		return `effect_${++this.#effectCounter}_${Date.now()}`;
	}

	#generateGuideId(): string {
		return `guide_${++this.#guideCounter}_${Date.now()}`;
	}

	#getDefaultEffectConfig(
		effectType: LayerEffectType,
		overrides: LayerEffectConfig
	): LayerEffectConfig {
		const defaults: Record<LayerEffectType, LayerEffectConfig> = {
			"drop-shadow": {
				shadowColor: "#000000",
				shadowOffset: { x: 2, y: 2 },
				shadowBlur: 4,
				shadowSpread: 0,
			},
			"inner-shadow": {
				shadowColor: "#000000",
				shadowOffset: { x: 1, y: 1 },
				shadowBlur: 3,
				shadowSpread: 0,
			},
			"outer-glow": {
				glowColor: "#ffffff",
				glowSize: 5,
				glowSpread: 0,
				glowNoise: 0,
			},
			"inner-glow": {
				glowColor: "#ffffff",
				glowSize: 3,
				glowSpread: 0,
				glowNoise: 0,
			},
			"bevel-emboss": {
				bevelStyle: "outer-bevel",
				bevelSize: 3,
				bevelSoften: 0,
				highlightColor: "#ffffff",
				highlightOpacity: 0.7,
				shadowAngle: 135,
				shadowAltitude: 30,
			},
			"color-overlay": {
				overlayColor: "#ff0000",
			},
			"gradient-overlay": {
				gradientStops: [
					{ position: 0, color: "#ffffff", opacity: 1 },
					{ position: 1, color: "#000000", opacity: 1 },
				],
				gradientType: "linear",
				gradientAngle: 0,
			},
			stroke: {
				strokeWidth: 2,
				strokeColor: "#000000",
				strokePosition: "outside",
				strokeStyle: "solid",
			},
			blur: {
				blurRadius: 2,
				blurType: "gaussian",
			},
			noise: {
				noiseAmount: 0.1,
				noiseType: "uniform",
				noiseMonochromatic: false,
			},
		};

		return { ...defaults[effectType], ...overrides };
	}

	#getDefaultGuideConfig(guideType: SmartGuideType, overrides: SmartGuideConfig): SmartGuideConfig {
		const defaults: Record<SmartGuideType, SmartGuideConfig> = {
			alignment: {
				showAlignmentLines: true,
				alignmentLineColor: "#00ff00",
				alignmentLineThickness: 1,
			},
			distribution: {
				showDistributionMarkers: true,
				distributionMarkerColor: "#0066ff",
			},
			spacing: {
				suggestEvenSpacing: true,
				spacingTolerance: 5,
				minimumSpacing: 10,
			},
			rotation: {
				rotationSnapAngle: 15,
				showRotationIndicator: true,
			},
			"snap-to-grid": {
				gridSize: 20,
				gridSubdivisions: 4,
				gridColor: "#cccccc",
				gridOpacity: 0.3,
			},
			"snap-to-element": {
				snapToCenter: true,
				snapToEdges: true,
				snapToCorners: false,
				snapDistance: 10,
			},
			"smart-spacing": {
				suggestEvenSpacing: true,
				spacingTolerance: 5,
				minimumSpacing: 10,
			},
		};

		return { ...defaults[guideType], ...overrides };
	}

	#applyEffect(ctx: CanvasRenderingContext2D, effect: LayerEffect): void {
		const { type, config, opacity } = effect;

		ctx.globalAlpha *= opacity;

		switch (type) {
			case "drop-shadow":
				if (config.shadowColor && config.shadowOffset && config.shadowBlur) {
					ctx.shadowColor = config.shadowColor;
					ctx.shadowOffsetX = config.shadowOffset.x;
					ctx.shadowOffsetY = config.shadowOffset.y;
					ctx.shadowBlur = config.shadowBlur;
				}
				break;

			case "blur":
				if (config.blurRadius && config.blurRadius > 0) {
					ctx.filter = `blur(${config.blurRadius}px)`;
				}
				break;

			case "color-overlay":
				if (config.overlayColor) {
					ctx.globalCompositeOperation = "source-atop";
					ctx.fillStyle = config.overlayColor;
				}
				break;
			default:
				break;
			// Other effects would be implemented here
		}
	}

	#generateSnapPoints(
		elements: DrawingElement[],
		layers: LayerInfo[],
		excludeElementId: string
	): void {
		this.#snapPoints.clear();

		for (const element of elements) {
			if (element.id === excludeElementId) continue;

			const layer = layers.find((l) => l.id === element.layerId);
			if (layer && layer.visibility !== "visible") continue;

			// Generate snap points for this element
			this.#generateElementSnapPoints(element);
		}

		// Generate grid snap points if grid snapping is enabled
		const gridGuide = Array.from(this.#smartGuides.values()).find(
			(g) => g.type === "snap-to-grid" && g.enabled
		);
		if (gridGuide?.config.gridSize) {
			this.#generateGridSnapPoints();
		}
	}

	#generateElementSnapPoints(element: DrawingElement): void {
		if (element.points.length === 0) return;

		const bounds = this.#getElementBounds(element);
		if (!bounds) return;

		let snapPointId = 0;

		// Center point
		this.#snapPoints.set(`${element.id}_center_${snapPointId++}`, {
			id: `${element.id}_center`,
			point: { x: bounds.centerX, y: bounds.centerY },
			type: "center",
			elementId: element.id,
			layerId: element.layerId,
			magnetic: true,
			tolerance: 10,
		});

		// Edge points
		this.#snapPoints.set(`${element.id}_left_${snapPointId++}`, {
			id: `${element.id}_left`,
			point: { x: bounds.minX, y: bounds.centerY },
			type: "edge",
			elementId: element.id,
			layerId: element.layerId,
			magnetic: true,
			tolerance: 8,
		});

		this.#snapPoints.set(`${element.id}_right_${snapPointId++}`, {
			id: `${element.id}_right`,
			point: { x: bounds.maxX, y: bounds.centerY },
			type: "edge",
			elementId: element.id,
			layerId: element.layerId,
			magnetic: true,
			tolerance: 8,
		});

		this.#snapPoints.set(`${element.id}_top_${snapPointId++}`, {
			id: `${element.id}_top`,
			point: { x: bounds.centerX, y: bounds.minY },
			type: "edge",
			elementId: element.id,
			layerId: element.layerId,
			magnetic: true,
			tolerance: 8,
		});

		this.#snapPoints.set(`${element.id}_bottom_${snapPointId++}`, {
			id: `${element.id}_bottom`,
			point: { x: bounds.centerX, y: bounds.maxY },
			type: "edge",
			elementId: element.id,
			layerId: element.layerId,
			magnetic: true,
			tolerance: 8,
		});

		// Corner points
		this.#snapPoints.set(`${element.id}_tl_${snapPointId++}`, {
			id: `${element.id}_tl`,
			point: { x: bounds.minX, y: bounds.minY },
			type: "corner",
			elementId: element.id,
			layerId: element.layerId,
			magnetic: false,
			tolerance: 6,
		});

		this.#snapPoints.set(`${element.id}_tr_${snapPointId++}`, {
			id: `${element.id}_tr`,
			point: { x: bounds.maxX, y: bounds.minY },
			type: "corner",
			elementId: element.id,
			layerId: element.layerId,
			magnetic: false,
			tolerance: 6,
		});

		this.#snapPoints.set(`${element.id}_bl_${snapPointId++}`, {
			id: `${element.id}_bl`,
			point: { x: bounds.minX, y: bounds.maxY },
			type: "corner",
			elementId: element.id,
			layerId: element.layerId,
			magnetic: false,
			tolerance: 6,
		});

		this.#snapPoints.set(`${element.id}_br_${snapPointId++}`, {
			id: `${element.id}_br`,
			point: { x: bounds.maxX, y: bounds.maxY },
			type: "corner",
			elementId: element.id,
			layerId: element.layerId,
			magnetic: false,
			tolerance: 6,
		});
	}

	#generateGridSnapPoints(): void {
		// This would generate a grid of snap points
		// Implementation would depend on canvas size and current viewport
	}

	#applySmartGuide(
		guide: SmartGuide,
		element: DrawingElement,
		position: Point,
		elements: DrawingElement[]
	): GuideApplicationResult {
		const result: GuideApplicationResult = {
			snapped: false,
			position: { ...position },
			snapPoints: [],
			guideLines: [],
		};

		switch (guide.type) {
			case "snap-to-element":
				return this.#applyElementSnapping(guide, position, result);

			case "snap-to-grid":
				return this.#applyGridSnapping(guide, position, result);

			case "alignment":
				return this.#applyAlignmentGuides(guide, element, position, elements, result);

			default:
				return result;
		}
	}

	#applyElementSnapping(
		guide: SmartGuide,
		position: Point,
		result: GuideApplicationResult
	): GuideApplicationResult {
		const tolerance = guide.tolerance;

		for (const snapPoint of this.#snapPoints.values()) {
			const distance = Math.sqrt(
				(position.x - snapPoint.point.x) ** 2 + (position.y - snapPoint.point.y) ** 2
			);

			if (distance <= tolerance) {
				result.snapped = true;
				result.position = { ...snapPoint.point };
				result.snapPoints.push(snapPoint);
				break;
			}
		}

		return result;
	}

	#applyGridSnapping(
		guide: SmartGuide,
		position: Point,
		result: GuideApplicationResult
	): GuideApplicationResult {
		const gridSize = guide.config.gridSize || 20;
		const tolerance = guide.tolerance;

		const snappedX = Math.round(position.x / gridSize) * gridSize;
		const snappedY = Math.round(position.y / gridSize) * gridSize;

		const distanceX = Math.abs(position.x - snappedX);
		const distanceY = Math.abs(position.y - snappedY);

		if (distanceX <= tolerance || distanceY <= tolerance) {
			result.snapped = true;
			result.position = { x: snappedX, y: snappedY };
		}

		return result;
	}

	#applyAlignmentGuides(
		_guide: SmartGuide,
		_element: DrawingElement,
		_position: Point,
		_elements: DrawingElement[],
		result: GuideApplicationResult
	): GuideApplicationResult {
		// Implementation would check for alignment with other elements
		// and generate visual guide lines
		return result;
	}

	#updateTemporaryGuides(guideLines: GuideLine[]): void {
		// Clear existing temporary guides
		for (const guideId of this.#temporaryGuides) {
			this.#activeGuideLines.delete(guideId);
		}
		this.#temporaryGuides = [];

		// Add new temporary guides
		for (const guideLine of guideLines) {
			if (guideLine.temporary) {
				this.#activeGuideLines.set(guideLine.id, guideLine);
				this.#temporaryGuides.push(guideLine.id);
			}
		}
	}

	#clearTemporaryGuides(): void {
		for (const guideId of this.#temporaryGuides) {
			this.#activeGuideLines.delete(guideId);
		}
		this.#temporaryGuides = [];
	}

	#renderGuideLine(ctx: CanvasRenderingContext2D, guideLine: GuideLine): void {
		ctx.save();
		ctx.strokeStyle = guideLine.color;
		ctx.lineWidth = guideLine.thickness;

		if (guideLine.style === "dashed") {
			ctx.setLineDash([5, 5]);
		} else if (guideLine.style === "dotted") {
			ctx.setLineDash([2, 2]);
		}

		ctx.beginPath();
		ctx.moveTo(guideLine.start.x, guideLine.start.y);
		ctx.lineTo(guideLine.end.x, guideLine.end.y);
		ctx.stroke();

		ctx.restore();
	}

	#renderSnapPoint(ctx: CanvasRenderingContext2D, snapPoint: SnapPoint): void {
		ctx.save();
		ctx.fillStyle = snapPoint.type === "center" ? "#ff0000" : "#00ff00";
		ctx.beginPath();
		ctx.arc(snapPoint.point.x, snapPoint.point.y, 3, 0, 2 * Math.PI);
		ctx.fill();
		ctx.restore();
	}

	#getElementBounds(element: DrawingElement): ElementBounds | null {
		if (element.points.length === 0) return null;

		const xs = element.points.map((p) => p.x);
		const ys = element.points.map((p) => p.y);

		const minX = Math.min(...xs);
		const minY = Math.min(...ys);
		const maxX = Math.max(...xs);
		const maxY = Math.max(...ys);

		return {
			minX,
			minY,
			maxX,
			maxY,
			centerX: (minX + maxX) / 2,
			centerY: (minY + maxY) / 2,
		};
	}

	#triggerStateChange(action: string, data: Record<string, unknown>): void {
		this.#config.on.stateChange({
			type: "effectAction",
			action,
			...data,
		});
	}

	#provideFeedback(message: string): void {
		this.#config.on.feedback(message);
	}

	/**
	 * Clean up resources
	 */
	cleanup(): void {
		this.#layerEffects.clear();
		this.#smartGuides.clear();
		this.#activeGuideLines.clear();
		this.#snapPoints.clear();
		this.#clearTemporaryGuides();
	}

	/**
	 * Get effects statistics
	 */
	getEffectsStats(): {
		totalEffects: number;
		enabledEffects: number;
		layersWithEffects: number;
		enabledGuides: number;
		activeSnapPoints: number;
	} {
		let totalEffects = 0;
		let enabledEffects = 0;
		const layersWithEffects = this.#layerEffects.size;

		for (const effects of this.#layerEffects.values()) {
			totalEffects += effects.length;
			enabledEffects += effects.filter((e) => e.enabled).length;
		}

		const enabledGuides = Array.from(this.#smartGuides.values()).filter((g) => g.enabled).length;

		return {
			totalEffects,
			enabledEffects,
			layersWithEffects,
			enabledGuides,
			activeSnapPoints: this.#snapPoints.size,
		};
	}
}
