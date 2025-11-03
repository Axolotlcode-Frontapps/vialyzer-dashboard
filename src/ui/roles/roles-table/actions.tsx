import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CirclePlus, MoreHorizontal, Pencil, Trash } from "lucide-react";

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
					<DropdownMenuItem asChild>
						<Link
							to={`/settings/roles/$roleId`}
							params={{ roleId: role.id }}
							className="capitalize hover:bg-accent transition-colors p-2 rounded-md block"
						>
							<CirclePlus />
							Asignar permisos
						</Link>
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

			{/* <div className="flex items-center justify-end gap-2">
				<Button size="icon" onClick={() => setOpenRoleUpdate(true)}>
					<Pencil />
				</Button>

				<Button
					size="icon"
					variant="destructive"
					onClick={() => setOpenDelete(true)}
				>
					<Trash />
				</Button>

				<Link
					to="/settings/roles/$roleId"
					params={{ roleId: role.id }}
					className={buttonVariants({
						variant: "secondary",
					})}
				>
					<KeyRound />
					Editar permisos
				</Link>
			</div> */}

			<RoleUpdate role={role} open={openUpdate} onOpenChange={setOpenUpdate} />
			<RoleDelete role={role} open={openDelete} onOpenChange={setOpenDelete} />
		</>
	);
}
