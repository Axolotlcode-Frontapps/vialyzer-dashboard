import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppForm } from "@/contexts/form";

import type { RoleValues } from "@/lib/schemas/settings";

import { rolesService } from "@/lib/services/roles";
import { Button } from "@/ui/shared/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/ui/shared/sheet";
import { RoleFields } from "./role-fields";
import { roleFieldsOpts } from "./role-fields/options";

export function RoleUpdate({
	role,
	open,
	onOpenChange,
}: {
	role: Role;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();

	const roleUpdateMutation = useMutation({
		mutationFn: async (values: RoleValues) => {
			return await rolesService.updateRole(role.id, values);
		},
		onSuccess: () => {
			form.reset();
			toast.success(`Rol actualizado correctamente`, {
				description: `Se ha actualizado el rol "${role.name}" correctamente.`,
			});
		},
		onError: (error) => {
			form.state.canSubmit = true;
			toast.error(`Error al actualizar el rol`, {
				description:
					error instanceof Error
						? error.message
						: "Por favor, inténtalo de nuevo.",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			form.state.isSubmitting = false;
			onOpenChange(false);
		},
	});

	const form = useAppForm({
		...roleFieldsOpts,
		defaultValues: {
			name: role.name ?? "",
			description: role.description ?? "",
		},
		onSubmit: ({ value }) => roleUpdateMutation.mutate(value),
	});

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:min-w-[600px]">
				<SheetHeader>
					<SheetTitle>Editar rol</SheetTitle>
					<SheetDescription>
						Vas a modificar la información de este rol. Realiza los cambios
						necesarios y guarda para actualizar el rol.
					</SheetDescription>
				</SheetHeader>
				<form
					id="role-edit-form"
					className="px-4 space-y-2"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<RoleFields form={form} />
				</form>
				<SheetFooter>
					<form.AppForm>
						<form.SubmitButton
							form="role-edit-form"
							label="Actualizar rol"
							labelLoading="Actualizando rol..."
						/>
					</form.AppForm>
					<SheetClose asChild>
						<Button variant="destructive">Cancelar</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
