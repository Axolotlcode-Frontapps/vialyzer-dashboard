import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useCameras } from "@/hooks/use-cameras";

import { hasModule } from "@/lib/utils/permissions";
import { Camera } from "@/ui/settings/camera";
import { buttonVariants } from "@/ui/shared/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shared/tooltip";

export const Route = createFileRoute("/_dashboard/settings/cameras/$camera")({
	component: ConfigCamera,
	beforeLoad: async ({
		context: {
			permissions: { user },
		},
	}) => {
		if (!user) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}

		const hasRoleModule = hasModule("configuracion-camaras", user);

		if (!hasRoleModule) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}
	},
});

function ConfigCamera() {
	const { camera } = Route.useParams();
	const { cameras } = useCameras();

	const currectCamera = cameras.find((cam) => cam.id === camera);

	return (
		<section className="@container/page container mx-auto">
			<h1 className="mb-6 flex items-center gap-4 text-2xl font-semibold">
				<Tooltip>
					<TooltipTrigger asChild>
						<Link
							to="/settings/cameras"
							className={buttonVariants({
								variant: "secondary",
								size: "icon",
							})}
						>
							<ChevronLeft className="size-5" />
						</Link>
					</TooltipTrigger>
					<TooltipContent>Regresar a configuración</TooltipContent>
				</Tooltip>
				Camara: {currectCamera?.name}
			</h1>
			<Camera />
		</section>
	);
}
