import { useMemo } from "react";

import { Checkbox } from "@/ui/shared/checkbox";
import { Label } from "@/ui/shared/label";
import { useFieldDrawingContext } from "./context";

interface Props {
	label?: string;
	description?: string;
	checkboxLabel?: string;
}

export function CheckboxField({ label, description, checkboxLabel }: Props) {
	const field = useFieldDrawingContext<boolean>();

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
		<div className="flex flex-col gap-0">
			{label ? (
				<span className="block w-full mb-3.5 text-sm font-medium">{label}</span>
			) : null}
			<Label className="flex items-center space-x-2 cursor-pointer">
				<Checkbox
					checked={field.state.value}
					onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
				/>
				<span className="text-sm text-gray-700">
					{checkboxLabel || "Enable background"}
				</span>
			</Label>
			{description ? (
				<span className="text-sm text-muted-foreground mt-1">
					{description}
				</span>
			) : null}
			{error ? (
				<span className="text-sm text-destructive mt-2 w-full">{error}</span>
			) : null}
		</div>
	);
}
