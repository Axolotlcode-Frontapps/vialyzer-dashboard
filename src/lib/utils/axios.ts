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
		console.log("🔴 Error interceptado:", {
			status: error.response?.status,
			message: error.message,
			hasConfig: !!error.config,
			url: error.config?.url,
		});

		const originalRequest = error.config as typeof error.config & {
			_retry?: boolean;
		};

		if (!originalRequest) {
			console.log("❌ No hay originalRequest");
			return Promise.reject(error);
		}

		console.log("📋 Request info:", {
			url: originalRequest.url,
			retry: originalRequest._retry,
			status: error.response?.status,
		});

		if (error.response?.status === 401) {
			console.log("🚪 Error 401 - Logout");

			removeSessionCookie(SESSION_NAME);
			return Promise.reject(error);
		}

		if (error.response?.status === 403 && !originalRequest._retry) {
			console.log("🔄 Error 403 - Intentando refrescar token");
			originalRequest._retry = true;

			const currentRefreshToken = getSessionCookie(SESSION_NAME)?.refreshToken;

			if (!currentRefreshToken) {
				console.error("❌ No refresh token available");

				removeSessionCookie(SESSION_NAME);
				return Promise.reject(new Error("No refresh token available"));
			}

			try {
				const refreshReponse = (
					await authServices.refreshToken(currentRefreshToken)
				).payload;

				console.log("✅ Token refreshed:", {
					hasToken: !!refreshReponse?.token,
					hasRefreshToken: !!refreshReponse?.refreshToken,
					hasPayload: !!refreshReponse,
				});

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

				console.log("💾 Actualizando estado y cookie", {
					newToken: refreshReponse.token,
					newRefreshToken: refreshReponse.refreshToken,
					expiresAt: updatedResponse.refreshTokenExpiration,
				});

				setSessionCookie(SESSION_NAME, updatedResponse);

				originalRequest.headers.Authorization = `Bearer ${refreshReponse.token}`;

				console.log(
					"🔁 Reintentando petición original a:",
					originalRequest.url
				);

				return axiosInstance(originalRequest);
			} catch (refreshError) {
				console.error("💥 Token refresh failed:", refreshError);
				removeSessionCookie(SESSION_NAME);
				return Promise.reject(refreshError);
			}
		}

		console.log("⚠️ Error no manejado, rechazando");
		return Promise.reject(error);
	}
);

export default axiosInstance;
