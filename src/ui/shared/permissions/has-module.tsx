import { useHasModule } from "@/hooks/use-permissions";

import type { Module } from "@/types/enums";

export interface HasModuleProps {
	moduleName: keyof typeof Module;
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export function HasModule({
	children,
	moduleName,
	fallback = null,
}: HasModuleProps) {
	const { hasModule } = useHasModule();
	return hasModule(moduleName) ? children : fallback;
}
