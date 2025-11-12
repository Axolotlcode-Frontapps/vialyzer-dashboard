import z from "zod";

class RolesSchemas {
	role = z.object({
		name: z.string().min(1, { error: "El nombre es obligatorio" }),
		description: z.string().min(1, { error: "La descripción es obligatoria" }),
	});

	module = z.object({
		name: z.string().min(1, { error: "El nombre del módulo es obligatorio" }),
		description: z
			.string()
			.min(1, { error: "La descripción del módulo es obligatoria" }),
	});

	assignModule = z.object({
		modulesIds: z.array(z.string()).min(1, {
			error: "Debe seleccionar al menos un módulo",
		}),
	});
}

export const rolesSchemas = new RolesSchemas();

export type ModuleValues = z.infer<typeof rolesSchemas.module>;
export type RoleValues = z.infer<typeof rolesSchemas.role>;
export type AssignModuleValues = z.infer<typeof rolesSchemas.assignModule>;
