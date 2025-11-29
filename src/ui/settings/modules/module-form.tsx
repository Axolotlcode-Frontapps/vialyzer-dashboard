import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AxiosError } from "axios";
import type { ModuleValues } from "@/lib/schemas/modules";

import { modulesSchemas } from "@/lib/schemas/modules";
import { rolesService } from "@/lib/services/roles";
import { Button } from "@/ui/shared/button";
import { Field, FieldError, FieldLabel } from "@/ui/shared/field";
import { Input } from "@/ui/shared/input";
import { SheetClose, SheetFooter } from "@/ui/shared/sheet";
import { Spinner } from "@/ui/shared/spinner";

export function ModuleForm({
	onSuccess,
	module,
	isUpdate = false,
}: {
	isUpdate?: boolean;
	onSuccess?: () => void;
	module?: Module;
}) {
	const queryClient = useQueryClient();

	const form = useForm({
		defaultValues: {
			name: isUpdate ? (module?.name ?? "") : "",
			description: isUpdate ? (module?.description ?? "") : "",
		},
		validators: {
			onMount: modulesSchemas.module,
			onChange: modulesSchemas.module,
		},
		onSubmit: ({ value }) => createModuleMutation.mutate(value),
	});

	const createModuleMutation = useMutation({
		mutationFn: async (values: ModuleValues) => {
			form.state.isSubmitting = true;
			form.state.canSubmit = false;

			if (!isUpdate) {
				return await rolesService.createModule(values);
			}

			if (!module?.id) throw new Error("Module ID is required");
			return await rolesService.updateModule(module.id, values);
		},
		onSuccess: () => {
			form.reset();
			toast.success("Módulo actualizado con éxito");
			queryClient.invalidateQueries({ queryKey: ["modules"] });
			onSuccess?.();
		},
		onError: (error: AxiosError) => {
			form.state.canSubmit = true;
			const message = (error.response?.data as GeneralResponse<unknown>)
				?.message;

			const capitalizedMessage =
				message &&
				message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();

			toast.error(`Error al crear módulo`, {
				description: capitalizedMessage ?? "Por favor, inténtalo de nuevo.",
			});
		},
		onSettled: () => {
			form.state.isSubmitting = false;
		},
	});

	return (
		<>
			<form
				id="module-form"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="px-4 space-y-4"
			>
				<form.Field
					name="name"
					children={(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									placeholder="Ingrese el nombre del módulo"
									autoComplete="off"
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="description"
					children={(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									placeholder="Ingrese la descripción del módulo"
									autoComplete="off"
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			</form>

			<SheetFooter>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button type="submit" disabled={!canSubmit} form="module-form">
							{isSubmitting ? <Spinner /> : null}
							{isSubmitting ? "Confirmando módulo" : "Confirmar módulo"}
						</Button>
					)}
				</form.Subscribe>
				<SheetClose asChild>
					<Button variant="outline">Cancelar</Button>
				</SheetClose>
			</SheetFooter>
		</>
	);
}
