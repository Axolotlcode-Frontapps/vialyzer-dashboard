export function useMonitoringKpis() {
	const loading = false;

	const data = {
		average_hours: 1.5,
		average_minutes: 45,
		peak_day: "Wednesday",
		peak_hour: 14,
		effectiveness_percent: 92,
		unattended_alerts: 5,
		total_tickets: 50,
		available_agents: 8,
		unavailable_agents: 2,
	};

	const derivedMetrics = {
		totalAgents: data.available_agents + data.unavailable_agents,
		attendedAlerts: data.total_tickets - data.unattended_alerts,
		rejectedAlertsPercentage:
			data.total_tickets > 0
				? Math.round(((data.total_tickets - data.unattended_alerts) / data.total_tickets) * 100)
				: 0,
		averageTimeFormatted: `${data.average_hours.toFixed(2)}h ${data.average_minutes.toFixed(2)}m`,
		peakHourFormatted: `${data.peak_hour}:00-${data.peak_hour + 1}:00`,
	};

	return {
		data,
		derivedMetrics,
		loading,
		error: null,
		isLoading: false,
		isFetching: false,
		isPending: false,
		isRefetching: false,
	};
}
