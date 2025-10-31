import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { UserValues } from "@/lib/schemas/settings";

import { settingsSchemas } from "@/lib/schemas/settings";
import { companiesService } from "@/lib/services/companies";
import { rolesService } from "@/lib/services/roles";
import { usersService } from "@/lib/services/users";
import { Button } from "@/ui/shared/button";
import { Field, FieldError, FieldLabel } from "@/ui/shared/field";
import { Input } from "@/ui/shared/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/ui/shared/select";
import { SheetClose, SheetFooter } from "@/ui/shared/sheet";
import { Spinner } from "@/ui/shared/spinner";

interface Props {
	onSuccess: (open: boolean) => void;
	update?: boolean;
	user?: User;
}

export function UserFields({ onSuccess, update = false, user }: Props) {
	const queryClient = useQueryClient();

	const form = useForm({
		defaultValues: {
			name: update && user ? user.name : "",
			lastname: update && user ? user.lastname : "",
			email: update && user ? user.email : "",
			phone: update && user ? user.phone : "",
			role: update && user ? user.role?.id : "",
			company: update && user ? user.company?.id : "",
		},
		validators: {
			onMount: settingsSchemas.user,
			onChange: settingsSchemas.user,
		},
		onSubmit: ({ value }) => userMutation.mutate(value),
	});

	const { data: rolesData = [] } = useQuery({
		queryKey: ["roles"],
		queryFn: async () => await rolesService.getAllRoles(),
		select: (data) => data.payload,
	});

	const { data: companiesData = [] } = useQuery({
		queryKey: ["companies"],
		queryFn: async () => await companiesService.getAllCompanies(),
		select: (data) => data.payload,
	});

	const userMutation = useMutation({
		mutationFn: async (values: UserValues) => {
			form.state.isSubmitting = true;

			update && user?.id
				? await usersService.updateUser(user.id, values)
				: await usersService.createUser(values);

			return values;
		},
		onSuccess: ({ name }) => {
			form.reset();
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success(
				`Usuario ${update ? "actualizado" : "creado"} correctamente`,
				{
					description: `Se ha ${update ? "actualizado" : "creado"} el usuario "${name}".`,
				}
			);
			onSuccess(false);
		},
		onError: (error) => {
			form.state.canSubmit = false;
			toast.error(`Error al ${update ? "actualizar" : "crear"} el usuario`, {
				description:
					error instanceof Error
						? error.message
						: "Por favor, inténtalo de nuevo.",
			});
		},
		onSettled: () => {
			form.state.isSubmitting = false;
		},
	});

	return (
		<>
			<form
				id="user-form"
				className="px-4 space-y-2"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<div className="flex flex-col sm:flex-row gap-4">
					<form.Field name="name">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Ejemplo: Juan"
										autoComplete="off"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="lastname">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Apellido</FieldLabel>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Ejemplo: Pérez"
										autoComplete="off"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</div>

				<form.Field name="email">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;

						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Email</FieldLabel>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									placeholder="usuario@empresa.com"
									autoComplete="off"
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="phone">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Teléfono</FieldLabel>
								<Input
									id={field.name}
									type="tel"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Ejemplo: 5551234567"
									autoComplete="off"
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="role">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Rol</FieldLabel>
								<Select
									value={field.state.value}
									onValueChange={(val) => field.handleChange(val)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Selecciona un rol" />
									</SelectTrigger>
									<SelectContent>
										{rolesData.map((role) => (
											<SelectItem key={role.id} value={role.id}>
												{role.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="company">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Empresa</FieldLabel>
								<Select
									value={field.state.value}
									onValueChange={(val) => field.handleChange(val)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Selecciona una empresa" />
									</SelectTrigger>
									<SelectContent>
										{companiesData.map((company) => (
											<SelectItem key={company.id} value={company.id}>
												{company.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
			</form>

			<SheetFooter>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button type="submit" form="user-form" disabled={!canSubmit}>
							{isSubmitting ? <Spinner /> : null}
							{isSubmitting ? "Confirmando usuario" : "Confirmar usuario"}
						</Button>
					)}
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
