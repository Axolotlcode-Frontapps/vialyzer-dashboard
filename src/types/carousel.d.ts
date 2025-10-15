interface CarouselItem {
	image: string;
	title: string;
	text: string;
}

interface CarouselProps {
	items: CarouselItem[];
}

export type { CarouselItem, CarouselProps };
