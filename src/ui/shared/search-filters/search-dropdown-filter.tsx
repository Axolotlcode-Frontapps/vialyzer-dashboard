import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useFieldContext } from "@/contexts/form";

import { cn } from "@/lib/utils/cn";
import { Button } from "../button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "../dropdown-menu";

export function SearchDropdownFilter({
	label,
	options = [],
	mode = "single",
}: {
	label: string;
	options: { [key: string]: string }[];
	mode?: "multiple" | "single";
}) {
	const field = useFieldContext<string>();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<DropdownMenu onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="secondary" className="rounded-none cursor-pointer">
					{label}
					<ChevronDown
						className={cn("ml-2 h-4 w-4 transition-transform duration-200", {
							"rotate-180": isOpen,
						})}
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{mode === "multiple" &&
					options?.map((option) => (
						<DropdownMenuCheckboxItem key={option.value}>{option.label}</DropdownMenuCheckboxItem>
					))}

				{mode === "single" && (
					<DropdownMenuRadioGroup value={field.state.value} onValueChange={field.handleChange}>
						{options?.map((option) => (
							<DropdownMenuRadioItem value={option.value} key={option.value}>
								{option.label}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
