import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { camerasService } from "@/lib/services/cameras";

export function useCameraVehicles(camera: string) {
	const {
		data = [],
		isLoading,
		isRefetching,
		isFetching,
		isPending,
	} = useQuery({
		queryKey: ["camera-vehicles"],
		queryFn: async () => await camerasService.vehicles(camera),
		select: (data) =>
			data.payload?.map((item) => ({
				...item,
				occurrence: 123,
			})),
	});

	const loading = useMemo(
		() => isLoading || isRefetching || isFetching || isPending,
		[isLoading, isRefetching, isFetching, isPending]
	);

	return { vehicles: data, loading };
}
