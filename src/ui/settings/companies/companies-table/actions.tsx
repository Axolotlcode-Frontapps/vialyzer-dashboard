import { useState } from "react";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

import { CompanyDelete } from "@/ui/settings/companies/company-delete";
import { CompanyUpdate } from "@/ui/settings/companies/company-update";
import { Button } from "@/ui/shared/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/ui/shared/dropdown-menu";
import { HasPermission } from "@/ui/shared/permissions/has-permission";

export function CompanyTableActions({ company }: { company: Company }) {
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
					<HasPermission moduleBase="companies" permissionName="update">
						<DropdownMenuItem onClick={() => setOpenUpdate(true)}>
							<Pencil className="mr-2 h-4 w-4" />
							Editar
						</DropdownMenuItem>
					</HasPermission>
					<HasPermission moduleBase="companies" permissionName="delete">
						<DropdownMenuItem variant="destructive" onClick={() => setOpenDelete(true)}>
							<Trash className="mr-2 h-4 w-4" />
							Eliminar
						</DropdownMenuItem>
					</HasPermission>
				</DropdownMenuContent>
			</DropdownMenu>

			<HasPermission moduleBase="companies" permissionName="update">
				<CompanyUpdate open={openUpdate} onOpenChange={setOpenUpdate} company={company} />
			</HasPermission>
			<HasPermission moduleBase="companies" permissionName="delete">
				<CompanyDelete open={openDelete} onOpenChange={setOpenDelete} company={company} />
			</HasPermission>
		</>
	);
}
