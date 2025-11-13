import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { SourceLine } from "@/lib/services/settings/get-scenario-lines";

import { getScenarioLines } from "@/lib/services/settings/get-scenario-lines";

const instance = axios.create({});

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
		queryFn: async (): Promise<SourceLine[]> => {
			const response = await getScenarioLines(instance);

			return response.payload ?? [];
		},
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
