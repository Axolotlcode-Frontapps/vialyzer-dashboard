import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/settings/roles/$roleId/")({
	component: Permissions,
});

function Permissions() {
	return <div>Hello permissions!</div>;
}
