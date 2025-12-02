import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AxiosError } from "axios";
import type { ForgotPasswordValues } from "@/lib/schemas/auth";

import { authSchemas } from "@/lib/schemas/auth";
import { authServices } from "@/lib/services/auth";
import { Button } from "@/ui/shared/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/shared/card";
import { Field, FieldError, FieldLabel } from "@/ui/shared/field";
import { Input } from "@/ui/shared/input";
import { LogoVialyzer } from "@/ui/shared/logo-vialyzer";
import { Spinner } from "@/ui/shared/spinner";

export const Route = createFileRoute("/auth/forgot-password")({
	component: ForgotPassword,
});

function ForgotPassword() {
	const navigate = Route.useNavigate();

	const form = useForm({
		defaultValues: {
			email: "",
		},
		validators: {
			onMount: authSchemas.forgotPassword,
			onChange: authSchemas.forgotPassword,
		},
		onSubmit: ({ value }) => forgotPasswordMutation.mutate(value),
	});

	const forgotPasswordMutation = useMutation({
		mutationFn: async (values: ForgotPasswordValues) => {
			form.state.isSubmitting = true;
			form.state.canSubmit = false;
			return {
				data: await authServices.forgotPassword(values),
				email: values.email,
			};
		},
		onSuccess: ({ data: { payload }, email }) => {
			form.reset();
			toast.success(`¡Se ha enviado un correo electrónico de recuperación!`, {
				position: "bottom-right",
				description: "Por favor, revisa tu correo electrónico para restablecer tu contraseña.",
			});
			navigate({
				to: "/auth/verify-code",
				search: {
					email: email,
					userId: payload?.idUser,
					token: payload?.token,
				},
			});
		},
		onError: (error: AxiosError) => {
			form.state.canSubmit = true;
			const message = (error.response?.data as GeneralResponse<unknown>)?.message;

			const capitalizedMessage =
				message && message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();

			toast.error("Error al enviar el correo de recuperación", {
				description:
					capitalizedMessage ||
					"Error al enviar el correo de recuperación. Revisa tus credenciales.",
			});
		},
		onSettled: () => {
			form.state.isSubmitting = false;
		},
	});
	return (
		<Card className="w-full max-w-[500px] dark:bg-[#05225E]/80 rounded-xl shadow-2xl p-6 md:p-10 relative text-card-foreground flex flex-col gap-6 border">
			<CardHeader className="px-0">
				<a
					href="/auth"
					className="cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out mx-auto mb-6"
				>
					<LogoVialyzer className="mb-6" />
				</a>
				<CardTitle className="text-xl md:text-2xl text-center">Recuperar contraseña</CardTitle>
				<CardDescription className="md:text-base  text-center">
					Ingresa tu correo electrónico a continuación para recuperar tu contraseña
				</CardDescription>
			</CardHeader>
			<CardContent className="px-0">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="flex flex-col gap-4"
				>
					<form.Field
						name="email"
						children={(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Correo electrónico o numero de usuario
									</FieldLabel>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Ingresa tu correo electrónico o número de usuario"
										autoComplete="off"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
					<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
						{([canSubmit, isSubmitting]) => (
							<Button type="submit" disabled={!canSubmit}>
								{isSubmitting ? <Spinner /> : null}
								{isSubmitting ? "Enviando..." : "Enviar correo de recuperación"}
							</Button>
						)}
					</form.Subscribe>
				</form>

				<span className="inline-block w-full text-center text-muted-foreground text-sm mt-4">
					Ya tienes una cuenta?{" "}
					<Link to="/auth" className="font-semibold hover:underline underline-offset-4">
						Iniciar sesión
					</Link>
				</span>
			</CardContent>
		</Card>
	);
}
