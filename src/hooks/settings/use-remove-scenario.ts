import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import type { SourceLine } from "@/lib/services/settings/get-scenario-lines";

import {
	removeDatasource,
	removeScenarioLine,
} from "@/lib/services/settings/remove-scenario";

const instance = axios.create({});

export function useRemoveScenarioLine() {
	const { mutateAsync, isPending, error } = useMutation({
		mutationFn: async (sources: SourceLine[]) => {
			const all = await Promise.allSettled(
				sources.map(async (source) => {
					const first = await removeScenarioLine(instance, {
						id: source.scenery.id,
					});
					// biome-ignore lint/suspicious/noExplicitAny: Necessary
					let second: any = null;
					if (source.second_scenery) {
						second = await removeScenarioLine(instance, {
							id: source.second_scenery.id,
						});
					}

					const removed = await removeDatasource(instance, { id: source.id });

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
