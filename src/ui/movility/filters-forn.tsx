import { useLocation } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useCameraScenarios } from "@/hooks/use-camera-scenarios";
import { useCameraVehicles } from "@/hooks/use-camera-vehicles";
import { useCameras } from "@/hooks/use-cameras";

import type {
	MovilityCameraFilters,
	MovilityCameraForm,
} from "@/lib/schemas/movility";

import { movilitySchemas } from "@/lib/schemas/movility";
import { Route } from "@/routes/_dashboard/movility/$camera/route";
import { Card } from "@/ui/shared/card";
import { useFiltersForm } from "./filters/hook";
import {
	defaultValues,
	useGraphFilters,
	vehicles as vehiclesCat,
} from "./filters/use-graph-filters";

const schema = movilitySchemas.filtersCameraForm;

export function FiltersForm() {
	const search = Route.useSearch();
	const { camera } = Route.useParams();
	const { pathname } = useLocation();
	const { cameras } = useCameras();
	const { scenarios } = useCameraScenarios(camera);
	const { initialValues, onChange } = useGraphFilters();
	const { vehicles, loading: loadingVehicles } = useCameraVehicles(camera);

	const inVelocity = useMemo(() => pathname.includes("velocity"), [pathname]);

	const defaultVehiclesIds = useMemo(
		() => vehicles.map((cat) => cat.id),
		[vehicles]
	);

	const defaultScenariosIds = useMemo(
		() => scenarios.map((cat) => cat.id),
		[scenarios]
	);

	const form = useFiltersForm({
		defaultValues: {
			...initialValues,
			camera: camera,
			actors: initialValues.actors?.length
				? initialValues.actors
				: defaultVehiclesIds,
			zones: initialValues.zones?.length
				? initialValues.zones
				: defaultScenariosIds,
		},
		onSubmit: async ({ value }) => {
			const valueToSubmit: MovilityCameraFilters &
				Pick<MovilityCameraForm, "camera"> = structuredClone(value);
			if (
				value.actors?.length === defaultVehiclesIds.length ||
				value.camera !== camera
			) {
				valueToSubmit.actors = undefined;
			}
			if (
				value.zones?.length === defaultScenariosIds.length ||
				value.camera !== camera
			) {
				valueToSubmit.zones = undefined;
			}

			onChange(valueToSubmit);
		},
	});

	useEffect(() => {
		if (!search.actors && defaultVehiclesIds.length > 0) {
			form.setFieldValue("actors", defaultVehiclesIds);
		}
		if (!search.zones && defaultScenariosIds.length > 0) {
			form.setFieldValue("zones", defaultScenariosIds);
		}
	}, [search, form, defaultVehiclesIds, defaultScenariosIds]);

	return (
		<Card className="p-6 w-full rounded-md mb-7 border-none @container/filters">
			<form
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					form.handleSubmit();
				}}
				className="w-full flex flex-col gap-6"
			>
				<form.AppField
					name="camera"
					validators={{
						onChange: schema.shape.camera,
					}}
					children={(field) => (
						<field.SingleSelectField
							placeholder="Seleccione una cámara"
							className="mr-auto @lg/filters:max-w-max"
							options={cameras.map((camera) => ({
								value: camera.id,
								label: camera.name,
							}))}
						/>
					)}
				/>
				<div className="w-full flex flex-wrap gap-6 items-center">
					<form.Subscribe selector={(state) => state.values.endDate}>
						{(endDate) => (
							<form.AppField
								name="startDate"
								validators={{
									onChange: schema.shape.startDate,
								}}
								children={(field) => (
									<field.DateRangeField
										label="Rango de fechas"
										className="@lg/filters:max-w-max"
										endDate={endDate ?? undefined}
										onChooseEndDate={(value) => {
											form.setFieldValue("endDate", value);
										}}
									/>
								)}
							/>
						)}
					</form.Subscribe>
					<form.AppField
						name="hour"
						validators={{
							onChange: schema.shape.hour,
						}}
						children={(field) => (
							<field.SingleSelectField
								label="Rango de horas"
								placeholder="Seleccione una hora"
								className="@lg/filters:max-w-max"
								options={Array.from({ length: 24 }, (_, hour) => ({
									value: hour,
									label: hour.toString(),
								}))}
							/>
						)}
					/>
					<form.AppField
						name="actors"
						validators={{
							onChange: schema.shape.actors,
						}}
						children={(field) => (
							<field.MultiCheckField
								label="Actores viales"
								loading={loadingVehicles}
								options={vehicles.flatMap((vehicle) =>
									inVelocity && vehicle.name === "PERSON"
										? []
										: {
												value: vehicle.id,
												label:
													vehiclesCat?.[
														vehicle.name.replaceAll(
															" ",
															"_"
														) as keyof typeof vehiclesCat
													] ?? vehicle.name,
											}
								)}
							/>
						)}
					/>
					<form.AppField
						name="zones"
						validators={{
							onChange: schema.shape.zones,
						}}
						children={(field) => (
							<field.MultiSelectField
								label="Movimientos"
								placeholder="Seleccione una o más movimientos"
								className="@lg/filters:max-w-max"
								options={scenarios.map((scenario) => ({
									value: scenario.id,
									label: scenario.name,
								}))}
							/>
						)}
					/>
				</div>
				<form.AppForm>
					<div className="flex items-center justify-end gap-2">
						<form.Submit label="Aplicar filtros" loading="Aplicando..." />
						<form.Reset
							label="Limpiar filtros"
							loading="Limpiando..."
							onClick={() => {
								onChange({
									...defaultValues,
									actors: defaultVehiclesIds,
									zones: defaultScenariosIds,
									camera,
								});
							}}
						/>
					</div>
				</form.AppForm>
			</form>
		</Card>
	);
}
