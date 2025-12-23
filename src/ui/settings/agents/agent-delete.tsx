import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AxiosError } from "axios";
import type { Agent } from "@/types/agents";

import { agentsService } from "@/lib/services/agents";
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

export function AgentDelete({
	agent,
	open,
	onOpenChange,
}: {
	agent: Agent;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();

	const agentDeletion = useMutation({
		mutationFn: async () => {
			return await agentsService.deleteAgent(agent.id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agents"] });
			toast.success("Eliminado correctamente", {
				description: `Se ha eliminado el agente "${agent.secondName}" correctamente.`,
			});
			onOpenChange(false);
		},
		onError: (error: AxiosError) => {
			const message = (error.response?.data as GeneralResponse<unknown>)?.message;

			const capitalizedMessage =
				message && message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();

			toast.error(`Error al eliminar el agente "${agent.secondName}"`, {
				description: capitalizedMessage ?? "Por favor, inténtalo de nuevo.",
			});
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Eliminar agente</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que deseas eliminar el agente.&nbsp;
						<span className="font-semibold capitalize">"{agent.secondName}"</span>
						Esta acción no se puede deshacer.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose asChild>
						<Button>Cancelar</Button>
					</DialogClose>
					<Button
						variant="destructive"
						onClick={() => agentDeletion.mutate()}
						disabled={agentDeletion.isPending}
					>
						{agentDeletion.isPending ? (
							<>
								<Spinner />
								<span className="ml-2">Eliminando...</span>
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
