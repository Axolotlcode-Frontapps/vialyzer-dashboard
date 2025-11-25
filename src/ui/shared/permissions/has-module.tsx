import { useHasModule } from "@/hooks/use-permissions";

import type { MODULE_NAME } from "@/types/enums";

export interface HasModuleProps {
	moduleName: MODULE_NAME;
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
