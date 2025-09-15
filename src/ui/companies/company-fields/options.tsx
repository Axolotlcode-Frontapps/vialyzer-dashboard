import { formOptions } from "@tanstack/react-form";

import { settingsSchemas } from "@/lib/schemas/settings";

export const companyFieldsOpts = formOptions({
	defaultValues: {
		name: "",
		description: "",
		nit: "",
		phone: "",
		address: "",
		department: "",
		city: "",
	},
	validators: {
		onMount: ({ formApi }) => {
			formApi.state.canSubmit = false;
			return settingsSchemas.company;
		},
		onChange: settingsSchemas.company,
		onSubmitAsync: async ({ formApi }) => {
			formApi.state.isSubmitting = true;
		},
	},
});
