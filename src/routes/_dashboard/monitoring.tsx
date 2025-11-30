import { createFileRoute, redirect, useNavigate, useSearch } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";

import "@/ui/monitoring/page.css";

import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { GoogleMapsProvider } from "@/contexts/maps";

import { agentsSchemas } from "@/lib/schemas/agents";
import { camerasService } from "@/lib/services/cameras";
import { hasModule } from "@/lib/utils/permissions";
import { GraphAgentStatus } from "@/ui/monitoring/graph-agent-status";
import { GraphTime } from "@/ui/monitoring/graph-time";
import { GraphTopReasons } from "@/ui/monitoring/graph-top-reasons";
import { GraphVehicleAlert } from "@/ui/monitoring/graph-vehicle-alert";
import { GraphVolumeHour } from "@/ui/monitoring/graph-volume-hour";
import { Notifications } from "@/ui/monitoring/notifications";
import { Stats } from "@/ui/monitoring/stats";
import { Field, FieldError, FieldLabel } from "@/ui/shared/field";
import { Maps } from "@/ui/shared/maps";
import { HasPermission } from "@/ui/shared/permissions/has-permission";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/shared/select";

export const Route = createFileRoute("/_dashboard/monitoring")({
	component: Monitoring,
	validateSearch: zodValidator(agentsSchemas.query),
	beforeLoad: async ({
		context: {
			queryClient,
			permissions: { user },
		},
		search: { selected },
	}) => {
		if (!user) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}

		const hasRoleModule = hasModule("agentes", user);

		if (!hasRoleModule) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}

		const { payload: cameras } = await queryClient.ensureQueryData({
			queryKey: ["cameras"],
			queryFn: async () => await camerasService.getAllCameras(),
		});

		if (cameras && cameras.length > 0 && !selected) {
			throw redirect({
				search: {
					selected: cameras[0].id,
				},
			});
		}
	},
});

function Monitoring() {
	const navigate = useNavigate();
	const { selected } = useSearch({ from: "/_dashboard/monitoring" });

	const { data: cameras } = useSuspenseQuery({
		queryKey: ["cameras"],
		queryFn: async () => await camerasService.getAllCameras(),
		select: (data) => data.payload,
	});

	const form = useForm({
		defaultValues: {
			selected: selected ?? "",
		},
		validators: {
			onMount: agentsSchemas.query,
			onChange: agentsSchemas.query,
		},
		onSubmit: ({ value }) => {
			navigate({
				to: "/monitoring",
				search: {
					selected: value.selected,
				},
			});
		},
	});

	return (
		<div className="monitoring @container/page container mx-auto">
			<div className="flex flex-col md:flex-row md:items-center justify-start gap-4 mb-5">
				<h1 className="text-2xl font-bold">Agentes</h1>
				<form
					onSubmit={(e) => {
						e.stopPropagation();
						e.preventDefault();
						form.handleSubmit(e);
					}}
					className="w-full"
				>
					<form.Field
						name="selected"
						children={(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<div className="flex gap-2 items-center w-full max-w-xs">
										<FieldLabel htmlFor={field.name}>Camara:</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={(val) => {
												field.handleChange(val);
												form.handleSubmit();
											}}
										>
											<SelectTrigger className="flex-1">
												<SelectValue placeholder="Selecciona una empresa" />
											</SelectTrigger>
											<SelectContent>
												{cameras?.map((camera) => (
													<SelectItem key={camera.id} value={camera.id}>
														{camera.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
				</form>
			</div>
			<div className="monitoring__content">
				<HasPermission moduleBase="kpis" permissionName="dashboard-kpis">
					<Stats />
				</HasPermission>
				<HasPermission moduleBase="kpis" permissionName="active-tickets">
					<Notifications />
				</HasPermission>
				<div className="monitoring__map">
					<div className="h-[400px] @5xl/graphs:h-full">
						<GoogleMapsProvider>
							<Maps />
						</GoogleMapsProvider>
					</div>
				</div>
				{/* Graphs */}
				<HasPermission moduleBase="kpis" permissionName="all-alert-agents">
					<div className="monitoring__graph monitoring__graph--agents">
						<GraphAgentStatus />
					</div>
				</HasPermission>
				<HasPermission moduleBase="kpis" permissionName="alert-percentage">
					<div className="monitoring__graph monitoring__graph--alerts">
						<GraphVehicleAlert />
					</div>
				</HasPermission>
				<HasPermission moduleBase="kpis" permissionName="time-spent-on-site">
					<div className="monitoring__graph monitoring__graph--time">
						<GraphTime />
					</div>
				</HasPermission>
				<HasPermission moduleBase="kpis" permissionName="top-reasons-tickets-rejected">
					<div className="monitoring__graph monitoring__graph--rejects">
						<GraphTopReasons />
					</div>
				</HasPermission>
				<HasPermission moduleBase="kpis" permissionName="vehicle-volume-by-hour">
					<div className="monitoring__graph monitoring__graph--volume">
						<GraphVolumeHour />
					</div>
				</HasPermission>
			</div>
		</div>
	);
}
