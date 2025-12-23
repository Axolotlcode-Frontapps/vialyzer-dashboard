import { useMemo } from "react";
import { usePermissions } from "@/contexts/permissions";

import type { ColumnDef } from "@tanstack/react-table";
import type { Agent } from "@/types/agents";

import { hasAnyMultiplePermissions } from "@/lib/utils/permissions";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/shared/avatar";
import { Badge } from "@/ui/shared/badge";
import { DataTableColumnHeader } from "@/ui/shared/data-table/column-header";
import { AgentTableActions } from "./actions";

export const useAgentsColumns = () => {
	const { user } = usePermissions();

	const columns = useMemo(() => {
		return [
			{
				accessorKey: "userImage",
				enableSorting: false,
				header: ({ column }) => <DataTableColumnHeader column={column} title="Avatar" />,
				cell: ({ row }) => (
					<div className="inline-block w-[32px]">
						<Avatar>
							<AvatarImage src={row.original.userImage} alt={row.original.secondName} />
							<AvatarFallback className="uppercase">
								{row.original.secondName.charAt(0)}
							</AvatarFallback>
						</Avatar>
					</div>
				),
			},
			{
				accessorKey: "user.name",
				header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
				cell: ({ row }) => <span className="capitalize">{row.original.user?.name}</span>,
			},
			{
				accessorKey: "secondName",
				header: ({ column }) => <DataTableColumnHeader column={column} title="Segundo Nombre" />,
				cell: ({ row }) => <span className="capitalize">{row.original.secondName}</span>,
			},
			{
				accessorKey: "user.lastname",
				header: ({ column }) => <DataTableColumnHeader column={column} title="Apellido" />,
				cell: ({ row }) => <span className="capitalize">{row.original.user?.lastname}</span>,
			},
			{
				accessorKey: "user.email",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Correo Electrónico" />
				),
				cell: ({ row }) => <span className="capitalize">{row.original.user?.email}</span>,
			},
			{
				accessorKey: "identification",
				header: ({ column }) => <DataTableColumnHeader column={column} title="Identificación" />,
			},
			{
				accessorKey: "plaque",
				header: ({ column }) => <DataTableColumnHeader column={column} title="Placa" />,
			},
			{
				accessorKey: "availability",
				header: ({ column }) => <DataTableColumnHeader column={column} title="Disponibilidad" />,
				cell: ({ row }) => (
					<Badge variant={row.getValue("availability") ? "secondary" : "destructive"}>
						{row.getValue("availability") ? "Disponible" : "No Disponible"}
					</Badge>
				),
			},
			...((!hasAnyMultiplePermissions("agents", ["update", "delete", "availability"], user!)
				? []
				: [
						{
							id: "actions",
							cell: ({ row }) => <AgentTableActions agent={row.original} />,
						},
					]) satisfies ColumnDef<Agent>[]),
		] satisfies ColumnDef<Agent>[];
	}, [user]);

	return columns;
};
