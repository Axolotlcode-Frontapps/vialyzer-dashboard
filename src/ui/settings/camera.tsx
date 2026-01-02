import type { LineElement } from "@/lib/services/settings";
import type { DrawingElement, LayerInfo, MediaMatrix } from "@/ui/settings/lines";

import Image from "@/assets/images/config-mock.png";
import { useAddScenarioLine } from "@/hooks/settings/use-add-scenario";
import { useGetPreview } from "@/hooks/settings/use-get-previewy";
import { useGetScenarioLines } from "@/hooks/settings/use-get-scenario-lines";
import { useLoadVehicles } from "@/hooks/settings/use-load-vehicles";
import { useModifyDatasources } from "@/hooks/settings/use-modify-datasources";
import { useRemoveScenarioLine } from "@/hooks/settings/use-remove-scenario";
import { useUpdateScenarioLine } from "@/hooks/settings/use-update-scenario";
import { Lines } from "@/ui/settings/lines";
import { DrawingBridge } from "@/ui/settings/lines/drawing/bridge";
import { Skeleton } from "@/ui/shared/skeleton";

const bridge = new DrawingBridge({
	output: {
		// Main output target for LineElement - includes all data needed for API
		lines: [
			"array",
			{
				id: "id",
				name: "info.name",
				description: "info.description",
				coordinates: "[int(points.x), int(points.y)][]",
				detection_entry: "[int(detection.entry.x), int(detection.entry.y)][]",
				detection_exit: "[int(detection.exit.x), int(detection.exit.y)][]",
				distance: "info.distance",
				color: "rgb(color)",
				type: "layer.type",
				maps_coordinates: () => [19.3048720286, -99.05621509437437],
				location: () => "zone 1",
				visibility: () => true,
				allowed_directions: () => "ANY",
				visual_coordinates: (_value, element, layer) => ({
					layer_id: element.layerId,
					layer_name: layer?.name,
					type: element.type,
					fontSize: element.info.fontSize,
					fontFamily: element.info.fontFamily,
					backgroundColor: element.info.backgroundColor,
					backgroundOpacity: element.info.backgroundOpacity,
					coordinates: element.points.map((point) => [Math.floor(point.x), Math.floor(point.y)]),
				}),
				layer: (_value, element, layer) => ({
					id: layer?.id || element.layerId,
					name: layer?.name || "",
					description: layer?.description || "",
					type: layer?.type || "CONFIGURATION",
					category: layer?.category || [],
				}),
			},
		],
	},
	input: {
		elements: {
			"scenery.id": "id",
			"visual_coordinates.type": "type",
			"points(visual_coordinates.coordinates)": "points",
			"points(scenery.coordinates)": "detection.entry",
			"points(second_scenery.coordinates)": "detection.exit",
			"hex(scenery.color)": "color",
			"scenery.active": "completed",
			"visual_coordinates.layer_id": "layerId",
			"firstPoint(visual_coordinates.coordinates)": "direction.start",
			"endPoint(visual_coordinates.coordinates)": "direction.end",
			"scenery.name": {
				key: "info.name",
				transform: (value) => (value as string).replace(" - Entrada", ""),
			},
			"scenery.description": "info.description",
			"visual_coordinates.direction": {
				key: "info.direction",
				transform: (value) => value ?? "bottom",
			},
			"scenery.distance": "info.distance",
			"visual_coordinates.fontSize": "info.fontSize",
			"visual_coordinates.fontFamily": "info.fontFamily",
			"visual_coordinates.backgroundColor": "info.backgroundColor",
			"visual_coordinates.backgroundOpacity": "info.backgroundOpacity",
		},
		layers: {
			"visual_coordinates.layer_id": "id",
			"visual_coordinates.layer_name": "name",
			description: "description",
			"scenery.type": "type",
			"vehicle.id": "category",
			"hex(vehicle.color)": "color",
			"time(createAt)": "createdAt",
			"time(updateAt)": "updatedAt",
		},
	},
});

export function Camera() {
	const { data: preview } = useGetPreview();
	const { data: vehicles, loading } = useLoadVehicles();
	const { add } = useAddScenarioLine();
	const { remove } = useRemoveScenarioLine();
	const { update } = useUpdateScenarioLine();
	const { modifyDatasources } = useModifyDatasources();

	const { data: serverLines, loading: linesLoading, refetch } = useGetScenarioLines();

	const handleDrawingComplete = (data: MediaMatrix) => {
		console.log("Drawing complete, matrix data:", data);
	};

	const handleSaveElements = async (elements: DrawingElement[], layers: LayerInfo[]) => {
		const added = elements.filter((el) => el.syncState === "new");
		const updated = elements.filter((el) => el.syncState === "edited");
		const deleted = elements.filter((el) => el.syncState === "deleted");

		const editedLayers = layers.filter((layer) => layer.syncState === "edited");

		if (
			added.length === 0 &&
			updated.length === 0 &&
			deleted.length === 0 &&
			editedLayers.length === 0
		) {
			return;
		}

		if (added.length > 0) {
			// Bridge now exports complete LineElement with layer data included
			const toAdd = bridge.exportTarget<LineElement>("lines", added, layers);
			await add(toAdd);
		}

		if (deleted.length > 0) {
			await remove({ elements: deleted, serverLines });
		}

		if (updated.length > 0) {
			// Bridge now exports complete LineElement with layer data included
			const toUpdate = bridge.exportTarget<LineElement>("lines", updated, layers);
			await update({ lines: toUpdate, serverLines });
		}

		if (editedLayers.length > 0) {
			await modifyDatasources({ layers: editedLayers, serverLines });
		}

		refetch();
	};

	const handleLoadElements = async (): Promise<{
		elements: DrawingElement[];
		layers: Map<string, LayerInfo>;
	}> => {
		return bridge.import(serverLines);
	};

	if (loading || linesLoading) {
		return <Skeleton className="w-full aspect-video rounded-md" />;
	}

	return (
		<div className="relative">
			<Lines
				src={preview?.temporal_preview_image || Image}
				type="image"
				onDrawingComplete={handleDrawingComplete}
				onSave={handleSaveElements}
				onLoad={handleLoadElements}
				vehicles={vehicles.map((vehicle) => ({
					name: vehicle.name,
					id: vehicle.id,
					color: `rgb(${vehicle.color[0]}, ${vehicle.color[1]}, ${vehicle.color[2]})`,
				}))}
			/>
		</div>
	);
}
