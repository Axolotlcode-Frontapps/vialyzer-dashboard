import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, NotebookPen, Square } from "lucide-react";

import type { LabelFormProps } from "./types";

import { Button } from "@/ui/shared/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/shared/dialog";
import { useDrawingForm } from "./drawing-form/hook";
import { labelFormSchema } from "./drawing-form/schemas";

const FONT_SIZE_OPTIONS = [
	{ value: 12, label: "12px" },
	{ value: 16, label: "16px" },
	{ value: 20, label: "20px" },
	{ value: 24, label: "24px" },
];

const DIRECTION_OPTIONS = [
	{ value: "left", label: "Izquierda", icon: ArrowLeft },
	{ value: "right", label: "Derecha", icon: ArrowRight },
	{ value: "top", label: "Arriba", icon: ArrowUp },
	{ value: "bottom", label: "Abajo", icon: ArrowDown },
];

export function LabelForm({ drawingEngine }: LabelFormProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [editingTextId, setEditingTextId] = useState<string | null>(null);
	const [_isNew, setIsNew] = useState(false);
	const [layerType, setLayerType] = useState<
		"DETECTION" | "CONFIGURATION" | "NEAR_MISS" | undefined
	>(undefined);

	const form = useDrawingForm({
		defaultValues: {
			name: "",
			description: "",
			direction: "top" as "left" | "right" | "top" | "bottom",
			distance: 0,
			fontSize: 16,
			fontFamily: "Arial",
			backgroundEnabled: false,
		},
		onSubmit: async ({ value }) => {
			if (editingTextId && drawingEngine) {
				const infoData = {
					name: value.name.trim(),
					description: value.description?.trim() || undefined,
					direction: value.direction,
					distance: value.distance,
					fontSize: value.fontSize,
					fontFamily: value.fontFamily,
					backgroundEnabled: value.backgroundEnabled,
				};
				drawingEngine.completeTextInput(editingTextId, infoData);
				// Note: Modal will close via state change listener when updateElementText is emitted
			}
		},
	});

	const handleReset = useCallback(() => {
		setIsOpen(false);
		setEditingTextId(null);
		setIsNew(false);
		setLayerType(undefined);
		form.reset();
	}, [form]);

	// Subscribe to drawing engine state changes
	useEffect(() => {
		if (!drawingEngine) return;

		const unsubscribe = drawingEngine.subscribeToStateChanges((stateChange) => {
			if (stateChange.type === "annotation" && stateChange.action === "openTextEditor") {
				setEditingTextId(stateChange.elementId as string);
				setIsNew(!stateChange.currentText);

				// Update form values from drawing engine
				form.setFieldValue("name", stateChange.currentText || "");
				form.setFieldValue("description", stateChange.currentDescription || "");
				form.setFieldValue("direction", stateChange.currentDirection || "top");
				form.setFieldValue("distance", stateChange.currentDistance ?? 0);
				form.setFieldValue("fontSize", stateChange.currentFontSize || 16);
				form.setFieldValue("fontFamily", "Arial");
				form.setFieldValue("backgroundEnabled", stateChange.currentBackgroundEnabled || false);

				// Set layer type to determine if distance field should be shown
				setLayerType(stateChange.currentLayerType);

				setIsOpen(true);
			} else if (stateChange.type === "annotation" && stateChange.action === "updateElementText") {
				// Successfully updated - close the modal
				handleReset();
			}
		});

		return unsubscribe;
	}, [drawingEngine, form, handleReset]);

	const handleCancel = () => {
		if (drawingEngine) {
			drawingEngine.cancelTextInput();
		}
		handleReset();
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					handleCancel();
				}
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<NotebookPen className="w-5 h-5" />
						{editingTextId ? "Editar Información de Escenario" : "Agregar Información de Escenario"}
					</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.AppField
						name="name"
						validators={{
							onChange: labelFormSchema.shape.name,
						}}
					>
						{(field) => (
							<field.TextField label="Nombre" placeholder="Ingresa el nombre..." autoFocus />
						)}
					</form.AppField>

					<form.AppField name="description">
						{(field) => (
							<field.TextField
								label="Descripción (Opcional)"
								placeholder="Agrega una descripción para esta etiqueta..."
							/>
						)}
					</form.AppField>

					<div className="space-y-4">
						<form.AppField
							name="direction"
							validators={{
								onChange: labelFormSchema.shape.direction,
							}}
						>
							{(field) => (
								<field.ToggleGroupField
									label="Dirección"
									type="single"
									options={DIRECTION_OPTIONS}
									variant="outline"
									size="sm"
									className="justify-start grid-cols-4"
								/>
							)}
						</form.AppField>

						{layerType === "CONFIGURATION" && (
							<form.AppField
								name="distance"
								validators={{
									onChange: labelFormSchema.shape.distance,
								}}
							>
								{(field) => (
									<field.TextField
										label="Distancia"
										placeholder="Ingresa la distancia..."
										type="number"
									/>
								)}
							</form.AppField>
						)}

						<div className="flex items-start gap-4">
							<form.AppField
								name="fontSize"
								validators={{
									onChange: labelFormSchema.shape.fontSize,
								}}
							>
								{(field) => (
									<field.ToggleGroupField
										label="Tamaño de Fuente"
										type="single"
										options={FONT_SIZE_OPTIONS}
										variant="outline"
										size="sm"
										className="justify-start"
									/>
								)}
							</form.AppField>

							<form.AppField
								name="backgroundEnabled"
								validators={{
									onChange: labelFormSchema.shape.backgroundEnabled,
								}}
							>
								{(field) => (
									<field.ToggleField
										label="Fondo"
										variant="outline"
										size="sm"
										aria-label="Alternar fondo blanco"
									>
										<Square className="w-4 h-4" />
									</field.ToggleField>
								)}
							</form.AppField>
						</div>
					</div>

					<form.AppForm>
						<DialogFooter className="gap-2">
							<Button type="button" variant="outline" onClick={handleCancel}>
								Cancelar
							</Button>
							<form.Submit
								label={editingTextId ? "Actualizar" : "Agregar"}
								loading={editingTextId ? "Actualizando..." : "Agregando..."}
							/>
						</DialogFooter>
					</form.AppForm>
				</form>
			</DialogContent>
		</Dialog>
	);
}
