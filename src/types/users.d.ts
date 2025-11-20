interface User {
	id: string;
	email: string;
	phone: string;
	name: string;
	lastname: string;
	identification: string | null;
	role: Role;
	company: Company;
	active?: boolean;
	createdAt?: Date;
	lastLogin?: Date;
	firstLogin?: boolean;
}
