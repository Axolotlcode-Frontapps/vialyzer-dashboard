import { z } from "zod";

// Label form schema for text annotations
export const labelFormSchema = z.object({
	content: z
		.string()
		.min(1, "Text content is required")
		.max(100, "Text content must be less than 100 characters"),
	description: z
		.string()
		.max(200, "Description must be less than 200 characters")
		.optional(),
	fontSize: z
		.number()
		.int()
		.min(8, "Font size must be at least 8px")
		.max(48, "Font size must be less than 48px"),
	backgroundEnabled: z.boolean(),
});

// Layer form schema for layer creation
export const layerFormSchema = z.object({
	name: z
		.string()
		.min(1, "Layer name is required")
		.max(50, "Layer name must be less than 50 characters")
		.regex(
			/^[a-zA-Z0-9\s\-_]+$/,
			"Layer name can only contain letters, numbers, spaces, hyphens, and underscores"
		),
	description: z
		.string()
		.max(200, "Description must be less than 200 characters")
		.optional(),
	opacity: z
		.number()
		.min(0, "Opacity must be at least 0%")
		.max(100, "Opacity must be at most 100%"),
	color: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color code"),
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
	content: "",
	description: "",
	fontSize: 16,
	backgroundEnabled: false,
};

export const layerFormDefaults: LayerFormValues = {
	name: "",
	description: "",
	opacity: 100,
	color: "#4ECDC4",
};
