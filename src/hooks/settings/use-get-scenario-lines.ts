import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { SourceLine } from "@/lib/services/settings";

import { settings } from "@/lib/services/settings";
import { Route } from "@/routes/_dashboard/settings/cameras/$camera";

interface UseGetScenarioLinesReturn {
	data: SourceLine[];
	error: Error | null;
	refetch: () => void;
	loading: boolean;
}

export function useGetScenarioLines(): UseGetScenarioLinesReturn {
	const { camera } = Route.useParams();

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
		queryFn: async () => settings.getScenarioLines({ id: camera }),
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
