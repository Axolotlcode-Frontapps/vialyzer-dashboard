import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
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
			toast.success(`Usuario eliminado correctamente`, {
				description: `Se ha eliminado el usuario "${user.name}" correctamente.`,
			});
		},
		onError: (error) => {
			toast.error(`Error al eliminar el usuario "${user.name}"`, {
				description:
					error instanceof Error
						? error.message
						: "Por favor, inténtalo de nuevo.",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			onOpenChange(false);
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
					>
						{userDeleteMutation.isPending ? (
							<>
								<LoaderCircle className="mr-2 animate-spin" />
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
