import tseslint from 'typescript-eslint';
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						'eslint.config.js',
						'manifest.json'
					]
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.json']
			},
		},
	},
	...obsidianmd.configs.recommended,
	{
		plugins: {
			obsidianmd,
		},
		rules: {
			// Allow game-specific acronyms/proper nouns (NPC, PC, HP, GME, Lonelog, etc.)
			"obsidianmd/ui/sentence-case": ["error", {
				enforceCamelCaseLower: true,
				ignoreWords: ["Lonelog", "NPC", "PC", "HP", "GME", "Ironsworn", "Mythic", "Loner"],
				ignoreRegex: ["^NPCs?$"],
			}],
		},
	},
	globalIgnores([
		"node_modules",
		"dist",
		"esbuild.config.mjs",
		"eslint.config.js",
		"version-bump.mjs",
		"versions.json",
		"main.js",
	]),
);
