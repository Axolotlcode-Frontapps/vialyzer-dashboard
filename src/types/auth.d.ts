interface SignInResponse {
	token: string;
	refreshToken: string;
	refreshTokenExpiration: string;
	appToken: string;
	firstLogin: boolean;
	idUser: string;
	idAgent: string;
}
