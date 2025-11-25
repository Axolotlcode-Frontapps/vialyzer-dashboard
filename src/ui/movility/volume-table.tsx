import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

// import { getVolumeTable } from "@/logic/services/movility/get-volumne-table";

import type { ColumnDef } from "@tanstack/react-table";
import type { VehicleType } from "@/types/movility";

import { Route } from "@/routes/_dashboard/movility/$camera/route";
import { GraphsTable } from "../shared/data-table/graphs-table";
import { Skeleton } from "../shared/skeleton";
import { useGraphFilters, vehicles } from "./filters/use-graph-filters";

type Row = {
	vehicle: VehicleType | "Total";
	[sceario: string]: number | string;
	total: number | string;
};

function getVolumeTable(
	_cameraId: string,
	_params: {
		startDate?: string | null;
		endDate?: string | null;
		scenarioIds?: string[] | null;
		vehicleIds?: string[] | null;
		dayOfWeek?: number | null;
		hour?: number | null;
		minuteInterval?: number | null;
	}
) {
	// Mock implementation of the API call
	return new Promise<{
		payload: Array<{
			vehiclename: string;
			total: number;
			scenariodata: Array<{
				scenarioName: string;
				volAcumulate: number;
			}>;
		}>;
	}>((resolve) => {
		setTimeout(() => {
			resolve({
				payload: [
					{
						vehiclename: "Car",
						total: 1500,
						scenariodata: [
							{ scenarioName: "Scenario A", volAcumulate: 800 },
							{ scenarioName: "Scenario B", volAcumulate: 700 },
						],
					},
					{
						vehiclename: "Truck",
						total: 500,
						scenariodata: [
							{ scenarioName: "Scenario A", volAcumulate: 300 },
							{ scenarioName: "Scenario B", volAcumulate: 200 },
						],
					},
				],
			});
		}, 1000);
	});
}

export function VolumeTable() {
	const { camera } = Route.useParams();
	const { initialValues } = useGraphFilters();

	const {
		data: volumeTable,
		isLoading,
		isRefetching,
		isFetching,
		isPending,
	} = useQuery({
		queryKey: ["volume-table-mobility", camera, initialValues],
		queryFn: async () => {
			const table = await getVolumeTable(camera, {
				endDate: initialValues.endDate,
				scenarioIds: initialValues.zones,
				startDate: initialValues.startDate,
				vehicleIds: initialValues.actors,
				dayOfWeek: initialValues.dayOfWeek,
				hour: initialValues.hour,
				minuteInterval: initialValues.minuteInterval,
			});

			return table.payload;
		},
	});

	const loading = useMemo(
		() => isLoading || isRefetching || isFetching || isPending,
		[isLoading, isRefetching, isFetching, isPending]
	);

	const columns: ColumnDef<Row>[] = useMemo(() => {
		if (!volumeTable) return [];

		const scenarios = [
			...new Set(
				volumeTable.flatMap(({ scenariodata }) =>
					scenariodata
						.sort((a, b) => b.volAcumulate - a.volAcumulate)
						.map((scenario) => scenario.scenarioName)
				)
			),
		];

		return [
			{
				accessorKey: "vehicle",
				header: "Actor vial / Movimiento",
				cell: ({ row }) =>
					vehicles?.[
						row.original.vehicle.replaceAll(" ", "_") as keyof typeof vehicles
					] ?? row.original.vehicle,
			},
			...(scenarios.map((sceario) => ({
				accessorKey: sceario,
				header: sceario,
				cell: ({ row }) => {
					const value = row.original[sceario];
					return typeof value === "number"
						? value.toLocaleString()
						: Number.parseFloat(`${value || 0}`).toLocaleString();
				},
			})) satisfies ColumnDef<Row>[]),
			{
				accessorKey: "total",
				header: "Total Avg",
				cell: ({ row }) =>
					typeof row.original.total === "number"
						? row.original.total.toLocaleString()
						: Number.parseFloat(`${row.original.total}`).toLocaleString(),
			} satisfies ColumnDef<Row>,
		];
	}, [volumeTable]);

	const data: Row[] = useMemo(() => {
		if (!volumeTable) return [];

		const rows = volumeTable
			.map(({ scenariodata, vehiclename, total }) => {
				const scenarios = scenariodata.reduce(
					(acc, scenario) => {
						acc[scenario.scenarioName] = scenario.volAcumulate;

						return acc;
					},
					{} as Record<string, number>
				);

				return {
					vehicle: vehiclename as Row["vehicle"],
					...scenarios,
					total,
				};
			})
			.sort(
				(a, b) =>
					Number.parseFloat(`${b.total}`) - Number.parseFloat(`${a.total}`)
			);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const totalCols = rows.reduce((acc, { total, vehicle, ...scenarios }) => {
			Object.entries(scenarios).forEach(([scenario, value]) => {
				if (!acc[scenario]) {
					acc[scenario] = 0;
				}

				if (typeof acc[scenario] === "number") {
					acc[scenario] +=
						typeof value === "number" ? value : Number.parseFloat(`${value}`);
				}
			});

			if (!acc.total) {
				acc.total = 0;
			}

			if (typeof acc.total === "number") {
				acc.total +=
					typeof total === "number" ? total : Number.parseFloat(`${total}`);
			}

			return acc;
		}, {} as Row);

		return [...rows, { ...totalCols, vehicle: "Total" }];
	}, [volumeTable]);

	if (loading) {
		return <Skeleton className="h-[300px]" />;
	}

	return <GraphsTable data={data} columns={columns} pining={["vehicle"]} />;
}
