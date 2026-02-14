# Lonelog Plugin - Development Plan

**Project**: Obsidian Lonelog Notation Plugin  
**Version**: 1.0.0 (MVP)  
**Last Updated**: February 14, 2026  
**Status**: Planning → Development

---

## Overview

This plan outlines the step-by-step process to develop the Lonelog Obsidian plugin from initial setup through MVP release. The focus is on **Phase 1 (Core Notation)** and **Phase 2 (Templates & Structure)** as the minimum viable product.

**Development Philosophy**: Build incrementally, test continuously, release early.

---

## Project Setup

### 1. Initialize Project Structure

**Tasks**:
- [x] Fork Obsidian sample plugin repository
- [ ] Configure TypeScript and build system (esbuild)
- [ ] Set up ESLint configuration
- [ ] Update manifest.json with plugin metadata
- [ ] Create initial folder structure

**File Structure**:
```
lonelog/
├── src/
│   ├── main.ts                 # Plugin entry point
│   ├── settings.ts             # Settings interface
│   ├── types.ts                # TypeScript types
│   ├── commands/
│   │   ├── notation.ts         # Notation insertion commands
│   │   └── templates.ts        # Template commands
│   └── utils/
│       ├── editor.ts           # Editor utilities
│       └── parser.ts           # Notation parser (Phase 3)
├── styles.css                  # Plugin styles
├── manifest.json               # Plugin manifest
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── esbuild.config.mjs          # Build config
├── README.md                   # User documentation
├── CHANGELOG.md                # Version history
└── docs/
    ├── objective.md            # Project objectives
    └── plan.md                 # This file
```

**Commands**:
```bash
# Clone/fork sample plugin
git clone https://github.com/obsidianmd/obsidian-sample-plugin lonelog
cd lonelog

# Install dependencies
npm install

# Start development build
npm run dev
```

**Success Criteria**: Project builds without errors, loads in Obsidian test vault

---

## Phase 1: Core Notation (MVP)

**Goal**: Enable fast notation insertion via keyboard shortcuts  
**Timeline**: 2-3 weeks  
**Priority**: CRITICAL (blocks all other features)

### 1.1 Basic Plugin Setup

**File**: `src/main.ts`

**Tasks**:
- [ ] Create `LonelogPlugin` class extending `Plugin`
- [ ] Implement `onload()` and `onunload()` lifecycle methods
- [ ] Register plugin in Obsidian
- [ ] Test plugin loads successfully

**Implementation**:
```typescript
import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, LonelogSettings } from "./settings";

export default class LonelogPlugin extends Plugin {
  settings: LonelogSettings;

  async onload() {
    console.log("Loading Lonelog plugin");
    
    await this.loadSettings();
    
    // Register commands (next step)
    this.registerCommands();
  }

  onunload() {
    console.log("Unloading Lonelog plugin");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  registerCommands() {
    // Will implement in next steps
  }
}
```

**Success Criteria**: Plugin appears in Community Plugins list, can be enabled/disabled

---

### 1.2 Settings Interface

**File**: `src/settings.ts`

**Tasks**:
- [ ] Define `LonelogSettings` interface
- [ ] Create default settings object
- [ ] Implement settings tab UI
- [ ] Add save/load functionality

**Implementation**:
```typescript
import { App, PluginSettingTab, Setting } from "obsidian";
import LonelogPlugin from "./main";

export interface LonelogSettings {
  // Phase 1 settings
  insertSpaceAfterSymbol: boolean;
  smartCursorPositioning: boolean;
  
  // Phase 2 settings (for later)
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
  }
}
```

**Success Criteria**: Settings tab appears, changes persist after reload

---

### 1.3 Single Symbol Commands

**File**: `src/commands/notation.ts`

**Tasks**:
- [ ] Create insertion functions for each symbol
- [ ] Handle cursor positioning based on settings
- [ ] Add proper spacing
- [ ] Register commands in main.ts

