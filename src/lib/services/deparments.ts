class DepartmentsServices {
	async getAllDepartments() {
		const response = await fetch("/data/deparments.json");

		return (await response.json()) as Departments;
	}
}

export const departmentsServices = new DepartmentsServices();
