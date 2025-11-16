import { createFileRoute, useParams } from "@tanstack/react-router";
import { Activity } from "react";
import { useQuery } from "@tanstack/react-query";

import { modulesServices } from "@/lib/services/modules";
import { PermissionsTable } from "@/ui/modules/permissions-table";
import { Skeleton } from "@/ui/shared/skeleton";

export const Route = createFileRoute("/_dashboard/settings/modules/$moduleId")({
	component: ModulePermisions,
});

function ModulePermisions() {
	const { moduleId } = useParams({
		from: "/_dashboard/settings/modules/$moduleId",
	});

	const {
		data: moduleData,
		isLoading: isLoadingModule,
		isPending,
	} = useQuery({
		queryKey: ["module-by-id", moduleId],
		enabled: !!moduleId,
		queryFn: async () => await modulesServices.getModuleById(moduleId!),
		select: (data) => data.payload,
	});

	return (
		<>
			<div className="flex items-center justify-between gap-4">
				<div>
					<h2 className="text-xl lg:text-2xl font-medium flex items-center">
						Permisos por módulo:
						<Activity mode={isLoadingModule ? "hidden" : "visible"}>
							<span className="capitalize ml-1.5">{moduleData?.name}</span>
						</Activity>
						<Activity mode={!isLoadingModule ? "hidden" : "visible"}>
							<Skeleton className="h-7 w-48 inline-block ml-1.5" />
						</Activity>
					</h2>
					<p className="flex items-center gap-2">
						Total de permisos asignados:
						<Activity mode={isLoadingModule ? "hidden" : "visible"}>
							<span className="ml-1">{moduleData?.permissions.length}</span>
						</Activity>
						<Activity mode={!isLoadingModule ? "hidden" : "visible"}>
							<Skeleton className="h-6 w-10 inline-block ml-1.5" />
						</Activity>
					</p>
				</div>
			</div>

			<PermissionsTable
				moduleData={moduleData!}
				isLoadingModule={isLoadingModule || isPending}
			/>
		</>
	);
}
