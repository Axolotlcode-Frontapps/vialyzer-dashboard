import { useQuery } from "@tanstack/react-query";
import { withForm } from "@/contexts/form";

import { departmentsServices } from "@/lib/services/deparments";
import { companyFieldsOpts } from "./options";

export const CompanyFields = withForm({
	...companyFieldsOpts,
	render: ({ form }) => {
		const { data: departmentsData } = useQuery({
			queryKey: ["departments"],
			queryFn: async () => await departmentsServices.getAllDepartments(),
			initialData: { departments: [] },
			select: (data) => data.departments,
		});

		return (
			<>
				<form.AppField
					name="name"
					children={(field) => (
						<field.TextField label="Nombre" placeholder="Nombre de la empresa" />
					)}
				/>
				<form.AppField
					name="description"
					children={(field) => (
						<field.TextField label="Descripción" placeholder="Descripción de la empresa" />
					)}
				/>
				<div className="flex flex-col sm:flex-row gap-4">
					<form.AppField
						name="nit"
						children={(field) => <field.TextField label="NIT" placeholder="NIT de la empresa" />}
					/>
					<form.AppField
						name="phone"
						children={(field) => (
							<field.TextField label="Teléfono" placeholder="Teléfono de la empresa" />
						)}
					/>
				</div>
				<form.AppField
					name="address"
					children={(field) => (
						<field.TextField label="Dirección" placeholder="Dirección de la empresa" />
					)}
				/>
				<form.AppField
					name="department"
					children={(field) => (
						<field.SelectField
							label="Departamento"
							placeholder="Departamento de la empresa"
							options={departmentsData.map((department) => ({
								label: department.departments,
								value: department.departments,
							}))}
						/>
					)}
				/>
				<form.Subscribe
					selector={(state) => state.values.department}
					children={(deparment) => (
						<form.AppField
							name="city"
							children={(field) => (
								<field.SelectField
									label="Ciudad"
									placeholder="Ciudad de la empresa"
									disabled={!deparment}
									options={
										departmentsData
											.find((department) => department.departments === deparment)
											?.cities.map((city: string) => ({
												label: city,
												value: city,
											})) ?? []
									}
								/>
							)}
						/>
					)}
				/>
			</>
		);
	},
});
