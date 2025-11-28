import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AxiosError } from "axios";
import type { RoleValues } from "@/lib/schemas/roles";

import { rolesSchemas } from "@/lib/schemas/roles";
import { rolesService } from "@/lib/services/roles";
import { Button } from "@/ui/shared/button";
import { Field, FieldError, FieldLabel } from "@/ui/shared/field";
import { Input } from "@/ui/shared/input";
import { SheetClose, SheetFooter } from "@/ui/shared/sheet";
import { Spinner } from "@/ui/shared/spinner";
import { Textarea } from "@/ui/shared/textarea";

interface Props {
	onSuccess: (open: boolean) => void;
	update?: boolean;
	role?: Role;
}

export function RoleForm({ onSuccess, update, role }: Props) {
	const queryClient = useQueryClient();

	const form = useForm({
		defaultValues: {
			name: update && role ? role.name : "",
			description: update && role ? role.description : "",
		},
		validators: {
			onMount: rolesSchemas.role,
			onChange: rolesSchemas.role,
		},
		onSubmit: ({ value }) => roleMutation.mutate(value),
	});

	const roleMutation = useMutation({
		mutationFn: async (values: RoleValues) => {
			form.state.isSubmitting = true;
			form.state.canSubmit = false;

			update && role?.id
				? await rolesService.updateRole(role?.id, values)
				: await rolesService.createRole(values);

			return values;
		},
		onSuccess: ({ name }) => {
			form.reset();
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			toast.success(`Rol creado correctamente`, {
				description: `Se ha creado el rol "${name}" correctamente.`,
			});
			onSuccess(false);
		},
		onError: (error: AxiosError) => {
			form.state.canSubmit = true;
			const message = (error.response?.data as GeneralResponse<unknown>)
				?.message;

			const capitalizedMessage =
				message &&
				message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();

			toast.error(`Error al ${update ? "actualizar" : "crear"} el rol`, {
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
				id="role-form"
				className="px-4 space-y-2"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
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
									placeholder="Ejemplo: Administrador"
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
								<Textarea
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									placeholder="Ejemplo: Rol con todos los permisos"
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
					{([canSubmit, isSubmitting]) => {
						return (
							<Button type="submit" disabled={!canSubmit} form="role-form">
								{isSubmitting ? <Spinner /> : null}
								{isSubmitting ? "Confirmando rol" : "Confirmar rol"}
							</Button>
						);
					}}
				</form.Subscribe>

				<SheetClose asChild>
					<Button variant="destructive" onClick={() => form.reset()}>
						Cancelar
					</Button>
				</SheetClose>
			</SheetFooter>
		</>
	);
}
