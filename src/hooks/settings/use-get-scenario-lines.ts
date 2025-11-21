import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { SourceLine } from "@/lib/services/settings";

import { settings } from "@/lib/services/settings";

interface UseGetScenarioLinesReturn {
	data: SourceLine[];
	error: Error | null;
	refetch: () => void;
	loading: boolean;
}

export function useGetScenarioLines(): UseGetScenarioLinesReturn {
	const {
		data = [],
		isLoading,
		isRefetching,
		isFetching,
		isPending,
		error,
		refetch,
	} = useQuery({
		queryKey: ["scenario-lines"],
		queryFn: settings.getScenarioLines,
	});

	const loading = useMemo(
		() => isLoading || isRefetching || isFetching || isPending,
		[isLoading, isRefetching, isFetching, isPending]
	);

	return {
		data,
		error,
		loading,
		refetch,
	};
}
