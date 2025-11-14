import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { agentsService } from "@/lib/services/agents";
import { chartConfig } from "@/lib/utils/charts";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "../shared/chart";

const config = {
	car: chartConfig.car,
	motorcycle: chartConfig.motorcycle,
};

const today = new Date();
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(today.getDate() - 7);

const startDate = sevenDaysAgo.toISOString().split("T")[0];
const endDate = today.toISOString().split("T")[0];

export function GraphVolumeHour() {
	const { data } = useQuery({
		queryKey: ["monitoring-volume-hour", startDate, endDate],
		queryFn: () => agentsService.getVolumeHour(startDate, endDate),
	});

	const chartData = useMemo(() => data ?? [], [data]);

	return (
		<Card className="border-0 rounded-lg gap-5 p-4">
			<CardHeader className="p-0 grid-rows-1 h-max">
				<CardTitle className="monitoring__stat-title max-w-max mr-auto">
					Volumen por hora
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<ul className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-4">
					{Object.keys(config).map((key) => (
						<li
							key={key}
							className="snap-center flex items-center gap-2 border border-[#E5E7EB] leading-3 rounded text-xs px-2 py-1.5 min-w-max"
						>
							<span
								className="rounded-[2px] size-2"
								style={{
									backgroundColor: config[key as keyof typeof config]?.color,
								}}
							/>
							{config[key as keyof typeof config]?.label}
						</li>
					))}
				</ul>
				<ChartContainer config={config} className="w-full max-h-[170px]">
					<BarChart accessibilityLayer data={chartData}>
						<CartesianGrid vertical={false} />
						<YAxis tickLine={false} tickMargin={10} axisLine={false} />
						<XAxis
							dataKey="hour"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
						<Bar dataKey="count" fill="var(--color-motorcycle)" radius={4} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
