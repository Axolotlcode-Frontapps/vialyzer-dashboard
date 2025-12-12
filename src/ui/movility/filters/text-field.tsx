import { useMemo } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/shared/field";
import { Input } from "@/ui/shared/input";
import { useFieldFiltersContext } from "./context";

interface Props extends React.ComponentProps<"input"> {
	label?: string;
	description?: string;
}

export function TextField({ label, description, ...props }: Props) {
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
			<Input
				id={field.name}
				name={field.name}
				value={field.state.value}
				onChange={(e) => field.handleChange(e.target.value)}
				className="w-full"
				{...props}
			/>
			{error ? <FieldError>{error}</FieldError> : null}
		</Field>
	);
}
