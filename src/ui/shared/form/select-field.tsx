import { useMemo, useState } from "react";
import { useFieldContext } from "@/contexts/form";

import { Label } from "../label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import { ResetField } from "./reset-field";

interface Option {
	label: string;
	value: string;
}
interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	placeholder?: string;
	options: Option[];
}

export function SelectField({ label, placeholder, options, disabled }: Props) {
	const field = useFieldContext<string | undefined>();
	const [open, setOpen] = useState(false);

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

	const handleReset = () => {
		field.handleChange(undefined);
		setOpen(false);
	};

	return (
		<div className="w-full flex-col gap-0 text-sm relative">
			{label && <Label className="block w-full mb-2">{label}</Label>}

			<Select
				open={open}
				onValueChange={field.handleChange}
				value={field.state.value ?? ""}
				onOpenChange={setOpen}
				disabled={disabled}
			>
				<SelectTrigger size="default" className="w-full" aria-invalid={!!error}>
					<SelectValue placeholder={placeholder ?? ""} />
				</SelectTrigger>

				<SelectContent className="w-full">
					{options.map((option) => (
						<SelectItem key={option.label} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{field.state.value ? <ResetField onReset={handleReset} /> : null}

			{error ? <span className="block w-full text-sm text-destructive mt-2">{error}</span> : null}
		</div>
	);
}
