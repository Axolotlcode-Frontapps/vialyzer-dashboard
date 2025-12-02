import { useMemo, useState } from "react";
import { ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/ui/shared/button";
import { Checkbox } from "@/ui/shared/checkbox";
import { Input } from "@/ui/shared/input";
import { Label } from "@/ui/shared/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/shared/popover";
import { useFieldFiltersContext } from "./context";

interface Props extends React.ComponentProps<"input"> {
	label?: string;
	description?: string;
	all?: string;
	options?: { value: string; label: string }[];
}

export function MultiSelectField({
	label,
	description,
	options = [],
	all = "Todas las opciones",
	...props
}: Props) {
	const [search, setSearch] = useState("");
	const field = useFieldFiltersContext<string[]>();

	const filtered = useMemo(
		() =>
			options.filter((option) =>
				option.label.toLowerCase().includes(search.toLowerCase())
			),
		[search, options]
	);

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
						{field.state.value.length > 0
							? `${field.state.value.length} opciones seleccionadas`
							: props.placeholder}
						<ChevronsUpDown className="opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0 pb-4">
					<div className="flex h-full items-center flex-col gap-2 max-h-[320px] overflow-y-auto">
						<Input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							className="mb-2 sticky top-0 z-10 bg-popover dark:bg-popover"
							placeholder={props.placeholder}
						/>
						<label
							htmlFor={`all-${field.name}`}
							className="w-full pl-2 flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							<Checkbox
								id={`all-${field.name}`}
								name={`all-${field.name}`}
								checked={options.every((option) =>
									field.state.value.includes(option.value)
								)}
								onCheckedChange={(checked) =>
									checked
										? field.handleChange(options.map((option) => option.value))
										: field.handleChange([])
								}
							/>
							<span>{all}</span>
						</label>
						{filtered.map((option) => (
							<label
								htmlFor={option.value}
								key={option.value}
								className="w-full pl-2 flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								<Checkbox
									checked={field.state.value.includes(option.value)}
									onCheckedChange={(checked) =>
										checked
											? field.handleChange([...field.state.value, option.value])
											: field.handleChange(
													field.state.value.filter(
														(value) => value !== option.value
													)
												)
									}
								/>
								<span>{option.label}</span>
							</label>
						))}
					</div>
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
