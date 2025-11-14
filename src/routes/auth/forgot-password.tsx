import { createFileRoute } from "@tanstack/react-router";

import { ForgotPasswordForm } from "@/ui/auth/forgot-password-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/ui/shared/card";
import { LogoVialyzer } from "@/ui/shared/logo-vialyzer";

export const Route = createFileRoute("/auth/forgot-password")({
	component: ForgotPassword,
});

function ForgotPassword() {
	return (
		<Card className="w-full max-w-[500px] dark:bg-[#05225E]/80 rounded-xl shadow-2xl p-6 md:p-10 relative text-card-foreground flex flex-col gap-6 border">
			<CardHeader className="px-0">
				<a
					href="/auth"
					className="cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out mx-auto mb-6"
				>
					<LogoVialyzer className="mb-6" />
				</a>
				<CardTitle className="text-xl md:text-2xl text-center">
					Recuperar contraseña
				</CardTitle>
				<CardDescription className="md:text-base  text-center">
					Ingresa tu correo electrónico a continuación para recuperar tu
					contraseña
				</CardDescription>
			</CardHeader>
			<CardContent className="px-0">
				<ForgotPasswordForm />
			</CardContent>
		</Card>
	);
}
