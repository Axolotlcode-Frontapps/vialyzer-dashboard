"use client";

import { useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import type { INavSection } from "./types";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "../sidebar";

export function NavSection({ group, items }: INavSection) {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { open } = useSidebar();

	return (
		<SidebarGroup>
			{group ? <SidebarGroupLabel>{group}</SidebarGroupLabel> : null}

			<SidebarMenu>
				{items.map((item) => {
					if (!item.items) {
						return (
							<SidebarMenuButton
								key={item.title}
								tooltip={item.title}
								className="cursor-pointer"
								isActive={pathname === item.to}
								onClick={() =>
									navigate({
										to: item.to,
									})
								}
							>
								{item.icon && <item.icon />}
								<span>{item.title}</span>
							</SidebarMenuButton>
						);
					}

					if (!open) {
						return item.items.map((subItem) => (
							<SidebarMenuButton
								key={subItem.title}
								tooltip={subItem.title}
								className="cursor-pointer"
								isActive={pathname === subItem.to}
								onClick={() =>
									navigate({
										to: subItem.to,
									})
								}
							>
								{subItem.icon && <subItem.icon />}
								<span>{subItem.title}</span>
							</SidebarMenuButton>
						));
					}

					return (
						<Collapsible
							key={item.title}
							defaultOpen={item.defaultOpen}
							asChild
							className="group/collapsible"
						>
							<SidebarMenuSubItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton
										className="cursor-pointer"
										tooltip={item.title}
										isActive={!!item.items.find((i) => i.to === pathname)}
									>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
										<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										{item.items?.map((subItem) => (
											<SidebarMenuSubItem key={subItem.title}>
												<SidebarMenuSubButton
													className="cursor-pointer"
													isActive={subItem.to === pathname}
													onClick={() =>
														navigate({
															to: subItem.to,
														})
													}
												>
													{subItem.icon && <subItem.icon />}
													<span>{subItem.title}</span>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										))}
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuSubItem>
						</Collapsible>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
