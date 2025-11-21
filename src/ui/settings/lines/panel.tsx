import { useEffect, useState } from "react";
import { BarChart3, ChevronRight } from "lucide-react";

import type { PanelProps } from "./types";

import { Button } from "@/ui/shared/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/ui/shared/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/shared/popover";

export function Panel({ drawingEngine }: PanelProps) {
	// Internal state for panel visibility and elements
	const [isVisible, setIsVisible] = useState(false);

	// Get data from drawing engine
	const isMediaLoaded = drawingEngine?.isInitialized || false;
	const elements = drawingEngine?.elements ?? [];

	// Subscribe to drawing engine state changes
	useEffect(() => {
		if (!drawingEngine) return;

		const unsubscribe = drawingEngine.subscribeToStateChanges((stateChange) => {
			if (stateChange.type === "togglePanel") {
				setIsVisible((prev) => !prev);
			}
		});

		return unsubscribe;
	}, [drawingEngine]);

	const onToggle = () => setIsVisible(!isVisible);

	return (
		<Popover open={isVisible} onOpenChange={onToggle}>
			<PopoverTrigger asChild>
				<Button
					className="size-8"
					variant="secondary"
					size="icon"
					title={isVisible ? "Hide statistics panel" : "Show statistics panel"}
				>
					<BarChart3 className="size-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-64 p-4" align="end">
				<Card className="border-none p-0 bg-transparent">
					<CardHeader className="p-0 flex items-center justify-between">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<BarChart3 className="size-4" />
							Estadísticas
						</CardTitle>
						<CardAction>
							<Button
								onClick={onToggle}
								variant="ghost"
								size="icon"
								className="size-8"
								title="Hide panel"
							>
								<ChevronRight className="size-4" />
							</Button>
						</CardAction>
					</CardHeader>

					<CardContent className="space-y-3 p-0">
						{isMediaLoaded ? (
							<>
								{/* Media Info */}
								<div className="bg-muted rounded-lg p-3 border">
									<div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
										Información
									</div>
									<div className="text-sm font-medium text-foreground">
										{/* media type */}
									</div>
									<div className="text-xs text-muted-foreground/80">
										{/* media into*/}
									</div>
								</div>

								{/* Drawing Elements Count */}
								<div className="space-y-2">
									<div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
										Elementos
									</div>

									<div className="grid grid-cols-2 gap-2 text-xs">
										<div className="flex justify-between items-center bg-red-50 px-2 py-1 rounded border-l-2 border-red-300">
											<span className="text-red-700 font-medium">Lineas</span>
											<span className="text-red-600 font-semibold">
												{elements.filter((e) => e.type === "line").length}
											</span>
										</div>

										<div className="flex justify-between items-center bg-green-50 px-2 py-1 rounded border-l-2 border-green-300">
											<span className="text-green-700 font-medium">Áreas</span>
											<span className="text-green-600 font-semibold">
												{elements.filter((e) => e.type === "area").length}
											</span>
										</div>

										<div className="flex justify-between items-center bg-blue-50 px-2 py-1 rounded border-l-2 border-blue-300">
											<span className="text-blue-700 font-medium">Curvas</span>
											<span className="text-blue-600 font-semibold">
												{elements.filter((e) => e.type === "curve").length}
											</span>
										</div>

										{/*<div className="flex justify-between items-center bg-orange-50 px-2 py-1 rounded border-l-2 border-orange-300">
                      <span className="text-orange-700 font-medium">
                        Rectángulos
                      </span>
                      <span className="text-orange-600 font-semibold">
                        {elements.filter((e) => e.type === 'rectangle').length}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-purple-50 px-2 py-1 rounded border-l-2 border-purple-300">
                      <span className="text-purple-700 font-medium">
                        Circulos
                      </span>
                      <span className="text-purple-600 font-semibold">
                        {elements.filter((e) => e.type === 'circle').length}
                      </span>
                    </div>*/}
									</div>
								</div>

								{/* Total Summary */}
								<div className="bg-accent text-foreground rounded-lg py-1 px-2 border">
									<div className="flex justify-between items-center">
										<span className="text-sm font-medium">
											Elementos totales
										</span>
										<span className="text-lg font-bold">{elements.length}</span>
									</div>
								</div>
							</>
						) : (
							<div className="text-center py-4">
								<div className="text-sm text-muted-foreground">
									Cargando recurso...
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</PopoverContent>
		</Popover>
	);
}
