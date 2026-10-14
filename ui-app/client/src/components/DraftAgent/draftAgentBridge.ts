import { BRIDGE_PATH, MESSAGE_TYPE, hostOfPattern, isAllowedParent } from './draftAgentEnv';

/**
 * The builder half of the draft agent's sign-in: runs on the builder's origin
 * (AppBuilder, SiteZump, LeadZump, or whatever host the app names) inside a
 * hidden iframe or a small popup opened by a draft page.
 *
 * It holds the builder session, and it never sends that session anywhere. What
 * it sends is a ONE-TIME token minted from it, which the draft page redeems on
 * its own host for a token of its own. That matters twice over. A token only
 * works on the host it was minted for, so a copied one would be refused on the
 * draft host. And the builder rotates its token every half hour, revoking the old
 * one, so a copy would die under the draft page while the fork lives its own life.
 *
 * Who it answers is checked in two steps:
 * 1. The asking page must be an https draft host of this environment.
 * 2. The server must name THAT host as this user's own draft URL of the app.
 *    `GET /api/security/clienturls/draft` answers only with write access to the
 *    app, and only with the caller's own client's draft, so a platform admin
 *    browsing a tenant's draft is never silently signed in to it: that host is not
 *    theirs, and the tenant's page code would otherwise be handed their session.
 *
 * Deliberately plain fetch and no store: this page renders nothing of the app,
 * and must not touch the builder's own storage beyond reading the token.
 */

export function isDraftAgentBridge(): boolean {
	try {
		return window.location.pathname === BRIDGE_PATH;
	} catch {
		return false;
	}
}

export type BridgeStatus = 'ok' | 'signed-out' | 'no-access' | 'refused' | 'error';

export interface BridgeReply {
	type: typeof MESSAGE_TYPE;
	kind: 'bridge';
	nonce: string;
	status: BridgeStatus;
	ott?: string;
	/** The builder app the session belongs to; the redeem must name it as `appCode`. */
	appCode?: string;
	clientCode?: string;
	userName?: string;
	message?: string;
}

function readToken(): string | undefined {
	try {
		const raw = window.localStorage.getItem('AuthToken');
		const expiry = parseInt(window.localStorage.getItem('AuthTokenExpiry') ?? '0', 10);
		if (!raw) return undefined;
		if (expiry && expiry * 1000 < Date.now()) return undefined;
		const token = JSON.parse(raw);
		return typeof token === 'string' && token ? token : undefined;
	} catch {
		return undefined;
	}
}

async function getJson(url: string, init: RequestInit): Promise<{ status: number; body: any }> {
	const res = await fetch(url, { credentials: 'same-origin', ...init });
	let body: any = undefined;
	try {
		body = await res.json();
	} catch {
		/* empty or not JSON */
	}
	return { status: res.status, body };
}

export async function runDraftAgentBridge(): Promise<void> {
	const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
	const parentOrigin = params.get('parent') ?? '';
	const appCode = params.get('app') ?? '';
	const nonce = params.get('nonce') ?? '';
	const popup = params.get('mode') === 'popup';
	const target: Window | null = popup
		? window.opener
		: window.parent !== window
			? window.parent
			: null;

	const show = (text: string, link?: { href: string; label: string }) => {
		if (!popup) return;
		const app = document.getElementById('app') ?? document.body;
		app.innerHTML = '';
		const box = document.createElement('div');
		box.style.cssText =
			'font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;max-width:360px;margin:64px auto;padding:0 16px;color:#1f2937;text-align:center';
		const p = document.createElement('p');
		p.textContent = text;
		box.appendChild(p);
		if (link) {
			const a = document.createElement('a');
			a.href = link.href;
			a.textContent = link.label;
			a.style.cssText = 'color:#2563eb';
			box.appendChild(a);
		}
		app.appendChild(box);
	};

	const reply = (r: Omit<BridgeReply, 'type' | 'kind' | 'nonce'>) => {
		// Never `*`: the one-time token is a credential, and only the checked origin gets it.
		if (target && isAllowedParent(parentOrigin, window.location.hostname))
			target.postMessage({ type: MESSAGE_TYPE, kind: 'bridge', nonce, ...r }, parentOrigin);
	};

	document.title = 'Connecting the AI';

	if (!target || !nonce || !appCode || !isAllowedParent(parentOrigin, window.location.hostname)) {
		show('This page connects the AI on a draft of your app. Open it from the draft itself.');
		return;
	}

	try {
		const token = readToken();
		// With no token in storage the session may still be a cookie (SSO apps), and
		// fetch sends that on its own. So ask either way, with the header only if we have one.
		const auth: Record<string, string> = token ? { Authorization: token } : {};

		const who = await getJson('/api/security/verifyToken', { headers: auth });
		if (who.status !== 200 || !who.body?.user) {
			reply({ status: 'signed-out' });
			show(`Sign in on ${window.location.host} first, then try again.`, {
				href: '/',
				label: `Open ${window.location.host}`,
			});
			return;
		}

		const draft = await getJson(
			`/api/security/clienturls/draft?appCode=${encodeURIComponent(appCode)}`,
			{ headers: auth },
		);
		const parentHost = new URL(parentOrigin).hostname.toLowerCase();
		if (draft.status !== 200 || hostOfPattern(draft.body?.urlPattern) !== parentHost) {
			reply({ status: 'no-access' });
			show(`Your account on ${window.location.host} cannot edit this draft.`);
			if (popup) setTimeout(() => window.close(), 4000);
			return;
		}

		const appForToken = who.body.verifiedAppCode;
		const ott = await getJson('/api/security/makeOneTimeToken', {
			method: 'POST',
			headers: { ...auth, 'Content-Type': 'application/json' },
			// BEARER, said outright: a cookie on the draft host would be sent with the
			// draft app's own calls and sign it in as the builder.
			body: JSON.stringify({ targetAppCode: appForToken, authMode: 'BEARER' }),
		});
		if (ott.status !== 200 || !ott.body?.token) {
			reply({ status: 'error', message: `Could not start a session (${ott.status}).` });
			show('Could not connect. Please try again.');
			return;
		}

		reply({
			status: 'ok',
			ott: ott.body.token,
			appCode: appForToken,
			clientCode: who.body.loggedInClientCode,
			userName:
				[who.body.user?.firstName, who.body.user?.lastName].filter(Boolean).join(' ') ||
				who.body.user?.userName ||
				'',
		});
		show('Connected. You can close this window.');
		if (popup) setTimeout(() => window.close(), 300);
	} catch (e: any) {
		reply({ status: 'error', message: e?.message ?? 'Unknown error' });
		show('Could not connect. Please try again.');
	}
}
