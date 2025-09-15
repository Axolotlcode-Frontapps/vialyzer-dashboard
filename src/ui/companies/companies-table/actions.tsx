import { useState } from "react";
import { Pencil, Trash } from "lucide-react";

import { CompanyDelete } from "@/ui/companies/company-delete";
import { CompanyUpdate } from "@/ui/companies/company-update";
import { Button } from "@/ui/shared/button";

export function CompanyTableActions({ company }: { company: Company }) {
	const [openUpdate, setOpenUpdate] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);

	return (
		<>
			<div className="flex items-center justify-end gap-2">
				<Button size="icon" onClick={() => setOpenUpdate(true)}>
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
			<CompanyUpdate
				open={openUpdate}
				onOpenChange={setOpenUpdate}
				company={company}
			/>
			<CompanyDelete
				open={openDelete}
				onOpenChange={setOpenDelete}
				company={company}
			/>
		</>
	);
}
