import { useEffect, useState } from "react";
import { ChevronRight, Move, Plus } from "lucide-react";

import type { DrawingEngine } from "../drawing";
import type { LayerInfo } from "../drawing/layers";

import { Button } from "@/ui/shared/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/ui/shared/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/shared/popover";
import { LayerForm } from "./form";
import { LayerItem } from "./item";

interface LayerPanelProps {
	drawingEngine: DrawingEngine | null;
	vehicles?: { id: string; name: string; color: string }[];
}

export function LayerPanel({ drawingEngine, vehicles }: LayerPanelProps) {
	// Internal state for panel visibility
	const [isVisible, setIsVisible] = useState(false);
	const [layers, setLayers] = useState<LayerInfo[]>([]);
	const [activeLayer, setActiveLayer] = useState<LayerInfo | null>(null);
	const [isolatedLayerId, setIsolatedLayerId] = useState<string | null>(null);
	const [isNewLayerDialogOpen, setIsNewLayerDialogOpen] = useState(false);
	const [editingLayer, setEditingLayer] = useState<LayerInfo | null>(null);
	const [canvasHeight, setCanvasHeight] = useState<number>(400);
	const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());
	const [renamingLayer, setRenamingLayer] = useState<string | null>(null);
	const [tempLayerName, setTempLayerName] = useState<string>("");

	// Get data from drawing engine
	const isMediaLoaded = drawingEngine?.isInitialized || false;
	const elements = drawingEngine?.elements ?? [];

	// Subscribe to drawing engine state changes for toggle events
	useEffect(() => {
		if (!drawingEngine) return;

		const updateLayers = () => {
			const currentLayers = drawingEngine.getLayers();
			const currentActive = drawingEngine.getActiveLayer();
			// Create new object references to force React re-render
			const clonedLayers = currentLayers.map((layer) => ({ ...layer }));
			setLayers(clonedLayers);
			setActiveLayer(currentActive ? { ...currentActive } : null);
		};

		// Get canvas height for dynamic sizing
		const updateCanvasHeight = () => {
			const displaySize = drawingEngine.getDisplaySize();
			if (displaySize?.height) {
				setCanvasHeight(displaySize.height);
			}
		};

		updateLayers();
		updateCanvasHeight();

		// Subscribe to state changes
		const unsubscribe = drawingEngine.subscribeToStateChanges((stateChange) => {
			if (stateChange.type === "togglePanel") {
				setIsVisible((prev) => !prev);
			}

			if (stateChange.type === "resize") {
				updateCanvasHeight();
			}

			// Update layers immediately after media is loaded (which triggers import)
			if (stateChange.type === "mediaLoaded") {
				// Small delay to ensure import has completed
				setTimeout(() => {
					updateLayers();
				}, 100);
			}

			if (stateChange.type === "layerAction") {
				// Always update layers for any layer action
				updateLayers();

				// Handle isolation state
				if (stateChange.action === "layerIsolated") {
					setIsolatedLayerId(stateChange.layerId as string);
				} else if (stateChange.action === "layerIsolationCleared") {
					setIsolatedLayerId(null);
				}
			}

			// Also update on element changes to keep counts accurate
			if (
				stateChange.type === "action" &&
				(stateChange.action === "addElements" ||
					stateChange.action === "deleteElements" ||
					stateChange.action === "updateElements" ||
					stateChange.action === "clearAll")
			) {
				updateLayers();
			}
		});

		return unsubscribe;
	}, [drawingEngine]);

	const handleCreateLayer = (layerData: {
		name: string;
		description?: string;
		category?: string;
		opacity: number;
		color: string;
	}) => {
		if (!drawingEngine) {
			return;
		}

		if (!drawingEngine.isInitialized) {
			return;
		}

		const result = drawingEngine.createLayer({
			name: layerData.name,
			description: layerData.description,
			category: layerData.category,
			opacity: layerData.opacity,
			color: layerData.color,
		});

		if (!result?.success) {
			console.error("[DrawingLayer] Failed to create layer:", result?.message);
		}

		setIsNewLayerDialogOpen(false);
	};

	const handleUpdateLayer = (
		layerId: string,
		layerData: {
			name: string;
			description?: string;
			category?: string;
			opacity: number;
			color: string;
		}
	) => {
		if (!drawingEngine) {
			return;
		}

		const result = drawingEngine.updateLayer(layerId, layerData);

		if (!result?.success) {
			console.error("[DrawingLayer] Failed to update layer:", result?.message);
		}

		setIsNewLayerDialogOpen(false);
		setEditingLayer(null);
	};

	const handleLayerEdit = (layer: LayerInfo) => {
		setEditingLayer(layer);
		setIsNewLayerDialogOpen(true);
	};

	const handleLayerSelect = (layerId: string) => {
		const result = drawingEngine?.setActiveLayer(layerId);
		if (!result?.success) {
			console.error("[DrawingLayer] Failed to select layer:", result?.message);
		}
	};

	const handleVisibilityToggle = (layerId: string) => {
		const result = drawingEngine?.toggleLayerVisibility(layerId);
		if (!result?.success) {
			console.error(
				"[DrawingLayer] Failed to toggle visibility:",
				result?.message
			);
		} else {
			// Force redraw to update visibility immediately
			drawingEngine?.requestRedraw();
		}
	};

	const handleOpacityChange = (layerId: string, opacity: number) => {
		const result = drawingEngine?.setLayerOpacity(layerId, opacity);
		if (!result?.success) {
			console.error(
				"[DrawingLayer] Failed to change opacity:",
				result?.message
			);
		} else {
			// Force redraw to update opacity immediately
			drawingEngine?.requestRedraw();
		}
	};

	const handleLayerRename = (layerId: string, newName: string) => {
		const result = drawingEngine?.renameLayer(layerId, newName);
		if (!result?.success) {
			console.error("[DrawingLayer] Failed to rename layer:", result?.message);
		}
	};

	const handleLayerDelete = (layerId: string) => {
		if (layers.length > 1) {
			const result = drawingEngine?.deleteLayer(layerId);
			if (!result?.success) {
				console.error(
					"[DrawingLayer] Failed to delete layer:",
					result?.message
				);
			}
		}
	};

	const handleLayerDuplicate = (layerId: string) => {
		const result = drawingEngine?.duplicateLayer(layerId);
		if (!result?.success) {
			console.error(
				"[DrawingLayer] Failed to duplicate layer:",
				result?.message
			);
		}
	};

	const handleLayerIsolate = (layerId: string) => {
		const result = drawingEngine?.isolateLayer?.(layerId);
		if (!result?.success) {
			console.error("[DrawingLayer] Failed to isolate layer:", result?.message);
		} else {
			// Force redraw to update isolation immediately
			drawingEngine?.requestRedraw();
		}
	};

	const handleLayerExpansionToggle = (layerId: string) => {
		setExpandedLayers((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(layerId)) {
				newSet.delete(layerId);
			} else {
				newSet.add(layerId);
			}
			return newSet;
		});
	};

	const handleLayerRenameStart = (layerId: string, currentName: string) => {
		setRenamingLayer(layerId);
		setTempLayerName(currentName);
	};

	const handleLayerRenameComplete = (layerId: string, newName: string) => {
		if (newName.trim()) {
			handleLayerRename(layerId, newName.trim());
		}
		setRenamingLayer(null);
		setTempLayerName("");
	};

	const handleLayerRenameCancel = () => {
		setRenamingLayer(null);
		setTempLayerName("");
	};

	// Handle toggle
	const onToggle = () => setIsVisible(!isVisible);

	// Calculate max height for layers list (canvas height minus other content)
	const layersMaxHeight = Math.max(200, canvasHeight * 0.6); // At least 200px, max 60% of canvas

	return (
		<Popover open={isVisible} onOpenChange={setIsVisible}>
			<PopoverTrigger asChild>
				<Button
					className="size-8"
					variant="secondary"
					size="icon"
					title={
						isVisible ? "Ocultar panel de capas" : "Mostrar panel de capas"
					}
				>
					<Move className="size-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-4" align="end">
				{/* Layer Panel */}
				<Card className="border-none p-0 bg-transparent">
					<CardHeader className="p-0 flex items-center justify-between">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<Move className="size-4" />
							Gestión de Capas
						</CardTitle>
						<CardAction className="flex gap-1">
							<Button
								onClick={() => setIsNewLayerDialogOpen(true)}
								variant="ghost"
								size="icon"
								className="size-8"
								title="Agregar nueva capa"
							>
								<Plus className="size-4" />
							</Button>
							<Button
								onClick={onToggle}
								variant="ghost"
								size="icon"
								className="size-8"
								title="Ocultar panel"
							>
								<ChevronRight className="size-4" />
							</Button>
						</CardAction>
					</CardHeader>

					<CardContent className="space-y-3 p-0">
						{isMediaLoaded ? (
							<>
								{/* Layer Statistics */}
								<div className="bg-muted rounded-lg p-3 border">
									<div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
										Información de Capas
									</div>
									<div className="text-sm font-medium text-foreground">
										{layers.length} Capa{layers.length !== 1 ? "s" : ""}
									</div>
									<div className="text-xs text-muted-foreground/80">
										{layers.filter((l) => l.visibility === "visible").length}{" "}
										visible
										{layers.filter((l) => l.visibility === "visible").length !==
										1
											? "s"
											: ""}
										, {elements.length} elementos totales
									</div>
								</div>

								{/* Layer List */}
								<div className="space-y-2">
									<div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
										Capas
									</div>

									{layers.length === 0 ? (
										<div className="text-center text-muted-foreground py-8">
											<Move className="w-8 h-8 mx-auto mb-2 opacity-50" />
											<p className="text-sm">No hay capas creadas aún</p>
											<Button
												variant="outline"
												size="sm"
												className="mt-2"
												onClick={() => setIsNewLayerDialogOpen(true)}
											>
												Crear Primera Capa
											</Button>
										</div>
									) : (
										<div
											className="space-y-2 overflow-y-auto border border-border/30 rounded-md p-2 bg-background/50"
											style={{ maxHeight: `${layersMaxHeight}px` }}
										>
											{/* Render layers in reverse order (top to bottom) */}
											{[...layers].reverse().map((layer) => {
												return (
													<LayerItem
														key={layer.id}
														layer={layer}
														isActive={activeLayer?.id === layer.id}
														isIsolated={isolatedLayerId === layer.id}
														isExpanded={expandedLayers.has(layer.id)}
														isRenaming={renamingLayer === layer.id}
														tempName={tempLayerName}
														onSelect={handleLayerSelect}
														onVisibilityToggle={handleVisibilityToggle}
														onOpacityChange={handleOpacityChange}
														onRenameStart={handleLayerRenameStart}
														onRenameComplete={handleLayerRenameComplete}
														onRenameCancel={handleLayerRenameCancel}
														onTempNameChange={setTempLayerName}
														onDelete={handleLayerDelete}
														onDuplicate={handleLayerDuplicate}
														onIsolate={handleLayerIsolate}
														onExpansionToggle={handleLayerExpansionToggle}
														onEdit={handleLayerEdit}
													/>
												);
											})}
										</div>
									)}
								</div>

								{/* Active Layer Summary */}
								{activeLayer && (
									<div className="bg-accent text-foreground rounded-lg py-2 px-3 border">
										<div className="flex justify-between items-center">
											<span className="text-sm font-medium">Capa Activa</span>
											<span className="text-sm font-bold">
												{activeLayer.name}
											</span>
										</div>
										<div className="text-xs text-muted-foreground mt-1">
											{drawingEngine?.elements?.filter(
												(el) => el.layerId === activeLayer.id
											)?.length || 0}{" "}
											elementos • {Math.round(activeLayer.opacity * 100)}%
											opacidad
										</div>
									</div>
								)}

								{/* Isolation Warning */}
								{isolatedLayerId && (
									<div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg py-2 px-3">
										<div className="text-xs font-medium">
											Capa Aislada:{" "}
											{layers.find((l) => l.id === isolatedLayerId)?.name}
										</div>
									</div>
								)}
							</>
						) : (
							<div className="text-center py-4">
								<div className="text-sm text-muted-foreground">
									Cargando medio...
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* New Layer Dialog */}
				<LayerForm
					isOpen={isNewLayerDialogOpen}
					onClose={() => {
						setIsNewLayerDialogOpen(false);
						setEditingLayer(null);
					}}
					onCreateLayer={handleCreateLayer}
					onUpdateLayer={handleUpdateLayer}
					layerToEdit={editingLayer}
					vehicles={vehicles}
				/>
			</PopoverContent>
		</Popover>
	);
}
