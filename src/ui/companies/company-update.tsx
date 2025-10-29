import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppForm } from "@/contexts/form";

import type { CompanyValues } from "@/lib/schemas/settings";

import { companiesService } from "@/lib/services/companies";
import { Button } from "@/ui/shared/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/ui/shared/sheet";

export function CompanyUpdate({
	company,
	open,
	onOpenChange,
}: {
	company: Company;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();

	const companyUpdateMutation = useMutation({
		mutationFn: async (values: CompanyValues) => {
			return await companiesService.updateCompany(company.id, values);
		},
		onSuccess: () => {
			form.reset();
			toast.success(`Empresa actualizada correctamente`, {
				description: `Se ha actualizado la empresa "${company.name}" correctamente.`,
			});
		},
		onError: (error) => {
			form.state.canSubmit = true;
			toast.error(`Error al actualizar la empresa`, {
				description:
					error instanceof Error
						? error.message
						: "Por favor, inténtalo de nuevo.",
			});
		},
		onSettled: () => {
			form.state.isSubmitting = false;
			queryClient.invalidateQueries({ queryKey: ["companies"] });
			onOpenChange(false);
		},
	});

	const form = useAppForm({
		// ...companyFieldsOpts,
		defaultValues: {
			name: company.name ?? "",
			description: company.description ?? "",
			nit: company.nit ?? "",
			phone: company.phone ?? "",
			address: company.address ?? "",
			department: company.department ?? "",
			city: company.city ?? "",
		},
		onSubmit: ({ value }) =>
			companyUpdateMutation.mutate(value as CompanyValues),
	});

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

				{/* <CompanyFields form={form} formId="company-edit-form" /> */}

				<SheetFooter>
					<form.AppForm>
						<form.SubmitButton
							form="company-edit-form"
							label="Actualizar empresa"
							labelLoading="Actualizando empresa..."
						/>
					</form.AppForm>
					<SheetClose asChild>
						<Button variant="destructive">Cancelar</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
