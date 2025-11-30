import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-adapter";

import { sharedSchemas } from "@/lib/schemas/shared";
import { modulesServices } from "@/lib/services/modules";
import { ModuleAdd } from "@/ui/settings/modules/module-add";
import { columns } from "@/ui/settings/modules/modules-table/columns";
import { Button } from "@/ui/shared/button";
import { DataTable } from "@/ui/shared/data-table";
import { DataTableHeader } from "@/ui/shared/data-table/table-header";
import { HasPermission } from "@/ui/shared/permissions/has-permission";

export const Route = createFileRoute("/_dashboard/settings/modules/")({
	component: Modules,
	validateSearch: zodValidator(sharedSchemas.genericTableSearchSchema),
});

function Modules() {
	const [openAdd, setOpenAdd] = useState(false);

	const { data: modules = [], isLoading } = useQuery({
		queryKey: ["modules"],
		queryFn: async () => await modulesServices.getAllModules(),
		select: (data) => data.payload,
	});

	return (
		<>
			<div className="space-y-4 @container/page container mx-auto">
				<div className="flex items-center justify-between gap-4 mb-4">
					<h2 className="text-xl lg:text-2xl font-medium">Módulos</h2>
					<HasPermission moduleBase="cat-modules" permissionName="create">
						<Button type="button" onClick={() => setOpenAdd(true)}>
							Agregar Módulo
						</Button>
					</HasPermission>
				</div>

				<DataTable
					columns={columns}
					data={modules}
					isLoading={isLoading}
					totalRows={modules.length}
				>
					{({ table }) => (
						<DataTableHeader
							table={table}
							searchBy="name"
							searchPlaceholder="Busqueda por nombre..."
							hasSearchUrl
						/>
					)}
				</DataTable>
			</div>

			<HasPermission moduleBase="cat-modules" permissionName="create">
				<ModuleAdd open={openAdd} onOpenChange={setOpenAdd} />
			</HasPermission>
		</>
	);
}
