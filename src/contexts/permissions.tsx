import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

import type { ReactNode } from "react";

import { usersService } from "@/lib/services/users";
import { USER_PERMISSIONS } from "@/lib/utils/contants";
import {
	getSessionStorage,
	setSessionStorage,
} from "@/lib/utils/session-storage";
import { useAuth } from "./auth";

export interface PermissionsContext {
	user: User | null;
	updateUser: (user: User) => void;
	clearPermissions: () => void;
}

const PermissionsContext = createContext<PermissionsContext | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
	const { token } = useAuth();
	const [userState, setUserState] = useState<User | null>(
		getSessionStorage(USER_PERMISSIONS)
	);

	const updateUser = useCallback((user: User) => {
		setSessionStorage(USER_PERMISSIONS, user);
		setUserState(user);
	}, []);

	function clearPermissions() {
		setSessionStorage(USER_PERMISSIONS, null);
		setUserState(null);
	}

	const setPermissions = useCallback(async () => {
		const user = await usersService.getMeUser();

		if (user) {
			updateUser(user.payload!);
		}
	}, [updateUser]);

	useEffect(() => {
		if (!userState && token) {
			setPermissions();
		}
	}, [userState, token, setPermissions]);

	return (
		<PermissionsContext.Provider
			value={{ user: userState, updateUser, clearPermissions }}
		>
			{children}
		</PermissionsContext.Provider>
	);
}

export function usePermissions() {
	const context = useContext(PermissionsContext);
	if (!context) {
		throw new Error("usePermissions must be used within a PermissionsProvider");
	}
	return context;
}
