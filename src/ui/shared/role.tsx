import { useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils/cn";
import { Badge } from "./badge";

export function Role({ idRole, className }: { idRole?: string; className?: string }) {
	const queryClient = useQueryClient();

	const roles = queryClient.getQueryData<GeneralResponse<Role[]>>(["roles"])?.payload;

	const role = roles?.find((role) => role.id === idRole);

	return (
		<>
			{idRole ? (
				<Badge variant="secondary" className={cn("capitalize", className)}>
					{role?.name}
				</Badge>
			) : (
				<span>Sin rol</span>
			)}
		</>
	);
}
