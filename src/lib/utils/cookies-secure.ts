import Cookies from "js-cookie";

export function setSessionCookie(name: string, value: string, options = {}) {
	Cookies.set(name, JSON.stringify(value), {
		expires: 7,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		...options,
	});
}

export function getSessionCookie(name: string) {
	const cookie = Cookies.get(name);
	if (!cookie) return null;

	try {
		return JSON.parse(cookie);
	} catch (e) {
		console.error("Error al obtener la cookie de sesión:", e);
		return null;
	}
}

export function removeSessionCookie(name: string) {
	Cookies.remove(name);
}
