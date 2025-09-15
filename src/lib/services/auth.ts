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
				email: values.email,
				password: values.password,
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

	async verifyCode(values: VerifyCodeValues, userId: string, token: string) {
		const response = await fetcher<GeneralResponse<{ id: string; token: string }>>(
			"/users/validate-code",
			{
				method: "POST",
				data: {
					...values,
					id: userId,
				},
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return response.payload;
	}

	async updateUser(values: UpdatePasswordValues, userId: string, token: string) {
		return await fetcher<GeneralResponse<void>>(`/users/update-user?userId=${userId}`, {
			method: "PATCH",
			data: {
				password: values.password,
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
	}

	async getMeUser() {
		return await fetcher<GeneralResponse<User>>("/users/get-me");
	}
}

export const authServices = new AuthServices();
