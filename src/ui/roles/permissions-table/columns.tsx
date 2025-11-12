import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/ui/shared/data-table/column-header";
import { Label } from "@/ui/shared/label";
import { Switch } from "@/ui/shared/switch";

export const columns: ColumnDef<Permission>[] = [
	{
		accessorKey: "action",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Acción" />
		),
	},
	{
		accessorKey: "module",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Módulo" />
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
		accessorKey: "assigned",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Asignado" />
		),
		cell: ({ row }) => {
			return (
				<Label htmlFor="airplane-mode">
					<Switch id="airplane-mode" checked={row.original.assigned} />
					{row.original.assigned ? "Asignado" : "No asignado"}
				</Label>
			);
		},
	},
	// {
	// 	id: "actions",
	// 	// cell: ({ row }) => <RoleTableActions role={row.original} />,
	// },
];
