import { memo, useCallback, useMemo } from "react";
import {
	ChevronDown,
	ChevronRight,
	Copy,
	Edit,
	Eye,
	EyeOff,
	Lock,
	MoreVertical,
	PenLine,
	Trash2,
} from "lucide-react";

import type { LayerInfo, LayerVisibility } from "../drawing/layers";

import { Button } from "@/ui/shared/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/shared/dropdown-menu";
import { Input } from "@/ui/shared/input";
import { Label } from "@/ui/shared/label";
import { Slider } from "@/ui/shared/slider";

interface LayerItemProps {
	layer: LayerInfo;
	isActive: boolean;
	isIsolated: boolean;
	isExpanded: boolean;
	isRenaming: boolean;
	tempName: string;
	onSelect: (layerId: string) => void;
	onVisibilityToggle: (layerId: string) => void;
	onOpacityChange: (layerId: string, opacity: number) => void;
	onRenameStart: (layerId: string, currentName: string) => void;
	onRenameComplete: (layerId: string, newName: string) => void;
	onRenameCancel: () => void;
	onTempNameChange: (name: string) => void;
	onDelete: (layerId: string) => void;
	onDuplicate: (layerId: string) => void;
	onIsolate: (layerId: string) => void;
	onExpansionToggle: (layerId: string) => void;
	onEdit: (layer: LayerInfo) => void;
}

const visibility: Record<LayerVisibility, typeof Eye> = {
	hidden: EyeOff,
	locked: Lock,
	visible: Eye,
};

