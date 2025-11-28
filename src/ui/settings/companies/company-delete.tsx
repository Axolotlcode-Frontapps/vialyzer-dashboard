import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AxiosError } from "axios";

import { companiesService } from "@/lib/services/companies";
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
			return await companiesService.deleteCompany(company.id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["companies"] });
			toast.success(`Empresa eliminada correctamente`, {
				description: `Se ha eliminado la empresa "${company.name}" correctamente.`,
			});
			onOpenChange(false);
		},
		onError: (error: AxiosError) => {
			const message = (error.response?.data as GeneralResponse<unknown>)
				?.message;

			const capitalizedMessage =
				message &&
				message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();

			toast.error(`Error al eliminar la empresa "${company.name}"`, {
				description: capitalizedMessage ?? "Por favor, inténtalo de nuevo.",
			});
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
					<Button
						variant="destructive"
						onClick={() => companyDeleteMutation.mutate()}
					>
						{companyDeleteMutation.isPending ? (
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
