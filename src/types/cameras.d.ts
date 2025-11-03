interface Camera {
	id: string;
	name: string;
	externalId: string;
	state: TStatus;
	location: {
		latitude: string;
		longitude: string;
		timezone: string;
	};
	createdAt: string;
	updatedAt: string;
	project: {
		id: string;
		name: string;
		externalId: string;
		createdAt: string;
		updatedAt: string;
	};
}
