/**
 * Leave the current page, replacing it in history.
 *
 * A one-line wrapper with a reason: jsdom's `window.location` is neither redefinable nor
 * spyable, so a function that calls `window.location.replace` directly has an untestable
 * branch. Routing the navigation through a module gives the tests a seam, the same reason
 * `absoluteDestination` is its own module rather than a helper inside `Login.ts`.
 *
 * Its own file, NOT an export from a `functions/*.ts` file: `functions/all.ts` re-exports
 * every name in that directory and `functions/index.ts` calls `new` on each one.
 */
export function replaceLocation(url: string): void {
	window.location.replace(url);
}
