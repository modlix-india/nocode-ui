/**
 * Keeps a signed-in visitor from seeing the page drawn for somebody else.
 *
 * The server draws `#app` for anonymous requests only, and a browser's page load never says who
 * is signed in: the session lives in `localStorage.AuthToken`, which a document request does not
 * carry. So every signed-in refresh or full navigation (and the landing after Login, which leaves
 * through `location.replace`) is answered with the ANONYMOUS drawing of that URL. On a page that
 * needs a permission that is the app's login page substituted in (leadzump: its marketing home),
 * on an invite link it is the state the page shows before its data loads. The client then sees
 * the token, does not hydrate (index.tsx), and replaces it all with the real page once the
 * definitions are fetched: the wrong page flashes for as long as that takes (QA-0504, 0507, 0508).
 *
 * The browser decides before `#app` is parsed: the flag script (inline, ahead of `#app`) marks
 * the document when the client is going to render rather than hydrate, the critical CSS hides
 * `#app` while it is marked, and the drop script (right after `#app`) empties the drawing and
 * clears the mark. A signed-in visitor then gets what every visitor got before server rendering:
 * an empty `#app` the client fills. A signed-out visitor is untouched and hydrates as before.
 *
 * "Going to render" mirrors index.tsx: a token under the key it reads (`designMode_AuthToken`
 * with `debug` in the query, as `isDebugMode` decides), or a URL that brings a session in before
 * the first render (`ott`: SSO beacon arrival; `sessionId`: social sign-in return).
 */

export const SIGNED_IN_ATTR = 'data-mlx-session';

/** Hides the drawing between the flag and the drop script, so it is never painted. */
export const SIGNED_IN_CSS = `html[${SIGNED_IN_ATTR}] #app { visibility: hidden; }`;

/** Inline, before `#app`. Storage can throw (blocked site data): then nothing is marked. */
export const SIGNED_IN_FLAG_SCRIPT =
	`try{var q=location.search,k=q.indexOf('debug')!=-1?'designMode_AuthToken':'AuthToken';` +
	`if(localStorage.getItem(k)||/[?&](ott|sessionId)=/.test(q))` +
	`document.documentElement.setAttribute('${SIGNED_IN_ATTR}','')}catch(e){}`;

/**
 * Inline, straight after `#app`. Empties it only when it holds a server drawing (`_rendered`),
 * which also keeps the client off its hydration-only paths (the bootstrap width, the used
 * component list), exactly as on a page that was never drawn. The mark is cleared whatever happens.
 */
export const SIGNED_IN_DROP_SCRIPT =
	`<script>(function(){var d=document.documentElement;if(!d.hasAttribute('${SIGNED_IN_ATTR}'))return;` +
	`try{var a=document.getElementById('app');if(a&&document.getElementById('_rendered'))a.textContent=''}` +
	`finally{d.removeAttribute('${SIGNED_IN_ATTR}')}})()</script>`;
