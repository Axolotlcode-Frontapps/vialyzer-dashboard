import { z } from "zod";

class SharedSchemas {
	genericTableSearchSchema = z.object({
		page: z.number().default(1),
		limit: z.number().default(10),
		searchText: z.string().optional(),
	});

	searchParamsSchema = z.object({
		searchText: z.string(),
	});
}

export const sharedSchemas = new SharedSchemas();

export type GenericTableSearchValues = z.infer<
	typeof sharedSchemas.genericTableSearchSchema
>;
