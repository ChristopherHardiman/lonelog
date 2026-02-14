import { Editor } from "obsidian";
import { LonelogSettings } from "../settings";

export class NotationCommands {
	// Single symbol insertions
	static insertAction(editor: Editor, settings: LonelogSettings): void {
		const text = settings.insertSpaceAfterSymbol ? "@ " : "@";
		editor.replaceSelection(text);
	}

	static insertQuestion(editor: Editor, settings: LonelogSettings): void {
		const text = settings.insertSpaceAfterSymbol ? "? " : "?";
		editor.replaceSelection(text);
	}

	static insertDiceRoll(editor: Editor, settings: LonelogSettings): void {
		const text = settings.insertSpaceAfterSymbol ? "d: " : "d:";
		editor.replaceSelection(text);
	}

	static insertResult(editor: Editor, settings: LonelogSettings): void {
		const text = settings.insertSpaceAfterSymbol ? "-> " : "->";
		editor.replaceSelection(text);
	}

	static insertConsequence(editor: Editor, settings: LonelogSettings): void {
		const text = settings.insertSpaceAfterSymbol ? "=> " : "=>";
		editor.replaceSelection(text);
	}

	// Multi-line pattern insertions
	static insertActionSequence(editor: Editor, settings: LonelogSettings): void {
		const template = settings.actionSequenceTemplate;
		const cursor = editor.getCursor();

		editor.replaceSelection(template);

		if (settings.smartCursorPositioning) {
			// Move cursor to after "@ " on first line
			editor.setCursor({
				line: cursor.line,
				ch: cursor.ch + 2,
			});
		}
	}

	static insertOracleSequence(editor: Editor, settings: LonelogSettings): void {
		const template = settings.oracleSequenceTemplate;
		const cursor = editor.getCursor();

		editor.replaceSelection(template);

		if (settings.smartCursorPositioning) {
			// Move cursor to after "? " on first line
			editor.setCursor({
				line: cursor.line,
				ch: cursor.ch + 2,
			});
		}
	}

	// Tag snippet insertions
	static insertNPCTag(editor: Editor, settings: LonelogSettings): void {
		const text = "[N:Name|]";
		const cursor = editor.getCursor();
		editor.replaceSelection(text);

		if (settings.smartCursorPositioning) {
			// Select "Name" for easy replacement
			editor.setSelection(
				{ line: cursor.line, ch: cursor.ch + 3 },
				{ line: cursor.line, ch: cursor.ch + 7 }
			);
		}
	}

	static insertLocationTag(editor: Editor, settings: LonelogSettings): void {
		const text = "[L:Name|]";
		const cursor = editor.getCursor();
		editor.replaceSelection(text);

		if (settings.smartCursorPositioning) {
			// Select "Name" for easy replacement
			editor.setSelection(
				{ line: cursor.line, ch: cursor.ch + 3 },
				{ line: cursor.line, ch: cursor.ch + 7 }
			);
		}
	}

	static insertEventClock(editor: Editor, settings: LonelogSettings): void {
		const text = "[E:Name 0/6]";
		const cursor = editor.getCursor();
		editor.replaceSelection(text);

		if (settings.smartCursorPositioning) {
			// Select "Name" for easy replacement
			editor.setSelection(
				{ line: cursor.line, ch: cursor.ch + 3 },
				{ line: cursor.line, ch: cursor.ch + 7 }
			);
		}
	}

	static insertTrack(editor: Editor, settings: LonelogSettings): void {
		const text = "[Track:Name 0/6]";
		const cursor = editor.getCursor();
		editor.replaceSelection(text);

		if (settings.smartCursorPositioning) {
			// Select "Name" for easy replacement
			editor.setSelection(
				{ line: cursor.line, ch: cursor.ch + 7 },
				{ line: cursor.line, ch: cursor.ch + 11 }
			);
		}
	}

	static insertThread(editor: Editor, settings: LonelogSettings): void {
		const text = "[Thread:Name|Open]";
		const cursor = editor.getCursor();
		editor.replaceSelection(text);

		if (settings.smartCursorPositioning) {
			// Select "Name" for easy replacement
			editor.setSelection(
				{ line: cursor.line, ch: cursor.ch + 8 },
				{ line: cursor.line, ch: cursor.ch + 12 }
			);
		}
	}

	static insertPCTag(editor: Editor, settings: LonelogSettings): void {
		const text = "[PC:Name|]";
		const cursor = editor.getCursor();
		editor.replaceSelection(text);

		if (settings.smartCursorPositioning) {
			// Select "Name" for easy replacement
			editor.setSelection(
				{ line: cursor.line, ch: cursor.ch + 4 },
				{ line: cursor.line, ch: cursor.ch + 8 }
			);
		}
	}

	static insertTimer(editor: Editor, settings: LonelogSettings): void {
		const text = "[Timer:Name 0]";
		const cursor = editor.getCursor();
		editor.replaceSelection(text);

		if (settings.smartCursorPositioning) {
			// Select "Name" for easy replacement
			editor.setSelection(
				{ line: cursor.line, ch: cursor.ch + 7 },
				{ line: cursor.line, ch: cursor.ch + 11 }
			);
		}
	}

	static insertReference(editor: Editor, settings: LonelogSettings): void {
		const text = "[#N:Name]";
		const cursor = editor.getCursor();
		editor.replaceSelection(text);

		if (settings.smartCursorPositioning) {
			// Select "Name" for easy replacement
			editor.setSelection(
				{ line: cursor.line, ch: cursor.ch + 4 },
				{ line: cursor.line, ch: cursor.ch + 8 }
			);
		}
	}
}
