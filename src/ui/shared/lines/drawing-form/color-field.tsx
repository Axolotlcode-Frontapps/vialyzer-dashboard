import { useMemo } from "react";

import { Label } from "../../label";
import { useFieldDrawingContext } from "./context";

interface Props {
	label?: string;
	description?: string;
	placeholder?: string;
	className?: string;
}

export function ColorField({
	label,
	description,
	placeholder = "#000000",
	className = "",
}: Props) {
	const field = useFieldDrawingContext<string>();

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
			<div className="flex items-center gap-2">
				<input
					type="color"
					value={field.state.value || placeholder}
					onChange={(e) => field.handleChange(e.target.value)}
					className={`w-12 h-10 rounded border border-gray-300 cursor-pointer ${className}`}
				/>
				<div className="flex-1 text-sm text-gray-600">
					{field.state.value || placeholder}
				</div>
			</div>
			{description ? (
				<span className="text-sm text-muted-foreground mt-1">
					{description}
				</span>
			) : null}
			{error ? (
				<span className="text-sm text-destructive mt-2 w-full">{error}</span>
			) : null}
		</Label>
	);
}
