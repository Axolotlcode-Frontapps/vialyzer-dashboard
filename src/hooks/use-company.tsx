import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { companiesService } from "@/lib/services/companies";

export function useCompany() {
	const { data, isLoading, isRefetching, isFetching, isPending } = useQuery({
		queryKey: ["companies"],
		queryFn: async () => await companiesService.getAllCompanies(),
		select: (data) => data.payload,
	});

	const loading = useMemo(
		() => isLoading || isRefetching || isFetching || isPending,
		[isLoading, isRefetching, isFetching, isPending]
	);

	return { companies: data ?? [], loading };
}
