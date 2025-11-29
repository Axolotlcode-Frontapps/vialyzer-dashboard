import { useMemo } from "react";
import { format } from "@formkit/tempo";
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
		datakey: "average_speed",
		unit: " km/h",
	},
	x: {
		label: "Día",
		datakey: "query_date",
	},
};

export function GraphVehiclesSpeed() {
	const { camera } = Route.useParams();
	const { initialValues } = useGraphFilters();

	const {
		data: speedGraph,
		isLoading,
		isRefetching,
		isFetching,
		isPending,
	} = useQuery({
		queryKey: ["graph-speed-mobility", camera, initialValues],
		queryFn: async () => {
			const graph = await movility.vehicleSpeed(camera, {
				endDate: initialValues.endDate ?? "",
				startDate: initialValues.startDate ?? "",
				rawScenarioIds: initialValues.zones?.join(","),
				rawVehicleIds: initialValues.actors?.join(","),
			});

			return graph;
		},
	});

	const loading = useMemo(
		() => isLoading || isRefetching || isFetching || isPending,
		[isLoading, isRefetching, isFetching, isPending]
	);

	const data = useMemo(() => {
		return (speedGraph ?? [])
			?.sort(
				(a, b) =>
					new Date(a.query_date).getTime() - new Date(b.query_date).getTime()
			)
			.map((item) => {
				const formattedDate = format(
					new Date(item.query_date),
					"ddd DD",
					"es-MX"
				);
				const query_date = `${formattedDate[0].toUpperCase()}${formattedDate.slice(1)}`;

				return {
					...item,
					average_speed: parseFloat(item.average_speed),
					query_date,
				};
			});
	}, [speedGraph]);

	if (loading) {
		return <Skeleton className="h-[400px]" />;
	}

	return (
		<GraphBar
			title="Velocidad promedio por fecha"
			data={data}
			config={chartConfig as Record<string, { label: string; color: string }>}
			axis={axis}
		/>
	);
}
