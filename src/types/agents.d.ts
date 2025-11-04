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
