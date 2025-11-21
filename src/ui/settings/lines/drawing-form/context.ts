import { createFormHookContexts } from "@tanstack/react-form";

export const {
	fieldContext: fieldDrawingContext,
	formContext: formDrawingContext,
	useFieldContext: useFieldDrawingContext,
	useFormContext: useFormDrawingContext,
} = createFormHookContexts();
