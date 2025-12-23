import { Activity } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCompany } from "@/hooks/use-company";
import { useRoles } from "@/hooks/use-roles";

import type { AxiosError } from "axios";
import type { AgentValues } from "@/lib/schemas/agents";
import type { Agent } from "@/types/agents";

import { agentsSchemas } from "@/lib/schemas/agents";
import { agentsService } from "@/lib/services/agents";
import { Button } from "@/ui/shared/button";
import { Field, FieldError, FieldLabel } from "@/ui/shared/field";
import { ForgotPasswordInput } from "@/ui/shared/forgot-password-input";
import { Input } from "@/ui/shared/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/shared/select";
import { SheetClose, SheetFooter } from "@/ui/shared/sheet";
import { Spinner } from "@/ui/shared/spinner";

interface Props {
	onSuccess: (open: boolean) => void;
	update?: boolean;
	agent?: Agent;
}

export function AgentForm({ onSuccess, update = false, agent }: Props) {
	const queryClient = useQueryClient();

	const { roles, loading: rolesLoading } = useRoles();
	const { companies, loading: companiesLoading } = useCompany();

	const form = useForm({
		defaultValues: {
			name: update && agent ? (agent.user?.name as string) : "",
			secondName: update && agent ? agent.secondName : null,
			lastName: update && agent ? (agent.user?.lastname as string) : "",
			email: update && agent ? (agent.user?.email as string) : "",
			userImage: update && agent ? agent.userImage : "",
			phone: update && agent ? (agent.user?.phone as string) : "",
			identification: update && agent ? agent.identification : "",
			plaque: update && agent ? agent.plaque : "",
			password: !update ? "" : null,
			role: update && agent ? (agent.user?.idRole as string) : "",
			company: update && agent ? (agent.user?.idCompany as string) : "",
		},
		validators: {
			onMount: agentsSchemas.agent,
			onChange: agentsSchemas.agent,
		},
		onSubmit: ({ value }) => agentMutation.mutate(value),
	});

	console.log(form.state.errors);

	const agentMutation = useMutation({
		mutationFn: async (values: AgentValues) => {
			form.state.isSubmitting = true;
			form.state.canSubmit = false;

			return !update
				? await agentsService.createAgent(values)
				: await agentsService.updateAgent(agent?.id!, values);
		},
		onSuccess: ({ payload }) => {
			form.reset();
			queryClient.invalidateQueries({ queryKey: ["agents"] });
			toast.success(`Agente ${update ? "actualizado" : "creado"} correctamente`, {
				description: `Se ha ${update ? "actualizado" : "creado"} el agente ${payload?.email}.`,
			});
			onSuccess(false);
		},
		onError: (error: AxiosError<GeneralResponse<unknown>>) => {
			form.state.canSubmit = true;
			const message = error.response?.data?.message;
			const capitalizedMessage =
				message && message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();

			toast.error(`Error al ${update ? "actualizar" : "crear"} el usuario`, {
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
				id="agent-form"
				className="px-4 space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<div className="flex flex-col sm:flex-row gap-4">
					<form.Field name="name">
						{(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Nombre*</FieldLabel>
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

					<form.Field name="secondName">
						{(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Segundo Nombre</FieldLabel>
									<Input
										id={field.name}
										value={field.state.value ?? ""}
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

					<form.Field name="lastName">
						{(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Apellido*</FieldLabel>
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

				<div className="flex flex-col sm:flex-row gap-4">
					<form.Field name="email">
						{(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Email*</FieldLabel>
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

					<Activity mode={update ? "hidden" : "visible"}>
						<form.Field
							name="password"
							children={(field) => {
								const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<ForgotPasswordInput
										isInvalid={isInvalid}
										handleBlur={field.handleBlur}
										handleChange={field.handleChange}
										value={field.state.value ?? ""}
										name={field.name}
										label="Contraseña*"
										placeholder="Ingresa tu contraseña"
										children={() => isInvalid && <FieldError errors={field.state.meta.errors} />}
									/>
								);
							}}
						/>
					</Activity>
				</div>

				<form.Field name="userImage">
					{(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Imagen de usuario*</FieldLabel>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="https://mi-imagen.com/imagen.jpg"
									autoComplete="off"
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<div className="flex flex-col sm:flex-row gap-4">
					<form.Field name="identification">
						{(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Identificación*</FieldLabel>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Ejemplo: 123456789"
										autoComplete="off"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="plaque">
						{(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Placa*</FieldLabel>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Ejemplo: 123456789"
										autoComplete="off"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="phone">
						{(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Teléfono*</FieldLabel>
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
				</div>

				<div className="flex flex-col sm:flex-row gap-4">
					<form.Field name="role">
						{(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Rol*</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(val) => field.handleChange(val)}
										disabled={roles.length === 0 && !rolesLoading}
									>
										<SelectTrigger>
											<SelectValue
												placeholder={rolesLoading ? "Cargando roles..." : "Selecciona un rol"}
											/>
										</SelectTrigger>
										<SelectContent>
											{roles.map((role) => (
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
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Empresa*</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(val) => field.handleChange(val)}
										disabled={companies.length === 0 && !companiesLoading}
									>
										<SelectTrigger>
											<SelectValue
												placeholder={
													companiesLoading ? "Cargando empresas..." : "Selecciona una empresa"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{companies.map((company) => (
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
				</div>
			</form>

			<SheetFooter>
				<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
					{([canSubmit, isSubmitting]) => (
						<Button type="submit" form="agent-form" disabled={!canSubmit}>
							{isSubmitting ? <Spinner /> : null}
							{isSubmitting ? "Confirmando agente" : "Confirmar agente"}
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
