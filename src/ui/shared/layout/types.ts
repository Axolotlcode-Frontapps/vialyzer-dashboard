import type { LinkComponentProps, Route } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export type TNavItem = {
	title: string;
	to?: LinkComponentProps<Route>["to"];
	icon?: LucideIcon;
	defaultOpen?: boolean;
	items?: TNavItem[];
};

export interface INavSection {
	group: string;
	items: TNavItem[];
}
