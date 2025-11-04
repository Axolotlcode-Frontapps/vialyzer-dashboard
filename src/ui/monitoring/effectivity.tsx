import { Card, CardContent, CardHeader, CardTitle } from "../shared/card";
import { Skeleton } from "../shared/skeleton";

interface EffectivityProps {
	percentage?: number;
	loading?: boolean;
}

export function Effectivity({ percentage, loading }: EffectivityProps) {
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
				<CardTitle className="monitoring__stat-title">
					Efectividad de comparendos
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<span className="block text-center font-medium text-4xl">
					{percentage ? `${percentage}%` : "0%"}
				</span>
			</CardContent>
		</Card>
	);
}
