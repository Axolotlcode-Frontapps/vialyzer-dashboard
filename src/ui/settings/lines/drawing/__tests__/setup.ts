/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { vi } from "vitest";

import { DrawingActions } from "../actions";
import { DrawingAnnotation } from "../annotation";
import { DrawingArrange } from "../arrange";
import { DrawingConfig } from "../config";
import { DrawingCore } from "../core";
import { DrawingEffects } from "../effects";
import { DrawingEvents } from "../events";
import { DrawingHistory } from "../history";
import { DrawingLayers } from "../layers";
import { DrawingShortcuts } from "../shortcuts";
import { DrawingState } from "../state";
import { DrawingUtils } from "../utils";

// Mock all dependencies
vi.mock("../config");
vi.mock("../core");
vi.mock("../state");
vi.mock("../events");
vi.mock("../shortcuts");
vi.mock("../actions");
vi.mock("../annotation");
vi.mock("../history");
vi.mock("../layers");
vi.mock("../arrange");
vi.mock("../effects");
vi.mock("../utils");

export interface TestContext {
	canvas: HTMLCanvasElement;
	media: HTMLVideoElement;
	coreMockInstance: any;
	historyMockInstance: any;
	configMockInstance: any;
	actionsMockInstance: any;
	stateMockInstance: any;
	layersMockInstance: any;
	arrangeMockInstance: any;
	annotationMockInstance: any;
	eventsMockInstance: any;
	shortcutsMockInstance: any;
	utilsMockInstance: any;
	effectsMockInstance: any;
}

