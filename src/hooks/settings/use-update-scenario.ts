import { useMutation } from "@tanstack/react-query";

import type { LineElement, SourceLine } from "@/lib/services/settings";

import { settings } from "@/lib/services/settings";

export function useUpdateScenarioLine() {
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

					const server = serverLines.find((item) => item.id === id);

					if (!server)
						throw new Error("Línea de escenario no encontrada en el servidor");

					if (element.type === "DETECTION") {
						const entry = await settings.updateScenarioLine(
							{
								...line,
								name: `${line.name} - Entrada`,
								coordinates: detection_entry,
							},
							server.scenery.id
						);
						const exit = await settings.updateScenarioLine(
							{
								...line,
								name: `${line.name} - Salida`,
								coordinates: detection_exit,
							},
							server.second_scenery!.id
						);

						const source = await settings.updateDatasource(
							{
								scenery_id: entry.id,
								vehicle_id: layer.category,
								description: layer.description,
								second_scenery: exit.id,
								visual_coordinates,
							},
							server.id
						);

						return source;
					}

					if (element.type === "CONFIGURATION") {
						const config = await settings.updateScenarioLine(
							{ ...line, coordinates },
							server.scenery.id
						);

						const source = await settings.updateDatasource(
							{
								scenery_id: config.id,
								vehicle_id: layer.category,
								description: layer.description,
								visual_coordinates,
							},
							server.id
						);

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
		update: mutateAsync,
		loading: isPending,
		error,
	};
}
