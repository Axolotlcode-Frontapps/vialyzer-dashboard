import { z } from "zod/v4";

class AuthSchemas {
	private passwordSchema = z
		.string({
			error: "La contraseña es obligatoria",
		})
		.min(8, { message: "La contraseña debe tener al menos 8 caracteres" });

	signIn = z.object({
		email: z.email("El correo electrónico no es válido"),
		password: this.passwordSchema,
		rememberMe: z.boolean(),
	});

	forgotPassword = z.object({
		email: z.email("El correo electrónico no es válido"),
	});

	verifyQueries = z.object({
		userId: z.uuid("El ID de usuario no es válido").optional(),
		token: z.string().optional(),
	});

	verifyCode = z.object({
		code: z.string().min(6).max(6).regex(/^\d+$/, "El código debe ser numérico"),
	});

	updatePassword = z
		.object({
			password: this.passwordSchema,
			confirmPassword: this.passwordSchema,
		})
		.refine(({ password, confirmPassword }) => password === confirmPassword, {
			message: "Las contraseñas deben coincidir",
			path: ["confirmPassword"],
		});
}

export const authSchemas = new AuthSchemas();

export type SignInValues = z.infer<typeof authSchemas.signIn>;
export type ForgotPasswordValues = z.infer<typeof authSchemas.forgotPassword>;
export type VerifyCodeQueries = z.infer<typeof authSchemas.verifyQueries>;
export type VerifyCodeValues = z.infer<typeof authSchemas.verifyCode>;
export type UpdatePasswordValues = z.infer<typeof authSchemas.updatePassword>;
