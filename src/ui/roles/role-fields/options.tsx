import { formOptions } from "@tanstack/react-form";

import { settingsSchemas } from "@/lib/schemas/settings";

export const roleFieldsOpts = formOptions({
	defaultValues: {
		name: "",
		description: "",
	},
	validators: {
		onMount: ({ formApi }) => {
			formApi.state.canSubmit = false;
			return settingsSchemas.role;
		},
		onChange: settingsSchemas.role,
		onSubmitAsync: async ({ formApi }) => {
			formApi.state.isSubmitting = true;
		},
	},
});
