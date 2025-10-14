/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AccidentReport, ConstructionReport } from "@/types/movility";

export const CALI_BOUNDS = {
	north: 3.5516,
	south: 3.3516,
	east: -76.432,
	west: -76.632,
} as const;

export interface TrafficIncidentsFilters {
	types?: ("ACCIDENT" | "CONSTRUCTION" | "ROAD_CLOSURE" | "TRAFFIC_JAM")[];
	severity?: ("LOW" | "MEDIUM" | "HIGH" | "CRITICAL")[];
	timeRange?: {
		start: Date;
		end: Date;
	};
}

export const getTrafficIncidents = async (
	filters: TrafficIncidentsFilters = {}
): Promise<{
	accidents: AccidentReport[];
	construction: ConstructionReport[];
}> => {
	try {
		const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

		if (!apiKey) {
			throw new Error(
				"Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables."
			);
		}

		let { accidents, construction } = await getGoogleMapsTrafficIncidents(
			apiKey,
			CALI_BOUNDS
		);

		if (filters.types) {
			if (!filters.types.includes("ACCIDENT")) {
				accidents = [];
			}
			if (!filters.types.includes("CONSTRUCTION")) {
				construction = [];
			}
		}

		if (filters.severity) {
			accidents = accidents.filter((acc) =>
				filters.severity!.includes(acc.severity)
			);
			construction = construction.filter((con) =>
				filters.severity!.includes(con.severity)
			);
		}

		if (filters.timeRange) {
			const { start, end } = filters.timeRange;
			accidents = accidents.filter((acc) => {
				const incidentTime = new Date(acc.startTime);
				return incidentTime >= start && incidentTime <= end;
			});
			construction = construction.filter((con) => {
				const incidentTime = new Date(con.startTime);
				return incidentTime >= start && incidentTime <= end;
			});
		}

		return {
			accidents,
			construction,
		};
	} catch (error) {
		console.error("Error fetching traffic incidents:", error);
		return {
			accidents: [],
			construction: [],
		};
	}
};

export const getGoogleMapsTrafficIncidents = async (
	apiKey: string,
	bounds: typeof CALI_BOUNDS
): Promise<{
	accidents: AccidentReport[];
	construction: ConstructionReport[];
}> => {
	try {
		const response = await fetch(
			`https://roads.googleapis.com/v1/snapToRoads?path=${bounds.south},${bounds.west}|${bounds.north},${bounds.east}&key=${apiKey}`
		);

		if (!response.ok) {
			throw new Error(`Google Maps API error: ${response.statusText}`);
		}

		const data = await response.json();
		const accidents: AccidentReport[] = [];
		const construction: ConstructionReport[] = [];

		if (data.snappedPoints) {
			for (const point of data.snappedPoints) {
				if (point.placeId) {
					const placeResponse = await fetch(
						`https://maps.googleapis.com/maps/api/place/details/json?place_id=${point.placeId}&key=${apiKey}`
					);
					const placeData = await placeResponse.json();

					if (placeData.result) {
						const incident = {
							id: point.placeId,
							severity: determineSeverity(placeData.result),
							location: {
								latitude: point.location.latitude,
								longitude: point.location.longitude,
							},
							description: placeData.result.name || "Traffic incident",
							startTime: new Date().toISOString(),
							roadName: placeData.result.vicinity || "Unknown road",
							affectedArea: {
								radius: 100,
							},
						};

						if (isAccident(placeData.result)) {
							accidents.push({
								...incident,
								type: "ACCIDENT",
								vehiclesInvolved: 1,
								injuries: false,
								fatalities: false,
							});
						} else if (isConstruction(placeData.result)) {
							construction.push({
								...incident,
								type: "CONSTRUCTION",
								projectName: placeData.result.name || "Road work",
								estimatedCompletion: undefined,
								laneClosures: 1,
							});
						}
					}
				}
			}
		}

		return {
			accidents,
			construction,
		};
	} catch (error) {
		console.error("Error fetching from Google Maps API:", error);
		return {
			accidents: [],
			construction: [],
		};
	}
};

interface Place {
	name?: string;
	types?: string[];
	rating?: number;
}

function determineSeverity(
	place: Place
): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
	if (place.rating && place.rating < 2) return "CRITICAL";
	if (place.rating && place.rating < 3) return "HIGH";
	if (place.rating && place.rating < 4) return "MEDIUM";
	return "LOW";
}

function isAccident(place: Place): boolean {
	const keywords = ["accident", "crash", "collision"];
	return keywords.some(
		(keyword) =>
			place.name?.toLowerCase().includes(keyword) ||
			place.types?.some((type: string) => type.toLowerCase().includes(keyword))
	);
}

function isConstruction(place: Place): boolean {
	const keywords = ["construction", "roadwork", "maintenance"];
	return keywords.some(
		(keyword) =>
			place.name?.toLowerCase().includes(keyword) ||
			place.types?.some((type: string) => type.toLowerCase().includes(keyword))
	);
}
