import { useMemo } from "react";

import { Label } from "../../label";
import { ToggleGroup, ToggleGroupItem } from "../../toggle-group";
import { useFieldDrawingContext } from "./context";

/**
 * ToggleGroupField - A reusable toggle group component for forms
 *
 * Note: This component prevents the default HTML label behavior that would
 * automatically select the first toggle item when clicking on the label text.
 * The label click is intercepted and prevented to avoid unintended selections.
 *
 * @example
 * // Single selection (default)
 * <field.ToggleGroupField
 *   label="Font Size"
 *   type="single"
 *   options={[
 *     { value: 12, label: "12px" },
 *     { value: 16, label: "16px" },
 *     { value: 20, label: "20px" }
 *   ]}
 * />
 *
 * @example
 * // Multiple selection
 * <field.ToggleGroupField
 *   label="Text Styles"
 *   type="multiple"
 *   options={[
 *     { value: "bold", label: "Bold" },
 *     { value: "italic", label: "Italic" },
 *     { value: "underline", label: "Underline" }
 *   ]}
 * />
 */

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
			return value?.toString() || "";
		} else {
			if (Array.isArray(value)) {
				return value.map((v) => v.toString());
			}
			return [];
		}
	};

	return (
		<Label className="flex-col gap-0 cursor-default">
			{label && (
				<span className="block w-full mb-3.5 text-sm pointer-events-none">
					{label}
				</span>
			)}

			{type === "single" ? (
				<ToggleGroup
					type="single"
					value={getCurrentValue() as string}
					onValueChange={handleValueChange}
					variant={variant}
					size={size}
					className={className}
				>
					{options.map((option) => (
						<ToggleGroupItem
							key={option.value.toString()}
							value={option.value.toString()}
							className={option.className}
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
							className={option.className}
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
		</Label>
	);
}
