import type {
	NeighborhoodCollection,
	NeighborhoodFeature,
	Zone,
} from "@/types/neighborhood";

export function extractCaliBoundary(
	geojson: NeighborhoodCollection
): NeighborhoodFeature | null {
	// Buscar el feature con id numérico 421170643 o con name exactamente "Cali"
	const caliFeature = geojson.features.find((feature) => {
		// Opción 1: Por ID numérico específico del límite de Cali
		if (feature.id === 421170643 || feature.id === "421170643") {
			return true;
		}

		// Opción 2: Por propiedades (sin comuna y con name "Cali")
		if (
			feature.properties.name === "Cali" &&
			!feature.properties.comuna &&
			(feature.geometry.type === "Polygon" ||
				feature.geometry.type === "MultiPolygon")
		) {
			return true;
		}

		return false;
	});

	console.log("Searching for Cali boundary...");
	console.log("Found caliFeature:", caliFeature ? "YES" : "NO");
	if (caliFeature) {
		console.log("Cali feature properties:", caliFeature.properties);
	}

	return caliFeature || null;
}

export function groupNeighborhoodByZone(
	geojson: NeighborhoodCollection
): Zone[] {
	const zoneMap = new Map<string, NeighborhoodFeature[]>();

	const validFeatures = geojson.features.filter(
		(feature) =>
			(feature.geometry.type === "Polygon" ||
				feature.geometry.type === "MultiPolygon") &&
			feature.properties.name
	);

	validFeatures.forEach((feature) => {
		const comuna = feature.properties.comuna || "sin-comuna";

		if (!zoneMap.has(comuna)) {
			zoneMap.set(comuna, []);
		}
		zoneMap.get(comuna)!.push(feature);
	});

	const zones: Zone[] = Array.from(zoneMap.entries())
		.map(([comunaId, neighborhoods]) => {
			const comunaName =
				comunaId === "sin-comuna" ? "Sin Comuna" : `Comuna ${comunaId}`;

			return {
				id: comunaId,
				name: comunaName,
				neighborhoodCount: neighborhoods.length,
				neighborhoods: neighborhoods.sort((a, b) =>
					(a.properties.name || "").localeCompare(b.properties.name || "")
				),
			};
		})
		.sort((a, b) => {
			if (a.id === "sin-comuna") return 1;
			if (b.id === "sin-comuna") return -1;
			return a.name.localeCompare(b.name);
		});

	return zones;
}

export function convertGeoJSONToGoogleMapsPath(
	coordinates: number[][] | number[][][]
): google.maps.LatLngLiteral[] {
	const coords = Array.isArray(coordinates[0][0])
		? (coordinates[0] as number[][])
		: (coordinates as number[][]);

	return coords.map(([lng, lat]) => ({ lat, lng }));
}
