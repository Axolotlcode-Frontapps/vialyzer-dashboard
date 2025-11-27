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

					const server = serverLines.find((item) => item.id === id);

					if (!server)
						throw new Error("Línea de escenario no encontrada en el servidor");

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
							server.scenery.id
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
								server.second_scenery!.id
							);
						}

						const source = await settings.updateDatasource(
							{
								scenery_id: entry.id,
								vehicle_id: layer.category,
								description: layer.description,
								second_scenery: exit?.id,
								visual_coordinates,
								camera,
							},
							server.id
						);

						return source;
					}

					if (element.type === "CONFIGURATION") {
						const config = await settings.updateScenarioLine(
							{ ...line, coordinates, camera },
							server.scenery.id
						);

						const source = await settings.updateDatasource(
							{
								scenery_id: config.id,
								description: layer.description,
								visual_coordinates,
								camera,
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
