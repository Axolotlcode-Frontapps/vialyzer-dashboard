import {
	createContext,
	useCallback,
	useContext,
	useLayoutEffect,
	useState,
} from "react";

import type { AxiosError } from "axios";
import type { ReactNode } from "react";

import { authServices } from "@/lib/services/auth";
import axiosInstance from "@/lib/utils/axios";
import { SESSION_NAME } from "@/lib/utils/contants";
import {
	getSessionCookie,
	removeSessionCookie,
	setSessionCookie,
} from "@/lib/utils/cookies-secure";

export interface AuthContext {
	isAuthenticated: boolean;
	login: (signInResponse: SignInResponse) => Promise<SignInResponse>;
	logout: () => Promise<void>;
	signInResponse: SignInResponse | null;
}

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [signInResponse, setSignInResponse] = useState<SignInResponse | null>(
		getSessionCookie(SESSION_NAME)
	);

	const isAuthenticated = !!signInResponse;

	useLayoutEffect(() => {
		const refreshInterceptor = axiosInstance.interceptors.response.use(
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
					setSignInResponse(null);
					removeSessionCookie(SESSION_NAME);
					return Promise.reject(error);
				}

				if (error.response?.status === 403 && !originalRequest._retry) {
					console.log("🔄 Error 403 - Intentando refrescar token");
					originalRequest._retry = true;

					const currentRefreshToken = signInResponse?.refreshToken;

					if (!currentRefreshToken) {
						console.error("❌ No refresh token available");
						setSignInResponse(null);
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
							...signInResponse!,
							token: refreshReponse.token,
							refreshToken: refreshReponse.refreshToken,
							refreshTokenExpiration:
								refreshReponse.refreshTokenExpiration ||
								signInResponse!.refreshTokenExpiration,
						};

						console.log("💾 Actualizando estado y cookie", {
							newToken: refreshReponse.token,
							newRefreshToken: refreshReponse.refreshToken,
							expiresAt: updatedResponse.refreshTokenExpiration,
						});

						setSignInResponse(updatedResponse);
						setSessionCookie(SESSION_NAME, updatedResponse);

						originalRequest.headers.Authorization = `Bearer ${refreshReponse.token}`;

						console.log(
							"🔁 Reintentando petición original a:",
							originalRequest.url
						);

						return axiosInstance(originalRequest);
					} catch (refreshError) {
						console.error("💥 Token refresh failed:", refreshError);
						setSignInResponse(null);
						removeSessionCookie(SESSION_NAME);
						return Promise.reject(refreshError);
					}
				}

				console.log("⚠️ Error no manejado, rechazando");
				return Promise.reject(error);
			}
		);

		return () => axiosInstance.interceptors.response.eject(refreshInterceptor);
	}, [signInResponse]);

	const logout = useCallback(async () => {
		try {
			await authServices.logOut();
		} catch (error) {
			console.warn("Logout service failed:", error);
		}
		removeSessionCookie(SESSION_NAME);
		setSignInResponse(null);
	}, []);

	const login = useCallback(async (signInResponse: SignInResponse) => {
		setSessionCookie(SESSION_NAME, signInResponse);
		setSignInResponse(signInResponse);

		return signInResponse;
	}, []);

	return (
		<AuthContext.Provider
			value={{ isAuthenticated, signInResponse, login, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
