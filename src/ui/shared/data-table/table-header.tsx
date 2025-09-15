import { Search } from "lucide-react";

import type { Table } from "@tanstack/react-table";

import { Input } from "../input";
import { TableFilters } from "../search-filters";

export function DataTableHeader<TData>({
	table,
	searchBy,
	searchPlaceholder = "Buscar...",
	filters = [],
	children,
}: {
	table: Table<TData>;
	searchBy: keyof TData;
	searchPlaceholder?: string;
	filters?: Filters[];
	children?: React.ReactNode;
}) {
	return (
		<div className="w-full flex items-center justify-between gap-4">
			<div className="w-full md:max-w-1/3 relative">
				<Input
					placeholder={searchPlaceholder}
					value={
						(table.getColumn(String(searchBy))?.getFilterValue() as string) ??
						""
					}
					onChange={(event) =>
						table
							.getColumn(String(searchBy))
							?.setFilterValue(event.target.value)
					}
					className="pl-9 py-2 max-h-9 placeholder:text-sm"
				/>
				<Search className="absolute top-2 left-2.5 text-muted-foreground size-5" />
			</div>

			{children || filters.length ? (
				<div className="flex gap-2 items-center justify-end">
					{filters.length ? <TableFilters filters={filters} /> : null}
					{children}
				</div>
			) : null}
		</div>
	);
}
