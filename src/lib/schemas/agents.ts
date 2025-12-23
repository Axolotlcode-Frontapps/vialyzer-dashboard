import z from "zod";

class AgentsSchema {
	query = z.object({
		selected: z.string(),
	});

	agent = z.object({
		name: z.string().min(1, "El nombre es obligatorio"),
		secondName: z.string().min(1, "El segundo nombre es obligatorio").nullable(),
		lastName: z.string().min(1, "El apellido es obligatorio"),
		email: z.email("El email no es válido"),
		userImage: z.url("La URL de la imagen no es válida"),
		phone: z
			.string()
			.trim()
			.regex(
				/^(?:\+57)?\s?3\d{2}[\s-]?\d{3}[\s-]?\d{4}$/,
				"El teléfono debe ser un número celular colombiano válido (10 dígitos, inicia con 3, opcional +57)"
			),
		identification: z.string().min(9, "La identificación es obligatoria"),
		plaque: z.string().min(8, "La placa es obligatoria"),
		password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").nullable(),
		role: z.uuid(),
		company: z.uuid(),
	});
}

export const agentsSchemas = new AgentsSchema();

export type AgentsSearchParams = z.infer<typeof agentsSchemas.query>;
export type AgentValues = z.infer<typeof agentsSchemas.agent>;
