import { useEffect, useState } from "react";

import type React from "react";
import type { CanvasContextMenuProps, DrawingElement, Point } from "./types";

import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuTrigger,
} from "@/ui/shared/context-menu";

export function CanvasContextMenu({
	children,
	drawingEngine,
}: CanvasContextMenuProps & {
	children: React.ReactNode;
}) {
	// Internal state for context menu position
	const [contextMenuPosition, setContextMenuPosition] = useState<Point>({
		x: 0,
		y: 0,
	});

	// Local state that syncs with drawing engine
	const [selectedElements, setSelectedElements] = useState<string[]>(
		drawingEngine?.selectedElements || []
	);
	const [clipboard, setClipboard] = useState<DrawingElement[]>(drawingEngine?.getClipboard() || []);
	const [elements, setElements] = useState<DrawingElement[]>(drawingEngine?.elements || []);

	// Subscribe to drawing engine state changes
	useEffect(() => {
		if (!drawingEngine) return;

		const unsubscribe = drawingEngine.subscribeToStateChanges(() => {
			// Update all state for any changes
			setSelectedElements(drawingEngine.selectedElements);
			setClipboard(drawingEngine.getClipboard());
			setElements(drawingEngine.elements);
		});

		return unsubscribe;
	}, [drawingEngine]);

	// Initialize local state when drawing engine becomes available
	useEffect(() => {
		if (drawingEngine) {
			setSelectedElements(drawingEngine.selectedElements);
			setClipboard(drawingEngine.getClipboard());
			setElements(drawingEngine.elements);
		}
	}, [drawingEngine]);

	// Track mouse position on the canvas
	useEffect(() => {
		const canvas = document.querySelector("canvas");
		if (!canvas) return;

		const handleMouseMove = (e: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			const position = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			};
			setContextMenuPosition(position);
		};

		canvas.addEventListener("mousemove", handleMouseMove);
		return () => canvas.removeEventListener("mousemove", handleMouseMove);
	}, []);

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
			<ContextMenuContent className="w-64">
				{/* Clipboard Operations */}
				{selectedElements.length > 0 && (
					<>
						<ContextMenuItem
							onClick={() => {
								const copiedCount = drawingEngine?.copySelectedElements() || 0;
								if (copiedCount > 0) {
									drawingEngine?.resetPasteOffset();
								}
							}}
						>
							Copiar {selectedElements.length} elemento(s)
							<ContextMenuShortcut className="min-w-max">Ctrl+C</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuItem
							onClick={() => drawingEngine?.cutSelectedElements()}
							className="text-red-600"
						>
							Cortar {selectedElements.length} elemento(s)
							<ContextMenuShortcut className="min-w-max">Ctrl+X</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuItem onClick={() => drawingEngine?.duplicateSelectedElements()}>
							Duplicar {selectedElements.length} elemento(s)
							<ContextMenuShortcut className="min-w-max">Ctrl+D</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuSeparator />
					</>
				)}

				{/* Paste Operations */}
				{clipboard.length > 0 && (
					<>
						<ContextMenuItem
							onClick={() => drawingEngine?.pasteElements(true, contextMenuPosition)}
						>
							Pegar Aquí ({clipboard.length} elemento(s))
							<ContextMenuShortcut className="min-w-max">Ctrl+Shift+V</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuItem onClick={() => drawingEngine?.pasteElements(false)}>
							Pegar con Desplazamiento ({clipboard.length} elemento(s))
							<ContextMenuShortcut className="min-w-max">Ctrl+V</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuSeparator />
					</>
				)}

				{/* Text Operations */}
				{selectedElements.length === 1 && (
					<>
						<ContextMenuItem onClick={() => drawingEngine?.addText()}>
							{elements.find((el) => el.id === selectedElements[0])?.info?.name
								? "Editar Etiqueta de Texto"
								: "Agregar Etiqueta de Texto"}
							<ContextMenuShortcut className="min-w-max">T</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuSeparator />
					</>
				)}

				{/* Selection Operations */}
				{selectedElements.length > 0 && (
					<>
						<ContextMenuItem
							onClick={() => drawingEngine?.deleteSelectedElements()}
							className="text-red-600"
						>
							Eliminar {selectedElements.length} elemento(s)
							<ContextMenuShortcut className="min-w-max">Del</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuItem onClick={() => drawingEngine?.clearSelection()}>
							Limpiar Selección
							<ContextMenuShortcut className="min-w-max">Ctrl+Shift+A</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuSeparator />
					</>
				)}

				{/* Drawing Mode Operations */}
				<ContextMenuItem onClick={() => drawingEngine?.setDrawingMode("cursor")}>
					Cambiar a Modo Cursor
					<ContextMenuShortcut className="min-w-max">C or 1</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => drawingEngine?.setDrawingMode("select")}>
					Cambiar a Modo Selección
					<ContextMenuShortcut className="min-w-max">S or 2</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => drawingEngine?.setDrawingMode("erase")}>
					Cambiar a Modo Borrar
					<ContextMenuShortcut className="min-w-max">E or 3</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => drawingEngine?.setDrawingMode("line")}>
					Cambiar a Modo Línea
					<ContextMenuShortcut className="min-w-max">L or 4</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => drawingEngine?.setDrawingMode("area")}>
					Cambiar a Modo Área
					<ContextMenuShortcut className="min-w-max">A or 5</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => drawingEngine?.setDrawingMode("curve")}>
					Cambiar a Modo Curva
					<ContextMenuShortcut className="min-w-max">U or 6</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => drawingEngine?.setDrawingMode("rectangle")}>
					Cambiar a Modo Rectángulo
					<ContextMenuShortcut className="min-w-max">R or 7</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => drawingEngine?.setDrawingMode("circle")}>
					Cambiar a Modo Círculo
					<ContextMenuShortcut className="min-w-max">O or 8</ContextMenuShortcut>
				</ContextMenuItem>

				{/* Utility Operations */}
				{(elements.length > 0 || clipboard.length > 0) && (
					<>
						<ContextMenuSeparator />
						{clipboard.length > 0 && (
							<ContextMenuItem onClick={() => drawingEngine?.clearClipboard()}>
								Limpiar Portapapeles ({clipboard.length} elemento(s))
							</ContextMenuItem>
						)}
						{elements.length > 0 && (
							<ContextMenuItem onClick={() => drawingEngine?.clearAll()} className="text-red-600">
								Limpiar Todos los Elementos ({elements.length} total)
								<ContextMenuShortcut className="min-w-max">Ctrl+Shift+C</ContextMenuShortcut>
							</ContextMenuItem>
						)}
					</>
				)}
			</ContextMenuContent>
		</ContextMenu>
	);
}
