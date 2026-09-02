import axios from 'axios';

/**
 * The editor's grant of the draft surface for the app it is editing.
 *
 * The preview canvases cannot reach the draft surface the way the editor itself
 * does. The editor reads and writes drafts with an explicit `?draft=true` on each
 * call, but a preview is a whole app rendering itself: its own document, the
 * `<link>` to `api/ui/style`, `EventSource`, and every page it navigates to. None
 * of those can carry a header or a parameter, and the gateway decides the surface
 * from the hostname alone.
 *
 * So the grant is a hostname. `t-<32 hex><suffix>.modlix.com`, minted for one app
 * by someone with write access to it, and the gateway turns it into `x-draft` for
 * that app and any client the minting client manages -- which is what lets the
 * canvas preview another client's context, something the permanent draft link
 * cannot express because it is issued against the logged-in client only.
 */
export interface DraftGrant {
	token: string;
	host: string;
	/** ISO-8601, as the server writes it. */
	expiresAt: string;
}

function authHeaders(authToken: string | undefined) {
	return authToken ? { Authorization: authToken } : undefined;
}

/**
 * One grant per editor session.
 *
 * Returns undefined rather than throwing when the mint is refused. Somebody with
 * read access can open the page editor, and their canvas should fall back to the
 * live app rather than go blank.
 */
export async function mintDraftToken(
	appCode: string,
	authToken: string | undefined,
): Promise<DraftGrant | undefined> {
	try {
		const response = await axios.post(
			'/api/security/clienturls/draft/token',
			undefined,
			{ params: { appCode }, headers: authHeaders(authToken) },
		);
		return response.data?.host ? (response.data as DraftGrant) : undefined;
	} catch (error) {
		console.error('Could not mint a draft-edit token; the preview will show the live app:', error);
		return undefined;
	}
}

/**
 * Push the grant's expiry forward, keeping the same token.
 *
 * Never mints a replacement. The token IS the hostname, so a new value would
 * change the canvases' origin and reload all three, losing scroll position and
 * whatever the previewed page holds in its own store.
 */
export async function extendDraftToken(
	token: string,
	authToken: string | undefined,
): Promise<DraftGrant | undefined> {
	try {
		const response = await axios.post(
			'/api/security/clienturls/draft/token/extend',
			undefined,
			{ params: { token }, headers: authHeaders(authToken) },
		);
		return response.data?.host ? (response.data as DraftGrant) : undefined;
	} catch (error) {
		console.error('Could not extend the draft-edit token:', error);
		return undefined;
	}
}

/**
 * How long to wait before the next heartbeat.
 *
 * Half the remaining life, so a missed beat has a whole second chance before the
 * canvas would drop back to live. Clamped at both ends: not so eager that an open
 * editor beats every few seconds, not so lazy that a long clock skew strands it.
 */
export function heartbeatDelay(expiresAt: string | undefined): number {
	const remaining = expiresAt ? new Date(expiresAt).getTime() - Date.now() : NaN;
	if (Number.isNaN(remaining)) return 5 * 60 * 1000;
	return Math.min(Math.max(remaining / 2, 30 * 1000), 10 * 60 * 1000);
}

/**
 * The URL for a preview canvas.
 *
 * `origin` is undefined while the grant is still being minted -- the frames must
 * not load yet, because one that boots before the grant exists renders the live
 * app and never retries. An empty string means the mint was refused or failed, and
 * the relative path is used, which is the live surface and what the editor did
 * before any of this existed.
 *
 * An absolute URL typed into the editor's address bar wins outright.
 */
export function previewSrc(origin: string | undefined, url: string): string | undefined {
	if (!url) return undefined;
	if (/^https?:\/\//i.test(url)) return url;
	if (origin === undefined) return undefined;
	return origin ? origin + url : url;
}
