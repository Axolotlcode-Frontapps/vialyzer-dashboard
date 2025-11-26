import { useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/ui/shared/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/ui/shared/command";
import { Label } from "@/ui/shared/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/shared/popover";
import { useFieldFiltersContext } from "./context";

interface Props extends React.ComponentProps<"input"> {
	label?: string;
	description?: string;
	empty?: string;
	options?: { value: string | number; label: string }[];
}

export function SingleSelectField({
	label,
	description,
	options = [],
	empty = "Sin opciones",
	...props
}: Props) {
	const field = useFieldFiltersContext<string | number | undefined>();

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
		<Label className={cn("w-full flex-col gap-0", props.className)}>
			{label ? (
				<span className="block w-full mb-3.5 text-sm">{label}</span>
			) : null}
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						className={cn(
							"w-full justify-between",
							props.className,
							!field.state.value && "text-muted-foreground"
						)}
					>
						{typeof field.state.value === "string" ||
						typeof field.state.value === "number"
							? options.find((option) => option.value === field.state.value)
									?.label
							: props.placeholder}
						<ChevronsUpDown className="opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0">
					<Command>
						<CommandInput
							placeholder={props.placeholder ?? "Search..."}
							className="h-9"
						/>
						<CommandList>
							<CommandEmpty>{empty}</CommandEmpty>
							<CommandGroup>
								{options.map((option) => (
									<CommandItem
										value={
											typeof option.value === "string"
												? option.value
												: option.value.toString()
										}
										key={option.value}
										onSelect={(currentValue) => {
											const isString = typeof option.value === "string";
											const parsedValue = isString
												? currentValue
												: parseInt(currentValue, 10);

											field.handleChange(
												parsedValue === field.state.value
													? undefined
													: option.value
											);
										}}
									>
										{option.label}
										<Check
											className={cn(
												"ml-auto",
												option.value === field.state.value
													? "opacity-100"
													: "opacity-0"
											)}
										/>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{description ? (
				<span className="text-sm text-muted-foreground">{description}</span>
			) : null}
			{error ? (
				<span className="text-sm text-destructive mt-2 w-full">{error}</span>
			) : null}
		</Label>
	);
}
