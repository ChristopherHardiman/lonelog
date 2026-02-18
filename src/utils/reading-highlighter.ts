/**
 * Lonelog Syntax Highlighter — Reading Mode
 * Handles reading-mode highlighting for ```lonelog code blocks.
 * Uses shared tokenizer for consistent highlighting across modes.
 */

import { MarkdownPostProcessorContext } from "obsidian";
import { tokenizeLine, getTokenClass } from "./lonelog-tokenizer";

/**
 * Main code block processor. Register with:
 *   this.registerMarkdownCodeBlockProcessor("lonelog", lonelogBlockProcessor);
 */
export function lonelogBlockProcessor(
	source: string,
	el: HTMLElement,
	_ctx: MarkdownPostProcessorContext
): void {
	const pre = el.createEl("pre", { cls: "ll-block" });
	const lines = source.split("\n");

	// Remove trailing empty line that editors often append
	if (lines.length > 0 && lines[lines.length - 1]?.trim() === "") {
		lines.pop();
	}

	for (const rawLine of lines) {
		const lineEl = pre.createEl("div", { cls: "ll-line" });
		
		// Tokenize the line using shared logic
		const tokens = tokenizeLine(rawLine);

		// Render each token as a span (or text node if plain text)
		for (const token of tokens) {
			if (token.type === "text") {
				lineEl.appendChild(document.createTextNode(token.text));
			} else {
				lineEl.createEl("span", {
					cls: getTokenClass(token.type, "ll"),
					text: token.text,
				});
			}
		}
	}
}
