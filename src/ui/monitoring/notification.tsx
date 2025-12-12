import { Card, CardContent, CardHeader, CardTitle } from "../shared/card";

const notification_type = {
	PENDING: "creada",
	IN_PROGRESS: "en proceso",
	RESOLVED: "resuelta",
};

const status_type = {
	PENDING: "Pendiente",
	IN_PROGRESS: "En camino",
	RESOLVED: "En zona",
};

const vehicleTypeLabels: Record<string, string> = {
	car: "Automóvil",
	motorcycle: "Motocicleta",
	truck: "Camión",
	bus: "Autobús",
	bicycle: "Bicicleta",
	van: "Camioneta",
	person: "Persona",
};

interface Props {
	ticket_id: string;
	ticket_status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
	description: string;
	vehicle: string;
	minutes_pending: number;
}

export function Notification({ ticket_status, description, vehicle, minutes_pending }: Props) {
	const vehicleLabel = vehicleTypeLabels[vehicle] || vehicle;

	const formatPendingTime = () => {
		const hours = Math.floor(minutes_pending / 60);
		const mins = minutes_pending % 60;
		if (hours > 0) {
			return `${hours}h ${mins}m`;
		}
		return `${mins}m`;
	};

	return (
		<Card className="rounded-[12px] shadow-[0px_1px_2px_0px_#0000000D] gap-0 p-4">
			<CardHeader className="p-0">
				<CardTitle className="font-medium text-xl">
					Alerta {notification_type[ticket_status]}
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<p className="font-medium text-base">{description}</p>
				<span className="block text-[#4B5563] text-sm">{vehicleLabel}</span>
				<span className="block text-[#4B5563] text-sm">Tiempo: {formatPendingTime()}</span>
				<span
					className="data-[status='PENDING']:text-[#FC4B5F] data-[status='IN_PROGRESS']:text-[#F59E0B] data-[status='RESOLVED']:text-[#009B46]"
					data-status={ticket_status}
				>
					{status_type[ticket_status]}
				</span>
			</CardContent>
		</Card>
	);
}
