import { memo, useCallback, useEffect } from "react";
import { Layers } from "lucide-react";

import type { LayerFormProps } from "../types";

import { Button } from "@/ui/shared/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/ui/shared/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/ui/shared/select";
import { useDrawingForm } from "../drawing-form/hook";
import { layerFormDefaults, layerFormSchema } from "../drawing-form/schemas";

export const LayerForm = memo(function LayerForm({
	isOpen,
	onClose,
	onCreateLayer,
	onUpdateLayer,
	layerToEdit,
	vehicles = [],
}: LayerFormProps) {
	const isEditing = !!layerToEdit;

	const form = useDrawingForm({
		defaultValues: layerToEdit
			? {
					vehicleId: layerToEdit.category || "",
					description: layerToEdit.description || "",
					opacity: layerToEdit.opacity * 100,
				}
			: layerFormDefaults,
		validators: {
			onSubmit: layerFormSchema,
		},
		onSubmit: async ({ value }) => {
			const selectedVehicle = vehicles.find((v) => v.id === value.vehicleId);
			if (!selectedVehicle) {
				console.error("No vehicle selected");
				return;
			}

			const layerData = {
				name: selectedVehicle.name,
				category: selectedVehicle.id,
				color: selectedVehicle.color,
				description: value.description,
				opacity: value.opacity / 100,
			};

			if (isEditing) {
				onUpdateLayer?.(layerToEdit.id, layerData);
			} else {
				onCreateLayer(layerData);
			}
			onClose();
		},
	});

	useEffect(() => {
		if (isOpen) {
			if (layerToEdit) {
				form.setFieldValue("vehicleId", layerToEdit.category || "");
				form.setFieldValue("description", layerToEdit.description || "");
				form.setFieldValue("opacity", layerToEdit.opacity * 100);
			} else {
				form.reset();
			}
		}
	}, [isOpen, layerToEdit, form]);

	const handleCancel = useCallback(() => {
		onClose();
	}, [onClose]);

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Layers className="w-5 h-5" />
						{isEditing ? "Editar Capa" : "Crear Nueva Capa"}
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
					<form.Field
						name="vehicleId"
						validators={{
							onChange: layerFormSchema.shape.vehicleId,
						}}
					>
						{(field) => (
							<div>
								<label htmlFor="vehicle">Actor víal</label>
								<Select
									value={field.state.value}
									onValueChange={(val) => field.handleChange(val)}
								>
									<SelectTrigger className="w-full" id="vehicle">
										<SelectValue placeholder="Selecciona un vehículo..." />
									</SelectTrigger>
									<SelectContent>
										{vehicles.map((vehicle) => (
											<SelectItem key={vehicle.id} value={vehicle.id}>
												<div className="flex items-center gap-2">
													<div
														className="w-4 h-4 rounded-full"
														style={{ backgroundColor: vehicle.color }}
													/>
													{vehicle.name}
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.errors && (
									<p className="text-sm text-destructive mt-1">
										{field.state.meta.errors.join(", ")}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.AppField
						name="description"
						validators={{
							onChange: layerFormSchema.shape.description,
						}}
					>
						{(field) => (
							<field.TextField
								label="Descripción"
								placeholder="Descripción de la capa..."
							/>
						)}
					</form.AppField>

					<form.AppField
						name="opacity"
						validators={{
							onChange: layerFormSchema.shape.opacity,
						}}
					>
						{(field) => (
							<field.SliderField
								label="Opacidad"
								min={0}
								max={100}
								step={1}
								unit="%"
							/>
						)}
					</form.AppField>

					<form.AppForm>
						<DialogFooter className="gap-2">
							<Button type="button" variant="outline" onClick={handleCancel}>
								Cancelar
							</Button>
							<form.Submit
								label={isEditing ? "Actualizar Capa" : "Crear Capa"}
								loading={isEditing ? "Actualizando..." : "Creando..."}
							/>
						</DialogFooter>
					</form.AppForm>
				</form>
			</DialogContent>
		</Dialog>
	);
});
