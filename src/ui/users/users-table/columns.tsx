import { useMemo } from "react";
import { useHasPermission } from "@/hooks/use-permissions";

import type { ColumnDef } from "@tanstack/react-table";

import { formatDate } from "@/lib/utils/date-format";
import { Badge } from "@/ui/shared/badge";
import { DataTableColumnHeader } from "@/ui/shared/data-table/column-header";
import { UserTableActions } from "./actions";

export const useUsersColumns = () => {
	const { hasAnyMultiplePermissions } = useHasPermission();

	console.log(hasAnyMultiplePermissions("users", ["delete", "update-user"]));

	const columns = useMemo(() => {
		return [
			{
				accessorKey: "name",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Nombre" />
				),
				cell: ({ row }) => (
					<div className="capitalize">{row.getValue("name")}</div>
				),
			},
			{
				accessorKey: "lastName",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Apellidos" />
				),
			},
			{
				accessorKey: "email",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Email" />
				),
			},
			{
				accessorKey: "phone",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Teléfono" />
				),
				cell: ({ row }) => (
					<div className="capitalize">{row.getValue("phone") || "-"}</div>
				),
			},
			{
				accessorKey: "role",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Rol" />
				),
				cell: ({ row }) => (
					<Badge className="capitalize">{row.original.role.name}</Badge>
				),
			},
			{
				accessorKey: "createdAt",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Fecha de creación" />
				),
				cell: ({ row }) => (
					<span className="capitalize">
						{formatDate(row.getValue("createdAt"))}
					</span>
				),
			},
			{
				accessorKey: "lastLogin",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title="Fecha de último acceso"
					/>
				),
				cell: ({ row }) => (
					<span className="capitalize">
						{formatDate(row.getValue("lastLogin"))}
					</span>
				),
			},
			{
				accessorKey: "active",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Activo" />
				),
				cell: ({ row }) => (
					<Badge variant="secondary">
						{row.getValue("active") ? "Sí" : "No"}
					</Badge>
				),
			},
			...((!hasAnyMultiplePermissions("users", ["update-user", "delete"])
				? []
				: [
						{
							id: "actions",
							cell: ({ row }) => <UserTableActions user={row.original} />,
						},
					]) satisfies ColumnDef<User>[]),
		];
	}, [hasAnyMultiplePermissions]) satisfies ColumnDef<User>[];

	return columns;
};
