import { formatDate } from "@/lib/utils/date-format";

export function DateLabel({ date }: { date: string }) {
	return <span>{formatDate(date)}</span>;
}
