type TCameraStatus =
	| "CAMERA_DISCONNECTED"
	| "WAITING_FOR_CONFIGURATION"
	| "PROCESSING_STOPPED"
	| "PROCESSING";

interface PreviewCamera {
	id: string;
	name: string;
	url: string;
}
