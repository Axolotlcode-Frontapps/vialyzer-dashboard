import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { VehicleLine } from "@/lib/services/settings";

import { settings } from "@/lib/services/settings";

interface UseGetScenarioLinesReturn {
	data: VehicleLine[];
	error: Error | null;
	refetch: () => void;
	loading: boolean;
}

export function useLoadVehicles(): UseGetScenarioLinesReturn {
	const {
		data = [],
		isLoading,
		isRefetching,
		isFetching,
		isPending,
		error,
		refetch,
	} = useQuery({
		queryKey: ["scenario-vehicles"],
		queryFn: settings.loadVehicles,
		refetchOnWindowFocus: false,
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
