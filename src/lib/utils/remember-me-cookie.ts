import Cookies from "js-cookie";

const REMEMBER_EMAIL_KEY = "remember_email";

export function getRememberMeEmail(): string {
	const cookie = Cookies.get(REMEMBER_EMAIL_KEY);
	return cookie ?? "";
}

export function setRememberMeData({
	email,
	remember,
}: {
	email: string;
	remember: boolean;
}) {
	if (remember) {
		Cookies.set(REMEMBER_EMAIL_KEY, email, {
			expires: 30,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			...(import.meta.env.VITE_DOMAIN
				? { domain: import.meta.env.VITE_DOMAIN }
				: {}),
		});
	} else {
		Cookies.remove(REMEMBER_EMAIL_KEY);
	}
}

export function clearRememberMeData() {
	Cookies.remove(REMEMBER_EMAIL_KEY, {
		path: "/",
		...(import.meta.env.VITE_DOMAIN
			? { domain: import.meta.env.VITE_DOMAIN }
			: {}),
	});
}
