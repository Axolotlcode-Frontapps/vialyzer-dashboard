import { useState } from "react";
import { CirclePlus, MoreHorizontal, Pencil, Trash } from "lucide-react";

import { ModuleAssign } from "@/ui/modules/module-assign";
import { Button } from "@/ui/shared/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/ui/shared/dropdown-menu";
import { RoleDelete } from "../role-delete";
import { RoleUpdate } from "../role-update";

export function RoleTableActions({ role }: { role: Role }) {
	const [openAssign, setOpenAssign] = useState(false);
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
					<DropdownMenuItem onClick={() => setOpenAssign(true)}>
						<CirclePlus />
						Asignar módulos
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setOpenUpdate(true)}>
						<Pencil />
						Editar
					</DropdownMenuItem>
					<DropdownMenuItem
						variant="destructive"
						onClick={() => setOpenDelete(true)}
					>
						<Trash />
						Eliminar
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<ModuleAssign
				role={role}
				open={openAssign}
				onOpenChange={setOpenAssign}
			/>
			<RoleUpdate role={role} open={openUpdate} onOpenChange={setOpenUpdate} />
			<RoleDelete role={role} open={openDelete} onOpenChange={setOpenDelete} />
		</>
	);
}
