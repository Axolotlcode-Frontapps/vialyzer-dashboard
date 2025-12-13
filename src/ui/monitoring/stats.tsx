import { useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { kpiServices } from "@/lib/services/kpis";
import { Alerts } from "@/ui/monitoring/alerts";
import { AverageTime } from "@/ui/monitoring/average-time";
import { Effectivity } from "@/ui/monitoring/effectivity";
import { HighParking } from "@/ui/monitoring/high-parking";
import { RejectedAlerts } from "@/ui/monitoring/rejected-alerts";
import { ScrollArea, ScrollBar } from "../shared/scroll-area";

export function Stats() {
	const { selected } = useSearch({ from: "/_dashboard/monitoring" });

	const { data, isLoading } = useQuery({
		queryKey: ["monitoring-kpis-info", selected],
		queryFn: async () => (selected ? await kpiServices.getKpis(selected) : undefined),
		enabled: !!selected,
	});

	const kpisData = data?.data;
	const derivedMetrics = data?.derivedMetrics;

	return (
		<ScrollArea className="monitoring__stats">
			<div data-item>
				<AverageTime
					hours={Number(kpisData?.average_hours?.toFixed(2))}
					minutes={Number(kpisData?.average_minutes?.toFixed(2))}
					loading={isLoading}
					formattedTime={derivedMetrics?.averageTimeFormatted}
				/>
				<HighParking
					peakDay={kpisData?.peak_day}
					peakHour={kpisData?.peak_hour}
					loading={isLoading}
				/>
				<Effectivity percentage={kpisData?.effectiveness_percent} loading={isLoading} />
				<Alerts
					unattended={kpisData?.unattended_alerts}
					total={kpisData?.total_tickets}
					loading={isLoading}
				/>
				<RejectedAlerts
					loading={isLoading}
					rejectedPercentage={derivedMetrics?.rejectedAlertsPercentage}
				/>
			</div>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
	);
}
