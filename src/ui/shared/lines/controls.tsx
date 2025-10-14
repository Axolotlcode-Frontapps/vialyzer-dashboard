import { useEffect, useState } from "react";
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	BringToFront,
	Circle,
	Copy,
	Download,
	Eraser,
	Group,
	MousePointer2,
	MoveUpLeft,
	Pentagon,
	Pointer,
	RotateCcw,
	Save,
	Scissors,
	SendToBack,
	Spline,
	Square,
	Trash2,
	Type,
	Undo,
	Ungroup,
} from "lucide-react";

import type { ControlsProps, DrawingMode } from "./types";

import { Button } from "../button";
import { Card, CardHeader } from "../card";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarShortcut,
	MenubarTrigger,
} from "../menubar";
import { ToggleGroup, ToggleGroupItem } from "../toggle-group";

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

	// Subscribe to drawing engine state changes
	useEffect(() => {
		if (!drawingEngine) return;

		const unsubscribe = drawingEngine.subscribeToStateChanges((stateChange) => {
			switch (stateChange.type) {
				case "modeChange":
					setDrawingMode(stateChange.drawingMode as DrawingMode);
					break;
				case "action":
					// Update elements and selection when actions occur
					setElements(drawingEngine.elements);
					setSelectedElements(drawingEngine.selectedElements);
					break;
				case "mediaLoaded":
					setIsMediaLoaded(true);
					break;
				default:
					// Update all state for other changes
					setDrawingMode(drawingEngine.drawingMode);
					setSelectedElements(drawingEngine.selectedElements);
					setElements(drawingEngine.elements);
					setIsMediaLoaded(drawingEngine.isInitialized);
			}
		});

		return unsubscribe;
	}, [drawingEngine]);

	// Initialize local state when drawing engine becomes available
	useEffect(() => {
		if (drawingEngine) {
			setDrawingMode(drawingEngine.drawingMode);
			setSelectedElements(drawingEngine.selectedElements);
			setElements(drawingEngine.elements);
			setIsMediaLoaded(drawingEngine.isInitialized);
		}
	}, [drawingEngine]);

	const handleSave = async () => {
		if (!onSave || !drawingEngine || elements.length === 0) return;

		try {
			setIsSaving(true);
			await onSave(elements);
		} catch (error) {
			console.error("Failed to save:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const getStatusMessage = (mode?: DrawingMode) => {
		if (!isMediaLoaded) return "Loading media...";

		const targetMode = mode || drawingMode;
		const messages = {
			cursor:
				"Cursor mode: Drag points to move, Double-click elements to add text",
			select:
				"Select mode: Click to select, Ctrl+Click for multi-select, Double-click to add text",
			erase: "Erase mode: Click elements to delete them instantly",
			line: "Click and drag to draw lines",
			rectangle: "Click and drag to draw rectangles. Hold Shift for squares",
			circle: "Click and drag to draw circles from center",
			area: "Click to add points. Double-click or press Enter to complete",
			curve:
				"Click to add points for smooth curve. Double-click or press Enter to complete",
		};

		return messages[targetMode] || "";
	};

	return (
		<div className="flex items-center gap-3">
			<Menubar className="border-0 shadow-none bg-transparent gap-1 p-0">
				{/* File Menu */}
				<MenubarMenu>
					<MenubarTrigger className="px-2.5 py-1.5 text-sm">
						File
					</MenubarTrigger>
					<MenubarContent>
						<MenubarItem
							onClick={() => drawingEngine?.exportDrawings()}
							disabled={!isMediaLoaded || elements.length === 0}
						>
							<Download className="w-4 h-4" />
							Export Matrix
							<MenubarShortcut>Ctrl+Shift+E</MenubarShortcut>
						</MenubarItem>
						{onSave && (
							<MenubarItem
								onClick={handleSave}
								disabled={!isMediaLoaded || elements.length === 0 || isSaving}
							>
								<Save className="w-4 h-4" />
								{isSaving ? "Saving..." : "Save to Backend"}
								<MenubarShortcut>Ctrl+S</MenubarShortcut>
							</MenubarItem>
						)}
					</MenubarContent>
				</MenubarMenu>

				{/* Drawing Tools */}
				<MenubarMenu>
					<MenubarTrigger className="px-2.5 py-1.5 text-sm">
						Tools
					</MenubarTrigger>
					<MenubarContent>
						<MenubarItem
							onClick={() => drawingEngine?.setDrawingMode("cursor")}
						>
							<MousePointer2 className="w-4 h-4" />
							Cursor Mode
							<MenubarShortcut>C or 1</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.setDrawingMode("select")}
						>
							<Pointer className="w-4 h-4" />
							Select Mode
							<MenubarShortcut>S or 2</MenubarShortcut>
						</MenubarItem>
						<MenubarItem onClick={() => drawingEngine?.setDrawingMode("erase")}>
							<Eraser className="w-4 h-4" />
							Erase Mode
							<MenubarShortcut>E or 3</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem onClick={() => drawingEngine?.setDrawingMode("line")}>
							<MoveUpLeft className="w-4 h-4" />
							Line
							<MenubarShortcut>L or 4</MenubarShortcut>
						</MenubarItem>
						<MenubarItem onClick={() => drawingEngine?.setDrawingMode("curve")}>
							<Spline className="w-4 h-4" />
							Curve
							<MenubarShortcut>U or 6</MenubarShortcut>
						</MenubarItem>
						<MenubarItem onClick={() => drawingEngine?.setDrawingMode("area")}>
							<Pentagon className="w-4 h-4" />
							Area
							<MenubarShortcut>A or 5</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.setDrawingMode("rectangle")}
						>
							<Square className="w-4 h-4" />
							Rectangle
							<MenubarShortcut>R or 7</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.setDrawingMode("circle")}
						>
							<Circle className="w-4 h-4" />
							Circle
							<MenubarShortcut>O or 8</MenubarShortcut>
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>

				{/* Edit Menu */}
				<MenubarMenu>
					<MenubarTrigger className="px-2.5 py-1.5 text-sm">
						Edit
					</MenubarTrigger>
					<MenubarContent>
						<MenubarItem
							onClick={() => drawingEngine?.undoLast()}
							disabled={!isMediaLoaded || !drawingEngine?.canUndo?.()}
						>
							<Undo className="w-4 h-4" />
							Undo
							<MenubarShortcut>Ctrl+Z</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.redoLast()}
							disabled={!isMediaLoaded || !drawingEngine?.canRedo?.()}
						>
							<Undo className="w-4 h-4" style={{ transform: "scaleX(-1)" }} />
							Redo
							<MenubarShortcut>Ctrl+Y</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem
							onClick={() => drawingEngine?.copySelectedElements()}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<Copy className="w-4 h-4" />
							Copy ({selectedElements.length})
							<MenubarShortcut>Ctrl+C</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.cutSelectedElements()}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<Scissors className="w-4 h-4" />
							Cut ({selectedElements.length})
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
							Paste
							<MenubarShortcut>Ctrl+V</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.duplicateSelectedElements()}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<Copy className="w-4 h-4" />
							Duplicate ({selectedElements.length})
							<MenubarShortcut>Ctrl+D</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem
							onClick={() => drawingEngine?.selectAllElements()}
							disabled={!isMediaLoaded || elements.length === 0}
						>
							<MousePointer2 className="w-4 h-4" />
							Select All
							<MenubarShortcut>Ctrl+A</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.clearSelection()}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<MousePointer2 className="w-4 h-4" />
							Clear Selection
							<MenubarShortcut>Ctrl+Shift+A</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem
							onClick={() => drawingEngine?.deleteSelectedElements()}
							disabled={!isMediaLoaded || selectedElements.length === 0}
							variant="destructive"
						>
							<Trash2 className="w-4 h-4" />
							Delete Selected ({selectedElements.length})
							<MenubarShortcut>Del</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.clearAll()}
							disabled={!isMediaLoaded}
							variant="destructive"
						>
							<RotateCcw className="w-4 h-4" />
							Clear All
							<MenubarShortcut>Ctrl+Shift+C</MenubarShortcut>
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>

				{/* Arrange Menu */}
				<MenubarMenu>
					<MenubarTrigger className="px-2.5 py-1.5 text-sm">
						Arrange
					</MenubarTrigger>
					<MenubarContent>
						<MenubarItem
							onClick={() => drawingEngine?.groupSelectedElements()}
							disabled={!isMediaLoaded || selectedElements.length < 2}
						>
							<Group className="w-4 h-4" />
							Group ({selectedElements.length})
							<MenubarShortcut>Ctrl+G</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.ungroupSelectedElements()}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<Ungroup className="w-4 h-4" />
							Ungroup
							<MenubarShortcut>Ctrl+Shift+G</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem
							onClick={() => drawingEngine?.bringToFront()}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<BringToFront className="w-4 h-4" />
							Bring to Front
							<MenubarShortcut>Ctrl+]</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.sendToBack()}
							disabled={!isMediaLoaded || selectedElements.length === 0}
						>
							<SendToBack className="w-4 h-4" />
							Send to Back
							<MenubarShortcut>Ctrl+[</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem
							onClick={() => drawingEngine?.alignElements?.("left")}
							disabled={!isMediaLoaded || selectedElements.length < 2}
						>
							<AlignLeft className="w-4 h-4" />
							Align Left
							<MenubarShortcut>Ctrl+Shift+L</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.alignElements?.("centerX")}
							disabled={!isMediaLoaded || selectedElements.length < 2}
						>
							<AlignCenter className="w-4 h-4" />
							Align Center
							<MenubarShortcut>Ctrl+Shift+H</MenubarShortcut>
						</MenubarItem>
						<MenubarItem
							onClick={() => drawingEngine?.alignElements?.("right")}
							disabled={!isMediaLoaded || selectedElements.length < 2}
						>
							<AlignRight className="w-4 h-4" />
							Align Right
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
							Align Top
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
							Align Middle
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
							Align Bottom
							<MenubarShortcut>Ctrl+Shift+B</MenubarShortcut>
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>

				{/* Actions Menu */}
				<MenubarMenu>
					<MenubarTrigger className="px-2.5 py-1.5 text-sm">
						Actions
					</MenubarTrigger>
					<MenubarContent>
						<MenubarItem
							onClick={() => drawingEngine?.addText()}
							disabled={selectedElements.length !== 1}
						>
							<Type className="w-4 h-4" />
							Add Text Label
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
							Move Up
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
							Move Down
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
							Move Left
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
							Move Right
							<MenubarShortcut>→</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
					</MenubarContent>
				</MenubarMenu>
			</Menubar>

			{/* Mode Toggle Group */}
			<div
				className="relative z-0"
				role="group"
				onMouseLeave={() => setHoveredTool(null)}
			>
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
						aria-label="Cursor mode"
						title="Cursor (C or 1)"
						onMouseEnter={() => setHoveredTool("cursor")}
					>
						<MousePointer2 className="size-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="select"
						aria-label="Select mode"
						title="Select (S or 2)"
						onMouseEnter={() => setHoveredTool("select")}
					>
						<Pointer className="size-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="erase"
						aria-label="Erase mode"
						title="Erase (E or 3)"
						onMouseEnter={() => setHoveredTool("erase")}
					>
						<Eraser className="size-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="line"
						aria-label="Line mode"
						title="Line (L or 4)"
						onMouseEnter={() => setHoveredTool("line")}
					>
						<MoveUpLeft className="size-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="curve"
						aria-label="Curve mode"
						title="Curve (U or 6)"
						onMouseEnter={() => setHoveredTool("curve")}
					>
						<Spline className="size-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="area"
						aria-label="Area mode"
						title="Area (A or 5)"
						onMouseEnter={() => setHoveredTool("area")}
					>
						<Pentagon className="size-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="rectangle"
						aria-label="Rectangle mode"
						title="Rectangle (R or 7)"
						onMouseEnter={() => setHoveredTool("rectangle")}
					>
						<Square className="size-4" />
					</ToggleGroupItem>
					<ToggleGroupItem
						value="circle"
						aria-label="Circle mode"
						title="Circle (O or 8)"
						onMouseEnter={() => setHoveredTool("circle")}
					>
						<Circle className="size-4" />
					</ToggleGroupItem>
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
							? "Add/Edit text label (T or F2)"
							: "Select one element to add text"
					}
				>
					<Type className="size-4" />
				</Button>

				{onSave && (
					<Button
						onClick={handleSave}
						size="icon"
						variant="outline"
						className="size-8"
						disabled={!isMediaLoaded || elements.length === 0 || isSaving}
						title={isSaving ? "Saving..." : "Save elements to backend (Ctrl+S)"}
					>
						<Save className="size-4" />
					</Button>
				)}
			</div>
		</div>
	);
}
