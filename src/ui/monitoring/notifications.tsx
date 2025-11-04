import { useQuery } from "@tanstack/react-query";

import { agentsService } from "@/lib/services/agents";
import { AvailableAgents } from "@/ui/monitoring/available-agents";
import { Notification } from "@/ui/monitoring/notification";
import { ScrollArea } from "@/ui/shared/scroll-area";
import { Skeleton } from "@/ui/shared/skeleton";

export function Notifications() {
	const { data: kpisData, isLoading: loadingAgents } = useQuery({
		queryKey: ["monitoring-kpis-info"],
		queryFn: () => agentsService.getKpis(),
	});

	const { data: notifications = [], isLoading: loading } = useQuery({
		queryKey: ["monitoring-notifications"],
		queryFn: () => agentsService.getNotifications(),
	});

	if (loading) {
		return (
			<div className="monitoring__notifications">
				<AvailableAgents
					available={kpisData?.data.available_agents}
					unavailable={kpisData?.data.unavailable_agents}
					loading={loadingAgents}
				/>
				<ScrollArea className="size-full">
					<div className="w-full flex flex-col h-[500px] gap-2">
						{Array.from({ length: 5 }).map((_, index) => (
							<div
								key={index}
								className="w-full rounded-[12px] shadow-[0px_1px_2px_0px_#0000000D] border p-4"
							>
								<div className="p-0 mb-3">
									<Skeleton className="h-6 w-32" />
								</div>
								<div className="p-0 space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-3 w-20" />
									<Skeleton className="h-3 w-16" />
									<Skeleton className="h-3 w-24" />
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			</div>
		);
	}

	return (
		<div className="monitoring__notifications">
			<AvailableAgents
				available={kpisData?.data.available_agents}
				unavailable={kpisData?.data.unavailable_agents}
				loading={loadingAgents}
			/>
			<ScrollArea className="size-full">
				<div className="w-full flex flex-col h-[500px] gap-2">
					{notifications.length > 0 ? (
						notifications.map((notification) => (
							<Notification key={notification.id} {...notification} />
						))
					) : (
						<p>No hay notificaciones disponibles.</p>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
