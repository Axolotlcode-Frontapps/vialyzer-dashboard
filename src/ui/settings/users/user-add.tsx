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
import { UserFields } from "./user-form";

export function UserAdd() {
	const [open, setOpen] = useState(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button>
					<CirclePlus />
					<span className="hidden sm:inline">Crear usuario</span>
				</Button>
			</SheetTrigger>
			<SheetContent
				className="w-full sm:min-w-[600px]"
				onOpenAutoFocus={(e) => e.preventDefault()}
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<SheetHeader>
					<SheetTitle>Crear usuario</SheetTitle>
					<SheetDescription>
						Vas a crear un nuevo usuario. Completa la información necesaria y guarda para agregar el
						usuario.
					</SheetDescription>
				</SheetHeader>

				<UserFields onSuccess={setOpen} />
			</SheetContent>
		</Sheet>
	);
}
