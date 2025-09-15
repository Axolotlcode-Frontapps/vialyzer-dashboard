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

export const STATUS: Record<TStatus, { label: string; color: string; dot: string }> = {
	// normal statuses
	PROCESSING: { ...STATUS_STYLES.normal, label: "Procesando" },
	// warning statuses
	PROVISIONING: { ...STATUS_STYLES.warning, label: "Provisionando" },
	VALIDATION: { ...STATUS_STYLES.warning, label: "Validación" },
	WAITING_FOR_CONFIGURATION: {
		...STATUS_STYLES.warning,
		label: "Esperando configuración",
	},
	VIEW_CHANGED: { ...STATUS_STYLES.warning, label: "Vista cambiada" },
	// error statuses
	UNIT_DISCONNECTED: { ...STATUS_STYLES.error, label: "Unidad desconectada" },
	UNIT_IMPAIRED: { ...STATUS_STYLES.error, label: "Unidad con problemas" },
	PROVISIONING_FAILED: {
		...STATUS_STYLES.error,
		label: "Provisionamiento fallido",
	},
	VALIDATION_FAILED: { ...STATUS_STYLES.error, label: "Validación fallida" },
	PROCESSING_STOPPED: {
		...STATUS_STYLES.error,
		label: "Procesamiento detenido",
	},
	CAMERA_DISCONNECTED: { ...STATUS_STYLES.error, label: "Cámara desconectada" },
	CAMERA_ERROR: { ...STATUS_STYLES.error, label: "Error de cámara" },
};

export const STATUS_ORDER: Record<TStatusType, TStatus[]> = {
	normal: ["PROCESSING"],
	warning: ["PROVISIONING", "VALIDATION", "WAITING_FOR_CONFIGURATION", "VIEW_CHANGED"],
	error: [
		"UNIT_DISCONNECTED",
		"UNIT_IMPAIRED",
		"PROVISIONING_FAILED",
		"VALIDATION_FAILED",
		"PROCESSING_STOPPED",
		"CAMERA_ERROR",
		"CAMERA_DISCONNECTED",
	],
};

export const STATUS_TYPES: TStatusType[] = ["normal", "warning", "error"];
