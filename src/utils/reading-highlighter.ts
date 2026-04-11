/**
 * Lonelog Syntax Highlighter — Reading Mode
 * Handles reading-mode highlighting for ```lonelog code blocks
 * and plain paragraphs containing Lonelog notation.
 * Uses shared tokenizer for consistent highlighting across modes.
 */

import { MarkdownPostProcessorContext } from "obsidian";
import { tokenizeLine, getTokenClass } from "./lonelog-tokenizer";

/**
 * Main code block processor. Register with:
 *   this.registerMarkdownCodeBlockProcessor("lonelog", lonelogBlockProcessor);
 */
export function createBlockProcessor(getEnabled: () => boolean) {
	return function (
		source: string,
		el: HTMLElement,
		_ctx: MarkdownPostProcessorContext
	): void {
		if (!getEnabled()) return;
		lonelogBlockProcessor(source, el, _ctx);
	};
}

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

// ---------------------------------------------------------------------------
// Post-processor: highlights lonelog notation in plain paragraphs
// ---------------------------------------------------------------------------

/** Quick test: does the text contain any lonelog line-start pattern? */
const LONELOG_LINE_RE = /(?:^|\n)\s*(?:@|\?|d:|=>|->|\[(?:#?(?:N|L|PC|Thread|E|Track|Timer)):)/;

/**
 * Markdown post-processor that highlights Lonelog notation in regular
 * paragraphs (outside of ```lonelog code blocks). Register with:
 *   this.registerMarkdownPostProcessor(lonelogPostProcessor);
 */
export function lonelogPostProcessor(el: HTMLElement, _ctx: MarkdownPostProcessorContext, getEnabled?: () => boolean): void {
	if (getEnabled && !getEnabled()) return;
	el.querySelectorAll("p").forEach(p => processLonelogParagraph(p as HTMLElement));
}

/**
 * Returns the Lonelog line-level token type for a line, or null if none.
 */
function getLineType(lineText: string): string | null {
	const t = lineText.trimStart();
	if (t.startsWith("@"))  return "action";
	if (t.startsWith("?"))  return "question";
	if (t.startsWith("d:")) return "dice";
	if (t.startsWith("=>")) return "consequence";
	if (t.startsWith("->")) return "result";
	return null;
}

/**
 * Processes a single <p> element, wrapping any Lonelog notation lines
 * in appropriately-colored <span> elements.
 *
 * Splits content on <br> tags so multi-line paragraphs (soft line breaks)
 * are handled line by line.
 */
function processLonelogParagraph(p: HTMLElement): void {
	const fullText = p.textContent ?? "";
	if (!LONELOG_LINE_RE.test(fullText)) return;

	// Split child nodes into per-line groups, split at every <br>
	const allChildren = Array.from(p.childNodes);
	const lines: Node[][] = [[]];
	for (const child of allChildren) {
		if (child.nodeName === "BR") {
			lines.push([]);
		} else {
			(lines[lines.length - 1] as Node[]).push(child);
		}
	}

	// Rebuild paragraph with highlighted spans
	const newContent: Node[] = [];

	for (let i = 0; i < lines.length; i++) {
		if (i > 0) newContent.push(document.createElement("br"));
		const lineNodes = lines[i] as Node[];
		if (lineNodes.length === 0) continue;

		const lineText = lineNodes.map(n => n.textContent ?? "").join("");
		const tokens = tokenizeLine(lineText);
		const hasHighlight = tokens.some(t => t.type !== "text");

		if (!hasHighlight) {
			// Plain line — keep as-is
			lineNodes.forEach(n => newContent.push(n.cloneNode(true)));
		} else if (lineNodes.length === 1 && lineNodes[0] !== undefined && lineNodes[0].nodeType === Node.TEXT_NODE) {
			// Pure text node — rebuild token-by-token for full precision
			for (const token of tokens) {
				if (token.type === "text") {
					newContent.push(document.createTextNode(token.text));
				} else {
					const span = document.createElement("span");
					span.className = `ll-${token.type}`;
					span.textContent = token.text;
					newContent.push(span);
				}
			}
		} else {
			// Mixed content (inline bold/links/etc.) — wrap whole line in primary color
			const lineType = getLineType(lineText);
			if (lineType) {
				const wrapper = document.createElement("span");
				wrapper.className = `ll-${lineType}`;
				lineNodes.forEach(n => wrapper.appendChild(n.cloneNode(true)));
				newContent.push(wrapper);
			} else {
				lineNodes.forEach(n => newContent.push(n.cloneNode(true)));
			}
		}
	}

	// Replace paragraph children
	while (p.firstChild) p.removeChild(p.firstChild);
	newContent.forEach(n => p.appendChild(n));
}
