import { useMemo } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/shared/field";
import { Textarea } from "@/ui/shared/textarea";
import { useFieldFiltersContext } from "./context";

interface Props {
	label?: string;
	description?: string;
	placeholder?: string;
}

export function TextareaField({ label, description, placeholder }: Props) {
	const field = useFieldFiltersContext<string>();

	const error = useMemo(() => {
		const { errors } = field.state.meta;
		const objErr = errors?.length > 0 ? errors?.[0] : null;
		if (typeof objErr === "string") {
			return objErr;
		}
		if (typeof objErr === "object" && Object.hasOwn(objErr ?? {}, "message")) {
			return objErr.message;
		}

		return null;
	}, [field.state.meta]);

	return (
		<Field orientation="responsive" className="@md/filters:max-w-fit">
			{label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
			{description ? <FieldDescription>{description}</FieldDescription> : null}
			<Textarea
				id={field.name}
				name={field.name}
				value={field.state.value}
				onChange={(e) => field.handleChange(e.target.value)}
				placeholder={placeholder}
				rows={4}
			/>
			{error ? <FieldError>{error}</FieldError> : null}
		</Field>
	);
}
