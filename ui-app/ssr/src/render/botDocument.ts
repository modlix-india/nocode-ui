import type { KnownBot } from './bots.js';
import { SIGNED_IN_DROP_SCRIPT } from './signedInGuard.js';

/**
 * The document a crawler gets (PLAT-1545). A person's document carries the client's bootstrap
 * data (application, page and theme definitions, often over a megabyte) ahead of `#app`, so the
 * page's text starts a megabyte in, past what some AI crawlers read at all.
 *
 * - A bot that runs scripts (Googlebot, bingbot, Applebot) keeps everything, the bootstrap moved
 *   to just after `#app`: the text comes first and the page still hydrates. The client's scripts
 *   are `defer`, so they run after the whole document is parsed, bootstrap included.
 * - A bot that only reads the HTML (GPTBot, ClaudeBot, PerplexityBot, ...) gets no bootstrap, no
 *   `<style>` or image preload (React's, one per eager `<img>`) inside `#app` and no `#_rendered`
 *   mark: none of it is anything it reads. Should one
 *   run scripts after all, the client sees no mark, so it renders (not hydrates) over the drawing
 *   and loads the definitions itself, as it did before SSR.
 *
 * Everything else (head tags, JSON-LD, `<noscript>`, the script tags) is left as it is.
 */

const BOOTSTRAP = 'window.__APP_BOOTSTRAP__ = ';
const APP_OPEN = '<div id="app">';

/** The `window.__APP_BOOTSTRAP__ = ...;` statement: one line, as JSON.stringify writes no newline. */
function bootstrapStatement(html: string): { start: number; end: number } | undefined {
	const start = html.indexOf(BOOTSTRAP);
	if (start < 0) return undefined;
	const newline = html.indexOf('\n', start);
	return { start, end: newline < 0 ? html.length : newline };
}

/** Where `#app` ends: the signed-in drop script follows it straight away (htmlRenderer.ts). */
function appEnd(html: string): number {
	const open = html.indexOf(APP_OPEN);
	if (open < 0) return -1;
	return html.indexOf(SIGNED_IN_DROP_SCRIPT, open);
}

export function documentForBot(html: string, bot: Pick<KnownBot, 'runsScripts'>): string {
	const statement = bootstrapStatement(html);
	const end = appEnd(html);
	// Not the shape this was written for (an error page, the not found page): left alone.
	if (!statement || end < 0 || statement.start > end) return html;

	const before = html.slice(0, statement.start);
	const between = html.slice(statement.end, end);
	const after = html.slice(end);

	if (bot.runsScripts) {
		const bootstrap = html.slice(statement.start, statement.end);
		return `${before}${between}<script>${bootstrap}</script>\n\t\t${after}`;
	}

	const open = between.indexOf(APP_OPEN);
	const app = between
		.slice(open)
		.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '')
		.replace(/<link rel="preload" as="image"[^>]*>/g, '')
		.replace(/<div id="_rendered"[^>]*><\/div>/, '');
	return `${before}${between.slice(0, open)}${app}${after}`;
}
