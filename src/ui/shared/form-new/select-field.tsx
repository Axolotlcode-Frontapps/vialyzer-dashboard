import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useFieldContext } from "@/contexts/form-context";

import { Button } from "../button";
import { Label } from "../label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../select";

interface Props<T> {
	label: string;
	placeholder?: string;
	options: T[];
}

interface Option {
	id: string;
	name: string;
}

export function SelectField<T extends Option>({
	label,
	placeholder,
	options,
}: Props<T>) {
	const field = useFieldContext<string>();
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
		field.handleChange("");
		setOpen(false);
	};

	return (
		<div className="w-full flex-col gap-0 text-sm relative">
			<Label className="block w-full mb-2">{label}</Label>

			<Select
				open={open}
				onValueChange={field.handleChange}
				value={field.state.value}
				onOpenChange={setOpen}
			>
				<SelectTrigger className="w-full" aria-invalid={!!error}>
					<SelectValue placeholder={placeholder ?? ""} />
				</SelectTrigger>

				<SelectContent className="w-full">
					{options.map((option) => (
						<SelectItem key={option.id} value={option.id}>
							{option.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{field.state.value ? (
				<Button
					onClick={handleReset}
					variant="ghost"
					className="absolute opacity-35 right-8 top-[30px] cursor-pointer !p-0 size-[20px] hover:bg-transparent hover:text-white"
				>
					<X />
				</Button>
			) : null}

			{error ? (
				<span className="block w-full text-sm text-destructive mt-2">
					{error}
				</span>
			) : null}
		</div>
	);
}
