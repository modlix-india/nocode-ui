/**
 * Which component style blocks are emitted before anything has rendered.
 *
 * `AppStyle` used to emit the CSS of every registered component on every page.
 * Measured on a deployed marketing page: 81 style blocks, of which 62 belonged
 * to components the page never rendered -- 374KB of CSS parsed for nothing,
 * PageEditor (89KB), Prompt (61KB) and BlueprintEditor (40KB) among them.
 *
 * The set of components a page actually uses cannot be known up front. A page
 * reached through a shell, a SubPage (whose `pageName` may be bound to an
 * expression, and which may point into another application), or a repeater
 * driven by fetched data all decide what they render at runtime. So nothing
 * tries to enumerate it: `usedComponents` reports what has actually rendered,
 * and the style for a component is added when it is first seen.
 *
 * This floor is what covers the gap before the first render, and what makes a
 * miss survivable. A component whose style is missing for a frame looks wrong;
 * a PAGE whose frame and typography are missing looks broken, so the handful
 * that almost every page is built from are always present.
 */
export const ALWAYS_STYLED = new Set<string>([
	'Grid',
	'Text',
	'Button',
	'Image',
	'Link',
	'Popup',
	'Page',
	'SubPage',
]);

/**
 * The style blocks to emit, given what has rendered so far.
 *
 * Monotonic on purpose: a name is never dropped once added. A SubPage arriving
 * after first paint, or a repeater resolving its data, must be able to ADD to
 * this set without anything already on screen losing its styling mid-view.
 */
export function styledComponents(used: Iterable<string>, previous?: Set<string>): Set<string> {
	const next = new Set(previous ?? ALWAYS_STYLED);
	for (const name of ALWAYS_STYLED) next.add(name);
	for (const name of used) if (name) next.add(name);
	return next;
}

/** True when `next` holds something `previous` did not, so a re-render is warranted. */
export function hasNewNames(previous: Set<string>, next: Set<string>): boolean {
	if (next.size !== previous.size) return true;
	for (const n of next) if (!previous.has(n)) return true;
	return false;
}
