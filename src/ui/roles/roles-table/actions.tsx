import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Pencil, Trash } from "lucide-react";

import { Button, buttonVariants } from "@/ui/shared/button";
import { RoleDelete } from "../role-delete";
import { RoleUpdate } from "../role-update";

export function RoleTableActions({ role }: { role: Role }) {
	const [openUpdate, setOpenRoleUpdate] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);

	return (
		<>
			<div className="flex items-center justify-end gap-2">
				<Button size="icon" onClick={() => setOpenRoleUpdate(true)}>
					<Pencil />
				</Button>

				<Button size="icon" variant="destructive" onClick={() => setOpenDelete(true)}>
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
			</div>

			<RoleUpdate role={role} open={openUpdate} onOpenChange={setOpenRoleUpdate} />
			<RoleDelete role={role} open={openDelete} onOpenChange={setOpenDelete} />
		</>
	);
}
