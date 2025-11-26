import { createFormHook } from "@tanstack/react-form";

import { fieldFiltersContext, formFiltersContext } from "./context";
import { DateRangeField } from "./date-range-field";
import { MultiCheckField } from "./multi-check-field";
import { MultiSelectField } from "./multi-select-field";
import { Reset } from "./reset";
import { SingleSelectField } from "./single-select-field";
import { Submit } from "./submit";
import { TextField } from "./text-field";
import { TextareaField } from "./textarea-field";

export const { useAppForm: useFiltersForm } = createFormHook({
	fieldContext: fieldFiltersContext,
	formContext: formFiltersContext,
	fieldComponents: {
		SingleSelectField,
		MultiSelectField,
		MultiCheckField,
		DateRangeField,
		TextField,
		TextareaField,
	},
	formComponents: {
		Submit,
		Reset,
	},
});
