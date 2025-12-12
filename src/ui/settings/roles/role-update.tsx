import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/ui/shared/sheet";
import { RoleForm } from "./role-form";

export function RoleUpdate({
	role,
	open,
	onOpenChange,
}: {
	role: Role;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:min-w-[600px]">
				<SheetHeader>
					<SheetTitle>Editar rol</SheetTitle>
					<SheetDescription>
						Vas a modificar la información de este rol. Realiza los cambios necesarios y guarda para
						actualizar el rol.
					</SheetDescription>
				</SheetHeader>
				<RoleForm onSuccess={onOpenChange} update role={role} />
			</SheetContent>
		</Sheet>
	);
}
