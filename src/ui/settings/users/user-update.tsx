import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/ui/shared/sheet";
import { UserFields } from "./user-form";

export function UserUpdate({
	user,
	open,
	onOpenChange,
}: {
	user: User;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:min-w-[600px]">
				<SheetHeader>
					<SheetTitle>Actualizar usuario</SheetTitle>
					<SheetDescription>
						Vas a actualizar un usuario existente. Completa la información necesaria y guarda para
						aplicar los cambios.
					</SheetDescription>
				</SheetHeader>

				<UserFields onSuccess={onOpenChange} update user={user} />
			</SheetContent>
		</Sheet>
	);
}
