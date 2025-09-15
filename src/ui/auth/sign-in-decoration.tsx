import type * as React from "react";

import { cn } from "@/lib/utils/cn";

function Decoration({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="decoration"
			className={cn(
				"relative hidden lg:flex flex-col justify-center items-center w-full max-w-[700px]",
				className
			)}
			{...props}
		/>
	);
}

function DecorationTitle({ className, ...props }: React.ComponentProps<"h2">) {
	return (
		<h2
			data-slot="decoration-title"
			className={cn(
				"text-4xl sm:text-xl md:text-2xl lg:text-4xl xl:text-6xl text-center",
				className
			)}
			{...props}
		/>
	);
}

function DecorationBlock({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="decoration-block"
			className={cn(
				"hidden sm:block w-[150px] h-[150px] md:w-[100px] md:h-[100px] 2xl:w-[150px] 2xl:h-[150px]",
				className
			)}
			{...props}
		/>
	);
}

function DecorationTop({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="decoration-top"
			className={cn("hidden lg:flex absolute -top-35 2xl:-top-55 -left-40 xl:-left-30", className)}
			{...props}
		/>
	);
}

function DecorationBottom({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="decoration-bottom"
			className={cn("mt-20 flex flex-wrap gap-8 md:gap-40", className)}
			{...props}
		/>
	);
}

export { Decoration, DecorationTitle, DecorationBlock, DecorationTop, DecorationBottom };
