import { useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Label, Pie, PieChart } from "recharts";
import { useCameraVehicles } from "@/hooks/use-camera-vehicles";

import { chartConfig } from "@/lib/utils/charts";
// import { getTrafficTotal } from "@/logic/services/movility/get-traffic-total";
// import { getVehiclesDistribution } from "@/logic/services/movility/get-vehicles-distribution";
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

// Mock implementations
function getTrafficTotal(_camera: string, _filters: any) {
	// Mocked API call
	return new Promise<{ payload: { byVehicleType: Record<string, number> } }>(
		(resolve) => {
			setTimeout(() => {
				resolve({
					payload: {
						byVehicleType: {
							car: 1200,
							bus: 300,
							truck: 150,
							motorcycle: 450,
						},
					},
				});
			}, 1000);
		}
	);
}

function getVehiclesDistribution(_camera: string, _filters: any) {
	// Mocked API call
	return new Promise<{
		payload: Array<{
			vehicleId: string;
			vehicleType: string;
			percentage: number;
			occurrence: number;
		}>;
	}>((resolve) => {
		setTimeout(() => {
			resolve({
				payload: [
					{
						vehicleId: "car",
						vehicleType: "Car",
						percentage: 60,
						occurrence: 1200,
					},
					{
						vehicleId: "bus",
						vehicleType: "Bus",
						percentage: 15,
						occurrence: 300,
					},
					{
						vehicleId: "truck",
						vehicleType: "Truck",
						percentage: 7.5,
						occurrence: 150,
					},
					{
						vehicleId: "motorcycle",
						vehicleType: "Motorcycle",
						percentage: 22.5,
						occurrence: 450,
					},
				],
			});
		}, 1000);
	});
}

export function GraphDistribution() {
	const { camera } = Route.useParams();
	const { initialValues } = useGraphFilters();
	const { vehicles, loading: loadingVehicles } = useCameraVehicles(camera);

	const filters = {
		endDate: initialValues.endDate,
		scenarioIds: initialValues.zones,
		startDate: initialValues.startDate,
		vehicleIds: initialValues.actors,
		dayOfWeek: initialValues.dayOfWeek,
		hour: initialValues.hour,
		minuteInterval: initialValues.minuteInterval,
	};

	const [
		{ data: totalTraffic, ...totalQuery },
		{ data: distribution, ...distributionQuery },
	] = useQueries({
		queries: [
			{
				queryKey: ["total-traffic-volume", camera, filters],
				queryFn: async () => {
					const traffic = await getTrafficTotal(camera, filters);

					const total = Object.values(traffic.payload?.byVehicleType ?? {})
						.reduce((acc, value) => acc + value, 0)
						.toLocaleString();

					return total;
				},
			},
			{
				queryKey: ["vehicle-distribution-volume", camera, filters],
				queryFn: async () => {
					const distribution = await getVehiclesDistribution(camera, filters);

					return distribution.payload;
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
		[
			totalQuery.isLoading,
			totalQuery.isRefetching,
			totalQuery.isFetching,
			totalQuery.isPending,
		]
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
				: distribution?.filter((d) =>
						initialValues.actors?.includes(d.vehicleId)
					)) ?? [];

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
	}, [loadingTotal || loadingDistribution || loadingVehicles]);

	if (loadingTotal || loadingDistribution || loadingVehicles) {
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
							content={<ChartTooltipContent nameKey="vehicleType" hideLabel />}
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
													{totalTraffic}
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
										const vehicle = vehicles.find(
											(vehicle) =>
												vehicle.name.replaceAll(" ", "_").toLowerCase() ===
												item.value
										);

										return (
											<div className="flex items-center gap-2 justify-end">
												<span className="block">{vehicle?.occurrence}</span>
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

// labelLine={false}
// label={(props) => {
//   return (
//     <text
//       cx={props.cx}
//       cy={props.cy}
//       x={props.x}
//       y={props.y}
//       textAnchor={props.textAnchor}
//       dominantBaseline={props.dominantBaseline}
//       fill="var(--foreground)"
//     >
//       {`${props.value.toFixed(2)}%`}
//     </text>
//   );
// }}
