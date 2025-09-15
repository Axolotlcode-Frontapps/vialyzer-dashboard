import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { DatePickerField } from "@/ui/shared/form/date-picker-field.tsx";
import { FileField } from "@/ui/shared/form/file-field.tsx";
import { PasswordField } from "@/ui/shared/form/password-field.tsx";
import { SelectField } from "@/ui/shared/form/select-field.tsx";
import { SubmitButton } from "@/ui/shared/form/submit-form.tsx";
import { Switchfield } from "@/ui/shared/form/switch-field.tsx";
import { TextField } from "@/ui/shared/form/text-field.tsx";
import { TextareaField } from "@/ui/shared/form/textarea-field.tsx";
import { SearchAccordionField } from "@/ui/shared/search-filters/search-accordion-field.tsx";
import { SearchDropdownFilter } from "@/ui/shared/search-filters/search-dropdown-filter.tsx";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
	createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
	fieldComponents: {
		TextField,
		PasswordField,
		Switchfield,
		SelectField,
		DatePickerField,
		TextareaField,
		FileField,
		SearchAccordionField,
		SearchDropdownFilter,
	},
	formComponents: {
		SubmitButton,
	},
	fieldContext,
	formContext,
});
