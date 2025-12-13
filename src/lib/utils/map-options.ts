export type MapStyleId = "default" | "dark" | "night" | "retro";

export const mapContainerStyle = {
	width: "100%",
	height: "100%",
	background: "#d2d2d2",
	borderRadius: "1rem",
};

export const MAP_STYLES_CONFIG: Record<
	MapStyleId,
	{
		name: string;
		preview: string;
		styles: google.maps.MapTypeStyle[];
		useMapId?: boolean;
		cloudStyleId?: string;
	}
> = {
	default: {
		name: "Predeterminado",
		preview: "bg-gradient-to-br from-blue-400 to-blue-600",
		styles: [],
		useMapId: true,
		cloudStyleId: import.meta.env.VITE_GOOGLE_MAP_STYLE_DEFAULT,
	},
	dark: {
		name: "Oscuro",
		preview: "bg-gradient-to-br from-gray-700 to-gray-900",
		styles: [],
		useMapId: true,
		cloudStyleId: import.meta.env.VITE_GOOGLE_MAP_STYLE_DARK,
	},
	night: {
		name: "Nocturno",
		preview: "bg-gradient-to-br from-indigo-900 to-black",
		styles: [],
		useMapId: true,
		cloudStyleId: import.meta.env.VITE_GOOGLE_MAP_STYLE_NIGHT,
	},
	retro: {
		name: "Retro",
		preview: "bg-gradient-to-br from-amber-200 to-orange-400",
		styles: [],
		useMapId: true,
		cloudStyleId: import.meta.env.VITE_GOOGLE_MAP_STYLE_RETRO,
	},
};

export function getMapStyles(styleId: MapStyleId): google.maps.MapTypeStyle[] {
	return MAP_STYLES_CONFIG[styleId]?.styles || [];
}

export function shouldUseMapId(styleId: MapStyleId): boolean {
	return MAP_STYLES_CONFIG[styleId]?.useMapId || false;
}

export function getMapId(): string {
	return import.meta.env.VITE_GOOGLE_MAP_ID || "";
}

export function getCloudStyleId(styleId: MapStyleId): string | undefined {
	return MAP_STYLES_CONFIG[styleId]?.cloudStyleId;
}
