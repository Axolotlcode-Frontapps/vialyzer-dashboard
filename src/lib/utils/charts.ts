import type { Column } from "@tanstack/react-table";
import type { CSSProperties } from "react";
import type { ChartConfig } from "@/ui/shared/chart";

export const chartConfig: ChartConfig = {
	car: {
		// label: 'CAR',
		label: "Automóvil",
		color: "hsl(var(--chart-car))",
	},
	bicycle: {
		// label: 'BICYCLE',
		label: "Bicicleta",
		color: "hsl(var(--chart-bicycle))",
	},
	motorcycle: {
		// label: 'MOTORCYCLE',
		label: "Motocicleta",
		color: "hsl(var(--chart-motorcycle))",
	},
	bus: {
		// label: 'BUS',
		label: "Bus",
		color: "hsl(var(--chart-bus))",
	},
	van: {
		// label: 'VAN',
		label: "Van",
		color: "hsl(var(--chart-van))",
	},
	heavy_truck: {
		// label: 'HEAVY TRUCK',
		label: "Camión pesado",
		color: "hsl(var(--chart-heavy-truck))",
	},
	person: {
		// label: 'PERSON',
		label: "Peatón",
		color: "hsl(var(--chart-person))",
	},
	truck: {
		// label: 'TRUCK',
		label: "Camión",
		color: "hsl(var(--chart-truck))",
	},
};

export function pinningStyles<T>(column: Column<T>): CSSProperties {
	const isPinned = column.getIsPinned();

	return {
		left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
		right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
		position: isPinned ? "sticky" : "relative",
		backgroundColor: isPinned ? "var(--card)" : "transparent",
		width: column.getSize(),
		zIndex: isPinned ? 1 : 0,
	};
}
