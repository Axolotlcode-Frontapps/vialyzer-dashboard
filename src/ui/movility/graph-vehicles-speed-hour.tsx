import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

// import { getVehiclesSpeedHour } from '@/logic/services/movility/get-vehicles-speed-hour';

import type { ChartConfig } from "../shared/chart";

import { Route } from "@/routes/_dashboard/movility/$camera/route";
import { GraphBar } from "../shared/graphs/bar";
import { Skeleton } from "../shared/skeleton";
import { useGraphFilters } from "./filters/use-graph-filters";

const chartConfig: ChartConfig = {
	average_speed: {
		label: "Velocidad promedio",
		color: "hsl(var(--chart-car))",
	},
};

const axis = {
	y: {
		label: "Velocidad (km/h)",
		unit: " km/h",
		datakey: "average_speed",
	},
	x: {
		label: "Hora del día",
		datakey: "hour_of_day",
	},
};

function getVehiclesSpeedHour(_camera: string, _filters: Record<string, any>) {
	console.log("mock");
	return Promise.resolve({
		payload: [
			{ hour_of_day: 0, average_speed: 45 },
			{ hour_of_day: 1, average_speed: 42 },
			{ hour_of_day: 2, average_speed: 40 },
			{ hour_of_day: 3, average_speed: 38 },
			{ hour_of_day: 4, average_speed: 41 },
			{ hour_of_day: 5, average_speed: 48 },
			{ hour_of_day: 6, average_speed: 55 },
			{ hour_of_day: 7, average_speed: 62 },
			{ hour_of_day: 8, average_speed: 58 },
			{ hour_of_day: 9, average_speed: 52 },
			{ hour_of_day: 10, average_speed: 50 },
			{ hour_of_day: 11, average_speed: 51 },
			{ hour_of_day: 12, average_speed: 53 },
			{ hour_of_day: 13, average_speed: 54 },
			{ hour_of_day: 14, average_speed: 52 },
			{ hour_of_day: 15, average_speed: 51 },
			{ hour_of_day: 16, average_speed: 49 },
			{ hour_of_day: 17, average_speed: 47 },
			{ hour_of_day: 18, average_speed: 50 },
			{ hour_of_day: 19, average_speed: 53 },
			{ hour_of_day: 20, average_speed: 55 },
			{ hour_of_day: 21, average_speed: 52 },
			{ hour_of_day: 22, average_speed: 48 },
			{ hour_of_day: 23, average_speed: 46 },
		],
	});
}

export function GraphVehiclesSpeedHour() {
	const { camera } = Route.useParams();
	const { initialValues } = useGraphFilters();

	const {
		data: serverData = [],
		isLoading,
		isRefetching,
		isFetching,
		isPending,
	} = useQuery({
		queryKey: ["vehicle-speed-hour", camera, initialValues],
		queryFn: async () => {
			const speed = await getVehiclesSpeedHour(camera, {
				endDate: initialValues.endDate,
				scenarioIds: initialValues.zones,
				startDate: initialValues.startDate,
				vehicleIds: initialValues.actors,
				dayOfWeek: initialValues.dayOfWeek,
				hour: initialValues.hour,
				minuteInterval: initialValues.minuteInterval,
			});

			return speed.payload;
		},
	});

	console.log({ serverData });

	const loading = useMemo(
		() => isLoading || isRefetching || isFetching || isPending,
		[isLoading, isRefetching, isFetching, isPending]
	);

	const data = useMemo(
		() =>
			serverData
				.sort((a, b) => a.hour_of_day - b.hour_of_day)
				.map((item) => ({
					...item,
					hour_of_day: `${item.hour_of_day.toString().padStart(2, "0")}:00`,
				})),
		[serverData]
	);

	if (loading) {
		return <Skeleton className="h-[400px]" />;
	}

	return (
		<GraphBar
			title="Velocidad promedio por hora"
			data={data}
			config={chartConfig as Record<string, { label: string; color: string }>}
			axis={axis}
		/>
	);
}
