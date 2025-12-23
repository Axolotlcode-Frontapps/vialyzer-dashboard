import type { Agent } from "@/types/agents";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/ui/shared/sheet";
import { AgentForm } from "./agent-form";

export function AgentUpdate({
	agent,
	open,
	onOpenChange,
}: {
	agent: Agent;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:min-w-[600px]">
				<SheetHeader>
					<SheetTitle>Actualizar usuario</SheetTitle>
					<SheetDescription>
						Vas a actualizar un usuario existente. Completa la información necesaria y guarda para
						aplicar los cambios.
					</SheetDescription>
				</SheetHeader>

				<AgentForm update agent={agent} onSuccess={onOpenChange} />
			</SheetContent>
		</Sheet>
	);
}
