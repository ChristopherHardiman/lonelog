/**
 * Thread Browser Panel
 * Displays all NPCs, locations, threads, and PCs with navigation
 */

import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
import {
	NotationParser,
	ParsedElements,
	ParsedNPC,
	ParsedLocation,
	ParsedThread,
	ParsedPC,
} from "../utils/parser";

export const THREAD_VIEW_TYPE = "lonelog-thread-view";

export class ThreadBrowserView extends ItemView {
	private parsedElements: ParsedElements | null = null;
	private currentFile: TFile | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return THREAD_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Lonelog threads";
	}

	getIcon(): string {
		return "list";
	}

	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1];
		if (!container) return;
		if (!(container instanceof HTMLElement)) return;
		container.empty();
		container.addClass("lonelog-thread-container");

		// Listen for active file changes
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				void this.refresh();
			})
		);

		// Listen for file modifications
		this.registerEvent(
			this.app.vault.on("modify", (file) => {
				if (file === this.currentFile) {
					void this.refresh();
				}
			})
		);

		void this.refresh();
	}

	async refresh(): Promise<void> {
		const container = this.containerEl.children[1];
		if (!container) return;
		if (!(container instanceof HTMLElement)) return;
		container.empty();

		// Get active file
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			container.createEl("div", {
				text: "No active file",
				cls: "lonelog-empty-state",
			});
			return;
		}

		this.currentFile = activeFile;

		// Read and parse file
		const content = await this.app.vault.read(activeFile);
		this.parsedElements = NotationParser.parse(content);

		// Render header
		const header = container.createEl("div", {
			cls: "lonelog-thread-header",
		});
		header.createEl("h4", { text: "Story elements" });

		const totalCount =
			this.parsedElements.npcs.size +
			this.parsedElements.locations.size +
			this.parsedElements.threads.size +
			this.parsedElements.pcs.size;

		header.createEl("span", {
			text: `${totalCount} items`,
			cls: "lonelog-count",
		});

		// Check if empty
		if (totalCount === 0) {
			container.createEl("div", {
				text: "No story elements found",
				cls: "lonelog-empty-state",
			});
			return;
		}

		// Render each category
		if (this.parsedElements.pcs.size > 0) {
			this.renderPCSection(container, this.parsedElements.pcs);
		}

		if (this.parsedElements.npcs.size > 0) {
			this.renderNPCSection(container, this.parsedElements.npcs);
		}

		if (this.parsedElements.locations.size > 0) {
			this.renderLocationSection(
				container,
				this.parsedElements.locations
			);
		}

		if (this.parsedElements.threads.size > 0) {
			this.renderThreadSection(container, this.parsedElements.threads);
		}
	}

	private renderPCSection(
		container: HTMLElement,
		pcs: Map<string, ParsedPC>
	): void {
		const section = container.createEl("div", {
			cls: "lonelog-thread-section",
		});

		const sectionHeader = section.createEl("div", {
			cls: "lonelog-thread-section-header",
		});
		sectionHeader.createEl("h5", { text: "Player characters" });
		sectionHeader.createEl("span", {
			text: `${pcs.size}`,
			cls: "lonelog-section-count",
		});

		const list = section.createEl("div", { cls: "lonelog-thread-list" });

		Array.from(pcs.values())
			.sort((a, b) => a.name.localeCompare(b.name))
			.forEach((pc) => {
				this.renderEntityItem(list, pc.name, pc.tags, pc.mentions);
			});
	}

	private renderNPCSection(
		container: HTMLElement,
		npcs: Map<string, ParsedNPC>
	): void {
		const section = container.createEl("div", {
			cls: "lonelog-thread-section",
		});

		const sectionHeader = section.createEl("div", {
			cls: "lonelog-thread-section-header",
		});
		sectionHeader.createEl("h5", { text: "NPCs" });
		sectionHeader.createEl("span", {
			text: `${npcs.size}`,
			cls: "lonelog-section-count",
		});

		const list = section.createEl("div", { cls: "lonelog-thread-list" });

		Array.from(npcs.values())
			.sort((a, b) => a.name.localeCompare(b.name))
			.forEach((npc) => {
				this.renderEntityItem(list, npc.name, npc.tags, npc.mentions);
			});
	}

	private renderLocationSection(
		container: HTMLElement,
		locations: Map<string, ParsedLocation>
	): void {
		const section = container.createEl("div", {
			cls: "lonelog-thread-section",
		});

		const sectionHeader = section.createEl("div", {
			cls: "lonelog-thread-section-header",
		});
		sectionHeader.createEl("h5", { text: "Locations" });
		sectionHeader.createEl("span", {
			text: `${locations.size}`,
			cls: "lonelog-section-count",
		});

		const list = section.createEl("div", { cls: "lonelog-thread-list" });

		Array.from(locations.values())
			.sort((a, b) => a.name.localeCompare(b.name))
			.forEach((location) => {
				this.renderEntityItem(
					list,
					location.name,
					location.tags,
					location.mentions
				);
			});
	}

	private renderThreadSection(
		container: HTMLElement,
		threads: Map<string, ParsedThread>
	): void {
		const section = container.createEl("div", {
			cls: "lonelog-thread-section",
		});

		const sectionHeader = section.createEl("div", {
			cls: "lonelog-thread-section-header",
		});
		sectionHeader.createEl("h5", { text: "Threads" });
		sectionHeader.createEl("span", {
			text: `${threads.size}`,
			cls: "lonelog-section-count",
		});

		const list = section.createEl("div", { cls: "lonelog-thread-list" });

		Array.from(threads.values())
			.sort((a, b) => a.name.localeCompare(b.name))
			.forEach((thread) => {
				this.renderThreadItem(
					list,
					thread.name,
					thread.state,
					thread.mentions
				);
			});
	}

	private renderEntityItem(
		container: HTMLElement,
		name: string,
		tags: string[],
		mentions: number[]
	): void {
		const item = container.createEl("div", {
			cls: "lonelog-thread-item",
		});

		const nameRow = item.createEl("div", {
			cls: "lonelog-thread-item-name-row",
		});

		const nameBtn = nameRow.createEl("button", {
			text: name,
			cls: "lonelog-thread-item-name",
		});
		nameBtn.addEventListener("click", () => {
			if (mentions[0] !== undefined) {
				this.jumpToLine(mentions[0]);
			}
		});

		nameRow.createEl("span", {
			text: `×${mentions.length}`,
			cls: "lonelog-mention-count",
		});

		if (tags.length > 0) {
			const tagsEl = item.createEl("div", {
				cls: "lonelog-thread-item-tags",
			});
			tagsEl.setText(tags.join(" | "));
		}

		// Mention navigation
		if (mentions.length > 1) {
			const mentionsNav = item.createEl("div", {
				cls: "lonelog-mentions-nav",
			});
			mentions.forEach((line, index) => {
				const mentionBtn = mentionsNav.createEl("button", {
					text: `${index + 1}`,
					cls: "lonelog-mention-btn",
				});
				mentionBtn.addEventListener("click", () => {
					this.jumpToLine(line);
				});
			});
		}
	}

	private renderThreadItem(
		container: HTMLElement,
		name: string,
		state: string,
		mentions: number[]
	): void {
		const item = container.createEl("div", {
			cls: "lonelog-thread-item",
		});

		const nameRow = item.createEl("div", {
			cls: "lonelog-thread-item-name-row",
		});

		const nameBtn = nameRow.createEl("button", {
			text: name,
			cls: "lonelog-thread-item-name",
		});
		nameBtn.addEventListener("click", () => {
			if (mentions[0] !== undefined) {
				this.jumpToLine(mentions[0]);
			}
		});

		nameRow.createEl("span", {
			text: state,
			cls: `lonelog-thread-state lonelog-thread-state-${state.toLowerCase()}`,
		});

		// Mention navigation
		if (mentions.length > 1) {
			const mentionsNav = item.createEl("div", {
				cls: "lonelog-mentions-nav",
			});
			mentions.forEach((line, index) => {
				const mentionBtn = mentionsNav.createEl("button", {
					text: `${index + 1}`,
					cls: "lonelog-mention-btn",
				});
				mentionBtn.addEventListener("click", () => {
					this.jumpToLine(line);
				});
			});
		}
	}

	private jumpToLine(line: number): void {
		if (!this.currentFile) return;

		const leaf = this.app.workspace.getLeaf(false);
		void leaf.openFile(this.currentFile).then(() => {
			const editor = this.app.workspace.activeEditor?.editor;
			if (editor) {
				editor.setCursor({ line, ch: 0 });
				editor.scrollIntoView(
					{ from: { line, ch: 0 }, to: { line, ch: 0 } },
					true
				);
			}
		});
	}

	async onClose(): Promise<void> {
		// Cleanup
	}
}
