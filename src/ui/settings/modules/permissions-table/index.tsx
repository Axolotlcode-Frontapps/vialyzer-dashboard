import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Delete, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import type { AxiosError } from "axios";

import { modulesServices } from "@/lib/services/modules";
import { permissionsServices } from "@/lib/services/permissions";
import { Button } from "@/ui/shared/button";
import { DataTable } from "@/ui/shared/data-table";
import { DataTableHeader } from "@/ui/shared/data-table/table-header";
import { Spinner } from "@/ui/shared/spinner";
import { useColumns } from "./columns";

export function PermissionsTable({
	moduleData,
	isLoadingModule,
}: {
	moduleData: Module;
	isLoadingModule: boolean;
}) {
	const queryClient = useQueryClient();
	const { columns, selectedPermissionsIds, setSelectedPermissionsIds } =
		useColumns(moduleData);

	const { moduleId } = useParams({
		from: "/_dashboard/settings/modules/$moduleId",
	});

	const { data: permissions = [], isLoading: isLoadingPermissions } = useQuery({
		queryKey: ["permissions"],
		queryFn: async () => await permissionsServices.getAllPermissions(),
		select: (data) => data.payload,
	});

	const permissionswithAssigned = useMemo(() => {
		if (!moduleData) return permissions;

		return permissions.map((permission) => ({
			...permission,
			assigned: moduleData?.permissions.some(
				(modulePermission) => modulePermission.id === permission.id
			),
		}));
	}, [moduleData, permissions]);

	const action = useMemo(() => {
		return selectedPermissionsIds.length > 0
			? selectedPermissionsIds.some((perm) => !perm.assigned)
				? "Asignar"
				: "Remover"
			: "Asignar";
	}, [selectedPermissionsIds]);

	const updatePermissionsIds = useMemo(() => {
		const allPrevIds = moduleData?.permissions.map((perm) => perm.id) || [];
		const allCurrentIds = selectedPermissionsIds.map((perm) => perm.id);

		if (action === "Asignar") {
			const allIdsWithoutDuplicates = new Set([
				...allPrevIds,
				...allCurrentIds,
			]);

			return [...allIdsWithoutDuplicates.values()];
		}

		return allPrevIds.filter((id) => !allCurrentIds.includes(id));
	}, [selectedPermissionsIds, moduleData?.permissions, action]);

	const updatePermissionsMutation = useMutation({
		mutationFn: async () =>
			await modulesServices.assignPermissions(moduleId!, {
				permissionsIds: updatePermissionsIds,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["module-by-id", moduleId] });
			toast.success(
				`Permisos actualizados correctamente: ${selectedPermissionsIds.length}`
			);
			setSelectedPermissionsIds([]);
		},
		onError: (error: AxiosError) => {
			const message = (error.response?.data as GeneralResponse<unknown>)
				?.message;

			const capitalizedMessage =
				message &&
				message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();

			toast.error(`Error al crear módulo`, {
				description: capitalizedMessage ?? "Por favor, inténtalo de nuevo.",
			});
		},
	});

	return (
		<DataTable
			columns={columns}
			data={permissionswithAssigned}
			isLoading={isLoadingPermissions || isLoadingModule}
			totalRows={permissions.length}
		>
			{({ table }) => (
				<DataTableHeader
					table={table}
					searchBy="action"
					searchPlaceholder="Busqueda por acción..."
					hasSearchUrl
				>
					<Button
						disabled={
							selectedPermissionsIds.length === 0 ||
							updatePermissionsMutation.isPending
						}
						onClick={() => updatePermissionsMutation.mutate()}
					>
						{updatePermissionsMutation.isPending ? (
							<>
								<Spinner />
								<span>{`${action === "Asignar" ? "Asignando" : "Removiendo"} permisos...`}</span>
							</>
						) : (
							<>
								{action === "Asignar" ? <PlusCircle /> : <Delete />}
								<span>{`${action} permisos`}</span>
							</>
						)}
					</Button>
				</DataTableHeader>
			)}
		</DataTable>
	);
}
