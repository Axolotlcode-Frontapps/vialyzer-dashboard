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
import { RoleForm } from "./role-form";

export function RoleAdd() {
	const [open, setOpen] = useState(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button>
					<CirclePlus />
					<span className="hidden sm:inline">Crear rol</span>
				</Button>
			</SheetTrigger>
			<SheetContent className="w-full sm:min-w-[600px]">
				<SheetHeader>
					<SheetTitle>Crear rol</SheetTitle>
					<SheetDescription>
						Vas a crear un nuevo rol. Completa la información necesaria y guarda para agregar el
						rol.
					</SheetDescription>
				</SheetHeader>

				<RoleForm onSuccess={setOpen} />
			</SheetContent>
		</Sheet>
	);
}
