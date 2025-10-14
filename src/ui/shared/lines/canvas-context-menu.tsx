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
} from "../context-menu";

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
	const [clipboard, setClipboard] = useState<DrawingElement[]>(
		drawingEngine?.getClipboard() || []
	);
	const [elements, setElements] = useState<DrawingElement[]>(
		drawingEngine?.elements || []
	);

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
							Copy {selectedElements.length} element(s)
							<ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuItem
							onClick={() => drawingEngine?.cutSelectedElements()}
							className="text-red-600"
						>
							Cut {selectedElements.length} element(s)
							<ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuItem
							onClick={() => drawingEngine?.duplicateSelectedElements()}
						>
							Duplicate {selectedElements.length} element(s)
							<ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuSeparator />
					</>
				)}

				{/* Paste Operations */}
				{clipboard.length > 0 && (
					<>
						<ContextMenuItem
							onClick={() =>
								drawingEngine?.pasteElements(true, contextMenuPosition)
							}
						>
							Paste Here ({clipboard.length} element(s))
							<ContextMenuShortcut>Ctrl+Shift+V</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuItem
							onClick={() => drawingEngine?.pasteElements(false)}
						>
							Paste with Offset ({clipboard.length} element(s))
							<ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuSeparator />
					</>
				)}

				{/* Text Operations */}
				{selectedElements.length === 1 && (
					<>
						<ContextMenuItem onClick={() => drawingEngine?.addText()}>
							{elements.find((el) => el.id === selectedElements[0])?.text
								? "Edit Text Label"
								: "Add Text Label"}
							<ContextMenuShortcut>T</ContextMenuShortcut>
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
							Delete {selectedElements.length} element(s)
							<ContextMenuShortcut>Del</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuItem onClick={() => drawingEngine?.clearSelection()}>
							Clear Selection
							<ContextMenuShortcut>Ctrl+Shift+A</ContextMenuShortcut>
						</ContextMenuItem>
						<ContextMenuSeparator />
					</>
				)}

				{/* Drawing Mode Operations */}
				<ContextMenuItem
					onClick={() => drawingEngine?.setDrawingMode("cursor")}
				>
					Switch to Cursor Mode
					<ContextMenuShortcut>C or 1</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem
					onClick={() => drawingEngine?.setDrawingMode("select")}
				>
					Switch to Select Mode
					<ContextMenuShortcut>S or 2</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => drawingEngine?.setDrawingMode("erase")}>
					Switch to Erase Mode
					<ContextMenuShortcut>E or 3</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => drawingEngine?.setDrawingMode("line")}>
					Switch to Line Mode
					<ContextMenuShortcut>L or 4</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => drawingEngine?.setDrawingMode("area")}>
					Switch to Area Mode
					<ContextMenuShortcut>A or 5</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => drawingEngine?.setDrawingMode("curve")}>
					Switch to Curve Mode
					<ContextMenuShortcut>U or 6</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem
					onClick={() => drawingEngine?.setDrawingMode("rectangle")}
				>
					Switch to Rectangle Mode
					<ContextMenuShortcut>R or 7</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem
					onClick={() => drawingEngine?.setDrawingMode("circle")}
				>
					Switch to Circle Mode
					<ContextMenuShortcut>O or 8</ContextMenuShortcut>
				</ContextMenuItem>

				{/* Utility Operations */}
				{(elements.length > 0 || clipboard.length > 0) && (
					<>
						<ContextMenuSeparator />
						{clipboard.length > 0 && (
							<ContextMenuItem onClick={() => drawingEngine?.clearClipboard()}>
								Clear Clipboard ({clipboard.length} element(s))
							</ContextMenuItem>
						)}
						{elements.length > 0 && (
							<ContextMenuItem
								onClick={() => drawingEngine?.clearAll()}
								className="text-red-600"
							>
								Clear All Elements ({elements.length} total)
								<ContextMenuShortcut>Ctrl+Shift+C</ContextMenuShortcut>
							</ContextMenuItem>
						)}
					</>
				)}
			</ContextMenuContent>
		</ContextMenu>
	);
}
