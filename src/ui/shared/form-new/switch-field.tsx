import { useMemo } from "react";
import { useFieldContext } from "@/contexts/form-context";

import { Label } from "../label";
import { Switch } from "../switch";

interface Props {
	label: string;
}

export function SwitchField({ label }: Props) {
	const field = useFieldContext<boolean>();

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

	return (
		<Label className="flex gap-0 text-sm relative cursor-pointer">
			<div className="flex items-center space-x-2">
				<Switch
					checked={field.state.value}
					onCheckedChange={field.handleChange}
				/>
				<span className="block w-full">{label}</span>
			</div>

			{error ? (
				<span className="w-full text-sm text-destructive mt-2">{error}</span>
			) : null}
		</Label>
	);
}
