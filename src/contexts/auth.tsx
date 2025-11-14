import {
	createContext,
	useCallback,
	useContext,
	useLayoutEffect,
	useRef,
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

	// Usar ref para tener siempre la última versión sin recrear el interceptor
	const signInResponseRef = useRef(signInResponse);

	const isAuthenticated = !!signInResponse;

	// Mantener el ref actualizado
	useLayoutEffect(() => {
		signInResponseRef.current = signInResponse;
	}, [signInResponse]);

	// Interceptor para manejar errores y refrescar token
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

				// Error 401: sesión inválida, hacer logout
				if (error.response?.status === 401) {
					console.log("🚪 Error 401 - Logout");
					setSignInResponse(null);
					removeSessionCookie(SESSION_NAME);
					return Promise.reject(error);
				}

				// Error 403: token expirado, intentar refrescar
				if (error.response?.status === 403 && !originalRequest._retry) {
					console.log("🔄 Error 403 - Intentando refrescar token");
					originalRequest._retry = true;

					const currentRefreshToken = signInResponseRef.current?.refreshToken;
					console.log("🔑 Refreshing token con:", currentRefreshToken);

					if (!currentRefreshToken) {
						console.error("❌ No refresh token available");
						setSignInResponse(null);
						removeSessionCookie(SESSION_NAME);
						return Promise.reject(new Error("No refresh token available"));
					}

					try {
						// Obtener nuevo token usando el refreshToken
						const response =
							await authServices.refreshToken(currentRefreshToken);
						const refreshTokenRequest = response.payload;

						console.log("✅ Token refreshed:", {
							hasToken: !!refreshTokenRequest?.token,
							hasRefreshToken: !!refreshTokenRequest?.refreshToken,
							hasPayload: !!response.payload,
						});

						if (
							!refreshTokenRequest?.token ||
							!refreshTokenRequest?.refreshToken
						) {
							throw new Error("Invalid refresh token response");
						}

						// Actualizar el estado y la cookie con los nuevos tokens
						const updatedResponse: SignInResponse = {
							...signInResponseRef.current!,
							token: refreshTokenRequest.token,
							refreshToken: refreshTokenRequest.refreshToken,
							// Mantener todos los demás campos del SignInResponse original
							refreshTokenExpiration:
								refreshTokenRequest.refreshTokenExpiration ||
								signInResponseRef.current!.refreshTokenExpiration,
							appToken:
								refreshTokenRequest.appToken ||
								signInResponseRef.current!.appToken,
						};

						console.log("💾 Actualizando estado y cookie", {
							newToken: `${refreshTokenRequest.token.substring(0, 20)}...`,
							newRefreshToken: `${refreshTokenRequest.refreshToken.substring(0, 20)}...`,
							expiresAt: updatedResponse.refreshTokenExpiration,
						});

						// Actualizar ref primero para que esté disponible inmediatamente
						signInResponseRef.current = updatedResponse;
						// Luego actualizar estado y cookie
						setSignInResponse(updatedResponse);
						setSessionCookie(SESSION_NAME, updatedResponse);

						// Actualizar el header de la petición original con el nuevo token
						originalRequest.headers.Authorization = `Bearer ${refreshTokenRequest.token}`;

						console.log(
							"🔁 Reintentando petición original a:",
							originalRequest.url
						);

						// IMPORTANTE: Reintentar la petición original con el nuevo token
						// Esto debe retornar la promesa directamente
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
	}, []); // Sin dependencias - usa el ref

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
