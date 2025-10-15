import type { DrawingShortcutsCallbacks, StateChangeCallback } from "./types";

/**
 * DrawingShortcuts - Handles all keyboard shortcuts and key events
 * Provides centralized keyboard interaction management
 */
export class DrawingShortcuts {
	#onStateChange: StateChangeCallback | null = null;
	#isEditingText = false;

	constructor() {
		this.#setupEventListeners();
	}

	/**
	 * Initialize with callback for state changes
	 */
	initialize(callbacks: DrawingShortcutsCallbacks): void {
		this.#onStateChange = callbacks.onStateChange;
	}

	/**
	 * Update text editing state
	 */
	setTextEditingState(isEditing: boolean): void {
		this.#isEditingText = isEditing;
	}

	/**
	 * Setup keyboard event listeners
	 */
	#setupEventListeners(): void {
		document.addEventListener("keydown", this.#handleKeyPress.bind(this));
	}

	/**
	 * Handle all keyboard shortcuts
	 */
	#handleKeyPress(event: KeyboardEvent): void {
		// Don't handle shortcuts while editing text
		if (this.#isEditingText) return;

		// Drawing mode shortcuts (single keys)
		if (this.#handleDrawingModeShortcuts(event)) {
			return;
		}

		// Action shortcuts (with modifiers)
		if (this.#handleActionShortcuts(event)) {
			return;
		}

		// Special keys
		this.#handleSpecialKeys(event);
	}

