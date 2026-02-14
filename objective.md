# Lonelog Plugin for Obsidian - Project Objectives

## Project Overview

**Purpose**: Create an Obsidian plugin that streamlines solo TTRPG journaling using the Lonelog notation system (v1.0.0), providing configurable shortcuts for fast notation entry without automating game mechanics.

**Target Users**: Solo TTRPG players who use Obsidian for campaign journals and want to reduce typing overhead while maintaining full control over their notation.

**Core Philosophy**: Assist, don't automate. The plugin provides shortcuts and templates for notation entry but leaves all game mechanics (dice rolling, oracle queries) to the player's external tools. This is a typing assistant, not a game engine.

---

## Problem Statement

When playing solo TTRPGs and logging with Lonelog notation, players face several friction points:

1. **Symbol entry overhead**: Typing `@`, `=>`, `->`, `[N:Name|tags]` repeatedly slows down play
2. **Template setup**: Starting new sessions/scenes requires copying template structure
3. **Tag consistency**: Easy to mistype NPC names or forget established tags
4. **Reference lookup**: Finding previous NPC mentions or thread status requires manual search
5. **Progress tracking**: Manually updating clocks/tracks/timers is repetitive
6. **Navigation**: Jumping between scenes and sessions in long campaigns is clunky

---

## Core Features (MVP)

### 1. Quick Notation Insertion
**Problem**: Core symbols requi (Core Feature)
**Problem**: Core symbols require multiple keystrokes or special character menus
**Solution**: Configurable keyboard shortcuts to insert notation patterns instantly

**Implementation**:
- **Single-line insertions** (insert at cursor with proper spacing):
  - Action: `@ ` 
  - Question: `? `
  - Dice roll: `d: `
  - Result: `-> `
  - Consequence: `=> `
  
- **Multi-line pattern templates** (insert structured blocks):
  - Action sequence:
    ```
    @ [action]
    d: [roll] -> [outcome]
    => [consequence]
    ```
  - Oracle sequence:
    ```
    ? [question]
    -> [answer] with smart defaults

**Implementation**:
- **Campaign header**: Insert YAML frontmatter template
  - Prompts for: title, ruleset, genre, player name
  - Auto-fills: start_date (today), last_update (today)
  - User completes remaining fields manually
  
- **Session header**: Insert session structure
  - Auto-detects next session number (scan for `## Session N`)
  - Auto-fills current date
  - Leaves Duration, Recap, Goals for manual entry
  
- **Scene marker**: Insert scene heading
  - Auto-detects next scene number in current session
  - Prompts for scene context (location, time)
  - Formats as `### S# *[context]*`
  
