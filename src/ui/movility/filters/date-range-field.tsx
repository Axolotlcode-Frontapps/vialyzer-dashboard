import { useMemo } from "react";
import { date } from "@formkit/tempo";

import { cn } from "@/lib/utils/cn";
import DateRangePicker from "@/ui/shared/date-range-picker";
import { Label } from "@/ui/shared/label";
import { useFieldFiltersContext } from "./context";

interface Props {
	label?: string;
	description?: string;
	endDate?: string;
	onChooseEndDate?: (date: string) => void;
	className?: string;
}

export function DateRangeField({
	label,
	description,
	endDate,
	onChooseEndDate,
	className,
}: Props) {
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
		<Label className={cn("w-full flex-col gap-0", className)}>
			{label ? (
				<span className="block w-full mb-3.5 text-sm">{label}</span>
			) : null}
			<DateRangePicker
				className="w-full"
				disabled={{ after: new Date() }}
				value={{
					from: date(field.state.value),
					to: date(endDate),
				}}
				onChoose={(value) => {
					if (value?.from) {
						field.handleChange(value.from.toISOString());
					}
					if (value?.to) {
						onChooseEndDate?.(value.to.toISOString());
					}
				}}
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
