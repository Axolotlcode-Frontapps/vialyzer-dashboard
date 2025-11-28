import { useCallback, useMemo, useState } from "react";
import {
	Circle,
	GoogleMap,
	Polygon,
	TrafficLayer,
} from "@react-google-maps/api";
import { useQuery } from "@tanstack/react-query";
import { useGoogleMaps } from "@/contexts/maps";
import { useNeighborhoods } from "@/hooks/use-neighborhoods.ts";
import { useSelectedLocation } from "@/hooks/use-selected-location";

import type { HeatmapType } from "@/lib/utils/heatmap-config";
import type { MapStyleId } from "@/lib/utils/map-options";
import type { NeighborhoodFeature } from "@/types/neighborhood.ts";

import { homeService } from "@/lib/services/home";
import {
	getCloudStyleId,
	getMapId,
	getMapStyles,
	mapContainerStyle,
	shouldUseMapId,
} from "@/lib/utils/map-options";
import { convertGeoJSONToGoogleMapsPath } from "@/lib/utils/neighborhood-tools.ts";
import { AdvancedMarker } from "@/ui/movility/advanced-marker.tsx";
import { HeatmapControls } from "@/ui/movility/heatmap-control.tsx";
import { MapStyleSelector } from "@/ui/movility/map-style-selector.tsx";
import { ZoneControls } from "@/ui/movility/zone-controls.tsx";

const center = { lat: 3.4516, lng: -76.532 };

