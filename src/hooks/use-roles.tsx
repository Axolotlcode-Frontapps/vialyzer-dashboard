import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { rolesService } from "@/lib/services/roles";

export function useRoles() {
	const { data, isLoading, isRefetching, isFetching, isPending } = useQuery({
		queryKey: ["roles"],
		queryFn: async () => await rolesService.getAllRoles(),
		select: (data) => data.payload,
	});

	const loading = useMemo(
		() => isLoading || isRefetching || isFetching || isPending,
		[isLoading, isRefetching, isFetching, isPending]
	);

	return { roles: data ?? [], loading };
}
