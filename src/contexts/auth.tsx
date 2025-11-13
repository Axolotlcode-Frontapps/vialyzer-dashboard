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
		const authInterceptor = axiosInstance.interceptors.request.use((config) => {
			config.headers.Authorization = signInResponse?.token
				? `Bearer ${signInResponse.token}`
				: config.headers.Authorization;

			return config;
		});

		return () => axiosInstance.interceptors.request.eject(authInterceptor);
	}, [signInResponse]);

	useLayoutEffect(() => {
		const refreshInterceptor = axiosInstance.interceptors.response.use(
			(response) => response,
			async (error: AxiosError) => {
				const originalRequest = error.config;

				if (error.response?.status === 401) {
					setSignInResponse(null);
					removeSessionCookie(SESSION_NAME);
					return Promise.reject(error);
				}

				if (error.response?.status === 403 && originalRequest) {
					try {
						const refreshTokenRequest = await (
							await authServices.refreshToken(signInResponse?.refreshToken!)
						).payload;

						setSignInResponse((prev) => {
							const updatedResponse = {
								...prev!,
								token: refreshTokenRequest?.token ?? "",
								refreshToken: refreshTokenRequest?.refreshToken ?? "",
							};
							setSessionCookie(SESSION_NAME, updatedResponse);
							return updatedResponse;
						});

						originalRequest.headers.Authorization = `Bearer ${refreshTokenRequest?.token}`;
					} catch (err) {
						setSignInResponse(null);
						removeSessionCookie(SESSION_NAME);
						return Promise.reject(err);
					}
				}

				return Promise.reject(error);
			}
		);

		return () => axiosInstance.interceptors.response.eject(refreshInterceptor);
	}, [signInResponse?.refreshToken]);

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