export const LayerItem = memo(function LayerItem({
	layer,
	isActive,
	isIsolated,
	isExpanded,
	isRenaming,
	tempName,
	onSelect,
	onVisibilityToggle,
	onOpacityChange,
	onRenameStart,
	onRenameComplete,
	onRenameCancel,
	onTempNameChange,
	onDelete,
	onDuplicate,
	onIsolate,
	onExpansionToggle,
	onEdit,
}: LayerItemProps) {
	const handleRename = useCallback(() => {
		onRenameComplete(layer.id, tempName);
	}, [tempName, layer.id, onRenameComplete]);

	const handleCancelRename = useCallback(() => {
		onRenameCancel();
	}, [onRenameCancel]);

	const handleStartRename = useCallback(() => {
		onRenameStart(layer.id, layer.name);
	}, [layer.id, layer.name, onRenameStart]);

	const handleInputKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			// Always stop propagation to prevent interference with global shortcuts
			e.stopPropagation();

			if (e.key === "Enter") {
				e.preventDefault();
				handleRename();
			} else if (e.key === "Escape") {
				e.preventDefault();
				handleCancelRename();
			}
			// For all other keys, let them through to the input but prevent bubbling
		},
		[handleRename, handleCancelRename]
	);
	const VisibilityIcon = useMemo(() => visibility[layer.visibility], [layer.visibility]);

	return (
		<div
			className={`group border rounded-lg transition-all ${
				isActive
					? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
					: "border-border hover:border-muted-foreground/50"
			} ${isIsolated ? "ring-2 ring-yellow-400" : ""}`}
		>
			{/* Layer Header */}
			<div className="p-3">
				<div className="flex items-center gap-2">
					{/* Expand Toggle */}
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 shrink-0"
						onClick={(e) => {
							e.stopPropagation();
							onExpansionToggle(layer.id);
						}}
						aria-label={isExpanded ? "Contraer detalles de capa" : "Expandir detalles de capa"}
					>
						{isExpanded ? (
							<ChevronDown className="w-3 h-3" />
						) : (
							<ChevronRight className="w-3 h-3" />
						)}
					</Button>

					{/* Layer Color Indicator */}
					{layer.color && (
						<div
							className="w-3 h-3 rounded-full border border-border shrink-0"
							style={{ backgroundColor: layer.color }}
						/>
					)}

					{/* Layer Name - Clickable area for selection */}
					{isRenaming ? (
						<section
							className="flex-1"
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
							onKeyUp={(e) => e.stopPropagation()}
							onKeyPress={(e) => e.stopPropagation()}
							aria-label="Contenedor de entrada para renombrar capa"
						>
							<Input
								value={tempName}
								onChange={(e) => onTempNameChange(e.target.value)}
								onBlur={handleRename}
								onKeyDown={handleInputKeyDown}
								onKeyUp={(e) => e.stopPropagation()}
								onKeyPress={(e) => e.stopPropagation()}
								className="h-6 text-sm w-full"
								autoFocus
								placeholder="Nombre de capa"
								onClick={(e) => e.stopPropagation()}
								onFocus={(e) => e.stopPropagation()}
							/>
						</section>
					) : (
						<button
							type="button"
							className={`flex-1 text-sm font-medium truncate text-left px-1 py-1 rounded transition-colors ${
								isActive
									? "text-blue-700 dark:text-blue-300 font-semibold"
									: "text-foreground hover:bg-muted/50"
							} focus:outline-none focus:ring-2 focus:ring-primary/50`}
							onClick={() => onSelect(layer.id)}
							onDoubleClick={(e) => {
								e.stopPropagation();
								handleStartRename();
							}}
							onKeyDown={(e) => {
								e.stopPropagation();
								if (e.key === "Enter") {
									e.preventDefault();
									onSelect(layer.id);
								} else if (e.key === "F2") {
									e.preventDefault();
									handleStartRename();
								}
							}}
							title={layer.name}
							aria-label={`Capa: ${layer.name}. Clic para seleccionar, doble clic para renombrar.`}
						>
							{layer.name}
						</button>
					)}

					{/* Element Count */}
					<span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded shrink-0">
						{layer.elementIds.length}
					</span>

					{/* Visibility Toggle */}
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 shrink-0"
						onClick={(e) => {
							e.stopPropagation();
							onVisibilityToggle(layer.id);
						}}
						aria-label={`Alternar visibilidad de capa: ${layer.visibility}`}
					>
						<VisibilityIcon />
					</Button>

					{/* Layer Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
								onClick={(e) => e.stopPropagation()}
								aria-label="Menú de opciones de capa"
							>
								<MoreVertical className="w-3 h-3" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
						>
							<DropdownMenuItem
								onClick={() => onEdit(layer)}
								onKeyDown={(e) => e.stopPropagation()}
							>
								<Edit className="w-4 h-4 mr-2" />
								Editar Capa
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handleStartRename} onKeyDown={(e) => e.stopPropagation()}>
								<PenLine className="size-4 mr-2" />
								Renombrar Capa
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onDuplicate(layer.id)}
								onKeyDown={(e) => e.stopPropagation()}
							>
								<Copy className="w-4 h-4 mr-2" />
								Duplicar Capa
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onIsolate(layer.id)}
								onKeyDown={(e) => e.stopPropagation()}
							>
								<Eye className="w-4 h-4 mr-2" />
								{isIsolated ? "Salir de Aislamiento" : "Aislar Capa"}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => onDelete(layer.id)}
								className="text-destructive focus:text-destructive"
								onKeyDown={(e) => e.stopPropagation()}
							>
								<Trash2 className="w-4 h-4 mr-2" />
								Eliminar Capa
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Layer Details (Expanded) */}
			{isExpanded && (
				<section
					className="px-3 pb-3 space-y-3 border-t border-border bg-muted/20"
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
					aria-label="Sección de controles de capa"
				>
					{/* Opacity Control */}
					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<Label className="text-xs font-medium">Opacidad</Label>
							<span className="text-xs text-muted-foreground">
								{Math.round(layer.opacity * 100)}%
							</span>
						</div>
						<section
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
							aria-label="Control deslizante de opacidad"
						>
							<Slider
								value={[layer.opacity * 100]}
								onValueChange={(values) => onOpacityChange(layer.id, values[0] / 100)}
								max={100}
								min={0}
								step={1}
								className="w-full"
							/>
						</section>
					</div>

					{/* Layer Information */}
					<div className="space-y-1 text-xs text-muted-foreground bg-background/50 rounded p-2">
						<div className="flex justify-between">
							<span>Índice Z:</span>
							<span>{layer.zIndex}</span>
						</div>
						<div className="flex justify-between">
							<span>Elementos:</span>
							<span>{layer.elementIds.length}</span>
						</div>
						{layer?.description ? (
							<div className="pt-1 border-t border-border/50">
								<div className="font-medium">Descripción:</div>
								<div className="text-muted-foreground/80 text-xs">{layer.description}</div>
							</div>
						) : null}
					</div>
				</section>
			)}
		</div>
	);
});
