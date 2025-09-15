import { useState } from "react";
import { Pencil, Trash } from "lucide-react";

import { Button } from "@/ui/shared/button";
import { UserDelete } from "../user-delete";
import { UserUpdate } from "../user-update";

export function UserTableActions({ user }: { user: User }) {
	const [openUpdate, setOpenUpdate] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);

	return (
		<>
			<div className="flex items-center justify-end gap-2">
				<Button onClick={() => setOpenUpdate(true)} size="icon">
					<Pencil />
				</Button>
				<Button
					size="icon"
					variant="destructive"
					onClick={() => setOpenDelete(true)}
				>
					<Trash />
				</Button>
			</div>
			<UserUpdate user={user} open={openUpdate} onOpenChange={setOpenUpdate} />
			<UserDelete user={user} open={openDelete} onOpenChange={setOpenDelete} />
		</>
	);
}
