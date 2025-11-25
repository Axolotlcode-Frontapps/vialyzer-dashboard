import { createFileRoute, redirect } from "@tanstack/react-router";

import { hasModule } from "@/lib/utils/permissions";

export const Route = createFileRoute("/_dashboard/movility/$cameraId")({
	component: CameraDetails,
	beforeLoad: async ({
		context: {
			permissions: { user },
		},
	}) => {
		if (!user) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}

		const hasRoleModule = hasModule("movilidad", user);

		if (!hasRoleModule) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}
	},
});

function CameraDetails() {
	return <div>Hello "/_dashboard/movility/index/$cameraId"!</div>;
}
