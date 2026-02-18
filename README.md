# Lonelog Plugin for Obsidian

Streamline your solo TTRPG journaling with quick shortcuts for [Lonelog notation](https://zeruhur.itch.io/lonelog) - the standard notation system for solo RPG session logging.

## Features

### Syntax Highlighting (New in 1.0.0 ✓)

Beautiful, configurable syntax highlighting for Lonelog notation in both editor and reading modes:

- **Live Editor Highlighting** - Color-coded notation as you type in `lonelog` code blocks
- **Reading Mode Highlighting** - Rendered views with full syntax coloring
- **Customizable Colors** - Visual color picker and text input for all notation elements:
  - Action lines (`@`) - Default blue
  - Question lines (`?`) - Default purple
  - Dice rolls (`d:`) - Default green
  - Consequences (`=>`) - Default red
  - Result arrows (`->`) - Default yellow
  - Tags (`[N:...]`, `[Thread:...]`, etc.) - Default orange
- **Flexible Input** - Use color picker, hex values, color names, or CSS variables
- **Toggle Controls** - Enable/disable highlighting independently for editor and reading modes

### Phase 1: Core Notation (Implemented ✓)

Quick insertion commands for all Lonelog notation elements:

**Single-Symbol Commands:**
- `@` - Insert action symbol
- `?` - Insert question symbol  
- `d:` - Insert dice roll symbol
- `->` - Insert result symbol
- `=>` - Insert consequence symbol

**Multi-Line Patterns:**
- **Action Sequence** - Full action/roll/consequence template
- **Oracle Sequence** - Full question/answer/consequence template

**Tag Snippets:**
- **NPC Tag** - `[N:Name|]` with cursor positioned for editing
- **Location Tag** - `[L:Name|]`
- **Event/Clock** - `[E:Name 0/6]`
- **Track** - `[Track:Name 0/6]`
- **Thread** - `[Thread:Name|Open]`
- **PC Tag** - `[PC:Name|]`
- **Timer** - `[Timer:Name 0]`
- **Reference Tag** - `[#N:Name]`

## Installation

### Manual Installation (Development)

1. This plugin is in active development
2. Make sure the plugin is in your vault's `.obsidian/plugins/lonelog/` directory
3. Reload Obsidian
4. Enable "Lonelog" in Settings → Community Plugins

### From Community Plugins (Coming Soon)

Once released, search for "Lonelog" in Obsidian's Community Plugins.

## Usage

### Quick Start

1. Open any note in your vault
2. Press `Ctrl/Cmd + P` to open the command palette
3. Type "Lonelog" to see all available commands
4. Select a command to insert notation

### Configuring Shortcuts

Customize keyboard shortcuts for your most-used commands:

1. Go to Settings → Hotkeys
2. Search for "Lonelog"
3. Click the `+` icon next to any command to set a hotkey

**Suggested Hotkeys:**
- `Ctrl+Shift+A` - Insert action (@)
- `Ctrl+Shift+Q` - Insert question (?)
- `Ctrl+Alt+A` - Insert action sequence
- `Ctrl+Alt+O` - Insert oracle sequence

### Settings

Configure plugin behavior in Settings → Lonelog:

**Core Notation:**
- **Insert space after symbols** - Add automatic spacing after @ ? d: -> =>
- **Smart cursor positioning** - Jump cursor to optimal edit position in tags

**Templates:**
- **Auto-increment scene numbers** - Automatically detect and increment scene numbers
- **Prompt for scene context** - Show modal to enter scene context when inserting a scene marker

**Syntax Highlighting:**
- **Enable editor highlighting** - Toggle live preview syntax highlighting
- **Enable reading mode highlighting** - Toggle reading view syntax highlighting
- **Highlighting colors** - Customize colors for each notation element using:
  - Visual color picker (click to choose from palette)
  - Text input (hex codes like `#ff0000`, color names like `red`, rgba values, CSS variables)
  - Reset button to restore defaults

## Examples

### Using Single Symbols

```
@ Attack the guard
d: d20+5=18 vs AC 15 -> Success
=> The guard falls unconscious
```

### Using Action Sequence

Command inserts:
```
@ [action]
d: [roll] -> [outcome]
=> [consequence]
```

You type:
```
@ Sneak past the patrol
d: Stealth 6≥4 -> Success
=> I slip by unnoticed into the shadows
```

### Using Tag Snippets

Command inserts `[N:Name|]` with "Name" selected, you just type:
```
[N:Captain Torres|hostile|armed]
```

## What is Lonelog?

Lonelog is a standardized notation system for logging solo TTRPG sessions. It separates mechanics from fiction using simple symbols:

- `@` for player actions
- `?` for oracle questions
- `d:` for dice rolls
- `->` for results
- `=>` for consequences
- `[Type:Name|tags]` for persistent elements

Learn more: See [lonelog.md](lonelog.md) for the full specification

## Roadmap

### Phase 2: Templates & Structure (Implemented ✓)
- ✅ Session header with auto-numbering
- ✅ Scene marker with auto-numbering
- ✅ Code block wrapper
- Campaign header insertion

### Phase 3: Intelligence Layer (In Progress)
- Tag auto-completion from previous mentions
- Reference suggestions
- Notation parsing

### Phase 4: Visual Tools (Future)
- Progress tracker panel
- Thread/element browser
- Scene navigation

## Development

```bash
# Install dependencies
npm install

# Development build (watch mode)
npm run dev

# Production build
npm run build
```

## License

This plugin is licensed under [0-BSD License](LICENSE).

The Lonelog notation system is © 2025-2026 Roberto Bisceglie, licensed under CC BY-SA 4.0.

## Credits

- **Plugin Author**: Chris Hardiman
- **Lonelog System**: Roberto Bisceglie
- **Inspired by**: The Valley Standard notation system

---

*Happy solo adventuring!*
