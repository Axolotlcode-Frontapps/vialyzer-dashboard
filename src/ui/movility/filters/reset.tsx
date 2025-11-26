import { LoaderCircle, RefreshCcw } from "lucide-react";

import { Button } from "@/ui/shared/button";
import { useFormFiltersContext } from "./context";

export function Reset({
	label,
	loading,
	onClick,
}: {
	label: string;
	loading?: string;
	onClick?: () => void;
}) {
	const form = useFormFiltersContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button
					type="reset"
					variant="secondary"
					className="hover:cursor-pointer"
					disabled={isSubmitting}
					onClick={() => {
						form.reset();
						onClick?.();
					}}
				>
					{isSubmitting ? (
						<LoaderCircle className="size-4 animate-spin" />
					) : (
						<RefreshCcw className="size-4" />
					)}
					{isSubmitting ? loading : label}
				</Button>
			)}
		</form.Subscribe>
	);
}
