import { format, monthEnd, monthStart, weekEnd, weekStart } from "@formkit/tempo";

export interface TimeRange {
	startDate: string;
	endDate: string;
}

export type RangeDates = "7d" | "30d" | "custom";

export type RangeInterval = {
	date: string;
	startInterval: string;
	endInterval: string;
};

export const formatDate = (date: string) => {
	return format({
		date: date,
		format: "YYYY-MM-DD HH:mm",
		tz: "America/Bogota",
	});
};

export function rangeDates(value: "7d" | "30d"): TimeRange;
export function rangeDates(value: "custom"): Partial<TimeRange>;
export function rangeDates(value: RangeDates): Partial<TimeRange> | TimeRange;
export function rangeDates(value: RangeDates): Partial<TimeRange> | TimeRange {
	const ranges = {
		"7d": {
			startDate: format(weekStart(new Date(), 1), "YYYY-MM-DD"),
			endDate: format(weekEnd(new Date(), 1), "YYYY-MM-DD"),
		},
		"30d": {
			startDate: format(monthStart(new Date()), "YYYY-MM-DD"),
			endDate: format(monthEnd(new Date()), "YYYY-MM-DD"),
		},
		custom: {
			startDate: undefined,
			endDate: undefined,
		},
	};

	return ranges[value];
}

export function getDateRange(range: Partial<TimeRange>): RangeDates | null {
	if (!range.startDate || !range.endDate) return null;

	const startDate = new Date(range.startDate);
	const endDate = new Date(range.endDate);

	const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays <= 7) return "7d";
	if (diffDays <= 30) return "30d";
	return "custom";
}
