export interface Role {
	id: string;
	name: string;
}

export interface Company {
	id: string;
	name: string;
}

export interface User {
	id: string;
	email: string;
	phone: string;
	name: string;
	lastName: string;
	role: Role;
	companie: Company;
	createdAt?: string;
	lastLogin?: string;
	active?: boolean | null;
}
