import { z } from "zod/v4";

export const genericTableSearchSchema = z.object({
	page: z.number().default(1),
	limit: z.number().default(10),
});

export type GenericTableSearchValues = z.infer<typeof genericTableSearchSchema>;
