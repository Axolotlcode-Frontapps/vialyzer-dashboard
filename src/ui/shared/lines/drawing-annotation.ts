import type {
	AccessibilityIssue,
	AccessibilityReport,
	ColorAnalysis,
	DrawingAnnotationCallbacks,
	DrawingElement,
	DrawingStatistics,
	FeedbackCallback,
	LabelType,
	StateChangeCallback,
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
	#onStateChange: StateChangeCallback | null = null;
	#onFeedback: FeedbackCallback | null = null;

	/**
	 * Initialize with callbacks
	 */
	initialize(callbacks: DrawingAnnotationCallbacks): void {
		this.#onStateChange = callbacks.onStateChange;
		this.#onFeedback = callbacks.onFeedback;
	}

	/**
	 * Open text editor for an element
	 */
	openTextEditor(elementId: string, element?: DrawingElement): void {
		if (!element?.completed) return;

		if (this.#onStateChange) {
			this.#onStateChange({
				type: "annotation",
				action: "openTextEditor",
				elementId,
				currentText: element.text?.content || "",
				currentDescription: element.text?.description || "",
				currentFontSize: element.text?.fontSize || 16,
				currentBackgroundEnabled: !!element.text?.backgroundColor,
			});
		}
	}

	/**
	 * Complete text input for an element
	 */
	completeTextInput(
		elementId: string,
		textData: TextData,
		elements: DrawingElement[]
	): DrawingElement[] | undefined {
		if (!textData.content.trim()) {
			if (this.#onFeedback) {
				this.#onFeedback("Text content cannot be empty");
			}
			return;
		}

		const updatedElements = elements.map((element) => {
			if (element.id === elementId) {
				return {
					...element,
					text: {
						content: textData.content.trim(),
						description: textData.description?.trim() || undefined,
						fontSize: textData.fontSize,
						fontFamily: textData.fontFamily || "Arial",
						backgroundColor: textData.backgroundEnabled ? "#ffffff" : undefined,
						backgroundOpacity: 0.8,
					},
				};
			}
			return element;
		});

		if (this.#onStateChange) {
			this.#onStateChange({
				type: "annotation",
				action: "updateElementText",
				elements: updatedElements,
			});
		}

		if (this.#onFeedback) {
			this.#onFeedback("Text label updated successfully");
		}

		return updatedElements;
	}

	/**
	 * Remove text from an element
	 */
	removeTextFromElement(
		elementId: string,
		elements: DrawingElement[]
	): DrawingElement[] {
		const updatedElements = elements.map((element) => {
			if (element.id === elementId) {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { text: _text, ...elementWithoutText } = element;
				return elementWithoutText;
			}
			return element;
		});

		if (this.#onStateChange) {
			this.#onStateChange({
				type: "annotation",
				action: "removeElementText",
				elements: updatedElements,
			});
		}

		if (this.#onFeedback) {
			this.#onFeedback("Text label removed");
		}

		return updatedElements;
	}

	/**
	 * Calculate statistics for all elements
	 */
	calculateStatistics(elements: DrawingElement[]): DrawingStatistics {
		const stats = {
			total: elements.length,
			completed: elements.filter((el) => el.completed).length,
			withText: elements.filter((el) => el.text?.content).length,
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
							(elements.reduce((sum, el) => sum + el.points.length, 0) /
								elements.length) *
								100
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
		const elementsWithText = elements.filter((el) => el.text?.content);
		const elementsWithDescription = elements.filter(
			(el) => el.text?.description
		);

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

		const textLengths = elementsWithText.map(
			(el) => el.text?.content.length || 0
		);
		const descriptionLengths = elementsWithDescription.map(
			(el) => el.text?.description?.length || 0
		);
		const fontSizes = Array.from(
			new Set(elementsWithText.map((el) => el.text?.fontSize || 16))
		).sort((a, b) => a - b);

		const longestElement = elementsWithText.reduce((a, b) =>
			(a.text?.content.length || 0) > (b.text?.content.length || 0) ? a : b
		);
		const shortestElement = elementsWithText.reduce((a, b) =>
			(a.text?.content.length || 0) < (b.text?.content.length || 0) ? a : b
		);

		return {
			total: elementsWithText.length,
			averageLength:
				Math.round(
					(textLengths.reduce((a, b) => a + b, 0) / textLengths.length) * 100
				) / 100,
			fontSizes,
			longestText: {
				content: longestElement.text?.content || "",
				length: longestElement.text?.content.length || 0,
				elementType: longestElement.type,
			},
			shortestText: {
				content: shortestElement.text?.content || "",
				length: shortestElement.text?.content.length || 0,
				elementType: shortestElement.type,
			},
			withDescription: elementsWithDescription.length,
			averageDescriptionLength:
				descriptionLengths.length > 0
					? Math.round(
							(descriptionLengths.reduce((a, b) => a + b, 0) /
								descriptionLengths.length) *
								100
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
		if (stats.byType.rectangle > 0)
			summary.push(`Rectangles: ${stats.byType.rectangle}`);
		if (stats.byType.circle > 0)
			summary.push(`Circles: ${stats.byType.circle}`);

		if (stats.textStats.total > 0) {
			summary.push(
				`Average text length: ${stats.textStats.averageLength} characters`
			);
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
			if (!element.text || !element.text.content) return false;

			const content = caseSensitive
				? element.text.content
				: element.text.content.toLowerCase();
			const description = element.text.description
				? caseSensitive
					? element.text.description
					: element.text.description.toLowerCase()
				: "";

			return content.includes(searchTerm) || description.includes(searchTerm);
		});
	}

	/**
	 * Find elements without text labels
	 */
	findElementsWithoutText(elements: DrawingElement[]): DrawingElement[] {
		return elements.filter((element) => !element.text || !element.text.content);
	}

	/**
	 * Get text label validation errors
	 */
	validateTextLabels(elements: DrawingElement[]): ValidationError[] {
		const errors: ValidationError[] = [];

		elements.forEach((element, index) => {
			if (element.text) {
				if (!element.text.content || element.text.content.trim() === "") {
					errors.push({
						elementId: element.id,
						elementIndex: index,
						type: "empty_content",
						message: "Text label is empty",
					});
				}

				if (element.text.content && element.text.content.length > 100) {
					errors.push({
						elementId: element.id,
						elementIndex: index,
						type: "content_too_long",
						message: `Text label is too long (${element.text.content.length} characters, max 100)`,
					});
				}

				if (element.text.description && element.text.description.length > 200) {
					errors.push({
						elementId: element.id,
						elementIndex: index,
						type: "description_too_long",
						message: `Text description is too long (${element.text.description.length} characters, max 200)`,
					});
				}

				if (
					element.text.fontSize &&
					(element.text.fontSize < 8 || element.text.fontSize > 48)
				) {
					errors.push({
						elementId: element.id,
						elementIndex: index,
						type: "invalid_font_size",
						message: `Font size ${element.text.fontSize} is outside valid range (8-48)`,
					});
				}
			}
		});

		return errors;
	}

	/**
	 * Auto-generate text labels based on element properties
	 */
	generateAutoLabels(
		elements: DrawingElement[],
		labelType: LabelType = "type"
	): DrawingElement[] {
		const updatedElements = elements.map((element, index) => {
			// Skip if element already has text
			if (element.text?.content) {
				return element;
			}

			let autoText = "";

			switch (labelType) {
				case "type":
					autoText =
						element.type.charAt(0).toUpperCase() + element.type.slice(1);
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

		if (this.#onStateChange) {
			this.#onStateChange({
				type: "annotation",
				action: "autoGenerateLabels",
				elements: updatedElements,
			});
		}

		if (this.#onFeedback) {
			this.#onFeedback(
				`Auto-generated ${labelType} labels for ${elements.length} elements`
			);
		}

		return updatedElements;
	}

	/**
	 * Export text labels as CSV
	 */
	exportTextLabelsAsCSV(elements: DrawingElement[]): string | null {
		const elementsWithText = elements.filter((el) => el.text?.content);

		if (elementsWithText.length === 0) {
			if (this.#onFeedback) {
				this.#onFeedback("No text labels to export");
			}
			return null;
		}

		const headers = [
			"Element ID",
			"Type",
			"Text Content",
			"Description",
			"Font Size",
			"Has Background",
			"Point Count",
		];
		const rows = elementsWithText.map((element) => [
			element.id,
			element.type,
			`"${(element.text?.content || "").replace(/"/g, '""')}"`, // Escape quotes for CSV
			`"${(element.text?.description || "").replace(/"/g, '""')}"`,
			element.text?.fontSize || 16,
			!!element.text?.backgroundColor,
			element.points.length,
		]);

		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.join(",")),
		].join("\n");

		if (this.#onFeedback) {
			this.#onFeedback(
				`Exported ${elementsWithText.length} text labels as CSV`
			);
		}

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
			if (this.#onFeedback) {
				this.#onFeedback("No elements selected for bulk text update");
			}
			return elements;
		}

		const updatedElements = elements.map((element) => {
			if (selectedElements.includes(element.id) && element.text) {
				return {
					...element,
					text: {
						...element.text,
						...updates,
					},
				};
			}
			return element;
		});

		if (this.#onStateChange) {
			this.#onStateChange({
				type: "annotation",
				action: "bulkUpdateText",
				elements: updatedElements,
			});
		}

		if (this.#onFeedback) {
			this.#onFeedback(
				`Updated text properties for ${selectedElements.length} elements`
			);
		}

		return updatedElements;
	}

	/**
	 * Check text label accessibility
	 */
	checkTextAccessibility(elements: DrawingElement[]): AccessibilityReport {
		const issues: AccessibilityIssue[] = [];

		elements.forEach((element, index) => {
			if (element.text) {
				// Check font size for readability
				if (element.text.fontSize < 12) {
					issues.push({
						elementId: element.id,
						elementIndex: index,
						type: "small_font",
						severity: "warning",
						message: `Font size ${element.text.fontSize}px may be too small for accessibility (recommended: 12px+)`,
					});
				}

				// Check contrast (basic check)
				if (!element.text.backgroundColor && element.color) {
					issues.push({
						elementId: element.id,
						elementIndex: index,
						type: "low_contrast",
						severity: "info",
						message:
							"Consider adding a background color for better text contrast",
					});
				}

				// Check text length for readability
				if (element.text.content.length > 50) {
					issues.push({
						elementId: element.id,
						elementIndex: index,
						type: "long_text",
						severity: "info",
						message: `Text is quite long (${element.text.content.length} characters) - consider shortening`,
					});
				}

				// Check description length for readability
				if (element.text.description && element.text.description.length > 100) {
					issues.push({
						elementId: element.id,
						elementIndex: index,
						type: "long_description",
						severity: "info",
						message: `Description is quite long (${element.text.description.length} characters) - consider shortening`,
					});
				}

				// Check if description duplicates content
				if (
					element.text.description &&
					element.text.description.toLowerCase() ===
						element.text.content.toLowerCase()
				) {
					issues.push({
						elementId: element.id,
						elementIndex: index,
						type: "duplicate_description",
						severity: "warning",
						message:
							"Description is identical to text content - consider making them different or removing the description",
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
