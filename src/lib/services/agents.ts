import { fetcher } from "../utils/fetch-api";
import { fetchVializer } from "../utils/fetch-vializer";

const allowedStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED"] as const;

function normalizeStatus(raw: string): "PENDING" | "IN_PROGRESS" | "RESOLVED" {
	const upper = raw.toUpperCase();

	if (allowedStatuses.includes(upper as any)) {
		return upper as "PENDING" | "IN_PROGRESS" | "RESOLVED";
	}

	return "PENDING";
}

class AgentsServices {
	async getAllAgents() {
		return await fetcher<GeneralResponse<Agent[]>>("/agents/get-all");
	}

	async getKpis() {
		const response = await fetchVializer<{
			success: boolean;
			message: string;
			errors: any[];
			payload: {
				available_agents: number;
				unavailable_agents: number;
				average_hours: number;
				average_minutes: number;
				peak_day: string;
				peak_hour: number;
				total_tickets: number;
				unattended_alerts: number;
				effectiveness_percent: number;
			};
		}>("/kpi/dashboard-kpis");

		const data = response.payload;

		const derivedMetrics = {
			totalAgents: data.available_agents + data.unavailable_agents,
			attendedAlerts: data.total_tickets - data.unattended_alerts,
			rejectedAlertsPercentage:
				data.total_tickets > 0
					? Math.round(
							((data.total_tickets - data.unattended_alerts) /
								data.total_tickets) *
								100
						)
					: 0,
			averageTimeFormatted: `${data.average_hours.toFixed(2)}h ${data.average_minutes.toFixed(2)}m`,
			peakHourFormatted: `${data.peak_hour}:00-${data.peak_hour + 1}:00`,
		};

		return { data, derivedMetrics };
	}

	async getNotifications() {
		const start = new Date(Date.now() - 7 * 86400000)
			.toISOString()
			.split("T")[0];
		const end = new Date().toISOString().split("T")[0];

		const response = await fetchVializer<{
			success: boolean;
			message: string;
			errors: any[];
			payload: {
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
			};
		}>(`/kpi/active-tickets?star_date=${start}&end_date=${end}`);

		const tickets = response.payload.active_tickets ?? [];

		const normalized = tickets.map((t) => ({
			...t,
			ticket_status: normalizeStatus(t.ticket_status),
		}));

		return normalized;
	}

	async getAgentStatus(
		startDate: string,
		endDate: string
	): Promise<AgentStatusGraphData[]> {
		const response = await fetchVializer<{
			success: boolean;
			message: string;
			errors: any[];
			payload: AgentStatusResponse[];
		}>("/kpi/ticket-time-status", {
			params: { start_date: startDate, end_date: endDate },
		});

		const data = response.payload ?? [];

		const normalized: AgentStatusGraphData[] = data.map((d) => ({
			...d,
			time: d.average_minutes,
			max: d.total_time_minutes,
		}));

		return normalized;
	}

	async getVehicleAlert(start: string, end: string) {
		const response = await fetchVializer<{
			success: boolean;
			message: string;
			errors: any[];
			payload: { name: string; total: string; porcentaje: string }[];
		}>(`/kpi/alert/percentage?start=${start}&end=${end}`);

		const data = response.payload ?? [];

		return data.map((item) => ({
			name: item.name,
			porcentaje: Number(item.porcentaje),
		}));
	}

	async getTime(startDate: string, endDate: string) {
		const response = await fetchVializer<{
			success: boolean;
			message: string;
			errors: any[];
			payload: { name: string; avg_minutes: number }[];
		}>(`/kpi/time-spent-on-site?start_date=${startDate}&end_date=${endDate}`);

		const data = response.payload ?? [];
		return data;
	}

	async getTopReasons(startDate?: string, endDate?: string) {
		const query =
			startDate && endDate
				? `?start_date=${startDate}&end_date=${endDate}`
				: "";

		const response = await fetchVializer<{
			success: boolean;
			message: string;
			errors: any[];
			payload:
				| { reason: string; total: number }
				| { reason: string; total: number }[];
		}>(`/kpi/kpis-rejected-top${query}`);
		const data = response.payload ?? [];
		return Array.isArray(data) ? data : [data];
	}

	async getVolumeHour(startDate: string, endDate: string) {
		const response = await fetchVializer<{
			success: boolean;
			message: string;
			errors: any[];
			payload: {
				metadata: {
					vehicle_id: string;
					name: string;
					color: string;
				}[];
				data: {
					hour: number;
					count: number;
				}[];
			};
		}>(
			`/kpi/vehicle-volume-by-hour?start_date=${startDate}&end_date=${endDate}`
		);

		const data = response.payload?.data ?? [];

		return data.map((item) => ({
			hour: item.hour.toString().padStart(2, "0") + ":00",
			count: item.count,
		}));
	}
}

export const agentsService = new AgentsServices();

