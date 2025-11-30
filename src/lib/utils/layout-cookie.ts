import Cookies from "js-cookie";

const SIDEBAR_STATE = "sidebar_state";

export function getSidebarState(): boolean {
	const cookie = Cookies.get(SIDEBAR_STATE) === "true";
	return cookie ?? true;
}

export function setSidebarState({ state }: { state: boolean }) {
	if (state) {
		Cookies.set(SIDEBAR_STATE, "true", {
			expires: 30,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			...(import.meta.env.VITE_DOMAIN
				? { domain: import.meta.env.VITE_DOMAIN }
				: {}),
		});
	} else {
		Cookies.remove(SIDEBAR_STATE);
	}
}
