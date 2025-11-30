import { useMemo } from "react";
import { useFieldContext } from "@/contexts/form";

import { Input } from "../input";
import { Label } from "../label";

interface Props extends React.ComponentProps<"input"> {
	label: string;
	placeholder?: string;
}

export function TextField({ label, placeholder, ...props }: Props) {
	const field = useFieldContext<string>();

	const { errors } = field.state.meta;

	const error = useMemo(() => {
		const objErr = errors?.length > 0 ? errors?.[0] : null;
		if (typeof objErr === "string") {
			return objErr;
		}
		if (typeof objErr === "object" && Object.hasOwn(objErr ?? {}, "message")) {
			return objErr.message;
		}

		return null;
	}, [errors]);

	return (
		<Label className="w-full flex-col gap-0 text-sm">
			<span className="block w-full mb-2">{label}</span>
			<Input
				value={field.state.value}
				onChange={(e) => field.handleChange(e.target.value)}
				className="w-full text-sm"
				placeholder={placeholder}
				aria-invalid={!!error}
				{...props}
			/>

			{error ? <span className="w-full text-sm text-destructive mt-2">{error}</span> : null}
		</Label>
	);
}
