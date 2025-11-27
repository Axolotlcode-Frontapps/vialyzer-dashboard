interface Company {
	id: string;
	name: string;
	nit: string;
	phone: string;
	address: string;
	department: string;
	city: string;
	description: string;
	active: boolean;
	users: User[];
	createdAt: Date;
	updatedAt: Date | null;
	deletedAt: Date | null;
}

interface Department {
	departments: string;
	cities: string[];
}

interface Departments {
	departments: Department[];
}
