import { useState } from "react";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

import { Button } from "@/ui/shared/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/ui/shared/dropdown-menu";
import { UserDelete } from "../user-delete";
import { UserUpdate } from "../user-update";

export function UserTableActions({ user }: { user: User }) {
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
					<DropdownMenuItem onClick={() => setOpenUpdate(true)}>
						<Pencil className="mr-2 h-4 w-4" />
						Editar
					</DropdownMenuItem>
					<DropdownMenuItem
						variant="destructive"
						onClick={() => setOpenDelete(true)}
					>
						<Trash className="mr-2 h-4 w-4" />
						Eliminar
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<UserUpdate open={openUpdate} onOpenChange={setOpenUpdate} user={user} />

			<UserDelete open={openDelete} onOpenChange={setOpenDelete} user={user} />
		</>
	);
}
