import { Activity, useState } from "react";
import {
	CheckCircle,
	MoreHorizontal,
	Pencil,
	ShieldMinus,
	Trash,
} from "lucide-react";

import { Button } from "@/ui/shared/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/ui/shared/dropdown-menu";
import { ModuleDelete } from "../module-delete";
import { ModuleEdit } from "../module-edit";

export function ModuleAction({ module }: { module: Module }) {
	const [openOptions, setOpenOptions] = useState(false);
	const [openModuleEdit, setOpenModuleEdit] = useState(false);
	const [openModuleDelete, setOpenModuleDelete] = useState(false);

	return (
		<>
			<DropdownMenu open={openOptions} onOpenChange={setOpenOptions}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="h-8 w-8 p-0"
						onClick={(e) => {
							e.preventDefault();
							setOpenOptions((prev) => !prev);
						}}
					>
						<span className="sr-only">Abrir menu</span>
						<MoreHorizontal />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem onClick={() => setOpenModuleEdit(true)}>
						<Pencil />
						Editar
					</DropdownMenuItem>
					<Activity mode={module.active ? "hidden" : "visible"}>
						<DropdownMenuItem onClick={() => setOpenModuleEdit(true)}>
							<CheckCircle />
							Activar
						</DropdownMenuItem>
					</Activity>

					<DropdownMenuItem
						variant="destructive"
						onClick={() => setOpenModuleDelete(true)}
					>
						<Activity mode={module.active ? "visible" : "hidden"}>
							<ShieldMinus />
							Desactivar
						</Activity>
						<Activity mode={!module.active ? "visible" : "hidden"}>
							<Trash />
							Eliminar
						</Activity>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<ModuleEdit
				open={openModuleEdit}
				onOpenChange={setOpenModuleEdit}
				module={module}
			/>

			<ModuleDelete
				open={openModuleDelete}
				onOpenChange={setOpenModuleDelete}
				module={module}
			/>
		</>
	);
}
