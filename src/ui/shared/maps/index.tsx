import {
	Circle,
	GoogleMap,
	Marker,
	TrafficLayer,
} from "@react-google-maps/api";
import { useQuery } from "@tanstack/react-query";
import { useGoogleMaps } from "@/contexts/maps";
import { useSelectedLocation } from "@/hooks/use-selected-location";

import { homeService } from "@/lib/services/home";
import { mapContainerStyle, mapOptions } from "@/lib/utils/map-options";
import { MapLegend } from "./map-legend";

const center = { lat: 3.4516, lng: -76.532 };
const cameraPinSvg = `data:image/svg+xml;utf8,<svg width='48' height='64' viewBox='0 0 48 64' fill='none' xmlns='http://www.w3.org/2000/svg'><defs><filter id='shadow' x='0' y='0' width='48' height='64'><feDropShadow dx='0' dy='4' stdDeviation='4' flood-color='rgba(0,0,0,0.3)'/></filter></defs><g filter='url(%23shadow)'><path d='M24 64C24 64 48 40.8 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 40.8 24 64 24 64Z' fill='%232563eb'/><circle cx='24' cy='24' r='12' fill='white'/><g><rect x='18' y='20' width='12' height='8' rx='2' fill='%232563eb'/><circle cx='24' cy='24' r='2' fill='white'/></g></g></svg>`;

export function Maps() {
	const { isLoaded } = useGoogleMaps();
	const { data: previewCamerasData } = useQuery({
		queryKey: ["get-cameras"],
		queryFn: async () => await homeService.getCameras(),
		select: (data) => data.payload || [],
	});

	const { onSelect, selectedLocation } = useSelectedLocation();

	if (!isLoaded) return null;

	return (
		<div className="relative w-full h-full">
			<GoogleMap
				mapContainerStyle={mapContainerStyle}
				center={selectedLocation ? selectedLocation.location : center}
				zoom={13}
				options={
					{
						...mapOptions,
						styles: [
							{
								featureType: "all",
								elementType: "geometry",
								stylers: [{ color: "#f8fafc" }],
							},
							{
								featureType: "road",
								elementType: "geometry.stroke",
								stylers: [{ color: "#3b82f6" }, { weight: 1.5 }],
							},
							{
								featureType: "water",
								elementType: "geometry",
								stylers: [{ color: "#bfdbfe" }],
							},
							{
								featureType: "poi",
								elementType: "geometry",
								stylers: [{ color: "#f1f5f9" }],
							},
							{
								featureType: "transit",
								elementType: "geometry",
								stylers: [{ color: "#bfdbfe" }],
							},
							{
								featureType: "road",
								elementType: "labels.text.fill",
								stylers: [{ color: "#1e293b" }, { visibility: "on" }],
							},
							{
								featureType: "poi",
								elementType: "labels",
								stylers: [{ visibility: "off" }],
							},
							{
								featureType: "transit",
								elementType: "labels",
								stylers: [{ visibility: "off" }],
							},
							{
								featureType: "administrative.locality",
								elementType: "labels.text.fill",
								stylers: [{ color: "#3b82f6" }, { weight: 2 }],
							},
							{
								featureType: "administrative.locality",
								elementType: "labels.text.stroke",
								stylers: [{ color: "#fff" }, { weight: 4 }],
							},
						],
					} as google.maps.MapOptions
				}
			>
				<TrafficLayer />

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
					<Marker
						key={loc.id}
						position={{
							lat: parseFloat(loc.location.latitude),
							lng: parseFloat(loc.location.longitude),
						}}
						onClick={() => onSelect(loc.id)}
						icon={{
							url: cameraPinSvg,
							scaledSize: new window.google.maps.Size(48, 64),
						}}
					/>
				))}
			</GoogleMap>
			<MapLegend />
		</div>
	);
}
