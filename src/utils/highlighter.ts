/**
 * Lonelog Syntax Highlighter
 * Handles reading-mode highlighting for ```lonelog code blocks.
 *
 * Line-level highlights (entire line gets background color):
 *   @   → blue   (action)
 *   ?   → purple (question/oracle)
 *   d:  → green  (dice roll)
 *   =>  → red    (consequence)
 *
 * Token-level highlights (just the matched span):
 *   ->            → yellow  (result arrow)
 *   [N:...] etc.  → orange  (any bracket tag)
 */

import { MarkdownPostProcessorContext } from "obsidian";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LineClass =
	| "ll-action"       // @   → blue
	| "ll-question"     // ?   → purple
	| "ll-dice"         // d:  → green
	| "ll-consequence"; // =>  → red

interface LineRule {
	/** Matches anywhere in the trimmed line (checked in order; first wins) */
	pattern: RegExp;
	cls: LineClass;
}

/** Bracket tag pattern: [N:...], [L:...], [PC:...], [Thread:...], [E:...],
 *  [Track:...], [Timer:...], [#N:...] */
const BRACKET_TAG_RE =
	/(\[(?:#?(?:N|L|PC|Thread|E|Track|Timer)):[^\]]*\])/g;

/** Result arrow — match -> not preceded by = (so => is not also caught here) */
const RESULT_ARROW_RE = /([^=]|^)(->)/g;

// ---------------------------------------------------------------------------
// Line-level rules — checked against the FULL (untrimmed) line text.
// Order matters: more specific patterns first.
// ---------------------------------------------------------------------------
const LINE_RULES: LineRule[] = [
	{ pattern: /^=>/, cls: "ll-consequence" }, // => before =
	{ pattern: /^@/,  cls: "ll-action"      },
	{ pattern: /^\?/, cls: "ll-question"    },
	{ pattern: /^d:/, cls: "ll-dice"        },
];

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

/**
 * Splits a text string by a regex and returns an array of alternating
 * plain-text and matched nodes, similar to String.split but keeping captures.
 */
function tokenize(
	text: string,
	re: RegExp,
	matchFn: (match: string, fullMatch: RegExpExecArray) => HTMLElement
): (string | HTMLElement)[] {
	const parts: (string | HTMLElement)[] = [];
	let lastIndex = 0;
	re.lastIndex = 0;
	let m: RegExpExecArray | null;

	while ((m = re.exec(text)) !== null) {
		// Text before match
		if (m.index > lastIndex) {
			parts.push(text.slice(lastIndex, m.index));
		}
		parts.push(matchFn(m[0], m));
		lastIndex = re.lastIndex;
	}

	if (lastIndex < text.length) {
		parts.push(text.slice(lastIndex));
	}
	return parts;
}

/**
 * Applies inline token highlighting to a line's text content and appends
 * the resulting nodes to `container`.
 */
function renderInlineTokens(container: HTMLElement, text: string): void {
	// Step 1: split on bracket tags
	const afterBrackets = tokenize(text, BRACKET_TAG_RE, (match) => {
		const span = document.createElement("span");
		span.className = "ll-tag";
		span.textContent = match;
		return span;
	});

	// Step 2: for each plain-text segment, further split on ->
	for (const part of afterBrackets) {
		if (typeof part !== "string") {
			container.appendChild(part);
			continue;
		}

		// RESULT_ARROW_RE uses two capture groups to avoid eating the char
		// before ->. We reconstruct carefully.
		let lastIdx = 0;
		RESULT_ARROW_RE.lastIndex = 0;
		let m: RegExpExecArray | null;

		while ((m = RESULT_ARROW_RE.exec(part)) !== null) {
			// m[1] is the char before -> (or empty string at line start)
			// m[2] is "->"
			const prefixChar = m[1] ?? "";
			const arrowStart = m.index + prefixChar.length;

			// Text before (including the non-= prefix char)
			if (m.index > lastIdx) {
				container.appendChild(
					document.createTextNode(part.slice(lastIdx, m.index))
				);
			}
			// Prefix char (the character that is NOT =)
			if (prefixChar) {
				container.appendChild(document.createTextNode(prefixChar));
			}
			// The -> span
			const span = document.createElement("span");
			span.className = "ll-result";
			span.textContent = "->";
			container.appendChild(span);

			lastIdx = m.index + m[0].length;
		}

		// Remaining text
		if (lastIdx < part.length) {
			container.appendChild(
				document.createTextNode(part.slice(lastIdx))
			);
		}
	}
}

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
	if (lines[lines.length - 1]?.trim() === "") {
		lines.pop();
	}

	for (const rawLine of lines) {
		const lineEl = pre.createEl("div", { cls: "ll-line" });
		const trimmed = rawLine.trimStart();

		// Determine line-level class (first matching rule wins)
		for (const rule of LINE_RULES) {
			if (rule.pattern.test(trimmed)) {
				lineEl.addClass(rule.cls);
				break;
			}
		}

		// Render the line's text with inline token highlights
		renderInlineTokens(lineEl, rawLine);
	}
}