export function setupTestContext(): TestContext {
	const ctx: TestContext = {} as TestContext;

	// Setup DOM elements
	ctx.canvas = document.createElement("canvas");
	ctx.canvas.width = 800;
	ctx.canvas.height = 600;
	ctx.media = document.createElement("video");
	ctx.media.width = 1920;
	ctx.media.height = 1080;

	// Mock DrawingState implementation
	ctx.stateMockInstance = {
		subscribers: [],
		clone: vi.fn().mockReturnThis(),
		setFeedback: vi.fn(),
		clearFeedback: vi.fn(),
		mode: "cursor",
		elements: [],
		selectedElements: [],
		layers: new Map(),
		layerOrder: [],
		drag: { isDragging: false, elementId: null, pointIndex: null },
		hoveredElement: null,
		clipboard: [],
		pasteOffset: { x: 0, y: 0 },
		drawing: false,
		currentElement: null,
	};
	(DrawingState as any).mockImplementation(() => ctx.stateMockInstance);

	// Mock DrawingConfig implementation
	(DrawingConfig as any).mockImplementation(() => {
		ctx.configMockInstance = {
			resolution: {
				display: { width: ctx.canvas.width, height: ctx.canvas.height },
				target: { width: ctx.media.width, height: ctx.media.height },
				native: { width: ctx.media.width, height: ctx.media.height },
			},
			on: {
				feedback: vi.fn(),
				stateChange: vi.fn(),
			},
			interactionThresholds: {
				line: 10,
				area: 10,
				curve: 10,
				point: 15,
			},
		};
		return ctx.configMockInstance;
	});

	// Mock DrawingLayers implementation with full functionality
	(DrawingLayers as any).mockImplementation(() => {
		// Use state.layers directly instead of a separate mockLayers Map
		const state = ctx.stateMockInstance;

		ctx.layersMockInstance = {
			getLayers: vi.fn(() => Array.from(state.layers.values())),
			getVisibleLayers: vi.fn(() =>
				Array.from(state.layers.values()).filter(
					(layer: any) => layer.visibility === "visible"
				)
			),
			getActiveLayer: vi.fn(() =>
				state.activeLayerId ? state.layers.get(state.activeLayerId) : null
			),
			getLayer: vi.fn((id: string) => state.layers.get(id) || null),
			reset: vi.fn(() => {
				state.layers.clear();
				state.layerOrder = [];
				state.activeLayerId = null;
			}),
			createLayer: vi.fn((layerData: any) => {
				const layer = {
					id: layerData.id || `layer-${Date.now()}`,
					name: layerData.name || "New Layer",
					visibility: layerData.visibility || "visible",
					locked: layerData.locked ?? false,
					opacity: layerData.opacity ?? 1,
					color: layerData.color || "#000000",
					category: layerData.category || [],
					description: layerData.description || "",
					zIndex: layerData.zIndex ?? state.layers.size,
					elementIds: layerData.elementIds || [],
					createdAt: Date.now(),
					updatedAt: Date.now(),
				};
				state.layers.set(layer.id, layer);
				state.layerOrder.push(layer.id);
				if (!state.activeLayerId) {
					state.activeLayerId = layer.id;
				}
				return {
					success: true,
					operation: "createLayer",
					data: { layer },
					affectedLayers: [layer.id],
					affectedElements: [],
					message: `Layer "${layer.name}" created successfully`,
				};
			}),
			updateLayer: vi.fn((id: string, updates: any) => {
				const layer = state.layers.get(id);
				if (layer) {
					const updated = { ...layer, ...updates, updatedAt: Date.now() };
					state.layers.set(id, updated);
					return {
						success: true,
						operation: "updateLayer",
						data: { layer: updated },
						affectedLayers: [id],
						affectedElements: [],
						message: `Layer "${updated.name}" updated successfully`,
					};
				}
				return {
					success: false,
					operation: "updateLayer",
					affectedLayers: [],
					affectedElements: [],
					message: "Layer not found",
				};
			}),
			deleteLayer: vi.fn((id: string) => {
				const layer = state.layers.get(id);
				if (!layer) {
					return {
						success: false,
						operation: "deleteLayer",
						affectedLayers: [],
						affectedElements: [],
						message: "Layer not found",
					};
				}
				const deleted = state.layers.delete(id);
				state.layerOrder = state.layerOrder.filter((lid: string) => lid !== id);
				if (state.activeLayerId === id) {
					state.activeLayerId =
						state.layers.size > 0 ? state.layers.keys().next().value : null;
				}
				return {
					success: deleted,
					operation: "deleteLayer",
					layerId: id,
					affectedLayers: [id],
					affectedElements: layer.elementIds || [],
					message: `Layer "${layer.name}" deleted successfully`,
				};
			}),
			setActiveLayer: vi.fn((id: string) => {
				if (state.layers.has(id)) {
					state.activeLayerId = id;
					return true;
				}
				return false;
			}),
			reorderLayers: vi.fn((newOrder: string[]) => {
				state.layerOrder = newOrder;
				newOrder.forEach((id, index) => {
					const layer = state.layers.get(id);
					if (layer) {
						layer.zIndex = index;
					}
				});
			}),
			addElementToLayer: vi.fn((layerId: string, elementId: string) => {
				const layer = state.layers.get(layerId);
				if (layer && !layer.elementIds.includes(elementId)) {
					layer.elementIds.push(elementId);
					return {
						success: true,
						operation: "addElementToLayer",
						affectedLayers: [layerId],
						affectedElements: [elementId],
						message: "Element added to layer",
					};
				}
				return {
					success: false,
					operation: "addElementToLayer",
					affectedLayers: [],
					affectedElements: [],
					message: "Failed to add element to layer",
				};
			}),
			removeElementFromLayer: vi.fn((layerId: string, elementId: string) => {
				const layer = state.layers.get(layerId);
				if (layer) {
					const index = layer.elementIds.indexOf(elementId);
					if (index > -1) {
						layer.elementIds.splice(index, 1);
						return {
							success: true,
							operation: "removeElementFromLayer",
							affectedLayers: [layerId],
							affectedElements: [elementId],
							message: "Element removed from layer",
						};
					}
				}
				return {
					success: false,
					operation: "removeElementFromLayer",
					affectedLayers: [],
					affectedElements: [],
					message: "Failed to remove element from layer",
				};
			}),
			toggleLayerVisibility: vi.fn((id: string) => {
				const layer = state.layers.get(id);
				if (layer) {
					layer.visibility =
						layer.visibility === "visible" ? "hidden" : "visible";
					return {
						success: true,
						operation: "toggleLayerVisibility",
						data: { layer },
						affectedLayers: [id],
						affectedElements: [],
						message: `Layer visibility toggled`,
					};
				}
				return {
					success: false,
					operation: "toggleLayerVisibility",
					affectedLayers: [],
					affectedElements: [],
					message: "Layer not found",
				};
			}),
			setLayerOpacity: vi.fn((id: string, opacity: number) => {
				const layer = state.layers.get(id);
				if (layer) {
					layer.opacity = opacity;
					return {
						success: true,
						operation: "setLayerOpacity",
						data: { layer },
						affectedLayers: [id],
						affectedElements: [],
						message: `Layer opacity set to ${opacity}`,
					};
				}
				return {
					success: false,
					operation: "setLayerOpacity",
					affectedLayers: [],
					affectedElements: [],
					message: "Layer not found",
				};
			}),
			renameLayer: vi.fn((id: string, name: string) => {
				const layer = state.layers.get(id);
				if (layer) {
					layer.name = name;
					return {
						success: true,
						operation: "renameLayer",
						data: { layer },
						affectedLayers: [id],
						affectedElements: [],
						message: `Layer renamed to "${name}"`,
					};
				}
				return {
					success: false,
					operation: "renameLayer",
					affectedLayers: [],
					affectedElements: [],
					message: "Layer not found",
				};
			}),
			isolateLayer: vi.fn((id: string) => {
				const layer = state.layers.get(id);
				if (layer) {
					state.layers.forEach((l: any) => {
						l.visibility = l.id === id ? "visible" : "hidden";
					});
					return {
						success: true,
						operation: "isolateLayer",
						affectedLayers: Array.from(state.layers.keys()),
						affectedElements: [],
						message: `Layer "${layer.name}" isolated`,
					};
				}
				return {
					success: false,
					operation: "isolateLayer",
					affectedLayers: [],
					affectedElements: [],
					message: "Layer not found",
				};
			}),
			duplicateLayer: vi.fn((id: string) => {
				const layer = state.layers.get(id);
				if (layer) {
					const duplicated = {
						...layer,
						id: `layer-${Date.now()}`,
						name: `${layer.name} (Copy)`,
						elementIds: [],
						createdAt: Date.now(),
						updatedAt: Date.now(),
					};
					state.layers.set(duplicated.id, duplicated);
					state.layerOrder.push(duplicated.id);
					return {
						success: true,
						operation: "duplicateLayer",
						data: { layer: duplicated },
						affectedLayers: [duplicated.id],
						affectedElements: [],
						message: `Layer "${layer.name}" duplicated`,
					};
				}
				return {
					success: false,
					operation: "duplicateLayer",
					affectedLayers: [],
					affectedElements: [],
					message: "Layer not found",
				};
			}),
			moveElementsToLayer: vi.fn(
				(elementIds: string[], targetLayerId: string) => {
					const layer = state.layers.get(targetLayerId);
					if (layer) {
						elementIds.forEach((elementId) => {
							if (!layer.elementIds.includes(elementId)) {
								layer.elementIds.push(elementId);
							}
						});
						return {
							success: true,
							operation: "moveElementsToLayer",
							affectedLayers: [targetLayerId],
							affectedElements: elementIds,
							message: `${elementIds.length} element(s) moved to layer`,
						};
					}
					return {
						success: false,
						operation: "moveElementsToLayer",
						affectedLayers: [],
						affectedElements: [],
						message: "Target layer not found",
					};
				}
			),
		};
		return ctx.layersMockInstance;
	});

	// Mock DrawingHistory implementation with full functionality
	(DrawingHistory as any).mockImplementation(() => {
		const undoStack: any[] = [];
		const redoStack: any[] = [];
		let isApplyingHistory = false;

		ctx.historyMockInstance = {
			recordOperation: vi.fn((operation: any) => {
				if (!isApplyingHistory) {
					undoStack.push(operation);
					redoStack.length = 0;
				}
			}),
			canUndo: vi.fn(() => undoStack.length > 0),
			canRedo: vi.fn(() => redoStack.length > 0),
			undo: vi.fn(() => {
				if (undoStack.length > 0) {
					isApplyingHistory = true;
					const operation = undoStack.pop();
					redoStack.push(operation);
					isApplyingHistory = false;
					return operation;
				}
				return null;
			}),
			redo: vi.fn(() => {
				if (redoStack.length > 0) {
					isApplyingHistory = true;
					const operation = redoStack.pop();
					undoStack.push(operation);
					isApplyingHistory = false;
					return operation;
				}
				return null;
			}),
			getUndoPreview: vi.fn(() => {
				if (undoStack.length > 0) {
					const last = undoStack[undoStack.length - 1];
					return `Undo: ${last.type || "last action"}`;
				}
				return "Undo last action";
			}),
			getRedoPreview: vi.fn(() => {
				if (redoStack.length > 0) {
					const last = redoStack[redoStack.length - 1];
					return `Redo: ${last.type || "last action"}`;
				}
				return "Redo last action";
			}),
			getStats: vi.fn(() => ({
				operations: undoStack.length + redoStack.length,
				memoryBytes: (undoStack.length + redoStack.length) * 1024,
			})),
			isApplyingHistory: false,
			clear: vi.fn(() => {
				undoStack.length = 0;
				redoStack.length = 0;
			}),
			getUndoStack: vi.fn(() => [...undoStack]),
			getRedoStack: vi.fn(() => [...redoStack]),
		};
		return ctx.historyMockInstance;
	});

	// Mock DrawingActions implementation
	(DrawingActions as any).mockImplementation(() => {
		ctx.actionsMockInstance = {
			deleteSelectedElements: vi.fn(),
			exportDrawings: vi.fn(),
			clearSelection: vi.fn(),
			selectAllElements: vi.fn(),
			copySelectedElements: vi.fn(),
			cutSelectedElements: vi.fn(),
			pasteElements: vi.fn(),
			duplicateSelectedElements: vi.fn(),
			groupSelectedElements: vi.fn(),
			ungroupSelectedElements: vi.fn(),
			moveSelectedElements: vi.fn(),
			alignElements: vi.fn(),
			completeTextInput: vi.fn(),
			clearAll: vi.fn(),
			clearClipboard: vi.fn(),
			resetPasteOffset: vi.fn(),
			getClipboard: vi.fn().mockReturnValue([]),
			hasClipboardContent: vi.fn().mockReturnValue(false),
			bringToFront: vi.fn().mockReturnValue([]),
			sendToBack: vi.fn().mockReturnValue([]),
		};
		return ctx.actionsMockInstance;
	});

	// Mock DrawingArrange implementation with full functionality
	(DrawingArrange as any).mockImplementation(() => {
		ctx.arrangeMockInstance = {
			changeZOrder: vi.fn((elementIds, elements, operation) => {
				const affectedIds = [...elementIds];
				let updatedElements = [...elements];

				switch (operation) {
					case "bringToFront":
						updatedElements = elements.map((el: any) => {
							if (elementIds.includes(el.id)) {
								return { ...el, zIndex: elements.length };
							}
							return el;
						});
						break;
					case "sendToBack":
						updatedElements = elements.map((el: any) => {
							if (elementIds.includes(el.id)) {
								return { ...el, zIndex: 0 };
							}
							return el;
						});
						break;
					case "bringForward":
						updatedElements = elements.map((el: any) => {
							if (elementIds.includes(el.id)) {
								return { ...el, zIndex: (el.zIndex || 0) + 1 };
							}
							return el;
						});
						break;
					case "sendBackward":
						updatedElements = elements.map((el: any) => {
							if (elementIds.includes(el.id)) {
								return { ...el, zIndex: Math.max(0, (el.zIndex || 0) - 1) };
							}
							return el;
						});
						break;
					default:
						break;
				}

				return { elements: updatedElements, affectedIds };
			}),
			changeZOrderInLayer: vi.fn((elementIds, elements, operation, layerId) => {
				const affectedIds = [...elementIds];
				let updatedElements = [...elements];

				const layerElements = layerId
					? elements.filter((el: any) => el.layerId === layerId)
					: elements;

				switch (operation) {
					case "bringToFront":
						updatedElements = elements.map((el: any) => {
							if (elementIds.includes(el.id)) {
								return { ...el, zIndex: layerElements.length };
							}
							return el;
						});
						break;
					case "sendToBack":
						updatedElements = elements.map((el: any) => {
							if (elementIds.includes(el.id)) {
								return { ...el, zIndex: 0 };
							}
							return el;
						});
						break;
					case "bringForward":
						updatedElements = elements.map((el: any) => {
							if (elementIds.includes(el.id)) {
								return { ...el, zIndex: (el.zIndex || 0) + 1 };
							}
							return el;
						});
						break;
					case "sendBackward":
						updatedElements = elements.map((el: any) => {
							if (elementIds.includes(el.id)) {
								return { ...el, zIndex: Math.max(0, (el.zIndex || 0) - 1) };
							}
							return el;
						});
						break;
					default:
						break;
				}

				return { elements: updatedElements, affectedIds };
			}),
		};
		return ctx.arrangeMockInstance;
	});

	// Mock DrawingAnnotation implementation
	(DrawingAnnotation as any).mockImplementation(() => {
		ctx.annotationMockInstance = {
			completeTextInput: vi.fn().mockReturnValue([]),
		};
		return ctx.annotationMockInstance;
	});

	// Mock DrawingCore implementation with full functionality
	(DrawingCore as any).mockImplementation(() => {
		const displayToNativeRatio = {
			x: ctx.media.width / ctx.canvas.width,
			y: ctx.media.height / ctx.canvas.height,
		};

		ctx.coreMockInstance = {
			redrawCanvas: vi.fn(),
			transformCoordinates: vi.fn((point: any) => ({
				x: point.x * displayToNativeRatio.x,
				y: point.y * displayToNativeRatio.y,
			})),
			getElementAtPoint: vi.fn((point: any, elements?: any[]) => {
				if (!elements || elements.length === 0) return null;

				for (const element of [...elements].reverse()) {
					if (element.type === "line" || element.type === "area") {
						const threshold = 10;
						for (let i = 0; i < element.points.length - 1; i++) {
							const distance = ctx.coreMockInstance.distanceToLineSegment(
								point,
								element.points[i],
								element.points[i + 1]
							);
							if (distance < threshold) {
								return element.id;
							}
						}
					} else if (element.type === "rectangle") {
						const [p1, p2] = element.points;
						if (
							point.x >= Math.min(p1.x, p2.x) &&
							point.x <= Math.max(p1.x, p2.x) &&
							point.y >= Math.min(p1.y, p2.y) &&
							point.y <= Math.max(p1.y, p2.y)
						) {
							return element.id;
						}
					}
				}
				return null;
			}),
			mediaToDisplayCoords: vi.fn((point: any) => ({
				x: point.x / displayToNativeRatio.x,
				y: point.y / displayToNativeRatio.y,
			})),
			displayToMediaCoords: vi.fn((point: any) => ({
				x: point.x * displayToNativeRatio.x,
				y: point.y * displayToNativeRatio.y,
			})),
			distanceToLineSegment: vi.fn((point: any, start: any, end: any) => {
				const dx = end.x - start.x;
				const dy = end.y - start.y;
				const length = Math.sqrt(dx * dx + dy * dy);

				if (length === 0) {
					return Math.sqrt((point.x - start.x) ** 2 + (point.y - start.y) ** 2);
				}

				const t = Math.max(
					0,
					Math.min(
						1,
						((point.x - start.x) * dx + (point.y - start.y) * dy) /
							(length * length)
					)
				);

				const projX = start.x + t * dx;
				const projY = start.y + t * dy;

				return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
			}),
			pointInPolygon: vi.fn((point: any, polygon: any[]) => {
				let inside = false;
				for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
					const xi = polygon[i].x;
					const yi = polygon[i].y;
					const xj = polygon[j].x;
					const yj = polygon[j].y;

					const intersect =
						yi > point.y !== yj > point.y &&
						point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
					if (intersect) inside = !inside;
				}
				return inside;
			}),
			getScale: vi.fn().mockReturnValue({
				x: displayToNativeRatio.x,
				y: displayToNativeRatio.y,
			}),
			getBounds: vi.fn().mockReturnValue({
				minX: 0,
				minY: 0,
				maxX: ctx.canvas.width,
				maxY: ctx.canvas.height,
			}),
			calculateDirection: vi.fn((element: any) => {
				if (!element.points || element.points.length < 2) return null;

				// For line elements, use first and last point
				if (element.type === "line") {
					return {
						start: element.points[0],
						end: element.points[element.points.length - 1],
					};
				}

				// For other types, calculate from centroid or bounding box
				const sumX = element.points.reduce(
					(sum: number, p: any) => sum + p.x,
					0
				);
				const sumY = element.points.reduce(
					(sum: number, p: any) => sum + p.y,
					0
				);
				const centerX = sumX / element.points.length;
				const centerY = sumY / element.points.length;

				// Create a direction vector
				return {
					start: { x: centerX, y: centerY },
					end: element.points[0],
				};
			}),
			generateMatrix: vi.fn((elements: any[]) => {
				// Return an array of element data for matrix generation
				return elements.map((element) => ({
					id: element.id,
					type: element.type,
					points: element.points,
					color: element.color,
					info: element.info,
				}));
			}),
		};
		return ctx.coreMockInstance;
	});

	// Mock DrawingEvents implementation
	(DrawingEvents as any).mockImplementation(() => {
		ctx.eventsMockInstance = {
			cleanup: vi.fn(),
		};
		return ctx.eventsMockInstance;
	});

	// Mock DrawingShortcuts implementation
	(DrawingShortcuts as any).mockImplementation(() => {
		ctx.shortcutsMockInstance = {
			cleanup: vi.fn(),
		};
		return ctx.shortcutsMockInstance;
	});

	// Mock DrawingUtils implementation
	(DrawingUtils as any).mockImplementation(() => {
		ctx.utilsMockInstance = {
			findElementNearMouse: vi.fn(),
			findPointNearMouse: vi.fn(),
			getMousePos: vi.fn(),
			getElementBounds: vi.fn(),
			generateElementId: vi.fn(() => `element-${Date.now()}`),
			distance: vi.fn((p1: any, p2: any) => {
				return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
			}),
			getElementCenter: vi.fn((element: any) => {
				const sumX = element.points.reduce(
					(sum: number, p: any) => sum + p.x,
					0
				);
				const sumY = element.points.reduce(
					(sum: number, p: any) => sum + p.y,
					0
				);
				return {
					x: sumX / element.points.length,
					y: sumY / element.points.length,
				};
			}),
			isPointInBounds: vi.fn(),
			clampToCanvas: vi.fn((point: any) => point),
		};
		return ctx.utilsMockInstance;
	});

	// Mock DrawingEffects implementation
	(DrawingEffects as any).mockImplementation(() => {
		ctx.effectsMockInstance = {
			addLayerEffect: vi.fn(),
			removeLayerEffect: vi.fn(),
			applyEffect: vi.fn(),
			clearEffects: vi.fn(),
		};
		return ctx.effectsMockInstance;
	});

	return ctx;
}

export function createMockElement(overrides: any = {}) {
	return {
		id: "test-1",
		type: "line",
		points: [
			{ x: 0, y: 0 },
			{ x: 100, y: 100 },
		],
		completed: true,
		color: "#000000",
		lineWidth: 2,
		...overrides,
	};
}

export function createMockLayer(overrides: any = {}) {
	return {
		id: "layer-1",
		name: "Layer 1",
		visible: true,
		locked: false,
		opacity: 1,
		...overrides,
	};
}
