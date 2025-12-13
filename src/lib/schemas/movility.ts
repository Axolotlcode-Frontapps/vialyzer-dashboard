import z from "zod";

import { sharedSchemas } from "./shared";

class MovilitySchema {
	filters = z.object({
		...sharedSchemas.searchParamsSchema.shape,
		selected: z.string().optional(),
		filter: z.enum(["normal", "warning", "error"]).optional(),
	});

	filtersCameraSearch = z.object({
		startDate: z.iso
			.datetime({
				offset: true,
				message: "Fecha inicial no válida",
			})
			.optional()
			.nullable(),
		endDate: z.iso
			.datetime({ offset: true, message: "Fecha final no válida" })
			.optional()
			.nullable(),
		year: z.number().int().max(new Date().getFullYear()).optional().nullable(),
		month: z
			.number()
			.int()
			.min(1)
			.max(new Date().getMonth() + 1)
			.optional()
			.nullable(),
		actors: z
			.array(z.uuid("Actor vial no válido"))
			.min(1, "Seleccione al menos un actor vial")
			.optional()
			.nullable(),
		zones: z.array(z.uuid()).optional().nullable(),
		dayOfWeek: z.number().int().min(0).max(6).optional().nullable(),
		hour: z.number().int().min(0).max(23).optional().nullable(),
		minuteInterval: z.number().int().min(0).max(3).optional().nullable(),
		date: z.string().optional().nullable(),
		startInterval: z.string().optional().nullable(),
		endInterval: z.string().optional().nullable(),
	});

	filtersCameraForm = z.object({
		...this.filtersCameraSearch.shape,
		camera: z.uuid("Camara no válida"),
		actors: z.array(z.uuid("Actor vial no válido")).min(1, "Seleccione al menos un actor vial"),
		zones: z.array(z.uuid()),
	});
}

export const movilitySchemas = new MovilitySchema();

export type MovilitySearchParams = z.infer<typeof movilitySchemas.filters>;
export type MovilityCameraFilters = z.infer<typeof movilitySchemas.filtersCameraSearch>;
export type MovilityCameraForm = z.infer<typeof movilitySchemas.filtersCameraForm>;
