import { format } from "@formkit/tempo";
import { CalendarIcon } from "lucide-react";

import type * as React from "react";

import { cn } from "@/lib/utils/cn";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export default function DatePicker({
	className,
	onChoose,
	value,
	disabled,
}: React.HTMLAttributes<HTMLDivElement> & {
	onChoose: (date: Date | undefined) => void;
	value: Date | undefined;
	disabled?: boolean;
}) {
	return (
		<div className={cn("grid gap-2", className)}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant="outline"
						className={cn(
							"w-full @2xl/filters:max-w-[300px] justify-start text-left font-normal",
							!value && "text-muted-foreground"
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{value ? (
							format(value, "MMM DD, YYYY")
						) : (
							<span>Seleccionar fecha</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						autoFocus
						mode="single"
						defaultMonth={value}
						selected={value}
						onSelect={onChoose}
						disabled={disabled}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
