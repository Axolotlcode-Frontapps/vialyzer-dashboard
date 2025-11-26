import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";

import { Field, FieldLabel } from "./field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "./input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export function ForgotPasswordInput({
	isInvalid,
	label,
	placeholder,
	children,
	value,
	name,
	handleBlur,
	handleChange,
}: {
	isInvalid: boolean;
	label: string;
	placeholder?: string;
	children?: () => React.ReactNode;
	value: string;
	name: string;
	handleBlur: () => void;
	handleChange: (value: string) => void;
}) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<>
			<Field data-invalid={isInvalid}>
				<FieldLabel htmlFor={name}>{label}</FieldLabel>
				<InputGroup>
					<InputGroupInput
						type={showPassword ? "text" : "password"}
						placeholder={placeholder ?? "Contraseña"}
						value={value}
						onBlur={handleBlur}
						onChange={(e) => handleChange(e.target.value)}
					/>
					<InputGroupAddon align="inline-end">
						<Tooltip>
							<TooltipTrigger asChild>
								<InputGroupButton
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? <Eye /> : <EyeClosed />}
								</InputGroupButton>
							</TooltipTrigger>
							<TooltipContent>
								<p>
									{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
								</p>
							</TooltipContent>
						</Tooltip>
					</InputGroupAddon>
				</InputGroup>
			</Field>
			{children ? children() : null}
		</>
	);
}
