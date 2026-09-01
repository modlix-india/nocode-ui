/**
 * Combos the browser or the OS claims before the page ever sees them.
 *
 * BLOCKED: the event never arrives, or arrives un-cancellable. Binding one of these
 *          produces a shortcut that silently does nothing.
 * RISKY:   cancellable with preventDefault, but it hijacks a well known browser
 *          function. Allowed, with a warning at authoring time.
 */

import { isApplePlatform, parseCombo, type Combo } from './comboUtil';

export type ReservedLevel = 'BLOCKED' | 'RISKY';

export interface ReservedInfo {
	level: ReservedLevel;
	reason: string;
}

/** Specs written with `Mod`, expanded per platform at lookup time. */
const BLOCKED_SPECS: Array<[string, string]> = [
	['Mod+W', 'The browser closes the tab.'],
	['Mod+T', 'The browser opens a new tab.'],
	['Mod+N', 'The browser opens a new window.'],
	['Mod+Shift+W', 'The browser closes the window.'],
	['Mod+Shift+T', 'The browser reopens the last closed tab.'],
	['Mod+Shift+N', 'The browser opens a private window.'],
	['Mod+Tab', 'The browser or the OS switches tabs.'],
	['Mod+Shift+Tab', 'The browser or the OS switches tabs.'],
	['Alt+Tab', 'The OS switches applications.'],
	['Mod+Shift+I', 'The browser opens developer tools.'],
	['Mod+Shift+J', 'The browser opens the developer console.'],
	['Mod+Alt+I', 'The browser opens developer tools.'],
	['Mod+Alt+J', 'The browser opens the developer console.'],
	['F11', 'The browser toggles full screen.'],
	['F12', 'The browser opens developer tools.'],
];

const BLOCKED_APPLE_ONLY: Array<[string, string]> = [
	['Mod+Q', 'The OS quits the browser.'],
	['Mod+M', 'The OS minimises the window.'],
	['Mod+H', 'The OS hides the application.'],
	['Mod+Alt+I', 'The browser opens developer tools.'],
];

const BLOCKED_OTHER_ONLY: Array<[string, string]> = [
	['Ctrl+Shift+Escape', 'The OS opens the task manager.'],
];

/**
 * Claimed by the platform's own cheat sheet overlay, which listens in the capture
 * phase at window level and stops propagation before the registry sees the key.
 */
const BLOCKED_BY_PLATFORM: Array<[string, string]> = [
	['Mod+/', 'Modlix opens the keyboard shortcuts list.'],
	// A real Shift+/ press reports key '?' on a US layout, so cover both spellings.
	['Shift+/', 'Modlix opens the keyboard shortcuts list.'],
	['Shift+?', 'Modlix opens the keyboard shortcuts list.'],
	['?', 'Modlix opens the keyboard shortcuts list.'],
];

const RISKY_SPECS: Array<[string, string]> = [
	['Mod+S', 'The browser normally saves the page.'],
	['Mod+P', 'The browser normally prints the page.'],
	['Mod+F', 'The browser normally opens find in page.'],
	['Mod+D', 'The browser normally bookmarks the page.'],
	['Mod+O', 'The browser normally opens a file.'],
	['Mod+L', 'The browser normally focuses the address bar.'],
	['Mod+R', 'The browser normally reloads the page.'],
	['Mod+U', 'The browser normally shows the page source.'],
	['Mod+0', 'The browser normally resets the zoom level.'],
	['Mod+1', 'The browser normally jumps to the first tab.'],
	['Mod+2', 'The browser normally jumps to a tab by number.'],
	['Mod+3', 'The browser normally jumps to a tab by number.'],
	['Mod+4', 'The browser normally jumps to a tab by number.'],
	['Mod+5', 'The browser normally jumps to a tab by number.'],
	['Mod+6', 'The browser normally jumps to a tab by number.'],
	['Mod+7', 'The browser normally jumps to a tab by number.'],
	['Mod+8', 'The browser normally jumps to a tab by number.'],
	['Mod+9', 'The browser normally jumps to the last tab.'],
	['Mod++', 'The browser normally zooms in.'],
	['Mod+-', 'The browser normally zooms out.'],
];

interface Tables {
	blocked: Map<Combo, string>;
	risky: Map<Combo, string>;
}

const tableCache = new Map<boolean, Tables>();

function tablesFor(apple: boolean): Tables {
	const cached = tableCache.get(apple);
	if (cached) return cached;

	const blocked = new Map<Combo, string>();
	const risky = new Map<Combo, string>();

	const addAll = (target: Map<Combo, string>, list: Array<[string, string]>) => {
		for (const [spec, reason] of list) {
			const combo = parseCombo(spec, apple);
			if (combo) target.set(combo, reason);
		}
	};

	addAll(blocked, BLOCKED_SPECS);
	addAll(blocked, apple ? BLOCKED_APPLE_ONLY : BLOCKED_OTHER_ONLY);
	addAll(blocked, BLOCKED_BY_PLATFORM);
	addAll(risky, RISKY_SPECS);

	const tables = { blocked, risky };
	tableCache.set(apple, tables);
	return tables;
}

/**
 * Classify an authored spec. Returns undefined when the combo is safe to bind,
 * which covers the idiomatic web-app set: Mod+K, Mod+J, Mod+E, Mod+B, Mod+Enter,
 * most Mod+Shift+letter pairs, bare '/', and Alt+letter.
 */
export function checkReserved(
	spec: string | undefined,
	apple?: boolean,
): ReservedInfo | undefined {
	const useApple = apple ?? isApplePlatform();
	const combo = parseCombo(spec, useApple);
	if (!combo) return undefined;

	const { blocked, risky } = tablesFor(useApple);

	const blockedReason = blocked.get(combo);
	if (blockedReason) return { level: 'BLOCKED', reason: blockedReason };

	const riskyReason = risky.get(combo);
	if (riskyReason) return { level: 'RISKY', reason: riskyReason };

	return undefined;
}
