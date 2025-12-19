import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { movility } from "@/lib/services/movility";
import { Route } from "@/routes/_dashboard/movility/$camera/route";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/card";
import { Skeleton } from "../shared/skeleton";
import { useGraphFilters } from "./filters/use-graph-filters";

export function GraphAverageSpeed() {
	const { camera } = Route.useParams();
	const { initialValues } = useGraphFilters();

	const { data, isLoading, isRefetching, isFetching, isPending } = useQuery({
		queryKey: ["average-speed-mobility", camera, initialValues],
		queryFn: async () => {
			const average = await movility.averageSpeed(camera, {
				endDate: initialValues.endDate ?? "",
				startDate: initialValues.startDate ?? "",
				rawScenarioIds: initialValues.zones?.join(","),
				rawVehicleIds: initialValues.actors?.join(","),
			});

			return average;
		},
	});

	const loading = useMemo(
		() => isLoading || isRefetching || isFetching || isPending,
		[isLoading, isRefetching, isFetching, isPending]
	);

	if (loading) {
		return <Skeleton className="h-[400px]" />;
	}

	return (
		<Card className="flex w-full @md/velocity:max-w-[calc(30%_-_1.25rem)] @4xl/velocity:max-w-none border-0 rounded-lg @container/graph-velocity">
			<CardHeader className="items-center pb-0 min-w-max">
				<CardTitle>Velocidad promedio motorizados</CardTitle>
			</CardHeader>
			<CardContent className="flex-1 pb-0 content-center">
				<p className="flex flex-wrap justify-center items-center gap-3 text-3xl font-bold flex-1 content-center text-center @xs/graph-velocity:text-5xl">
					{data?.averageSpeed}
					<span className="block">{data?.unit}</span>
				</p>
			</CardContent>
		</Card>
	);
}
