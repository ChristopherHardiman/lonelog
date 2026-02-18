import { Plugin } from "obsidian";
import { 
	DEFAULT_SETTINGS, LonelogSettings, LonelogSettingTab, applyHighlightColors, removeHighlightColors 
} from "./settings";
import { NotationCommands } from "./commands/notation";
import { TemplateCommands } from "./commands/templates";
import { LonelogAutoComplete } from "./utils/autocomplete";
import { ProgressTrackerView, PROGRESS_VIEW_TYPE } from "./ui/progress-view";
import { ThreadBrowserView, THREAD_VIEW_TYPE } from "./ui/thread-view";
import { SceneNavigatorView, SCENE_NAV_TYPE } from "./ui/scene-nav";
import { lonelogBlockProcessor } from "./utils/reading-highlighter";
import { lonelogEditorPlugin } from "./utils/editor-highlighter";

export default class LonelogPlugin extends Plugin {
	settings: LonelogSettings;
	autoComplete: LonelogAutoComplete;

	async onload() {
		console.log("Loading Lonelog plugin");

		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor(
			"lonelog",
			lonelogBlockProcessor
		);
		applyHighlightColors(this.settings);
        // Add editor syntax highlighting.
		this.registerEditorExtension(lonelogEditorPlugin);

		// Register views
		this.registerView(
			PROGRESS_VIEW_TYPE,
			(leaf) => new ProgressTrackerView(leaf)
		);
		this.registerView(
			THREAD_VIEW_TYPE,
			(leaf) => new ThreadBrowserView(leaf)
		);
		this.registerView(
			SCENE_NAV_TYPE,
			(leaf) => new SceneNavigatorView(leaf)
		);

		// Detach all views
		this.app.workspace.detachLeavesOfType(PROGRESS_VIEW_TYPE);
		this.app.workspace.detachLeavesOfType(THREAD_VIEW_TYPE);
		this.app.workspace.detachLeavesOfType(SCENE_NAV_TYPE);

		// Register auto-completion
		this.autoComplete = new LonelogAutoComplete(this.app);
		this.registerEditorSuggest(this.autoComplete);

		// Register all commands
		this.registerCommands();

		// Add settings tab
		this.addSettingTab(new LonelogSettingTab(this.app, this));

	}

	onunload() {
		removeHighlightColors();
		console.log("Unloading Lonelog plugin");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	registerCommands(): void {
		// Single symbol commands
		this.addCommand({
			id: "insert-action",
			name: "Insert action (@)",
			editorCallback: (editor) => {
				NotationCommands.insertAction(editor, this.settings);
			},
		});

		this.addCommand({
			id: "insert-question",
			name: "Insert question (?)",
			editorCallback: (editor) => {
				NotationCommands.insertQuestion(editor, this.settings);
			},
		});

		this.addCommand({
			id: "insert-dice-roll",
			name: "Insert dice roll (d:)",
			editorCallback: (editor) => {
				NotationCommands.insertDiceRoll(editor, this.settings);
			},
		});

		this.addCommand({
			id: "insert-result",
			name: "Insert result (->)",
			editorCallback: (editor) => {
				NotationCommands.insertResult(editor, this.settings);
			},
		});

		this.addCommand({
			id: "insert-consequence",
			name: "Insert consequence (=>)",
			editorCallback: (editor) => {
				NotationCommands.insertConsequence(editor, this.settings);
			},
		});

		// Multi-line pattern commands
		this.addCommand({
			id: "insert-action-sequence",
			name: "Insert action sequence",
			editorCallback: (editor) => {
				NotationCommands.insertActionSequence(editor, this.settings);
			},
		});

		this.addCommand({
			id: "insert-oracle-sequence",
			name: "Insert oracle sequence",
			editorCallback: (editor) => {
				NotationCommands.insertOracleSequence(editor, this.settings);
			},
		});

		// Tag snippet commands
		this.addCommand({
			id: "insert-npc-tag",
			name: "Insert NPC tag",
			editorCallback: (editor) => {
				NotationCommands.insertNPCTag(editor, this.settings);
			},
		});

		this.addCommand({
			id: "insert-location-tag",
			name: "Insert location tag",
			editorCallback: (editor) => {
				NotationCommands.insertLocationTag(editor, this.settings);
			},
		});

		this.addCommand({
			id: "insert-event-clock",
			name: "Insert event/clock",
			editorCallback: (editor) => {
				NotationCommands.insertEventClock(editor, this.settings);
			},
		});

		this.addCommand({
			id: "insert-track",
			name: "Insert track",
			editorCallback: (editor) => {
				NotationCommands.insertTrack(editor, this.settings);
			},
		});

		this.addCommand({
			id: "insert-thread",
			name: "Insert thread",
			editorCallback: (editor) => {
				NotationCommands.insertThread(editor, this.settings);
			},
		});

		this.addCommand({
			id: "insert-pc-tag",
			name: "Insert PC tag",
			editorCallback: (editor) => {
				NotationCommands.insertPCTag(editor, this.settings);
			},
		});

		this.addCommand({
			id: "insert-timer",
			name: "Insert timer",
			editorCallback: (editor) => {
				NotationCommands.insertTimer(editor, this.settings);
			},
		});

		this.addCommand({
			id: "insert-reference",
			name: "Insert reference tag (#N:)",
			editorCallback: (editor) => {
				NotationCommands.insertReference(editor, this.settings);
			},
		});

		// Phase 2: Template commands
		this.addCommand({
			id: "insert-campaign-header",
			name: "Insert campaign header",
			editorCallback: (editor) => {
				TemplateCommands.insertCampaignHeader(this.app, editor);
			},
		});

		this.addCommand({
			id: "insert-session-header",
			name: "Insert session header",
			editorCallback: (editor) => {
				TemplateCommands.insertSessionHeader(editor);
			},
		});

		this.addCommand({
			id: "insert-scene-marker",
			name: "Insert scene marker",
			editorCallback: (editor) => {
				TemplateCommands.insertSceneMarker(
					this.app,
					editor,
					this.settings.promptForSceneContext
				);
			},
		});

		this.addCommand({
			id: "toggle-code-block",
			name: "Toggle code block wrapper",
			editorCallback: (editor) => {
				TemplateCommands.toggleCodeBlock(editor);
			},
		});

		// Panel commands
		this.addCommand({
			id: "open-progress-tracker",
			name: "Open Progress Tracker",
			callback: () => {
				this.activateView(PROGRESS_VIEW_TYPE);
			},
		});

		this.addCommand({
			id: "open-thread-browser",
			name: "Open Thread Browser",
			callback: () => {
				this.activateView(THREAD_VIEW_TYPE);
			},
		});

		this.addCommand({
			id: "open-scene-navigator",
			name: "Open Scene Navigator",
			callback: () => {
				this.activateView(SCENE_NAV_TYPE);
			},
		});
	}

	async activateView(viewType: string) {
		const { workspace } = this.app;

		let leaf = workspace.getLeavesOfType(viewType)[0];

		if (!leaf) {
			// Create new leaf in right sidebar
			leaf = workspace.getRightLeaf(false);
			await leaf!.setViewState({
				type: viewType,
				active: true,
			});
		}

		// Reveal the leaf
		workspace.revealLeaf(leaf);
	}
}
