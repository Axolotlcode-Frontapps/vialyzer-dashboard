import {
	createFileRoute,
	Outlet,
	redirect,
	useParams,
} from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { rolesService } from "@/lib/services/roles";
import { ModuleAction } from "@/ui/roles/module-action";
import { ModuleAssign } from "@/ui/roles/module-assign";
import { Button } from "@/ui/shared/button";
import { Tabs, TabsList } from "@/ui/shared/tabs";

export const Route = createFileRoute(
	"/_dashboard/settings/roles/$roleId/_roleLayout"
)({
	component: Permissions,
	beforeLoad: async ({ context: { queryClient }, params }) => {
		const { roleId, _splat } = params as { roleId: string; _splat?: string };

		const { payload } = await queryClient.ensureQueryData({
			queryKey: ["role-by-id", roleId],
			queryFn: async () => await rolesService.getRoleById(roleId),
		});

		if (payload?.modules?.length && payload.modules.length > 0 && !_splat) {
			throw redirect({
				to: "/settings/roles/$roleId/$",
				params: {
					roleId: params.roleId,
					_splat: payload.modules[0].id,
				},
			});
		}
	},
});

function Permissions() {
	const [openAdd, setOpenAdd] = useState(false);
	const { _splat: moduleId, roleId } = useParams({
		from: "/_dashboard/settings/roles/$roleId/_roleLayout/$",
	});

	const { data: roleData } = useSuspenseQuery({
		queryKey: ["role-by-id", roleId],
		queryFn: async () => await rolesService.getRoleById(roleId),
		select: (data) => data.payload,
	});

	return (
		<>
			<Tabs
				defaultValue={
					moduleId ?? (roleData?.modules ? roleData.modules[0].id : "")
				}
				className="mb-4"
			>
				<TabsList>
					{roleData?.modules?.map((module) => (
						<ModuleAction key={module.id} module={module} name={module.name} />
					))}
					<Button
						variant="secondary"
						size="icon-sm"
						onClick={() => setOpenAdd(true)}
					>
						<Plus />
					</Button>
				</TabsList>
			</Tabs>

			<Outlet />

			<ModuleAssign open={openAdd} onOpenChange={setOpenAdd} />
		</>
	);
}
