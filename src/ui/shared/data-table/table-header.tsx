import { getRouteApi, useLocation } from "@tanstack/react-router";
import { Search } from "lucide-react";

import type { Table } from "@tanstack/react-table";
import type { GenericSearchParams } from "@/lib/schemas/shared";

import { Input } from "../input";
import { TableFilters } from "../search-filters";

const Route = getRouteApi("__root__");

type NestedKeyOf<T> = (keyof T & string) | (string & {});

export function DataTableHeader<TData>({
	table,
	searchBy,
	searchPlaceholder = "Buscar...",
	filters = [],
	children,
	hasSearchUrl = false,
}: {
	table: Table<TData>;
	searchBy: NestedKeyOf<TData>;
	searchPlaceholder?: string;
	filters?: Filters[];
	children?: React.ReactNode;
	hasSearchUrl?: boolean;
}) {
	const location = useLocation();
	const searchValues = Route.useSearch() as GenericSearchParams;
	const navigate = Route.useNavigate();

	function onChangeSearch(value: string) {
		if (!hasSearchUrl) {
			table.getColumn(String(searchBy))?.setFilterValue(value || "");
			return;
		}

		navigate({
			to: location.pathname,
			search: {
				...searchValues,
				...(value === "" ? { search: undefined } : { search: value }),
			},
		});
	}

	return (
		<div className="w-full flex items-center justify-between gap-4">
			<div className="w-full md:max-w-1/3 relative">
				<Input
					placeholder={searchPlaceholder}
					value={searchValues.search || ""}
					onChange={(event) => onChangeSearch(event.target.value)}
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