**Implementation**:
```typescript
import { Editor, EditorPosition } from "obsidian";
import { LonelogSettings } from "../settings";

export class NotationCommands {
  
  static insertAction(editor: Editor, settings: LonelogSettings) {
    const text = settings.insertSpaceAfterSymbol ? "@ " : "@";
    editor.replaceSelection(text);
  }

  static insertQuestion(editor: Editor, settings: LonelogSettings) {
    const text = settings.insertSpaceAfterSymbol ? "? " : "?";
    editor.replaceSelection(text);
  }

  static insertDiceRoll(editor: Editor, settings: LonelogSettings) {
    const text = settings.insertSpaceAfterSymbol ? "d: " : "d:";
    editor.replaceSelection(text);
  }

  static insertResult(editor: Editor, settings: LonelogSettings) {
    const text = settings.insertSpaceAfterSymbol ? "-> " : "->";
    editor.replaceSelection(text);
  }

  static insertConsequence(editor: Editor, settings: LonelogSettings) {
    const text = settings.insertSpaceAfterSymbol ? "=> " : "=>";
    editor.replaceSelection(text);
  }
}
```

**Register in main.ts**:
```typescript
registerCommands() {
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

  // ... repeat for d:, ->, =>
}
```

**Success Criteria**: Commands appear in command palette, insert correct symbols

---

### 1.4 Multi-Line Pattern Commands

**File**: `src/commands/notation.ts` (continued)

**Tasks**:
- [ ] Create action sequence template
- [ ] Create oracle sequence template
- [ ] Handle cursor positioning to first placeholder
- [ ] Make templates configurable

**Implementation**:
```typescript
export class NotationCommands {
  // ... previous methods ...

  static insertActionSequence(editor: Editor, settings: LonelogSettings) {
    const template = settings.actionSequenceTemplate;
    const cursor = editor.getCursor();
    
    editor.replaceSelection(template);
    
    if (settings.smartCursorPositioning) {
      // Move cursor to first placeholder [action]
      const line = cursor.line;
      const newCursor = { line, ch: cursor.ch + 2 }; // After "@ "
      editor.setCursor(newCursor);
    }
  }

  static insertOracleSequence(editor: Editor, settings: LonelogSettings) {
    const template = settings.oracleSequenceTemplate;
    const cursor = editor.getCursor();
    
    editor.replaceSelection(template);
    
    if (settings.smartCursorPositioning) {
      // Move cursor to first placeholder [question]
      const line = cursor.line;
      const newCursor = { line, ch: cursor.ch + 2 }; // After "? "
      editor.setCursor(newCursor);
    }
  }
}
```

**Commands Registration**:
```typescript
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
```

**Success Criteria**: Multi-line templates insert correctly, cursor positioned at first edit point

---

### 1.5 Tag Snippet Commands

**File**: `src/commands/notation.ts` (continued)

**Tasks**:
- [ ] Create tag insertion methods for each type
- [ ] Position cursor inside brackets for easy editing
- [ ] Handle special cases (Progress numbers, Thread states)

