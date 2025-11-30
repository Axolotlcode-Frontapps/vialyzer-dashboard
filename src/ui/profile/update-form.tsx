import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppForm } from "@/contexts/form";

import type { AxiosError } from "axios";
import type { UpdateProfileValues } from "@/lib/schemas/profile";

import { profileSchemas } from "@/lib/schemas/profile";
import { usersService } from "@/lib/services/users";

export function UpdateUser({
	user,
	onOpenChange,
}: {
	user: User;
	onOpenChange?: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async (data: UpdateProfileValues) => {
			form.state.isSubmitting = true;
			form.state.canSubmit = false;
			return await usersService.updateUserProfile(data);
		},
		onSuccess: () => {
			toast.success(`Perfil actualizado correctamente.`);
			queryClient.invalidateQueries({ queryKey: ["get-me"] });
			onOpenChange?.(false);
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
			name: user.name || "",
			lastname: user.lastname || "",
			phone: user.phone || "",
		},
		validators: {
			onMount: profileSchemas.updateProfile,
			onChange: profileSchemas.updateProfile,
		},
		onSubmit: ({ value }) => {
			mutation.mutate(value);
		},
	});

	return (
		<form
			method="post"
			className="space-y-4 px-4 pb-4 overflow-y-auto h-full"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<div className="space-y-4 pb-4">
				<div className="w-full flex flex-col sm:flex-row gap-4">
					<form.AppField
						name="name"
						children={(field) => <field.TextField label="Nombres" placeholder="Nombre" />}
					/>
					<form.AppField name="lastname">
						{(field) => <field.TextField label="Apellidos" placeholder="Apellido" />}
					</form.AppField>
				</div>

				<form.AppField name="phone">
					{(field) => <field.TextField type="number" label="Teléfono" placeholder="Teléfono" />}
				</form.AppField>
			</div>
			<div className="w-full flex justify-end">
				<form.AppForm>
					<form.SubmitButton label="Actualizar usuario" labelLoading="Actualizando" />
				</form.AppForm>
			</div>
		</form>
	);
}
