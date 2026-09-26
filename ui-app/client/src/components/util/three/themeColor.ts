import { themeExtractor } from '../../../context/StoreContext';
import { derivePalette, schemeThemeColor, type ScenePalette } from './palette';

/**
 * Resolve a colour property that may reference theme variables.
 *
 * Lives here, at the component boundary, rather than inside sceneRuntime:
 * that module must not import StoreContext, or
 * components/index -> ShaderBackground -> sceneRuntime -> StoreContext ->
 * ThemeExtractor -> components/index becomes a cycle, and its unit tests
 * would drag in the entire component tree.
 *
 * Two syntaxes reach a colour property and they resolve differently:
 *
 *  - `Theme.colorOne` as an EXPRESSION is resolved by useDefinition before the
 *    component ever sees it, so it arrives here already a value -- except that
 *    ThemeExtractor returns the live theme's entry verbatim, so an entry whose
 *    own value is `<colorTwo>` arrives unresolved. That is what this fixes.
 *  - `<colorOne>` written as a literal is stylesheet syntax. Nothing upstream
 *    touches it, so without this it would reach three and render as white.
 *
 * Both end up going through the same recursive resolution.
 */
export function resolveThemeColor(value: string | undefined): string | undefined {
	if (!value || typeof value !== 'string') return value;
	if (!value.includes('<')) return value;

	const resolved = themeExtractor.resolveValue(value);
	// processStyleValueWithFunction turns an unknown variable into the empty
	// string. Returning that would silently blank the colour and let the
	// preset's own value be overwritten with nothing, so hand back undefined
	// and let the caller fall through to the preset default instead.
	return resolved.trim() ? resolved : undefined;
}

/** Resolve several at once, preserving position. */
export const resolveThemeColors = (values: Array<string | undefined>): Array<string | undefined> =>
	values.map(resolveThemeColor);

/**
 * The palette a colour scheme resolves to, or undefined to leave the scene's
 * own colours alone.
 *
 * Undefined is returned for three different situations on purpose, because the
 * caller's response to all three is the same and it is the right one: keep what
 * the preset chose. The scheme is `_preset`; the theme has nothing under that
 * variable; or the theme's value is a colour `parseColor` cannot read.
 */
export function schemePalette(scheme: string | undefined): ScenePalette | undefined {
	const variable = schemeThemeColor(scheme);
	if (!variable) return undefined;
	return derivePalette(resolveThemeColor(variable));
}

/**
 * A colour property, the scheme's colour, or nothing -- in that order.
 *
 * The author's own value always wins. A scheme is a default, not an override:
 * somebody who typed a colour into the panel and then picked a scheme expects
 * to keep their colour, and silently discarding it is the kind of thing that
 * reads as the colour field being broken.
 */
export function colorOr(explicit: string | undefined, fromScheme: string | undefined) {
	const resolved = resolveThemeColor(explicit);
	return resolved && resolved.trim() ? resolved : fromScheme;
}
