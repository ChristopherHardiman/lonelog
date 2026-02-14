import { App, PluginSettingTab, Setting } from "obsidian";
import LonelogPlugin from "./main";

export interface LonelogSettings {
	// Phase 1 settings
	insertSpaceAfterSymbol: boolean;
	smartCursorPositioning: boolean;

	// Phase 2 settings
	autoIncrementScenes: boolean;
	promptForSceneContext: boolean;
	autoWrapInCodeBlock: boolean;

	// Template customization
	actionSequenceTemplate: string;
	oracleSequenceTemplate: string;
}

export const DEFAULT_SETTINGS: LonelogSettings = {
	insertSpaceAfterSymbol: true,
	smartCursorPositioning: true,
	autoIncrementScenes: true,
	promptForSceneContext: true,
	autoWrapInCodeBlock: false,
	actionSequenceTemplate: "@ [action]\nd: [roll] -> [outcome]\n=> [consequence]",
	oracleSequenceTemplate: "? [question]\n-> [answer]\n=> [consequence]",
};

export class LonelogSettingTab extends PluginSettingTab {
	plugin: LonelogPlugin;

	constructor(app: App, plugin: LonelogPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Lonelog Notation Settings" });

		// Phase 1 Settings
		containerEl.createEl("h3", { text: "Core Notation" });

		new Setting(containerEl)
			.setName("Insert space after symbols")
			.setDesc("Add a space after @ ? d: -> => for easier typing")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.insertSpaceAfterSymbol)
					.onChange(async (value) => {
						this.plugin.settings.insertSpaceAfterSymbol = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Smart cursor positioning")
			.setDesc(
				"Move cursor to optimal position after insertion (e.g., inside brackets)"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.smartCursorPositioning)
					.onChange(async (value) => {
						this.plugin.settings.smartCursorPositioning = value;
						await this.plugin.saveSettings();
					})
			);

		// Phase 2 Settings
		containerEl.createEl("h3", { text: "Templates" });

		new Setting(containerEl)
			.setName("Auto-increment scene numbers")
			.setDesc("Automatically detect and increment scene numbers")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoIncrementScenes)
					.onChange(async (value) => {
						this.plugin.settings.autoIncrementScenes = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Prompt for scene context")
			.setDesc("Show modal to enter scene context when inserting scene marker")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.promptForSceneContext)
					.onChange(async (value) => {
						this.plugin.settings.promptForSceneContext = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
