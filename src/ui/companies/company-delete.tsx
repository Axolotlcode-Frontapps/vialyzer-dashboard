import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { settingsService } from "@/lib/services/settings";
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

export function CompanyDelete({
	company,
	open,
	onOpenChange,
}: {
	company: Company;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();

	const companyDeleteMutation = useMutation({
		mutationFn: async () => {
			return await settingsService.deleteCompany(company.id);
		},
		onSuccess: () => {
			toast.success(`Empresa eliminada correctamente`, {
				description: `Se ha eliminado la empresa "${company.name}" correctamente.`,
			});
		},
		onError: (error) => {
			toast.error(`Error al eliminar la empresa "${company.name}"`, {
				description: error instanceof Error ? error.message : "Por favor, inténtalo de nuevo.",
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["companies"] });
			onOpenChange(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Eliminar rol</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que deseas eliminar la empresa &quot;
						<span className="font-semibold capitalize">{company.name}</span>
						&quot;?&nbsp; Esta acción no se puede deshacer.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose asChild>
						<Button>Cancelar</Button>
					</DialogClose>
					<Button variant="destructive" onClick={() => companyDeleteMutation.mutate()}>
						{companyDeleteMutation.isPending ? (
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
