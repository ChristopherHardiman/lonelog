import { App, Editor, Modal, Setting } from "obsidian";

// Campaign Header Modal and related types
export interface CampaignHeaderData {
	title: string;
	ruleset: string;
	genre: string;
	player: string;
	pcs: string;
}

export class CampaignHeaderModal extends Modal {
	title: string = "";
	ruleset: string = "";
	genre: string = "";
	player: string = "";
	pcs: string = "";
	onSubmit: (data: CampaignHeaderData) => void;

	constructor(app: App, onSubmit: (data: CampaignHeaderData) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "New Campaign Header" });

		new Setting(contentEl)
			.setName("Campaign Title")
			.addText((text) => {
				text.onChange((value) => {
					this.title = value;
				});
				text.inputEl.focus();
			});

		new Setting(contentEl)
			.setName("Ruleset")
			.setDesc("e.g., Ironsworn, Mythic GME, Loner")
			.addText((text) =>
				text.onChange((value) => {
					this.ruleset = value;
				})
			);

		new Setting(contentEl)
			.setName("Genre")
			.setDesc("e.g., Fantasy, Sci-fi, Horror")
			.addText((text) =>
				text.onChange((value) => {
					this.genre = value;
				})
			);

		new Setting(contentEl)
			.setName("Player Name")
			.addText((text) =>
				text.onChange((value) => {
					this.player = value;
				})
			);

		new Setting(contentEl)
			.setName("PC(s)")
			.setDesc("e.g., Alex [PC:Alex|HP 8]")
			.addText((text) =>
				text.onChange((value) => {
					this.pcs = value;
				})
			);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Create")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit({
						title: this.title,
						ruleset: this.ruleset,
						genre: this.genre,
						player: this.player,
						pcs: this.pcs,
					});
				})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

// Scene Context Modal
export class SceneContextModal extends Modal {
	context: string = "";
	onSubmit: (context: string) => void;

	constructor(app: App, onSubmit: (context: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "Scene Context" });

		new Setting(contentEl)
			.setName("Context")
			.setDesc(
				"e.g., 'Dark alley, midnight' or 'Lighthouse tower, dusk'"
			)
			.addText((text) => {
				text.onChange((value) => {
					this.context = value;
				});
				text.inputEl.focus();
				// Submit on Enter key
				text.inputEl.addEventListener("keydown", (evt) => {
					if (evt.key === "Enter") {
						this.close();
						this.onSubmit(this.context);
					}
				});
			});

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Insert")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(this.context);
				})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

// Template Commands
export class TemplateCommands {
	/**
	 * Insert campaign header with YAML frontmatter
	 */
	static insertCampaignHeader(app: App, editor: Editor): void {
		new CampaignHeaderModal(app, (data) => {
			const today = new Date().toISOString().split("T")[0];

			const yaml = `---
title: ${data.title}
ruleset: ${data.ruleset}
genre: ${data.genre}
player: ${data.player}
pcs: ${data.pcs}
start_date: ${today}
last_update: ${today}
tools: 
themes: 
tone: 
notes: 
---

# ${data.title}

`;

			// Insert at beginning of document
			editor.replaceRange(yaml, { line: 0, ch: 0 });
		}).open();
	}

	/**
	 * Detect the next session number by scanning for existing sessions
	 */
	static getNextSessionNumber(editor: Editor): number {
		const content = editor.getValue();
		const sessionRegex = /^## Session (\d+)/gm;
		let maxSession = 0;
		let match;

		while ((match = sessionRegex.exec(content)) !== null) {
			if (match[1]) {
				const sessionNum = parseInt(match[1]);
				if (sessionNum > maxSession) {
					maxSession = sessionNum;
				}
			}
		}

		return maxSession + 1;
	}

