import type { ColumnDef } from "@tanstack/react-table";

import { formatDate } from "@/lib/utils/date-format";
import { Badge } from "@/ui/shared/badge";
import { DataTableColumnHeader } from "@/ui/shared/data-table/column-header";
import { CompanyTableActions } from "./actions";

export const columns: ColumnDef<Company>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
		cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
	},
	{
		accessorKey: "nit",
		header: ({ column }) => <DataTableColumnHeader column={column} title="NIT" />,
	},
	{
		accessorKey: "phone",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
		cell: ({ row }) => <div className="capitalize">{row.getValue("phone") || "-"}</div>,
	},
	{
		accessorKey: "address",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Dirección" />,
	},
	{
		accessorKey: "department",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Departamento" />,
	},
	{
		accessorKey: "city",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Ciudad" />,
	},
	{
		accessorKey: "active",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Activo" />,
		cell: ({ row }) => <Badge variant="secondary">{row.getValue("active") ? "Sí" : "No"}</Badge>,
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de creación" />,
		cell: ({ row }) => <span className="capitalize">{formatDate(row.getValue("createdAt"))}</span>,
	},
	{
		id: "actions",
		cell: ({ row }) => <CompanyTableActions company={row.original} />,
	},
];
