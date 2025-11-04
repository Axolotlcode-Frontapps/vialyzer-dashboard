import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth";

import { authServices } from "@/lib/services/auth";
import { SESSION_NAME } from "@/lib/utils/contants";
import { getSessionCookie } from "@/lib/utils/cookies-secure";

interface TokenRefreshProviderProps {
	children: React.ReactNode;
}

export function TokenRefreshProvider({ children }: TokenRefreshProviderProps) {
	const { isAuthenticated, login, logout } = useAuth();
	const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const scheduleTokenRefresh = useCallback(
		(refreshTokenExpiration: string) => {
			if (refreshTimeoutRef.current) {
				clearTimeout(refreshTimeoutRef.current);
			}

			const expirationTime = new Date(refreshTokenExpiration).getTime();
			const currentTime = Date.now();
			const timeUntilExpiration = expirationTime - currentTime;

			const refreshTime = Math.max(0, timeUntilExpiration - 1 * 60 * 1000);

			refreshTimeoutRef.current = setTimeout(async () => {
				try {
					const session = getSessionCookie(SESSION_NAME);
					if (!session?.refreshToken) {
						await logout();
						return;
					}

					const response = await authServices.refreshToken(
						session.refreshToken
					);

					if (response.success && response.payload) {
						await login(response.payload);
						scheduleTokenRefresh(response.payload.refreshTokenExpiration);
					} else {
						await logout();
					}
				} catch (error) {
					console.error("Proactive token refresh failed:", error);
					await logout();
				}
			}, refreshTime);
		},
		[login, logout]
	);

	useEffect(() => {
		const session = getSessionCookie(SESSION_NAME);
		if (isAuthenticated && session?.refreshTokenExpiration) {
			scheduleTokenRefresh(session.refreshTokenExpiration);
		}

		return () => {
			if (refreshTimeoutRef.current) {
				clearTimeout(refreshTimeoutRef.current);
			}
		};
	}, [isAuthenticated, scheduleTokenRefresh]);

	return <>{children}</>;
}
