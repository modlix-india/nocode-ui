import { STORE_PATH_APP, STORE_PATH_SELECTED_THEME, STORE_PATH_THEME_PATH } from '../constants';
import { getDataFromPath, setData } from '../context/StoreContext';
import {
	currentAppCode,
	fetchThemeVariables,
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

/**
 * Switch the running app to a theme, and remember the choice.
 *
 * The order matters. The stylesheet is fetched and fully loaded first, and only
 * then do the variables change, so the app never paints one theme's variables
 * against another's CSS.
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

	const variables = await fetchThemeVariables(resolved);
	await swapThemeStylesheet(resolved);

	setData(STORE_PATH_THEME_PATH, variables ?? {});
	setData(STORE_PATH_SELECTED_THEME, resolved);

	writeThemeCookie(appCode, resolved);
	await writeThemePersonalization(appCode, resolved);

	return resolved;
}