	/**
	 * Insert session header with auto-numbering and date
	 */
	static insertSessionHeader(editor: Editor): void {
		const sessionNum = this.getNextSessionNumber(editor);
		const today = new Date().toISOString().split("T")[0];

		const template = `## Session ${sessionNum}
*Date: ${today} | Duration:  | Scenes: *

**Recap:** 

**Goals:** 

`;

		const cursor = editor.getCursor();
		editor.replaceSelection(template);

		// Position cursor at Duration field
		// After insertion, cursor is at end of inserted text
		// We need to go back to the Duration field
		const durationLineOffset = 1; // Second line of template
		const durationText = `*Date: ${today} | Duration: `;
		const durationPos = durationText.length;

		editor.setCursor({
			line: cursor.line + durationLineOffset,
			ch: durationPos,
		});
	}

	/**
	 * Detect the next scene number in the current session
	 */
	static getNextSceneNumber(editor: Editor): string {
		const content = editor.getValue();
		const cursor = editor.getCursor();
		const lines = content.split("\n");

		// Find the most recent session header before cursor
		let currentSessionLine = -1;
		for (let i = cursor.line; i >= 0; i--) {
			if (lines[i]?.startsWith("## Session ")) {
				currentSessionLine = i;
				break;
			}
		}

		// Find the next session header after current position (if any)
		let nextSessionLine = lines.length;
		for (let i = cursor.line + 1; i < lines.length; i++) {
			if (lines[i]?.startsWith("## Session ")) {
				nextSessionLine = i;
				break;
			}
		}

		// Find last scene number between current session and next session
		let lastScene = 0;
		const sceneRegex = /^### S(\d+)/;

		const startLine = currentSessionLine >= 0 ? currentSessionLine : 0;
		for (let i = startLine; i < nextSessionLine; i++) {
			const match = lines[i]?.match(sceneRegex);
			if (match && match[1]) {
				const sceneNum = parseInt(match[1]);
				if (sceneNum > lastScene) {
					lastScene = sceneNum;
				}
			}
		}

		return `S${lastScene + 1}`;
	}

	/**
	 * Insert scene marker with optional context prompt
	 */
	static insertSceneMarker(
		app: App,
		editor: Editor,
		promptForContext: boolean
	): void {
		const sceneNum = this.getNextSceneNumber(editor);

		if (promptForContext) {
			new SceneContextModal(app, (context) => {
				const template = `### ${sceneNum} *${context}*

`;
				editor.replaceSelection(template);
			}).open();
		} else {
			const template = `### ${sceneNum} *Scene context*

`;
			const cursor = editor.getCursor();
			editor.replaceSelection(template);

			// Select "Scene context" for easy replacement
			const contextStart = `### ${sceneNum} *`.length;
			const contextEnd = contextStart + "Scene context".length;

			editor.setSelection(
				{ line: cursor.line, ch: contextStart },
				{ line: cursor.line, ch: contextEnd }
			);
		}
	}

	/**
	 * Toggle code block wrapper around selection
	 */
	static toggleCodeBlock(editor: Editor): void {
		const selection = editor.getSelection();

		if (!selection) {
			// No selection, insert empty code block
			const template = "```lonelog\n\n```";
			const cursor = editor.getCursor();
			editor.replaceSelection(template);

			// Position cursor inside block (one line down)
			editor.setCursor({
				line: cursor.line + 1,
				ch: 0,
			});
			return;
		}

		// Check if selection is already wrapped
		const cursor = editor.getCursor("from");
		const cursorTo = editor.getCursor("to");
		const content = editor.getValue();
		const lines = content.split("\n");

		// Check line before selection
	const beforeLine = lines[cursor.line - 1] ?? "";
	// Check line after selection
	const afterLine = lines[cursorTo.line + 1] ?? "";
		const isWrapped =
			beforeLine.trim().startsWith("```") &&
			afterLine.trim() === "```";

		if (isWrapped) {
			// Unwrap: need to manually remove the fence lines
			// This is tricky with just replaceSelection, so we'll replace a larger range

			// Get the full range including fence lines
			const from = { line: cursor.line - 1, ch: 0 };
			const to = {
				line: cursorTo.line + 2,
				ch: 0,
			};

			// Replace with just the selection content
			editor.replaceRange(selection + "\n", from, to);
		} else {
			// Wrap
			const wrapped = "```lonelog\n" + selection + "\n```";
			editor.replaceSelection(wrapped);
		}
	}
}
