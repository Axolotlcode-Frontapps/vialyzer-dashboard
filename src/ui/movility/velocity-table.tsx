import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { ColumnDef } from "@tanstack/react-table";
import type { VehicleType } from "@/types/agents";

import { movility } from "@/lib/services/movility";
import { chartConfig } from "@/lib/utils/charts";
import { Route } from "@/routes/_dashboard/movility/$camera/route";
import { GraphsTable } from "../shared/data-table/graphs-table";
import { Skeleton } from "../shared/skeleton";
import { useGraphFilters } from "./filters/use-graph-filters";

type Row = {
	vehicle: VehicleType | "Total";
	[sceario: string]: number | string;
	total: number | string;
};

function CellColor({ value: original }: { value?: number | string }) {
	const value = typeof original === "number" ? original : Number.parseFloat(`${original ?? 0}`);

	const green = value >= 0 && value < 30;
	const yellow = value >= 30 && value < 40;
	const orange = value >= 40 && value < 50;
	const red = value >= 50;

	const color = green
		? "text-green-400"
		: yellow
			? "text-yellow-400"
			: orange
				? "text-orange-400"
				: red
					? "text-red-400"
					: "";

	return <span className={color}>{Number.parseFloat(value.toFixed(2)).toLocaleString()}</span>;
}

export function VelocityTable() {
	const { camera } = Route.useParams();
	const { initialValues } = useGraphFilters();

	const {
		data: speedTable,
		isLoading,
		isRefetching,
		isFetching,
		isPending,
	} = useQuery({
		queryKey: ["speed-table-mobility", camera, initialValues],
		queryFn: async () => {
			const table = await movility.velocityTable(camera, {
				endDate: initialValues.endDate ?? "",
				startDate: initialValues.startDate ?? "",
				rawScenarioIds: initialValues.zones?.join(","),
				rawVehicleIds: initialValues.actors?.join(","),
			});

			return table;
		},
	});

	const loading = useMemo(
		() => isLoading || isRefetching || isFetching || isPending,
		[isLoading, isRefetching, isFetching, isPending]
	);

	const columns: ColumnDef<Row>[] = useMemo(() => {
		if (!speedTable) return [];

		const scenarios = [
			...new Set(
				speedTable.flatMap(({ scenariodata }) =>
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
					chartConfig[
						row.original.vehicle.replaceAll(" ", "_").toLowerCase() as keyof typeof chartConfig
					]?.label ?? row.original.vehicle,
			},
			...(scenarios.map((sceario) => ({
				accessorKey: sceario,
				header: sceario.replace(" - Entrada", ""),
				cell: ({ row }) => <CellColor value={row.original[sceario]} />,
			})) satisfies ColumnDef<Row>[]),
			{
				accessorKey: "total",
				header: "Total",
				cell: ({ row }) => <CellColor value={row.original.total} />,
			} satisfies ColumnDef<Row>,
		];
	}, [speedTable]);

	const data: Row[] = useMemo(() => {
		if (!speedTable) return [];

		const rows = speedTable
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
			?.sort((a, b) => Number.parseFloat(`${b.total}`) - Number.parseFloat(`${a.total}`));

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const totalCols = rows.reduce((acc, { total, vehicle, ...scenarios }) => {
			Object.entries(scenarios).forEach(([scenario, value]) => {
				if (!acc[scenario]) {
					acc[scenario] = 0;
				}

				if (typeof acc[scenario] === "number") {
					acc[scenario] += typeof value === "number" ? value : Number.parseFloat(`${value}`);
				}
			});

			if (!acc.total) {
				acc.total = 0;
			}

			if (typeof acc.total === "number") {
				acc.total += typeof total === "number" ? total : Number.parseFloat(`${total}`);
			}

			return acc;
		}, {} as Row);

		return [...rows, { ...totalCols, vehicle: "Total" }];
	}, [speedTable]);

	if (loading) {
		return <Skeleton className="h-[300px]" />;
	}

	return <GraphsTable data={data} columns={columns} pining={["vehicle"]} />;
}
