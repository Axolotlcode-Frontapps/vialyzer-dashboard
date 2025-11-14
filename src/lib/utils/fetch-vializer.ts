import type { AxiosRequestConfig } from "axios";

import { axiosVializer } from "./axios-vializer";

export const fetchVializer = async <T>(
	url: string,
	options?: AxiosRequestConfig
): Promise<T> => {
	const response = await axiosVializer({
		url,
		...options,
	});

	if (response.status !== 200) {
		throw new Error(
			response.data?.message || "Error while fetching Vializer API."
		);
	}

	return response.data;
};
