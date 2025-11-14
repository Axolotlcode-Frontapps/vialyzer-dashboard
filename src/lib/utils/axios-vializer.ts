import axios from "axios";

export const axiosVializer = axios.create({
	baseURL: import.meta.env.VITE_VIALIZER_APP_URL,
	timeout: 10000,
});

axiosVializer.interceptors.request.use((config) => {
	config.headers.set("Content-Type", "application/json");
	config.headers.set(
		"Authorization",
		`Bearer ${import.meta.env.VITE_VIALIZER_API_TOKEN}`
	);

	return config;
});
