import {
	Camera,
	FileChartColumnIncreasing,
	FileChartLine,
	House,
	Megaphone,
	Settings,
	Shield,
	User,
	Video,
} from "lucide-react";

import type { INavSection } from "./types";

import Logo from "@/assets/icons/logo.svg";
import { cn } from "@/lib/utils/cn";
import { config } from "@/lib/utils/config";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "../sidebar";
import { NavSection } from "./nav-section";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { open } = useSidebar();

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
						to: "/mobility",
					},
					{
						icon: Megaphone,
						title: "Seguridad vial",
						to: "/mobility/security",
					},
					{
						icon: FileChartColumnIncreasing,
						title: "Pronostico",
						to: "/mobility/forecast",
					},
					{
						icon: FileChartLine,
						title: "Cruce de variables",
						to: "/mobility/variables",
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
					{
						title: "Roles",
						icon: Shield,
						to: "/settings/roles",
					},
					{
						title: "Usuarios",
						icon: User,
						to: "/settings/users",
					},
					{
						title: "Empresas",
						icon: Settings,
						to: "/settings/companies",
					},
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
				<NavSection group={principalMenu.group} items={principalMenu.items} />
				<NavSection group={metricsMenu.group} items={metricsMenu.items} />
				<NavSection group={settingsMenu.group} items={settingsMenu.items} />
			</SidebarContent>
		</Sidebar>
	);
}