export function Maps() {
	const { isLoaded } = useGoogleMaps();
	const { zones, caliBoundary } = useNeighborhoods();
	const { onSelect, selectedLocation, selected } = useSelectedLocation();

	const { data: previewCamerasData } = useQuery({
		queryKey: ["get-cameras"],
		queryFn: async () => await homeService.getCameras(),
		select: (data) => data.payload || [],
	});

	const [mapStyle, setMapStyle] = useState<MapStyleId>("default");
	const [activeHeatmap, setActiveHeatmap] = useState<HeatmapType | null>(null);
	const [map, setMap] = useState<google.maps.Map | null>(null);
	const [mapZoom, setMapZoom] = useState<number>(13);
	const [selectedZone, setSelectedZone] = useState<string | null>(null);
	const [selectedNeighborhood, setSelectedNeighborhood] =
		useState<NeighborhoodFeature | null>(null);
	const [showCaliBoundary, setShowCaliBoundary] = useState(false);

	const onUnmount = useCallback(() => setMap(null), []);
	const onLoad = useCallback((map: google.maps.Map) => {
		setMap(map);
		setMapZoom(map.getZoom() || 13);

		map.addListener("zoom_changed", () => {
			setMapZoom(map.getZoom() || 13);
		});
	}, [mapZoom]);

	const mapOptions = useMemo(() => {
		const useMapId = shouldUseMapId(mapStyle);
		const styles = getMapStyles(mapStyle);
		const mapId = getMapId();
		const cloudStyleId = getCloudStyleId(mapStyle);

		const baseOptions: google.maps.MapOptions = {
			disableDefaultUI: true,
			zoomControl: true,
		};

		if (useMapId && mapId && cloudStyleId) {
			return {
				...baseOptions,
				mapId: cloudStyleId,
			};
		}

		if (useMapId && mapId) {
			return {
				...baseOptions,
				mapId: mapId,
			};
		}

		return {
			...baseOptions,
			styles: styles,
		};
	}, [mapStyle]);

	// Preparar datos de heatmap según el tipo activo
	/*
    const heatmapData = useMemo(() => {
        if (!activeHeatmap || !window.google?.maps) return [];

        switch (activeHeatmap) {
            case 'accidents':
                return convertToHeatmapData(accidents, 3);
            case 'construction':
                return convertToHeatmapData(construction, 2);
            case 'traffic':
                return payload ? generateTrafficHeatmapData(payload, 4) : [];
            case 'combined':
                const accidentPoints = convertToHeatmapData(accidents, 3);
                const constructionPoints = convertToHeatmapData(construction, 2);
                const trafficPoints = payload
                    ? generateTrafficHeatmapData(payload, 1.5)
                    : [];
                return [...accidentPoints, ...constructionPoints, ...trafficPoints];
            default:
                return [];
        }
    }, [activeHeatmap, accidents, construction, payload]);

    // Opciones del heatmap según el tipo
    const heatmapOptions = useMemo(() => {
        if (!activeHeatmap) return undefined;
        const config = HEATMAP_CONFIGS[activeHeatmap];

        // Calcular radius dinámico basado en zoom
        const minZoom = 8;
        const maxZoom = 18;
        const zoomFactor = Math.max(
            0,
            Math.min(1, (mapZoom - minZoom) / (maxZoom - minZoom))
        );
        const dynamicRadius = Math.round(config.radius * (0.3 + zoomFactor * 1.2));

        return {
            radius: dynamicRadius,
            opacity: config.opacity,
            gradient: config.gradient,
            maxIntensity: config.maxIntensity,
            dissipating: config.dissipating,
        };
    }, [activeHeatmap, mapZoom]);
    */

	if (!isLoaded) return null;

	return (
		<div className="relative w-full h-full">
			<div className="absolute top-2 left-2 @sm/map:top-4 @sm/map:left-4 z-50 flex flex-col gap-2">
				<MapStyleSelector onStyleChange={setMapStyle} currentStyle={mapStyle} />
				<ZoneControls
					zones={zones}
					selectedZone={selectedZone}
					selectedNeighborhood={selectedNeighborhood?.properties["@id"] || null}
					showCaliBoundary={showCaliBoundary}
					onZoneSelect={setSelectedZone}
					onNeighborhoodSelect={setSelectedNeighborhood}
					onToggleCaliBoundary={() => setShowCaliBoundary(!showCaliBoundary)}
				/>
				<HeatmapControls
					activeHeatmap={activeHeatmap}
					onHeatmapChange={setActiveHeatmap}
				/>
			</div>
			<GoogleMap
				key={mapStyle}
				mapContainerStyle={mapContainerStyle}
				center={selectedLocation ? selectedLocation.location : center}
				zoom={13}
				onLoad={onLoad}
				onUnmount={onUnmount}
				options={mapOptions}
			>
				<TrafficLayer />

				{/*
                activeHeatmap && heatmapData.length > 0 && (
                    <HeatmapLayer data={heatmapData} options={heatmapOptions} />
                )
                */}

				{showCaliBoundary && caliBoundary && (
					<Polygon
						paths={convertGeoJSONToGoogleMapsPath(
							caliBoundary.geometry.coordinates
						)}
						options={{
							fillColor: "#8b5cf6",
							fillOpacity: 0.05,
							strokeColor: "#7c3aed",
							strokeOpacity: 0.9,
							strokeWeight: 4,
						}}
					/>
				)}

				{/* Polígonos de Barrios */}
				{selectedNeighborhood && (
					<Polygon
						paths={convertGeoJSONToGoogleMapsPath(
							selectedNeighborhood.geometry.coordinates
						)}
						options={{
							fillColor: "#3b82f6",
							fillOpacity: 0.2,
							strokeColor: "#2563eb",
							strokeOpacity: 0.8,
							strokeWeight: 3,
						}}
					/>
				)}

				{/* Polígonos de Zona (todos los barrios de la zona) */}
				{selectedZone &&
					!selectedNeighborhood &&
					zones
						.find((z) => z.id === selectedZone)
						?.neighborhoods.map((neighborhood) => (
							<Polygon
								key={neighborhood.properties["@id"]}
								paths={convertGeoJSONToGoogleMapsPath(
									neighborhood.geometry.coordinates
								)}
								options={{
									fillColor: "#10b981",
									fillOpacity: 0.15,
									strokeColor: "#059669",
									strokeOpacity: 0.6,
									strokeWeight: 2,
								}}
							/>
						))}

				{previewCamerasData?.map((loc) => (
					<Circle
						key={`${loc.id}-circle`}
						center={{
							lat: parseFloat(loc.location.latitude),
							lng: parseFloat(loc.location.longitude),
						}}
						radius={120}
						options={{
							fillColor: "#3b82f6",
							fillOpacity: 0.15,
							strokeColor: "#3b82f6",
							strokeOpacity: 0.2,
							strokeWeight: 1,
						}}
					/>
				))}

				{previewCamerasData?.map((loc) => (
					<AdvancedMarker
						key={loc.id}
						map={map}
						position={{
							lat: parseFloat(loc.location.latitude),
							lng: parseFloat(loc.location.longitude),
						}}
						onClick={() => onSelect(loc.id)}
						isSelected={selected === loc.id}
						color="#0f3227"
					/>
				))}
			</GoogleMap>
			{/* <MapLegend /> */}
		</div>
	);
}