**Implementation**:
```typescript
export class NotationCommands {
  // ... previous methods ...

  static insertNPCTag(editor: Editor, settings: LonelogSettings) {
    const text = "[N:Name|]";
    const cursor = editor.getCursor();
    editor.replaceSelection(text);
    
    if (settings.smartCursorPositioning) {
      // Position cursor after "N:" to replace "Name"
      editor.setCursor({
        line: cursor.line,
        ch: cursor.ch + 3, // Position at "N"
      });
      // Select "Name" for easy replacement
      editor.setSelection(
        { line: cursor.line, ch: cursor.ch + 3 },
        { line: cursor.line, ch: cursor.ch + 7 }
      );
    }
  }

  static insertLocationTag(editor: Editor, settings: LonelogSettings) {
    const text = "[L:Name|]";
    const cursor = editor.getCursor();
    editor.replaceSelection(text);
    
    if (settings.smartCursorPositioning) {
      editor.setSelection(
        { line: cursor.line, ch: cursor.ch + 3 },
        { line: cursor.line, ch: cursor.ch + 7 }
      );
    }
  }

  static insertEventClock(editor: Editor, settings: LonelogSettings) {
    const text = "[E:Name 0/6]";
    const cursor = editor.getCursor();
    editor.replaceSelection(text);
    
    if (settings.smartCursorPositioning) {
      // Select "Name"
      editor.setSelection(
        { line: cursor.line, ch: cursor.ch + 3 },
        { line: cursor.line, ch: cursor.ch + 7 }
      );
    }
  }

  static insertTrack(editor: Editor, settings: LonelogSettings) {
    const text = "[Track:Name 0/6]";
    editor.replaceSelection(text);
    // Similar cursor positioning
  }

  static insertThread(editor: Editor, settings: LonelogSettings) {
    const text = "[Thread:Name|Open]";
    editor.replaceSelection(text);
    // Similar cursor positioning
  }

  static insertPCTag(editor: Editor, settings: LonelogSettings) {
    const text = "[PC:Name|]";
    editor.replaceSelection(text);
    // Similar cursor positioning
  }

  static insertTimer(editor: Editor, settings: LonelogSettings) {
    const text = "[Timer:Name 0]";
    editor.replaceSelection(text);
    // Similar cursor positioning
  }

  static insertReference(editor: Editor, settings: LonelogSettings) {
    const text = "[#N:Name]";
    const cursor = editor.getCursor();
    editor.replaceSelection(text);
    
    if (settings.smartCursorPositioning) {
      // Select "Name" for replacement
      editor.setSelection(
        { line: cursor.line, ch: cursor.ch + 4 },
        { line: cursor.line, ch: cursor.ch + 8 }
      );
    }
  }
}
```

**Commands Registration**:
```typescript
// Tag insertion commands
this.addCommand({
  id: "insert-npc-tag",
  name: "Insert NPC tag",
  editorCallback: (editor) => {
    NotationCommands.insertNPCTag(editor, this.settings);
  },
});

// ... repeat for other tag types
```

**Success Criteria**: All tag types insert correctly, text selected for easy replacement

---

### 1.6 Hotkey Configuration

**File**: `manifest.json` (update with default hotkeys)

**Tasks**:
- [ ] Define default hotkeys for common commands
- [ ] Document hotkey customization in README
- [ ] Test hotkey conflicts with Obsidian defaults

**Suggested Default Hotkeys**:
```json
{
  "commands": [
    {
      "id": "insert-action",
      "name": "Insert action (@)",
      "hotkeys": [
        {
          "modifiers": ["Ctrl", "Shift"],
          "key": "A"
        }
      ]
    },
    {
      "id": "insert-question",
      "name": "Insert question (?)",
      "hotkeys": [
        {
          "modifiers": ["Ctrl", "Shift"],
          "key": "Q"
        }
      ]
    },
    {
      "id": "insert-action-sequence",
      "name": "Insert action sequence",
      "hotkeys": [
        {
          "modifiers": ["Ctrl", "Alt"],
          "key": "A"
        }
      ]
    }
  ]
}
```

**Note**: Users can customize these in Obsidian Settings → Hotkeys

**Success Criteria**: Default hotkeys work without conflicts, users can customize

---

### Phase 1 Testing Checklist

**Manual Testing**:
- [ ] All single-symbol commands work via command palette
- [ ] All single-symbol commands work via hotkeys
- [ ] Multi-line templates insert correctly
- [ ] Tag snippets position cursor correctly
- [ ] Text selection works for tag placeholders
- [ ] Settings persist after Obsidian restart
- [ ] No conflicts with core Obsidian shortcuts
- [ ] Plugin works with existing Lonelog notes

**Test Cases**:
```markdown
# Test Document

<!-- Test 1: Single symbols -->
@ Test action
? Test question
d: Test roll
-> Test result
=> Test consequence

<!-- Test 2: Multi-line patterns -->
@ Attack the guard
d: d20+5=18 vs AC 15 -> Success
=> The guard falls

? Is anyone else nearby?
-> No, but...
=> You hear distant footsteps

<!-- Test 3: Tags -->
[N:Jonah|friendly|wounded]
[L:Lighthouse|ruined]
[E:Alert 2/6]
[Track:Investigation 4/10]
[Thread:Find Sister|Open]
[PC:Alex|HP 8]
[Timer:Dawn 3]
[#N:Jonah]
```

