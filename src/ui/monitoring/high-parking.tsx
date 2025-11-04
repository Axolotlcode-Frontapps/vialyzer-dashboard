import { Card, CardContent, CardHeader, CardTitle } from "../shared/card";
import { Skeleton } from "../shared/skeleton";

interface HighParkingProps {
	peakDay?: string;
	peakHour?: number;
	loading?: boolean;
}

export function HighParking({ peakDay, peakHour, loading }: HighParkingProps) {
	if (loading) {
		return (
			<Card className="p-6 @5xl/graphs:col-span-2">
				<CardHeader className="p-0">
					<CardTitle className="monitoring__stat-title">
						<Skeleton className="h-5 w-full mb-2" />
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<span className="flex items-center font-medium gap-2 mb-5">
						<span className="flex-1 block text-center">
							<Skeleton className="h-4 w-8 mx-auto" />
						</span>
						<Skeleton className="flex-[1.5] h-8 w-20" />
					</span>
					<span className="flex items-center font-medium gap-2">
						<span className="flex-1 block text-center">
							<Skeleton className="h-4 w-10 mx-auto" />
						</span>
						<Skeleton className="flex-[1.5] h-8 w-24" />
					</span>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="p-6 @5xl/graphs:col-span-2">
			<CardHeader className="p-0">
				<CardTitle className="monitoring__stat-title">
					Hora y día de mayor parqueo
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<span className="flex items-center font-medium gap-2 mb-5">
					<span className="flex-1 block text-center">Día</span>
					<span className="flex-[1.5] block font-medium text-2xl">
						{peakDay || "N/A"}
					</span>
				</span>
				<span className="flex items-center font-medium gap-2">
					<span className="flex-1 block text-center">Hora</span>
					<span className="flex-[1.5] block font-medium text-2xl">
						{peakHour ? `${peakHour}:00-${peakHour + 1}:00` : "N/A"}
					</span>
				</span>
			</CardContent>
		</Card>
	);
}
