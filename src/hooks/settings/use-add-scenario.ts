import { useMutation } from "@tanstack/react-query";

import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { LineElement, ScenarioCreated } from "@/lib/services/settings";

import { settings } from "@/lib/services/settings";
import { Route } from "@/routes/_dashboard/settings/cameras/$camera";

interface UseAddScenarioLineReturn {
	// biome-ignore lint/suspicious/noExplicitAny: Necessary
	add: UseMutateAsyncFunction<any[], Error, LineElement[], unknown>;
	loading: boolean;
	error: Error | null;
}

export function useAddScenarioLine(): UseAddScenarioLineReturn {
	const { camera } = Route.useParams();

	const { mutateAsync, isPending, error } = useMutation({
		mutationFn: async (lines: LineElement[]) => {
			const all = await Promise.allSettled(
				lines.map(async (element) => {
					const {
						detection_entry,
						detection_exit,
						coordinates,
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						id,
						layer,
						visual_coordinates,
						...line
					} = element;

					if (element.type === "DETECTION") {
						const isLine =
							element.visual_coordinates.type === "line" ||
							element.visual_coordinates.type === "curve";

						const vehicleIds = Array.isArray(layer.category)
							? layer.category
							: [layer.category];

						const entry = await settings.addScenarioLine({
							...line,
							name: isLine ? `${line.name} - Entrada` : line.name,
							coordinates: isLine ? detection_entry : coordinates,
							camera,
						});
						if (!entry) throw new Error("Error al crear la línea de entrada");

						let exit: undefined | ScenarioCreated;

						if (isLine) {
							exit = await settings.addScenarioLine({
								...line,
								name: `${line.name} - Salida`,
								coordinates: detection_exit,
								camera,
							});

							if (!exit) throw new Error("Error al crear la línea de salida");
						}

						const datasources = await Promise.all(
							vehicleIds.map((vehicleId) =>
								settings.addDatasource({
									scenery_id: entry.id,
									vehicle_id: vehicleId,
									description: layer.description,
									second_scenery: exit?.id,
									visual_coordinates,
									camera,
								})
							)
						);

						return datasources;
					}

					if (element.type === "CONFIGURATION") {
						// CONFIGURATION type doesn't require vehicles
						const config = await settings.addScenarioLine({
							...line,
							coordinates,
							camera,
							visibility: false,
						});
						if (!config)
							throw new Error("Error al crear la línea de configuración");

						// Only create datasources if there are vehicle IDs
						const vehicleIds = Array.isArray(layer.category)
							? layer.category
							: layer.category
								? [layer.category]
								: [];

						if (vehicleIds.length === 0) {
							// For CONFIGURATION without vehicles, create a single datasource without vehicle_id
							const datasource = await settings.addDatasource({
								scenery_id: config.id,
								description: layer.description,
								visual_coordinates,
								camera,
							});

							return [datasource];
						}

						const datasources = await Promise.all(
							vehicleIds.map((vehicleId) =>
								settings.addDatasource({
									scenery_id: config.id,
									vehicle_id: vehicleId,
									description: layer.description,
									visual_coordinates,
									camera,
								})
							)
						);

						return datasources;
					}

					if (element.type === "NEAR_MISS") {
						const isLine =
							element.visual_coordinates.type === "line" ||
							element.visual_coordinates.type === "curve";

						const vehicleIds = Array.isArray(layer.category)
							? layer.category
							: [layer.category];

						const entry = await settings.addScenarioLine({
							...line,
							name: isLine ? `${line.name} - Entrada` : line.name,
							coordinates: isLine ? detection_entry : coordinates,
							camera,
						});
						if (!entry) throw new Error("Error al crear la línea de entrada");

						let exit: undefined | ScenarioCreated;

						if (isLine) {
							exit = await settings.addScenarioLine({
								...line,
								name: `${line.name} - Salida`,
								coordinates: detection_exit,
								camera,
							});

							if (!exit) throw new Error("Error al crear la línea de salida");
						}

						const datasources = await Promise.all(
							vehicleIds.map((vehicleId) =>
								settings.addDatasource({
									scenery_id: entry.id,
									vehicle_id: vehicleId,
									description: layer.description,
									second_scenery: exit?.id,
									visual_coordinates,
									camera,
								})
							)
						);

						return datasources;
					}

					return null;
				})
			);

			const errors = all.filter((item) => item.status === "rejected");

			if (errors.length > 0) {
				throw new Error("Error al agregar una o más líneas de escenario");
			}

			const results = all
				.filter((item) => item.status === "fulfilled")
				.flatMap((item) => item.value);

			return results;
		},
	});

	return {
		add: mutateAsync,
		loading: isPending,
		error,
	};
}
