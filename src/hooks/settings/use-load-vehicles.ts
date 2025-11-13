import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { VehicleLine } from "@/lib/services/settings/load-vehicles";

import { loadVehicles } from "@/lib/services/settings/load-vehicles";

interface UseGetScenarioLinesReturn {
	data: VehicleLine[];
	error: Error | null;
	refetch: () => void;
	loading: boolean;
}

const instance = axios.create();

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
		queryFn: async (): Promise<VehicleLine[]> => {
			const response = await loadVehicles(instance);

			return response.payload ?? [];
		},
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
