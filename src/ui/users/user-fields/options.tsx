import { formOptions } from "@tanstack/react-form";

import { settingsSchemas } from "@/lib/schemas/settings";

export const userFieldsOpts = formOptions({
	defaultValues: {
		name: "",
		lastname: "",
		email: "",
		phone: "",
		role: "",
		company: "",
	},
	validators: {
		onMount: ({ formApi }) => {
			formApi.state.canSubmit = false;
			return settingsSchemas.user;
		},
		onChange: settingsSchemas.user,
		onSubmitAsync: async ({ formApi }) => {
			formApi.state.isSubmitting = true;
		},
	},
});
