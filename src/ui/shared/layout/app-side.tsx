import {
	Camera,
	FileChartColumnIncreasing,
	FileChartLine,
	House,
	Megaphone,
	Package,
	Settings,
	Shield,
	User,
	Video,
} from "lucide-react";
import { useHasModule } from "@/hooks/use-permissions";

import type { INavSection } from "./types";

import Logo from "@/assets/icons/logo.svg";
import { cn } from "@/lib/utils/cn";
import { config } from "@/lib/utils/config";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "../sidebar";
import { NavSection } from "./nav-section";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { open } = useSidebar();
	const { hasModule } = useHasModule();

	const principalMenu: INavSection = {
		group: "Principal",
		items: [
			{
				icon: House,
				title: "Dashboard",
				to: "/",
			},
		],
	};

	const metricsMenu: INavSection = {
		group: "Métricas",
		items: [
			{
				title: "Movilidad",
				icon: Video,
				defaultOpen: true,
				items: [
					{
						icon: Camera,
						title: "Transito",
						to: "/movility",
					},
					{
						icon: Megaphone,
						title: "Seguridad vial",
						to: "/security",
					},
					{
						icon: FileChartColumnIncreasing,
						title: "Pronostico",
						to: "/forecast",
					},
					{
						icon: FileChartLine,
						title: "Cruce de variables",
						to: "/variables",
					},
				],
			},
			{
				title: "Monitoreo",
				icon: Video,
				defaultOpen: true,
				items: [
					{
						icon: Camera,
						title: "Agentes",
						to: "/monitoring",
					},
				],
			},
		],
	};

	const settingsMenu: INavSection = {
		group: "Configuración",
		items: [
			{
				title: "Administración",
				icon: Settings,
				defaultOpen: true,
				items: [
					...(!hasModule("roles")
						? []
						: [
								{
									title: "Roles",
									icon: Shield,
									to: "/settings/roles" as const,
								},
							]),
					...(!hasModule("usuarios")
						? []
						: [
								{
									title: "Usuarios",
									icon: User,
									to: "/settings/users" as const,
								},
							]),
					...(!hasModule("modulos")
						? []
						: [
								{
									title: "Módulos",
									icon: Package,
									to: "/settings/modules" as const,
								},
							]),
					...(!hasModule("empresas")
						? []
						: [
								{
									title: "Empresas",
									icon: Settings,
									to: "/settings/companies" as const,
								},
							]),
				],
			},
		],
	};

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<a
					href="https://sittycia.com/"
					target="_blank"
					rel="noreferrer"
					className={cn("flex flex-row items-center gap-3", open && "px-4")}
				>
					<img src={Logo} className="size-8" alt="Vialyzer Dashboard Logo" />
					<span className="sr-only">{config.name}</span>
					{open ? (
						<span className="text-xl font-semibold">{config.name}</span>
					) : null}
				</a>
			</SidebarHeader>
			<SidebarContent>
				{/* {!isLoading ? (
					<> */}
				<NavSection group={principalMenu.group} items={principalMenu.items} />
				<NavSection group={metricsMenu.group} items={metricsMenu.items} />
				<NavSection group={settingsMenu.group} items={settingsMenu.items} />
				{/* </>
				) : null} */}
			</SidebarContent>
		</Sidebar>
	);
}
