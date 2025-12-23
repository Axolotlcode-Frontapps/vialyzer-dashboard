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

export function AgentAvailable({
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
			return await agentsService.availableAgent({
				id: agent.id,
				availability: true,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agents"] });
			toast.success("Agente actualizado correctamente", {
				description: `Se ha actualizado el agente "${agent.secondName}" correctamente.`,
			});
			onOpenChange(false);
		},
		onError: (error: AxiosError) => {
			const message = (error.response?.data as GeneralResponse<unknown>)?.message;

			const capitalizedMessage =
				message && message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();

			toast.error(`Error al actualizar el agente "${agent.secondName}"`, {
				description: capitalizedMessage ?? "Por favor, inténtalo de nuevo.",
			});
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Actualizar disponibilidad del agente</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que deseas actualizar la disponibilidad del agente.&nbsp;
						<span className="font-semibold capitalize">"{agent.secondName}"</span>
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose asChild>
						<Button>Cancelar</Button>
					</DialogClose>
					<Button
						variant="secondary"
						onClick={() => agentDeletion.mutate()}
						disabled={agentDeletion.isPending}
					>
						{agentDeletion.isPending ? (
							<>
								<Spinner />
								<span className="ml-2">Actualizando...</span>
							</>
						) : (
							<span>Actualizar</span>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
