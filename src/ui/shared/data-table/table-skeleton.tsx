import { Skeleton } from "../skeleton";

export function TableSkeleton() {
	return (
		<Skeleton className="bg-accent/50 min-h-[746px] w-full p-6 space-y-6">
			<Skeleton className="h-[42px] w-1/3" />

			<Skeleton className="h-[570px] w-full" />

			<div className="flex flex-col sm:flex-row items-center justify-between gap-x-4 w-full">
				<Skeleton className="h-[20px] sm:h-[36px] w-full sm:w-2/6 mb-2 sm:mb-0" />
				<Skeleton className="h-[36px] sm:h-[36px] w-full sm:w-2/6 mb-4 sm:mb-0" />
				<Skeleton className="h-[32px] sm:h-[36px] w-full sm:w-2/6" />
			</div>
		</Skeleton>
	);
}
