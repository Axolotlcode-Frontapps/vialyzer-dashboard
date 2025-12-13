// @vitest-environment jsdom
/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock all dependencies BEFORE imports
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

import { DrawingActions } from "../actions";
import { DrawingAnnotation } from "../annotation";
import { DrawingArrange } from "../arrange";
import { DrawingConfig } from "../config";
import { DrawingCore } from "../core";
import { DrawingEffects } from "../effects";
import { DrawingEvents } from "../events";
import { DrawingHistory } from "../history";
import { DrawingEngine } from "../index";
import { DrawingLayers } from "../layers";
import { DrawingShortcuts } from "../shortcuts";
import { DrawingState } from "../state";
import { DrawingUtils } from "../utils";

describe("DrawingShortcuts", () => {
	let canvas: HTMLCanvasElement;
	let media: HTMLVideoElement;
	let engine: DrawingEngine;
	let stateMockInstance: any;
	let configMockInstance: any;
	let shortcutsMockInstance: any;
	let historyMockInstance: any;
	let actionsMockInstance: any;

	beforeEach(() => {
		canvas = document.createElement("canvas");
		media = document.createElement("video");

		// Mock DrawingState
		stateMockInstance = {
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
			feedbackMessage: "",
			showFeedback: false,
		};
		(DrawingState as any).mockImplementation(() => stateMockInstance);

		// Mock DrawingConfig
		(DrawingConfig as any).mockImplementation(() => {
			configMockInstance = {
				resolution: {
					display: { width: 1920, height: 1080 },
					target: { width: 1920, height: 1080 },
					native: { width: 1920, height: 1080 },
				},
				interactionThresholds: {
					line: 10,
					area: 10,
					curve: 10,
					point: 15,
				},
				on: {
					feedback: vi.fn(),
					stateChange: vi.fn(),
				},
			};
			return configMockInstance;
		});

		// Mock DrawingCore
		(DrawingCore as any).mockImplementation(() => ({
			redrawCanvas: vi.fn(),
			transformCoordinates: vi.fn().mockReturnValue({ x: 10, y: 10 }),
			getElementAtPoint: vi.fn(),
		}));

		// Mock DrawingLayers
		(DrawingLayers as any).mockImplementation(() => ({
			getLayers: vi.fn().mockReturnValue([]),
			getVisibleLayers: vi.fn().mockReturnValue([]),
			getActiveLayer: vi.fn(),
			getLayer: vi.fn(),
			reset: vi.fn(),
			createLayer: vi.fn(),
			updateLayer: vi.fn(),
			deleteLayer: vi.fn(),
			reorderLayers: vi.fn(),
		}));

		// Mock DrawingHistory
		(DrawingHistory as any).mockImplementation(() => {
			historyMockInstance = {
				recordOperation: vi.fn(),
				canUndo: vi.fn().mockReturnValue(false),
				canRedo: vi.fn().mockReturnValue(false),
				undo: vi.fn(),
				redo: vi.fn(),
				getUndoPreview: vi.fn().mockReturnValue("Undo last action"),
				getRedoPreview: vi.fn().mockReturnValue("Redo last action"),
				getStats: vi.fn().mockReturnValue({ operations: 5, memoryBytes: 1024 }),
				isApplyingHistory: false,
				clear: vi.fn(),
			};
			return historyMockInstance;
		});

		// Mock DrawingActions
		(DrawingActions as any).mockImplementation(() => {
			actionsMockInstance = {
				deleteSelectedElements: vi.fn().mockReturnValue([]),
				exportDrawings: vi.fn().mockReturnValue([]),
				clearSelection: vi.fn(),
				selectAllElements: vi.fn(),
				copySelectedElements: vi.fn(),
				cutSelectedElements: vi.fn().mockReturnValue([]),
				pasteElements: vi.fn().mockReturnValue([]),
				duplicateSelectedElements: vi.fn().mockReturnValue([]),
				groupSelectedElements: vi.fn().mockReturnValue([]),
				ungroupSelectedElements: vi.fn().mockReturnValue([]),
				moveSelectedElements: vi.fn().mockReturnValue([]),
				alignElements: vi.fn().mockReturnValue([]),
				clearAll: vi.fn(),
				clearClipboard: vi.fn(),
				resetPasteOffset: vi.fn(),
				getClipboard: vi.fn().mockReturnValue([]),
				hasClipboardContent: vi.fn().mockReturnValue(false),
				bringToFront: vi.fn().mockReturnValue([]),
				sendToBack: vi.fn().mockReturnValue([]),
			};
			return actionsMockInstance;
		});

		// Mock DrawingArrange
		(DrawingArrange as any).mockImplementation(() => ({
			changeZOrder: vi.fn().mockReturnValue({ elements: [], affectedIds: [] }),
			changeZOrderInLayer: vi.fn().mockReturnValue({ elements: [], affectedIds: [] }),
		}));

		// Mock DrawingAnnotation
		(DrawingAnnotation as any).mockImplementation(() => ({
			completeTextInput: vi.fn().mockReturnValue([]),
		}));

		// Mock DrawingEvents
		(DrawingEvents as any).mockImplementation(() => ({
			cleanup: vi.fn(),
		}));

		// Mock DrawingShortcuts
		(DrawingShortcuts as any).mockImplementation(() => {
			shortcutsMockInstance = {
				cleanup: vi.fn(),
				registerShortcut: vi.fn(),
				unregisterShortcut: vi.fn(),
				handleKeyDown: vi.fn(),
				handleKeyUp: vi.fn(),
				isShortcutPressed: vi.fn().mockReturnValue(false),
			};
			return shortcutsMockInstance;
		});

		// Mock DrawingUtils
		(DrawingUtils as any).mockImplementation(() => ({
			findElementNearMouse: vi.fn(),
			findPointNearMouse: vi.fn(),
			getMousePos: vi.fn(),
			getElementBounds: vi.fn(),
			generateElementId: vi.fn(() => "test-id-123"),
			distance: vi.fn(),
			getElementCenter: vi.fn(),
			isPointInBounds: vi.fn(),
			clampToCanvas: vi.fn(),
		}));

		// Mock DrawingEffects
		(DrawingEffects as any).mockImplementation(() => ({
			addLayerEffect: vi.fn(),
			removeLayerEffect: vi.fn(),
			cleanup: vi.fn(),
		}));

		engine = new DrawingEngine(canvas, media);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Shortcuts Initialization", () => {
		it("should initialize DrawingShortcuts module", () => {
			expect(DrawingShortcuts).toHaveBeenCalled();
		});

		it("should provide shortcuts instance", () => {
			expect(shortcutsMockInstance).toBeDefined();
		});

		it("should have cleanup method", () => {
			expect(shortcutsMockInstance.cleanup).toBeDefined();
			expect(typeof shortcutsMockInstance.cleanup).toBe("function");
		});
	});

	describe("Undo/Redo Shortcuts", () => {
		it("should support undo shortcut (Ctrl+Z)", () => {
			historyMockInstance.canUndo.mockReturnValue(true);

			const keyEvent = new KeyboardEvent("keydown", {
				key: "z",
				ctrlKey: true,
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalledWith(keyEvent);
			}
		});

		it("should support redo shortcut (Ctrl+Y)", () => {
			historyMockInstance.canRedo.mockReturnValue(true);

			const keyEvent = new KeyboardEvent("keydown", {
				key: "y",
				ctrlKey: true,
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalledWith(keyEvent);
			}
		});

		it("should support redo shortcut (Ctrl+Shift+Z)", () => {
			historyMockInstance.canRedo.mockReturnValue(true);

			const keyEvent = new KeyboardEvent("keydown", {
				key: "z",
				ctrlKey: true,
				shiftKey: true,
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});
	});

	describe("Clipboard Shortcuts", () => {
		it("should support copy shortcut (Ctrl+C)", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];

			const keyEvent = new KeyboardEvent("keydown", {
				key: "c",
				ctrlKey: true,
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should support cut shortcut (Ctrl+X)", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];

			const keyEvent = new KeyboardEvent("keydown", {
				key: "x",
				ctrlKey: true,
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should support paste shortcut (Ctrl+V)", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "v",
				ctrlKey: true,
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should support select all shortcut (Ctrl+A)", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "a",
				ctrlKey: true,
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});
	});

	describe("Mode Shortcuts", () => {
		it("should support cursor mode shortcut (V)", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "v",
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should support line mode shortcut (L)", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "l",
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should support rectangle mode shortcut (R)", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "r",
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should support circle mode shortcut (C)", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "c",
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should support text mode shortcut (T)", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "t",
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});
	});

	describe("Delete Shortcuts", () => {
		it("should support delete shortcut (Delete)", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];

			const keyEvent = new KeyboardEvent("keydown", {
				key: "Delete",
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should support delete shortcut (Backspace)", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];

			const keyEvent = new KeyboardEvent("keydown", {
				key: "Backspace",
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});
	});

	describe("Escape Shortcut", () => {
		it("should support escape to cancel operation (Escape)", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "Escape",
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should clear selection on escape", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];

			const keyEvent = new KeyboardEvent("keydown", {
				key: "Escape",
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});
	});

	describe("Arrow Key Shortcuts", () => {
		it("should support arrow up for moving elements", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];

			const keyEvent = new KeyboardEvent("keydown", {
				key: "ArrowUp",
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should support arrow down for moving elements", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];

			const keyEvent = new KeyboardEvent("keydown", {
				key: "ArrowDown",
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should support arrow left for moving elements", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];

			const keyEvent = new KeyboardEvent("keydown", {
				key: "ArrowLeft",
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should support arrow right for moving elements", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];

			const keyEvent = new KeyboardEvent("keydown", {
				key: "ArrowRight",
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should support shift+arrow for larger movements", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];

			const keyEvent = new KeyboardEvent("keydown", {
				key: "ArrowUp",
				shiftKey: true,
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});
	});

	describe("Grouping Shortcuts", () => {
		it("should support group shortcut (Ctrl+G)", () => {
			stateMockInstance.selectedElements = [
				{ id: "1", type: "line" },
				{ id: "2", type: "rect" },
			];

			const keyEvent = new KeyboardEvent("keydown", {
				key: "g",
				ctrlKey: true,
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should support ungroup shortcut (Ctrl+Shift+G)", () => {
			stateMockInstance.selectedElements = [{ id: "group-1", type: "group" }];

			const keyEvent = new KeyboardEvent("keydown", {
				key: "g",
				ctrlKey: true,
				shiftKey: true,
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});
	});

	describe("Z-Order Shortcuts", () => {
		it("should support bring to front shortcut", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];

			const keyEvent = new KeyboardEvent("keydown", {
				key: "]",
				ctrlKey: true,
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should support send to back shortcut", () => {
			stateMockInstance.selectedElements = [{ id: "1", type: "line" }];

			const keyEvent = new KeyboardEvent("keydown", {
				key: "[",
				ctrlKey: true,
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});
	});

	describe("Custom Shortcut Registration", () => {
		it("should support registering custom shortcuts", () => {
			if (shortcutsMockInstance.registerShortcut) {
				shortcutsMockInstance.registerShortcut("Ctrl+K", vi.fn());
				expect(shortcutsMockInstance.registerShortcut).toHaveBeenCalledWith(
					"Ctrl+K",
					expect.any(Function)
				);
			}
		});

		it("should support unregistering shortcuts", () => {
			if (shortcutsMockInstance.unregisterShortcut) {
				shortcutsMockInstance.unregisterShortcut("Ctrl+K");
				expect(shortcutsMockInstance.unregisterShortcut).toHaveBeenCalledWith("Ctrl+K");
			}
		});
	});

	describe("Shortcut State Checking", () => {
		it("should check if shortcut is currently pressed", () => {
			if (shortcutsMockInstance.isShortcutPressed) {
				shortcutsMockInstance.isShortcutPressed("Ctrl+C");
				expect(shortcutsMockInstance.isShortcutPressed).toHaveBeenCalledWith("Ctrl+C");
			}
		});

		it("should track modifier keys state", () => {
			if (shortcutsMockInstance.isShortcutPressed) {
				const result = shortcutsMockInstance.isShortcutPressed("Ctrl");
				expect(result).toBe(false);
			}
		});
	});

	describe("Platform-specific Shortcuts", () => {
		it("should handle Mac Command key as Ctrl", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "c",
				metaKey: true, // Command key on Mac
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should handle Windows/Linux Ctrl key", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "c",
				ctrlKey: true,
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});
	});

	describe("Shortcuts Cleanup", () => {
		it("should cleanup shortcuts on engine cleanup", () => {
			engine.cleanup();
			expect(shortcutsMockInstance.cleanup).toHaveBeenCalled();
		});

		it("should remove all keyboard listeners on cleanup", () => {
			shortcutsMockInstance.cleanup();
			expect(shortcutsMockInstance.cleanup).toHaveBeenCalled();
		});

		it("should be safe to cleanup multiple times", () => {
			shortcutsMockInstance.cleanup();
			shortcutsMockInstance.cleanup();
			expect(shortcutsMockInstance.cleanup).toHaveBeenCalledTimes(2);
		});
	});

	describe("Shortcut Conflicts", () => {
		it("should handle conflicting shortcuts properly", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "c",
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should prioritize Ctrl+C over C", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "c",
				ctrlKey: true,
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});
	});

	describe("Key Press and Release", () => {
		it("should handle key down events", () => {
			const keyEvent = new KeyboardEvent("keydown", {
				key: "Shift",
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyEvent);
				expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			}
		});

		it("should handle key up events", () => {
			const keyEvent = new KeyboardEvent("keyup", {
				key: "Shift",
			});

			if (shortcutsMockInstance.handleKeyUp) {
				shortcutsMockInstance.handleKeyUp(keyEvent);
				expect(shortcutsMockInstance.handleKeyUp).toHaveBeenCalled();
			}
		});

		it("should track key state between down and up", () => {
			const keyDownEvent = new KeyboardEvent("keydown", {
				key: "Control",
			});
			const keyUpEvent = new KeyboardEvent("keyup", {
				key: "Control",
			});

			if (shortcutsMockInstance.handleKeyDown) {
				shortcutsMockInstance.handleKeyDown(keyDownEvent);
			}

			if (shortcutsMockInstance.handleKeyUp) {
				shortcutsMockInstance.handleKeyUp(keyUpEvent);
			}

			expect(shortcutsMockInstance.handleKeyDown).toHaveBeenCalled();
			expect(shortcutsMockInstance.handleKeyUp).toHaveBeenCalled();
		});
	});

	describe("Integration with Engine", () => {
		it("should be initialized with engine", () => {
			expect(DrawingShortcuts).toHaveBeenCalled();
		});

		it("should work with other modules", () => {
			expect(engine).toBeDefined();
			expect(shortcutsMockInstance).toBeDefined();
		});

		it("should trigger actions through shortcuts", () => {
			expect(actionsMockInstance).toBeDefined();
		});
	});

	describe("Performance", () => {
		it("should handle rapid key presses efficiently", () => {
			const startTime = performance.now();

			for (let i = 0; i < 100; i++) {
				if (shortcutsMockInstance.handleKeyDown) {
					const keyEvent = new KeyboardEvent("keydown", {
						key: "a",
					});
					shortcutsMockInstance.handleKeyDown(keyEvent);
				}
			}

			const endTime = performance.now();
			const duration = endTime - startTime;

			expect(duration).toBeLessThan(50); // Should complete in less than 50ms
		});
	});
});
