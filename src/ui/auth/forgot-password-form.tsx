import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppForm } from "@/contexts/form";

import type { ForgotPasswordValues } from "@/lib/schemas/auth";

import { authSchemas } from "@/lib/schemas/auth";
import { authServices } from "@/lib/services/auth";
import { Button } from "@/ui/shared/button";

export function ForgotPasswordForm() {
	const navigate = useNavigate();

	const form = useAppForm({
		defaultValues: {
			email: "",
		},
		validators: {
			onMount: ({ formApi }) => {
				formApi.state.canSubmit = false;
				return authSchemas.forgotPassword;
			},
			onChange: authSchemas.forgotPassword,
			onSubmitAsync: async ({ formApi }) => {
				formApi.state.isSubmitting = true;
			},
		},
		onSubmit: ({ value }) => forgotPasswordMutation.mutate(value),
	});

	const forgotPasswordMutation = useMutation({
		mutationFn: async (values: ForgotPasswordValues) => {
			const response = await authServices.forgotPassword(values);

			return response.payload as {
				idUser: string;
				token: string;
			};
		},
		onSuccess: ({ idUser, token }) => {
			form.reset();
			toast.success(`¡Se ha enviado un correo electrónico de recuperación!`, {
				position: "bottom-right",
				description: "Por favor, revisa tu correo electrónico para restablecer tu contraseña.",
			});
			navigate({
				to: "/auth/verify-code",
				search: {
					userId: idUser,
					token,
				},
			});
		},
		onError: (error) => {
			form.state.canSubmit = true;
			toast.error(`Error al enviar el correo electrónico de recuperación`, {
				description: error instanceof Error ? error.message : "Por favor, inténtalo de nuevo.",
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
			<form.AppField
				name="email"
				children={(field) => (
					<field.TextField label="Correo electrónico" placeholder="Correo electrónico" />
				)}
			/>

			<form.AppForm>
				<form.SubmitButton
					label="Recuperar contraseña"
					labelLoading="Enviando..."
					className="w-full text-base h-11.5"
					size="lg"
				/>
			</form.AppForm>

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
