import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useMemo } from "react";
import { zodValidator } from "@tanstack/zod-adapter";

import { movilitySchemas } from "@/lib/schemas/movility";
import { FiltersForm } from "@/ui/movility/filters-forn";
import { Tabs, TabsList, TabsTrigger } from "@/ui/shared/tabs";

export const Route = createFileRoute("/_dashboard/movility/$camera")({
	component: MobilityLayout,
	validateSearch: zodValidator(movilitySchemas.filtersCameraSearch),
});

const locales = {
	volume: "Volumen",
	velocity: "Velocidad",
} as const;

function MobilityLayout() {
	const params = Route.useParams();
	const { pathname, searchStr: search } = useLocation();

	const tabs = useMemo(() => {
		const activeVolume = pathname === `/movility/${params.camera}/volume` ? "volume" : "velocity";

		return {
			active: activeVolume as keyof typeof locales,
			list: Object.entries({
				volume: `/movility/${params.camera}/volume`,
				velocity: `/movility/${params.camera}/velocity`,
			}) as [keyof typeof locales, string][],
			search: `${search.length > 0 ? search : ""}`,
		};
	}, [search, pathname, params]);

	return (
		<div className="w-full container mx-auto py-8">
			<h1 className="text-2xl mb-6">Dashboard Movilidad - {locales[tabs.active]}</h1>
			<FiltersForm />
			<Tabs value={tabs.active} className="w-full mb-6">
				<TabsList
					className={`w-full grid grid-cols-2 max-w-max gap-2 overflow-x-auto snap-x snap-mandatory justify-start`}
				>
					{tabs.list.map(([key, to]) => (
						<TabsTrigger value={key} asChild key={key} className="min-w-max snap-center">
							<Link to={`${to}${tabs.search}`}>{locales[key]}</Link>
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>
			<Outlet />
		</div>
	);
}
