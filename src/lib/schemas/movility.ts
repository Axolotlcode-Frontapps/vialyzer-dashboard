import z from "zod";

import { sharedSchemas } from "./shared";

class MovilitySchema {
	filters = z.object({
		...sharedSchemas.searchParamsSchema.shape,
		selected: z.string().optional(),
		filter: z.enum(["normal", "warning", "error"]).optional(),
	});
}

export const movilitySchemas = new MovilitySchema();

export type MovilitySearchParams = z.infer<typeof movilitySchemas.filters>;
