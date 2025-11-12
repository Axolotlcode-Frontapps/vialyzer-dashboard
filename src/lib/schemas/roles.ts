import z from "zod";

class RolesSchemas {
	role = z.object({
		name: z.string().min(1, { error: "El nombre es obligatorio" }),
		description: z.string().min(1, { error: "La descripción es obligatoria" }),
	});

	assignModule = z.object({
		modulesIds: z.array(z.string()).min(1, {
			error: "Debe seleccionar al menos un módulo",
		}),
	});
}

export const rolesSchemas = new RolesSchemas();

export type RoleValues = z.infer<typeof rolesSchemas.role>;
export type AssignModuleValues = z.infer<typeof rolesSchemas.assignModule>;
