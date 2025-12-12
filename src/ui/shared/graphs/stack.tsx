import { useCallback, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { Payload } from "recharts/types/component/DefaultTooltipContent";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { ChartContainer, ChartTooltip } from "../chart";
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

interface CustomTooltipContentProps {
	active?: boolean;
	payload?: Payload<string | number, string>[];
	label?: string;
	labelFormatter?: (label: string) => React.ReactNode;
	hoveredDataKey: string | null;
	config: Props["config"];
}

function CustomStackTooltipContent({
	active,
	payload,
	label,
	labelFormatter,
	hoveredDataKey,
	config,
}: CustomTooltipContentProps) {
	const filteredPayload = useMemo(() => {
		if (!payload) return [];

		// If hovering a specific segment, only show that segment
		if (hoveredDataKey) {
			return payload.filter((item) => item.dataKey === hoveredDataKey);
		}

		// Otherwise show all segments (when hovering the shadow/cursor area)
		return payload;
	}, [payload, hoveredDataKey]);

	if (!active || !filteredPayload.length) {
		return null;
	}

	const formattedLabel = labelFormatter && label ? labelFormatter(label) : label;

	return (
		<div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
			{formattedLabel && <div className="font-medium">{formattedLabel}</div>}
			<div className="grid gap-1.5">
				{filteredPayload
					.filter((item) => item.type !== "none")
					.sort((a, b) => {
						if (a.value === undefined) return 1;
						if (b.value === undefined) return -1;

						if (typeof a.value === "number" && typeof b.value === "number") {
							return b.value - a.value;
						}

						return 0;
					})
					.map((item) => {
						const key = item.dataKey as string;
						const itemConfig = config[key];
						const indicatorColor = item.payload?.fill || item.color || itemConfig?.color;

						return (
							<div key={item.dataKey} className="flex w-full flex-wrap items-center gap-2">
								<div
									className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
									style={{ backgroundColor: indicatorColor }}
								/>
								<div className="flex flex-1 justify-between items-center leading-none gap-2">
									<span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
									{item.value !== undefined && (
										<span className="text-foreground font-mono font-medium tabular-nums">
											{item.value.toLocaleString()}
										</span>
									)}
								</div>
							</div>
						);
					})}
			</div>
		</div>
	);
}

export function GraphStack({ title, data, config, stats, header, axis, legends, tooltip }: Props) {
	const [hoveredDataKey, setHoveredDataKey] = useState<string | null>(null);

	const handleMouseEnter = useCallback((dataKey: string) => {
		setHoveredDataKey(dataKey);
	}, []);

	const handleMouseLeave = useCallback(() => {
		setHoveredDataKey(null);
	}, []);

	const configKeys = useMemo(() => Object.keys(config), [config]);

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
				<ChartContainer config={config} className="w-full min-h-80 max-h-[400px] -bg-conic-330">
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
							content={
								<CustomStackTooltipContent
									labelFormatter={tooltip}
									hoveredDataKey={hoveredDataKey}
									config={config}
								/>
							}
						/>
						{configKeys.map((key, index) => (
							<Bar
								key={key}
								dataKey={key}
								stackId="a"
								fill={`var(--color-${key})`}
								radius={index === 0 ? [0, 0, 4, 4] : [0, 0, 0, 0]}
								onMouseEnter={() => handleMouseEnter(key)}
								onMouseLeave={handleMouseLeave}
							/>
						))}
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
