interface Role {
	id: string;
	name: string;
	description: string;
	active: boolean;
	modules: Module[];
	permissions: Permission[];
}

interface Permission {
	id: string;
	action: string;
	module: string;
	active: boolean;
}

interface Module {
	id: string;
	name: string;
	active: boolean;
}
