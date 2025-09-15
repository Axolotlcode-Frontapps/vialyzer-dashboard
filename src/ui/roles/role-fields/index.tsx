import { withForm } from "@/contexts/form";

import { roleFieldsOpts } from "./options";

export const RoleFields = withForm({
	...roleFieldsOpts,
	render: ({ form }) => {
		return (
			<>
				<form.AppField
					name="name"
					children={(field) => <field.TextField label="Nombre" placeholder="Nombre del rol" />}
				/>
				<form.AppField
					name="description"
					children={(field) => (
						<field.TextField label="Descripción" placeholder="Descripción del rol" />
					)}
				/>
			</>
		);
	},
});
