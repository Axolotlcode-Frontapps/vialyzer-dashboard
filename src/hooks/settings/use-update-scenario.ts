import { useMutation } from "@tanstack/react-query";

import type { IdLine, LineElement, SourceLine } from "@/lib/services/settings";

import { settings } from "@/lib/services/settings";
import { Route } from "@/routes/_dashboard/settings/cameras/$camera";

export function useUpdateScenarioLine() {
	const { camera } = Route.useParams();

	const { mutateAsync, isPending, error } = useMutation({
		mutationFn: async ({
			lines,
			serverLines,
		}: {
			lines: LineElement[];
			serverLines: SourceLine[];
		}) => {
			const all = await Promise.allSettled(
				lines.map(async (element) => {
					const {
						detection_entry,
						detection_exit,
						coordinates,
						id,
						layer,
						visual_coordinates,
						...line
					} = element;

					const vehicleIds = Array.isArray(layer.category)
						? layer.category
						: [layer.category];

					const elementDatasources = serverLines.filter(
						(item) => item.scenery.id === id
					);

					if (elementDatasources.length === 0)
						throw new Error("Línea de escenario no encontrada en el servidor");

					const primaryServer = elementDatasources[0];

					if (element.type === "DETECTION") {
						const isLine =
							element.visual_coordinates.type === "line" ||
							element.visual_coordinates.type === "curve";

						const entry = await settings.updateScenarioLine(
							{
								...line,
								name: isLine ? `${line.name} - Entrada` : line.name,
								coordinates: isLine ? detection_entry : coordinates,
								camera,
							},
							primaryServer.scenery.id
						);

						let exit: undefined | IdLine;

						if (isLine) {
							exit = await settings.updateScenarioLine(
								{
									...line,
									name: `${line.name} - Salida`,
									coordinates: detection_exit,
									camera,
								},
								primaryServer.second_scenery!.id
							);
						}

						const existingVehicleIds = elementDatasources.map(
							(ds) => ds.vehicle.id
						);

						const newVehicleIds = vehicleIds.filter(
							(vid) => !existingVehicleIds.includes(vid)
						);
						const removedVehicleIds = existingVehicleIds.filter(
							(vid) => !vehicleIds.includes(vid)
						);

						const hasVehicleChanges =
							newVehicleIds.length > 0 || removedVehicleIds.length > 0;

						if (!hasVehicleChanges) {
							return { entry, exit };
						}

						const updatePromises = elementDatasources
							.filter((ds) => vehicleIds.includes(ds.vehicle.id))
							.map((ds) =>
								settings.updateDatasource(
									{
										scenery_id: entry.id,
										vehicle_id: ds.vehicle.id,
										description: layer.description,
										second_scenery: exit?.id,
										visual_coordinates,
										camera,
									},
									ds.id
								)
							);

						const addPromises = newVehicleIds.map((vehicleId) =>
							settings.addDatasource({
								scenery_id: entry.id,
								vehicle_id: vehicleId,
								description: layer.description,
								second_scenery: exit?.id,
								visual_coordinates,
								camera,
							})
						);

						const removePromises = elementDatasources
							.filter((ds) => removedVehicleIds.includes(ds.vehicle.id))
							.map((ds) =>
								settings.removeDatasource({ id: ds.id }, { id: camera })
							);

						const datasourceResults = await Promise.all([
							...updatePromises,
							...addPromises,
							...removePromises,
						]);

						return datasourceResults;
					}

					if (element.type === "CONFIGURATION") {
						const config = await settings.updateScenarioLine(
							{ ...line, coordinates, camera },
							primaryServer.scenery.id
						);

						// CONFIGURATION type doesn't require vehicles
						const existingVehicleIds = elementDatasources
							.map((ds) => ds.vehicle?.id)
							.filter(Boolean) as string[];

						const newVehicleIds = vehicleIds.filter(
							(vid) => !existingVehicleIds.includes(vid)
						);
						const removedVehicleIds = existingVehicleIds.filter(
							(vid) => !vehicleIds.includes(vid)
						);

						const hasVehicleChanges =
							newVehicleIds.length > 0 || removedVehicleIds.length > 0;

						if (!hasVehicleChanges) {
							// Update existing datasources without vehicle changes
							const updatePromises = elementDatasources.map((ds) =>
								settings.updateDatasource(
									{
										scenery_id: config.id,
										vehicle_id: ds.vehicle?.id,
										description: layer.description,
										visual_coordinates,
										camera,
									},
									ds.id
								)
							);

							const results = await Promise.all(updatePromises);
							return { config, datasources: results };
						}

						const updatePromises = elementDatasources
							.filter(
								(ds) => ds.vehicle?.id && vehicleIds.includes(ds.vehicle.id)
							)
							.map((ds) =>
								settings.updateDatasource(
									{
										scenery_id: config.id,
										vehicle_id: ds.vehicle.id,
										description: layer.description,
										visual_coordinates,
										camera,
									},
									ds.id
								)
							);

						const addPromises = newVehicleIds.map((vehicleId) =>
							settings.addDatasource({
								scenery_id: config.id,
								vehicle_id: vehicleId,
								description: layer.description,
								visual_coordinates,
								camera,
							})
						);

						const removePromises = elementDatasources
							.filter(
								(ds) =>
									ds.vehicle?.id && removedVehicleIds.includes(ds.vehicle.id)
							)
							.map((ds) =>
								settings.removeDatasource({ id: ds.id }, { id: camera })
							);

						const datasourceResults = await Promise.all([
							...updatePromises,
							...addPromises,
							...removePromises,
						]);

						return datasourceResults;
					}

					if (element.type === "NEAR_MISS") {
						const isLine =
							element.visual_coordinates.type === "line" ||
							element.visual_coordinates.type === "curve";

						const entry = await settings.updateScenarioLine(
							{
								...line,
								name: isLine ? `${line.name} - Entrada` : line.name,
								coordinates: isLine ? detection_entry : coordinates,
								camera,
							},
							primaryServer.scenery.id
						);

						let exit: undefined | IdLine;

						if (isLine) {
							exit = await settings.updateScenarioLine(
								{
									...line,
									name: `${line.name} - Salida`,
									coordinates: detection_exit,
									camera,
								},
								primaryServer.second_scenery!.id
							);
						}

						const existingVehicleIds = elementDatasources.map(
							(ds) => ds.vehicle.id
						);

						const newVehicleIds = vehicleIds.filter(
							(vid) => !existingVehicleIds.includes(vid)
						);
						const removedVehicleIds = existingVehicleIds.filter(
							(vid) => !vehicleIds.includes(vid)
						);

						const hasVehicleChanges =
							newVehicleIds.length > 0 || removedVehicleIds.length > 0;

						if (!hasVehicleChanges) {
							return { entry, exit };
						}

						const updatePromises = elementDatasources
							.filter((ds) => vehicleIds.includes(ds.vehicle.id))
							.map((ds) =>
								settings.updateDatasource(
									{
										scenery_id: entry.id,
										vehicle_id: ds.vehicle.id,
										description: layer.description,
										second_scenery: exit?.id,
										visual_coordinates,
										camera,
									},
									ds.id
								)
							);

						const addPromises = newVehicleIds.map((vehicleId) =>
							settings.addDatasource({
								scenery_id: entry.id,
								vehicle_id: vehicleId,
								description: layer.description,
								second_scenery: exit?.id,
								visual_coordinates,
								camera,
							})
						);

						const removePromises = elementDatasources
							.filter((ds) => removedVehicleIds.includes(ds.vehicle.id))
							.map((ds) =>
								settings.removeDatasource({ id: ds.id }, { id: camera })
							);

						const datasourceResults = await Promise.all([
							...updatePromises,
							...addPromises,
							...removePromises,
						]);

						return datasourceResults;
					}

					return null;
				})
			);

			const errors = all.filter((item) => item.status === "rejected");

			if (errors.length > 0) {
				throw new Error("Error al actualizar una o más líneas de escenario");
			}

			const results = all
				.filter((item) => item.status === "fulfilled")
				.flatMap((item) => item.value);

			return results;
		},
	});

	return {
		update: mutateAsync,
		loading: isPending,
		error,
	};
}
