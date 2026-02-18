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

	// Highlighting settings
	enableEditorHighlighting: boolean;
	enableReadingHighlighting: boolean;

	// Highlighting colors
	colorAction: string;      // @ lines — blue
	colorQuestion: string;    // ? lines — purple
	colorDice: string;        // d: lines — green
	colorConsequence: string; // => lines — red
	colorResult: string;      // -> token — yellow
	colorTag: string;         // [N:...] tokens — orange
}

export const DEFAULT_SETTINGS: LonelogSettings = {
	insertSpaceAfterSymbol: true,
	smartCursorPositioning: true,
	autoIncrementScenes: true,
	promptForSceneContext: true,
	autoWrapInCodeBlock: false,
	actionSequenceTemplate: "@ [action]\nd: [roll] -> [outcome]\n=> [consequence]",
	oracleSequenceTemplate: "? [question]\n-> [answer]\n=> [consequence]",

	// Highlighting toggles
	enableEditorHighlighting: true,
	enableReadingHighlighting: true,

	// Match the values currently used in highlighter.css
	colorAction:      "#3b82f6",  // blue
	colorQuestion:    "#8b5cf6",  // purple
	colorDice:        "#22c55e",  // green
	colorConsequence: "#ef4444",  // red
	colorResult:      "#ca8a04",  // yellow
	colorTag:         "#c2410c",  // orange
};

/** Injects (or updates) a <style> tag that sets the Lonelog CSS variables. */
export function applyHighlightColors(settings: LonelogSettings): void {
	const ID = "lonelog-highlight-vars";
	let el = document.getElementById(ID) as HTMLStyleElement | null;
	if (!el) {
		el = document.createElement("style");
		el.id = ID;
		document.head.appendChild(el);
	}
	el.textContent = `
:root {
  --ll-action-color:      ${settings.colorAction};
  --ll-question-color:    ${settings.colorQuestion};
  --ll-dice-color:        ${settings.colorDice};
  --ll-consequence-color: ${settings.colorConsequence};
  --ll-result-color:      ${settings.colorResult};
  --ll-tag-color:         ${settings.colorTag};
}`.trim();
}

/** Removes the injected <style> tag (call from onunload). */
export function removeHighlightColors(): void {
	document.getElementById("lonelog-highlight-vars")?.remove();
}

// ---------------------------------------------------------------------------
// Settings tab
// ---------------------------------------------------------------------------

interface ColorDef {
	key: keyof Pick<
		LonelogSettings,
		| "colorAction"
		| "colorQuestion"
		| "colorDice"
		| "colorConsequence"
		| "colorResult"
		| "colorTag"
	>;
	label: string;
	desc: string;
}

