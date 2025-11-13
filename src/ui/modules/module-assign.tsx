import { useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AssignModuleValues } from "@/lib/schemas/roles";

import { rolesSchemas } from "@/lib/schemas/roles";
import { modulesServices } from "@/lib/services/modules";
import { rolesService } from "@/lib/services/roles";
import { Button } from "../shared/button";
import { Checkbox } from "../shared/checkbox";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
	FieldTitle,
} from "../shared/field";
import { ScrollArea } from "../shared/scroll-area";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "../shared/sheet";
import { Spinner } from "../shared/spinner";

export function ModuleAssign({
	role,
	open,
	onOpenChange,
}: {
	role: Role;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();

	const { data: moduleByRole } = useQuery({
		queryKey: ["role-by-id", role.id],
		queryFn: async () => await rolesService.getRoleById(role.id),
		enabled: !!role.id && open,
		select: (data) => data.payload,
	});

	const selectedModuleIds = useMemo(() => {
		return moduleByRole?.modules?.map((module) => module.id) || [];
	}, [moduleByRole]);

	const { data: modules } = useQuery({
		queryKey: ["modules"],
		queryFn: async () => await modulesServices.getAllModules(),
		select: (data) => data.payload,
	});

	const assignMutation = useMutation({
		mutationFn: async (values: AssignModuleValues) => {
			form.state.isSubmitting = true;
			return await rolesService.assignModulesToRole(role.id, values);
		},
		onSuccess: () => {
			form.reset();
			toast.success("Módulos asignados correctamente al rol.");
			queryClient.invalidateQueries({ queryKey: ["role-by-id", role.id] });
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			onOpenChange(false);
		},
		onError: (error) => {
			console.error(error);
			toast.error("Error al asignar módulos al rol.");
		},
		onSettled: () => {
			form.state.isSubmitting = false;
			form.state.canSubmit = false;
		},
	});

	const form = useForm({
		defaultValues: {
			modulesIds: selectedModuleIds ?? ([] as string[]),
		},
		validators: {
			onMount: rolesSchemas.assignModule,
			onChange: rolesSchemas.assignModule,
		},
		onSubmit: ({ value }) => assignMutation.mutate(value),
	});

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:min-w-[600px]">
				<SheetHeader>
					<SheetTitle>Asignar módulo</SheetTitle>
					<SheetDescription>
						Seleccione un módulo para asignar al rol.
					</SheetDescription>
				</SheetHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					id="module-assign-form"
					className="mx-4"
				>
					<form.Field
						name="modulesIds"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<FieldSet>
									<FieldDescription>
										Seleccione los módulos que desea asignar al rol.
									</FieldDescription>
									<ScrollArea className="h-[450px]">
										<FieldGroup data-slot="checkbox-group">
											{modules?.map((module) => (
												<FieldLabel key={module.id} htmlFor={module.id}>
													<Field
														orientation="horizontal"
														data-invalid={isInvalid}
														className="flex items-center"
													>
														<Checkbox
															id={module.id}
															name={field.name}
															aria-invalid={isInvalid}
															checked={field.state.value.includes(module.id)}
															onCheckedChange={(checked) => {
																if (checked) {
																	field.pushValue(module.id);
																} else {
																	const index = field.state.value.indexOf(
																		module.id
																	);
																	if (index > -1) {
																		field.removeValue(index);
																	}
																}
															}}
														/>
														<FieldContent className="gap-0">
															<FieldTitle className="capitalize">
																{module.name}
															</FieldTitle>
															<FieldDescription>
																{module.description}
															</FieldDescription>
														</FieldContent>
														{/* <RadioGroupItem
															value={plan.id}
															id={`form-tanstack-radiogroup-${plan.id}`}
															aria-invalid={isInvalid}
														/> */}
													</Field>
												</FieldLabel>
											))}
										</FieldGroup>
									</ScrollArea>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</FieldSet>
							);
						}}
					/>
				</form>

				<SheetFooter>
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button
								type="submit"
								disabled={!canSubmit}
								form="module-assign-form"
							>
								{isSubmitting ? <Spinner /> : null}
								{isSubmitting
									? "Confirmando asignación"
									: "Confirmar asignación"}
							</Button>
						)}
					</form.Subscribe>
					<SheetClose asChild>
						<Button variant="outline">Cancelar</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
