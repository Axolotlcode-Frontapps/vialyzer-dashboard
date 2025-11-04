import { useCallback } from "react";
import { useAuth } from "@/contexts/auth";

import { authServices } from "@/lib/services/auth";
import { SESSION_NAME } from "@/lib/utils/contants";
import { getSessionCookie } from "@/lib/utils/cookies-secure";

export function useTokenRefresh() {
	const { login, logout } = useAuth();

	const refreshTokenManually = useCallback(async (): Promise<boolean> => {
		try {
			// Get refresh token from cookies
			const session = getSessionCookie(SESSION_NAME);
			if (!session?.refreshToken) {
				await logout();
				return false;
			}

			const response = await authServices.refreshToken(session.refreshToken);

			if (response.success && response.payload) {
				await login(response.payload);
				return true;
			} else {
				await logout();
				return false;
			}
		} catch (error) {
			console.error("Manual token refresh failed:", error);
			await logout();
			return false;
		}
	}, [login, logout]);

	return {
		refreshTokenManually,
		canRefresh: !!getSessionCookie(SESSION_NAME)?.refreshToken,
	};
}
