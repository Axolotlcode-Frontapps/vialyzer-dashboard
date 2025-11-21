interface Agent {
	id: string;
	userId: string;
	identification: string;
	secondName: string;
	plaque: string;
	availability: boolean;
	userImage: string;
	location: {
		latitude: string;
		longitude: string;
		locationToken: string;
		updatedAt: string;
	};
}

interface NotificationItem {
	id: string;
	ticket_id: string;
	ticket_status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
	img_url: string;
	description: string;
	maps_coordinates: `[${string}, ${string}]`;
	vehicle: string;
	createAt: string;
	hours_pending: number;
	minutes_pending: number;
}

interface KPIs {
	available_agents: number;
	unavailable_agents: number;
	average_hours: number;
	average_minutes: number;
	peak_day: string;
	peak_hour: number;
	total_tickets: number;
	unattended_alerts: number;
	effectiveness_percent: number;
}
