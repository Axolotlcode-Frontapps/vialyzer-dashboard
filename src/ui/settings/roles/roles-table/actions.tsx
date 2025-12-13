import { useState } from "react";
import { CirclePlus, MoreHorizontal, Pencil, Trash } from "lucide-react";

import { Button } from "@/ui/shared/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/ui/shared/dropdown-menu";
import { HasPermission } from "@/ui/shared/permissions/has-permission";
import { ModuleAssign } from "../../modules/module-assign";
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
					<HasPermission moduleBase="roles" permissionName="associate-modules">
						<DropdownMenuItem onClick={() => setOpenAssign(true)}>
							<CirclePlus />
							Editar módulos
						</DropdownMenuItem>
					</HasPermission>
					<HasPermission moduleBase="roles" permissionName="update">
						<DropdownMenuItem onClick={() => setOpenUpdate(true)}>
							<Pencil />
							Editar
						</DropdownMenuItem>
					</HasPermission>
					<HasPermission moduleBase="roles" permissionName="delete">
						<DropdownMenuItem variant="destructive" onClick={() => setOpenDelete(true)}>
							<Trash />
							Eliminar
						</DropdownMenuItem>
					</HasPermission>
				</DropdownMenuContent>
			</DropdownMenu>

			<HasPermission moduleBase="roles" permissionName="associate-modules">
				<ModuleAssign role={role} open={openAssign} onOpenChange={setOpenAssign} />
			</HasPermission>
			<HasPermission moduleBase="roles" permissionName="update">
				<RoleUpdate role={role} open={openUpdate} onOpenChange={setOpenUpdate} />
			</HasPermission>
			<HasPermission moduleBase="roles" permissionName="delete">
				<RoleDelete role={role} open={openDelete} onOpenChange={setOpenDelete} />
			</HasPermission>
		</>
	);
}
