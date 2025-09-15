import axios from "axios";

import { SESSION_NAME } from "./contants";
import { getSessionCookie } from "./cookies-secure";

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 10000,
});

axiosInstance.interceptors.request.use(
	(config) => {
		config.headers["Content-Type"] = "application/json";
		const token = getSessionCookie(SESSION_NAME);

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 404) {
			if (!error.response.data) return;
			return Promise.reject(error.response.data);
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;
