import axios from "axios";

import type { AxiosRequestConfig, AxiosResponse } from "axios";

import { authServices } from "../services/auth";
import { SESSION_NAME } from "./contants";
import {
	getSessionCookie,
	removeSessionCookie,
	setSessionCookie,
} from "./cookies-secure";

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 10000,
});

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value?: string | null) => void;
	reject: (error?: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
	failedQueue.forEach(({ resolve, reject }) => {
		if (error) {
			reject(error);
		} else {
			resolve(token);
		}
	});

	failedQueue = [];
};

axiosInstance.interceptors.request.use(
	(config) => {
		config.headers["Content-Type"] = "application/json";
		const session = getSessionCookie(SESSION_NAME);
		const token = session?.token;

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
	(response: AxiosResponse) => response,
	async (error) => {
		const originalRequest = error.config as AxiosRequestConfig & {
			_retry?: boolean;
		};

		if (error.response && error.response.status === 404) {
			if (!error.response.data) return;
			return Promise.reject(error.response.data);
		}

		if (
			error.response &&
			error.response.status === 401 &&
			!originalRequest._retry
		) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						if (originalRequest.headers) {
							originalRequest.headers.Authorization = `Bearer ${token}`;
						}
						return axiosInstance(originalRequest);
					})
					.catch((err) => {
						return Promise.reject(err);
					});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const session = getSessionCookie(SESSION_NAME);
			const refreshToken = session?.refreshToken;

			if (!refreshToken) {
				processQueue(error, null);
				removeSessionCookie(SESSION_NAME);
				document.dispatchEvent(new CustomEvent("auth:logout"));
				return Promise.reject(error);
			}

			try {
				const response = await authServices.refreshToken(refreshToken);

				if (response.success && response.payload) {
					const newSignInResponse = response.payload;

					setSessionCookie(SESSION_NAME, newSignInResponse);

					if (originalRequest.headers) {
						originalRequest.headers.Authorization = `Bearer ${newSignInResponse.token}`;
					}

					processQueue(null, newSignInResponse.token);

					return axiosInstance(originalRequest);
				} else {
					throw new Error("Failed to refresh token");
				}
			} catch (refreshError) {
				const error =
					refreshError instanceof Error
						? refreshError
						: new Error("Refresh token failed");
				processQueue(error, null);
				removeSessionCookie(SESSION_NAME);
				document.dispatchEvent(new CustomEvent("auth:logout"));
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	}
);

export default axiosInstance;
