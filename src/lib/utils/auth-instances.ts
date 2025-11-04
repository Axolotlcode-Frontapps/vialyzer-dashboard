import axios from "axios";

import type { AxiosInstance } from "axios";

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:4000/local/api";

/**
 * Creates an authenticated axios instance using the regular token
 * This should be used for most API endpoints
 */
export function createAuthInstance(
	token: string,
	customBaseURL?: string
): AxiosInstance {
	return axios.create({
		baseURL: customBaseURL || API_BASE_URL,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
}

/**
 * Creates an authenticated axios instance using the app token
 * This should be used for specific endpoints that require app-level authentication
 */
export function createAppAuthInstance(
	appToken: string,
	customBaseURL?: string
): AxiosInstance {
	return axios.create({
		baseURL: customBaseURL || API_BASE_URL,
		timeout: 60000,
		headers: {
			"Content-Type": "application/json",
			"X-Requested-With": "XMLHttpRequest",
			Authorization: `Bearer ${appToken}`,
		},
	});
}

/**
 * Creates an axios instance with both tokens in headers
 * This should be used for endpoints that might need both tokens
 */
export function createDualAuthInstance(
	token: string,
	appToken: string,
	customBaseURL?: string
): AxiosInstance {
	return axios.create({
		baseURL: customBaseURL || API_BASE_URL,
		timeout: 60000,
		headers: {
			"Content-Type": "application/json",
			"X-Requested-With": "XMLHttpRequest",
			Authorization: `Bearer ${token}`,
			"X-App-Authorization": `Bearer ${appToken}`,
		},
	});
}

/**
 * Token refresh utility function
 * Uses the refresh token to get new access tokens
 */
export async function refreshTokens(refreshToken: string): Promise<{
	token: string;
	appToken: string;
	refreshToken: string;
	refreshTokenExpiration: string;
}> {
	const response = await axios.post(
		`${API_BASE_URL}/auth/refresh-token`,
		{
			refreshToken,
		},
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);

	if (response.status !== 200 || !response.data.success) {
		throw new Error("Failed to refresh tokens");
	}

	return response.data.payload;
}

/**
 * Checks if a refresh token is expired based on its expiration date
 */
export function isRefreshTokenExpired(refreshTokenExpiration: string): boolean {
	try {
		const expirationDate = new Date(refreshTokenExpiration);
		const now = new Date();
		return now >= expirationDate;
	} catch {
		// If we can't parse the date, assume it's expired for safety
		return true;
	}
}
