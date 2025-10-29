import { z } from "zod";

class Settings {
	role = z.object({
		name: z.string().min(1, { error: "El nombre es obligatorio" }),
		description: z.string().min(1, { error: "La descripción es obligatoria" }),
	});

	user = z.object({
		name: z.string().min(1, { error: "El nombre es obligatorio" }),
		lastname: z.string().min(1, { error: "El apellido es obligatorio" }),
		email: z.email({ error: "El email es obligatorio" }),
		phone: z.string(),
		role: z.string().min(1, { error: "El rol es obligatorio" }),
		company: z.string().min(1, { error: "La empresa es obligatoria" }),
	});

	company = z.object({
		name: z.string().min(1, { error: "El nombre es obligatorio" }),
		description: z.string().min(1, { error: "La descripción es obligatoria" }),
		nit: z.string().min(1, { error: "El NIT es obligatorio" }),
		phone: z
			.string()
			.min(1, { error: "El teléfono es obligatorio" })
			.regex(/^3\d{9}$/, {
				message:
					"El teléfono debe ser un número celular colombiano válido (10 dígitos, inicia en 3)",
			}),
		address: z.string().min(1, { error: "La dirección es obligatoria" }),
		department: z.string().min(1, { error: "El departamento es obligatorio" }),
		city: z.string().min(1, { error: "La ciudad es obligatoria" }),
	});
}

export const settingsSchemas = new Settings();

export type RoleValues = z.infer<typeof settingsSchemas.role>;
export type UserValues = z.infer<typeof settingsSchemas.user>;
export type CompanyValues = z.infer<typeof settingsSchemas.company>;
