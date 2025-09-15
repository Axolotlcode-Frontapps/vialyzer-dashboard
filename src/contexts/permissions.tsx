import { createContext, useContext } from "react";

export type PermissionsContext = {
	permissions?: Permission[];
};

const PermissionsContext = createContext<PermissionsContext | null>(null);

export const PermissionsProvider = ({ children }: { children: React.ReactNode }) => {
	// const permissionsList = queryClient.getQueryData<
	//   GeneralResponse<Permission[]>
	// >(setQueryKey.getAllPermissions)

	// const rolesList = queryClient.getQueryData<GeneralResponse<Role[]>>(
	//   setQueryKey.getAllRoles
	// )

	return (
		<PermissionsContext.Provider
			value={
				{
					// userPermissions: user?.user.role.permissions,
					// permissions: permissionsList?.payload,
				}
			}
		>
			{children}
		</PermissionsContext.Provider>
	);
};

export const usePermissions = () => {
	const context = useContext(PermissionsContext);
	if (!context) {
		throw new Error("usePermissions must be used within a PermissionsProvider");
	}
	return context;
};
