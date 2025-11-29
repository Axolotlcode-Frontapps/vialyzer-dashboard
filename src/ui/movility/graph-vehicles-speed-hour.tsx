import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { ChartConfig } from "../shared/chart";

import { movility } from "@/lib/services/movility";
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
			const speed = await movility.vehicleSpeedHour(camera, {
				endDate: initialValues.endDate ?? "",
				startDate: initialValues.startDate ?? "",
				rawScenarioIds: initialValues.zones?.join(","),
				rawVehicleIds: initialValues.actors?.join(","),
			});

			return speed;
		},
	});

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
