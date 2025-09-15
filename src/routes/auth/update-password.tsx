import { createFileRoute } from "@tanstack/react-router";

import { UpdatePasswordForm } from "@/ui/auth/update-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/shared/card";
import { LogoVialyzer } from "@/ui/shared/logo-vialyzer";

export const Route = createFileRoute("/auth/update-password")({
	component: UpdatePassword,
});

function UpdatePassword() {
	return (
		<Card className="w-full max-w-[500px] dark:bg-[#05225E]/80 rounded-xl shadow-2xl p-6 md:p-10 relative text-card-foreground flex flex-col gap-6 border">
			<CardHeader className="px-0">
				<a
					href="/auth"
					className="cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out mx-auto"
				>
					<LogoVialyzer className="mb-6" />
				</a>
				<CardTitle className="text-xl md:text-2xl text-center">Actualizar contraseña</CardTitle>
				<CardDescription className="md:text-base  text-center">
					Ingresa tu nueva contraseña para actualizarla.
				</CardDescription>
			</CardHeader>
			<CardContent className="h-fit px-0">
				<UpdatePasswordForm />
			</CardContent>
		</Card>
	);
}
