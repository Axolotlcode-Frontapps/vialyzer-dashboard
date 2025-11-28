import z from "zod";

class AgentsSchema {
	query = z.object({
		selected: z.string(),
	});
}

export const agentsSchemas = new AgentsSchema();

export type AgentsSearchParams = z.infer<typeof agentsSchemas.query>;
