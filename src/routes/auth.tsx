import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import slide1 from "@/assets/images/login_banner.jpg";
import slide2 from "@/assets/images/slide2.jpg";
import slide3 from "@/assets/images/slide3.jpg";
import { ModeToggle } from "@/ui/shared/mode-toggle";

export const Route = createFileRoute("/auth")({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}
	},

	component: AuthLayout,
});

export default function AuthLayout() {
	const backgrounds = [slide1, slide2, slide3];
	const [currentBg, setCurrentBg] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentBg((prev) => (prev + 1) % backgrounds.length);
		}, 5000);
		return () => clearInterval(interval);
	}, [backgrounds.length]);

	return (
		<main
			className="min-h-screen w-full bg-cover bg-center relative flex items-center p-4 md:p-8"
			style={{
				backgroundImage: `url(${backgrounds[currentBg]})`,
				transition: "background-image 0.5s ease-in-out",
			}}
		>
			<div className="flex min-h-dvh w-full items-center justify-center p-6 md:p-10 absolute inset-0 bg-black/90 dark:bg-[#113372]/80 z-10 h-full gap-8 lg:gap-16">
				<Outlet />
			</div>
			<div className="absolute top-4 right-4 z-10">
				<ModeToggle />
			</div>
		</main>
	);
}
