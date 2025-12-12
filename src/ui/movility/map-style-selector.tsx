import { Palette } from "lucide-react";

import type { MapStyleId } from "@/lib/utils/map-options";

import { MAP_STYLES_CONFIG } from "@/lib/utils/map-options";
import { Popover, PopoverContent, PopoverTrigger } from "../shared/popover";

interface MapStyleSelectorProps {
	onStyleChange: (styleId: MapStyleId) => void;
	currentStyle: MapStyleId;
}

export function MapStyleSelector({ onStyleChange, currentStyle }: MapStyleSelectorProps) {
	const mapStyles = Object.entries(MAP_STYLES_CONFIG).map(([id, config]) => ({
		id: id as MapStyleId,
		name: config.name,
		preview: config.preview,
	}));

	return (
		<Popover>
			<PopoverTrigger asChild className="max-w-fit">
				<button
					type="button"
					className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors flex items-center gap-2"
					aria-label="Cambiar estilo del mapa"
				>
					<Palette className="min-w-5 size-5 text-gray-700" />
					<span className="text-sm text-gray-700 font-medium hidden sm:inline">Tema</span>
				</button>
			</PopoverTrigger>
			<PopoverContent side="right" align="start" className="w-72 p-3 bg-white text-gray-700">
				<h3 className="text-sm font-semibold mb-3 text-gray-700">Estilo del Mapa</h3>
				<div className="grid grid-cols-2 gap-2">
					{mapStyles.map((style) => (
						<button
							key={style.id}
							type="button"
							onClick={() => onStyleChange(style.id)}
							className={`relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
								currentStyle === style.id
									? "border-primary shadow-lg"
									: "border-gray-200 hover:border-gray-300"
							}`}
						>
							<div className={`h-16 ${style.preview}`} />
							<div className="bg-white px-2 py-1.5 text-center">
								<span className="text-xs font-medium text-gray-700">{style.name}</span>
							</div>
							{currentStyle === style.id && (
								<div className="absolute top-1 right-1 bg-primary rounded-full p-1">
									<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
							)}
						</button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
