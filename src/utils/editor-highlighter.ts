/**
 * Lonelog Live Editor Highlighting (CodeMirror 6)
 * Highlights Lonelog notation inside ```lonelog code blocks.
 * Uses shared tokenizer for consistent highlighting across modes.
 */

import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { Range, RangeSetBuilder } from "@codemirror/state";
import { EditorState } from "@codemirror/state";
import { tokenizeLine, getTokenClass } from "./lonelog-tokenizer";

// ---------------------------------------------------------------------------
// Find lonelog blocks by scanning for fence markers
// ---------------------------------------------------------------------------

function findLonelogBlocks(state: EditorState, from: number, to: number): Array<{from: number, to: number}> {
	const blocks: Array<{from: number, to: number}> = [];
	const doc = state.doc;
	
	const startLine = doc.lineAt(from).number;
	const endLine = doc.lineAt(Math.min(to, doc.length)).number;
	
	let inLonelogBlock = false;
	let blockStart = 0;
	
	for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
		const line = doc.line(lineNum);
		const text = line.text.trim();
		
		if (!inLonelogBlock && text.startsWith("```lonelog")) {
			inLonelogBlock = true;
			blockStart = line.to + 1;
		} else if (inLonelogBlock && text.startsWith("```")) {
			blocks.push({ from: blockStart, to: line.from - 1 });
			inLonelogBlock = false;
		}
	}
	
	if (inLonelogBlock) {
		blocks.push({ from: blockStart, to: doc.line(endLine).to });
	}
	
	return blocks;
}

// ---------------------------------------------------------------------------
// Decoration builder
// ---------------------------------------------------------------------------

function buildDecorations(view: EditorView): DecorationSet {
	const builder = new RangeSetBuilder<Decoration>();
	const decorations: Array<Range<Decoration>> = [];

	for (const { from, to } of view.visibleRanges) {
		const blocks = findLonelogBlocks(view.state, from, to);

		for (const block of blocks) {
			const doc = view.state.doc;
			const startLine = doc.lineAt(block.from).number;
			const endLine = doc.lineAt(block.to).number;

			for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
				const line = doc.line(lineNum);
				if (line.from < block.from || line.to > block.to) continue;

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
	}

	decorations.sort((a, b) => a.from - b.from || a.to - b.to);
	for (const deco of decorations) {
		builder.add(deco.from, deco.to, deco.value);
	}

	return builder.finish();
}

// ---------------------------------------------------------------------------
// ViewPlugin
// ---------------------------------------------------------------------------

export const lonelogEditorPlugin = ViewPlugin.fromClass(
	class {
		decorations: DecorationSet;

		constructor(view: EditorView) {
			this.decorations = buildDecorations(view);
		}

		update(update: ViewUpdate) {
			if (update.docChanged || update.viewportChanged) {
				this.decorations = buildDecorations(update.view);
			}
		}
	},
	{
		decorations: (v) => v.decorations,
	}
);
