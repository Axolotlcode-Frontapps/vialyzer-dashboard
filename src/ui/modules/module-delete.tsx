import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { modulesServices } from "@/lib/services/modules";
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

export function ModuleDelete({
	open,
	onOpenChange,
	module,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	module: Module;
}) {
	const queryClient = useQueryClient();
	const isDeleted = useMemo(() => module.active === true, [module.active]);

	const onDeletedMutation = useMutation({
		mutationFn: async () => await modulesServices.deleteModule(module.id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["modules"] });
			onOpenChange(false);
			toast.success(
				`Módulo ${isDeleted ? "desactivado" : "eliminado"} correctamente.`
			);
		},
		onError: (error) => {
			console.log(error);
			toast.error(
				`Error al ${isDeleted ? "desactivar" : "eliminar"} el módulo.`
			);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isDeleted ? "Desactivar" : "Eliminar"} módulo: {module.name}
					</DialogTitle>
					<DialogDescription>
						Esto {isDeleted ? "desactivará" : "eliminará"} permanentemente el
						módulo y sus permisos. Esta acción no se puede deshacer.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancelar</Button>
					</DialogClose>
					<Button
						variant="destructive"
						onClick={() => onDeletedMutation.mutate()}
					>
						{onDeletedMutation.isPending ? (
							<>
								<Spinner />
								<span>
									{isDeleted ? "Desactivando" : "Eliminando"} módulo...
								</span>
							</>
						) : (
							<span>{isDeleted ? "Desactivar" : "Eliminar"} módulo</span>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
