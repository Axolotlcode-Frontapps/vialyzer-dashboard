import { useState } from "react";
import { CirclePlus } from "lucide-react";

import { Button } from "@/ui/shared/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/ui/shared/sheet";
import { CompanyForm } from "./company-form";

export function CompanyAdd() {
	const [open, setOpen] = useState(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button>
					<CirclePlus />
					<span className="hidden sm:inline">Crear empresa</span>
				</Button>
			</SheetTrigger>
			<SheetContent
				className="w-full sm:min-w-[600px]"
				onOpenAutoFocus={(e) => e.preventDefault()}
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<SheetHeader>
					<SheetTitle>Crear empresa</SheetTitle>
					<SheetDescription>
						Vas a crear una nueva empresa. Completa la información necesaria y guarda para agregar
						la empresa.
					</SheetDescription>
				</SheetHeader>

				<CompanyForm onSuccess={setOpen} />
			</SheetContent>
		</Sheet>
	);
}
