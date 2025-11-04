import { Card, CardContent, CardHeader, CardTitle } from "../shared/card";
import { Skeleton } from "../shared/skeleton";

interface AvailableAgentsProps {
	available?: number;
	unavailable?: number;
	loading?: boolean;
}

export function AvailableAgents({
	available,
	unavailable,
	loading,
}: AvailableAgentsProps) {
	if (loading) {
		return (
			<Card className="@5xl/graphs:col-span-2 p-6">
				<CardHeader className="p-0">
					<CardTitle className="monitoring__stat-title">
						<Skeleton className="h-5 w-full mb-2" />
					</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-wrap justify-evenly items-center gap-2 p-0">
					<span className="monitoring__stat-box">
						<Skeleton className="h-9 w-20 mb-1" />
						<Skeleton className="h-4 w-20 mx-auto" />
					</span>
					<span className="monitoring__stat-box">
						<Skeleton className="h-9 w-24 mb-1" />
						<Skeleton className="h-4 w-24 mx-auto" />
					</span>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="@5xl/graphs:col-span-2 p-6">
			<CardHeader className="p-0">
				<CardTitle className="monitoring__stat-title">
					Disponibilidad de agentes
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-wrap justify-evenly items-center gap-2 p-0">
				<span className="monitoring__stat-box">
					<span className="block font-bold text-3xl text-[#54BB72]">
						{available ?? 0}
					</span>
					Disponibles
				</span>
				<span className="monitoring__stat-box">
					<span className="block font-bold text-3xl text-[#FC4B5F]">
						{unavailable ?? 0}
					</span>
					No disponibles
				</span>
			</CardContent>
		</Card>
	);
}