**Success Criteria**: All features work reliably, no data loss or corruption

---

## Phase 2: Templates & Structure

**Goal**: Streamline session/scene creation  
**Timeline**: 1-2 weeks  
**Priority**: HIGH (completes MVP)

### 2.1 Campaign Header Command

**File**: `src/commands/templates.ts`

**Tasks**:
- [x] Create modal for campaign metadata input
- [x] Generate YAML frontmatter
- [x] Auto-fill date fields
- [x] Insert at document start

**Implementation**:
```typescript
import { App, Modal, Setting } from "obsidian";
import { Editor } from "obsidian";

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
      .addText((text) =>
        text.onChange((value) => {
          this.title = value;
        })
      );

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

export interface CampaignHeaderData {
  title: string;
  ruleset: string;
  genre: string;
  player: string;
  pcs: string;
}

export class TemplateCommands {
  static async insertCampaignHeader(app: App, editor: Editor) {
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
}
```

**Success Criteria**: Modal collects data, inserts valid YAML at document start

---

### 2.2 Session Header Command

**File**: `src/commands/templates.ts` (continued)

**Tasks**:
- [x] Detect next session number from document
- [x] Auto-fill current date
- [x] Insert session header at cursor
- [x] Optionally prompt for recap/goals

**Implementation**:
```typescript
export class TemplateCommands {
  // ... previous methods ...

  static getNextSessionNumber(editor: Editor): number {
    const content = editor.getValue();
    const sessionRegex = /^## Session (\d+)/gm;
    let maxSession = 0;
    let match;

    while ((match = sessionRegex.exec(content)) !== null) {
      const sessionNum = parseInt(match[1]);
      if (sessionNum > maxSession) {
        maxSession = sessionNum;
      }
    }

    return maxSession + 1;
  }

  static insertSessionHeader(editor: Editor) {
    const sessionNum = this.getNextSessionNumber(editor);
    const today = new Date().toISOString().split("T")[0];
    
    const template = `## Session ${sessionNum}
*Date: ${today} | Duration:  | Scenes: *

**Recap:** 

**Goals:** 

`;

    editor.replaceSelection(template);
    
    // Position cursor at Duration field
    const cursor = editor.getCursor();
    editor.setCursor({
      line: cursor.line - 4,
      ch: cursor.ch + template.split("\n")[1].indexOf("Duration: ") + 10,
    });
  }
}
```

**Command Registration**:
```typescript
this.addCommand({
  id: "insert-session-header",
  name: "Insert session header",
  editorCallback: (editor) => {
    TemplateCommands.insertSessionHeader(editor);
  },
});
```

**Success Criteria**: Session numbers auto-increment, date auto-fills, cursor positioned for editing

---

### 2.3 Scene Marker Command

**File**: `src/commands/templates.ts` (continued)

**Tasks**:
- [x] Detect next scene number in current session
- [x] Prompt for scene context (optional)
- [x] Insert scene heading
- [x] Support complex numbering (S1, S1a, T1-S1)

