import { useEffect } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AxiosError } from "axios";
import type { CompanyValues } from "@/lib/schemas/settings";

import { settingsSchemas } from "@/lib/schemas/settings";
import { companiesService } from "@/lib/services/companies";
import { departmentsServices } from "@/lib/services/deparments";
import { Button } from "@/ui/shared/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/ui/shared/field";
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
import { Switch } from "../shared/switch";

interface Props {
	onSuccess: (open: boolean) => void;
	update?: boolean;
	company?: Company;
}

export function CompanyForm({ onSuccess, update = false, company }: Props) {
	const queryClient = useQueryClient();

	const form = useForm({
		defaultValues: {
			name: update && company ? company.name : "",
			description: update && company ? company.description : "",
			nit: update && company ? company.nit : "",
			phone: update && company ? company.phone : "",
			address: update && company ? company.address : "",
			department: update && company ? company.department : "",
			city: update && company ? company.city : "",
			active: update && company ? company.active : true,
		},
		validators: {
			onMount: settingsSchemas.company,
			onChange: settingsSchemas.company,
		},
		onSubmit: ({ value }) => companyMutation.mutate(value),
	});

	const department = useStore(form.store, (state) => state.values.department);

	const { data: departmentsData } = useQuery({
		queryKey: ["departments"],
		queryFn: async () => await departmentsServices.getAllDepartments(),
		initialData: { departments: [] },
		select: (data) => data.departments,
	});

	const companyMutation = useMutation({
		mutationFn: async (values: CompanyValues) => {
			form.state.isSubmitting = true;
			form.state.canSubmit = false;

			update && company?.id
				? await companiesService.updateCompany(company?.id, values)
				: await companiesService.createCompany(values);

			return values;
		},
		onSuccess: ({ name }) => {
			form.reset();
			queryClient.invalidateQueries({ queryKey: ["companies"] });
			toast.success(
				`Empresa ${update ? "actualizada" : "creada"} correctamente`,
				{
					description: `Se ha ${update ? "actualizado" : "creado"} la empresa "${name}" correctamente.`,
				}
			);
			onSuccess(false);
		},
		onError: (error: AxiosError) => {
			form.state.canSubmit = true;
			const message = (error.response?.data as GeneralResponse<unknown>)
				?.message;

			const capitalizedMessage =
				message &&
				message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();

			toast.error(`Error al ${update ? "actualizar" : "crear"} la empresa`, {
				description: capitalizedMessage ?? "Por favor, inténtalo de nuevo.",
			});
		},
		onSettled: () => {
			form.state.isSubmitting = false;
		},
	});

	useEffect(() => {
		const selectedDepartment = departmentsData.find(
			(dep) => dep.departments === department
		);

		if (
			department &&
			selectedDepartment &&
			!selectedDepartment.cities.includes(form.store.state.values.city)
		) {
			form.setFieldValue("city", "");
		}
	}, [department, departmentsData, form]);

	return (
		<>
			<form
				id="company-form"
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
									placeholder="Ejemplo: Acme Corp"
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
									placeholder="Ejemplo: Empresa dedicada a la venta de productos electrónicos"
									autoComplete="off"
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<div className="flex flex-col sm:flex-row gap-4">
					<form.Field
						name="nit"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>NIT</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="Ejemplo: 123456789"
										autoComplete="off"
										disabled={update}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
					<form.Field
						name="phone"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Teléfono</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="Ejemplo: 1234567890"
										autoComplete="off"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
				</div>
				<form.Field
					name="address"
					children={(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;

						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Dirección</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									placeholder="Ejemplo: Calle Falsa 123"
									autoComplete="off"
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="department"
					children={(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;

						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Departamento</FieldLabel>
								<Select
									onValueChange={field.handleChange}
									value={field.state.value}
								>
									<SelectTrigger>
										<SelectValue
											onBlur={field.handleBlur}
											aria-invalid={isInvalid}
											placeholder="Seleccione un departamento"
										/>
									</SelectTrigger>
									<SelectContent>
										{departmentsData.map((department) => (
											<SelectItem
												key={department.departments}
												value={department.departments}
											>
												{department.departments}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>

				<form.Field
					name="city"
					children={(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;

						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Ciudad</FieldLabel>
								<Select
									onValueChange={field.handleChange}
									value={field.state.value}
								>
									<SelectTrigger>
										<SelectValue
											aria-invalid={isInvalid}
											placeholder="Seleccione una ciudad"
										/>
									</SelectTrigger>
									<SelectContent>
										{departmentsData
											.find((dep) => dep.departments === department)
											?.cities.map((city: string) => (
												<SelectItem key={city} value={city}>
													{city}
												</SelectItem>
											)) ?? []}
									</SelectContent>
								</Select>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>

				<form.Field
					name="active"
					children={(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;

						return (
							<Field
								orientation="horizontal"
								data-invalid={isInvalid}
								className="line-flex justify-start mt-3"
							>
								<FieldContent>
									<FieldLabel htmlFor="form-tanstack-switch-twoFactor">
										Activo
									</FieldLabel>

									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</FieldContent>
								<Switch
									id="form-tanstack-switch-twoFactor"
									name={field.name}
									checked={field.state.value}
									onCheckedChange={field.handleChange}
									aria-invalid={isInvalid}
								/>
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
							<Button type="submit" disabled={!canSubmit} form="company-form">
								{isSubmitting ? <Spinner /> : null}
								{isSubmitting ? "Confirmando empresa" : "Confirmar empresa"}
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
