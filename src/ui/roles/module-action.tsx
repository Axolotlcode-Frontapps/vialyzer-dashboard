import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

import { Button } from "../shared/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../shared/dropdown-menu";
import { TabsTrigger } from "../shared/tabs";
import { ModuleDelete } from "./module-delete";
import { ModuleEdit } from "./module-edit";

export function ModuleAction({
	module,
	name,
}: {
	module: Module;
	name: string;
}) {
	const { roleId } = useParams({
		from: "/_dashboard/settings/roles/$roleId/_roleLayout/$",
	});

	const [openOptions, setOpenOptions] = useState(false);
	const [openModuleEdit, setOpenModuleEdit] = useState(false);
	const [openModuleDelete, setOpenModuleDelete] = useState(false);

	return (
		<>
			<TabsTrigger
				value={module.id}
				className="capitalize"
				asChild
				key={module.id}
			>
				<Link
					to="/settings/roles/$roleId/$"
					params={{ roleId, _splat: module.id }}
				>
					<span>{name}</span>
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
							<DropdownMenuItem
								variant="destructive"
								onClick={() => setOpenModuleDelete(true)}
							>
								<Trash />
								Eliminar
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</Link>
			</TabsTrigger>

			<ModuleEdit
				open={openModuleEdit}
				onOpenChange={setOpenModuleEdit}
				module={module}
			/>

			<ModuleDelete
				open={openModuleDelete}
				onOpenChange={setOpenModuleDelete}
				moduleId={module.id}
			/>
		</>
	);
}
