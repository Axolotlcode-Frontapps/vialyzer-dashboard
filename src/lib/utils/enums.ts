export const QueryKeys = {
	GET_USERS: "get-users",
	GET_ROLES: "get-roles",
	GET_COMPANIES: "get-companies",
} as const;

export type QueryKeys = (typeof QueryKeys)[keyof typeof QueryKeys];
