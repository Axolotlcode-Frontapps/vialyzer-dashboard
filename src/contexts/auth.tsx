import { createContext, useCallback, useContext, useState } from "react";

import type { ReactNode } from "react";

import { authServices } from "@/lib/services/auth";
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
