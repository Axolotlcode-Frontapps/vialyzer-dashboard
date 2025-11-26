import { createFileRoute, redirect } from "@tanstack/react-router";

import { hasModule } from "@/lib/utils/permissions";

export const Route = createFileRoute("/_dashboard/profile")({
	component: Profile,
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

		const hasRoleModule = hasModule("perfil", user);

		if (!hasRoleModule) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}
	},
});

function Profile() {
	return (
		<div className="w-full max-w-7xl mx-auto">
			<h1 className="text-2xl font-bold">Profile Page</h1>
			<p>This is the profile page content.</p>
		</div>
	);
}
