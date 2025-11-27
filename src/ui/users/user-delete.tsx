import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
import { Button } from "../shared/button";
import { Spinner } from "../shared/spinner";

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

	const userDeleteMutation = useMutation({
		mutationFn: async () => {
			return await usersService.deleteUser(user.id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success(`Usuario eliminado correctamente`, {
				description: `Se ha eliminado el usuario "${user.name}" correctamente.`,
			});
			onOpenChange(false);
		},
		onError: (error) => {
			toast.error(`Error al eliminar el usuario "${user.name}"`, {
				description:
					error instanceof Error
						? error.message
						: "Por favor, inténtalo de nuevo.",
			});
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Eliminar usuario</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que deseas eliminar el usuario &quot;
						<span className="font-semibold capitalize">{user.name}</span>
						&quot;?&nbsp; Esta acción no se puede deshacer.
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
								<span>Eliminando...</span>
							</>
						) : (
							<span>Eliminar</span>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
