import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ModuleAdd } from "@/ui/modules/module-add";
import { ModulesTable } from "@/ui/modules/modules-table";
import { Button } from "@/ui/shared/button";

export const Route = createFileRoute("/_dashboard/settings/modules/")({
	component: Modules,
});

function Modules() {
	const [openAdd, setOpenAdd] = useState(false);

	return (
		<>
			<div className="space-y-4">
				<div className="flex items-center justify-between gap-4">
					<h2 className="text-xl lg:text-2xl font-medium">Módulos</h2>
					<Button type="button" onClick={() => setOpenAdd(true)}>
						Agregar Módulo
					</Button>
				</div>

				<ModulesTable />
			</div>

			<ModuleAdd open={openAdd} onOpenChange={setOpenAdd} />
		</>
	);
}
