import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { modulesServices } from "@/lib/services/modules";
import { Label } from "@/ui/shared/label";
import { Spinner } from "@/ui/shared/spinner";
import { Switch } from "@/ui/shared/switch";

export function AssignPermission({ permission }: { permission: Permission }) {
	const queryClient = useQueryClient();
	const { _splat: moduleId } = useParams({
		from: "/_dashboard/settings/roles/$roleId/_roleLayout/$",
	});

	const { data: permissionsData } = useQuery({
		queryKey: ["module-by-id", moduleId],
		queryFn: async () => await modulesServices.getModuleById(moduleId!),
		select: (data) => data.payload?.permissions,
	});

	const permissionsIds = useMemo(() => {
		return permissionsData?.map((perm) => perm.id);
	}, [permissionsData]);

	const updatePermissionsMutation = useMutation({
		mutationFn: async (permissionsId: string[]) =>
			await modulesServices.assignPermissions(moduleId!, {
				permissionsIds: permissionsId,
			}),
		onSuccess: () => {
			toast.success("Permiso actualizado correctamente");
			queryClient.invalidateQueries({ queryKey: ["module-by-id", moduleId] });
		},
		onError: () => {
			toast.error("Error al actualizar el permiso");
		},
	});

	const handleToggle = () => {
		if (permission.assigned) {
			const updatedPermissions = permissionsIds?.filter(
				(id) => id !== permission.id
			);
			updatePermissionsMutation.mutate(updatedPermissions || []);
		} else {
			updatePermissionsMutation.mutate([
				...(permissionsIds ?? []),
				permission.id,
			]);
		}
	};

	if (!moduleId) {
		return <span className="text-xs">No registrado</span>;
	}

	return (
		<Label
			htmlFor={`switch-${permission.id}`}
			className="flex items-center gap-2 w-[150px]"
		>
			<Switch
				id={`switch-${permission.id}`}
				checked={permission.assigned}
				onClick={handleToggle}
			/>
			{updatePermissionsMutation.isPending ? <Spinner /> : null}
			{permission.assigned ? "Asignado" : "No asignado"}
		</Label>
	);
}
