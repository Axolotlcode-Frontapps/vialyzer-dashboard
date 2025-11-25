import axios from "axios";

import type { AxiosError } from "axios";

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

axiosInstance.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as typeof error.config & {
			_retry?: boolean;
		};

		if (!originalRequest) {
			return Promise.reject(error);
		}

		if (error.response?.status === 401) {
			removeSessionCookie(SESSION_NAME);
			return Promise.reject(error);
		}

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			const currentRefreshToken = getSessionCookie(SESSION_NAME)?.refreshToken;

			if (!currentRefreshToken) {
				removeSessionCookie(SESSION_NAME);
				return Promise.reject(new Error("No refresh token available"));
			}

			try {
				const refreshReponse = (
					await authServices.refreshToken(currentRefreshToken)
				).payload;

				if (!refreshReponse?.token || !refreshReponse?.refreshToken) {
					throw new Error("Invalid refresh token response");
				}

				const updatedResponse: SignInResponse = {
					...getSessionCookie(SESSION_NAME)!,
					token: refreshReponse.token,
					refreshToken: refreshReponse.refreshToken,
					refreshTokenExpiration:
						refreshReponse.refreshTokenExpiration ||
						getSessionCookie(SESSION_NAME)!.refreshTokenExpiration,
				};

				setSessionCookie(SESSION_NAME, updatedResponse);
				originalRequest.headers.Authorization = `Bearer ${refreshReponse.token}`;

				return axiosInstance(originalRequest);
			} catch (refreshError) {
				console.error("💥 Token refresh failed:", refreshError);
				removeSessionCookie(SESSION_NAME);
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);

export default axiosInstance;
