import axios from "axios";

import { SESSION_NAME } from "./contants";
import { getSessionCookie } from "./cookies-secure";

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 10000,
});

axiosInstance.interceptors.request.use(
	(config) => {
		if (!(config.data instanceof FormData)) {
			config.headers["Content-Type"] = "application/json";
		}

		const token = getSessionCookie(SESSION_NAME)?.token;

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

export default axiosInstance;
