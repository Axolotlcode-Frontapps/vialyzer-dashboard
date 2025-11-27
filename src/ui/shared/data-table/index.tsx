import { getRouteApi, useLocation } from "@tanstack/react-router";
import React, { useState } from "react";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

import type {
	ColumnDef,
	ColumnFiltersState,
	Row,
	SortingState,
	Table as TableType,
	VisibilityState,
} from "@tanstack/react-table";
import type { GenericTableSearchValues } from "@/lib/schemas/shared";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/ui/shared/table";
import { Card, CardContent, CardFooter, CardHeader } from "../card";
import { Skeleton } from "../skeleton";
import { DataTablePagination } from "./pagination";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	isLoading?: boolean;
	totalRows?: number;
	children?: ({ table }: { table: TableType<TData> }) => React.ReactNode;
	onSelectedChange?: (ids: string[]) => void;
	renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement;
	getRowCanExpand?: (row: Row<TData>) => boolean;
}

const routeApi = getRouteApi("__root__");

export function DataTable<TData, TValue>({
	columns,
	data,
	totalRows,
	isLoading = false,
	children,
}: DataTableProps<TData, TValue>) {
	const location = useLocation();
	const navigate = routeApi.useNavigate();
	const search = routeApi.useSearch() as GenericTableSearchValues;

	const [filters, setFilters] = useState({
		page: (search.page || 1) - 1,
		limit: search.limit || 10,
	});

	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const totalRowsNumber = totalRows ?? data.length;

	const table = useReactTable({
		data,
		columns,
		pageCount: totalRowsNumber,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: (updater) => {
			const newPaginationState =
				typeof updater === "function"
					? updater({ pageIndex: filters.page, pageSize: filters.limit })
					: updater;

			if (search.limit && search.page) {
				navigate({
					to: location.pathname,
					search: {
						...search,
						limit: newPaginationState.pageSize,
						page: newPaginationState.pageIndex + 1,
					},
				});
			}

			setFilters({
				page: newPaginationState.pageIndex,
				limit: newPaginationState.pageSize,
			});
		},
		state: {
			pagination: {
				pageIndex: filters.page,
				pageSize: filters.limit,
			},
			sorting,
			columnFilters,
			columnVisibility,
		},
	});

	return (
		<Card>
			{children ? <CardHeader>{children({ table })}</CardHeader> : null}
			<CardContent className="w-full xl:min-h-96">
				{isLoading ? (
					<Skeleton className="h-[350px] w-full" />
				) : (
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id}>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext()
														)}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<React.Fragment key={row.id}>
										<TableRow>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext()
													)}
												</TableCell>
											))}
										</TableRow>
									</React.Fragment>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										Sin resultados
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				)}
			</CardContent>
			<CardFooter>
				{isLoading ? (
					<div className="flex flex-col sm:flex-row items-center justify-between gap-x-4 w-full">
						<Skeleton className="h-5 sm:h-9 w-full sm:w-2/6 mb-2 sm:mb-0" />
						<Skeleton className="h-9 sm:h-9 w-full sm:w-2/6 mb-4 sm:mb-0" />
						<Skeleton className="h-8 sm:h-9 w-full sm:w-2/6" />
					</div>
				) : (
					<DataTablePagination totalRows={totalRowsNumber} table={table} />
				)}
			</CardFooter>
		</Card>
	);
}
