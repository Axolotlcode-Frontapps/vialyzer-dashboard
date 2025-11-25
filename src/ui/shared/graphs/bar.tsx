import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../chart";
import { Stats } from "./stats";

interface Props {
	title: string;
	tooltip?: (label: string) => React.ReactNode;
	data: {
		[k: string]: number | string;
	}[];
	config: {
		[k: string]: {
			label: string;
			color: string;
		};
	};
	axis: {
		y: {
			label: string;
			datakey: string;
			unit?: string;
			formatter?: (value: string) => string;
		};
		x: {
			label: string;
			datakey: string;
			unit?: string;
			formatter?: (value: string) => string;
		};
	};
	stats?: {
		label: string;
		content: string[];
	}[];
}

export function GraphBar({ title, data, config, stats, axis, tooltip }: Props) {
	return (
		<Card className="border-0 rounded-lg @md/velocity:max-w-[70%] @4xl/velocity:max-w-none">
			<CardHeader className="flex justify-between flex-wrap">
				<CardTitle>{title}</CardTitle>
				{stats ? <Stats info={stats} /> : null}
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={config}
					className="w-full min-h-80 max-h-[400px] -bg-conic-330"
				>
					<BarChart accessibilityLayer data={data}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey={axis.x.datakey}
							name={axis.x.label}
							unit={axis.x.unit}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={axis.x.formatter}
						/>
						<YAxis
							dataKey={axis.y.datakey}
							name={axis.y.label}
							unit={axis.y.unit}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={axis.y.formatter}
						/>
						<ChartTooltip
							content={<ChartTooltipContent labelFormatter={tooltip} />}
						/>
						{Object.entries(config).map(([key, value]) => (
							<Bar
								key={key}
								dataKey={key}
								name={value.label}
								fill={value.color}
								radius={8}
							/>
						))}
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
