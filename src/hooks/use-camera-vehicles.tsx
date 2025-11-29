import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { camerasService } from "@/lib/services/cameras";
import { vehiculesTranslate } from "@/lib/utils/translates";

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
				name:
					vehiculesTranslate[item.name as keyof typeof vehiculesTranslate] ||
					item.name,
			})),
	});

	const loading = useMemo(
		() => isLoading || isRefetching || isFetching || isPending,
		[isLoading, isRefetching, isFetching, isPending]
	);

	return { vehicles: data, loading };
}
