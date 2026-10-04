import {
	STORE_PATH_APP,
	STORE_PATH_SELECTED_THEME,
	STORE_PATH_THEME_PATH,
	STORE_PATH_USER_THEME,
} from '../constants';
import { getDataFromPath, setData } from '../context/StoreContext';
import {
	currentAppCode,
	fetchThemeVariables,
	pageThemeName,
	resolveThemeName,
	swapThemeStylesheet,
	writeThemeCookie,
	writeThemePersonalization,
} from './themeSelection';

/**
 * Deliberately separate from ./themeSelection: this needs the store, and
 * themeSelection is in index.tsx's static import graph where a StoreContext
 * import would break the pre-mount store seeding. See the note at the top of
 * that file. Everything here is only reachable from the App chunk.
 */

/** Counts applies, so a slow one finishing after a newer one does not win. */
let applySequence = 0;

/**
 * Put a theme on the running app without remembering it anywhere.
 *
 * The order matters. The stylesheet is fetched and fully loaded first, and only
 * then do the variables change, so the app never paints one theme's variables
 * against another's CSS.
 */
async function applyTheme(name: string): Promise<boolean> {
	const sequence = ++applySequence;
	const variables = await fetchThemeVariables(name);
	if (sequence !== applySequence) return false;
	await swapThemeStylesheet(name);
	if (sequence !== applySequence) return false;

	setData(STORE_PATH_THEME_PATH, variables ?? {});
	setData(STORE_PATH_SELECTED_THEME, name);
	return true;
}

/**
 * Switch the running app to a theme, and remember the choice.
 *
 * Returns the theme actually applied, which is not always the one asked for: a
 * name that is not in the app's list falls back to the default rather than
 * failing.
 */
export async function selectTheme(name: string): Promise<string | undefined> {
	const application = getDataFromPath(STORE_PATH_APP, []);
	// The application is passed so a domain-mapped host, whose URL carries no app
	// code, still knows which app it is remembering the choice for.
	const appCode = currentAppCode(application);

	const resolved = resolveThemeName(application, { requested: name });
	if (!resolved) return undefined;

	setData(STORE_PATH_USER_THEME, resolved);
	await applyTheme(resolved);

	writeThemeCookie(appCode, resolved);
	await writeThemePersonalization(appCode, resolved);

	return resolved;
}

/**
 * The theme a page should wear: the one it names in `properties.theme`, else the
 * visitor's own. Undefined when the app lists no themes.
 */
export function themeForPage(pageDefinition: any): string | undefined {
	const application = getDataFromPath(STORE_PATH_APP, []);
	return (
		pageThemeName(application, pageDefinition) ??
		getDataFromPath(STORE_PATH_USER_THEME, []) ??
		getDataFromPath(STORE_PATH_SELECTED_THEME, [])
	);
}

/** True while the page is waiting for its theme to replace the one showing. */
export function pageThemePending(pageDefinition: any): boolean {
	const wanted = themeForPage(pageDefinition);
	return !!wanted && wanted !== getDataFromPath(STORE_PATH_SELECTED_THEME, []);
}

/**
 * Bring the app to the theme a page wants: its own if it names one, else back to
 * the visitor's. Nothing is remembered, so the visitor's choice survives a visit
 * to a page that overrides it.
 */
export async function applyPageTheme(pageDefinition: any): Promise<void> {
	if (!pageThemePending(pageDefinition)) return;
	await applyTheme(themeForPage(pageDefinition)!);
}
