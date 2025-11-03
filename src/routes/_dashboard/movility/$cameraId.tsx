import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/movility/$cameraId")({
	component: CameraDetails,
});

function CameraDetails() {
	return <div>Hello "/_dashboard/movility/index/$cameraId"!</div>;
}
