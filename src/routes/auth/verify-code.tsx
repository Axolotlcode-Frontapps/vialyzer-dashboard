import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-adapter";
import { toast } from "sonner";

import type { VerifyCodeValues } from "@/lib/schemas/auth";

import { authSchemas } from "@/lib/schemas/auth";
import { authServices } from "@/lib/services/auth";
import { Button, buttonVariants } from "@/ui/shared/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/ui/shared/card";
import { Field, FieldError, FieldLabel } from "@/ui/shared/field";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/ui/shared/input-otp";
import { LogoVialyzer } from "@/ui/shared/logo-vialyzer";
import { Spinner } from "@/ui/shared/spinner";

export const Route = createFileRoute("/auth/verify-code")({
	component: VerifyCode,
	validateSearch: zodValidator(authSchemas.verifyQueries),
});

function VerifyCode() {
	const navigate = Route.useNavigate();
	const search = Route.useSearch();

	const [persistedParams, setPersistedParams] = useState({
		userId: search.userId || null,
		token: search.token || null,
	});

	useEffect(() => {
		if (search.userId && search.token) {
			setPersistedParams((prev) => ({
				userId: search.userId || prev.userId,
				token: search.token || prev.token,
			}));

			navigate({
				search: undefined,
			});
		}
	}, [search, navigate]);

	const mutation = useMutation({
		mutationFn: async (values: VerifyCodeValues) => {
			const response = await authServices.verifyCode(
				values,
				persistedParams.userId!,
				persistedParams.token!
			);

			return { ...response };
		},
		onSuccess: ({ id, token }) => {
			toast.success(`¡Se ha verificado tu código!`, {
				position: "bottom-right",
				description: "Ahora puedes actualizar tu contraseña.",
			});
			form.reset();
			navigate({
				to: "/auth/update-password",
				search: {
					userId: id,
					token,
				},
			});
		},
		onError: (error) => {
			toast.error(`Error al verificar el código`, {
				description:
					error instanceof Error
						? error.message
						: "Por favor, inténtalo de nuevo.",
			});
		},
	});

	const form = useForm({
		defaultValues: {
			code: "",
		},
		validators: {
			onMount: authSchemas.verifyCode,
			onChange: authSchemas.verifyCode,
		},
		onSubmit: ({ value }) => mutation.mutate(value),
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
					Verificar código
				</CardTitle>
				<CardDescription>
					Introduce el código de verificación que te hemos enviado por correo
					electrónico para continuar.
				</CardDescription>
			</CardHeader>
			<CardContent className="h-fit px-0">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4 flex flex-col"
				>
					<form.Field
						name="code"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name} className="mb-2">
										Correo electrónico o numero de usuario
									</FieldLabel>
									<InputOTP
										maxLength={6}
										value={field.state.value}
										onChange={field.handleChange}
									>
										<InputOTPGroup className="w-full">
											<InputOTPSlot className="w-full" index={0} />
											<InputOTPSlot className="w-full" index={1} />
											<InputOTPSlot className="w-full" index={2} />
										</InputOTPGroup>
										<InputOTPSeparator />
										<InputOTPGroup className="w-full">
											<InputOTPSlot className="w-full" index={3} />
											<InputOTPSlot className="w-full" index={4} />
											<InputOTPSlot className="w-full" index={5} />
										</InputOTPGroup>
									</InputOTP>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>

					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button type="submit" disabled={!canSubmit}>
								{isSubmitting ? <Spinner /> : null}
								{isSubmitting ? "Verificando..." : "Verificar código"}
							</Button>
						)}
					</form.Subscribe>
				</form>
				<Link
					to="/auth"
					className={buttonVariants({
						variant: "link",
						className: "w-full cursor-pointer text-muted-foreground mt-4",
					})}
				>
					Iniciar sesión
				</Link>
			</CardContent>
		</Card>
	);
}