	/**
	 * Handle drawing mode shortcuts
	 */
	#handleDrawingModeShortcuts(event: KeyboardEvent): boolean {
		// Only handle single key presses (no modifiers)
		if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
			return false;
		}

		const modeMap: Record<string, string> = {
			c: "cursor",
			"1": "cursor",
			s: "select",
			"2": "select",
			e: "erase",
			"3": "erase",
			l: "line",
			"4": "line",
			a: "area",
			"5": "area",
			u: "curve",
			"6": "curve",
			r: "rectangle",
			"7": "rectangle",
			o: "circle",
			"8": "circle",
			t: "addText",
			p: "togglePanel",
			i: "togglePanel",
		};

		const action = modeMap[event.key.toLowerCase()];
		if (action) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action,
				key: event.key,
			});
			return true;
		}

		return false;
	}

	/**
	 * Handle action shortcuts with modifiers
	 */
	#handleActionShortcuts(event: KeyboardEvent): boolean {
		const isCtrlOrCmd = event.ctrlKey || event.metaKey;
		const isAlt = event.altKey;

		// Layer shortcuts (Alt + key)
		if (isAlt && this.#handleLayerShortcuts(event)) {
			return true;
		}

		if (!isCtrlOrCmd) return false;

		const key = event.key.toLowerCase();

		// Copy
		if (key === "c") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "copy",
				key: event.key,
			});
			return true;
		}

		// Cut
		if (key === "x") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "cut",
				key: event.key,
			});
			return true;
		}

		// Paste
		if (key === "v") {
			event.preventDefault();
			const pasteAtPosition = event.shiftKey;
			this.#onStateChange?.({
				type: "shortcut",
				action: "paste",
				key: event.key,
				pasteAtPosition,
			});
			return true;
		}

		// Duplicate
		if (key === "d") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "duplicate",
				key: event.key,
			});
			return true;
		}

		// Undo
		if (key === "z" && !event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "undo",
				key: event.key,
			});
			return true;
		}

		// Redo
		if (key === "y" || (key === "z" && event.shiftKey)) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "redo",
				key: event.key,
			});
			return true;
		}

		// Select All
		if (key === "a" && !event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "selectAll",
				key: event.key,
			});
			return true;
		}

		// Clear Selection
		if (key === "a" && event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "clearSelection",
				key: event.key,
			});
			return true;
		}

		// Save/Export
		if (key === "s" && !event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "save",
				key: event.key,
			});
			return true;
		}

		// Open
		if (key === "o") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "open",
				key: event.key,
			});
			return true;
		}

		// Export
		if (key === "e" && event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "export",
				key: event.key,
			});
			return true;
		}

		// Clear All
		if (key === "c" && event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "clearAll",
				key: event.key,
			});
			return true;
		}

		// Group
		if (key === "g" && !event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "group",
				key: event.key,
			});
			return true;
		}

		// Ungroup
		if (key === "g" && event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "ungroup",
				key: event.key,
			});
			return true;
		}

		// Bring to Front
		if (key === "]") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "bringToFront",
				key: event.key,
			});
			return true;
		}

		// Send to Back
		if (key === "[") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "sendToBack",
				key: event.key,
			});
			return true;
		}

		// Align Left
		if (key === "l" && event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "alignLeft",
				key: event.key,
			});
			return true;
		}

		// Align Right
		if (key === "r" && event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "alignRight",
				key: event.key,
			});
			return true;
		}

		// Align Center Horizontal
		if (key === "h" && event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "alignCenterX",
				key: event.key,
			});
			return true;
		}

		// Align Top
		if (key === "t" && event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "alignTop",
				key: event.key,
			});
			return true;
		}

		// Align Bottom
		if (key === "b" && event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "alignBottom",
				key: event.key,
			});
			return true;
		}

		// Align Center Vertical
		if (key === "m" && event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "alignCenterY",
				key: event.key,
			});
			return true;
		}

		// Group elements
		if (key === "g") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "group",
				key: event.key,
			});
			return true;
		}

		// Ungroup elements
		if (key === "g" && event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "ungroup",
				key: event.key,
			});
			return true;
		}

		// Bring to front
		if (key === "]") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "bringToFront",
				key: event.key,
			});
			return true;
		}

		// Send to back
		if (key === "[") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "sendToBack",
				key: event.key,
			});
			return true;
		}

		// Bring forward
		if (key === "]" && event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "bringForward",
				key: event.key,
			});
			return true;
		}

		// Send backward
		if (key === "[" && event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "sendBackward",
				key: event.key,
			});
			return true;
		}

		// Flip horizontal
		if (key === "h") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "flipHorizontal",
				key: event.key,
			});
			return true;
		}

		// Flip vertical
		if (key === "v" && event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "flipVertical",
				key: event.key,
			});
			return true;
		}

		return false;
	}

	/**
	 * Handle layer shortcuts (Alt + key)
	 */
	#handleLayerShortcuts(event: KeyboardEvent): boolean {
		const key = event.key.toLowerCase();

		// Create new layer
		if (key === "n") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "createLayer",
				key: event.key,
			});
			return true;
		}

		// Toggle layer visibility
		if (key === "v") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "toggleLayerVisibility",
				key: event.key,
			});
			return true;
		}

		// Isolate layer
		if (key === "i") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "isolateLayer",
				key: event.key,
			});
			return true;
		}

		// Duplicate layer
		if (key === "d") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "duplicateLayer",
				key: event.key,
			});
			return true;
		}

		// Delete layer
		if (key === "delete" || key === "backspace") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "deleteLayer",
				key: event.key,
			});
			return true;
		}

		// Layer navigation (1-9)
		if (key >= "1" && key <= "9") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "selectLayer",
				key: event.key,
				layerIndex: parseInt(key) - 1,
			});
			return true;
		}

		// Previous layer
		if (key === "arrowup") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "previousLayer",
				key: event.key,
			});
			return true;
		}

		// Next layer
		if (key === "arrowdown") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "nextLayer",
				key: event.key,
			});
			return true;
		}

		// Move layer up
		if (key === "arrowup" && event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "moveLayerUp",
				key: event.key,
			});
			return true;
		}

		// Move layer down
		if (key === "arrowdown" && event.shiftKey) {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "moveLayerDown",
				key: event.key,
			});
			return true;
		}

		// Increase layer opacity
		if (key === "=" || key === "+") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "increaseLayerOpacity",
				key: event.key,
			});
			return true;
		}

		// Decrease layer opacity
		if (key === "-" || key === "_") {
			event.preventDefault();
			this.#onStateChange?.({
				type: "shortcut",
				action: "decreaseLayerOpacity",
				key: event.key,
			});
			return true;
		}

		return false;
	}

	/**
	 * Handle special keys (no modifiers needed)
	 */
	#handleSpecialKeys(event: KeyboardEvent): void {
		switch (event.key) {
			case "Enter":
				// Complete multi-point elements (area, curve)
				this.#onStateChange?.({
					type: "shortcut",
					action: "completeElement",
					key: event.key,
				});
				break;

			case "Escape":
				// Cancel current operation
				event.preventDefault();
				this.#onStateChange?.({
					type: "shortcut",
					action: "cancel",
					key: event.key,
				});
				break;

			case "Delete":
			case "Backspace":
				// Delete selected elements
				this.#onStateChange?.({
					type: "shortcut",
					action: "delete",
					key: event.key,
				});
				break;

			case "Tab":
				// Toggle panel or cycle through drawing modes
				event.preventDefault();
				this.#onStateChange?.({
					type: "shortcut",
					action: "togglePanel",
					key: event.key,
				});
				break;

			case " ":
				// Space bar - finish drawing for multi-point elements
				event.preventDefault();
				this.#onStateChange?.({
					type: "shortcut",
					action: "completeElement",
					key: event.key,
				});
				break;

			case "+":
			case "=":
				// Zoom in
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					this.#onStateChange?.({
						type: "shortcut",
						action: "zoomIn",
						key: event.key,
					});
				}
				break;

			case "-":
				// Zoom out
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					this.#onStateChange?.({
						type: "shortcut",
						action: "zoomOut",
						key: event.key,
					});
				}
				break;

			case "0":
				// Reset zoom
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					this.#onStateChange?.({
						type: "shortcut",
						action: "resetZoom",
						key: event.key,
					});
				}
				break;

			case "ArrowUp":
			case "ArrowDown":
			case "ArrowLeft":
			case "ArrowRight":
				// Move selected elements with arrow keys
				// Ctrl/Cmd for precise movement, plain arrows for quick movement
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					const step = event.shiftKey ? 10 : 1; // Shift for larger steps
					this.#onStateChange?.({
						type: "shortcut",
						action: "moveElements",
						key: event.key,
						direction: event.key.replace("Arrow", "").toLowerCase(),
						step,
					});
				} else {
					// Plain arrow keys for quick movement (5px steps)
					event.preventDefault();
					const step = event.shiftKey ? 20 : 5; // Shift for larger steps
					this.#onStateChange?.({
						type: "shortcut",
						action: "moveElements",
						key: event.key,
						direction: event.key.replace("Arrow", "").toLowerCase(),
						step,
					});
				}
				break;

			case "F2":
				// Rename/edit text of selected element
				event.preventDefault();
				this.#onStateChange?.({
					type: "shortcut",
					action: "editText",
					key: event.key,
				});
				break;

			case "F5":
				// Refresh/redraw canvas
				event.preventDefault();
				this.#onStateChange?.({
					type: "shortcut",
					action: "redraw",
					key: event.key,
				});
				break;
			default:
				break;
		}
	}

	/**
	 * Get help text for all shortcuts
	 */
	getShortcutsHelp(): Record<string, Record<string, string>> {
		return {
			"Drawing Modes": {
				"C or 1": "Cursor mode",
				"S or 2": "Select mode",
				"E or 3": "Erase mode",
				"L or 4": "Line mode",
				"A or 5": "Area mode",
				"U or 6": "Curve mode",
				"R or 7": "Rectangle mode",
				"O or 8": "Circle mode",
			},
			Edit: {
				"Ctrl+Z / Cmd+Z": "Undo",
				"Ctrl+Y / Cmd+Y": "Redo",
				"Ctrl+Shift+Z / Cmd+Shift+Z": "Redo (alternative)",
			},
			Clipboard: {
				"Ctrl+C / Cmd+C": "Copy",
				"Ctrl+X / Cmd+X": "Cut",
				"Ctrl+V / Cmd+V": "Paste",
				"Ctrl+D / Cmd+D": "Duplicate",
			},
			Selection: {
				"Ctrl+A / Cmd+A": "Select all",
				"Ctrl+Shift+A / Cmd+Shift+A": "Clear selection",
				"Delete / Backspace": "Delete selected",
			},
			Arrange: {
				"Ctrl+G / Cmd+G": "Group",
				"Ctrl+Shift+G / Cmd+Shift+G": "Ungroup",
				"Ctrl+] / Cmd+]": "Bring to front",
				"Ctrl+[ / Cmd+[": "Send to back",
			},
			Align: {
				"Ctrl+Shift+L / Cmd+Shift+L": "Align left",
				"Ctrl+Shift+R / Cmd+Shift+R": "Align right",
				"Ctrl+Shift+H / Cmd+Shift+H": "Align center horizontal",
				"Ctrl+Shift+T / Cmd+Shift+T": "Align top",
				"Ctrl+Shift+B / Cmd+Shift+B": "Align bottom",
				"Ctrl+Shift+M / Cmd+Shift+M": "Align center vertical",
			},
			View: {
				"Ctrl++ / Cmd++": "Zoom in",
				"Ctrl+- / Cmd+-": "Zoom out",
				"Ctrl+0 / Cmd+0": "Reset zoom",
			},
			Movement: {
				"Arrow Keys": "Move selected elements (5px)",
				"Shift+Arrow Keys": "Move selected elements (20px)",
				"Ctrl+Arrow Keys": "Move selected elements (1px)",
				"Ctrl+Shift+Arrow Keys": "Move selected elements (10px)",
			},
			File: {
				"Ctrl+S / Cmd+S": "Save",
				"Ctrl+O / Cmd+O": "Open",
				"Ctrl+Shift+E / Cmd+Shift+E": "Export",
			},
			Interface: {
				"P or I or Tab": "Toggle panel",
				"Ctrl+Shift+C / Cmd+Shift+C": "Clear all",
			},
			Special: {
				Escape: "Cancel current action",
				"Enter or Space": "Finish drawing",
			},
		};
	}

	/**
	 * Get shortcut for a specific action
	 */
	getShortcutForAction(action: string): string | null {
		const shortcuts: Record<string, string> = {
			cursor: "C or 1",
			select: "S or 2",
			erase: "E or 3",
			line: "L or 4",
			area: "A or 5",
			curve: "U or 6",
			rectangle: "R or 7",
			circle: "O or 8",
			addText: "T",
			copy: "Ctrl+C",
			cut: "Ctrl+X",
			paste: "Ctrl+V",
			duplicate: "Ctrl+D",
			undo: "Ctrl+Z",
			redo: "Ctrl+Y",
			selectAll: "Ctrl+A",
			clearSelection: "Ctrl+Shift+A",
			delete: "Delete",
			save: "Ctrl+S",
			open: "Ctrl+O",
			export: "Ctrl+Shift+E",
			clearAll: "Ctrl+Shift+C",
			group: "Ctrl+G",
			ungroup: "Ctrl+Shift+G",
			bringToFront: "Ctrl+]",
			sendToBack: "Ctrl+[",
			alignLeft: "Ctrl+Shift+L",
			alignRight: "Ctrl+Shift+R",
			alignCenterX: "Ctrl+Shift+H",
			alignTop: "Ctrl+Shift+T",
			alignBottom: "Ctrl+Shift+B",
			alignCenterY: "Ctrl+Shift+M",
			togglePanel: "P or I or Tab",
			cancel: "Escape",
			completeElement: "Enter or Space",
			zoomIn: "Ctrl++",
			zoomOut: "Ctrl+-",
			resetZoom: "Ctrl+0",
		};

		return shortcuts[action] || null;
	}

	/**
	 * Check if a key combination is a registered shortcut
	 */
	isRegisteredShortcut(event: KeyboardEvent): boolean {
		// Drawing mode shortcuts
		if (!event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
			const singleKeyShortcuts = [
				"c",
				"s",
				"e",
				"l",
				"a",
				"u",
				"r",
				"o",
				"t",
				"p",
				"i",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
			];
			if (singleKeyShortcuts.includes(event.key.toLowerCase())) {
				return true;
			}
		}

		// Modifier shortcuts
		if (event.ctrlKey || event.metaKey) {
			const modifierShortcuts = [
				"c",
				"x",
				"v",
				"d",
				"z",
				"y",
				"a",
				"s",
				"o",
				"e",
				"g",
				"l",
				"r",
				"h",
				"t",
				"b",
				"m",
				"[",
				"]",
				"+",
				"=",
				"-",
				"0",
			];
			if (modifierShortcuts.includes(event.key.toLowerCase())) {
				return true;
			}
		}

		// Special keys
		const specialKeys = [
			"Enter",
			"Escape",
			"Delete",
			"Backspace",
			"Tab",
			" ",
			"F2",
			"F5",
		];
		if (specialKeys.includes(event.key)) {
			return true;
		}

		// Arrow keys (with or without modifiers)
		if (event.key.startsWith("Arrow")) {
			return true;
		}

		return false;
	}

	/**
	 * Cleanup event listeners
	 */
	cleanup(): void {
		document.removeEventListener("keydown", this.#handleKeyPress);
	}

	/**
	 * Temporarily disable shortcuts (useful when showing dialogs)
	 */
	disable(): void {
		document.removeEventListener("keydown", this.#handleKeyPress);
	}

	/**
	 * Re-enable shortcuts
	 */
	enable(): void {
		document.addEventListener("keydown", this.#handleKeyPress.bind(this));
	}

	/**
	 * Check if shortcuts are currently enabled
	 */
	isEnabled(): boolean {
		return !this.#isEditingText;
	}
}
