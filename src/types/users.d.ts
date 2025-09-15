interface User {
	id: string;
	email: string;
	phone: string;
	name: string;
	lastName: string;
	identification: string | null;
	role: Role;
	companie: Company;
	active?: boolean;
	createdAt?: Date;
	lastLogin?: Date;
}
