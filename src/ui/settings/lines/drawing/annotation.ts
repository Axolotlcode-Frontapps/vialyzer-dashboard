import type { DrawingConfig } from "./config";
import type {
	AccessibilityIssue,
	AccessibilityReport,
	ColorAnalysis,
	DrawingElement,
	DrawingStatistics,
	LabelType,
	LayerInfo,
	TextAnalysis,
	TextData,
	TextFormattingOptions,
	ValidationError,
} from "./types";

/**
 * DrawingAnnotation - Handles text labels management and statistics
 * Provides centralized annotation and analytics functionality
 */
export class DrawingAnnotation {
	#config: DrawingConfig;
	//
	constructor(config: DrawingConfig) {
		this.#config = config;
	}

	/**
	 * Open text editor for an element
	 */
	openTextEditor(elementId: string, element?: DrawingElement, layer?: LayerInfo): void {
		if (!element?.completed) return;

		this.#config.on.stateChange({
			type: "annotation",
			action: "openTextEditor",
			elementId,
			currentText: element.info?.name || "",
			currentDescription: element.info?.description || "",
			currentCounterTrack: element.counter_track || false,
			currentDistance: element.info?.distance ?? 0,
			currentFontSize: element.info?.fontSize || 16,
			currentBackgroundEnabled: !!element.info?.backgroundColor,
			currentLayerType: layer?.type,
		});
	}

	/**
	 * Complete text input for an element
	 */
	completeTextInput(
		elementId: string,
		textData: TextData,
		elements: DrawingElement[]
	): DrawingElement[] | undefined {
		// Handle backward compatibility - content is deprecated, use name
		const name = textData.name || textData.content || "";

		if (!name.trim()) {
			this.#config.on.feedback("Name cannot be empty");
			return;
		}

		const updatedElements = elements.map((element) => {
			if (element.id === elementId) {
				// Create updated element - type is inherited from layer, distance is set from form
				const updatedElement = {
					...element,
					counter_track: textData.counterTrack,
					info: {
						...element.info,
						name: name.trim(),
						description: textData.description?.trim() || undefined,
						distance: textData.distance,
						fontSize: textData.fontSize,
						fontFamily: textData.fontFamily || "Arial",
						backgroundColor: textData.backgroundEnabled ? "#ffffff" : undefined,
						backgroundOpacity: 0.8,
					},
				};

				return updatedElement;
			}
			return element;
		});

		this.#config.on.stateChange({
			type: "annotation",
			action: "updateElementText",
			elements: updatedElements,
		});

		this.#config.on.feedback("Label updated successfully");

		return updatedElements;
	}

	/**
	 * Remove info from an element (reset to default)
	 */
	removeTextFromElement(
		elementId: string,
		elements: DrawingElement[]
	): DrawingElement[] | undefined {
		const updatedElements = elements.map((element) => {
			if (element.id === elementId) {
				return {
					...element,
					info: {
						...element.info,
						name: "",
						description: undefined,
						direction: "top" as const,
						fontSize: 16,
						fontFamily: "Arial",
						backgroundColor: undefined,
						backgroundOpacity: 0.8,
					},
				};
			}
			return element;
		});

		this.#config.on.stateChange({
			type: "annotation",
			action: "removeElementText",
			elements: updatedElements,
		});

		this.#config.on.feedback("Label removed");

		return updatedElements;
	}

	/**
	 * Calculate statistics for all elements
	 */
	calculateStatistics(elements: DrawingElement[]): DrawingStatistics {
		const stats = {
			total: elements.length,
			completed: elements.filter((el) => el.completed).length,
			withText: elements.filter((el) => el.info?.name).length,
			byType: {
				line: elements.filter((el) => el.type === "line").length,
				area: elements.filter((el) => el.type === "area").length,
				curve: elements.filter((el) => el.type === "curve").length,
				rectangle: elements.filter((el) => el.type === "rectangle").length,
				circle: elements.filter((el) => el.type === "circle").length,
			},
			averagePoints:
				elements.length > 0
					? Math.round(
							(elements.reduce((sum, el) => sum + el.points.length, 0) / elements.length) * 100
						) / 100
					: 0,
			colors: this.#analyzeColors(elements),
			textStats: this.#analyzeTextLabels(elements),
		};

		return stats;
	}

	/**
	 * Analyze color usage in elements
	 */
	#analyzeColors(elements: DrawingElement[]): ColorAnalysis {
		const colorCount: Record<string, number> = {};

		elements.forEach((element) => {
			if (element.color) {
				colorCount[element.color] = (colorCount[element.color] || 0) + 1;
			}
		});

		return {
			unique: Object.keys(colorCount).length,
			distribution: colorCount,
			mostUsed:
				Object.entries(colorCount).reduce(
					(a, b) => (colorCount[a[0]] > colorCount[b[0]] ? a : b),
					["", 0]
				)[0] || null,
		};
	}

	/**
	 * Analyze text labels in elements
	 */
	#analyzeTextLabels(elements: DrawingElement[]): TextAnalysis {
		const elementsWithText = elements.filter((el) => el.info?.name);
		const elementsWithDescription = elements.filter((el) => el.info?.description);

		if (elementsWithText.length === 0) {
			return {
				total: 0,
				averageLength: 0,
				fontSizes: [],
				longestText: null,
				shortestText: null,
				withDescription: 0,
				averageDescriptionLength: 0,
			};
		}

		const textLengths = elementsWithText.map((el) => el.info?.name.length || 0);
		const descriptionLengths = elementsWithDescription.map(
			(el) => el.info?.description?.length || 0
		);
		const fontSizes = Array.from(
			new Set(elementsWithText.map((el) => el.info?.fontSize || 16))
		).sort((a, b) => a - b);

		const longestElement = elementsWithText.reduce((a, b) =>
			(a.info?.name.length || 0) > (b.info?.name.length || 0) ? a : b
		);
		const shortestElement = elementsWithText.reduce((a, b) =>
			(a.info?.name.length || 0) < (b.info?.name.length || 0) ? a : b
		);

		return {
			total: elementsWithText.length,
			averageLength:
				Math.round((textLengths.reduce((a, b) => a + b, 0) / textLengths.length) * 100) / 100,
			fontSizes,
			longestText: {
				content: longestElement.info?.name || "",
				length: longestElement.info?.name.length || 0,
				elementType: longestElement.type,
			},
			shortestText: {
				content: shortestElement.info?.name || "",
				length: shortestElement.info?.name.length || 0,
				elementType: shortestElement.type,
			},
			withDescription: elementsWithDescription.length,
			averageDescriptionLength:
				descriptionLengths.length > 0
					? Math.round(
							(descriptionLengths.reduce((a, b) => a + b, 0) / descriptionLengths.length) * 100
						) / 100
					: 0,
		};
	}

	/**
	 * Generate text statistics summary
	 */
	generateTextSummary(elements: DrawingElement[]): string {
		const stats = this.calculateStatistics(elements);

		const summary = [];

		if (stats.total === 0) {
			return "No elements in drawing";
		}

		summary.push(`Total elements: ${stats.total}`);
		summary.push(`Completed: ${stats.completed}`);
		summary.push(`With text labels: ${stats.withText}`);

		if (stats.byType.line > 0) summary.push(`Lines: ${stats.byType.line}`);
		if (stats.byType.area > 0) summary.push(`Areas: ${stats.byType.area}`);
		if (stats.byType.curve > 0) summary.push(`Curves: ${stats.byType.curve}`);
		if (stats.byType.rectangle > 0) summary.push(`Rectangles: ${stats.byType.rectangle}`);
		if (stats.byType.circle > 0) summary.push(`Circles: ${stats.byType.circle}`);

		if (stats.textStats.total > 0) {
			summary.push(`Average text length: ${stats.textStats.averageLength} characters`);
			if (stats.textStats.withDescription > 0) {
				summary.push(`With descriptions: ${stats.textStats.withDescription}`);
				summary.push(
					`Average description length: ${stats.textStats.averageDescriptionLength} characters`
				);
			}
			if (stats.textStats.longestText) {
				summary.push(
					`Longest text: "${stats.textStats.longestText.content}" (${stats.textStats.longestText.length} chars)`
				);
			}
		}

		if (stats.textStats.withDescription > 0) {
			summary.push(
				`Text labels with descriptions: ${stats.textStats.withDescription}/${stats.textStats.total} (${Math.round((stats.textStats.withDescription / stats.textStats.total) * 100)}%)`
			);
		}

		return summary.join("\n");
	}

	/**
	 * Find elements with specific text content
	 */
	findElementsByText(
		elements: DrawingElement[],
		searchText: string,
		caseSensitive: boolean = false
	): DrawingElement[] {
		const searchTerm = caseSensitive ? searchText : searchText.toLowerCase();

		return elements.filter((element) => {
			if (!element.info || !element.info.name) return false;

			const name = caseSensitive ? element.info.name : element.info.name.toLowerCase();
			const description = element.info.description
				? caseSensitive
					? element.info.description
					: element.info.description.toLowerCase()
				: "";

			return name.includes(searchTerm) || description.includes(searchTerm);
		});
	}

	/**
	 * Find elements without text labels
	 */
	findElementsWithoutText(elements: DrawingElement[]): DrawingElement[] {
		return elements.filter((element) => !element.info || !element.info.name);
	}

	/**
	 * Get text label validation errors
	 */
	validateTextLabels(
		elements: DrawingElement[],
		layers?: Map<string, LayerInfo>
	): ValidationError[] {
		const errors: ValidationError[] = [];

		elements.forEach((element, index) => {
			if (element.info) {
				if (!element.info.name || element.info.name.trim() === "") {
					errors.push({
						elementId: element.id,
						elementIndex: index,
						type: "empty_content",
						message: "Label name is empty",
					});
				}

				if (element.info.name && element.info.name.length > 100) {
					errors.push({
						elementId: element.id,
						elementIndex: index,
						type: "content_too_long",
						message: `Label name is too long (${element.info.name.length} characters, max 100)`,
					});
				}

				if (element.info.description && element.info.description.length > 200) {
					errors.push({
						elementId: element.id,
						elementIndex: index,
						type: "description_too_long",
						message: `Label description is too long (${element.info.description.length} characters, max 200)`,
					});
				}

				if (element.info.fontSize && (element.info.fontSize < 8 || element.info.fontSize > 48)) {
					errors.push({
						elementId: element.id,
						elementIndex: index,
						type: "invalid_font_size",
						message: `Font size ${element.info.fontSize} is outside valid range (8-48)`,
					});
				}

				// Check if distance is required based on layer type
				const layer = element.layerId ? layers?.get(element.layerId) : undefined;
				if (
					layer?.type === "CONFIGURATION" &&
					(element.info.distance === undefined || element.info.distance === null)
				) {
					errors.push({
						elementId: element.id,
						elementIndex: index,
						type: "missing_distance",
						message: "Distance is required for CONFIGURATION type",
					});
				}
			}
		});

		return errors;
	}

	/**
	 * Auto-generate text labels based on element properties
	 */
	generateAutoLabels(elements: DrawingElement[], labelType: LabelType = "type"): DrawingElement[] {
		const updatedElements = elements.map((element, index) => {
			// Skip if element already has name
			if (element.info?.name) {
				return element;
			}

			let autoText = "";

			switch (labelType) {
				case "type":
					autoText = element.type.charAt(0).toUpperCase() + element.type.slice(1);
					break;
				case "index":
					autoText = `${element.type} ${index + 1}`;
					break;
				case "coordinates":
					if (element.points.length > 0) {
						const firstPoint = element.points[0];
						autoText = `(${Math.round(firstPoint.x)}, ${Math.round(firstPoint.y)})`;
					}
					break;
				case "color":
					autoText = element.color || "Unknown Color";
					break;
				default:
					autoText = `Element ${index + 1}`;
			}

			return {
				...element,
				text: {
					content: autoText,
					description: undefined,
					fontSize: 16,
					fontFamily: "Arial",
					backgroundColor: "#ffffff",
					backgroundOpacity: 0.8,
				},
			};
		});

		this.#config.on.stateChange({
			type: "annotation",
			action: "autoGenerateLabels",
			elements: updatedElements,
		});

		this.#config.on.feedback(`Auto-generated ${labelType} labels for ${elements.length} elements`);

		return updatedElements;
	}

	/**
	 * Export text labels as CSV
	 */
	exportTextLabelsAsCSV(
		elements: DrawingElement[],
		layers?: Map<string, LayerInfo>
	): string | null {
		const elementsWithText = elements.filter((el) => el.info?.name);

		if (elementsWithText.length === 0) {
			this.#config.on.feedback("No text labels to export");
			return null;
		}

		const headers = [
			"Element ID",
			"Type",
			"Name",
			"Description",
			"Layer Type",
			"Counter Track",
			"Distance",
			"Font Size",
			"Has Background",
			"Point Count",
		];
		const rows = elementsWithText.map((element) => {
			const layer = element.layerId ? layers?.get(element.layerId) : undefined;
			return [
				element.id,
				element.type,
				`"${(element.info?.name || "").replace(/"/g, '""')}"`, // Escape quotes for CSV
				`"${(element.info?.description || "").replace(/"/g, '""')}"`,
				layer?.type || "DETECTION",
				element.counter_track || false,
				element.info?.distance || "",
				element.info?.fontSize || 16,
				!!element.info?.backgroundColor,
				element.points.length,
			];
		});

		const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

		this.#config.on.feedback(`Exported ${elementsWithText.length} text labels as CSV`);

		return csvContent;
	}

	/**
	 * Get text formatting options
	 */
	getTextFormattingOptions(): TextFormattingOptions {
		return {
			fontSizes: [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48],
			fontFamilies: [
				"Arial",
				"Helvetica",
				"Times New Roman",
				"Courier New",
				"Verdana",
				"Georgia",
				"Palatino",
				"Garamond",
				"Bookman",
				"Comic Sans MS",
				"Trebuchet MS",
				"Arial Black",
				"Impact",
			],
			backgroundColors: [
				"#ffffff", // White
				"#f0f0f0", // Light Gray
				"#ffff99", // Light Yellow
				"#ccffcc", // Light Green
				"#ccccff", // Light Blue
				"#ffcccc", // Light Red
				"#ffcc99", // Light Orange
				"#cc99ff", // Light Purple
			],
		};
	}

	/**
	 * Bulk update text properties
	 */
	bulkUpdateTextProperties(
		elements: DrawingElement[],
		selectedElements: string[],
		updates: Partial<TextData>
	): DrawingElement[] {
		if (selectedElements.length === 0) {
			this.#config.on.feedback("No elements selected for bulk text update");
			return elements;
		}

		const updatedElements = elements.map((element) => {
			if (selectedElements.includes(element.id) && element.info) {
				return {
					...element,
					info: {
						...element.info,
						...updates,
					},
				};
			}
			return element;
		});

		this.#config.on.stateChange({
			type: "annotation",
			action: "bulkUpdateText",
			elements: updatedElements,
		});

		this.#config.on.feedback(`Updated text properties for ${selectedElements.length} elements`);

		return updatedElements;
	}

	/**
	 * Check text label accessibility
	 */
	checkTextAccessibility(elements: DrawingElement[]): AccessibilityReport {
		const issues: AccessibilityIssue[] = [];

		elements.forEach((element, index) => {
			if (element.info) {
				// Check font size for readability
				if (element.info.fontSize < 12) {
					issues.push({
						elementId: element.id,
						elementIndex: index,
						type: "small_font",
						severity: "warning",
						message: `Font size ${element.info.fontSize}px may be too small for accessibility (recommended: 12px+)`,
					});
				}

				// Check contrast (basic check)
				if (!element.info.backgroundColor && element.color) {
					issues.push({
						elementId: element.id,
						elementIndex: index,
						type: "low_contrast",
						severity: "warning",
						message: "Text may have low contrast without a background",
					});
				}

				// Check text length for readability
				if (element.info.name.length > 50) {
					issues.push({
						elementId: element.id,
						elementIndex: index,
						type: "long_text",
						severity: "info",
						message: `Name is quite long (${element.info.name.length} characters) - consider shortening`,
					});
				}

				// Check description length for readability
				if (element.info.description && element.info.description.length > 100) {
					issues.push({
						elementId: element.id,
						elementIndex: index,
						type: "long_description",
						severity: "info",
						message: `Description is quite long (${element.info.description.length} characters) - consider shortening`,
					});
				}

				// Check for redundant description
				if (
					element.info.description &&
					element.info.description.toLowerCase() === element.info.name.toLowerCase()
				) {
					issues.push({
						elementId: element.id,
						elementIndex: index,
						type: "redundant_description",
						severity: "info",
						message: "Description is identical to name",
					});
				}
			}
		});

		return {
			totalIssues: issues.length,
			issues,
			summary: {
				errors: issues.filter((i) => i.severity === "error").length,
				warnings: issues.filter((i) => i.severity === "warning").length,
				info: issues.filter((i) => i.severity === "info").length,
			},
		};
	}
}
