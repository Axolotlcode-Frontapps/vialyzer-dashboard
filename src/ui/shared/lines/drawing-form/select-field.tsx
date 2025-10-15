import { useMemo } from "react";

import { Label } from "../../label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../select";
import { useFieldDrawingContext } from "./context";

interface Props {
	label?: string;
	description?: string;
	placeholder?: string;
	options: { value: number; label: string }[];
}

export function SelectField({
	label,
	description,
	placeholder,
	options,
}: Props) {
	const field = useFieldDrawingContext<number>();

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
			<Select
				value={field.state.value?.toString()}
				onValueChange={(value) => field.handleChange(Number(value))}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value.toString()}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{description ? (
				<span className="text-sm text-muted-foreground">{description}</span>
			) : null}
			{error ? (
				<span className="text-sm text-destructive mt-2 w-full">{error}</span>
			) : null}
		</Label>
	);
}
