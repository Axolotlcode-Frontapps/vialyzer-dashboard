import { z } from "zod";

// Label form schema for text annotations
export const labelFormSchema = z.object({
	name: z
		.string()
		.min(1, "El nombre es requerido")
		.max(100, "El nombre debe tener menos de 100 caracteres"),
	description: z.string().max(200, "La descripción debe tener menos de 200 caracteres").optional(),
	counterTrack: z.boolean(),
	distance: z.number().min(0, "La distancia debe ser mayor o igual a 0"),
	fontSize: z
		.number()
		.int()
		.min(8, "El tamaño de fuente debe ser de al menos 8px")
		.max(48, "El tamaño de fuente debe ser menor a 48px"),
	fontFamily: z.string(),
	backgroundEnabled: z.boolean(),
});

// Layer form schema for layer creation
export const layerFormSchema = z
	.object({
		name: z
			.string()
			.min(1, "El nombre es requerido")
			.max(100, "El nombre debe tener menos de 100 caracteres"),
		type: z.enum(["DETECTION", "CONFIGURATION", "NEAR_MISS"], {
			message: "El tipo es requerido",
		}),
		vehicleIds: z.array(z.string("ID de vehículo no válido")),
		description: z
			.string()
			.min(1, "La descripción es requerida")
			.max(200, "La descripción debe tener menos de 200 caracteres"),
		opacity: z
			.number()
			.min(0, "La opacidad debe ser de al menos 0%")
			.max(100, "La opacidad debe ser como máximo 100%"),
	})
	.refine(
		(data) => {
			// vehicleIds is required only for non-CONFIGURATION types
			if (data.type !== "CONFIGURATION") {
				return data.vehicleIds.length > 0;
			}
			return true;
		},
		{
			message: "Debe seleccionar al menos un vehículo",
			path: ["vehicleIds"],
		}
	);

// Type definitions
export type LabelFormValues = z.infer<typeof labelFormSchema>;
export type LayerFormValues = z.infer<typeof layerFormSchema>;

// Schema union type for form validation
export type DrawingFormSchemas = typeof labelFormSchema | typeof layerFormSchema;

// Default values
export const labelFormDefaults: LabelFormValues = {
	name: "",
	description: "",
	counterTrack: false,
	distance: 0,
	fontSize: 16,
	fontFamily: "Arial",
	backgroundEnabled: false,
};

export const layerFormDefaults: LayerFormValues = {
	name: "",
	type: "CONFIGURATION",
	vehicleIds: [],
	description: "",
	opacity: 100,
};
