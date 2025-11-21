import { createFormHook } from "@tanstack/react-form";

import { CheckboxField } from "./checkbox-field";
import { ColorField } from "./color-field";
import { fieldDrawingContext, formDrawingContext } from "./context";
import { SelectField } from "./select-field";
import { SliderField } from "./slider-field";
import { Submit } from "./submit";
import { TextField } from "./text-field";
import { ToggleField } from "./toggle-field";
import { ToggleGroupField } from "./toggle-group-field";

export const { useAppForm: useDrawingForm } = createFormHook({
	fieldContext: fieldDrawingContext,
	formContext: formDrawingContext,
	fieldComponents: {
		TextField,
		SelectField,
		CheckboxField,
		ColorField,
		SliderField,
		ToggleField,
		ToggleGroupField,
	},
	formComponents: {
		Submit,
	},
});
