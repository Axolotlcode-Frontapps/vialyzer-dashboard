import z from "zod";

import { STATUS_TYPES } from "../utils/statuses";
import { sharedSchemas } from "./shared";

class MovilitySchema {
	filters = z.object({
		...sharedSchemas.searchParamsSchema.shape,
		selected: z.string().optional(),
		filter: z.enum(STATUS_TYPES).optional(),
	});
}

export const movilitySchemas = new MovilitySchema();

export type MovilitySearchParams = z.infer<typeof movilitySchemas.filters>;
