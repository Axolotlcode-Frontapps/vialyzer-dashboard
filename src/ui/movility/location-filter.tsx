import { getRouteApi } from "@tanstack/react-router";
import { useCameras } from "@/hooks/use-cameras";

import type { StatusType } from "@/lib/utils/statuses";

import { cn } from "@/lib/utils/cn";
import { STATUS_ORDER, STATUS_STYLES } from "@/lib/utils/statuses";
import { Button } from "../shared/button";
import { ScrollArea, ScrollBar } from "../shared/scroll-area";

const Route = getRouteApi("/_dashboard/movility/");

export function LocationFilter() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const { cameras } = useCameras();

	const onFilter = (newFilter: StatusType | null) => {
		navigate({
			search: {
				...search,
				filter: newFilter ?? undefined,
			},
			resetScroll: false,
		});
	};

	return (
		<ScrollArea className="w-full pb-2.5">
			<div className="flex gap-3 mb-2">
				{(["all", "normal", "warning", "error"] as const).map((category) => (
					<Button
						key={category}
						type="button"
						variant="secondary"
						className={cn(
							`flex items-center gap-2 rounded-full font-semibold border transition-colors hover:cursor-pointer`,
							search.filter === category ||
								(category === "all" && !search.filter)
								? "bg-accent border-accent-foreground text-accent-foreground"
								: "hover:bg-accent/50"
						)}
						onClick={() =>
							onFilter(category === "all" ? null : (category as StatusType))
						}
					>
						{category !== "all" && (
							<span
								className={`w-3 h-3 rounded-full ${STATUS_STYLES[category as keyof typeof STATUS_STYLES].color} inline-block`}
							/>
						)}
						{category === "all"
							? "Todos"
							: STATUS_STYLES[category as keyof typeof STATUS_STYLES].label}
						<span className="ml-2 text-base font-bold">
							{category === "all"
								? cameras?.length
								: cameras?.filter((l) =>
										STATUS_ORDER[
											category as keyof typeof STATUS_STYLES
										].includes(l.state)
									).length}
						</span>
					</Button>
				))}
			</div>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
	);
}
