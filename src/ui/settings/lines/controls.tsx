import { useCallback, useEffect, useState } from "react";
import {
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	// BringToFront,
	Camera,
	// Circle,
	Copy,
	// Download,
	Eraser,
	Loader2,
	// Group,
	MousePointer2,
	MoveUpLeft,
	// AlignCenter,
	// AlignLeft,
	// AlignRight,
	NotebookPen,
	Pentagon,
	Pointer,
	RotateCcw,
	Save,
	Scissors,
	// SendToBack,
	Spline,
	// Square,
	Trash2,
	Undo,
	// Ungroup,
} from "lucide-react";

import type { ControlsProps, DrawingMode } from "./types";

import { Button } from "@/ui/shared/button";
import { Card, CardHeader } from "@/ui/shared/card";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarShortcut,
	MenubarTrigger,
} from "@/ui/shared/menubar";
import { ToggleGroup, ToggleGroupItem } from "@/ui/shared/toggle-group";

export function Controls({ drawingEngine, onSave }: ControlsProps) {
	// Local state that syncs with drawing engine
	const [drawingMode, setDrawingMode] = useState<DrawingMode>(
		drawingEngine?.drawingMode || "cursor"
	);
	const [selectedElements, setSelectedElements] = useState(
		drawingEngine?.selectedElements || []
	);
	const [isMediaLoaded, setIsMediaLoaded] = useState(
		drawingEngine?.isInitialized || false
	);
	const [elements, setElements] = useState(drawingEngine?.elements || []);
	const [isSaving, setIsSaving] = useState(false);
	const [hoveredTool, setHoveredTool] = useState<DrawingMode | null>(null);
	const [unsyncedCount, setUnsyncedCount] = useState(0);

	const handleSave = useCallback(async () => {
		if (!onSave || !drawingEngine || drawingEngine.elements.length === 0)
			return;

		// Get sync state stats before saving (both elements and layers)
		const syncStats = drawingEngine.getSyncStateStats();
		const layerStats = drawingEngine.getLayerSyncStateStats();
		const unsyncedElementCount =
			syncStats.new + syncStats.edited + syncStats.deleted;
		const unsyncedLayerCount = layerStats.new + layerStats.edited;
		const totalUnsyncedCount = unsyncedElementCount + unsyncedLayerCount;

		if (totalUnsyncedCount === 0) {
			drawingEngine.setFeedback("No hay cambios para guardar", 2000);
			return;
		}

		try {
			setIsSaving(true);

			// Capture layer tracking state BEFORE save (deep copy to preserve tracking arrays)
			const layers = structuredClone(drawingEngine.getLayers());

			await onSave(drawingEngine.elements, layers as any);

			// Mark all elements and layers as saved after successful save
			drawingEngine.markAllElementsAsSaved();
			drawingEngine.markAllLayersAsSaved();

			const feedbackParts = [];
			if (syncStats.new > 0) feedbackParts.push(`${syncStats.new} nuevos`);
			if (syncStats.edited > 0)
				feedbackParts.push(`${syncStats.edited} editados`);
			if (syncStats.deleted > 0)
				feedbackParts.push(`${syncStats.deleted} eliminados`);
			if (layerStats.new > 0)
				feedbackParts.push(`${layerStats.new} capas nuevas`);
			if (layerStats.edited > 0)
				feedbackParts.push(`${layerStats.edited} capas editadas`);

			drawingEngine.setFeedback(
				`Guardados ${totalUnsyncedCount} cambio(s) (${feedbackParts.join(", ")})`,
				3000
			);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Error desconocido";
			drawingEngine.setFeedback(`Error al guardar: ${errorMessage}`, 5000);
		} finally {
			setIsSaving(false);
		}
	}, [drawingEngine, onSave]);

	// Subscribe to drawing engine state changes
	useEffect(() => {
		if (!drawingEngine) return;

		// Initial sync of unsynced count when engine changes
		const initialElementStats = drawingEngine.getSyncStateStats();
		const initialLayerStats = drawingEngine.getLayerSyncStateStats();
		const initialUnsyncedCount =
			initialElementStats.new +
			initialElementStats.edited +
			initialElementStats.deleted +
			initialLayerStats.new +
			initialLayerStats.edited;
		setUnsyncedCount(initialUnsyncedCount);

		const unsubscribe = drawingEngine.subscribeToStateChanges((stateChange) => {
			switch (stateChange.type) {
				case "modeChange":
					setDrawingMode(stateChange.drawingMode as DrawingMode);
					break;
				case "action": {
					if (stateChange.action === "saveRequested") {
						handleSave();
						return;
					}
					// Update elements and selection when actions occur
					setElements(drawingEngine.elements);
					setSelectedElements(drawingEngine.selectedElements);

					// Update unsynced count
					const stats = drawingEngine.getSyncStateStats();
					setUnsyncedCount(stats.new + stats.edited + stats.deleted);
					break;
				}
				case "mediaLoaded":
					setIsMediaLoaded(true);
					break;
				case "layerAction": {
					// Update unsynced count when layers change
					const stats = drawingEngine.getSyncStateStats();
					const layerStats = drawingEngine.getLayerSyncStateStats();
					const newUnsyncedCount =
						stats.new +
						stats.edited +
						stats.deleted +
						layerStats.new +
						layerStats.edited;

					setUnsyncedCount(newUnsyncedCount);
					break;
				}
				default: {
					// Update all state for other changes
					setDrawingMode(drawingEngine.drawingMode);
					setSelectedElements(drawingEngine.selectedElements);
					setElements(drawingEngine.elements);
					setIsMediaLoaded(drawingEngine.isInitialized);

					// Update unsynced count (include both elements and layers)
					const syncStats = drawingEngine.getSyncStateStats();
					const layerStats = drawingEngine.getLayerSyncStateStats();
					setUnsyncedCount(
						syncStats.new +
							syncStats.edited +
							syncStats.deleted +
							layerStats.new +
							layerStats.edited
					);
				}
			}
		});

		return unsubscribe;
	}, [drawingEngine, handleSave]);

	const getStatusMessage = (mode?: DrawingMode) => {
		if (!isMediaLoaded) return "Cargando medio...";

		const targetMode = mode || drawingMode;
		const messages = {
			cursor:
				"Modo Cursor: Arrastra puntos para mover, Doble clic en elementos para agregar texto",
			select:
				"Modo Selección: Clic para seleccionar, Ctrl+Clic para selección múltiple, Doble clic para agregar texto",
			erase: "Modo Borrar: Clic en elementos para eliminarlos instantáneamente",
			line: "Clic y arrastra para dibujar líneas",
			rectangle:
				"Clic y arrastra para dibujar rectángulos. Mantén Shift para cuadrados",
			circle: "Clic y arrastra para dibujar círculos desde el centro",
			area: "Clic para agregar puntos. Doble clic o presiona Enter para completar",
			curve:
				"Clic para agregar puntos para curva suave. Doble clic o presiona Enter para completar",
		};

		return messages[targetMode] || "";
	};

	return (
		<div className="flex items-center gap-3">
			<Menubar className="border-0 shadow-none bg-transparent gap-1 p-0">
				{/* File Menu */}
				<MenubarMenu>
					<MenubarTrigger className="px-2.5 py-1.5 text-sm">
						Archivo
					</MenubarTrigger>
					<MenubarContent>
						{/*<MenubarItem
              onClick={() => drawingEngine?.exportDrawings()}
              disabled={!isMediaLoaded || elements.length === 0}
            >
              <Download className="w-4 h-4" />
              Exportar Matriz
              <MenubarShortcut>Ctrl+Shift+E</MenubarShortcut>
            </MenubarItem>*/}
						{onSave && (
							<MenubarItem
								onClick={handleSave}
								disabled={!isMediaLoaded || elements.length === 0 || isSaving}
							>
								{isSaving ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<Save className="w-4 h-4" />
								)}
								{isSaving ? "Guardando..." : "Guardar"}
								<MenubarShortcut>Ctrl+S</MenubarShortcut>
							</MenubarItem>
						)}
						<MenubarSeparator />
						<MenubarItem
							onClick={() => {
								try {
									drawingEngine?.takeSnapshotAndDownload();
								} catch (error) {
									console.error("[Controls] Snapshot failed:", error);
									drawingEngine?.setFeedback("Error al tomar la captura", 3000);
								}
							}}
							disabled={!isMediaLoaded}
						>
							<Camera className="w-4 h-4" />
							Tomar captura
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>

				{/* Drawing Tools */}
				<MenubarMenu>
					<MenubarTrigger className="px-2.5 py-1.5 text-sm">
						Herramientas
					</MenubarTrigger>
					<MenubarContent>
						<MenubarItem
							onClick={() => drawingEngine?.setDrawingMode("cursor")}
						>
							<MousePointer2 className="w-4 h-4" />
							Modo Cursor
							<MenubarShortcut>C or 1</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.setDrawingMode("select")}
						>
							<Pointer className="w-4 h-4" />
							Modo Selección
							<MenubarShortcut>S or 2</MenubarShortcut>
						</MenubarItem>
						<MenubarItem onClick={() => drawingEngine?.setDrawingMode("erase")}>
							<Eraser className="w-4 h-4" />
							Modo Borrar
							<MenubarShortcut>E or 3</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem onClick={() => drawingEngine?.setDrawingMode("line")}>
							<MoveUpLeft className="w-4 h-4" />
							Línea
							<MenubarShortcut>L or 4</MenubarShortcut>
						</MenubarItem>
						<MenubarItem onClick={() => drawingEngine?.setDrawingMode("curve")}>
							<Spline className="w-4 h-4" />
							Curva
							<MenubarShortcut>U or 6</MenubarShortcut>
						</MenubarItem>
						<MenubarItem onClick={() => drawingEngine?.setDrawingMode("area")}>
							<Pentagon className="w-4 h-4" />
							Área
							<MenubarShortcut>A or 5</MenubarShortcut>
						</MenubarItem>
						{/*<MenubarItem
              onClick={() => drawingEngine?.setDrawingMode('rectangle')}
            >
              <Square className="w-4 h-4" />
              Rectángulo
              <MenubarShortcut>R or 7</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              onClick={() => drawingEngine?.setDrawingMode('circle')}
            >
              <Circle className="w-4 h-4" />
              Círculo
              <MenubarShortcut>O or 8</MenubarShortcut>
            </MenubarItem>*/}
					</MenubarContent>
				</MenubarMenu>

				{/* Edit Menu */}
				<MenubarMenu>
					<MenubarTrigger className="px-2.5 py-1.5 text-sm">
						Editar
					</MenubarTrigger>
					<MenubarContent>
						<MenubarItem
							onClick={() => drawingEngine?.undoLast()}
							disabled={!isMediaLoaded || !drawingEngine?.canUndo?.()}
						>
							<Undo className="w-4 h-4" />
							Deshacer
							<MenubarShortcut>Ctrl+Z</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.redoLast()}
							disabled={!isMediaLoaded || !drawingEngine?.canRedo?.()}
						>
							<Undo className="w-4 h-4" style={{ transform: "scaleX(-1)" }} />
							Rehacer
							<MenubarShortcut>Ctrl+Y</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem
							onClick={() => drawingEngine?.copySelectedElements()}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<Copy className="w-4 h-4" />
							Copiar ({selectedElements.length})
							<MenubarShortcut>Ctrl+C</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.cutSelectedElements()}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<Scissors className="w-4 h-4" />
							Cortar ({selectedElements.length})
							<MenubarShortcut>Ctrl+X</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.pasteElements()}
							disabled={
								!isMediaLoaded || !drawingEngine?.hasClipboardContent?.()
							}
						>
							<Copy
								className="w-4 h-4"
								style={{ transform: "rotate(180deg)" }}
							/>
							Pegar
							<MenubarShortcut>Ctrl+V</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.duplicateSelectedElements()}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<Copy className="w-4 h-4" />
							Duplicar ({selectedElements.length})
							<MenubarShortcut>Ctrl+D</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem
							onClick={() => drawingEngine?.selectAllElements()}
							disabled={!isMediaLoaded || elements.length === 0}
						>
							<MousePointer2 className="w-4 h-4" />
							Seleccionar Todo
							<MenubarShortcut>Ctrl+A</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.clearSelection()}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<MousePointer2 className="w-4 h-4" />
							Limpiar Selección
							<MenubarShortcut>Ctrl+Shift+A</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem
							onClick={() => drawingEngine?.deleteSelectedElements()}
							disabled={!isMediaLoaded || selectedElements.length === 0}
							variant="destructive"
						>
							<Trash2 className="w-4 h-4" />
							Eliminar Seleccionados ({selectedElements.length})
							<MenubarShortcut>Del</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.clearAll()}
							disabled={!isMediaLoaded}
							variant="destructive"
						>
							<RotateCcw className="w-4 h-4" />
							Limpiar Todo
							<MenubarShortcut>Ctrl+Shift+C</MenubarShortcut>
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>

				{/* Arrange Menu */}
				{/*<MenubarMenu>
					<MenubarTrigger className="px-2.5 py-1.5 text-sm">
						Organizar
					</MenubarTrigger>
					<MenubarContent>
						<MenubarItem
							onClick={() => drawingEngine?.groupSelectedElements()}
							disabled={!isMediaLoaded || selectedElements.length < 2}
						>
							<Group className="w-4 h-4" />
							Agrupar ({selectedElements.length})
							<MenubarShortcut>Ctrl+G</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.ungroupSelectedElements()}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<Ungroup className="w-4 h-4" />
							Desagrupar
							<MenubarShortcut>Ctrl+Shift+G</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem
							onClick={() => drawingEngine?.bringToFront()}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<BringToFront className="w-4 h-4" />
							Traer al Frente
							<MenubarShortcut>Ctrl+]</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.sendToBack()}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<SendToBack className="w-4 h-4" />
							Enviar Atrás
							<MenubarShortcut>Ctrl+[</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem
							onClick={() => drawingEngine?.alignElements?.("left")}
							disabled={!isMediaLoaded || selectedElements.length < 2}
						>
							<AlignLeft className="w-4 h-4" />
							Alinear Izquierda
							<MenubarShortcut>Ctrl+Shift+L</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.alignElements?.("centerX")}
							disabled={!isMediaLoaded || selectedElements.length < 2}
						>
							<AlignCenter className="w-4 h-4" />
							Alinear Centro
							<MenubarShortcut>Ctrl+Shift+H</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.alignElements?.("right")}
							disabled={!isMediaLoaded || selectedElements.length < 2}
						>
							<AlignRight className="w-4 h-4" />
							Alinear Derecha
							<MenubarShortcut>Ctrl+Shift+R</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.alignElements?.("top")}
							disabled={!isMediaLoaded || selectedElements.length < 2}
						>
							<AlignLeft
								className="w-4 h-4"
								style={{ transform: "rotate(90deg)" }}
							/>
							Alinear Arriba
							<MenubarShortcut>Ctrl+Shift+T</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.alignElements?.("centerY")}
							disabled={!isMediaLoaded || selectedElements.length < 2}
						>
							<AlignCenter
								className="w-4 h-4"
								style={{ transform: "rotate(90deg)" }}
							/>
							Alinear Medio
							<MenubarShortcut>Ctrl+Shift+M</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.alignElements?.("bottom")}
							disabled={!isMediaLoaded || selectedElements.length < 2}
						>
							<AlignRight
								className="w-4 h-4"
								style={{ transform: "rotate(90deg)" }}
							/>
							Alinear Abajo
							<MenubarShortcut>Ctrl+Shift+B</MenubarShortcut>
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>*/}

				{/* Actions Menu */}
				<MenubarMenu>
					<MenubarTrigger className="px-2.5 py-1.5 text-sm">
						Acciones
					</MenubarTrigger>
					<MenubarContent>
						<MenubarItem
							onClick={() => drawingEngine?.addText()}
							disabled={selectedElements.length !== 1}
						>
							<NotebookPen className="w-4 h-4" />
							Editar información de escenario
							<MenubarShortcut>T</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem
							onClick={() => {
								const offset = { x: 0, y: -10 };
								drawingEngine?.moveSelectedElements?.(offset);
							}}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<ArrowUp className="w-4 h-4" />
							Mover Arriba
							<MenubarShortcut>↑</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => {
								const offset = { x: 0, y: 10 };
								drawingEngine?.moveSelectedElements?.(offset);
							}}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<ArrowDown className="w-4 h-4" />
							Mover Abajo
							<MenubarShortcut>↓</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => {
								const offset = { x: -10, y: 0 };
								drawingEngine?.moveSelectedElements?.(offset);
							}}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<ArrowLeft className="w-4 h-4" />
							Mover Izquierda
							<MenubarShortcut>←</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => {
								const offset = { x: 10, y: 0 };
								drawingEngine?.moveSelectedElements?.(offset);
							}}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<ArrowRight className="w-4 h-4" />
							Mover Derecha
							<MenubarShortcut>→</MenubarShortcut>
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
			</Menubar>

			{/* Mode Toggle Group */}
			{/** biome-ignore lint/a11y/noStaticElementInteractions: Usefull to have onMouseLeave */}
			<div className="relative z-0" onMouseLeave={() => setHoveredTool(null)}>
				<ToggleGroup
					type="single"
					value={drawingMode}
					onValueChange={(value) =>
						value && drawingEngine?.setDrawingMode(value as typeof drawingMode)
					}
					size="sm"
					className="justify-start w-full"
				>
					<ToggleGroupItem
						value="cursor"
						aria-label="Modo Cursor"
						title="Cursor (C or 1)"
						onMouseEnter={() => setHoveredTool("cursor")}
					>
						<MousePointer2 className="size-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="select"
						aria-label="Modo Selección"
						title="Selección (S or 2)"
						onMouseEnter={() => setHoveredTool("select")}
					>
						<Pointer className="size-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="erase"
						aria-label="Modo Borrar"
						title="Borrar (E or 3)"
						onMouseEnter={() => setHoveredTool("erase")}
					>
						<Eraser className="size-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="line"
						aria-label="Modo Línea"
						title="Línea (L or 4)"
						onMouseEnter={() => setHoveredTool("line")}
					>
						<MoveUpLeft className="size-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="curve"
						aria-label="Modo Curva"
						title="Curva (U or 6)"
						onMouseEnter={() => setHoveredTool("curve")}
					>
						<Spline className="size-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="area"
						aria-label="Modo Área"
						title="Área (A or 5)"
						onMouseEnter={() => setHoveredTool("area")}
					>
						<Pentagon className="size-4" />
					</ToggleGroupItem>
					{/*<ToggleGroupItem
            value="rectangle"
            aria-label="Modo Rectángulo"
            title="Rectángulo (R or 7)"
            onMouseEnter={() => setHoveredTool('rectangle')}
          >
            <Square className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="circle"
            aria-label="Modo Círculo"
            title="Círculo (O or 8)"
            onMouseEnter={() => setHoveredTool('circle')}
          >
            <Circle className="size-4" />
          </ToggleGroupItem>*/}
				</ToggleGroup>
				{/* Status Message */}
				{hoveredTool && (
					<Card
						inert
						className="absolute z-10 top-[110%] w-[150%] min-w-max left-0 p-3 gap-0 bg-muted/70"
					>
						<CardHeader className="block text-xs w-full min-w-max text-foreground/75 p-0">
							{getStatusMessage(hoveredTool)}
						</CardHeader>
					</Card>
				)}
			</div>

			{/* Quick Actions */}
			<div className="flex items-center gap-1">
				<Button
					onClick={() => drawingEngine?.addText()}
					size="icon"
					variant="ghost"
					disabled={selectedElements.length !== 1}
					className="size-8"
					title={
						selectedElements.length === 1
							? "Agregar/Editar etiqueta de texto (T o F2)"
							: "Selecciona un elemento para agregar texto"
					}
				>
					<NotebookPen className="size-4" />
				</Button>

				{onSave && (
					<Button
						onClick={handleSave}
						size="icon"
						variant="outline"
						className="size-8"
						disabled={!isMediaLoaded || isSaving || unsyncedCount === 0}
						title={isSaving ? "Guardando..." : "Guardar elementos (Ctrl+S)"}
					>
						{isSaving ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Save className="size-4" />
						)}
					</Button>
				)}
			</div>
		</div>
	);
}
