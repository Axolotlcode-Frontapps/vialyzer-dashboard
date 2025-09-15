interface Role {
	id: string;
	name: string;
	description: string;
	active: boolean;
}

interface Permission {
	module: string;
	action: string;
	description: string;
	active: boolean;
}
