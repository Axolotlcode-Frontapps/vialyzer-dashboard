import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { movility } from "@/lib/services/movility";
import { chartConfig } from "@/lib/utils/charts";
import { Route } from "@/routes/_dashboard/movility/$camera/route";
import { GraphStack } from "../shared/graphs/stack";
import { Skeleton } from "../shared/skeleton";
import { useGraphFilters } from "./filters/use-graph-filters";

const axis = {
	x: {
		label: "Hora del día",
		datakey: "hour_of_day",
	},
	y: {
		label: "Volumen total",
		formatter: (value: string) => parseInt(value, 10).toLocaleString(),
	},
};

const legends = {
	left: "",
};

export function Graph15Minutes() {
	const { camera } = Route.useParams();
	const { initialValues } = useGraphFilters();

	const {
		data: hourlyGraph,
		isLoading,
		isRefetching,
		isFetching,
		isPending,
	} = useQuery({
		queryKey: ["vehicles-hourly-graph-volume", camera, initialValues],
		queryFn: async () => {
			const hourly = await movility.vehicleCount(camera, {
				endDate: initialValues.endDate ?? "",
				startDate: initialValues.startDate ?? "",
				rawScenarioIds: initialValues.zones?.join(","),
				rawVehicleIds: initialValues.actors?.join(","),
			});

			return hourly;
		},
	});

	const loading = useMemo(
		() => isLoading || isRefetching || isFetching || isPending,
		[isLoading, isRefetching, isFetching, isPending]
	);

	const data = useMemo(
		() =>
			hourlyGraph?.map((item) => ({
				hour_of_day: `${item.hour_of_day.toString().padStart(2, "0")}:00`,
				...item.metadata.reduce(
					(acc, vehicle) => {
						const key = vehicle.vehiclename.replaceAll(" ", "_").toLowerCase();

						acc[key] = vehicle.vol_acumulate;

						return acc;
					},
					{} as Record<string, number>
				),
			})) ?? [],
		[hourlyGraph]
	);

	if (loading) {
		return <Skeleton className="h-[300px]" />;
	}

	return (
		<GraphStack
			title="Volumen total hora"
			data={data}
			config={chartConfig as Record<string, { label: string; color: string }>}
			axis={axis}
			legends={legends}
			tooltip={(label: string) => {
				const day = data.find((item) => item.hour_of_day === label);
				if (!day) return label;

				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { hour_of_day, ...vehicles } = day;

				const total = Object.values(vehicles ?? {}).reduce(
					(sum, count) => (sum as number) + (count as number),
					0
				) as number;
				return (
					<span>
						<span className="block">{label}</span>
						<span className="block">{`Volumen total: ${total.toLocaleString()}`}</span>
					</span>
				);
			}}
		/>
	);
}
