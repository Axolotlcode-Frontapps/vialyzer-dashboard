import { format } from "@formkit/tempo";
import { CalendarIcon } from "lucide-react";

import type * as React from "react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils/cn";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export default function DateRangePicker({
	className,
	onChoose,
	value,
	disabled,
}: React.HTMLAttributes<HTMLDivElement> & {
	onChoose: (date: DateRange | undefined) => void;
	value: DateRange | undefined;
	disabled?: { after: Date };
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
						{value?.from ? (
							value.to ? (
								<>
									{format(value.from, "MMM DD, YYYY", "es-CO").toUpperCase()} -{" "}
									{format(value.to, "MMM DD, YYYY", "es-CO").toUpperCase()}
								</>
							) : (
								format(value.from, "MMM DD, YYYY", "es-CO").toUpperCase()
							)
						) : (
							<span>Escoge una fecha</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						autoFocus
						mode="range"
						defaultMonth={value?.from}
						selected={value}
						onSelect={onChoose}
						numberOfMonths={2}
						disabled={disabled}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
