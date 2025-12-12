/**
 * Drawing Engine Default Configuration
 * Contains all default values for configurable options
 */

import type {
	ArrangeConfig,
	CallbacksConfig,
	DrawingColors,
	DrawingEngineConfig,
	HistoryConfig,
	InteractionThresholds,
	LayerConfig,
	RenderingConfig,
	ResolutionConfig,
	TextConfig,
} from "./types";

// ============================================================================
// Default Color Configuration
// ============================================================================

export const DEFAULT_COLORS: DrawingColors = {
	line: "#ff0000",
	area: "#00ff00",
	curve: "#0000ff",
	rectangle: "#ff6600",
	circle: "#9900ff",
};

// ============================================================================
// Default Interaction Thresholds
// ============================================================================

export const DEFAULT_INTERACTION_THRESHOLDS: InteractionThresholds = {
	line: 20,
	area: 10,
	curve: 15,
	point: 15,
};

// ============================================================================
// Default Target Processing Resolution
// ============================================================================

export const DEFAULT_RESOLUTION: ResolutionConfig = {
	target: {
		width: 1920, // Full HD width
		height: 1080, // Full HD height
	},
	native: {
		width: 0,
		height: 0,
	},
	media: {
		width: 0,
		height: 0,
	},
	display: {
		width: 0,
		height: 0,
	},
};

// ============================================================================
// Default History Configuration
// ============================================================================

export const DEFAULT_HISTORY_CONFIG: HistoryConfig = {
	maxHistorySize: 50,
	autoSnapshot: true,
	minSnapshotInterval: 100,
	alwaysSnapshot: [
		"deleteElements",
		"clearAll",
		"cutElements",
		"pasteElements",
		"duplicateElements",
		"createLayer",
		"deleteLayer",
		"duplicateLayer",
		"renameLayer",
	],
	mergeableOperations: ["moveElements", "updateElements"],
};

// ============================================================================
// Default Rendering Configuration
// ============================================================================

export const DEFAULT_RENDERING_CONFIG: RenderingConfig = {
	defaultLineWidth: 2,
	defaultOpacity: 1.0,
	selectedLineWidth: 3,
	hoveredLineWidth: 2.5,
	showDirectionArrows: true,
	arrowSize: 10,
	antiAlias: true,
};

// ============================================================================
// Default Text Configuration
// ============================================================================

export const DEFAULT_TEXT_CONFIG: TextConfig = {
	defaultFontSize: 16,
	defaultFontFamily: "Arial",
	availableFontSizes: [12, 14, 16, 18, 20, 24, 28, 32, 36, 48],
	availableFontFamilies: [
		"Arial",
		"Helvetica",
		"Times New Roman",
		"Courier New",
		"Verdana",
		"Georgia",
	],
	defaultBackgroundOpacity: 0.7,
	defaultBackgroundColor: "#000000",
};

// ============================================================================
// Default Layer Configuration
// ============================================================================

