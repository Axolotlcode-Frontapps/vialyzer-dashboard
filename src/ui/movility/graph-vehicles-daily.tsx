import { useMemo } from "react";
import { format } from "@formkit/tempo";
import { useQuery } from "@tanstack/react-query";

import { movility } from "@/lib/services/movility";
import { chartConfig } from "@/lib/utils/charts";
import { Route } from "@/routes/_dashboard/movility/$camera/route";
import { GraphStack } from "../shared/graphs/stack";
import { Skeleton } from "../shared/skeleton";
import { useGraphFilters } from "./filters/use-graph-filters";

const axis = {
	x: {
		datakey: "date",
		label: "Día",
	},
	y: {
		label: "Volumen total",
		formatter: (value: string) => parseInt(value, 10).toLocaleString(),
	},
};
const legends = {
	left: "",
};

export function GraphVehiclesDaily() {
	const { camera } = Route.useParams();
	const { initialValues } = useGraphFilters();
	const {
		data: dailyGraph,
		isLoading,
		isRefetching,
		isFetching,
		isPending,
	} = useQuery({
		queryKey: ["vehicles-daily-graph", camera, initialValues],
		queryFn: async () => {
			const daily = await movility.dailyVehicle(camera, {
				endDate: initialValues.endDate ?? "",
				startDate: initialValues.startDate ?? "",
				rawScenarioIds: initialValues.zones?.join(","),
				rawVehicleIds: initialValues.actors?.join(","),
			});

			return daily;
		},
	});

	const loading = useMemo(
		() => isLoading || isRefetching || isFetching || isPending,
		[isLoading, isRefetching, isFetching, isPending]
	);

	const data = useMemo(
		() =>
			dailyGraph?.map((item) => {
				const formattedDate = format(new Date(item.date), "ddd DD", "es-MX");
				const date = `${formattedDate[0].toUpperCase()}${formattedDate.slice(1)}`;

				return {
					date,
					...item.metadata.reduce(
						(acc, vehicle) => {
							const key = vehicle.vehiclename.replaceAll(" ", "_").toLowerCase();

							acc[key] = vehicle.vol_acumulate;

							return acc;
						},
						{} as Record<string, number>
					),
				};
			}) ?? [],
		[dailyGraph]
	);

	const stats = useMemo(() => {
		const values = data.map(({ date, ...vehicles }) => ({
			date,
			total: Object.keys(vehicles).reduce((acc, key) => {
				const result = acc + ((vehicles as Record<string, number>)?.[key] ?? 0);
				return result as number;
			}, 0 as number),
		}));

		const max = values.reduce(
			(acc, item) => {
				if (item.total > acc.total) {
					return item;
				}
				return acc;
			},
			{ date: "", total: 0 }
		);
		const min = values.reduce(
			(acc, item) => {
				if (item.total < acc.total) {
					return item;
				}
				return acc;
			},
			{ date: "", total: Number.POSITIVE_INFINITY }
		);

		return [
			{
				label: "Día de menor volumen",
				content: [min.date, min.total.toLocaleString()],
			},
			{
				label: "Día de mayor volumen",
				content: [max.date, max.total.toLocaleString()],
			},
		];
	}, [data]);

	if (loading) {
		return <Skeleton className="h-[300px]" />;
	}

	return (
		<GraphStack
			title="Volumen total del día"
			data={data}
			config={chartConfig as Record<string, { label: string; color: string }>}
			stats={stats}
			axis={axis}
			legends={legends}
			tooltip={(label: string) => {
				const day = data.find((item) => item.date === label);
				if (!day) return label;

				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { date, ...vehicles } = day;

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
