export type StatusType = "normal" | "warning" | "error";

export const STATUS_STYLES = {
	normal: {
		label: "Normal",
		color: "bg-green-500",
		dot: "text-green-500",
		border: "border-green-400 bg-green-50 dark:bg-green-900/10",
	},
	warning: {
		label: "Advertencia",
		color: "bg-yellow-400",
		dot: "text-yellow-400",
		border: "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10",
	},
	error: {
		label: "Desconectado",
		color: "bg-red-500",
		dot: "text-red-500",
		border: "border-red-400 bg-red-50 dark:bg-red-900/10",
	},
};

export const STATUS: Record<
	TCameraStatus,
	{ label: string; color: string; dot: string }
> = {
	PROCESSING: { ...STATUS_STYLES.normal, label: "Procesando" },
	WAITING_FOR_CONFIGURATION: {
		...STATUS_STYLES.warning,
		label: "Esperando configuración",
	},
	PROCESSING_STOPPED: {
		...STATUS_STYLES.error,
		label: "Procesamiento detenido",
	},
	CAMERA_DISCONNECTED: { ...STATUS_STYLES.error, label: "Cámara desconectada" },
};

export const STATUS_ORDER: Record<keyof typeof STATUS_STYLES, TCameraStatus[]> =
	{
		normal: ["PROCESSING"],
		warning: ["WAITING_FOR_CONFIGURATION"],
		error: ["PROCESSING_STOPPED", "CAMERA_DISCONNECTED"],
	};

export const STATUS_TYPES: TCameraStatus[] = [
	"PROCESSING",
	"CAMERA_DISCONNECTED",
	"WAITING_FOR_CONFIGURATION",
	"PROCESSING_STOPPED",
];
