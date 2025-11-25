import z from "zod";

class AgentsSchema {
	query = z.object({
		cameraId: z.string(),
	});
}

export const agentsSchemas = new AgentsSchema();

export type AgentsSearchParams = z.infer<typeof agentsSchemas.query>;
