import { LoaderCircle, Send } from "lucide-react";

import { Button } from "@/ui/shared/button";
import { useFormDrawingContext } from "./context";

export function Submit({
	label,
	loading,
}: {
	label: string;
	loading?: string;
}) {
	const form = useFormDrawingContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button
					type="submit"
					className="hover:cursor-pointer"
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<LoaderCircle className="size-4 animate-spin" />
					) : (
						<Send className="size-4" />
					)}
					{isSubmitting ? loading : label}
				</Button>
			)}
		</form.Subscribe>
	);
}
