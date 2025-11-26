import { useMemo } from "react";

import { Label } from "@/ui/shared/label";
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
		<Label className="flex-col gap-0">
			{label ? (
				<span className="block w-full mb-3.5 text-sm">{label}</span>
			) : null}
			<Textarea
				value={field.state.value}
				onChange={(e) => field.handleChange(e.target.value)}
				placeholder={placeholder}
			/>
			{description ? (
				<span className="text-sm text-muted-foreground">{description}</span>
			) : null}
			{error ? (
				<span className="text-sm text-destructive mt-2 w-full">{error}</span>
			) : null}
		</Label>
	);
}
