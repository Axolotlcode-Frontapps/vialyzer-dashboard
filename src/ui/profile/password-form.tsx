import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppForm } from "@/contexts/form";

import type { AxiosError } from "axios";
import type { UpdatePasswordValues } from "@/lib/schemas/auth";

import { authSchemas } from "@/lib/schemas/auth";
import { usersService } from "@/lib/services/users";

export function PasswordSection() {
	const mutation = useMutation({
		mutationFn: async (data: UpdatePasswordValues) => {
			form.state.isSubmitting = true;
			form.state.canSubmit = false;
			return await usersService.updateCurrentUser(data);
		},
		onSuccess: () => {
			toast.success(`Contraseña actualizada con éxito`);
		},
		onError: (error: AxiosError) => {
			form.state.canSubmit = true;
			const message = (error.response?.data as GeneralResponse<unknown>)?.message;

			const capitalizedMessage =
				message && message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();

			toast.error(`Error al actualizar el perfil`, {
				description: capitalizedMessage ?? "Por favor, inténtalo de nuevo.",
			});
		},
		onSettled: () => {
			form.state.isSubmitting = false;
		},
	});

	const form = useAppForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		validators: {
			onMount: authSchemas.updatePassword,
			onChange: authSchemas.updatePassword,
		},
		onSubmit: async ({ value }) => {
			mutation.mutate(value);
		},
	});

	return (
		<section className="w-full pt-4">
			<div className="px-4 pb-4">
				<h2 className="text-xl font-bold">Cambiar contraseña</h2>
				<p className="text-base text-muted-foreground">
					Aquí puedes cambiar la contraseña de tu cuenta.
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="w-full h-full flex flex-col justify-between px-4 pb-4 overflow-y-auto"
			>
				<div className="flex flex-col gap-4 mb-4">
					<form.AppField name="password">
						{(field) => (
							<field.PasswordField label="Nueva contraseña" placeholder="Nueva contraseña" />
						)}
					</form.AppField>

					<form.AppField name="confirmPassword">
						{(field) => (
							<field.PasswordField
								label="Confirmar contraseña"
								placeholder="Confirmar contraseña"
							/>
						)}
					</form.AppField>
				</div>

				<form.AppForm>
					<form.SubmitButton label="Cambiar contraseña" labelLoading="Cambiando..." />
				</form.AppForm>
			</form>
		</section>
	);
}
