import type { ColumnDef } from "@tanstack/react-table";

import { actionsTranslate, modulesTranslate } from "@/lib/utils/translates";
import { DataTableColumnHeader } from "@/ui/shared/data-table/column-header";

export const columns: ColumnDef<Permission>[] = [
	{
		accessorKey: "action",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Acción" />
		),
		cell: ({ row }) => (
			<span>
				{actionsTranslate[row.original.action as keyof typeof actionsTranslate]}
			</span>
		),
	},
	{
		accessorKey: "module",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Módulo" />
		),
		cell: ({ row }) => (
			<span className="capitalize">
				{modulesTranslate[row.original.module as keyof typeof modulesTranslate]}
			</span>
		),
	},
	{
		accessorKey: "active",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Activo" />
		),
		cell: ({ row }) => <span>{row.original.active ? "Sí" : "No"}</span>,
	},
	{
		id: "actions",
		// cell: ({ row }) => <RoleTableActions role={row.original} />,
	},
];
