interface DashboardKpis {
	available_agents: number;
	unavailable_agents: number;
	average_hours: number;
	average_minutes: number;
	peak_day: "Saturday";
	peak_hour: number;
	total_tickets: number;
	unattended_alerts: number;
	effectiveness_percent: number;
}

interface ActiveTickets {
	active_tickets: Array<{
		id: string;
		ticket_id: string;
		ticket_status: string;
		img_url: string | null;
		description: string;
		maps_coordinates: string;
		vehicle: string;
		createAt: string;
		hours_pending: number;
		minutes_pending: number;
	}>;
}

interface AgentStatusResponse {
	status: string;
	total_time_minutes: number;
	average_minutes: number;
}

interface AgentStatusGraphData extends AgentStatusResponse {
	time: number;
	max: number;
}
