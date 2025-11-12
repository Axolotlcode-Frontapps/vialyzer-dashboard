import { useMemo, useState } from "react";

import type { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/ui/shared/checkbox";
import { DataTableColumnHeader } from "@/ui/shared/data-table/column-header";
import { AssignPermission } from "./assign-permission";

export const useColumns = () => {
	const [selectedPermissionsIds, setSelectedPermissionsIds] = useState<
		{
			id: string;
			assigned: boolean;
		}[]
	>([]);

	const columns = useMemo<ColumnDef<Permission>[]>(
		() => [
			{
				id: "select",
				header: ({ table }) => (
					<Checkbox
						checked={
							selectedPermissionsIds.length === table.getRowModel().rows.length
								? true
								: selectedPermissionsIds.length > 0
									? "indeterminate"
									: false
						}
						onCheckedChange={(value) => {
							const allIds = table.getRowModel().rows;

							if (value) {
								setSelectedPermissionsIds(
									allIds.map((row) => ({
										id: row.original.id,
										assigned: row.original.assigned ?? false,
									}))
								);
							} else {
								setSelectedPermissionsIds([]);
							}
						}}
						aria-label="Seleccionar todo"
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						checked={selectedPermissionsIds.some(
							(selected) => selected.id === row.original.id
						)}
						onCheckedChange={(value) => {
							const id = row.original.id;
							if (value) {
								setSelectedPermissionsIds([
									...selectedPermissionsIds,
									{ id, assigned: row.original.assigned ?? false },
								]);
							} else {
								setSelectedPermissionsIds(
									selectedPermissionsIds.filter(
										(selected) => selected.id !== id
									)
								);
							}
						}}
						// --- IGNORE ---
						// checked={selectedPermissionsIds.includes(row.original.id)}
						// onCheckedChange={(value) => {
						// 	const id = row.original.id;
						// 	if (value) {
						// 		setSelectedPermissionsIds([...selectedPermissionsIds, id]);
						// 	} else {
						// 		setSelectedPermissionsIds(
						// 			selectedPermissionsIds.filter(
						// 				(selectedId) => selectedId !== id
						// 			)
						// 		);
						// 	}
						// }}
						aria-label="Seleccionar fila"
					/>
				),
			},
			{
				accessorKey: "action",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Acción" />
				),
				cell: ({ row }) => (
					<span className="inline-block w-[200px]">{row.original.action}</span>
				),
			},
			{
				accessorKey: "module",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Módulo" />
				),
				cell: ({ row }) => (
					<span className="inline-block w-[200px]">{row.original.module}</span>
				),
			},
			{
				accessorKey: "active",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Activo" />
				),
				cell: ({ row }) => (
					<span className="inline-block w-[100px]">
						{row.original.active ? "Sí" : "No"}
					</span>
				),
			},
			{
				accessorKey: "assigned",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Asignado" />
				),
				cell: ({ row }) => <AssignPermission permission={row.original} />,
			},
		],
		[
			selectedPermissionsIds.length,
			selectedPermissionsIds.filter,
			selectedPermissionsIds,
		]
	);

	return { columns, selectedPermissionsIds, setSelectedPermissionsIds };
};
