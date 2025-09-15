import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-adapter";
import { toast } from "sonner";
import { useAppForm } from "@/contexts/form";

import type { UpdatePasswordValues } from "@/lib/schemas/auth";

import { authSchemas } from "@/lib/schemas/auth";
import { authServices } from "@/lib/services/auth";

export const Route = createFileRoute("/auth/update-password")({
	component: UpdatePasswordForm,
	validateSearch: zodValidator(authSchemas.verifyQueries),
});

export function UpdatePasswordForm() {
	const navigate = Route.useNavigate();
	const search = Route.useSearch() as { userId?: string; token?: string };

	const [persistedParams, setPersistedParams] = useState({
		userId: search.userId || null,
		token: search.token || null,
	});

	useEffect(() => {
		if (search.userId && search.token) {
			setPersistedParams((prev) => ({
				userId: search.userId || prev.userId,
				token: search.token || prev.token,
			}));

			navigate({ search: undefined });
		}
	}, [search, navigate]);

	const form = useAppForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		validators: {
			onChange: authSchemas.updatePassword,
		},
		onSubmit: ({ value }) => {
			if (!persistedParams.userId || !persistedParams.token) {
				toast.error("Sesión inválida, vuelve a verificar el código.");
				return;
			}
			mutation.mutate(value);
		},
	});

	const mutation = useMutation({
		mutationKey: ["updatePassword"],
		mutationFn: (values: UpdatePasswordValues) =>
			authServices.updateUser(
				{
					password: values.password,
					confirmPassword: "",
				},
				persistedParams.userId!,
				persistedParams.token!
			),
		onSuccess: () => {
			form.reset();
			toast.success("¡Contraseña actualizada!", {
				description: "Ya puedes iniciar sesión con tu nueva contraseña.",
			});
			navigate({ to: "/auth" });
		},
		onError: (error) => {
			toast.error("Error al actualizar la contraseña", {
				description:
					error instanceof Error
						? error.message
						: "Ocurrió un error inesperado al actualizar la contraseña.",
			});
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="flex flex-col gap-4"
		>
			<form.AppField
				name="password"
				children={(field) => <field.PasswordField label="Contraseña" placeholder="Contraseña" />}
			/>

			<form.AppField
				name="confirmPassword"
				children={(field) => (
					<field.PasswordField label="Confirmar contraseña" placeholder="Confirmar contraseña" />
				)}
			/>

			<form.AppForm>
				<form.SubmitButton
					label="Actualizar"
					labelLoading="Actualizando..."
					className="w-full text-base h-11.5"
					size="lg"
					disabled={mutation.isPending}
				/>
			</form.AppForm>
		</form>
	);
}
