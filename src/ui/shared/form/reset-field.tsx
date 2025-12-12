import { X } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "../button";

interface Props {
	onReset: () => void;
	className?: string;
}

export function ResetField({ onReset, className = "right-8 top-[35px]" }: Props) {
	return (
		<Button
			variant="ghost"
			className={cn(
				"absolute opacity-35  cursor-pointer !p-0 size-[20px] hover:bg-transparent",
				className
			)}
			onClick={onReset}
		>
			<X />
		</Button>
	);
}
