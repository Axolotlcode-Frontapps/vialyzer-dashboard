import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { agentsService } from "@/lib/services/agents";

export function useAgents() {
	const { data, isLoading, isRefetching, isFetching, isPending } = useQuery({
		queryKey: ["agents"],
		queryFn: async () => await agentsService.getAllAgents(),
		select: (data) => data.payload,
	});

	const loading = useMemo(
		() => isLoading || isRefetching || isFetching || isPending,
		[isLoading, isRefetching, isFetching, isPending]
	);

	return { agents: data ?? [], loading };
}
