import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/security")({
	component: Security,
});

function Security() {
	return <div>security</div>;
}
