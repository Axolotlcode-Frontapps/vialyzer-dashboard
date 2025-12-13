import { useMemo } from "react";
import { isValid, parseISO } from "date-fns";
import { useHasPermission } from "@/hooks/use-permissions";

import type { ColumnDef } from "@tanstack/react-table";

import { formatDate } from "@/lib/utils/date-format";
import { Badge } from "@/ui/shared/badge";
import { DataTableColumnHeader } from "@/ui/shared/data-table/column-header";
import { UserTableActions } from "./actions";

export const useUsersColumns = () => {
	const { hasAnyMultiplePermissions } = useHasPermission();

	const columns = useMemo(() => {
		return [
			{
				accessorKey: "name",
				header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
				cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
			},
			{
				accessorKey: "lastname",
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
				sortingFn: (rowA, rowB) => {
					const roleA = rowA.original.role.name.toLowerCase();
					const roleB = rowB.original.role.name.toLowerCase();

					if (roleA < roleB) return -1;
					if (roleA > roleB) return 1;
					return 0;
				},
			},
			{
				accessorKey: "createdAt",
				header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de creación" />,
				cell: ({ row }) => (
					<span className="capitalize">{formatDate(row.getValue("createdAt"))}</span>
				),
				sortingFn: (rowA, rowB) => {
					const valueA = rowA.getValue("createdAt") as string | null | undefined;
					const valueB = rowB.getValue("createdAt") as string | null | undefined;

					if (!valueA && !valueB) return 0;
					if (!valueA) return 1;
					if (!valueB) return -1;

					const dateA = parseISO(valueA);
					const dateB = parseISO(valueB);

					if (!isValid(dateA) && !isValid(dateB)) return 0;
					if (!isValid(dateA)) return 1;
					if (!isValid(dateB)) return -1;

					return dateA.getTime() - dateB.getTime();
				},
			},
			{
				accessorKey: "lastLogin",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Fecha de último acceso" />
				),
				cell: ({ row }) => (
					<span className="capitalize">{formatDate(row.getValue("lastLogin"))}</span>
				),
				sortingFn: (rowA, rowB) => {
					const valueA = rowA.getValue("lastLogin") as string | null | undefined;
					const valueB = rowB.getValue("lastLogin") as string | null | undefined;

					if (!valueA && !valueB) return 0;
					if (!valueA) return 1;
					if (!valueB) return -1;

					const dateA = parseISO(valueA);
					const dateB = parseISO(valueB);

					// Verificar que las fechas sean válidas
					if (!isValid(dateA) && !isValid(dateB)) return 0;
					if (!isValid(dateA)) return 1;
					if (!isValid(dateB)) return -1;

					return dateA.getTime() - dateB.getTime();
				},
			},
			{
				accessorKey: "active",
				header: ({ column }) => <DataTableColumnHeader column={column} title="Activo" />,
				cell: ({ row }) => (
					<Badge variant="secondary">{row.getValue("active") ? "Sí" : "No"}</Badge>
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
