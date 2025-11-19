import { useMutation } from "@tanstack/react-query";

import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { LineElement } from "@/lib/services/settings";

import { settings } from "@/lib/services/settings";

interface UseAddScenarioLineReturn {
	// biome-ignore lint/suspicious/noExplicitAny: Necessary
	add: UseMutateAsyncFunction<any[], Error, LineElement[], unknown>;
	loading: boolean;
	error: Error | null;
}

export function useAddScenarioLine(): UseAddScenarioLineReturn {
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
						const entry = await settings.addScenarioLine({
							...line,
							name: `${line.name} - Entrada`,
							coordinates: detection_entry,
						});
						const exit = await settings.addScenarioLine({
							...line,
							name: `${line.name} - Salida`,
							coordinates: detection_exit,
						});

						const source = await settings.addDatasource({
							scenery_id: entry.id,
							vehicle_id: layer.category,
							description: layer.description,
							second_scenery: exit.id,
							visual_coordinates,
						});

						return source;
					}

					if (element.type === "CONFIGURATION") {
						const config = await settings.addScenarioLine({
							...line,
							coordinates,
						});

						const source = await settings.addDatasource({
							scenery_id: config.id,
							vehicle_id: layer.category,
							description: layer.description,
							visual_coordinates,
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
