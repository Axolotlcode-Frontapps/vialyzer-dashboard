import { Link } from "@tanstack/react-router";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/ui/shared/data-table/column-header";
import { ModuleAction } from "./actions";

export const columns: ColumnDef<Module>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Módulo" />
		),
		cell: ({ row }) => (
			<Link
				to="/settings/modules/$moduleId"
				params={{ moduleId: row.original.id }}
				className="capitalize inline-block w-full hover:bg-accent-foreground/5 transition-colors duration-300 px-1 py-0.5"
			>
				{row.original.name}
			</Link>
		),
	},
	{
		accessorKey: "description",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Descripción" />
		),
		cell: ({ row }) => <span>{row.original.description}</span>,
	},
	{
		accessorKey: "active",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Activo" />
		),
		cell: ({ row }) => <span>{row.original.active ? "Sí" : "No"}</span>,
	},
	{
		accessorKey: "permissions",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Permisos" />
		),
		cell: ({ row }) => <span>{(row.original.permissions ?? []).length}</span>,
	},
	{
		id: "actions",
		cell: ({ row }) => <ModuleAction module={row.original} />,
	},
];
