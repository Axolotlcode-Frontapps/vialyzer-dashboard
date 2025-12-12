import { useMutation } from "@tanstack/react-query";

import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { SourceLine } from "@/lib/services/settings";
import type { LayerInfo } from "@/ui/settings/lines";

import { settings } from "@/lib/services/settings";
import { Route } from "@/routes/_dashboard/settings/cameras/$camera";

interface ModifyDatasourcesParams {
	layers: LayerInfo[];
	serverLines: SourceLine[];
}

interface UseModifyDatasourcesReturn {
	modifyDatasources: UseMutateAsyncFunction<unknown[], Error, ModifyDatasourcesParams, unknown>;
	loading: boolean;
	error: Error | null;
}

export function useModifyDatasources(): UseModifyDatasourcesReturn {
	const { camera } = Route.useParams();

	const { mutateAsync, isPending, error } = useMutation({
		mutationFn: async ({ layers, serverLines }: ModifyDatasourcesParams) => {
			const layersWithChanges = layers.filter((layer) => layer.syncState === "edited");

			if (layersWithChanges.length === 0) {
				return [];
			}

			const all = await Promise.allSettled(
				layersWithChanges.map(async (layer) => {
					const currentVehicleIds = Array.isArray(layer.category)
						? layer.category
						: [layer.category];

					const layerDatasources = serverLines.filter(
						(line) => line.visual_coordinates.layer_id === layer.id
					);

					if (layerDatasources.length === 0) {
						return [];
					}

					const sceneryGroups = new Map<string, SourceLine[]>();
					layerDatasources.forEach((ds) => {
						const sceneryId = ds.scenery.id;
						if (!sceneryGroups.has(sceneryId)) {
							sceneryGroups.set(sceneryId, []);
						}
						sceneryGroups.get(sceneryId)!.push(ds);
					});

					const operations: Promise<unknown>[] = [];

					sceneryGroups.forEach((scenarioDatasources) => {
						const referenceDatasource = scenarioDatasources[0];
						const existingVehicleIds = scenarioDatasources
							.map((ds) => ds.vehicle?.id)
							.filter(Boolean) as string[];

						const isLine =
							referenceDatasource.visual_coordinates.type === "line" ||
							referenceDatasource.visual_coordinates.type === "curve";
						const isDetection = referenceDatasource.scenery.type === "DETECTION";
						const isNearMiss = referenceDatasource.scenery.type === "NEAR_MISS";
						const isConfiguration = referenceDatasource.scenery.type === "CONFIGURATION";

						const hasVehicleChanges =
							(layer.addedCategories && layer.addedCategories.length > 0) ||
							(layer.removedCategories && layer.removedCategories.length > 0);

						const vehiclesToUpdate = hasVehicleChanges
							? existingVehicleIds.filter((vid) => currentVehicleIds.includes(vid))
							: existingVehicleIds;

						// For CONFIGURATION without vehicles, update datasources without vehicle_id
						if (isConfiguration && existingVehicleIds.length === 0) {
							scenarioDatasources.forEach((datasource) => {
								operations.push(
									settings.updateDatasource(
										{
											scenery_id: datasource.scenery.id,
											description: layer.description,
											visual_coordinates: {
												...datasource.visual_coordinates,
												layer_name: layer.name,
											},
											camera,
										},
										datasource.id
									)
								);
							});
						} else {
							vehiclesToUpdate.forEach((vehicleId) => {
								const datasource = scenarioDatasources.find((ds) => ds.vehicle?.id === vehicleId);
								if (datasource) {
									operations.push(
										settings.updateDatasource(
											{
												scenery_id: datasource.scenery.id,
												vehicle_id: vehicleId,
												description: layer.description,
												second_scenery: datasource.second_scenery?.id,
												visual_coordinates: {
													...datasource.visual_coordinates,
													layer_name: layer.name,
												},
												camera,
											},
											datasource.id
										)
									);
								}
							});
						}

						if (layer.addedCategories && layer.addedCategories.length > 0) {
							layer.addedCategories.forEach((vehicleId) => {
								if (!existingVehicleIds.includes(vehicleId)) {
									const datasourceConfig: {
										scenery_id: string;
										vehicle_id: string;
										description?: string;
										second_scenery?: string;
										visual_coordinates: SourceLine["visual_coordinates"];
										camera: string;
									} = {
										scenery_id: referenceDatasource.scenery.id,
										vehicle_id: vehicleId,
										description: layer.description,
										visual_coordinates: {
											...referenceDatasource.visual_coordinates,
											layer_name: layer.name,
										},
										camera,
									};

									// Handle second_scenery for DETECTION and NEAR_MISS types
									if ((isDetection || isNearMiss) && isLine && referenceDatasource.second_scenery) {
										datasourceConfig.second_scenery = referenceDatasource.second_scenery.id;
									}

									operations.push(settings.addDatasource(datasourceConfig));
								}
							});
						}

						if (layer.removedCategories && layer.removedCategories.length > 0) {
							layer.removedCategories.forEach((vehicleId) => {
								const datasource = scenarioDatasources.find((ds) => ds.vehicle?.id === vehicleId);
								if (datasource) {
									operations.push(settings.removeDatasource({ id: datasource.id }, { id: camera }));
								}
							});
						}
					});

					const results = await Promise.all(operations);
					return results;
				})
			);

			const errors = all.filter((item) => item.status === "rejected");

			if (errors.length > 0) {
				throw new Error("Error al modificar datasources de una o más capas de escenario");
			}

			const results = all
				.filter((item) => item.status === "fulfilled")
				.flatMap((item) => item.value);

			return results;
		},
	});

	return {
		modifyDatasources: mutateAsync,
		loading: isPending,
		error,
	};
}
