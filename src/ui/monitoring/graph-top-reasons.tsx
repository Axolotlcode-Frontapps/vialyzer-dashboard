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
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../shared/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "../shared/chart";

const config = {
	amount: {
		label: "Motivo",
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

export function GraphTopReasons() {
	const { selected } = useSearch({ from: "/_dashboard/monitoring" });

	const { data, isLoading, isRefetching, isFetching, isPending } = useQuery({
		queryKey: ["monitoring-top-reasons", selected, startDate, endDate],
		queryFn: async () =>
			selected
				? await kpiServices.getTopReasons(selected, startDate, endDate)
				: [],
	});

	const loading = useMemo(
		() => isLoading || isRefetching || isFetching || isPending,
		[isLoading, isRefetching, isFetching, isPending]
	);

	const chartData = useMemo(() => {
		const payload = data ? (Array.isArray(data) ? data : [data]) : [];

		return payload.map((item) => ({
			reason: item.reason,
			amount: item.total,
		}));
	}, [data]);

	return (
		<Card className="border-0 rounded-lg grid grid-cols-[1fr_auto] gap-5 p-4">
			<CardHeader
				className="p-0 grid grid-cols-subgrid gap-5 h-max grid-rows-1"
				style={{ gridArea: "1 / 1 / 2 / 3" }}
			>
				<CardTitle className="monitoring__stat-title text-start place-self-start">
					Top 5 motivos de rechazo
				</CardTitle>
				<CardDescription className="monitoring__stat-title text-xs">
					Cantidad
				</CardDescription>
			</CardHeader>
			<CardContent
				className="p-0 grid grid-cols-subgrid gap-5"
				style={{ gridArea: "2 / 1 / 3 / 3" }}
			>
				<ChartContainer config={config} className="w-full max-h-[212px]">
					<BarChart
						accessibilityLayer
						data={chartData}
						layout="vertical"
						margin={{
							right: 16,
						}}
					>
						<CartesianGrid horizontal={false} vertical={false} />
						<YAxis
							dataKey="reason"
							type="category"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<XAxis dataKey="amount" type="number" hide />
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent indicator="line" />}
						/>
						<Bar
							dataKey="amount"
							layout="vertical"
							fill="var(--color-amount)"
							radius={4}
						>
							<LabelList
								dataKey="reason"
								position="insideLeft"
								offset={8}
								className="fill-white"
								fontSize={12}
							/>
						</Bar>
					</BarChart>
				</ChartContainer>
				<ul className="flex flex-col gap-2 py-1">
					{chartData.map((item) => (
						<li
							key={item.reason}
							className="flex-1 flex items-center justify-end text-sm leading-3.5 text-muted-foreground"
						>
							{loading ? "-" : item.amount}
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
