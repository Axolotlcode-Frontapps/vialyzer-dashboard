import { useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Label, Pie, PieChart } from "recharts";

import { movility } from "@/lib/services/movility";
import { chartConfig } from "@/lib/utils/charts";
import { cn } from "@/lib/utils/cn";
import { Route } from "@/routes/_dashboard/movility/$camera/route";
import { Badge } from "../shared/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/card";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "../shared/chart";
import { Skeleton } from "../shared/skeleton";
import { useGraphFilters } from "./filters/use-graph-filters";

export function GraphDistribution() {
	const { camera } = Route.useParams();
	const { initialValues } = useGraphFilters();

	const filters = {
		endDate: initialValues.endDate,
		scenarioIds: initialValues.zones,
		startDate: initialValues.startDate,
		vehicleIds: initialValues.actors,
		dayOfWeek: initialValues.dayOfWeek,
		hour: initialValues.hour,
		minuteInterval: initialValues.minuteInterval,
	};

	const [{ data: totalTraffic, ...totalQuery }, { data: distribution, ...distributionQuery }] =
		useQueries({
			queries: [
				{
					queryKey: ["total-traffic-volume", camera, filters],
					queryFn: async () => {
						const traffic = await movility.totalTraffic(camera, {
							endDate: filters.endDate ?? "",
							startDate: filters.startDate ?? "",
							rawScenarioIds: filters.scenarioIds?.join(","),
							rawVehicleIds: filters.vehicleIds?.join(","),
						});

						return traffic;
					},
				},
				{
					queryKey: ["vehicle-distribution-volume", camera, filters],
					queryFn: async () => {
						const distribution = await movility.vehicleDistribution(camera, {
							endDate: filters.endDate ?? "",
							startDate: filters.startDate ?? "",
							rawScenarioIds: filters.scenarioIds?.join(","),
							rawVehicleIds: filters.vehicleIds?.join(","),
						});

						return distribution;
					},
				},
			],
		});

	const loadingTotal = useMemo(
		() =>
			totalQuery.isLoading ||
			totalQuery.isRefetching ||
			totalQuery.isFetching ||
			totalQuery.isPending,
		[totalQuery.isLoading, totalQuery.isRefetching, totalQuery.isFetching, totalQuery.isPending]
	);

	const loadingDistribution = useMemo(
		() =>
			distributionQuery.isLoading ||
			distributionQuery.isRefetching ||
			distributionQuery.isFetching ||
			distributionQuery.isPending,
		[
			distributionQuery.isLoading,
			distributionQuery.isRefetching,
			distributionQuery.isFetching,
			distributionQuery.isPending,
		]
	);
	const [mobile, setMobile] = useState(false);

	const data = useMemo(() => {
		const filteredVehicles =
			(initialValues.actors && initialValues.actors.length === 0
				? distribution
				: distribution?.filter((d) => initialValues.actors?.includes(d.vehicleId))) ?? [];

		return filteredVehicles.map((item) => {
			const vehicleType = item.vehicleType.replace(" ", "_").toLowerCase();
			return {
				...item,
				vehicleType,
				fill: chartConfig[vehicleType]?.color,
			};
		});
	}, [initialValues, distribution]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Needed only on loading states
	useEffect(() => {
		const container = document.querySelector("#graph-distribution");
		if (!container) return;

		const observer = new ResizeObserver(([entry]) => {
			if (!entry.contentRect) return;

			const widthContainer = entry.contentRect.width;
			setMobile(widthContainer < 600);
		});

		if (container) observer.observe(container);

		return () => {
			observer.disconnect();
		};
	}, [loadingTotal || loadingDistribution]);

	if (loadingTotal || loadingDistribution) {
		return <Skeleton className="h-[300px]" />;
	}

	return (
		<Card id="graph-distribution" className="border-0 rounded-lg">
			<CardHeader className="items-center pb-0">
				<CardTitle>Distribución actores viales</CardTitle>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				<ChartContainer
					config={{ ...chartConfig, totalTraffic: { label: "Volumen total" } }}
					className={`w-full ${!mobile ? "md:max-h-[320px]" : "min-h-[600px]"}`}
				>
					<PieChart className="flex items-center justify-center gap-6">
						<ChartTooltip
							content={
								<ChartTooltipContent
									nameKey="vehicleType"
									hideLabel
									formatter={(value, name, item) => {
										const percentage = Number.parseFloat(`${value}`).toFixed(2);
										const locale = chartConfig[name].label;

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
															"--color-bg": item.payload.fill,
															"--color-border": item.payload.fill,
														} as React.CSSProperties
													}
												/>
												<div className={cn("flex flex-1 justify-between leading-none gap-2")}>
													<div className="grid gap-1.5">
														<span className="text-muted-foreground">{locale}</span>
													</div>
													{item.value ? (
														<span className="text-foreground font-mono font-medium tabular-nums">
															{percentage}%
														</span>
													) : null}
												</div>
											</div>
										);
									}}
								/>
							}
						/>
						<Pie
							data={data}
							dataKey="percentage"
							nameKey="vehicleType"
							innerRadius={90}
							strokeWidth={5}
						>
							<Label
								content={({ viewBox }) => {
									if (viewBox && "cx" in viewBox && "cy" in viewBox) {
										return (
											<text
												x={viewBox.cx}
												y={viewBox.cy}
												textAnchor="middle"
												dominantBaseline="middle"
											>
												<tspan
													x={viewBox.cx}
													y={viewBox.cy}
													className="fill-foreground text-3xl font-bold"
												>
													{totalTraffic?.totalCount.toLocaleString()}
												</tspan>
											</text>
										);
									}
								}}
							/>
						</Pie>
						<ChartLegend
							iconType="circle"
							content={
								<ChartLegendContent
									showValue
									formatterValue={(value, item) => {
										const percentage = Number.parseFloat(`${value}`).toFixed(2);

										const occurrence = totalTraffic?.byVehicleType.find(
											(vehicle) => vehicle.type.replaceAll(" ", "_").toLowerCase() === item.value
										);

										return (
											<div className="flex items-center gap-2 justify-end">
												<span className="block">{occurrence?.count}</span>
												<Badge variant="secondary" className="block">
													{percentage}%
												</Badge>
											</div>
										);
									}}
									nameKey="vehicleType"
									className="flex-col justify-start items-start w-full"
									itemClassName="w-full grid grid-cols-[auto_auto_1fr] gap-2"
								/>
							}
							verticalAlign={!mobile ? "middle" : "bottom"}
							align={!mobile ? "right" : "center"}
							layout={!mobile ? "vertical" : "horizontal"}
							wrapperStyle={
								!mobile
									? {
											width: "40%",
											marginRight: "auto",
											flex: "1",
										}
									: undefined
							}
						/>
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
