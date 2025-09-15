import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CirclePlus } from "lucide-react";
import { toast } from "sonner";
import { useAppForm } from "@/contexts/form";

import type { UserValues } from "@/lib/schemas/settings";

import { usersService } from "@/lib/services/users";
import { Button } from "@/ui/shared/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/ui/shared/sheet";
import { UserFields } from "./user-fields";
import { userFieldsOpts } from "./user-fields/options";

export function UserAdd() {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);

	const userAddMutation = useMutation({
		mutationFn: async (values: UserValues) => {
			return await usersService.createUser(values);
		},
		onSuccess: ({ payload }) => {
			form.reset();
			toast.success(`Usuario creado correctamente`, {
				description: `Se ha creado el usuario "${payload?.name}" correctamente.`,
			});
		},
		onError: (error) => {
			form.state.canSubmit = true;
			toast.error(`Error al crear el usuario`, {
				description:
					error instanceof Error
						? error.message
						: "Por favor, inténtalo de nuevo.",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			form.state.isSubmitting = false;
			setOpen(false);
		},
	});

	const form = useAppForm({
		...userFieldsOpts,
		onSubmit: ({ value }) => userAddMutation.mutate(value as UserValues),
	});

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button>
					<CirclePlus />
					<span className="hidden sm:inline">Crear usuario</span>
				</Button>
			</SheetTrigger>
			<SheetContent className="w-full sm:min-w-[600px]">
				<SheetHeader>
					<SheetTitle>Crear usuario</SheetTitle>
					<SheetDescription>
						Vas a crear un nuevo usuario. Completa la información necesaria y
						guarda para agregar el usuario.
					</SheetDescription>
				</SheetHeader>
				<form
					id="user-add-form"
					className="px-4 space-y-2"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<UserFields form={form} />
				</form>
				<SheetFooter>
					<form.AppForm>
						<form.SubmitButton
							form="user-add-form"
							label="Crear usuario"
							labelLoading="Creando usuario..."
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
