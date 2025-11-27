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

						const source = await settings.addDatasource({
							scenery_id: entry.id,
							vehicle_id: layer.category,
							description: layer.description,
							second_scenery: exit?.id,
							visual_coordinates,
							camera,
						});

						return source;
					}

					if (element.type === "CONFIGURATION") {
						const config = await settings.addScenarioLine({
							...line,
							coordinates,
							camera,
						});
						if (!config)
							throw new Error("Error al crear la línea de configuración");

						const source = await settings.addDatasource({
							scenery_id: config.id,
							description: layer.description,
							visual_coordinates,
							camera,
						});

						return source;
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
				.map((item) => item.value);

			return results;
		},
	});

	return {
		add: mutateAsync,
		loading: isPending,
		error,
	};
}
