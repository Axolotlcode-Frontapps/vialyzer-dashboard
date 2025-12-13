import { z } from "zod";

class SharedSchemas {
	genericTableSearchSchema = z.object({
		page: z.number().default(1),
		limit: z.number().default(10),
		search: z.string().optional(),
		sortBy: z.string().optional(),
		sortOrder: z.enum(["asc", "desc"]).optional(),
	});

	searchParamsSchema = z.object({
		search: z.string().optional(),
	});
}

export const sharedSchemas = new SharedSchemas();

export type GenericTableSearchValues = z.infer<typeof sharedSchemas.genericTableSearchSchema>;

export type GenericSearchParams = z.infer<typeof sharedSchemas.searchParamsSchema>;
