import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../chart";
import { GraphHeader } from "./header";
import { Stats } from "./stats";

interface Props {
	title: string;
	tooltip?: (label: string) => React.ReactNode;
	legends: {
		left: string;
	};
	axis: {
		y: {
			label: string;
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
	data: {
		[k: string]: number | string;
	}[];
	config: {
		[k: string]: {
			label: string;
			color: string;
		};
	};
	stats?: {
		label: string;
		content: string[];
	}[];
	header?: {
		value: string;
		label: string;
		color: string;
	}[];
}

export function GraphStack({
	title,
	data,
	config,
	stats,
	header,
	axis,
	legends,
	tooltip,
}: Props) {
	return (
		<Card className="border-0 rounded-lg">
			<CardHeader className="w-full flex flex-col justify-between flex-wrap gap-5">
				<CardTitle className="w-full flex items-center justify-between gap-5 flex-wrap">
					<h2>{title}</h2>
					{stats ? <Stats info={stats} /> : null}
				</CardTitle>
				{header ? (
					<CardDescription className="w-full">
						<GraphHeader header={header} />
					</CardDescription>
				) : null}
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
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={axis.x.formatter}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							name={axis.y.label}
							tickFormatter={axis.y.formatter}
							label={{
								value: legends.left,
								angle: -90,
								position: "insideLeft",
							}}
						/>
						<ChartTooltip
							content={<ChartTooltipContent labelFormatter={tooltip} />}
						/>
						{Object.keys(config).map((key, index) => (
							<Bar
								key={key}
								dataKey={key}
								stackId="a"
								fill={`var(--color-${key})`}
								radius={index === 0 ? [0, 0, 4, 4] : [0, 0, 0, 0]}
							/>
						))}
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
