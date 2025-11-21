import { useMutation } from "@tanstack/react-query";

import type { SourceLine } from "@/lib/services/settings";

import { settings } from "@/lib/services/settings";
import { Route } from "@/routes/_dashboard/settings/cameras/$camera";

export function useRemoveScenarioLine() {
	const { camera } = Route.useParams();

	const { mutateAsync, isPending, error } = useMutation({
		mutationFn: async (sources: SourceLine[]) => {
			const all = await Promise.allSettled(
				sources.map(async (source) => {
					const first = await settings.removeScenarioLine(
						{
							id: source.scenery.id,
						},
						{
							id: camera,
						}
					);
					// biome-ignore lint/suspicious/noExplicitAny: Necessary
					let second: any = null;
					if (source.second_scenery) {
						second = await settings.removeScenarioLine(
							{
								id: source.second_scenery.id,
							},
							{
								id: camera,
							}
						);
					}

					const removed = await settings.removeDatasource(
						{ id: source.id },
						{ id: camera }
					);

					return { first, second, source: removed };
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
		remove: mutateAsync,
		loading: isPending,
		error,
	};
}
