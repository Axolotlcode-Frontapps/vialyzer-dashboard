import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/ui/shared/sheet";
import { ModuleForm } from "./module-form";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	module: Module;
}

export function ModuleEdit({ open, onOpenChange, module }: Props) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:min-w-[600px]">
				<SheetHeader>
					<SheetTitle>Editar modulo</SheetTitle>
					<SheetDescription>Complete los detalles del módulo.</SheetDescription>
				</SheetHeader>

				<ModuleForm onSuccess={() => onOpenChange(false)} module={module} isUpdate />
			</SheetContent>
		</Sheet>
	);
}
