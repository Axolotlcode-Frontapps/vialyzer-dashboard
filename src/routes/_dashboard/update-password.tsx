import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { UpdatePasswordValues } from "@/lib/schemas/auth";

import { authSchemas } from "@/lib/schemas/auth";
import { usersService } from "@/lib/services/users";
import { Button } from "@/ui/shared/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/ui/shared/card";
import { FieldError } from "@/ui/shared/field";
import { ForgotPasswordInput } from "@/ui/shared/forgot-password-input";
import { Spinner } from "@/ui/shared/spinner";

export const Route = createFileRoute("/_dashboard/update-password")({
	component: RouteComponent,
});

function RouteComponent() {
	const queryClient = useQueryClient();
	const navigate = Route.useNavigate();

	const form = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		validators: {
			onMount: authSchemas.updatePassword,
			onChange: authSchemas.updatePassword,
		},
		onSubmit: ({ value }) => mutation.mutate(value),
	});

	const mutation = useMutation({
		mutationFn: async (values: UpdatePasswordValues) => {
			form.state.isSubmitting = true;
			form.state.canSubmit = false;
			return await usersService.updateCurrentUser(values);
		},
		onSuccess: async () => {
			form.reset();
			toast.success("¡Contraseña actualizada!", {
				description: "Ya puedes iniciar sesión con tu nueva contraseña.",
			});
			queryClient.invalidateQueries({ queryKey: ["get-me"] });
			await navigate({ to: "/" });
		},
		onError: (error) => {
			form.state.canSubmit = true;
			toast.error("Error al actualizar la contraseña", {
				description:
					error instanceof Error
						? error.message
						: "Ocurrió un error inesperado al actualizar la contraseña.",
			});
		},
		onSettled: () => {
			form.state.isSubmitting = false;
		},
	});

	return (
		<main className="min-h-[calc(100dvh-90px)] grid place-content-center">
			<Card className="w-full max-w-md min-w-md rounded-xl shadow-2xl p-6 md:p-10 relative text-card-foreground flex flex-col gap-6 border">
				<CardHeader className="px-0">
					<CardTitle className="text-xl md:text-2xl text-center">
						Actualizar contraseña
					</CardTitle>
					<CardDescription className="md:text-base  text-center">
						Ingresa tu nueva contraseña para actualizarla.
					</CardDescription>
				</CardHeader>
				<CardContent className="h-fit px-0">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="flex flex-col gap-4"
					>
						<form.Field
							name="password"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<ForgotPasswordInput
										isInvalid={isInvalid}
										handleBlur={field.handleBlur}
										handleChange={field.handleChange}
										value={field.state.value}
										name={field.name}
										label="Nueva contraseña"
										placeholder="Ingresa tu nueva contraseña"
										children={() =>
											isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)
										}
									/>
								);
							}}
						/>

						<form.Field
							name="confirmPassword"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<ForgotPasswordInput
										isInvalid={isInvalid}
										handleBlur={field.handleBlur}
										handleChange={field.handleChange}
										value={field.state.value}
										name={field.name}
										label="Confirmar contraseña"
										placeholder="Confirma tu nueva contraseña"
										children={() =>
											isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)
										}
									/>
								);
							}}
						/>

						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
						>
							{([canSubmit, isSubmitting]) => (
								<Button type="submit" disabled={!canSubmit}>
									{isSubmitting ? <Spinner /> : null}
									{isSubmitting ? "Actualizando..." : "Actualizar contraseña"}
								</Button>
							)}
						</form.Subscribe>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}
