import { Send } from "lucide-react";

import { Button } from "@/ui/shared/button";
import { Spinner } from "@/ui/shared/spinner";
import { useFormFiltersContext } from "./context";

export function Submit({ label, loading }: { label: string; loading?: string }) {
	const form = useFormFiltersContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button type="submit" className="hover:cursor-pointer" disabled={isSubmitting}>
					{isSubmitting ? <Spinner /> : <Send className="size-4" />}
					{isSubmitting ? loading : label}
				</Button>
			)}
		</form.Subscribe>
	);
}
