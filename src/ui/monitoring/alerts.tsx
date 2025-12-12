import { Card, CardContent, CardHeader, CardTitle } from "../shared/card";
import { Skeleton } from "../shared/skeleton";

interface AlertsProps {
	unattended?: number;
	total?: number;
	loading?: boolean;
}

export function Alerts({ unattended, total, loading }: AlertsProps) {
	if (loading) {
		return (
			<Card className="p-6 @5xl/graphs:col-span-2">
				<CardHeader className="p-0">
					<CardTitle className="monitoring__stat-title">
						<Skeleton className="h-5 w-full mb-2" />
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<span className="grid grid-rows-2 grid-cols-2 gap-x-6 gap-y-1">
						<Skeleton className="h-10 w-full mx-auto" />
						<span className="block font-medium self-center">
							<Skeleton className="h-4 w-20" />
						</span>
						<Skeleton className="h-10 w-full mx-auto" />
						<span className="block font-medium self-center">
							<Skeleton className="h-4 w-12" />
						</span>
					</span>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="p-6 @5xl/graphs:col-span-2">
			<CardHeader className="p-0">
				<CardTitle className="monitoring__stat-title">Cantidad de alertas no atendidas</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<span className="grid grid-rows-2 grid-cols-2 gap-x-6">
					<span className="block font-medium text-center text-4xl border-b border-b-foreground">
						{unattended ?? 0}
					</span>
					<span className="block font-medium self-center">No atendidas</span>
					<span className="block font-medium text-center text-4xl">{total ?? 0}</span>
					<span className="block font-medium self-center">Totales</span>
				</span>
			</CardContent>
		</Card>
	);
}
