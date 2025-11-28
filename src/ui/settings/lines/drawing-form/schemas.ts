import { z } from "zod";

// Label form schema for text annotations
export const labelFormSchema = z
	.object({
		name: z
			.string()
			.min(1, "El nombre es requerido")
			.max(100, "El nombre debe tener menos de 100 caracteres"),
		description: z
			.string()
			.max(200, "La descripción debe tener menos de 200 caracteres")
			.optional(),
		type: z.enum(["DETECTION", "CONFIGURATION", "NEAR_MISS"], {
			message: "El tipo es requerido",
		}),
		direction: z.enum(["left", "right", "top", "bottom"], {
			message: "La dirección es requerida",
		}),
		distance: z.number().min(0, "La distancia debe ser mayor o igual a 0"),
		fontSize: z
			.number()
			.int()
			.min(8, "El tamaño de fuente debe ser de al menos 8px")
			.max(48, "El tamaño de fuente debe ser menor a 48px"),
		fontFamily: z.string(),
		backgroundEnabled: z.boolean(),
	})
	.refine(
		(data) => {
			// distance must be greater than 0 for CONFIGURATION type
			if (data.type === "CONFIGURATION") {
				return data.distance > 0;
			}
			return true;
		},
		{
			message: "La distancia debe ser mayor a 0 para el tipo CONFIGURATION",
			path: ["distance"],
		}
	)
	.refine(
		(data) => {
			// distance must be 0 for DETECTION and NEAR_MISS types
			if (data.type === "DETECTION" || data.type === "NEAR_MISS") {
				return data.distance === 0;
			}
			return true;
		},
		{
			message: "La distancia debe ser 0 para los tipos DETECTION y NEAR_MISS",
			path: ["distance"],
		}
	);

// Layer form schema for layer creation
export const layerFormSchema = z.object({
	name: z
		.string()
		.min(1, "El nombre es requerido")
		.max(100, "El nombre debe tener menos de 100 caracteres"),
	vehicleIds: z
		.array(z.string("ID de vehículo no válido"))
		.min(1, "Debe seleccionar al menos un vehículo"),
	description: z
		.string()
		.min(1, "La descripción es requerida")
		.max(200, "La descripción debe tener menos de 200 caracteres"),
	opacity: z
		.number()
		.min(0, "La opacidad debe ser de al menos 0%")
		.max(100, "La opacidad debe ser como máximo 100%"),
});

// Type definitions
export type LabelFormValues = z.infer<typeof labelFormSchema>;
export type LayerFormValues = z.infer<typeof layerFormSchema>;

// Schema union type for form validation
export type DrawingFormSchemas =
	| typeof labelFormSchema
	| typeof layerFormSchema;

// Default values
export const labelFormDefaults: LabelFormValues = {
	name: "",
	description: "",
	type: "DETECTION",
	direction: "top",
	distance: 0,
	fontSize: 16,
	fontFamily: "Arial",
	backgroundEnabled: false,
};

export const layerFormDefaults: LayerFormValues = {
	name: "",
	vehicleIds: [],
	description: "",
	opacity: 100,
};