const COLOR_DEFS: ColorDef[] = [
	{ key: "colorAction",      label: "Action (@)",         desc: "Text color for @ lines" },
	{ key: "colorQuestion",    label: "Question (?)",        desc: "Text color for ? lines" },
	{ key: "colorDice",        label: "Dice roll (d:)",      desc: "Text color for d: lines" },
	{ key: "colorConsequence", label: "Consequence (=>)",    desc: "Text color for => lines" },
	{ key: "colorResult",      label: "Result arrow (->)",   desc: "Text color for -> tokens" },
	{ key: "colorTag",         label: "Tags ([N:…] etc.)",   desc: "Text color for bracket tag tokens" },
];

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

		// ── Core Notation ──────────────────────────────────────────────────
		containerEl.createEl("h3", { text: "Core notation" });

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
			.setDesc("Move cursor to optimal position after insertion (e.g., inside brackets)")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.smartCursorPositioning)
					.onChange(async (value) => {
						this.plugin.settings.smartCursorPositioning = value;
						await this.plugin.saveSettings();
					})
			);

		// ── Templates ──────────────────────────────────────────────────────
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
			.setDesc("Show modal to enter scene context when inserting a scene marker")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.promptForSceneContext)
					.onChange(async (value) => {
						this.plugin.settings.promptForSceneContext = value;
						await this.plugin.saveSettings();
					})
			);

		// ── Highlighting ───────────────────────────────────────────────────
		containerEl.createEl("h3", { text: "Syntax highlighting" });

		new Setting(containerEl)
			.setName("Enable editor highlighting")
			.setDesc("Highlight lonelog notation while editing code blocks")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableEditorHighlighting)
					.onChange(async (value) => {
						this.plugin.settings.enableEditorHighlighting = value;
						await this.plugin.saveSettings();
						// Suggest reload for extension changes to take effect
						if (!value) {
							containerEl.createEl("div", {
								text: "⚠️ Reload Obsidian for this change to take full effect",
								cls: "setting-item-description mod-warning",
							});
						}
					})
			);

		new Setting(containerEl)
			.setName("Enable reading mode highlighting")
			.setDesc("Highlight lonelog notation in reading view")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableReadingHighlighting)
					.onChange(async (value) => {
						this.plugin.settings.enableReadingHighlighting = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h4", { text: "Highlighting colors" });
		containerEl.createEl("p", {
			text: "Any valid CSS color value is accepted: hex (#3b82f6), rgba(59,130,246,0.15), or a CSS variable (var(--color-accent)).",
			cls: "setting-item-description",
		});

		for (const def of COLOR_DEFS) {
			this.addColorSetting(containerEl, def);
		}
	}

	private addColorSetting(containerEl: HTMLElement, def: ColorDef): void {
		const defaultValue = DEFAULT_SETTINGS[def.key];

		const setting = new Setting(containerEl)
			.setName(def.label)
			.setDesc(def.desc);

		// Add color picker
		const colorPickerContainer = setting.controlEl.createDiv({ cls: "lonelog-color-picker-container" });
		const colorPicker = colorPickerContainer.createEl("input", {
			type: "color",
			cls: "lonelog-color-picker",
		});

		// Convert current value to hex for color picker (best effort)
		colorPicker.value = this.normalizeColorForPicker(this.plugin.settings[def.key]);

		// Add text input
		setting.addText((text) => {
			text
				.setPlaceholder(defaultValue)
				.setValue(this.plugin.settings[def.key])
				.onChange(async (value) => {
					this.plugin.settings[def.key] = value || defaultValue;
					await this.plugin.saveSettings();
					applyHighlightColors(this.plugin.settings);
					// Update color picker if valid hex
					const normalized = this.normalizeColorForPicker(value);
					if (normalized) {
						colorPicker.value = normalized;
					}
				});
			text.inputEl.style.width = "180px";
			text.inputEl.style.fontFamily = "var(--font-monospace)";

			// Sync color picker to text input
			colorPicker.addEventListener("input", async () => {
				const hexValue = colorPicker.value;
				text.setValue(hexValue);
				this.plugin.settings[def.key] = hexValue;
				await this.plugin.saveSettings();
				applyHighlightColors(this.plugin.settings);
			});
		});

		// Add reset button
		setting.addButton((btn) => {
			btn
				.setIcon("rotate-ccw")
				.setTooltip("Reset to default")
				.onClick(async () => {
					this.plugin.settings[def.key] = defaultValue;
					await this.plugin.saveSettings();
					applyHighlightColors(this.plugin.settings);
					// Re-render the tab so the inputs reflect the reset value
					this.display();
				});
		});
	}

	/**
	 * Normalize a color value to hex format for the color picker.
	 * Handles hex values and common color names. Returns empty string if invalid.
	 */
	private normalizeColorForPicker(color: string): string {
		// Already a valid hex color
		if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
			return color;
		}

		// Try to use the browser to parse color names/other formats
		const canvas = document.createElement("canvas");
		canvas.width = canvas.height = 1;
		const ctx = canvas.getContext("2d");
		if (!ctx) return "#000000";

		ctx.fillStyle = color;
		const computedColor = ctx.fillStyle;

		// Convert rgb(a) to hex if needed
		if (computedColor.startsWith("#")) {
			return computedColor.length === 7 ? computedColor : "#000000";
		}

		// Parse rgb/rgba format
		const rgbMatch = computedColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
		if (rgbMatch && rgbMatch[1] && rgbMatch[2] && rgbMatch[3]) {
			const r = parseInt(rgbMatch[1]).toString(16).padStart(2, "0");
			const g = parseInt(rgbMatch[2]).toString(16).padStart(2, "0");
			const b = parseInt(rgbMatch[3]).toString(16).padStart(2, "0");
			return `#${r}${g}${b}`;
		}

		return "#000000";
	}
}
