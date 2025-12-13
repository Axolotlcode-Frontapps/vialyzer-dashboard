import { useEffect, useState } from "react";
import clsx from "clsx";

import type { CarouselProps } from "@/types/carousel";

export function Carousel({ items }: CarouselProps) {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % items.length);
		}, 5000);

		return () => clearInterval(timer);
	}, [items.length]);

	return (
		<div className="w-full max-w-lg">
			<div className="relative aspect-video mb-8">
				<img
					src={items[currentIndex].image}
					alt={items[currentIndex].title}
					className="w-full h-full object-cover rounded-lg"
				/>
			</div>

			<div className="text-center text-white">
				<h2 className="text-2xl font-semibold mb-4">{items[currentIndex].title}</h2>
				<p className="text-lg opacity-90">{items[currentIndex].text}</p>
			</div>

			<div className="flex justify-center gap-2 mt-8">
				{items.map((_: unknown, index: number) => (
					<button
						type="button"
						key={index}
						onClick={() => setCurrentIndex(index)}
						className={clsx(
							"w-2 h-2 rounded-full transition-all",
							index === currentIndex ? "bg-white w-4" : "bg-white/50 hover:bg-white/75"
						)}
					/>
				))}
			</div>
		</div>
	);
}
