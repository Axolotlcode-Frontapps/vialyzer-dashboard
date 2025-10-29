import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/ui/shared/sheet";
import { CompanyForm } from "./company-form";

export function CompanyUpdate({
	company,
	open,
	onOpenChange,
}: {
	company: Company;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:min-w-[600px]">
				<SheetHeader>
					<SheetTitle>Editar empresa</SheetTitle>
					<SheetDescription>
						Vas a modificar la información de esta empresa. Realiza los cambios
						necesarios y guarda para actualizar la empresa.
					</SheetDescription>
				</SheetHeader>

				<CompanyForm onSuccess={onOpenChange} update company={company} />
			</SheetContent>
		</Sheet>
	);
}
