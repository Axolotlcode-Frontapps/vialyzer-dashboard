import z from "zod";

class ModulesSchemas {
	module = z.object({
		name: z.string().min(1, { error: "El nombre del módulo es obligatorio" }),
		description: z
			.string()
			.min(1, { error: "La descripción del módulo es obligatoria" }),
	});

	assignPermissions = z.object({
		permissionsIds: z.array(z.string()).min(1, {
			error: "Debe seleccionar al menos un permiso",
		}),
	});
}

export const modulesSchemas = new ModulesSchemas();

export type ModuleValues = z.infer<typeof modulesSchemas.module>;
export type AssignPermissionsValues = z.infer<
	typeof modulesSchemas.assignPermissions
>;
