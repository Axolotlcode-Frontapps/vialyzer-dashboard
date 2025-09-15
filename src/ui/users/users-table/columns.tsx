import type { ColumnDef } from "@tanstack/react-table";

import { formatDate } from "@/lib/utils/date-format";
import { Badge } from "@/ui/shared/badge";
import { DataTableColumnHeader } from "@/ui/shared/data-table/column-header";
import { UserTableActions } from "./actions";

export const columns: ColumnDef<User>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
		cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
	},
	{
		accessorKey: "lastName",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Apellidos" />,
	},
	{
		accessorKey: "email",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
	},
	{
		accessorKey: "phone",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
		cell: ({ row }) => <div className="capitalize">{row.getValue("phone") || "-"}</div>,
	},
	{
		accessorKey: "role",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Rol" />,
		cell: ({ row }) => <Badge className="capitalize">{row.original.role.name}</Badge>,
	},
	{
		accessorKey: "companie",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Empresa" />,
		cell: ({ row }) => <span className="capitalize">{row.original.companie.name}</span>,
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de creación" />,
		cell: ({ row }) => <span className="capitalize">{formatDate(row.getValue("createdAt"))}</span>,
	},
	{
		accessorKey: "lastLogin",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Fecha de último acceso" />
		),
		cell: ({ row }) => <span className="capitalize">{formatDate(row.getValue("lastLogin"))}</span>,
	},
	{
		accessorKey: "active",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Activo" />,
		cell: ({ row }) => <Badge variant="secondary">{row.getValue("active") ? "Sí" : "No"}</Badge>,
	},
	{
		id: "actions",
		cell: ({ row }) => <UserTableActions user={row.original} />,
	},
];
