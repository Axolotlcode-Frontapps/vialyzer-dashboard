import { useMemo } from "react";

import { Button } from "@/ui/shared/button";
import { Label } from "@/ui/shared/label";
import { Skeleton } from "@/ui/shared/skeleton";
import { useFieldFiltersContext } from "./context";

interface Props extends React.ComponentProps<"input"> {
	label?: string;
	description?: string;
	options?: { value: string; label: string }[];
	loading?: boolean;
}

export function MultiCheckField({
	label,
	description,
	options = [],
	loading,
}: Props) {
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
		<Label className="flex-col gap-0">
			{label ? (
				<span className="block w-full mb-3.5 text-sm">{label}</span>
			) : null}
			<div className="flex flex-wrap gap-2 py-[5px]">
				{!loading ? (
					options.map((option) => (
						<Button
							key={option.value}
							type="button"
							size="sm"
							variant={
								field.state.value.includes(option.value) ? "default" : "outline"
							}
							onClick={() => {
								const selected = field.state.value.includes(option.value)
									? field.state.value.filter((c) => c !== option.value)
									: [...field.state.value, option.value];
								field.handleChange(selected);
							}}
						>
							{option.label}
						</Button>
					))
				) : (
					<>
						<Skeleton className="h-[30px] w-22 rounded-full" />
						<Skeleton className="h-[30px] w-22 rounded-full" />
						<Skeleton className="h-[30px] w-18 rounded-full" />
						<Skeleton className="h-[30px] w-20 rounded-full" />
						<Skeleton className="h-[30px] w-20 rounded-full" />
						<Skeleton className="h-[30px] w-18 rounded-full" />
						<Skeleton className="h-[30px] w-28 rounded-full" />
					</>
				)}
			</div>
			{description ? (
				<span className="text-sm text-muted-foreground">{description}</span>
			) : null}
			{error ? (
				<span className="text-sm text-destructive mt-2 w-full">{error}</span>
			) : null}
		</Label>
	);
}
