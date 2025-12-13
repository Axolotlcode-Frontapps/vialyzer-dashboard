import { useMemo } from "react";

import { Label } from "@/ui/shared/label";
import { Toggle } from "@/ui/shared/toggle";
import { useFieldDrawingContext } from "./context";

interface Props {
	label?: string;
	description?: string;
	variant?: "default" | "outline";
	size?: "default" | "sm" | "lg";
	className?: string;
	children?: React.ReactNode;
	"aria-label"?: string;
}

export function ToggleField({
	label,
	description,
	variant = "outline",
	size = "sm",
	className,
	children,
	"aria-label": ariaLabel,
}: Props) {
	const field = useFieldDrawingContext<boolean>();

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
		<Label className="flex-col gap-0 items-start">
			{label ? <span className="block w-full mb-3 text-sm">{label}</span> : null}

			<Toggle
				pressed={field.state.value || false}
				onPressedChange={(pressed) => field.handleChange(pressed)}
				variant={variant}
				size={size}
				className={className}
				aria-label={ariaLabel}
			>
				{children}
			</Toggle>

			{description ? <span className="text-sm text-muted-foreground">{description}</span> : null}
			{error ? <span className="text-sm text-destructive mt-2 w-full">{error}</span> : null}
		</Label>
	);
}
