import { createFormHookContexts } from "@tanstack/react-form";

export const {
	fieldContext: fieldFiltersContext,
	formContext: formFiltersContext,
	useFieldContext: useFieldFiltersContext,
	useFormContext: useFormFiltersContext,
} = createFormHookContexts();
