import { useMemo } from "react";
import { date, dayEnd, dayStart, format } from "@formkit/tempo";

import DateRangePicker from "@/ui/shared/date-range-picker";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/shared/field";
import { useFieldFiltersContext } from "./context";

interface Props {
	label?: string;
	description?: string;
	endDate?: string;
	onChooseEndDate?: (date: string) => void;
	className?: string;
}

export function DateRangeField({ label, description, endDate, onChooseEndDate }: Props) {
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
		<Field orientation="responsive" className="@md/filters:max-w-fit">
			{label ? <FieldLabel>{label}</FieldLabel> : null}
			{description ? <FieldDescription>{description}</FieldDescription> : null}
			<DateRangePicker
				className="w-full"
				disabled={{ after: new Date() }}
				value={{
					from: date(field.state.value),
					to: date(endDate),
				}}
				onChoose={(value) => {
					if (value?.from) {
						field.handleChange(format(dayStart(value.from), "YYYY-MM-DDTHH:mm:ssZ"));
					}
					if (value?.to) {
						onChooseEndDate?.(format(dayEnd(value.to), "YYYY-MM-DDTHH:mm:ssZ"));
					}
				}}
			/>
			{error ? <FieldError>{error}</FieldError> : null}
		</Field>
	);
}
