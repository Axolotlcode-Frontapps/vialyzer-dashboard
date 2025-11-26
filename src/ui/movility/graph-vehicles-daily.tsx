import { useMemo } from "react";
import { format } from "@formkit/tempo";
import { useQuery } from "@tanstack/react-query";

// import { getDailyVehicle } from '@/logic/services/movility/get-daily-vehicle';

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

function getDailyVehicle(_camera: string, _params: Record<string, any>) {
	return Promise.resolve({
		payload: [
			{
				date: "2024-01-15",
				metadata: [
					{ vehicleid: "1", vehiclename: "CAR", vol_acumulate: 150 },
					{ vehicleid: "2", vehiclename: "BICYCLE", vol_acumulate: 25 },
					{ vehicleid: "3", vehiclename: "MOTORCYCLE", vol_acumulate: 45 },
					{ vehicleid: "4", vehiclename: "BUS", vol_acumulate: 12 },
					{ vehicleid: "5", vehiclename: "VAN", vol_acumulate: 20 },
					{ vehicleid: "6", vehiclename: "HEAVY_TRUCK", vol_acumulate: 15 },
					{ vehicleid: "7", vehiclename: "PERSON", vol_acumulate: 85 },
					{ vehicleid: "8", vehiclename: "TRUCK", vol_acumulate: 30 },
				],
			},
			{
				date: "2024-01-16",
				metadata: [
					{ vehicleid: "1", vehiclename: "CAR", vol_acumulate: 180 },
					{ vehicleid: "2", vehiclename: "BICYCLE", vol_acumulate: 30 },
					{ vehicleid: "3", vehiclename: "MOTORCYCLE", vol_acumulate: 52 },
					{ vehicleid: "4", vehiclename: "BUS", vol_acumulate: 18 },
					{ vehicleid: "5", vehiclename: "VAN", vol_acumulate: 25 },
					{ vehicleid: "6", vehiclename: "HEAVY_TRUCK", vol_acumulate: 20 },
					{ vehicleid: "7", vehiclename: "PERSON", vol_acumulate: 95 },
					{ vehicleid: "8", vehiclename: "TRUCK", vol_acumulate: 28 },
				],
			},
			{
				date: "2024-01-17",
				metadata: [
					{ vehicleid: "1", vehiclename: "CAR", vol_acumulate: 165 },
					{ vehicleid: "2", vehiclename: "BICYCLE", vol_acumulate: 28 },
					{ vehicleid: "3", vehiclename: "MOTORCYCLE", vol_acumulate: 48 },
					{ vehicleid: "4", vehiclename: "BUS", vol_acumulate: 15 },
					{ vehicleid: "5", vehiclename: "VAN", vol_acumulate: 22 },
					{ vehicleid: "6", vehiclename: "HEAVY_TRUCK", vol_acumulate: 18 },
					{ vehicleid: "7", vehiclename: "PERSON", vol_acumulate: 90 },
					{ vehicleid: "8", vehiclename: "TRUCK", vol_acumulate: 35 },
				],
			},
		],
	});
}

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
			const daily = await getDailyVehicle(camera, {
				endDate: initialValues.endDate,
				scenarioIds: initialValues.zones,
				startDate: initialValues.startDate,
				vehicleIds: initialValues.actors,
				dayOfWeek: initialValues.dayOfWeek,
				hour: initialValues.hour,
				minuteInterval: initialValues.minuteInterval,
			});

			return daily.payload;
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
							const key = vehicle.vehiclename
								.replaceAll(" ", "_")
								.toLowerCase();

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
