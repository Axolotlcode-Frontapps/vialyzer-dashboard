export function setSessionStorage<T>(name: string, value: T) {
	sessionStorage.setItem(name, JSON.stringify(value));
}

export function getSessionStorage<T>(name: string): T | null {
	const session = sessionStorage.getItem(name);

	if (!session) return null;

	try {
		return JSON.parse(session);
	} catch (e) {
		console.error("Error al obtener el almacenamiento de la sesión:", e);
		return null;
	}
}

export function removeSessionStorage(name: string) {
	sessionStorage.removeItem(name);
}
