import { Activity, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash, Undo2 } from "lucide-react";
import { toast } from "sonner";

import type { AxiosError } from "axios";

import { usersService } from "@/lib/services/users";
import { Button } from "@/ui/shared/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/ui/shared/dropdown-menu";
import { HasPermission } from "@/ui/shared/permissions/has-permission";
import { UserDelete } from "../user-delete";
import { UserUpdate } from "../user-update";

export function UserTableActions({ user }: { user: User }) {
	const queryClient = useQueryClient();
	const [openUpdate, setOpenUpdate] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);

	const userMutation = useMutation({
		mutationFn: async () => {
			return await usersService.reactivateUser(user.id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success(`Usuario reactivado correctamente`, {
				description: `Se ha reactivado el usuario "${user.name}" correctamente.`,
			});
			setOpenUpdate(false);
		},
		onError: (error: AxiosError) => {
			const message = (error.response?.data as GeneralResponse<unknown>)?.message;

			const capitalizedMessage =
				message && message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();

			toast.error(`Error al reactivar el usuario`, {
				description: capitalizedMessage ?? "Por favor, inténtalo de nuevo.",
			});
		},
	});

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Abrir menu</span>
						<MoreHorizontal />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<HasPermission permissionName="update-user" moduleBase="users">
						<DropdownMenuItem onClick={() => setOpenUpdate(true)}>
							<Pencil className="mr-2 h-4 w-4" />
							Editar
						</DropdownMenuItem>
						<Activity mode={!user.active ? "visible" : "hidden"}>
							<DropdownMenuItem onClick={() => userMutation.mutate()}>
								<Undo2 className="mr-2 h-4 w-4" />
								{!user.active && "Reactivar"}
							</DropdownMenuItem>
						</Activity>
					</HasPermission>
					<HasPermission permissionName="delete" moduleBase="users">
						<DropdownMenuItem variant="destructive" onClick={() => setOpenDelete(true)}>
							<Trash className="mr-2 h-4 w-4" />
							{user.active ? "Desactivar" : "Eliminar"}
						</DropdownMenuItem>
					</HasPermission>
				</DropdownMenuContent>
			</DropdownMenu>

			<HasPermission permissionName="update-user" moduleBase="users">
				<UserUpdate open={openUpdate} onOpenChange={setOpenUpdate} user={user} />
			</HasPermission>

			<HasPermission permissionName="delete" moduleBase="users">
				<UserDelete open={openDelete} onOpenChange={setOpenDelete} user={user} />
			</HasPermission>
		</>
	);
}
