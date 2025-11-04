import { useQuery } from "@tanstack/react-query";
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

import { agentsService } from "@/lib/services/agents";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "../shared/chart";

const config = {
	time: {
		label: "Promedio tiempo atención",
		color: "hsl(var(--chart-car))",
	},
	max: {
		label: "Máximo tiempo de atención",
		color: "hsl(var(--chart-bicycle))",
	},
	status: {
		label: "Estado del proceso",
		color: "var(--background)",
	},
} satisfies ChartConfig;

const media: ContentType = ({ x, y, width }) => {
	const radius = 6;
	return (
		<g>
			<circle
				cx={parseInt(`${x ?? 0}`, 10) + parseInt(`${width ?? 0}`, 10) / 2}
				cy={parseInt(`${y ?? 0}`, 10)}
				r={radius}
				fill="#FC4B5F"
			/>
		</g>
	);
};

export function GraphAgentStatus() {
	const { data: mockData, isLoading: loading } = useQuery({
		queryKey: ["monitoring-agent-status"],
		queryFn: () => agentsService.getAgentStatus(),
	});

	return (
		<Card className="border-0 rounded-lg gap-5 p-4">
			<CardHeader className="p-0 grid-rows-1 h-max">
				<CardTitle className="monitoring__stat-title max-w-max mr-auto">
					Tiempos por pasos del proceso
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<ul className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-4">
					{Object.keys(config)
						.slice(0, 2)
						.map((key) => (
							<li
								key={key}
								className="snap-center flex items-center gap-2 leading-3 rounded text-xs px-2 min-w-max"
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
				{loading ? (
					<p className="text-center text-muted-foreground text-lg py-12">
						Cargando datos...
					</p>
				) : (
					<ChartContainer config={config} className="w-full max-h-[212px]">
						<BarChart accessibilityLayer data={mockData}>
							<CartesianGrid vertical={false} />
							<YAxis
								dataKey="max"
								tickLine={false}
								axisLine={false}
								type="number"
								unit="min"
								name="Tiempo de atención"
								label={{
									value: "Tiempo de atención",
									angle: -90,
									position: "insideLeft",
									textAnchor: "middle",
								}}
							/>
							<XAxis xAxisId="bottom" hide />
							<XAxis
								dataKey="status"
								type="category"
								tickLine={false}
								axisLine={false}
								xAxisId="top"
							/>
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent indicator="line" />}
							/>
							<Bar
								dataKey="time"
								fill="var(--color-time)"
								xAxisId="top"
								radius={4}
							/>
							<Bar dataKey="max" fill="transparent" radius={4} xAxisId="bottom">
								<LabelList
									dataKey="max"
									position="top"
									// offset={8}
									fill="var(--color-max)"
									fontSize={12}
									content={media}
								/>
							</Bar>
						</BarChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
