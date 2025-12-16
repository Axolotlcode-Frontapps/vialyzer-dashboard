import { useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { format, weekStart } from "@formkit/tempo";

import type { MovilityCameraFilters, MovilityCameraForm } from "@/lib/schemas/movility";

import { Route } from "@/routes/_dashboard/movility/$camera/route";

export const dateRanges: {
	key: (typeof rangesDates)[number];
	label: string;
}[] = [
	{ key: "7d", label: "Last 7 Days" },
	{ key: "30d", label: "Last 30 Days" },
	{ key: "custom", label: "Custom Range" },
];

export const vehicles = {
	CAR: "Automóvil",
	BICYCLE: "Bicicleta",
	MOTORCYCLE: "Motocicleta",
	BUS: "Bus",
	VAN: "Van",
	HEAVY_TRUCK: "Camión pesado",
	PERSON: "Peatón",
	TRUCK: "Camión",
};

export const rangesDates = ["7d", "30d", "custom"] as const;

// 0, 1, 2, 3, 4, 5, 6
export const dayOfWeek = [
	{
		id: 0,
		name: "Sunday",
	},
	{
		id: 1,
		name: "Monday",
	},
	{
		id: 2,
		name: "Tuesday",
	},
	{
		id: 3,
		name: "Wednesday",
	},
	{
		id: 4,
		name: "Thursday",
	},
	{
		id: 5,
		name: "Friday",
	},
	{
		id: 6,
		name: "Saturday",
	},
] as const;

// (0 = 0 - 14, 1 = 15 - 29, 2 = 30 - 44, 3 = 45 - 59)
export const minuteIntervals = [
	{ id: 0, name: "00 - 14" },
	{ id: 1, name: "15 - 29" },
	{ id: 2, name: "30 - 44" },
	{ id: 3, name: "45 - 59" },
] as const;

export const defaultValues: MovilityCameraForm = {
	camera: "",
	startDate: format(weekStart(new Date()), "YYYY-MM-DDTHH:mm:ssZ"),
	endDate: format(new Date(), "YYYY-MM-DDTHH:mm:ssZ"),
	year: new Date().getFullYear(),
	month: new Date().getMonth(),
	actors: [],
	zones: [],
	dayOfWeek: undefined,
	hour: undefined,
	minuteInterval: undefined,
	date: format(new Date(), "YYYY-MM-DDTHH:mm:ssZ"),
	startInterval: undefined, //'00:00',
	endInterval: undefined, // `${new Date().getHours().toString().padStart(2, '0')}:59`,
};

export function getDefaultValues(
	searchParams: MovilityCameraFilters
): Omit<MovilityCameraForm, "camera"> {
	const searchCategories = searchParams.actors;
	const actors = searchCategories ?? defaultValues.actors;

	const searchScenarios = searchParams.zones;
	const zones = searchScenarios ?? defaultValues.zones;

	const year = Number(searchParams.year ?? defaultValues.year);
	const month = Number(searchParams.month ?? defaultValues.month);

	const searchStartDate = searchParams.startDate;
	const startDate = searchStartDate ?? defaultValues.startDate;

	const searchEndDate = searchParams.endDate;
	const endDate = searchEndDate ?? defaultValues.endDate;

	const dayOfWeekValue = searchParams.dayOfWeek ?? defaultValues.dayOfWeek;
	const dayOfWeek = dayOfWeekValue ? Number(dayOfWeekValue) : undefined;

	const hourValue = searchParams.hour ?? defaultValues.hour;
	const hour = hourValue ? Number(hourValue) : undefined;

	const minuteIntervalValue = searchParams.minuteInterval ?? defaultValues.minuteInterval;
	const minuteInterval = minuteIntervalValue ? Number(minuteIntervalValue) : undefined;

	const searchDate = searchParams.date;
	const date = searchDate ?? defaultValues.date;

	const searchStartInterval = searchParams.startInterval;
	const startInterval = searchStartInterval ?? defaultValues.startInterval;

	const searchEndInterval = searchParams.endInterval;
	const endInterval = searchEndInterval ?? defaultValues.endInterval;

	return {
		actors,
		zones,
		year,
		month,
		startDate,
		endDate,
		dayOfWeek,
		hour,
		minuteInterval,
		date,
		startInterval,
		endInterval,
	};
}

export function useGraphFilters() {
	const { camera } = Route.useParams();
	const search = Route.useSearch();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const initialValues: Partial<MovilityCameraForm> = useMemo(
		() => ({
			...getDefaultValues(search),
			camera,
		}),
		[search, camera]
	);

	const inVelocity = useMemo(() => pathname.includes("velocity"), [pathname]);

	function onChange({
		camera: updatedCamera,
		...values
	}: MovilityCameraFilters & Pick<MovilityCameraForm, "camera">) {
		const params: typeof search = structuredClone(search);

		if (values.actors && values.actors.length > 0) {
			params.actors = values.actors;
		} else {
			params.actors = undefined;
		}
		if (values.zones && values.zones.length > 0) {
			params.zones = values.zones;
		} else {
			params.zones = undefined;
		}

		for (const key in values) {
			if (key !== "vehicleIds" && key !== "scenarioIds") {
				const paramKey = key as keyof MovilityCameraFilters;
				const value = values[paramKey];
				if (value) {
					// biome-ignore lint/suspicious/noExplicitAny: Needed for dynamic key assignment
					params[paramKey] = value as any;
				} else {
					params[paramKey] = undefined;
				}
			}
		}

		navigate({
			to: `/movility/${updatedCamera}/${inVelocity ? ("velocity" as const) : ("volume" as const)}`,
			search: params,
		});
	}

	return {
		initialValues,
		onChange,
	};
}
