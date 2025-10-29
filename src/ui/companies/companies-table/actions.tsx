import { useState } from "react";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

import { CompanyDelete } from "@/ui/companies/company-delete";
import { CompanyUpdate } from "@/ui/companies/company-update";
import { Button } from "@/ui/shared/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/ui/shared/dropdown-menu";

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
