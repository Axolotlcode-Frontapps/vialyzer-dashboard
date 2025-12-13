import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/ui/shared/sheet";
import { ModuleForm } from "./module-form";

export function ModuleAdd({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:min-w-[600px]">
				<SheetHeader>
					<SheetTitle>Agregar modulo</SheetTitle>
					<SheetDescription>Complete los detalles del módulo.</SheetDescription>
				</SheetHeader>

				<ModuleForm onSuccess={() => onOpenChange(false)} />
			</SheetContent>
		</Sheet>
	);
}