**Implementation**:
```typescript
export class TemplateCommands {
  // ... previous methods ...

  static getNextSceneNumber(editor: Editor): string {
    const content = editor.getValue();
    const cursor = editor.getCursor();
    
    // Find current session
    const lines = content.split("\n");
    let currentSession = 1;
    let lastScene = 0;
    
    for (let i = cursor.line; i >= 0; i--) {
      if (lines[i].startsWith("## Session ")) {
        const match = lines[i].match(/## Session (\d+)/);
        if (match) {
          currentSession = parseInt(match[1]);
          break;
        }
      }
    }
    
    // Find last scene in this session
    const sceneRegex = /^### S(\d+)/gm;
    let match;
    
    while ((match = sceneRegex.exec(content)) !== null) {
      const sceneNum = parseInt(match[1]);
      if (sceneNum > lastScene) {
        lastScene = sceneNum;
      }
    }
    
    return `S${lastScene + 1}`;
  }

  static async insertSceneMarker(app: App, editor: Editor, promptForContext: boolean) {
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
      editor.replaceSelection(template);
      
      // Select "Scene context" for easy replacement
      const cursor = editor.getCursor();
      const line = cursor.line - 2;
      const contextStart = template.indexOf("*") + 1;
      const contextEnd = template.lastIndexOf("*");
      
      editor.setSelection(
        { line, ch: contextStart },
        { line, ch: contextEnd }
      );
    }
  }
}

class SceneContextModal extends Modal {
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
      .setDesc("e.g., 'Dark alley, midnight' or 'Lighthouse tower, dusk'")
      .addText((text) => {
        text.onChange((value) => {
          this.context = value;
        });
        text.inputEl.focus();
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
```

**Success Criteria**: Scene numbers auto-increment, context modal optional (based on settings)

---

### 2.4 Code Block Wrapper Command

**File**: `src/commands/templates.ts` (continued)

**Tasks**:
- [x] Detect if selection is wrapped in code block
- [x] Toggle wrap/unwrap
- [x] Support `lonelog` language tag

**Implementation**:
```typescript
export class TemplateCommands {
  // ... previous methods ...

  static toggleCodeBlock(editor: Editor) {
    const selection = editor.getSelection();
    
    if (!selection) {
      // No selection, insert empty code block
      const template = "```lonelog\n\n```";
      editor.replaceSelection(template);
      
      // Position cursor inside block
      const cursor = editor.getCursor();
      editor.setCursor({
        line: cursor.line - 1,
        ch: 0,
      });
      return;
    }
    
    // Check if already wrapped
    const cursor = editor.getCursor("from");
    const doc = editor.getValue();
    const lines = doc.split("\n");
    
    const beforeLine = cursor.line > 0 ? lines[cursor.line - 1] : "";
    const cursorLine = lines[cursor.line];
    
    if (beforeLine.startsWith("```") || cursorLine.startsWith("```")) {
      // Unwrap: remove fence lines
      const wrapped = "```lonelog\n" + selection + "\n```";
      const unwrapped = selection;
      editor.replaceSelection(unwrapped);
    } else {
      // Wrap
      const wrapped = "```lonelog\n" + selection + "\n```";
      editor.replaceSelection(wrapped);
    }
  }
}
```

**Success Criteria**: Toggles code block wrapping correctly, preserves selection

---

### Phase 2 Testing Checklist

**Manual Testing**:
- [x] Campaign header modal collects all fields
- [x] YAML frontmatter inserts at document start
- [x] Session numbers auto-increment correctly
- [x] Session dates auto-fill
- [x] Scene numbers auto-increment within sessions
- [x] Scene context modal works (if enabled)
- [x] Code block wrapper toggles correctly
- [x] No data loss or formatting errors

**Test Scenarios**:
1. Create new campaign from blank file
2. Add multiple sessions, verify numbering
3. Add scenes within sessions, verify numbering
4. Toggle code block on existing notation
5. Verify YAML frontmatter is valid

**Success Criteria**: All template commands work reliably, auto-numbering is accurate

---

## Phase 3: Intelligence Layer (Post-MVP)

**Goal**: Auto-completion and parsing  
**Timeline**: 2-3 weeks  
**Priority**: MEDIUM (enhances MVP)

### 3.1 Notation Parser

**File**: `src/utils/parser.ts`

**Tasks**:
- [x] Parse NPCs from `[N:Name|tags]`
- [x] Parse locations from `[L:Name|tags]`
- [x] Parse threads from `[Thread:Name|state]`
- [x] Parse progress elements (clocks, tracks, timers)
- [x] Cache parsed results

