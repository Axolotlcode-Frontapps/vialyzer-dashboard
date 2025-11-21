import { Activity } from "react";
import {
	Camera,
	House,
	MonitorCog,
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
			...(!hasModule("movilidad")
				? []
				: [
						{
							title: "Movilidad",
							icon: Video,
							defaultOpen: true,
							items: [
								...(!hasModule("transito")
									? []
									: [
											{
												icon: Camera,
												title: "Transito",
												to: "/movility" as const,
											},
										]),
								// ...(!hasModule("transito")
								// 	? []
								// 	: [
								// 			{
								// 				icon: Megaphone,
								// 				title: "Seguridad vial",
								// 				to: "/security" as const,
								// 			},
								// 		]),
								// ...(!hasModule("transito")
								// 	? []
								// 	: [
								// 			{
								// 				icon: FileChartColumnIncreasing,
								// 				title: "Pronostico",
								// 				to: "/forecast" as const,
								// 			},
								// 		]),
								// ...(!hasModule("transito")
								// 	? []
								// 	: [
								// 			{
								// 				icon: FileChartLine,
								// 				title: "Cruce de variables",
								// 				to: "/variables" as const,
								// 			},
								// 		]),
							],
						},
					]),
			...(!hasModule("agentes")
				? []
				: [
						{
							title: "Monitoreo",
							icon: Video,
							defaultOpen: true,
							items: [
								...(!hasModule("agentes")
									? []
									: [
											{
												icon: Camera,
												title: "Agentes",
												to: "/monitoring" as const,
											},
										]),
							],
						},
					]),
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
					...(!hasModule("empresas")
						? []
						: [
								{
									title: "Configuración",
									icon: MonitorCog,
									to: "/settings/cameras" as const,
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
				<NavSection group={principalMenu.group} items={principalMenu.items} />

				<Activity
					mode={
						hasModule("movilidad") || hasModule("agentes")
							? "visible"
							: "hidden"
					}
				>
					<NavSection group={metricsMenu.group} items={metricsMenu.items} />
				</Activity>
				<Activity
					mode={
						hasModule("usuarios") ||
						hasModule("roles") ||
						hasModule("modulos") ||
						hasModule("empresas")
							? "visible"
							: "hidden"
					}
				>
					<NavSection group={settingsMenu.group} items={settingsMenu.items} />
				</Activity>
			</SidebarContent>
		</Sidebar>
	);
}
