type TStatus =
	| "UNIT_DISCONNECTED"
	| "UNIT_IMPAIRED"
	| "PROVISIONING"
	| "PROVISIONING_FAILED"
	| "VALIDATION_FAILED"
	| "VALIDATION"
	| "PROCESSING_STOPPED"
	| "WAITING_FOR_CONFIGURATION"
	| "CAMERA_ERROR"
	| "CAMERA_DISCONNECTED"
	| "VIEW_CHANGED"
	| "PROCESSING";

type TStatusType = "normal" | "warning" | "error";

interface PreviewCamera {
	id: string;
	name: string;
	url: string;
}

interface Camera {
	id: string;
	name: string;
	externalId: string;
	state: TStatus;
	location: {
		latitude: string;
		longitude: string;
		timezone: string;
	};
	createdAt: string;
	updatedAt: string;
	project: {
		id: string;
		name: string;
		externalId: string;
		createdAt: string;
		updatedAt: string;
	};
}
