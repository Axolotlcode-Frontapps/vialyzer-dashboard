import { useSearch } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	XAxis,
	YAxis,
} from "recharts";

import type { ChartConfig } from "../shared/chart";

import { kpiServices } from "@/lib/services/kpis";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "../shared/chart";

const chartConfig = {
	percentage: {
		label: "Porcentaje",
		color: "hsl(var(--chart-car))",
	},
	label: {
		color: "var(--background)",
	},
} satisfies ChartConfig;

const today = new Date();
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(today.getDate() - 7);

const startDate = sevenDaysAgo.toISOString().split("T")[0];
const endDate = today.toISOString().split("T")[0];

export function GraphVehicleAlert() {
	const { selected } = useSearch({ from: "/_dashboard/monitoring" });

	const { data, isLoading, error } = useQuery({
		queryKey: ["monitoring-vehicle-alerts", selected, startDate, endDate],
		queryFn: async () =>
			selected
				? await kpiServices.getVehicleAlert(selected, startDate, endDate)
				: [],
	});

	const chartData = useMemo(() => {
		const translations: Record<string, string> = {
			Motocicleta: "Motocicleta",
			Automovil: "Automóvil",
			Automovel: "Automóvil",
			Car: "Automóvil",
			Motorcycle: "Motocicleta",
			Bus: "Autobús",
			Truck: "Camión",
			Van: "Camioneta",
			Bicycle: "Bicicleta",
			TrafficLight: "Semáforo",
			Combi: "Combi",
			car: "Automóvil",
			motorcycle: "Motocicleta",
			bus: "Autobús",
			truck: "Camión",
			van: "Camioneta",
			bicycle: "Bicicleta",
			trafficLight: "Semáforo",
			combi: "Combi",
		};
		return data?.map((item) => ({
			vehicle: translations[item.name] || item.name,
			percentage: item.porcentaje,
		}));
	}, [data]);

	return (
		<Card className="border-0 rounded-lg gap-5 p-4">
			<CardHeader className="p-0 grid-rows-1 h-max">
				<CardTitle className="monitoring__stat-title max-w-max mr-auto">
					Alertas por tipo de vehículos
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				{isLoading ? (
					// || isRefetching || isFetching || isPending
					<div className="w-full max-h-[212px] flex items-center justify-center">
						<div className="text-sm text-muted-foreground">
							Cargando datos...
						</div>
					</div>
				) : error ? (
					<div className="w-full max-h-[212px] flex items-center justify-center">
						<div className="text-sm text-destructive">
							Error al cargar los datos
						</div>
					</div>
				) : (
					<ChartContainer config={chartConfig} className="w-full max-h-[212px]">
						<BarChart
							accessibilityLayer
							data={chartData}
							layout="vertical"
							barSize="20%"
							margin={{
								left: 24,
							}}
						>
							<CartesianGrid vertical={false} />
							<YAxis
								dataKey="vehicle"
								type="category"
								tickLine={false}
								axisLine={false}
							/>
							<XAxis dataKey="percentage" type="number" tickLine={false} />
							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent
										indicator="line"
										formatter={(value) => [
											`${Number(value).toFixed(2)}%`,
											"Porcentaje",
										]}
									/>
								}
							/>
							<Bar
								dataKey="percentage"
								layout="vertical"
								fill="var(--color-percentage)"
								height={20}
								radius={4}
							>
								<LabelList
									dataKey="percentage"
									position="insideRight"
									offset={8}
									className="fill-white"
									fontSize={12}
									formatter={(value: number) =>
										value >= 10 ? `${value.toFixed(2)}%` : ""
									}
								/>
								<LabelList
									dataKey="percentage"
									position="right"
									offset={4}
									className="fill-white"
									fontSize={11}
									formatter={(value: number) =>
										value < 10 ? `${value.toFixed(2)}%` : ""
									}
								/>
							</Bar>
						</BarChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
