import { useMemo } from "react";

import { cn } from "@/lib/utils/cn";
import { ToggleGroup, ToggleGroupItem } from "@/ui/shared/toggle-group";
import { useFieldDrawingContext } from "./context";

interface ToggleGroupOption {
	value: string | number;
	label: string;
	className?: string;
}

interface Props {
	label?: string;
	description?: string;
	options: ToggleGroupOption[];
	variant?: "default" | "outline";
	size?: "default" | "sm" | "lg";
	className?: string;
	type?: "single" | "multiple";
}

export function ToggleGroupField({
	label,
	description,
	options,
	variant = "outline",
	size = "sm",
	className = "justify-start",
	type = "single",
}: Props) {
	const field = useFieldDrawingContext<string | number | (string | number)[]>();

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

	const handleValueChange = (value: string | string[]) => {
		if (type === "single" && typeof value === "string") {
			if (!value) {
				return;
			}

			// Find original option to preserve number type
			const originalOption = options.find(
				(opt) => opt.value.toString() === value
			);
			if (originalOption && typeof originalOption.value === "number") {
				field.handleChange(originalOption.value);
			} else {
				field.handleChange(value);
			}
		} else if (type === "multiple" && Array.isArray(value)) {
			const convertedValues = value.map((item) => {
				const originalOption = options.find(
					(opt) => opt.value.toString() === item
				);
				return originalOption && typeof originalOption.value === "number"
					? originalOption.value
					: item;
			});
			field.handleChange(convertedValues);
		}
	};

	const getCurrentValue = () => {
		const value = field.state.value;
		if (type === "single") {
			// Return undefined instead of empty string when no value
			return value !== undefined && value !== null
				? value.toString()
				: undefined;
		} else {
			if (Array.isArray(value)) {
				return value.map((v) => v.toString());
			}
			return [];
		}
	};

	return (
		<div className="flex flex-col gap-0">
			{label && (
				<span className="block w-full mb-3.5 text-sm font-medium">{label}</span>
			)}

			{type === "single" ? (
				<ToggleGroup
					type="single"
					value={field.state.value.toString()}
					onValueChange={handleValueChange}
					variant={variant}
					size={size}
					className={className}
				>
					{options.map((option) => (
						<ToggleGroupItem
							key={option.value.toString()}
							value={option.value.toString()}
							className={cn(option.className, "min-w-max")}
						>
							{option.label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			) : (
				<ToggleGroup
					type="multiple"
					value={getCurrentValue() as string[]}
					onValueChange={handleValueChange}
					variant={variant}
					size={size}
					className={className}
				>
					{options.map((option) => (
						<ToggleGroupItem
							key={option.value.toString()}
							value={option.value.toString()}
							className={cn(option.className, "min-w-max")}
						>
							{option.label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			)}

			{description ? (
				<span className="text-sm text-muted-foreground">{description}</span>
			) : null}
			{error ? (
				<span className="text-sm text-destructive mt-2 w-full">{error}</span>
			) : null}
		</div>
	);
}
