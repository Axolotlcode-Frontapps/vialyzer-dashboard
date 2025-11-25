import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";

import type { ColumnDef } from "@tanstack/react-table";

import { pinningStyles } from "@/lib/utils/charts";
import { Card, CardContent } from "../card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../table";

interface Props<T, V> {
	data: T[];
	columns: ColumnDef<T, V>[];
	pining?: string[];
}

export function GraphsTable<T, V>({ data, columns, pining = [] }: Props<T, V>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		initialState: {
			columnPinning: {
				left: pining,
			},
		},
	});

	return (
		<Card className="border-0 rounded-lg flex-1">
			<CardContent>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											style={{ ...pinningStyles(header.column) }}
										>
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
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											style={{ ...pinningStyles(cell.column) }}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
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
			</CardContent>
		</Card>
	);
}
