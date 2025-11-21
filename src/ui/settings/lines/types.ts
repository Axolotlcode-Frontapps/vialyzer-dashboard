/**
 * UI Component Types
 * Types and interfaces for React components related to the drawing system
 */

import type { DrawingEngine } from "./drawing";
import type { DrawingElement, LayerInfo, MediaMatrix } from "./drawing/types";

// ============================================================================
// Main Component Props
// ============================================================================

export interface LinesProps {
	src: string;
	type: "video" | "image";
	onDrawingComplete?: (matrixData: MediaMatrix) => void;
	onSave?: (elements: DrawingElement[], layers: LayerInfo[]) => Promise<void>;
	onLoad?: () => Promise<{
		elements: DrawingElement[];
		layers: Map<string, LayerInfo>;
	}>;
	vehicles?: { id: string; name: string; color: string }[];
}

// ============================================================================
// UI Component Props
// ============================================================================

export interface CanvasContextMenuProps {
	drawingEngine: DrawingEngine | null;
}

export interface ControlsProps {
	drawingEngine: DrawingEngine | null;
	onSave?: (elements: DrawingElement[], layers: LayerInfo[]) => Promise<void>;
}

export interface PanelProps {
	drawingEngine: DrawingEngine | null;
}

export interface LabelFormProps {
	drawingEngine: DrawingEngine | null;
}

export interface LayerFormProps {
	isOpen: boolean;
	onClose: () => void;
	onCreateLayer: (layerData: {
		name: string;
		description?: string;
		category?: string;
		opacity: number;
		color: string;
	}) => void;
	onUpdateLayer?: (
		layerId: string,
		layerData: {
			name: string;
			description?: string;
			category?: string;
			opacity: number;
			color: string;
		}
	) => void;
	layerToEdit?: LayerInfo | null;
	vehicles?: { id: string; name: string; color: string }[];
}

// ============================================================================
// Re-exports for convenience (commonly used in UI)
// ============================================================================

export type {
	AlignmentType,
	DrawingElement,
	DrawingElementType,
	DrawingMode,
	LayerInfo,
	MediaMatrix,
	Point,
	StateChangeEvent,
} from "./drawing/types";
