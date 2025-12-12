/** biome-ignore-all lint/suspicious/noExplicitAny: Need for tests */
import { expect } from "vitest";

// Mock ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
	observe() {
		//
	}
	unobserve() {
		//
	}
	disconnect() {
		//
	}
};

// Mock scrollIntoView for tests
Element.prototype.scrollIntoView = function () {
	//
};

// Extend Vitest's expect with custom DOM matchers
expect.extend({
	toBeInTheDocument(received: unknown) {
		const pass = received != null && (received as Element).ownerDocument != null;
		return {
			pass,
			message: () =>
				pass
					? `expected element not to be in the document`
					: `expected element to be in the document`,
		};
	},
	toHaveAttribute(received: unknown, attribute: string, value?: string) {
		const element = received as Element;
		const hasAttribute = element?.hasAttribute?.(attribute) ?? false;
		const actualValue = element?.getAttribute?.(attribute);

		const pass = value !== undefined ? hasAttribute && actualValue === value : hasAttribute;

		return {
			pass,
			message: () =>
				pass
					? `expected element not to have attribute "${attribute}"${value !== undefined ? ` with value "${value}"` : ""}`
					: `expected element to have attribute "${attribute}"${value !== undefined ? ` with value "${value}"` : ""}, but got "${actualValue}"`,
		};
	},
	toHaveClass(received: unknown, className: string) {
		const element = received as Element;
		const classList = element?.classList;
		const pass = classList?.contains(className) ?? false;

		return {
			pass,
			message: () =>
				pass
					? `expected element not to have class "${className}"`
					: `expected element to have class "${className}", but got "${Array.from(classList || []).join(" ")}"`,
		};
	},
	toHaveTextContent(received: unknown, text: string) {
		const element = received as Element;
		const actualText = element?.textContent ?? "";
		const pass = actualText.includes(text);

		return {
			pass,
			message: () =>
				pass
					? `expected element not to have text content "${text}"`
					: `expected element to have text content "${text}", but got "${actualText}"`,
		};
	},
	toBeDisabled(received: unknown) {
		const element = received as HTMLElement;
		const isDisabled =
			element?.hasAttribute?.("disabled") ||
			element?.getAttribute?.("aria-disabled") === "true" ||
			(element as HTMLButtonElement)?.disabled === true;

		return {
			pass: isDisabled,
			message: () =>
				isDisabled ? "expected element not to be disabled" : "expected element to be disabled",
		};
	},
});

// Declare custom matchers for TypeScript
declare module "vitest" {
	interface Assertion<T = any> {
		toBeInTheDocument(): T;
		toHaveAttribute(attribute: string, value?: string): T;
		toHaveClass(className: string): T;
		toHaveTextContent(text: string): T;
		toBeDisabled(): T;
	}
}
