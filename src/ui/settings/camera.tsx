import type { LineElement } from "@/lib/services/settings";
import type {
	DrawingElement,
	LayerInfo,
	MediaMatrix,
} from "@/ui/settings/lines";

import Image from "@/assets/images/config-mock.png";
import { useAddScenarioLine } from "@/hooks/settings/use-add-scenario";
import { useGetScenarioLines } from "@/hooks/settings/use-get-scenario-lines";
import { useLoadVehicles } from "@/hooks/settings/use-load-vehicles";
import { useRemoveScenarioLine } from "@/hooks/settings/use-remove-scenario";
import { useUpdateScenarioLine } from "@/hooks/settings/use-update-scenario";
import { Lines } from "@/ui/settings/lines";
import { DrawingBridge } from "@/ui/settings/lines/drawing/bridge";
import { Skeleton } from "@/ui/shared/skeleton";

const bridge = new DrawingBridge({
	output: {
		id: "id",
		name: "info.name",
		description: "info.description",
		coordinates: "[int(points.x), int(points.y)][]",
		detection_entry: "[int(detection.entry.x), int(detection.entry.y)][]",
		detection_exit: "[int(detection.exit.x), int(detection.exit.y)][]",
		distance: "info.distance",
		color: "rgb(color)",
		type: "info.type",
		layer_id: "layerId",
		visual_coordinates: (_value, element) => ({
			layer_id: element.layerId,
			type: element.type,
			fontSize: element.info.fontSize,
			fontFamily: element.info.fontFamily,
			backgroundColor: element.info.backgroundColor,
			backgroundOpacity: element.info.backgroundOpacity,
			coordinates: element.points.map((point) => [
				Math.floor(point.x),
				Math.floor(point.y),
			]),
		}),
		maps_coordinates: () => [19.3048720286, -99.05621509437437], // Default Mexico City coordinates
		location: () => "zone 1",
		visibility: () => true,
		allowed_directions: () => "ANY",
	},
	input: {
		elements: {
			id: "id",
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
				transform: (value) => {
					return (value as string).replace(" - Entrada", "");
				},
			},
			"scenery.description": "info.description",
			"scenery.type": "info.type",
			// "visual_coordinates.direction": "info.direction",
			"scenery.distance": "info.distance",
			"visual_coordinates.fontSize": "info.fontSize",
			"visual_coordinates.fontFamily": "info.fontFamily",
			"visual_coordinates.backgroundColor": "info.backgroundColor",
			"visual_coordinates.backgroundOpacity": "info.backgroundOpacity",
		},
		layers: {
			"visual_coordinates.layer_id": "id",
			"vehicle.name": "name",
			description: "description",
			"vehicle.id": "category",
			"hex(vehicle.color)": "color",
			"time(createAt)": "createdAt",
			"time(updateAt)": "updatedAt",
		},
	},
});

export function Camera() {
	const { data: vehicles, loading } = useLoadVehicles();
	const { add } = useAddScenarioLine();
	const { remove } = useRemoveScenarioLine();
	const { update } = useUpdateScenarioLine();

	const {
		data: serverLines,
		loading: linesLoading,
		refetch,
	} = useGetScenarioLines();

	const handleDrawingComplete = (data: MediaMatrix) => {
		console.log("Drawing complete, matrix data:", data);
	};

	const handleSaveElements = async (
		elements: DrawingElement[],
		layers: LayerInfo[]
	) => {
		const added = elements.filter((el) => el.syncState === "new");
		const updated = elements.filter((el) => el.syncState === "edited");
		const deleted = elements.filter((el) => el.syncState === "deleted");

		if (added.length === 0 && updated.length === 0 && deleted.length === 0) {
			return;
		}

		const layerMap = new Map(layers.map((layer) => [layer.id, layer]));

		if (added.length > 0) {
			const lines = bridge.export<
				Omit<LineElement, "layer"> & { layer_id: string }
			>(added);

			const toAdd: LineElement[] = lines.flatMap(({ layer_id, ...line }) => {
				const layer = layerMap.get(layer_id);

				if (!layer) return [];

				return {
					...line,
					layer: {
						id: layer.id,
						name: layer.name,
						description: layer.description,
						category: layer.category,
					},
				};
			});

			await add(toAdd);
		}

		if (deleted.length > 0) {
			const toRemove = serverLines.filter((line) =>
				deleted.some((deletion) => deletion.id === line.id)
			);

			await remove(toRemove);
		}

		if (updated.length > 0) {
			const lines = bridge.export<
				Omit<LineElement, "layer"> & { layer_id: string }
			>(updated);

			const toUpdate: LineElement[] = lines.flatMap(({ layer_id, ...line }) => {
				const layer = layerMap.get(layer_id);

				if (!layer) return [];

				return {
					...line,
					layer: {
						id: layer.id,
						name: layer.name,
						description: layer.description,
						category: layer.category,
					},
				};
			});

			await update({ lines: toUpdate, serverLines });
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
				src={Image}
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
