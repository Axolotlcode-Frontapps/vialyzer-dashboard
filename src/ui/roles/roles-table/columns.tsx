import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/ui/shared/badge";
import { DataTableColumnHeader } from "@/ui/shared/data-table/column-header";
import { RoleTableActions } from "./actions";

export const columns: ColumnDef<Role>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Nombre" />
		),
		cell: ({ row }) => (
			<span className="capitalize">{row.getValue("name")}</span>
		),
	},
	{
		accessorKey: "description",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Descripción" />
		),
	},
	{
		accessorKey: "modules",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Módulos" />
		),
		cell: ({ row }) => (
			<Badge variant="secondary" className="capitalize">
				{row.original.modules.length} Módulos
			</Badge>
		),
	},
	{
		accessorKey: "permissions",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Permisos" />
		),
		cell: ({ row }) => (
			<Badge variant="secondary" className="capitalize">
				{row.original.permissions.length} Permisos
			</Badge>
		),
	},
	{
		id: "actions",
		cell: ({ row }) => <RoleTableActions role={row.original} />,
	},
];
