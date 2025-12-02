import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AxiosError } from "axios";

import { usersService } from "@/lib/services/users";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/ui/shared/dialog";
import { Button } from "../../shared/button";
import { Spinner } from "../../shared/spinner";

export function UserDelete({
	user,
	open,
	onOpenChange,
}: {
	user: User;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();

	const isActive = user.active;

	const userDeleteMutation = useMutation({
		mutationFn: async () => {
			return await usersService.deleteUser(user.id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success(`${isActive ? "Desactivado" : "Eliminado"} correctamente`, {
				description: `Se ha ${isActive ? "desactivado" : "eliminado"} el usuario "${user.name}" correctamente.`,
			});
			onOpenChange(false);
		},
		onError: (error: AxiosError) => {
			const message = (error.response?.data as GeneralResponse<unknown>)?.message;

			const capitalizedMessage =
				message && message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();

			toast.error(`Error al ${isActive ? "desactivar" : "eliminar"} el usuario "${user.name}"`, {
				description: capitalizedMessage ?? "Por favor, inténtalo de nuevo.",
			});
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{isActive ? "Desactivar" : "Eliminar"} usuario</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que deseas {isActive ? "desactivar" : "eliminar"} el usuario.&nbsp;
						<span className="font-semibold capitalize">"{user.name}"</span>
						{!isActive && "Esta acción no se puede deshacer."}
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose asChild>
						<Button>Cancelar</Button>
					</DialogClose>
					<Button
						variant="destructive"
						onClick={() => userDeleteMutation.mutate()}
						disabled={userDeleteMutation.isPending}
					>
						{userDeleteMutation.isPending ? (
							<>
								<Spinner />
								<span>{isActive ? "Desactivando..." : "Eliminando..."}</span>
							</>
						) : (
							<span>{isActive ? "Desactivar" : "Eliminar"}</span>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
