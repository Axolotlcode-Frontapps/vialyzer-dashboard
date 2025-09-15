import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/monitoring")({
	component: Monitoring,
});

function Monitoring() {
	return <div>monitoring</div>;
}
