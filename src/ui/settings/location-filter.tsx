import { getRouteApi } from "@tanstack/react-router";
import { useCameras } from "@/hooks/use-cameras";

import type { StatusType } from "@/types/movility";

import { cn } from "@/lib/utils/cn";
import {
	STATUS_ORDER,
	STATUS_STYLES,
	STATUS_TYPES,
} from "@/lib/utils/statuses";
import { Button } from "../shared/button";
import { ScrollArea, ScrollBar } from "../shared/scroll-area";

function isStatusType(key: StatusType): key is StatusType {
	return STATUS_TYPES.includes(key);
}

const Route = getRouteApi("/_dashboard/settings/cameras/");

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
				{(["all", ...STATUS_TYPES] as const).map((category) => (
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
						onClick={() => onFilter(category === "all" ? null : category)}
					>
						{category !== "all" && isStatusType(category) && (
							<span
								className={`w-3 h-3 rounded-full ${STATUS_STYLES[category].color} inline-block`}
							/>
						)}
						{category === "all"
							? "Todos"
							: isStatusType(category)
								? STATUS_STYLES[category].label
								: ""}
						<span className="ml-2 text-base font-bold">
							{category === "all"
								? cameras?.length
								: cameras?.filter((l) =>
										STATUS_ORDER[category].includes(l.state)
									).length}
						</span>
					</Button>
				))}
			</div>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
	);
}
