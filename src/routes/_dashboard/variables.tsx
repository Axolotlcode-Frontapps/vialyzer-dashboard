import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/variables")({
	component: Variables,
});

function Variables() {
	return <div>variables</div>;
}
