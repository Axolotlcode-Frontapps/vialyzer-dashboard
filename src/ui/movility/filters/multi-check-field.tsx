import { useMemo } from "react";

import { Button } from "@/ui/shared/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/shared/field";
import { Skeleton } from "@/ui/shared/skeleton";
import { useFieldFiltersContext } from "./context";

interface Props extends React.ComponentProps<"input"> {
	label?: string;
	description?: string;
	options?: { value: string; label: string }[];
	loading?: boolean;
}

export function MultiCheckField({ label, description, options = [], loading }: Props) {
	const field = useFieldFiltersContext<string[]>();

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
			<div className="flex flex-wrap gap-2">
				{!loading ? (
					options.map((option) => (
						<Button
							key={option.value}
							type="button"
							size="sm"
							variant={field.state.value.includes(option.value) ? "default" : "outline"}
							onClick={() => {
								const selected = field.state.value.includes(option.value)
									? field.state.value.filter((c) => c !== option.value)
									: [...field.state.value, option.value];
								field.handleChange(selected);
							}}
							className="capitalize"
						>
							{option.label}
						</Button>
					))
				) : (
					<>
						<Skeleton className="h-8 w-22 rounded-md" />
						<Skeleton className="h-8 w-22 rounded-md" />
						<Skeleton className="h-8 w-18 rounded-md" />
						<Skeleton className="h-8 w-20 rounded-md" />
						<Skeleton className="h-8 w-20 rounded-md" />
						<Skeleton className="h-8 w-18 rounded-md" />
						<Skeleton className="h-8 w-28 rounded-md" />
					</>
				)}
			</div>
			{error ? <FieldError>{error}</FieldError> : null}
		</Field>
	);
}
