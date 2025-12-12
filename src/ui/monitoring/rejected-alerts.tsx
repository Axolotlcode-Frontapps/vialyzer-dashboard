import { Card, CardContent, CardHeader, CardTitle } from "../shared/card";
import { Skeleton } from "../shared/skeleton";

interface RejectedAlertsProps {
	loading?: boolean;
	rejectedPercentage?: number;
}

export function RejectedAlerts({ loading, rejectedPercentage }: RejectedAlertsProps) {
	if (loading) {
		return (
			<Card className="p-6">
				<CardHeader className="p-0">
					<CardTitle className="monitoring__stat-title">
						<Skeleton className="h-5 w-full mb-2" />
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<Skeleton className="h-12 w-16 mx-auto" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="p-6">
			<CardHeader className="p-0">
				<CardTitle className="monitoring__stat-title">Alertas rechazadas</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<span className="block text-center font-medium text-4xl">
					{rejectedPercentage ? `${rejectedPercentage}%` : "0%"}
				</span>
			</CardContent>
		</Card>
	);
}
