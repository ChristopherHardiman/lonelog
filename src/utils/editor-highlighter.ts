/**
 * Lonelog Live Editor Highlighting (CodeMirror 6)
 * Highlights Lonelog notation inside ```lonelog code blocks.
 * Uses shared tokenizer for consistent highlighting across modes.
 */

import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { Range, RangeSetBuilder } from "@codemirror/state";
import { tokenizeLine, getTokenClass } from "./lonelog-tokenizer";

// ---------------------------------------------------------------------------
// Decoration builder — processes all visible lines
// ---------------------------------------------------------------------------

function buildDecorations(view: EditorView): DecorationSet {
	const builder = new RangeSetBuilder<Decoration>();
	const decorations: Array<Range<Decoration>> = [];

	for (const { from, to } of view.visibleRanges) {
		const doc = view.state.doc;
		const startLine = doc.lineAt(from).number;
		const endLine = doc.lineAt(Math.min(to, doc.length)).number;

		for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
			const line = doc.line(lineNum);
			const lineText = line.text;

			// Tokenize using shared logic
			const tokens = tokenizeLine(lineText);

			// Convert tokens to CM6 decorations
			for (const token of tokens) {
				if (token.type === "text") continue; // Skip plain text

				const cssClass = getTokenClass(token.type, "ll-ed");
				if (!cssClass) continue;

				decorations.push({
					from: line.from + token.start,
					to: line.from + token.end,
					value: Decoration.mark({ class: cssClass }),
				});
			}
		}
	}

	decorations.sort((a, b) => a.from - b.from || a.to - b.to);
	for (const deco of decorations) {
		builder.add(deco.from, deco.to, deco.value);
	}

	return builder.finish();
}

// ---------------------------------------------------------------------------
// ViewPlugin factory — accepts a live settings getter so the toggle works
// without reloading Obsidian
// ---------------------------------------------------------------------------

export function createEditorPlugin(getEnabled: () => boolean) {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = getEnabled()
					? buildDecorations(view)
					: Decoration.none;
			}

			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged || update.selectionSet) {
					this.decorations = getEnabled()
						? buildDecorations(update.view)
						: Decoration.none;
				}
			}
		},
		{
			decorations: (v) => v.decorations,
		}
	);
}