**Implementation Approach**:
```typescript
export interface ParsedNPC {
  name: string;
  tags: string[];
  firstMention: EditorPosition;
  lastMention: EditorPosition;
}

export interface ParsedElement {
  npcs: Map<string, ParsedNPC>;
  locations: Map<string, ParsedLocation>;
  threads: Map<string, ParsedThread>;
  progress: ParsedProgress[];
}

export class NotationParser {
  static parse(content: string): ParsedElement {
    const npcs = this.parseNPCs(content);
    const locations = this.parseLocations(content);
    const threads = this.parseThreads(content);
    const progress = this.parseProgress(content);
    
    return { npcs, locations, threads, progress };
  }

  private static parseNPCs(content: string): Map<string, ParsedNPC> {
    const npcRegex = /\[N:([^\]|]+)(\|([^\]]*))?\]/g;
    const npcs = new Map<string, ParsedNPC>();
    
    let match;
    while ((match = npcRegex.exec(content)) !== null) {
      const name = match[1];
      const tagsStr = match[3] || "";
      const tags = tagsStr.split("|").filter(t => t.trim());
      
      // Track first and last mention
      // ... implementation details ...
    }
    
    return npcs;
  }

  // Similar methods for locations, threads, progress
}
```

**Success Criteria**: Parser extracts all notation elements accurately

---

### 3.2 Tag Auto-completion

**File**: `src/utils/autocomplete.ts`

**Tasks**:
- [x] Implement `EditorSuggest` for tag auto-completion
- [x] Trigger on `[N:`, `[L:`, `[Thread:`, etc.
- [x] Show previously defined elements
- [x] Show tags for selected element

**Implementation Approach**:
```typescript
import { EditorSuggest, Editor, EditorPosition, TFile } from "obsidian";
import { ParsedElement, NotationParser } from "./parser";

export class LonelogAutoComplete extends EditorSuggest<string> {
  private parsedElements: ParsedElement | null = null;

  onTrigger(cursor: EditorPosition, editor: Editor, file: TFile) {
    const line = editor.getLine(cursor.line);
    const prefix = line.substring(0, cursor.ch);
    
    // Check for tag patterns
    if (prefix.endsWith("[N:") || prefix.endsWith("[#N:")) {
      return {
        start: { line: cursor.line, ch: cursor.ch },
        end: cursor,
        query: "",
      };
    }
    
    // Similar for [L:, [Thread:, etc.
    
    return null;
  }

  getSuggestions(context: EditorSuggestContext): string[] {
    // Parse document if not cached
    if (!this.parsedElements) {
      const content = context.editor.getValue();
      this.parsedElements = NotationParser.parse(content);
    }
    
    // Return NPC names for [N: trigger
    // ... implementation details ...
  }

  renderSuggestion(suggestion: string, el: HTMLElement) {
    el.createEl("div", { text: suggestion });
  }

  selectSuggestion(suggestion: string, evt: MouseEvent | KeyboardEvent) {
    // Insert suggestion and position cursor
    // ... implementation details ...
  }
}
```

**Success Criteria**: Auto-complete suggests existing NPCs, locations, threads when typing

---

## Phase 4: Visual Tools (Post-MVP)

**Goal**: Navigation and tracking panels  
**Timeline**: 3-4 weeks  
**Priority**: LOW (nice-to-have)  
**STATUS**: ✅ COMPLETE

### 4.1 Progress Tracker Panel

**File**: `src/ui/progress-view.ts`

**Tasks**:
- [x] Create sidebar view class
- [x] Parse and display all progress elements
- [x] Add increment/decrement buttons
- [x] Update file on button click

**Features Implemented**:
- Event Clocks [E:Name X/Y], Tracks [Track:Name X/Y], Timers [Timer:Name X]
- Real-time parsing via NotationParser
- +/- buttons for incrementing/decrementing values
- Jump-to-line navigation
- Live updates via workspace and vault events
- Grouped display with sections

---

### 4.2 Thread Browser Panel

**File**: `src/ui/thread-view.ts`

