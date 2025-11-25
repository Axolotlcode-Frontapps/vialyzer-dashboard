import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { Camera } from "@/lib/services/settings";

import { settings } from "@/lib/services/settings";
import { Route } from "@/routes/_dashboard/settings/cameras/$camera";

interface UseGetScenarioLinesReturn {
	data?: Camera;
	error: Error | null;
	refetch: () => void;
	loading: boolean;
}

export function useGetPreview(): UseGetScenarioLinesReturn {
	const { camera } = Route.useParams();

	const {
		data,
		isLoading,
		isRefetching,
		isFetching,
		isPending,
		error,
		refetch,
	} = useQuery({
		queryKey: ["scenario-line-camera", camera],
		queryFn: async () => settings.preview(camera),
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
