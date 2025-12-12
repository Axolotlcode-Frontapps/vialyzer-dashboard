import { Card, CardContent, CardHeader, CardTitle } from "../shared/card";
import { Skeleton } from "../shared/skeleton";

interface AverageTimeProps {
	hours?: number;
	minutes?: number;
	loading?: boolean;
	formattedTime?: string;
}

export function AverageTime({ hours, minutes, loading, formattedTime }: AverageTimeProps) {
	if (loading) {
		return (
			<Card className="p-6">
				<CardHeader className="p-0 block">
					<CardTitle className="monitoring__stat-title">
						<Skeleton className="h-5 w-full mb-2" />
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<span className="block text-center text-xl">
						<span className="block font-medium text-4xl mb-2">
							<Skeleton className="h-12 w-24 mx-auto mb-3" />
						</span>
						<Skeleton className="h-5 w-32 mx-auto" />
					</span>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="p-6">
			<CardHeader className="p-0 block">
				<CardTitle className="monitoring__stat-title">Tiempo promedio atención</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<span className="block text-center text-xl">
					<span className="block font-medium text-4xl">
						{formattedTime || (hours ? `${hours}h ${minutes || 0}m` : "0h 0m")}
					</span>
					Tiempo promedio
				</span>
			</CardContent>
		</Card>
	);
}
