/**
 * The page a visitor gets when the URL names nothing and the app has no `notFoundPage` of its
 * own (or there is no app at all). Answered with 404.
 *
 * Self-contained on purpose: no client bundle, no app styles, no fonts and no script, so it
 * needs nothing from the CDN or the app's CSP and cannot fail the way the page it replaces did.
 * It used to be the app shell with a red error box naming the missing page, which is what a
 * crawler indexed and what a visitor saw.
 */

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

const STYLE = `
:root { --bg: #f7f8fb; --card: #ffffff; --text: #1b1f2a; --muted: #5b6475; --accent: #4f46e5; --accent-text: #ffffff; --line: #e4e7ee; }
@media (prefers-color-scheme: dark) {
	:root { --bg: #0f1218; --card: #171b23; --text: #eef0f5; --muted: #a3abbb; --accent: #818cf8; --accent-text: #0f1218; --line: #262c38; }
}
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; }
body { background: var(--bg); color: var(--text); font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; padding: 24px 16px; }
main { width: 100%; max-width: 440px; background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 40px 32px; text-align: center; }
.code { font-size: 56px; font-weight: 700; letter-spacing: -0.02em; color: var(--accent); margin: 0; line-height: 1; }
h1 { font-size: 22px; margin: 16px 0 8px; }
p { color: var(--muted); margin: 0 0 28px; }
a.home { display: inline-block; background: var(--accent); color: var(--accent-text); text-decoration: none; font-weight: 600; padding: 10px 20px; border-radius: 10px; }
a.home:focus-visible { outline: 3px solid var(--text); outline-offset: 2px; }
footer { margin-top: 32px; font-size: 13px; color: var(--muted); }
footer a { color: inherit; }
`;

/** The whole document. `homeHref` is where "Go to the home page" leads: `/`, or the app's prefixed root. */
export function modlixNotFoundHtml(homeHref: string): string {
	return `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="robots" content="noindex">
		<title>Page not found</title>
		<style>${STYLE}</style>
	</head>
	<body>
		<main>
			<p class="code">404</p>
			<h1>We could not find that page</h1>
			<p>The link may be old, or the page may have moved. Check the address, or start again from the home page.</p>
			<a class="home" href="${escapeHtml(homeHref)}">Go to the home page</a>
			<footer>Built with <a href="https://www.modlix.com" rel="noopener">Modlix</a></footer>
		</main>
	</body>
</html>`;
}
