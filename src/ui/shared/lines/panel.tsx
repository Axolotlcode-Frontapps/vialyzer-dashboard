import { useEffect, useState } from "react";
import { BarChart3, ChevronRight } from "lucide-react";

import type { PanelProps } from "./types";

import { Button } from "../button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "../card";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

export function Panel({ drawingEngine }: PanelProps) {
	// Internal state for panel visibility
	const [isVisible, setIsVisible] = useState(false);

	// Get data from drawing engine
	const elements = drawingEngine?.elements || [];
	const isMediaLoaded = drawingEngine?.isInitialized || false;

	// Subscribe to drawing engine state changes for toggle events
	useEffect(() => {
		if (!drawingEngine) return;

		const unsubscribe = drawingEngine.subscribeToStateChanges((stateChange) => {
			if (stateChange.type === "togglePanel") {
				setIsVisible((prev) => !prev);
			}
		});

		return unsubscribe;
	}, [drawingEngine]);

	// Handle toggle
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
				{/* Stats Panel */}
				<Card className="border-none p-0">
					<CardHeader className="p-0 flex items-center justify-between">
						<CardTitle className="text-sm font-medium flex items-center gap-2">
							<BarChart3 className="size-4" />
							Drawing Statistics
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
										Media Info
									</div>
									<div className="text-sm font-medium text-foreground">
										Media
									</div>
									<div className="text-xs text-muted-foreground/80">
										Drawing Canvas
									</div>
								</div>

								{/* Drawing Elements Count */}
								<div className="space-y-2">
									<div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
										Elements
									</div>

									<div className="grid grid-cols-2 gap-2 text-xs">
										<div className="flex justify-between items-center bg-red-50 px-2 py-1 rounded border-l-2 border-red-300">
											<span className="text-red-700 font-medium">Lines</span>
											<span className="text-red-600 font-semibold">
												{elements.filter((e) => e.type === "line").length}
											</span>
										</div>

										<div className="flex justify-between items-center bg-green-50 px-2 py-1 rounded border-l-2 border-green-300">
											<span className="text-green-700 font-medium">Areas</span>
											<span className="text-green-600 font-semibold">
												{elements.filter((e) => e.type === "area").length}
											</span>
										</div>

										<div className="flex justify-between items-center bg-blue-50 px-2 py-1 rounded border-l-2 border-blue-300">
											<span className="text-blue-700 font-medium">Curves</span>
											<span className="text-blue-600 font-semibold">
												{elements.filter((e) => e.type === "curve").length}
											</span>
										</div>

										<div className="flex justify-between items-center bg-orange-50 px-2 py-1 rounded border-l-2 border-orange-300">
											<span className="text-orange-700 font-medium">Rects</span>
											<span className="text-orange-600 font-semibold">
												{elements.filter((e) => e.type === "rectangle").length}
											</span>
										</div>

										<div className="flex justify-between items-center bg-purple-50 px-2 py-1 rounded border-l-2 border-purple-300">
											<span className="text-purple-700 font-medium">
												Circles
											</span>
											<span className="text-purple-600 font-semibold">
												{elements.filter((e) => e.type === "circle").length}
											</span>
										</div>

										<div className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded border-l-2 border-gray-300">
											<span className="text-gray-700 font-medium">w/ Text</span>
											<span className="text-gray-600 font-semibold">
												{elements.filter((e) => e.text).length}
											</span>
										</div>
									</div>
								</div>

								{/* Total Summary */}
								<div className="bg-accent text-foreground rounded-lg py-1 px-2 border">
									<div className="flex justify-between items-center">
										<span className="text-sm font-medium">Total Elements</span>
										<span className="text-lg font-bold">{elements.length}</span>
									</div>
								</div>
							</>
						) : (
							<div className="text-center py-4">
								<div className="text-sm text-muted-foreground">
									Loading media...
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</PopoverContent>
		</Popover>
	);
}
