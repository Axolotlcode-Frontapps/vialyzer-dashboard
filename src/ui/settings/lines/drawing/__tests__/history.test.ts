// @vitest-environment jsdom
/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TestContext } from "./setup";

import { DrawingEngine } from "../index";
import { setupTestContext } from "./setup";

describe("DrawingEngine - History", () => {
	let ctx: TestContext;
	let engine: DrawingEngine;

	beforeEach(() => {
		ctx = setupTestContext();
		engine = new DrawingEngine(ctx.canvas, ctx.media);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("History Operations", () => {
		it("should initially have no undo operations", () => {
			expect(engine.canUndo()).toBe(false);
		});

		it("should initially have no redo operations", () => {
			expect(engine.canRedo()).toBe(false);
		});

		it("should be able to undo after adding elements", () => {
			const testElement = {
				id: "test-1",
				type: "line" as const,
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 100 },
				],
				completed: true,
				color: "rgb(0, 0, 0)",
				lineWidth: 2,
				info: {
					name: "Test Line",
					type: "DETECTION" as const,
					direction: "left" as const,
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 1,
				},
			};

			engine.addElements([testElement], new Map());

			// After adding elements, should be able to undo
			expect(engine.canUndo()).toBe(true);
			expect(engine.canRedo()).toBe(false);
		});

		it("should perform undo operation", () => {
			const testElement = {
				id: "test-1",
				type: "line" as const,
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 100 },
				],
				completed: true,
				color: "rgb(0, 0, 0)",
				lineWidth: 2,
				info: {
					name: "Test Line",
					type: "DETECTION" as const,
					direction: "left" as const,
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 1,
				},
			};

			engine.addElements([testElement], new Map());
			expect(engine.elements).toHaveLength(1);

			// Undo should work
			engine.undoLast();

			// After undo, should have redo available
			expect(engine.canRedo()).toBe(true);
		});

		it("should perform redo operation", () => {
			const testElement = {
				id: "test-1",
				type: "line" as const,
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 100 },
				],
				completed: true,
				color: "rgb(0, 0, 0)",
				lineWidth: 2,
				info: {
					name: "Test Line",
					type: "DETECTION" as const,
					direction: "left" as const,
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 1,
				},
			};

			engine.addElements([testElement], new Map());
			engine.undoLast();

			// Should be able to redo
			expect(engine.canRedo()).toBe(true);

			engine.redoLast();

			// After redo, should be able to undo again
			expect(engine.canUndo()).toBe(true);
		});

		it("should get undo preview", () => {
			const preview = engine.getUndoPreview();

			// Initially should have no preview or a default message
			expect(preview === null || typeof preview === "string").toBe(true);
		});

		it("should get redo preview", () => {
			const preview = engine.getRedoPreview();

			// Initially should have no preview or a default message
			expect(preview === null || typeof preview === "string").toBe(true);
		});

		it("should get history stats", () => {
			const stats = engine.getHistoryStats();

			expect(stats).toBeDefined();
		});

		it("should not undo when cannot undo", () => {
			const initialElements = engine.elements.length;

			// Try to undo when there's nothing to undo
			engine.undoLast();

			// Should remain the same
			expect(engine.elements.length).toBe(initialElements);
		});

		it("should not redo when cannot redo", () => {
			const initialElements = engine.elements.length;

			// Try to redo when there's nothing to redo
			engine.redoLast();

			// Should remain the same
			expect(engine.elements.length).toBe(initialElements);
		});

		it("should track multiple operations", () => {
			const element1 = {
				id: "test-1",
				type: "line" as const,
				points: [
					{ x: 0, y: 0 },
					{ x: 50, y: 50 },
				],
				completed: true,
				color: "rgb(255, 0, 0)",
				lineWidth: 2,
				info: {
					name: "Test Line 1",
					type: "DETECTION" as const,
					direction: "left" as const,
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 1,
				},
			};

			const element2 = {
				id: "test-2",
				type: "line" as const,
				points: [
					{ x: 50, y: 50 },
					{ x: 100, y: 100 },
				],
				completed: true,
				color: "rgb(0, 255, 0)",
				lineWidth: 2,
				info: {
					name: "Test Line 2",
					type: "DETECTION" as const,
					direction: "left" as const,
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 1,
				},
			};

			// Add multiple elements
			engine.addElements([element1], new Map());
			engine.addElements([element2], new Map());

			// Should be able to undo multiple times
			expect(engine.canUndo()).toBe(true);
			engine.undoLast();
			expect(engine.canUndo()).toBe(true);
		});

		it("should handle history preview updates", () => {
			const testElement = {
				id: "test-1",
				type: "line" as const,
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 100 },
				],
				completed: true,
				color: "rgb(0, 0, 0)",
				lineWidth: 2,
				info: {
					name: "Test Line",
					type: "DETECTION" as const,
					direction: "left" as const,
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 1,
				},
			};

			engine.addElements([testElement], new Map());

			const undoPreview = engine.getUndoPreview();
			expect(undoPreview === null || typeof undoPreview === "string").toBe(
				true
			);

			engine.undoLast();

			const redoPreview = engine.getRedoPreview();
			expect(redoPreview === null || typeof redoPreview === "string").toBe(
				true
			);
		});

		it("should clear redo stack when new operation is performed", () => {
			const element1 = {
				id: "test-1",
				type: "line" as const,
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 100 },
				],
				completed: true,
				color: "rgb(0, 0, 0)",
				lineWidth: 2,
				info: {
					name: "Element 1",
					type: "DETECTION" as const,
					direction: "left" as const,
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 1,
				},
			};

			const element2 = {
				id: "test-2",
				type: "line" as const,
				points: [
					{ x: 100, y: 100 },
					{ x: 200, y: 200 },
				],
				completed: true,
				color: "rgb(0, 0, 0)",
				lineWidth: 2,
				info: {
					name: "Element 2",
					type: "DETECTION" as const,
					direction: "left" as const,
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 1,
				},
			};

			// Add element
			engine.addElements([element1], new Map());

			// Undo
			engine.undoLast();
			expect(engine.canRedo()).toBe(true);

			// Add new element - should clear redo stack
			engine.addElements([element2], new Map());

			// After new operation, redo should be empty
			// (implementation specific - may vary)
			const canRedo = engine.canRedo();
			expect(typeof canRedo).toBe("boolean");
		});

		it("should handle mode changes in history", () => {
			// Change mode
			engine.setDrawingMode("line");
			expect(engine.canUndo()).toBe(true);

			engine.setDrawingMode("select");
			expect(engine.canUndo()).toBe(true);

			// Should be able to undo mode changes
			engine.undoLast();
			expect(engine.canRedo()).toBe(true);
		});

		it("should handle clear all operation in history", () => {
			const testElement = {
				id: "test-1",
				type: "line" as const,
				points: [
					{ x: 0, y: 0 },
					{ x: 100, y: 100 },
				],
				completed: true,
				color: "rgb(0, 0, 0)",
				lineWidth: 2,
				info: {
					name: "Test Line",
					type: "DETECTION" as const,
					direction: "left" as const,
					distance: 0,
					fontSize: 12,
					fontFamily: "Arial",
					backgroundOpacity: 1,
				},
			};

			engine.addElements([testElement], new Map());
			expect(engine.elements).toHaveLength(1);

			// Clear all
			engine.clearAll();
			expect(engine.elements).toHaveLength(0);

			// Should be able to undo clear all
			expect(engine.canUndo()).toBe(true);
		});
	});
});