**Tasks**:
- [x] Display all NPCs, locations, threads
- [x] Group by type
- [x] Make items clickable to jump to mention
- [x] Show tag history

**Features Implemented**:
- Four sections: PCs, NPCs, Locations, Threads
- Tag aggregation across all mentions
- Multiple mention navigation with numbered buttons
- Thread state indicators (Open/Closed/Resolved)
- Alphabetical sorting within sections
- Mention count badges
- Real-time updates

---

### 4.3 Scene Navigator

**File**: `src/ui/scene-nav.ts`

**Tasks**:
- [x] Generate outline of all scenes
- [x] Show scene context
- [x] Support complex numbering (S1a, T1-S1, S5.2)
- [x] Jump to scene on click

**Features Implemented**:
- Hierarchical session/scene structure
- Auto-detection of session numbers (## Session X)
- Date extraction from session metadata
- Scene number parsing (S1, S1a, etc.)
- Context extraction from scene markers (### S1 *context*)
- Collapsible session groups
- Scene count per session
- Click-to-jump navigation

---

## Testing Strategy

### Unit Testing

**Setup**:
- [ ] Configure Jest or similar test framework
- [ ] Create test fixtures (sample Lonelog files)
- [ ] Write tests for parser, commands, utilities

**Test Coverage Goals**:
- Parser: 80%+ coverage
- Commands: 90%+ coverage (critical path)
- Utilities: 70%+ coverage

**Sample Tests**:
```typescript
describe("NotationParser", () => {
  test("parses NPC tags correctly", () => {
    const content = "[N:Jonah|friendly|wounded]";
    const result = NotationParser.parse(content);
    expect(result.npcs.has("Jonah")).toBe(true);
    expect(result.npcs.get("Jonah")?.tags).toEqual(["friendly", "wounded"]);
  });

  test("handles multiple NPC mentions", () => {
    const content = `
      [N:Jonah|friendly]
      Some text
      [N:Jonah|wounded]
    `;
    const result = NotationParser.parse(content);
    expect(result.npcs.get("Jonah")?.tags).toContain("wounded");
  });
});
```

---

### Integration Testing

**Manual Test Protocol**:

1. **Fresh Install Test**:
   - Install plugin in clean vault
   - Verify all commands appear
   - Test each command once
   - Check settings persist

2. **Real-World Campaign Test**:
   - Create actual campaign header
   - Play 2-3 sessions using only plugin shortcuts
   - Verify notation is valid Lonelog
   - Check for any friction points

3. **Compatibility Test**:
   - Test with other plugins (Dataview, Templater, etc.)
   - Verify no conflicts
   - Test on mobile (if applicable)

4. **Performance Test**:
   - Create large file (10,000+ words)
   - Test command responsiveness
   - Check parser performance

---

### Beta Testing

**Recruitment**:
- [ ] Post in r/solorpgplay for beta testers
- [ ] Post in r/Solo_Roleplaying
- [ ] Create feedback form

**Beta Goals**:
- Get 5-10 active users
- Collect feedback on most-used features
- Identify bugs and edge cases
- Refine default hotkeys based on usage

**Beta Duration**: 2 weeks

---

## Documentation

### User Documentation

**README.md**:
- [ ] Installation instructions
- [ ] Quick start guide
- [ ] Command reference
- [ ] Hotkey customization guide
- [ ] Troubleshooting section

**In-App Help**:
- [ ] Tooltips in settings
- [ ] Command descriptions
- [ ] Link to Lonelog specification

---

### Developer Documentation

**CONTRIBUTING.md**:
- [ ] Development setup
- [ ] Build process
- [ ] Testing guidelines
- [ ] Code style guide
- [ ] PR process

**ARCHITECTURE.md**:
- [ ] Plugin structure overview
- [ ] Key design decisions
- [ ] Extension points for future features

---

## Release Process

### Version 1.0.0 (MVP Release)

**Pre-Release Checklist**:
- [ ] All Phase 1 & 2 features complete
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Beta feedback addressed
- [ ] No known critical bugs

**Release Steps**:
1. [ ] Update version in `manifest.json`
2. [ ] Update `versions.json`
3. [ ] Write CHANGELOG.md entry
4. [ ] Create Git tag `1.0.0`
5. [ ] Build release artifacts (`main.js`, `manifest.json`, `styles.css`)
6. [ ] Create GitHub release with tag `1.0.0`
7. [ ] Attach release artifacts
8. [ ] Submit to Obsidian Community Plugins

**Post-Release**:
- [ ] Monitor GitHub issues
- [ ] Respond to community feedback
- [ ] Plan v1.1.0 features based on usage

---

### Future Versions

**v1.1.0** (1-2 months after v1.0.0):
- Bug fixes from community feedback
- Phase 3: Intelligence Layer (auto-completion)
- Improved settings configurability

**v1.2.0** (3-4 months after v1.0.0):
- Phase 4: Visual Tools (panels, navigation)
- Mobile support
- Performance optimizations

**v2.0.0** (6+ months after v1.0.0):
- Advanced features (multi-file campaigns, etc.)
- Third-party integrations
- Custom snippet system

---

## Project Timeline

### Week 1-2: Foundation
- [x] Project setup
- [ ] Basic plugin structure
- [ ] Settings interface
- [ ] Single-symbol commands

### Week 3-4: Core Notation
- [ ] Multi-line patterns
- [ ] Tag snippets
- [ ] Hotkey configuration
- [ ] Phase 1 testing

### Week 5-6: Templates
- [ ] Campaign header
- [ ] Session header
- [ ] Scene marker
- [ ] Code block wrapper
- [ ] Phase 2 testing

### Week 7: Testing & Polish
- [ ] Integration testing
- [ ] Documentation
- [ ] Beta preparation

### Week 8-9: Beta Period
- [ ] Recruit testers
- [ ] Collect feedback
- [ ] Bug fixes

### Week 10: Release
- [ ] Final testing
- [ ] Release preparation
- [ ] Community plugin submission

**Estimated Total**: 10 weeks to MVP release

---

## Success Metrics

### Development Metrics
- [ ] 0 critical bugs at release
- [ ] <2 known minor bugs at release
- [ ] 80%+ test coverage
- [ ] All commands respond < 50ms

### User Metrics (3 months post-release)
- [ ] 100+ active installations
- [ ] 4.0+ star rating (if applicable)
- [ ] <5% uninstall rate
- [ ] Positive community feedback

### Adoption Metrics
- [ ] Feature usage: 80%+ users use single-symbol commands
- [ ] Feature usage: 60%+ users use templates
- [ ] 50%+ reduction in notation typing time (user survey)

---

## Risk Management

### Technical Risks

**Risk**: Editor API changes in Obsidian updates  
**Mitigation**: Follow Obsidian dev announcements, test against beta versions

**Risk**: Performance issues with large files  
**Mitigation**: Implement caching, debouncing, lazy loading

**Risk**: Hotkey conflicts with other plugins  
**Mitigation**: Make all hotkeys optional, document conflicts

### Project Risks

**Risk**: Scope creep delaying MVP  
**Mitigation**: Strict adherence to Phase 1 & 2 only for v1.0.0

**Risk**: Low user adoption  
**Mitigation**: Active community engagement, clear documentation

**Risk**: Competing plugins emerge  
**Mitigation**: Focus on Lonelog-specific features, quality over quantity

---

## Next Steps

**Immediate Actions** (this week):
1. [ ] Set up development environment
2. [ ] Initialize project structure
3. [ ] Implement basic plugin skeleton
4. [ ] Create first command (insert action symbol)
5. [ ] Test in local vault

**This Month**:
- Complete Phase 1 (Core Notation)
- Begin Phase 2 (Templates)
- Write initial documentation

**Next Month**:
- Complete Phase 2
- Begin testing and beta program
- Prepare for release

---

**Status**: Ready to begin development  
**Next Milestone**: Phase 1 Complete (Week 4)  
**Target Release**: Week 10

