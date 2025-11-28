// import axios from 'axios';

import { useSearch } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
// import { useLoaderData } from 'react-router';
import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	XAxis,
	YAxis,
} from "recharts";

import type { ContentType } from "recharts/types/component/Label";
import type { ChartConfig } from "../shared/chart";

import { kpiServices } from "@/lib/services/kpis";
import { chartConfig } from "@/lib/utils/charts";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "../shared/chart";

const config = {
	time: {
		label: "Tiempo",
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

const media: ContentType = ({ x, y, width, height }) => {
	const radius = 8;
	return (
		<g>
			<circle
				cx={parseInt(`${x ?? 0}`, 10) + parseInt(`${width ?? 0}`, 10) / 2}
				cy={parseInt(`${y ?? 0}`, 10) + parseInt(`${height ?? 0}`, 10) / 2}
				r={radius}
				fill="#FC4B5F"
			/>
		</g>
	);
};

export function GraphTime() {
	const { selected } = useSearch({ from: "/_dashboard/monitoring" });

	const { data } = useQuery({
		queryKey: ["monitoring-time-permanence", selected, startDate, endDate],
		queryFn: async () =>
			selected
				? await kpiServices.getTime(selected, startDate, endDate)
				: undefined,
		enabled: !!selected,
	});

	const chartData = useMemo(() => {
		if (!data) return [];
		const dataArray = Array.isArray(data) ? data : [data];
		return dataArray.map((item) => ({
			vehicle: chartConfig[item.name]?.label ?? item.name,
			time: item.avg_minutes,
		}));
	}, [data]);

	return (
		<Card className="border-0 rounded-lg gap-5 p-4">
			<CardHeader className="p-0 grid-rows-1 h-max">
				<CardTitle className="monitoring__stat-title max-w-max mr-auto">
					Tiempo de permanencia
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer config={config} className="w-full max-h-[212px]">
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
						<XAxis
							dataKey="time"
							type="number"
							tickLine={false}
							tickFormatter={(value) => `${value}Min`}
						/>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent indicator="line" />}
						/>
						<Bar
							dataKey="time"
							layout="vertical"
							fill="var(--color-time)"
							height={20}
							radius={4}
						>
							<LabelList
								dataKey="vehicle"
								position="center"
								offset={8}
								className="fill-white"
								fontSize={12}
								content={media}
							/>
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
