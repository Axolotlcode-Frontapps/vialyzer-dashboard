import { useMemo } from "react";

import { Input } from "@/ui/shared/input";
import { Label } from "@/ui/shared/label";
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
		<Label className="flex-col gap-0">
			{label ? (
				<span className="block w-full mb-3.5 text-sm">{label}</span>
			) : null}
			<Input
				value={field.state.value}
				onChange={(e) => field.handleChange(e.target.value)}
				className="w-full"
				{...props}
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
