import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-adapter";
import { toast } from "sonner";

import type { AxiosDefaults } from "axios";
import type { VerifyCodeValues } from "@/lib/schemas/auth";

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
	validateSearch: zodValidator(authSchemas.verifyToken),
	beforeLoad: async ({ search }) => {
		const { token, userId, email } = search;

		if (!token || !userId || !email) {
			throw redirect({
				to: "/auth",
			});
		}
	},
});

function VerifyCode() {
	const navigate = Route.useNavigate();
	const { token, userId, email } = Route.useSearch();

	const mutation = useMutation({
		mutationFn: async (values: VerifyCodeValues) => {
			form.state.isSubmitting = true;
			form.state.canSubmit = false;
			return await authServices.verifyCode(values, userId!, token!);
		},
		onSuccess: ({ payload }) => {
			toast.success(`¡Se ha verificado tu código!`, {
				position: "bottom-right",
				description: "Ahora puedes actualizar tu contraseña.",
			});
			form.reset();
			navigate({
				to: "/auth/update-password",
				search: {
					userId: payload?.id,
					token: payload?.token,
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

	const resendCode = useMutation({
		mutationFn: async () => await authServices.resendCode(email!, token!),
		onSuccess: ({ payload }) => {
			toast.success("¡Código reenviado!", {
				description:
					"Por favor, revisa tu correo electrónico para el nuevo código de verificación.",
			});

			if (payload) {
				navigate({
					to: "/auth/verify-code",
					search: {
						email: email!,
						userId: payload.idUser,
						token: payload.token,
					},
				});
			}
		},
		onError: (error: AxiosDefaults) => {
			toast.error("Error al reenviar el código", {
				description:
					error instanceof Error
						? error.message
						: "Por favor, inténtalo de nuevo.",
			});
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
				<Button
					type="button"
					className="w-full my-4 bg-[#6c6a6a] dark:bg-[#04163d] dark:text-white"
					onClick={() => resendCode.mutate()}
					disabled={resendCode.isPending}
				>
					{resendCode.isPending ? <Spinner /> : null}
					{resendCode.isPending ? "Reenviando código..." : "Reenviar código"}
				</Button>
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
