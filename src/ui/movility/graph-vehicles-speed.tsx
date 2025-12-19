import { useMemo } from "react";
import { format } from "@formkit/tempo";
import { useQuery } from "@tanstack/react-query";

import type { ChartConfig } from "../shared/chart";

import { movility } from "@/lib/services/movility";
import { cn } from "@/lib/utils/cn";
import { getAllDatesInRange } from "@/lib/utils/date-format";
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
		unit: "km/h",
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
		const allDates = getAllDatesInRange(initialValues.startDate ?? "", initialValues.endDate ?? "");

		const dataByDate = new Map<string, { average_speed: number }>();
		for (const item of speedGraph ?? []) {
			const dateKey = format(new Date(item.query_date), "YYYY-MM-DD");
			dataByDate.set(dateKey, {
				average_speed: Number.parseFloat(item.average_speed),
			});
		}

		return allDates.map((dateObj) => {
			const dateKey = format(dateObj, "YYYY-MM-DD");
			const formattedDate = format(dateObj, "ddd DD", "es-MX");
			const query_date = `${formattedDate[0].toUpperCase()}${formattedDate.slice(1)}`;
			const speedData = dataByDate.get(dateKey);

			return {
				query_date,
				average_speed: speedData?.average_speed ?? 0,
			};
		});
	}, [speedGraph, initialValues.startDate, initialValues.endDate]);

	const stats = useMemo(() => {
		const max = data.reduce(
			(acc, { query_date: date, average_speed: total }) => {
				if (total > acc.total) {
					return { date, total };
				}
				return acc;
			},
			{ date: "", total: 0 }
		);
		const min = data.reduce(
			(acc, { query_date: date, average_speed: total }) => {
				if (total < acc.total) {
					return { date, total };
				}
				return acc;
			},
			{ date: "", total: Number.POSITIVE_INFINITY }
		);

		return [
			{
				label: "Día de menor velocidad promedio",
				content: [min.date, `${min.total.toLocaleString()} km/h`],
			},
			{
				label: "Día de mayor velocidad promedio",
				content: [max.date, `${max.total.toLocaleString()} km/h`],
			},
		];
	}, [data]);

	console.log({ stats });

	if (loading) {
		return <Skeleton className="h-[400px]" />;
	}

	return (
		<GraphBar
			title="Velocidad promedio por fecha"
			data={data}
			config={chartConfig as Record<string, { label: string; color: string }>}
			stats={stats}
			axis={axis}
			formatter={(value, name, item) => {
				return (
					<div
						key={item.dataKey}
						className={cn(
							"[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5"
						)}
					>
						<div
							className={cn(
								"shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg) items-center size-2.5"
							)}
							style={
								{
									"--color-bg": "hsl(var(--chart-car))",
									"--color-border": "hsl(var(--chart-car))",
								} as React.CSSProperties
							}
						/>
						<div className={cn("flex flex-1 justify-between leading-none gap-2")}>
							<div className="grid gap-1.5">
								<span className="text-muted-foreground">{name}</span>
							</div>
							{item.value ? (
								<span className="text-foreground font-mono font-medium tabular-nums">
									{value}km/h
								</span>
							) : null}
						</div>
					</div>
				);
			}}
		/>
	);
}
