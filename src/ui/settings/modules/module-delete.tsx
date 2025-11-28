import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AxiosError } from "axios";

import { modulesServices } from "@/lib/services/modules";
import { Button } from "@/ui/shared/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/ui/shared/dialog";
import { Spinner } from "@/ui/shared/spinner";

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
		onError: (error: AxiosError) => {
			const message = (error.response?.data as GeneralResponse<unknown>)
				?.message;

			const capitalizedMessage =
				message &&
				message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();

			toast.error(
				`Error al ${isDeleted ? "desactivar" : "eliminar"} el módulo.`,
				{
					description: capitalizedMessage ?? "Por favor, inténtalo de nuevo.",
				}
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
