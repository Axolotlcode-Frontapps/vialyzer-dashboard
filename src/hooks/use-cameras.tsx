import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { camerasService } from "@/lib/services/cameras";

export function useCameras() {
	const { data, isLoading, isRefetching, isFetching, isPending } = useQuery({
		queryKey: ["cameras"],
		queryFn: async () => await camerasService.getAllCameras(),
		select: (data) => data.payload,
	});

	const loading = useMemo(
		() => isLoading || isRefetching || isFetching || isPending,
		[isLoading, isRefetching, isFetching, isPending]
	);

	return { cameras: data ?? [], loading };
}
