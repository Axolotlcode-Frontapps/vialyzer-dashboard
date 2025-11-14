import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ForgotPasswordValues } from "@/lib/schemas/auth";

import { authSchemas } from "@/lib/schemas/auth";
import { authServices } from "@/lib/services/auth";
import { Button } from "@/ui/shared/button";
import { Field, FieldError, FieldLabel } from "../shared/field";
import { Input } from "../shared/input";
import { Spinner } from "../shared/spinner";

export function ForgotPasswordForm() {
	const navigate = useNavigate();

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
			return await authServices.forgotPassword(values);
		},
		onSuccess: ({ payload }) => {
			form.reset();
			toast.success(`¡Se ha enviado un correo electrónico de recuperación!`, {
				position: "bottom-right",
				description:
					"Por favor, revisa tu correo electrónico para restablecer tu contraseña.",
			});
			navigate({
				to: "/auth/verify-code",
				search: {
					userId: payload?.idUser,
					token: payload?.token,
				},
			});
		},
		onError: (error) => {
			form.state.canSubmit = true;
			toast.error(`Error al enviar el correo electrónico de recuperación`, {
				description:
					error instanceof Error
						? error.message
						: "Por favor, inténtalo de nuevo.",
			});
		},
		onSettled: () => {
			form.state.isSubmitting = false;
		},
	});

	useEffect(() => {
		if (forgotPasswordMutation.isPending) {
			form.state.isSubmitting = true;
			form.state.canSubmit = false;
		}
	}, [forgotPasswordMutation.isPending, form.state]);

	return (
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
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;
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
			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
			>
				{([canSubmit, isSubmitting]) => (
					<Button type="submit" disabled={!canSubmit}>
						{isSubmitting ? <Spinner /> : null}
						{isSubmitting ? "Enviando..." : "Enviar correo de recuperación"}
					</Button>
				)}
			</form.Subscribe>

			<Button
				variant="link"
				onClick={() => navigate({ to: "/auth/verify-code" })}
				className="w-full cursor-pointer text-muted-foreground"
			>
				Iniciar sesión
			</Button>
		</form>
	);
}
