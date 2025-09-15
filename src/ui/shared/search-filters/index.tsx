import { getRouteApi } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ListFilter } from "lucide-react";
import { useAppForm } from "@/contexts/form";
import { useMediaQuery } from "@/hooks/use-media-query";

import type { GenericTableSearchValues } from "@/lib/schemas/table";

import { Button, buttonVariants } from "@/ui/shared/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/shared/popover";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "../sheet";

const route = getRouteApi("__root__");

export function TableFilterButton(props: React.HTMLAttributes<HTMLButtonElement>) {
	return (
		<Button className="cursor-pointer" {...props}>
			<ListFilter />
			<span className="hidden sm:inline">Filtros</span>
		</Button>
	);
}

interface Props {
	filters?: Filters[];
}

export function TableFilters({ filters = [] }: Props) {
	const navigate = route.useNavigate();
	const filterSearch = route.useSearch();
	const [open, setOpen] = useState(false);
	const isMobile = useMediaQuery("(max-width: 640px)");

	const setFilters = useMemo(() => {
		const { page, limit, ...filters } = filterSearch as GenericTableSearchValues;

		return filters || {};
	}, [filterSearch]);

	const form = useAppForm({
		defaultValues: {
			...setFilters,
		},

		onSubmit: ({ value }) => {
			navigate({
				search: {
					...filterSearch,
					...value,
				},
			});

			setOpen(false);
		},
	});

	const onResetFilters = () => {
		form.reset();
		navigate({
			search: {
				page: 1,
				limit: 10,
				// biome-ignore lint/suspicious/noExplicitAny: required for navigation search type
			} as any,
		});
		setOpen(false);
	};

	if (isMobile) {
		return (
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild>
					<TableFilterButton onClick={() => setOpen(true)} />
				</SheetTrigger>
				<SheetContent className="w-full">
					<SheetHeader>
						<SheetTitle>Filtros</SheetTitle>
						<SheetDescription>
							Ajuste los filtros para personalizar la vista de la tabla.
						</SheetDescription>
					</SheetHeader>

					<form
						id="filters-form"
						className="px-4"
						onSubmit={(e) => {
							e.stopPropagation();
							e.preventDefault();
							form.handleSubmit(e);
						}}
					>
						{filters?.map((filter, index) => (
							<form.AppField
								key={index}
								name={filter.name as "search"}
								children={(field) => (
									<field.SearchAccordionField
										label={filter.label}
										options={filter.options}
										mode={filter.mode}
									/>
								)}
							/>
						))}
					</form>

					<SheetFooter>
						<form.AppForm>
							<form.SubmitButton form="filters-form" label="Aplicar filtros" />
						</form.AppForm>

						<Button
							className="rounded-none"
							variant="destructive"
							type="reset"
							onClick={onResetFilters}
						>
							Borrar filtros
						</Button>

						<SheetClose asChild>
							<Button variant="secondary" className="w-full">
								Cerrar
							</Button>
						</SheetClose>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<TableFilterButton />
			</PopoverTrigger>
			<PopoverContent
				className="p-0 w-fit flex items-center justify-start overflow-hidden"
				align="end"
			>
				<span
					className={buttonVariants({
						variant: "ghost",
						className: "rounded-none border-b-0",
					})}
				>
					Filtros
				</span>
				<form
					id="filters-form"
					onSubmit={(e) => {
						e.stopPropagation();
						e.preventDefault();
						form.handleSubmit(e);
					}}
				>
					{filters?.map((filter, index) => (
						<form.AppField
							key={index}
							name={filter.name as "search"}
							children={(field) => (
								<field.SearchDropdownFilter
									label={filter.label}
									options={filter.options}
									mode={filter.mode}
								/>
							)}
						/>
					))}
				</form>
				<Button
					className="rounded-none cursor-pointer"
					variant="destructive"
					type="reset"
					onClick={onResetFilters}
				>
					Borrar filtros
				</Button>
				<Button form="filters-form" className="rounded-none cursor-pointer">
					Aplicar filtros
				</Button>
			</PopoverContent>
		</Popover>
	);
}
