import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

import type { AxiosError } from "axios";
import type { SignInValues } from "@/lib/schemas/auth";

import { authSchemas } from "@/lib/schemas/auth";
import { authServices } from "@/lib/services/auth";
import {
	clearRememberMeData,
	getRememberMeEmail,
	setRememberMeData,
} from "@/lib/utils/remember-me-cookie";
import { Button, buttonVariants } from "../shared/button";
import { Field, FieldError, FieldLabel } from "../shared/field";
import { ForgotPasswordInput } from "../shared/forgot-password-input";
import { Input } from "../shared/input";
import { Spinner } from "../shared/spinner";

export function SignInForm() {
	const queryClient = useQueryClient();
	const auth = useAuth();
	const router = useRouter();
	const navigate = useNavigate();
	const initialEmail = getRememberMeEmail();

	const form = useForm({
		defaultValues: {
			username: initialEmail || "",
			password: "",
			rememberMe: !!initialEmail,
		},
		validators: {
			onMount: authSchemas.signIn,
			onChange: authSchemas.signIn,
		},
		onSubmit: ({ value }) => loginMutation.mutate(value),
	});

	const loginMutation = useMutation({
		mutationFn: async (values: SignInValues) => {
			form.state.isSubmitting = true;
			form.state.canSubmit = false;
			const data = await authServices.signIn(values);

			if (!data.payload?.token) {
				throw new Error(data.message);
			}

			if (values.rememberMe) {
				setRememberMeData({ username: values.username, remember: true });
			} else {
				clearRememberMeData();
			}

			await auth.login(data.payload);
			await router.invalidate();
			await queryClient.invalidateQueries();
			await navigate({ to: "/" });
			return data;
		},
		onSuccess: () => {
			form.reset();
			toast.success(`¡Bienvenido de nuevo!`, {
				position: "bottom-right",
				description: "Has iniciado sesión correctamente.",
			});
		},
		onError: (error: AxiosError) => {
			form.state.canSubmit = true;
			const message = (error.response?.data as GeneralResponse<unknown>)?.message;

			const capitalizedMessage =
				message && message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();

			toast.error("Error al iniciar sesión", {
				description: capitalizedMessage || "Error al iniciar sesión. Revisa tus credenciales.",
			});
		},
		onSettled: () => {
			form.state.isSubmitting = false;
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="flex flex-col gap-4"
		>
			<form.Field
				name="username"
				children={(field) => {
					const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={field.name}>Correo electrónico o numero de usuario</FieldLabel>
							<Input
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Ingresa tu correo electrónico o número de usuario"
								autoComplete="off"
							/>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			/>
			<form.Field
				name="password"
				children={(field) => {
					const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<ForgotPasswordInput
							isInvalid={isInvalid}
							handleBlur={field.handleBlur}
							handleChange={field.handleChange}
							value={field.state.value}
							name={field.name}
							label="Contraseña"
							placeholder="Ingresa tu contraseña"
							children={() => isInvalid && <FieldError errors={field.state.meta.errors} />}
						/>
					);
				}}
			/>

			<Link
				to="/auth/forgot-password"
				className={buttonVariants({
					variant: "link",
					className: "w-full cursor-pointer text-muted-foreground! mt-10 justify-end px-0!",
				})}
			>
				¿Olvidaste tu contraseña?
			</Link>

			<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
				{([canSubmit, isSubmitting]) => (
					<Button type="submit" disabled={!canSubmit}>
						{isSubmitting ? <Spinner /> : null}
						{isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
