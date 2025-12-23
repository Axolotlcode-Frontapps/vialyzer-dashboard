import { useState } from "react";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

import type { Agent } from "@/types/agents";

import { Button } from "@/ui/shared/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/ui/shared/dropdown-menu";
import { HasPermission } from "@/ui/shared/permissions/has-permission";
import { AgentDelete } from "../agent-delete";
import { AgentUpdate } from "../agent-update";

export function AgentTableActions({ agent }: { agent: Agent }) {
	const [openUpdate, setOpenUpdate] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Abrir menu</span>
						<MoreHorizontal />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<HasPermission permissionName="update" moduleBase="agents">
						<DropdownMenuItem onClick={() => setOpenUpdate(true)}>
							<Pencil />
							Editar
						</DropdownMenuItem>
					</HasPermission>

					{/* <HasPermission permissionName="availability" moduleBase="agents">
						<DropdownMenuItem onClick={() => setOpenAvailable(true)}>
							<ArrowUpDown />
							Actualizar disponibilidad
						</DropdownMenuItem>
					</HasPermission> */}

					<HasPermission permissionName="delete" moduleBase="agents">
						<DropdownMenuItem variant="destructive" onClick={() => setOpenDelete(true)}>
							<Trash />
							Eliminar
						</DropdownMenuItem>
					</HasPermission>
				</DropdownMenuContent>
			</DropdownMenu>

			<HasPermission permissionName="update" moduleBase="agents">
				<AgentUpdate open={openUpdate} onOpenChange={setOpenUpdate} agent={agent} />
			</HasPermission>

			<HasPermission permissionName="delete" moduleBase="agents">
				<AgentDelete open={openDelete} onOpenChange={setOpenDelete} agent={agent} />
			</HasPermission>

			{/* <HasPermission permissionName="availability" moduleBase="agents">
				<AgentAvailable open={openAvailable} onOpenChange={setOpenAvailable} agent={agent} />
			</HasPermission> */}
		</>
	);
}
