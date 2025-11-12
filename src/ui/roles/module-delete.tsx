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
	moduleId,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	moduleId: string;
}) {
	const queryClient = useQueryClient();

	const onDeletedMutation = useMutation({
		mutationFn: async () => await modulesServices.deleteModule(moduleId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["modules"] });
			onOpenChange(false);
			toast.success("Módulo eliminado correctamente.");
		},
		onError: (error) => {
			console.log(error);
			toast.error("Error al eliminar el módulo.");
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Eliminar módulo</DialogTitle>
					<DialogDescription>
						Esto eliminará permanentemente tu cuenta y eliminará tus datos de
						nuestros servidores. Esta acción no se puede deshacer.
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
								<span>Eliminando módulo...</span>
							</>
						) : (
							<span>Eliminar módulo</span>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