export const DEFAULT_LAYER_CONFIG: LayerConfig = {
	defaultPrefix: "Layer",
	max: 100,
	defaultOpacity: 1.0,
	autoName: true,
	colors: [
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
};

// ============================================================================
// Default arrange Configuration
// ============================================================================

export const DEFAULT_ARRANGE_CONFIG: ArrangeConfig = {
	defaultSpacing: 20,
	snapTolerance: 5,
	maintainAspectRatio: true,
	defaultRotationAngle: 90,
};

export const DEFAULT_EVENTS_CONFIG: CallbacksConfig = {
	stateChange: () => {
		// no default action
	},
	feedback: () => {
		// no default action
	},
};

export class DrawingConfig {
	// Modules configuration
	resolution: ResolutionConfig = DEFAULT_RESOLUTION;
	colors: DrawingColors = DEFAULT_COLORS;
	interactionThresholds: InteractionThresholds = DEFAULT_INTERACTION_THRESHOLDS;
	history: HistoryConfig = DEFAULT_HISTORY_CONFIG;
	rendering: RenderingConfig = DEFAULT_RENDERING_CONFIG;
	text: TextConfig = DEFAULT_TEXT_CONFIG;
	layers: LayerConfig = DEFAULT_LAYER_CONFIG;
	arrange: ArrangeConfig = DEFAULT_ARRANGE_CONFIG;
	on: CallbacksConfig = DEFAULT_EVENTS_CONFIG;
	// Engine configuration
	canvas: HTMLCanvasElement;
	media: HTMLVideoElement | HTMLImageElement;

	constructor(
		canvas: HTMLCanvasElement,
		media: HTMLVideoElement | HTMLImageElement,
		config?: DrawingEngineConfig
	) {
		this.canvas = canvas;
		this.media = media;

		if (!config) return;

		const validation = this.#validateConfig(config);
		const errors = validation.filter((issue) => issue.type === "error");
		if (errors.length > 0) {
			throw new Error(
				`Invalid drawing engine configuration:\n${errors.map((e) => `- ${e.message}`).join("\n")}`
			);
		}

		const warnings = validation.filter((issue) => issue.type === "warning");
		if (warnings.length > 0) {
			console.warn(
				"Drawing engine configuration warnings:",
				warnings.map((w) => w.message)
			);
		}

		this.on = {
			...DEFAULT_EVENTS_CONFIG,
			...config.on,
		};
		this.resolution = {
			...DEFAULT_RESOLUTION,
			...config.resolution,
		};
		this.colors = {
			...DEFAULT_COLORS,
			...config.colors,
		};
		this.interactionThresholds = {
			...DEFAULT_INTERACTION_THRESHOLDS,
			...config.interactionThresholds,
		};
		this.history = {
			...DEFAULT_HISTORY_CONFIG,
			...config.history,
		};
		this.rendering = {
			...DEFAULT_RENDERING_CONFIG,
			...config.rendering,
		};
		this.text = {
			...DEFAULT_TEXT_CONFIG,
			...config.text,
		};
		this.layers = {
			...DEFAULT_LAYER_CONFIG,
			...config.layers,
		};
		this.arrange = {
			...DEFAULT_ARRANGE_CONFIG,
			...config.arrange,
		};
	}

	updateResolution(resolution: Omit<ResolutionConfig, "target">) {
		const { native, media, display } = resolution;

		this.resolution = {
			...this.resolution,
			native,
			media: this.#calculateTargetResolution(media),
			display,
		};

		this.layers.containerBounds = {
			...media,
			x: 0,
			y: 0,
		};
	}

	/**
	 * Calculate the target processing resolution based on config and native media size.
	 * Scales the media to the configured resolution while maintaining aspect ratio.
	 */
	#calculateTargetResolution(nativeSize: { width: number; height: number }): {
		width: number;
		height: number;
	} {
		const configResolution = this.resolution.target;

		// If native size is smaller than or equal to target, use native size
		if (
			nativeSize.width <= configResolution.width &&
			nativeSize.height <= configResolution.height
		) {
			return { ...nativeSize };
		}

		// Calculate scaling to fit within target resolution while maintaining aspect ratio
		const widthRatio = configResolution.width / nativeSize.width;
		const heightRatio = configResolution.height / nativeSize.height;
		const scale = Math.min(widthRatio, heightRatio);

		return {
			width: Math.round(nativeSize.width * scale),
			height: Math.round(nativeSize.height * scale),
		};
	}

	#validateConfig = (
		config: DrawingEngineConfig
	): { type: "error" | "warning"; message: string }[] => {
		const issues: { type: "error" | "warning"; message: string }[] = [];

		// Validate resolution
		if (config.resolution?.target) {
			if (config.resolution.target.width !== undefined && config.resolution.target.width < 1) {
				issues.push({
					type: "error",
					message: "resolution.width must be at least 1",
				});
			}
			if (config.resolution.target.height !== undefined && config.resolution.target.height < 1) {
				issues.push({
					type: "error",
					message: "resolution.height must be at least 1",
				});
			}
			if (config.resolution.target.width !== undefined && config.resolution.target.width > 16384) {
				issues.push({
					type: "warning",
					message: "resolution.width is very large (>16384) and may cause performance issues",
				});
			}
			if (
				config.resolution.target.height !== undefined &&
				config.resolution.target.height > 16384
			) {
				issues.push({
					type: "warning",
					message: "resolution.height is very large (>16384) and may cause performance issues",
				});
			}
		}

		// Validate interaction thresholds
		if (config.interactionThresholds) {
			const thresholds = config.interactionThresholds;
			for (const key of ["line", "area", "curve", "point"] as const) {
				if (thresholds[key] !== undefined && thresholds[key] < 0) {
					issues.push({
						type: "error",
						message: `interactionThresholds.${key} must be non-negative`,
					});
				}
			}
		}

		// Validate history config
		if (config.history) {
			if (config.history.maxHistorySize !== undefined && config.history.maxHistorySize < 0) {
				issues.push({
					type: "error",
					message: "history.maxHistorySize must be non-negative",
				});
			}
			if (
				config.history.minSnapshotInterval !== undefined &&
				config.history.minSnapshotInterval < 0
			) {
				issues.push({
					type: "error",
					message: "history.minSnapshotInterval must be non-negative",
				});
			}
		}

		// Validate rendering config
		if (config.rendering) {
			const rendering = config.rendering;
			if (rendering.defaultLineWidth !== undefined && rendering.defaultLineWidth <= 0) {
				issues.push({
					type: "error",
					message: "rendering.defaultLineWidth must be positive",
				});
			}
			if (
				rendering.defaultOpacity !== undefined &&
				(rendering.defaultOpacity < 0 || rendering.defaultOpacity > 1)
			) {
				issues.push({
					type: "error",
					message: "rendering.defaultOpacity must be between 0 and 1",
				});
			}
			if (rendering.selectedLineWidth !== undefined && rendering.selectedLineWidth <= 0) {
				issues.push({
					type: "error",
					message: "rendering.selectedLineWidth must be positive",
				});
			}
			if (rendering.hoveredLineWidth !== undefined && rendering.hoveredLineWidth <= 0) {
				issues.push({
					type: "error",
					message: "rendering.hoveredLineWidth must be positive",
				});
			}
			if (rendering.arrowSize !== undefined && rendering.arrowSize <= 0) {
				issues.push({
					type: "error",
					message: "rendering.arrowSize must be positive",
				});
			}
		}

		// Validate text config
		if (config.text) {
			if (config.text.defaultFontSize !== undefined && config.text.defaultFontSize <= 0) {
				issues.push({
					type: "error",
					message: "text.defaultFontSize must be positive",
				});
			}
			if (
				config.text.defaultBackgroundOpacity !== undefined &&
				(config.text.defaultBackgroundOpacity < 0 || config.text.defaultBackgroundOpacity > 1)
			) {
				issues.push({
					type: "error",
					message: "text.defaultBackgroundOpacity must be between 0 and 1",
				});
			}
		}

		return issues;
	};
}
