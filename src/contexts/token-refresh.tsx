import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth";

import { authServices } from "@/lib/services/auth";
import { SESSION_NAME } from "@/lib/utils/contants";
import { getSessionCookie } from "@/lib/utils/cookies-secure";

interface TokenRefreshProviderProps {
	children: React.ReactNode;
}

export function TokenRefreshProvider({ children }: TokenRefreshProviderProps) {
	const { isAuthenticated, logout, signInResponse, silentRefresh } = useAuth();
	const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lastScheduledExpiration = useRef<string | null>(null);

	const scheduleTokenRefresh = useCallback(
		(refreshTokenExpiration: string) => {
			// Evitar reprogramar si ya tenemos programado para la misma fecha de expiración
			if (lastScheduledExpiration.current === refreshTokenExpiration) {
				return;
			}

			if (refreshTimeoutRef.current) {
				clearTimeout(refreshTimeoutRef.current);
			}

			const expirationTime = new Date(refreshTokenExpiration).getTime();
			const currentTime = Date.now();
			const timeUntilExpiration = expirationTime - currentTime;

			// Si el token ya expiró o está por expirar (menos de 30 segundos), no programar
			if (timeUntilExpiration <= 30 * 1000) {
				return;
			}

			const refreshTime = Math.max(0, timeUntilExpiration - 1 * 60 * 1000);
			lastScheduledExpiration.current = refreshTokenExpiration;

			console.log(
				`Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`
			);

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
						// Actualizar usando silentRefresh para evitar bucle
						silentRefresh(response.payload);

						// Resetear la referencia para permitir nueva programación
						lastScheduledExpiration.current = null;

						// Programar el siguiente refresh
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
		[logout, silentRefresh]
	);

	useEffect(() => {
		// Solo programar refresh si está autenticado y tenemos un token válido
		if (isAuthenticated && signInResponse?.refreshTokenExpiration) {
			scheduleTokenRefresh(signInResponse.refreshTokenExpiration);
		}

		return () => {
			if (refreshTimeoutRef.current) {
				clearTimeout(refreshTimeoutRef.current);
				refreshTimeoutRef.current = null;
			}
		};
	}, [
		isAuthenticated,
		signInResponse?.refreshTokenExpiration,
		scheduleTokenRefresh,
	]);

	// Limpiar timeout cuando se desmonta el componente
	useEffect(() => {
		return () => {
			if (refreshTimeoutRef.current) {
				clearTimeout(refreshTimeoutRef.current);
			}
		};
	}, []);

	return <>{children}</>;
}
