import { LoaderCircle } from "lucide-react";
import { useFormContext } from "@/contexts/form-context";

import { Button } from "../button";

export function SubmitButton({
	formId,
	label,
	labelLoading,
}: {
	formId?: string;
	label: string;
	labelLoading?: string;
}) {
	const form = useFormContext();

	return (
		<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
			{([canSubmit, isSubmitting]) => {
				return (
					<Button type="submit" form={formId} className="w-full" disabled={!canSubmit}>
						{isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
						{isSubmitting ? labelLoading : label}
					</Button>
				);
			}}
		</form.Subscribe>
	);
}
