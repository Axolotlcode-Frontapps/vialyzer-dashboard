import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { rolesService } from "@/lib/services/roles";
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

export function RoleDelete({
	role,
	open,
	onOpenChange,
}: {
	role: Role;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();

	const roleEditMutation = useMutation({
		mutationFn: async () => {
			return await rolesService.deleteRole(role.id);
		},
		onSuccess: () => {
			toast.success(`Rol eliminado correctamente`, {
				description: `Se ha eliminado el rol "${role.name}" correctamente.`,
			});
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			onOpenChange(false);
		},
		onError: (error) => {
			toast.error(`Error al eliminar el rol "${role.name}"`, {
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
					<DialogTitle>Eliminar rol</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que deseas eliminar el rol &quot;
						<span className="font-semibold capitalize">{role.name}</span>
						&quot;?&nbsp; Esta acción no se puede deshacer.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose asChild>
						<Button>Cancelar</Button>
					</DialogClose>
					<Button
						variant="destructive"
						onClick={() => roleEditMutation.mutate()}
					>
						{roleEditMutation.isPending ? (
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
