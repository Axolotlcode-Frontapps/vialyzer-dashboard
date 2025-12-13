import { useMemo } from "react";

import { Label } from "@/ui/shared/label";
import { Slider } from "@/ui/shared/slider";
import { useFieldDrawingContext } from "./context";

interface Props {
	label?: string;
	description?: string;
	min?: number;
	max?: number;
	step?: number;
	unit?: string;
	className?: string;
}

export function SliderField({
	label,
	description,
	min = 0,
	max = 100,
	step = 1,
	unit = "",
	className = "",
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

	const displayValue = useMemo(() => {
		const value = field.state.value ?? min;
		return unit ? `${value}${unit}` : value.toString();
	}, [field.state.value, min, unit]);

	return (
		<Label className="flex-col gap-0">
			{label ? (
				<div className="flex justify-between items-center gap-2 mb-2">
					<span className="block text-sm">{label}</span>
					<span className="text-xs text-gray-500">{displayValue}</span>
				</div>
			) : null}
			<Slider
				value={[field.state.value ?? min]}
				onValueChange={(values) => field.handleChange(values[0])}
				min={min}
				max={max}
				step={step}
				className={`w-full ${className}`}
			/>
			{description ? (
				<span className="text-sm text-muted-foreground mt-1">{description}</span>
			) : null}
			{error ? <span className="text-sm text-destructive mt-2 w-full">{error}</span> : null}
		</Label>
	);
}
