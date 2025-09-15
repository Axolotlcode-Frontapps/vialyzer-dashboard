import { useMemo } from "react";
import { useFieldContext } from "@/contexts/form";

import { Label } from "../label";
import { Switch } from "../switch";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
}

export function Switchfield({ label }: Props) {
	const field = useFieldContext<boolean>();
	const { errors } = field.state.meta;

	const error = useMemo(() => {
		const objErr = errors?.[0];
		return typeof objErr === "string"
			? objErr
			: typeof objErr === "object" && "message" in objErr
				? objErr.message
				: null;
	}, [errors]);

	return (
		<>
			{label && (
				<Label className="flex-row-reverse items-center gap-2 text-sm cursor-pointer">
					<span className="block w-full py-1">{label}</span>{" "}
					<Switch checked={field.state.value} onCheckedChange={field.handleChange} />
				</Label>
			)}

			{error && <span className="text-sm text-destructive mt-2">{error}</span>}
		</>
	);
}
