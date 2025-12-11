import { memo, useCallback, useEffect, useState } from "react";
import { ChevronDown, Layers, X } from "lucide-react";

import type { LayerFormProps } from "../types";

import { Badge } from "@/ui/shared/badge";
import { Button } from "@/ui/shared/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/ui/shared/dialog";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/ui/shared/dropdown-menu";
import { useDrawingForm } from "../drawing-form/hook";
import { layerFormDefaults, layerFormSchema } from "../drawing-form/schemas";

const TYPE_OPTIONS = [
	{ value: "DETECTION", label: "Detección" },
	{ value: "CONFIGURATION", label: "Configuración" },
	{ value: "NEAR_MISS", label: "Casi accidente" },
];

export const LayerForm = memo(function LayerForm({
	isOpen,
	onClose,
	onCreateLayer,
	onUpdateLayer,
	layerToEdit,
	vehicles = [],
}: LayerFormProps) {
	const isEditing = !!layerToEdit;
	const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
	const [selectedType, setSelectedType] = useState<
		"DETECTION" | "CONFIGURATION" | "NEAR_MISS"
	>("CONFIGURATION");

	const form = useDrawingForm({
		defaultValues: layerToEdit
			? {
					name: layerToEdit.name || "",
					type: layerToEdit.type || "CONFIGURATION",
					vehicleIds: layerToEdit.category || [],
					description: layerToEdit.description || "",
					opacity: layerToEdit.opacity * 100,
				}
			: layerFormDefaults,
		validators: {
			onSubmit: layerFormSchema,
		},
		onSubmit: async ({ value }) => {
			// vehicleIds is only required for non-CONFIGURATION types
			if (value.type !== "CONFIGURATION" && value.vehicleIds.length === 0) {
				console.error("No vehicles selected");
				return;
			}

			const layerData = {
				name: value.name,
				type: value.type,
				category: value.type === "CONFIGURATION" ? [] : value.vehicleIds,
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: form methods are stable and including form in deps causes infinite loops
	useEffect(() => {
		if (isOpen) {
			if (layerToEdit) {
				form.setFieldValue("name", layerToEdit.name || "");
				form.setFieldValue("type", layerToEdit.type || "CONFIGURATION");
				form.setFieldValue("vehicleIds", layerToEdit.category || []);
				form.setFieldValue("description", layerToEdit.description || "");
				form.setFieldValue("opacity", layerToEdit.opacity * 100);
				setSelectedVehicles(layerToEdit.category || []);
				setSelectedType(layerToEdit.type || "CONFIGURATION");
			} else {
				form.reset();
				setSelectedVehicles([]);
				setSelectedType("CONFIGURATION");
			}
		} else {
			form.reset();
			setSelectedVehicles([]);
			setSelectedType("CONFIGURATION");
		}
	}, [isOpen, layerToEdit]);

	const handleCancel = useCallback(() => {
		setSelectedVehicles([]);
		setSelectedType("CONFIGURATION");
		onClose();
	}, [onClose]);

	const handleToggleVehicle = useCallback(
		(vehicleId: string, checked: boolean) => {
			const newSelection = checked
				? [...selectedVehicles, vehicleId]
				: selectedVehicles.filter((id) => id !== vehicleId);
			setSelectedVehicles(newSelection);
			form.setFieldValue("vehicleIds", newSelection);
		},
		[selectedVehicles, form]
	);

	const handleRemoveVehicle = useCallback(
		(vehicleId: string) => {
			const newSelection = selectedVehicles.filter((id) => id !== vehicleId);
			setSelectedVehicles(newSelection);
			form.setFieldValue("vehicleIds", newSelection);
		},
		[selectedVehicles, form]
	);

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
					<form.AppField
						name="name"
						validators={{
							onChange: layerFormSchema.shape.name,
						}}
					>
						{(field) => (
							<field.TextField
								label="Nombre de la capa"
								placeholder="Nombre de la capa..."
							/>
						)}
					</form.AppField>

					<form.AppField
						name="type"
						validators={{
							onChange: layerFormSchema.shape.type,
						}}
					>
						{(field) => (
							<field.ToggleGroupField
								label="Tipo"
								type="single"
								options={TYPE_OPTIONS}
								variant="outline"
								size="sm"
								className="justify-start"
							/>
						)}
					</form.AppField>

					<form.Subscribe selector={(state) => state.values.type}>
						{(typeValue) => {
							// Update local state when form type changes
							if (typeValue !== selectedType) {
								// Use setTimeout to avoid state update during render
								setTimeout(() => {
									setSelectedType(typeValue);
									// Clear vehicles when switching to CONFIGURATION
									if (typeValue === "CONFIGURATION") {
										setSelectedVehicles([]);
										form.setFieldValue("vehicleIds", []);
									}
								}, 0);
							}
							return null;
						}}
					</form.Subscribe>

					{selectedType !== "CONFIGURATION" && (
						<form.Field
							name="vehicleIds"
							validators={{
								onChange: layerFormSchema.shape.vehicleIds,
							}}
						>
							{(field) => (
								<div>
									<label htmlFor="vehicles">Actores viales</label>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<button
												type="button"
												className="border-input data-placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 min-h-10 h-auto"
												id="vehicles"
											>
												<div className="h-full flex flex-wrap gap-1 flex-1">
													{selectedVehicles.length === 0 ? (
														<span className="text-muted-foreground">
															Agregar vehículo...
														</span>
													) : (
														selectedVehicles.map((vehicleId) => {
															const vehicle = vehicles.find(
																(v) => v.id === vehicleId
															);
															if (!vehicle) return null;
															return (
																<Badge
																	key={vehicleId}
																	variant="secondary"
																	className="flex items-center gap-1"
																>
																	<span
																		className="w-3 h-3 rounded-full block"
																		style={{ backgroundColor: vehicle.color }}
																	/>
																	{vehicle.name}
																	<button
																		type="button"
																		onPointerDown={(e) => {
																			e.stopPropagation();
																			e.preventDefault();
																			handleRemoveVehicle(vehicleId);
																		}}
																		onClick={(e) => {
																			e.stopPropagation();
																			e.preventDefault();
																		}}
																		className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
																	>
																		<X className="w-3 h-3" />
																	</button>
																</Badge>
															);
														})
													)}
												</div>
												<ChevronDown className="size-4 opacity-50 shrink-0" />
											</button>
										</DropdownMenuTrigger>
										<DropdownMenuContent className="w-80" align="center">
											{vehicles.map((vehicle) => (
												<DropdownMenuCheckboxItem
													key={vehicle.id}
													checked={selectedVehicles.includes(vehicle.id)}
													onCheckedChange={(checked) =>
														handleToggleVehicle(vehicle.id, checked)
													}
													onSelect={(e) => e.preventDefault()}
												>
													<div className="flex items-center gap-2">
														<div
															className="w-4 h-4 rounded-full"
															style={{ backgroundColor: vehicle.color }}
														/>
														{vehicle.name}
													</div>
												</DropdownMenuCheckboxItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
									{field.state.meta.errors ? (
										<p className="text-sm text-destructive mt-1">
											{field.state.meta.errors.length > 0
												? typeof field.state.meta.errors?.[0] === "string"
													? field.state.meta.errors?.[0]
													: field.state.meta.errors?.[0]?.message
												: null}
										</p>
									) : null}
								</div>
							)}
						</form.Field>
					)}

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
