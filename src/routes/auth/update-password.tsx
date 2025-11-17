import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-adapter";
import { toast } from "sonner";

import type { UpdatePasswordValues } from "@/lib/schemas/auth";

import { authSchemas } from "@/lib/schemas/auth";
import { authServices } from "@/lib/services/auth";
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
import { LogoVialyzer } from "@/ui/shared/logo-vialyzer";
import { Spinner } from "@/ui/shared/spinner";

export const Route = createFileRoute("/auth/update-password")({
	component: UpdatePassword,
	validateSearch: zodValidator(authSchemas.verifyToken),
	beforeLoad: async ({ search }) => {
		const { token, userId } = search;

		if (!token || !userId) {
			throw redirect({
				to: "/auth",
			});
		}
	},
});

function UpdatePassword() {
	const { token, userId } = Route.useSearch();

	const form = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		validators: {
			onMount: authSchemas.updatePassword,
			onChange: authSchemas.updatePassword,
		},
		onSubmit: ({ value }) => {
			console.log(value);
			mutation.mutate(value);
		},
	});

	const mutation = useMutation({
		mutationFn: async (values: UpdatePasswordValues) => {
			form.state.isSubmitting = true;
			form.state.canSubmit = false;
			return await authServices.updateUser(values, userId!, token!);
		},
		onSuccess: () => {
			form.reset();
			toast.success("¡Contraseña actualizada!", {
				description: "Ya puedes iniciar sesión con tu nueva contraseña.",
			});
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
		<Card className="w-full max-w-[500px] dark:bg-[#05225E]/80 rounded-xl shadow-2xl p-6 md:p-10 relative text-card-foreground flex flex-col gap-6 border">
			<CardHeader className="px-0">
				<a
					href="/auth"
					className="cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out mx-auto"
				>
					<LogoVialyzer className="mb-6" />
				</a>
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
										isInvalid && <FieldError errors={field.state.meta.errors} />
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
										isInvalid && <FieldError errors={field.state.meta.errors} />
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
				<span className="inline-block w-full text-center text-muted-foreground text-sm mt-4">
					Ya tienes una cuenta?{" "}
					<Link
						to="/auth"
						className="font-semibold hover:underline underline-offset-4"
					>
						Iniciar sesión
					</Link>
				</span>
			</CardContent>
		</Card>
	);
}