- **Code block wrapper**: Toggle to wrap/unwrap selection in code fence
  - Select notation text → command wraps in ` ```lonelog ` fence
  - Useful for ensuring proper markdown rendering
  - Event/Clock: `[E:Name /]` (cursor between space and slash)
  - Track: `[Track:Name /]`
  - Thread: `[Thread:Name|Open]`
  - PC: `[PC:Name|]`
  - Reference: `[#N:Name]`
  - Timer: `[Timer:Name ]`

- **Conn oracle commands:
  - `/oracle yes-no` (simple)
  - `/oracle mythic [likelihood]`
  - `/oracle fate` (Yes/No/And/But)
- Results insert directly into notation format:
  ```
  d: 2d6=8 vs TN 7 -> Success
  ```
  or
  ```
  -> Yes, but... (d6=4)
  ```
- Modal/popup for more complex rolls (multiple dice, modifiers)

### 4. Tag Auto-completion
**Problem**: Retyping NPC names and tags leads to inconsistency
**Solution**: Auto-complete suggestions from previously defined tags

**Implementation**:
- Parse current file for established tags
- Suggest NPC/Location/Thread names when typing `[N:`, `[L:`, etc.
- Show existing tags when referencing (e.g., `[N:Jonah|` shows `friendly`, `wounded`)
- Suggest reference format `[#N:Name]` for established elements

---

## Enhanced Features (Post-MVP)

### 5. Progress Tracker Panel
**Problem**: Updating clocks/tracks/timers manually is tedious
**Solution**: Visual panel to view and update all progress elements

**Implementation**:
- Sidebar panel listing all active progress elements:
  - Clocks (e.g., `[Clock:Alert 2/6]`)
  - Tracks (e.g., `[Track:Investigation 4/10]`)
  - Timers (e.g., `[Timer:Dawn 3]`)
- Click to increment/decrement
- Updates notation in file automatically
- Visual representation (progress bars, pie charts)

### 6. Thread & Element Browser
**Problem**: Finding previous mentions of NPCs, threads, locations requires search
**Solution**: Dedicated browser panel with quick navigation

**Implementation**:
- Sidebar panel organized by type:
  - NPCs (with current status tags)
  - 4ocations (with descriptions)
  - Threads (with Open/Closed state)
  - Events/Clocks
- Click to jump to first/last mention
- Show tag history (how tags changed over time)
- Quick reference without leaving current scene

### 6. Scene Navigation
**Problem**: Jumping between scenes in long logs is clunky
**Solution**: Outline-style navigation for scenes

**Implementation**:
- Scene outline in sidebar (S1, S2, S3, etc.)
- Sh5w scene context in outline (location, time)
- Click to jump to scene
- Support for complex numbering (S5a, T1-S3, S7.2)

### 7. Statistics Dashboard
**Problem**: No overview of campaign progress
**Solution**: Visual dashboard showing campaign metrics

**Implementation**:
- Session count and total play time
- Scenes per session (average, total)
- Most referenced NPCs/locations
- Thread completion rate (Open vs Closed)
- Dice roll statistics (success rate, distribution)
- Timeline view of sessions

### 8. Notation Validation
**Problem**: Easy to make syntax mistakes that break searchability
**Solution**: Lint-style warnings for malformed notation

**Implementation**:
- Highlight incomplete sequences (action without resolution)
- Warn about unclosed tags `[N:Name|incomplete`
- Flag mismatched clock numbers `[Clock:Alert 7/6]`
- Suggest corrections in real-time

### 9. Export & Sharing
**Problem**: Sharing logs with others or archiving
**Solution**: Export to clean formats

**Implementation**:
- Export to clean markdown (preserve headers, remove internal IDs)
- Export to PDF with formatting
- Export statistics/summaries
- Generate session summaries (AI-assisted)

---

## Technical Architecture

### Plugin Structure
```
src/
  main.ts              # Plugin lifecycle, command registration
  commands/
    notation.ts        # Insert notation commands
    templates.ts       # Session/scene template commands
  ui/
    progress-view.ts   # Progress tracker sidebar
    thread-view.ts     # Thread/element browser
    stats-view.ts      # Statistics dashboard
  core/
    parser.ts          # Parse Lonelog notation from files
    tracker.ts         # Track clocks, timers, threads
    auto-complete.ts   # Tag auto-completion logic
  settings.ts          # Plugin settings interface
  types.ts             # TypeScript interfaces
```

### Key Technical Decisions

**Parsing Strategy**:
- Regex-based parsing for notation patterns
- Extract tags, progress elements, scenes
- Cache results to avoid re-parsing on every keystroke
- Update cache on file change events

**State Management**:
- Track active file's notation elements
- Scan vault for related files (campaign-wide tracking)
- Persist settings using Obsidian's `loadData`/`saveData`

**Editor Integration**:
- Use `editor.replaceRange()` for insertions
- Register code block language `lonelog` for syntax highlighting
- Provide auto-complete via `EditorSuggest` API

**Performance**:
- Debounce parsing on file edits
- Index notation elements in background
- Lazy-load panels (only parse when opened)

---

## User Workflows

### Starting a New Campaign
1. User creates new note
2. Command: "Lonelog: Insert Campaign Header"
3. Modal prompts for title, ruleset, genre, etc.
4. YAML frontmatter + campaign heading inserted
5. Ready to start Session 1

### Playing a Session
1. Command: "Lonelog: New Session"
   - Auto-increments session number
   - Fills in current date
2. Command: "Lonelog: New Scene" 
   - Inserts scene marker with auto-increment
3. During play:
   - Shortcuts insert notation (hotkeys or command palette)
   - `/roll` for dice, inserts results directly
   - Auto-complete suggests NPC names as typing
4. Progress panel shows clocks/timers updating in real-time

### Reviewing Past Sessions
1. Open thread browser panel
2. Click NPC name → jumps to first mention
3. View NPC tag history (how status changed)
4. Check statistics dashboard for campaign overview

---

## Development Phases

### Phase 1: Core Notation (MVP)
**Goal**: Make basic notation entry faster
**Features**:
- Quick insertion commands (symbols + patt through shortcuts
**Features**:
- Quick insertion commands for all core symbols
- Multi-line pattern templates (action sequence, oracle sequence)
- Tag snippet insertions with smart cursor positioning
- Configurable keyboard shortcuts

**Success Criteria**: Player can insert any notation element with 1-2 keystrokes instead of typing manually

### Phase 2: Intelligence Layer
**Goal**: AddTemplates & Structure
**Goal**: Streamline session/scene setup
**Features**:
- Campaign header insertion (YAML frontmatter)
- Session header insertion (auto-numbering, date)
- Scene marker insertion (auto-numbering)
- Code block wrapper toggle

**Success Criteria**: Starting a new session takes 10 seconds instead of 2 minute
---

### Phase 3: Intelligence Layer
**Goal**: Add smart assistance
**Features**:
- Tag auto-completion
- Notation parsing (extract NPCs, threads, progress)
- Tag reference suggestions

**Success Criteria**: Plugin recognizes and suggests established elements

---

### Phase 5: Polish & Extensions
**Goal**: Professional features
**Features**:
- Statistics dashboard
- Notation validation/linting
- Export options
**Success Criteria**: Player can navigate complex campaigns visually

---

### Phase 4: Polish & Extensions
**Goal**: Professional features
**Features**:
- Statistics dashboard
- Notation validation
- Export optCampaign Template**: Customize YAML frontmatter fields
- **Auto-increment Scenes**: Toggle automatic scene numbering
- **Scene Context Prompt**: Auto-prompt for scene context or skip
- **Code Block Behavior**: Auto-wrap notation in code fences or manual
- **Hotkeys**: Configure keyboard shortcuts for all insertion commands
- **Cursor Positioning**: Smart positioning after insertions (e.g., inside tag brackets)
- **Panel Display**: Choose which sidebars to show by default
- **Tag Suggestions**: Toggle auto-complete behavior
- **Snippet Customization**: Edit template text for multi-line patterns
## Settings & Configuration

### Plugin Settings Tab
- **Default Template**: Choose campaign header template
- **Auto-increment Scenes**: Toggle auto50%+ (fewer keystrokes)
- Users report staying "in flow" during play
- Players prefer plugin shortcuts over manual typing

**Quality**:
- No conflicts with Obsidian markdown rendering
- Fast insertion (< 50ms for any command)
- Stable (no data loss, reliable cursor positioning)
- Hotkeys don't conflict with default Obsidian shortcuts

## Success Metrics

**Adoption**:
- Plugin reduces notation entry time by 40%+
- Users report staying "in flow" during play
- High satisfaction with dice rolling integration

**Quality**:summaries, NPC descriptions from notation
- **Multi-file Campaigns**: Link and track across multiple notes
- **Collaborative Play**: Share notation conventions with others
- **Mobile Support**: Optimize shortcuts for Obsidian mobile app
- **Graph View Integration**: Visualize NPC/location/thread relationships
- **Custom Snippets**: User-defined pattern templates
- **Macro Recording**: Record and replay complex insertion sequences

### Integration Opportunities
- **Dataview Plugin**: Query notation elements with dataview syntax
- **Fantasy Calendar**: Link sessions to in-world dates
- **Dice Roller Plugin**: Compatible—players use external dice plugins, paste results
- **TTRPG Statblocks**: Link NPCs to statblock plugin
- **Templater**: Advanced template logic for power users
### Advanced Features (v2.0+)
- **AI Integration**: Generate scene prompts, NPC descriptions
- **Multi-file Campaigns**: Link and track across multiple notes
- **Custom Oracle Builders**: Let users define their own oracle tables
- **Collaborative Play**: Share notation with others (online sync)
- **Mobile Support**: Optimize for Obsidian mobile app
- **Roll dice** or generate oracle results (player uses external tools)
- **Automate game mechanics** (this is a typing assistant, not a game engine)
- Replace external VTTs or character sheet managers
- Force users to use plugin features (manual notation always works)
- Lock users into proprietary formats (pure markdown remains valid)
- Auto-generate fiction (player creates all story content
- **Dataview Plugin**: Query notation elements with dataview
- **Fantasy Calendar**: Link sessions to in-world dates
- **Dice Roller Plugin**: Compatible with existing dice plugins
- **TTRPG Statblocks**: Link NPCs to statblock plugin

---

## Non-Goals

**What This Plugin Should NOT Do**:
- Replace external VTTs or character sheet managers
- Force users to use plugin features (manual notation still works)
- Lock users into proprietary formats (pure markdown remains valid)
- Implement full game rules (this is notation, not a game engine)
- ADesign Principles

1. **Assist, don't automate**: Shortcuts for typing, not game mechanics
2. **Never generate content**: Player provides all dice results, oracle answers, fiction
3. **Configurable everything**: Users customize hotkeys, templates, cursor behavior
4. **Degradable**: Works alongside manual notation (hybrid usage is fine)
5. **Pure markdown**: All output is valid Lonelog markdown
6. **Fast & unobtrusive**: Commands execute instantly, don't interrupt flow

## Questions to Resolve

- What are the most frequently typed patterns to prioritize?
- Should cursor jump to next logical position after insertion?
- Default hotkeys vs. require user configuration?
- How to handle users who mix Lonelog with other note styles?
- Should templates be fully customizable or use standard Lonelog formate)
3. **Playtest**: Use plugin for actual solo campaign
4. **Iterate based on real use**: Adjust features based on friction points
5. **Release & gather feedback**: Share with Lonelog community
6. **Expand to Phase 2+**: Build intelligence and visual layers

---

## Questions to Resolve

- Should the plugin enforce notation standards, or just assist?
- How much automation is helpful vs removing player agency?
- Should progress tracking be automatic or manual-with-assistance?
- What's the right balance between commands vs. hotkeys vs. UI panels?
- Should the plugin support non-standard notation extensions?
- How to handle users who mix Lonelog with other note styles?

---

## Resources

- **Lonelog Specification**: lonelog.md (v1.0.0)
- **Obsidian API**: https://docs.obsidian.md/
- **Community**: r/solorpgplay, r/Solo_Roleplaying
- **Similar Projects**: Dice Roller plugin, TTRPG Statblocks plugin
- **Inspiration**: Valley Standard notation system

---

**Last Updated**: February 14, 2026
**Status**: Planning Phase
**Maintainer**: [Your Name]
