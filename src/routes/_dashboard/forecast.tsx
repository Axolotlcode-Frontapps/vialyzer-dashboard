import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/forecast")({
	component: Forecast,
});

function Forecast() {
	return <div>forecast</div>;
}
