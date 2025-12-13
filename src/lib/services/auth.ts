import type {
	ForgotPasswordValues,
	SignInValues,
	UpdatePasswordValues,
	VerifyCodeValues,
} from "@/lib/schemas/auth";

import { fetcher } from "@/lib/utils/fetch-api";

class AuthServices {
	async signIn(values: SignInValues) {
		return await fetcher<GeneralResponse<SignInResponse>>("/auth/sign-in", {
			method: "POST",
			data: {
				username: values.username,
				password: values.password,
			},
		});
	}

	async refreshToken(refreshToken: string) {
		return await fetcher<GeneralResponse<SignInResponse>>("/auth/refresh-token", {
			method: "POST",
			data: {
				refreshToken,
			},
		});
	}

	async logOut() {
		return await fetcher<GeneralResponse<void>>("/auth/logout", {
			method: "POST",
		});
	}

	async forgotPassword(values: ForgotPasswordValues) {
		return await fetcher<
			GeneralResponse<{
				token: string;
				idUser: string;
			}>
		>("/users/recovery-password", {
			method: "POST",
			data: values,
		});
	}

	async resendCode(email: string, token: string) {
		return await fetcher<
			GeneralResponse<{
				token: string;
				idUser: string;
			}>
		>(`/users/resend-code`, {
			method: "POST",
			data: {
				email,
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
	}

	async verifyCode(values: VerifyCodeValues, userId: string, token: string) {
		return await fetcher<GeneralResponse<{ id: string; token: string }>>("/users/validate-code", {
			method: "POST",
			data: {
				...values,
				id: userId,
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
	}

	async updateUser(values: UpdatePasswordValues, userId: string, token: string) {
		return await fetcher<GeneralResponse<void>>(`/users/update-user/${userId}`, {
			method: "PATCH",
			data: {
				password: values.password,
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
	}
}

export const authServices = new AuthServices();
