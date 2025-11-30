import z from "zod";

class ProfileSchemas {
	profile = z.object({
		tab: z.enum(["account", "password"]).default("account"),
	});

	updateProfile = z.object({
		name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
		lastname: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
		phone: z
			.string()
			.min(10, {
				message: "El numero de telefono debe tener al menos 10 caracteres",
			})
			.max(13, {
				message: "El numero de telefono no debe exceder los 13 caracteres",
			}),
	});
}

export const profileSchemas = new ProfileSchemas();

export type UpdateProfileValues = z.infer<typeof profileSchemas.updateProfile>;