// import type { AxiosInstance } from "axios";
// import { fetcher } from "../utils/fetch-api";
// class AgentsServices {
// 	async getAllAgents() {
// 		return await fetcher<GeneralResponse<Agent[]>>("/agents/get-all");
// 	}

// 	async getKpis(instance: AxiosInstance) {
// 		if (!instance) throw new Error("Axios instance is required");
// 		try {
// 			const response = await instance.get<GeneralResponse<KPIs>>('/kpi/dashboard-kpis');
// 			return response.data.payload;
// 		} catch (error) {
// 			console.error('Error fetching KPIs:', error);
// 			throw error;
// 		}
// 	}

// 	async getNotifications(): Promise<NotificationItem[]> {
// 		await new Promise((res) => setTimeout(res, 1200));

// 		return [
// 			{
// 				id: "1",
// 				ticket_id: "TCK-001",
// 				ticket_status: "PENDING",
// 				img_url:
// 					"https://images.unsplash.com/photo-1581091870622-3f2a3c1a7c11?w=400",
// 				description: "Vehículo transitó por sección no autorizada.",
// 				maps_coordinates: "[19.4326, -99.1332]",
// 				vehicle: "Nissan Versa 2020",
// 				createAt: "2025-11-03T12:45:00Z",
// 				hours_pending: 1,
// 				minutes_pending: 30,
// 			},
// 			{
// 				id: "2",
// 				ticket_id: "TCK-002",
// 				ticket_status: "IN_PROGRESS",
// 				img_url:
// 					"https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400",
// 				description: "Paso detectado hacia zona de acceso restringido.",
// 				maps_coordinates: "[19.4319, -99.1321]",
// 				vehicle: "Toyota Corolla 2018",
// 				createAt: "2025-11-03T11:20:00Z",
// 				hours_pending: 0,
// 				minutes_pending: 45,
// 			},
// 			{
// 				id: "3",
// 				ticket_id: "TCK-003",
// 				ticket_status: "RESOLVED",
// 				img_url:
// 					"https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400",
// 				description: "Tránsito no autorizado registrado en sección B.",
// 				maps_coordinates: "[19.4331, -99.1345]",
// 				vehicle: "Chevrolet Spark 2019",
// 				createAt: "2025-11-03T09:50:00Z",
// 				hours_pending: 0,
// 				minutes_pending: 0,
// 			},
// 		];
// 	}

// 	async getAgentStatus() {
// 		await new Promise((res) => setTimeout(res, 800));
// 		return [
// 			{ status: "Inicio", time: 12, max: 20 },
// 			{ status: "Validación", time: 18, max: 25 },
// 			{ status: "Revisión", time: 10, max: 15 },
// 			{ status: "Aprobación", time: 22, max: 30 },
// 			{ status: "Finalizado", time: 8, max: 12 },
// 		];
// 	}

// 	async getVehicleAlert() {
// 		await new Promise((res) => setTimeout(res, 800));
// 		return [
// 			{ name: "Automovil", porcentaje: 42.5 },
// 			{ name: "Motocicleta", porcentaje: 28.3 },
// 			{ name: "Camion", porcentaje: 12.7 },
// 			{ name: "Bicicleta", porcentaje: 9.1 },
// 			{ name: "Autobus", porcentaje: 7.4 },
// 		];
// 	}

// 	async getTime() {
// 		await new Promise((res) => setTimeout(res, 800));
// 		return [
// 			{ name: "Automovil", avg_minutes: 25 },
// 			{ name: "Motocicleta", avg_minutes: 18 },
// 			{ name: "Camion", avg_minutes: 32 },
// 			{ name: "Bicicleta", avg_minutes: 12 },
// 			{ name: "Autobus", avg_minutes: 40 },
// 		];
// 	}

// 	async getTopReasons() {
// 		await new Promise((res) => setTimeout(res, 800));
// 		return [
// 			{ reason: "Documentación incompleta", total: 12 },
// 			{ reason: "Falta de pago", total: 8 },
// 			{ reason: "Tiempo excedido", total: 6 },
// 			{ reason: "Error de sistema", total: 4 },
// 			{ reason: "Otro", total: 2 },
// 		];
// 	}

// 	async getVolumeHour() {
// 		await new Promise((res) => setTimeout(res, 800));
// 		return [
// 			{ hour: "06:00", count: 12 },
// 			{ hour: "07:00", count: 18 },
// 			{ hour: "08:00", count: 25 },
// 			{ hour: "09:00", count: 22 },
// 			{ hour: "10:00", count: 20 },
// 			{ hour: "11:00", count: 17 },
// 			{ hour: "12:00", count: 15 },
// 			{ hour: "13:00", count: 18 },
// 			{ hour: "14:00", count: 20 },
// 			{ hour: "15:00", count: 24 },
// 			{ hour: "16:00", count: 28 },
// 			{ hour: "17:00", count: 30 },
// 			{ hour: "18:00", count: 26 },
// 			{ hour: "19:00", count: 21 },
// 		];
// 	}
// }

// export const agentsService = new AgentsServices();
