/**
 * Lonelog Auto-completion
 * Provides intelligent suggestions for Lonelog notation tags
 */

import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	TFile,
} from "obsidian";
import { NotationParser, ParsedElements } from "./parser";

interface TagSuggestion {
	name: string;
	type: "npc" | "location" | "thread" | "pc";
	tags?: string[];
	displayText: string;
}

export class LonelogAutoComplete extends EditorSuggest<TagSuggestion> {
	private parsedElements: ParsedElements | null = null;
	private lastContent: string = "";

	constructor(app: App) {
		super(app);
	}

	/**
	 * Trigger auto-completion on specific patterns
	 */
	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		file: TFile | null
	): EditorSuggestTriggerInfo | null {
		if (!file) return null;

		const line = editor.getLine(cursor.line);
		const beforeCursor = line.substring(0, cursor.ch);

		// Check for tag patterns
		// NPC tag: [N: or [#N:
		const npcMatch = beforeCursor.match(/\[(#)?N:(\w*)$/);
		if (npcMatch) {
			const query = npcMatch[2] || "";
			const start = cursor.ch - query.length;

			return {
				start: { line: cursor.line, ch: start },
				end: cursor,
				query,
			};
		}

		// Location tag: [L:
		const locationMatch = beforeCursor.match(/\[L:(\w*)$/);
		if (locationMatch) {
			const query = locationMatch[1] || "";
			const start = cursor.ch - query.length;

			return {
				start: { line: cursor.line, ch: start },
				end: cursor,
				query,
			};
		}

		// Thread tag: [Thread:
		const threadMatch = beforeCursor.match(/\[Thread:(\w*)$/);
		if (threadMatch) {
			const query = threadMatch[1] || "";
			const start = cursor.ch - query.length;

			return {
				start: { line: cursor.line, ch: start },
				end: cursor,
				query,
			};
		}

		// PC tag: [PC:
		const pcMatch = beforeCursor.match(/\[PC:(\w*)$/);
		if (pcMatch) {
			const query = pcMatch[1] || "";
			const start = cursor.ch - query.length;

			return {
				start: { line: cursor.line, ch: start },
				end: cursor,
				query,
			};
		}

		return null;
	}

	/**
	 * Get suggestions based on current context
	 */
	getSuggestions(
		context: EditorSuggestContext
	): TagSuggestion[] | Promise<TagSuggestion[]> {
		// Parse document if needed
		const content = context.editor.getValue();
		if (content !== this.lastContent) {
			this.parsedElements = NotationParser.parse(content);
			this.lastContent = content;
		}

		if (!this.parsedElements) {
			return [];
		}

		const line = context.editor.getLine(context.start.line);
		const beforeCursor = line.substring(0, context.end.ch);
		const query = context.query.toLowerCase();

		// Determine which type of tag we're completing
		if (beforeCursor.includes("[N:") || beforeCursor.includes("[#N:")) {
			return this.getNPCSuggestions(query);
		} else if (beforeCursor.includes("[L:")) {
			return this.getLocationSuggestions(query);
		} else if (beforeCursor.includes("[Thread:")) {
			return this.getThreadSuggestions(query);
		} else if (beforeCursor.includes("[PC:")) {
			return this.getPCSuggestions(query);
		}

		return [];
	}

	/**
	 * Get NPC suggestions
	 */
	private getNPCSuggestions(query: string): TagSuggestion[] {
		if (!this.parsedElements) return [];

		const suggestions: TagSuggestion[] = [];

		for (const [name, npc] of this.parsedElements.npcs.entries()) {
			if (query === "" || name.toLowerCase().includes(query)) {
				const tagsDisplay =
					npc.tags.length > 0 ? ` (${npc.tags.join(", ")})` : "";
				suggestions.push({
					name,
					type: "npc",
					tags: npc.tags,
					displayText: `${name}${tagsDisplay}`,
				});
			}
		}

		// Sort by relevance
		return this.sortSuggestions(suggestions, query);
	}

	/**
	 * Get location suggestions
	 */
	private getLocationSuggestions(query: string): TagSuggestion[] {
		if (!this.parsedElements) return [];

		const suggestions: TagSuggestion[] = [];

		for (const [name, location] of this.parsedElements.locations.entries()) {
			if (query === "" || name.toLowerCase().includes(query)) {
				const tagsDisplay =
					location.tags.length > 0
						? ` (${location.tags.join(", ")})`
						: "";
				suggestions.push({
					name,
					type: "location",
					tags: location.tags,
					displayText: `${name}${tagsDisplay}`,
				});
			}
		}

		return this.sortSuggestions(suggestions, query);
	}

	/**
	 * Get thread suggestions
	 */
	private getThreadSuggestions(query: string): TagSuggestion[] {
		if (!this.parsedElements) return [];

		const suggestions: TagSuggestion[] = [];

		for (const [name, thread] of this.parsedElements.threads.entries()) {
			if (query === "" || name.toLowerCase().includes(query)) {
				suggestions.push({
					name,
					type: "thread",
					displayText: `${name} [${thread.state}]`,
				});
			}
		}

		return this.sortSuggestions(suggestions, query);
	}

	/**
	 * Get PC suggestions
	 */
	private getPCSuggestions(query: string): TagSuggestion[] {
		if (!this.parsedElements) return [];

		const suggestions: TagSuggestion[] = [];

		for (const [name, pc] of this.parsedElements.pcs.entries()) {
			if (query === "" || name.toLowerCase().includes(query)) {
				const tagsDisplay =
					pc.tags.length > 0 ? ` (${pc.tags.join(", ")})` : "";
				suggestions.push({
					name,
					type: "pc",
					tags: pc.tags,
					displayText: `${name}${tagsDisplay}`,
				});
			}
		}

		return this.sortSuggestions(suggestions, query);
	}

	/**
	 * Sort suggestions by relevance
	 */
	private sortSuggestions(
		suggestions: TagSuggestion[],
		query: string
	): TagSuggestion[] {
		const lowerQuery = query.toLowerCase();

		return suggestions.sort((a, b) => {
			const aName = a.name.toLowerCase();
			const bName = b.name.toLowerCase();

			// Exact match first
			if (aName === lowerQuery && bName !== lowerQuery) return -1;
			if (aName !== lowerQuery && bName === lowerQuery) return 1;

			// Starts with query
			const aStarts = aName.startsWith(lowerQuery);
			const bStarts = bName.startsWith(lowerQuery);
			if (aStarts && !bStarts) return -1;
			if (!aStarts && bStarts) return 1;

			// Alphabetical
			return a.name.localeCompare(b.name);
		});
	}

	/**
	 * Render suggestion in popup
	 */
	renderSuggestion(suggestion: TagSuggestion, el: HTMLElement): void {
		const container = el.createDiv({ cls: "lonelog-suggestion" });

		// Name and type
		const nameEl = container.createDiv({ cls: "lonelog-suggestion-name" });
		nameEl.setText(suggestion.name);

		// Tags/state info
		if (suggestion.tags && suggestion.tags.length > 0) {
			const tagsEl = container.createDiv({
				cls: "lonelog-suggestion-tags",
			});
			tagsEl.setText(suggestion.tags.join(" | "));
		}

		// Type indicator
		const typeEl = container.createDiv({ cls: "lonelog-suggestion-type" });
		typeEl.setText(suggestion.type.toUpperCase());
	}

	/**
	 * Handle suggestion selection
	 */
	selectSuggestion(
		suggestion: TagSuggestion,
		evt: MouseEvent | KeyboardEvent
	): void {
		if (!this.context) return;

		const editor = this.context.editor;
		const line = editor.getLine(this.context.start.line);
		const beforeCursor = line.substring(0, this.context.end.ch);

		// Determine what to insert based on tag type
		let insertion = "";

		// Check if we're completing a reference [#N:
		const isReference = beforeCursor.includes("[#N:");

		if (isReference) {
			// Just close the reference tag
			insertion = `${suggestion.name}]`;
		} else {
			// Complete the tag with placeholder for additional info
			switch (suggestion.type) {
				case "npc":
				case "location":
				case "pc":
					// Include existing tags if any
					if (suggestion.tags && suggestion.tags.length > 0) {
						insertion = `${suggestion.name}|${suggestion.tags.join("|")}]`;
					} else {
						insertion = `${suggestion.name}|]`;
					}
					break;
				case "thread":
					insertion = `${suggestion.name}|Open]`;
					break;
			}
		}

		// Replace the query with the insertion
		editor.replaceRange(
			insertion,
			this.context.start,
			this.context.end
		);

		// Position cursor before the closing bracket for easy editing
		if (!isReference) {
			const newPos = {
				line: this.context.start.line,
				ch: this.context.start.ch + insertion.length - 1,
			};
			editor.setCursor(newPos);
		}
	}
}
