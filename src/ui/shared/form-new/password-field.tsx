import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useFieldContext } from "@/contexts/form-context";

import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";

interface Props extends React.ComponentProps<"input"> {
	label?: string;
	placeholder?: string;
}

export function PasswordField({
	label = "Contraseña",
	placeholder = "Contraseña",
	...props
}: Props) {
	const field = useFieldContext<string>();
	const [showPassword, setShowPassword] = useState(false);

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
		<Label className="flex-col gap-0 text-sm relative">
			<span className="block w-full mb-2">{label}</span>
			<Input
				type={showPassword ? "text" : "password"}
				value={field.state.value}
				onChange={(e) => field.handleChange(e.target.value)}
				className="w-full text-sm"
				placeholder={placeholder}
				aria-invalid={!!error}
				{...props}
			/>

			<Button
				size="icon"
				variant="ghost"
				className="absolute top-[32px] right-1 hover:bg-white/10 cursor-pointer"
				type="button"
				onClick={() => setShowPassword(!showPassword)}
			>
				{showPassword ? <Eye /> : <EyeOff />}
			</Button>

			{error ? <span className="w-full text-sm text-destructive mt-2">{error}</span> : null}
		</Label>
	);
}
