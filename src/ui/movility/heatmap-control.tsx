import { Car, Construction, Flame, Layers } from "lucide-react";

import type { HeatmapType } from "@/lib/utils/heatmap-config";

import { Popover, PopoverContent, PopoverTrigger } from "../shared/popover";

interface HeatmapOption {
	id: HeatmapType;
	name: string;
	icon: React.ReactNode;
	color: string;
	description: string;
}

const HEATMAP_OPTIONS: HeatmapOption[] = [
	{
		id: "accidents",
		name: "Accidentes",
		icon: <Flame className="min-w-5 size-5" />,
		color: "bg-red-500",
		description: "Mapa de calor de accidentes reportados",
	},
	{
		id: "construction",
		name: "Construcciones",
		icon: <Construction className="min-w-5 size-5" />,
		color: "bg-amber-500",
		description: "Mapa de calor de zonas en construcción",
	},
	{
		id: "traffic",
		name: "Tráfico",
		icon: <Car className="min-w-5 size-5" />,
		color: "bg-green-500",
		description: "Mapa de calor de intensidad de tráfico",
	},
	{
		id: "combined",
		name: "Combinado",
		icon: <Layers className="min-w-5 size-5" />,
		color: "bg-purple-500",
		description: "Mapa de calor combinado de todos los datos",
	},
];

interface HeatmapControlsProps {
	activeHeatmap: HeatmapType | null;
	onHeatmapChange: (type: HeatmapType | null) => void;
}

export function HeatmapControls({ activeHeatmap, onHeatmapChange }: HeatmapControlsProps) {
	const handleToggle = (type: HeatmapType) => {
		if (activeHeatmap === type) {
			onHeatmapChange(null);
		} else {
			onHeatmapChange(type);
		}
	};

	const activeOption = HEATMAP_OPTIONS.find((opt) => opt.id === activeHeatmap);

	return (
		<Popover>
			<PopoverTrigger asChild className="max-w-fit">
				<button
					type="button"
					className={`rounded-lg shadow-lg border p-3 transition-all flex items-center gap-2 ${
						activeHeatmap
							? "bg-white text-gray-700 border-primary"
							: "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
					}`}
					aria-label="Controles de mapa de calor"
				>
					{activeHeatmap ? (
						<>
							{activeOption?.icon}
							<span className="text-sm font-medium hidden sm:inline">
								Calor: {activeOption?.name}
							</span>
						</>
					) : (
						<>
							<Flame className="min-w-5 size-5" />
							<span className="text-sm font-medium hidden sm:inline">Mapa de Calor</span>
						</>
					)}
				</button>
			</PopoverTrigger>
			<PopoverContent side="right" align="start" className="w-72 p-3 bg-white text-gray-700">
				<h3 className="text-sm font-semibold mb-3 text-gray-700">Mapas de Calor</h3>
				<div className="space-y-2">
					{HEATMAP_OPTIONS.map((option) => {
						const isActive = activeHeatmap === option.id;

						return (
							<button
								key={option.id}
								type="button"
								onClick={() => handleToggle(option.id)}
								className={`w-full text-left rounded-lg p-3 transition-all border-2 ${
									isActive
										? "border-primary bg-primary/5"
										: "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
								}`}
							>
								<div className="flex items-center gap-3">
									<div className={`${option.color} text-white rounded-lg p-2`}>{option.icon}</div>
									<div className="flex-1">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium text-gray-900">{option.name}</span>
											{isActive && (
												<div className="bg-primary rounded-full p-1">
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
											)}
										</div>
										<span className="text-xs text-gray-500">{option.description}</span>
									</div>
								</div>
							</button>
						);
					})}
				</div>

				{activeHeatmap && (
					<button
						type="button"
						onClick={() => onHeatmapChange(null)}
						className="w-full mt-3 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
					>
						Desactivar Mapa de Calor
					</button>
				)}
			</PopoverContent>
		</Popover>
	);
}
