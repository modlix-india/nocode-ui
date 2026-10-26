import {
	BRIDGE_PATH,
	BuilderOrigin,
	MESSAGE_TYPE,
	TOKEN_FOR_DRAFT_APP,
	TOKEN_FOR_PARAM,
	builderOrigins,
	draftEnvOf,
	DraftAgentName,
	sessionFitsAgent,
	wantsDraftAppToken,
} from './draftAgentEnv';
import type { BridgeReply } from './draftAgentBridge';

/**
 * The draft half of the agent's sign-in: finds a builder session the person
 * already has, and turns it into a session on THIS host that only the agent uses.
 *
 * Kept apart from the draft app's own sign-in on purpose. The app's session lives
 * in `localStorage.AuthToken` and `Store.auth`, and nothing here reads or writes
 * either: someone testing the app as a customer and the builder editing it are
 * different people with different rights, often in the same tab. The agent's
 * session is held in memory only, so it is gone with the tab, and is never in
 * storage that the draft app's own scripts read as a matter of course.
 *
 * Note what that does NOT protect against: code running on this page (the draft
 * app's own functions) can still reach this module's memory if it tries. The
 * bridge only signs in on the user's OWN draft of an app they can edit, so that
 * code is theirs, but it is the reason the bridge is that strict.
 */

export interface AgentSession {
	accessToken: string;
	expiresAt: number;
	/**
	 * The app the token was issued for: the builder's (`appbuilder`, `sitezump`) for
	 * the AppBuilder agent, the draft app itself (`leadzumptwo`, `cxzump`) for an
	 * app's own agent.
	 */
	appCode: string;
	clientCode: string;
	userName: string;
	origin: string;
	label: string;
}

export type ProbeOutcome =
	| { status: 'ok'; session: AgentSession }
	| {
			status: 'signed-out' | 'no-access' | 'refused' | 'error' | 'timeout';
			origin: string;
			label: string;
			message?: string;
	  };

const FRAME_TIMEOUT_MS = 12_000;
// After the bridge frame has LOADED, an answer takes one round of three small
// calls. A host that loaded and still says nothing is not one that can answer
// (an old bundle, a DNS miss rendering the browser's error page), so stop waiting.
const AFTER_LOAD_TIMEOUT_MS = 5_000;
const SESSION_KEY = 'mlxDraftAgent.session';
const POPUP_TIMEOUT_MS = 5 * 60_000;
const REFRESH_BEFORE_MS = 3 * 60_000;

/**
 * Kept for the TAB in sessionStorage, so a reload or a page change does not run the
 * whole bridge round again (that round is most of the wait before the agent shows).
 * sessionStorage, not localStorage: it ends with the tab, is never shared with
 * another tab, and the draft app's own scripts can reach this module's memory
 * anyway, so it exposes nothing new.
 */
function readCached(): AgentSession | undefined {
	try {
		const raw = window.sessionStorage.getItem(SESSION_KEY);
		if (!raw) return undefined;
		const s = JSON.parse(raw) as AgentSession;
		return s?.accessToken && s.expiresAt > Date.now() + 60_000 ? s : undefined;
	} catch {
		return undefined;
	}
}

function writeCached(s: AgentSession | undefined) {
	try {
		if (s) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
		else window.sessionStorage.removeItem(SESSION_KEY);
	} catch {
		/* blocked storage: the agent just signs in again next load */
	}
}

let current: AgentSession | undefined = readCached();
const listeners = new Set<(s: AgentSession | undefined) => void>();

export function getAgentSession(): AgentSession | undefined {
	if (current && current.expiresAt <= Date.now()) setAgentSession(undefined);
	return current;
}

export function setAgentSession(s: AgentSession | undefined) {
	current = s;
	writeCached(s);
	listeners.forEach(fn => {
		try {
			fn(s);
		} catch {
			/* a listener must not break the others */
		}
	});
}

/**
 * Forget a tab's cached session that cannot serve this agent on this draft (a
 * token of another app, such as the cxlanding token an older bundle kept for the
 * CXZump agent), so the bridge runs again and mints the right one.
 */
export function dropUnfitSession(draftApp: string, agent: DraftAgentName): void {
	if (current && !sessionFitsAgent(current.appCode, draftApp, agent)) setAgentSession(undefined);
}

export function onAgentSession(fn: (s: AgentSession | undefined) => void): () => void {
	listeners.add(fn);
	return () => listeners.delete(fn);
}

function nonce(): string {
	const a = new Uint8Array(16);
	crypto.getRandomValues(a);
	return Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
}

export function bridgeUrl(
	origin: string,
	appCode: string,
	n: string,
	mode: 'frame' | 'popup',
	forDraftApp = false,
) {
	const hash = new URLSearchParams({
		parent: window.location.origin,
		app: appCode,
		nonce: n,
		mode,
	});
	// Only added when wanted, so the AppBuilder agent's bridge URL is what it always was.
	if (forDraftApp) hash.set(TOKEN_FOR_PARAM, TOKEN_FOR_DRAFT_APP);
	return `${origin}${BRIDGE_PATH}#${hash.toString()}`;
}

function awaitReply(
	builder: BuilderOrigin,
	n: string,
	source: () => Window | null | undefined,
	timeoutMs: number,
	isClosed?: () => boolean,
): Promise<BridgeReply | undefined> {
	return new Promise(resolve => {
		let done = false;
		const finish = (r: BridgeReply | undefined) => {
			if (done) return;
			done = true;
			window.removeEventListener('message', onMessage);
			clearTimeout(timer);
			clearInterval(closedPoll);
			resolve(r);
		};
		const onMessage = (e: MessageEvent) => {
			if (e.origin !== builder.origin) return;
			if (e.source !== source()) return;
			const d = e.data;
			if (!d || d.type !== MESSAGE_TYPE || d.kind !== 'bridge' || d.nonce !== n) return;
			finish(d as BridgeReply);
		};
		window.addEventListener('message', onMessage);
		const timer = setTimeout(() => finish(undefined), timeoutMs);
		const closedPoll = setInterval(() => {
			if (isClosed?.()) setTimeout(() => finish(undefined), 500);
		}, 500);
	});
}

/** Turn the bridge's one-time token into a token for this host. */
async function redeem(builder: BuilderOrigin, reply: BridgeReply): Promise<ProbeOutcome> {
	try {
		const res = await fetch(
			`/api/security/authenticateWithOneTimeToken/${encodeURIComponent(reply.ott!)}`,
			{
				headers: {
					appCode: reply.appCode ?? '',
					clientCode: reply.clientCode ?? '',
				},
				credentials: 'omit',
			},
		);
		if (!res.ok)
			return {
				status: 'error',
				origin: builder.origin,
				label: builder.label,
				message: `Sign-in refused (${res.status}).`,
			};
		const body = await res.json();
		if (!body?.accessToken)
			return {
				status: 'error',
				origin: builder.origin,
				label: builder.label,
				message: 'No session returned.',
			};
		return {
			status: 'ok',
			session: {
				accessToken: body.accessToken,
				expiresAt: Number(body.accessTokenExpiryAt) * 1000 || Date.now() + 30 * 60_000,
				appCode: body.verifiedAppCode ?? reply.appCode ?? '',
				clientCode: reply.clientCode ?? body.loggedInClientCode ?? '',
				userName: reply.userName ?? '',
				origin: builder.origin,
				label: builder.label,
			},
		};
	} catch (e: any) {
		return {
			status: 'error',
			origin: builder.origin,
			label: builder.label,
			message: e?.message,
		};
	}
}

function outcome(
	builder: BuilderOrigin,
	reply: BridgeReply | undefined,
	appCode: string,
	forDraftApp: boolean,
): Promise<ProbeOutcome> | ProbeOutcome {
	if (!reply) return { status: 'timeout', origin: builder.origin, label: builder.label };
	if (reply.status !== 'ok' || !reply.ott)
		return {
			status: reply.status === 'ok' ? 'error' : reply.status,
			origin: builder.origin,
			label: builder.label,
			message: reply.message,
		};
	// A bridge on an older bundle ignores `token=app` and answers with its own app's
	// token, which the app's own agent would refuse. Never redeem it.
	if (forDraftApp && (reply.appCode ?? '').toLowerCase() !== appCode.toLowerCase())
		return {
			status: 'refused',
			origin: builder.origin,
			label: builder.label,
			message: `${builder.label} answered for ${reply.appCode || 'another app'}, not ${appCode}.`,
		};
	return redeem(builder, reply);
}

/**
 * Ask one builder, silently, through a hidden iframe.
 *
 * Works for a builder on the same site as the draft (`*.modlix.com`), because a
 * same-site frame shares the builder's first-party storage. For a builder on
 * another site (`sitezump.ai`, `leadzump.ai`) browsers partition the frame's
 * storage, so it sees no session and answers signed-out; `connectWithPopup` is
 * the way in for those.
 */
export async function probeWithFrame(
	builder: BuilderOrigin,
	appCode: string,
	forDraftApp = false,
): Promise<ProbeOutcome> {
	const n = nonce();
	const frame = document.createElement('iframe');
	frame.setAttribute('aria-hidden', 'true');
	frame.tabIndex = -1;
	frame.title = 'AI sign-in check';
	frame.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';
	frame.src = bridgeUrl(builder.origin, appCode, n, 'frame', forDraftApp);
	let loadedAt = 0;
	frame.addEventListener('load', () => (loadedAt = Date.now()));
	const waiting = awaitReply(
		builder,
		n,
		() => frame.contentWindow,
		FRAME_TIMEOUT_MS,
		() => loadedAt > 0 && Date.now() - loadedAt > AFTER_LOAD_TIMEOUT_MS,
	);
	document.body.appendChild(frame);
	const reply = await waiting;
	frame.remove();
	return outcome(builder, reply, appCode, forDraftApp);
}

/**
 * Ask one builder in a small top-level window, which reads the builder's real
 * session wherever it lives. Must be called from a click, or it is blocked.
 */
export async function connectWithPopup(
	builder: BuilderOrigin,
	appCode: string,
	forDraftApp = false,
): Promise<ProbeOutcome> {
	const n = nonce();
	const w = window.open(
		bridgeUrl(builder.origin, appCode, n, 'popup', forDraftApp),
		'mlxDraftAgentConnect',
		'popup=yes,width=460,height=560',
	);
	if (!w)
		return {
			status: 'error',
			origin: builder.origin,
			label: builder.label,
			message: 'The browser blocked the sign-in window. Allow pop-ups for this site.',
		};
	const reply = await awaitReply(
		builder,
		n,
		() => w,
		POPUP_TIMEOUT_MS,
		() => w.closed,
	);
	return outcome(builder, reply, appCode, forDraftApp);
}

/**
 * Find a builder session silently, asking every candidate at once.
 *
 * The first in the list that both knows the person AND lets them edit this draft
 * wins, so the order still expresses preference. In parallel because a builder
 * that never answers (a site still on an older bundle, a blocked frame) would
 * otherwise hold up the rest for the whole timeout. Returns every outcome when
 * none succeeds, so the caller can say which builders were asked.
 */
export async function findSession(
	appCode: string,
	agent: DraftAgentName,
	hostOverride?: string,
): Promise<{ session?: AgentSession; tried: ProbeOutcome[] }> {
	const env = draftEnvOf(window.location.hostname);
	if (env === undefined) return { tried: [] };
	const forDraftApp = wantsDraftAppToken(agent);
	const probes = builderOrigins(env, agent, hostOverride).map(b =>
		probeWithFrame(b, appCode, forDraftApp),
	);
	const tried: ProbeOutcome[] = [];
	// Walk in preference order: a success counts the moment every builder ahead of
	// it has answered, without waiting on the ones behind it. Late successes behind
	// the winner were real tokens minted for nothing, so they are ended.
	for (let i = 0; i < probes.length; i++) {
		const o = await probes[i];
		tried.push(o);
		if (o.status !== 'ok') continue;
		probes.slice(i + 1).forEach(p =>
			p.then(late => {
				if (late.status === 'ok') revoke(late.session);
			}),
		);
		setAgentSession(o.session);
		return { session: o.session, tried };
	}
	return { tried };
}

let refreshing: Promise<AgentSession | undefined> | undefined;

/**
 * Keep the agent's own token alive while the page is open.
 *
 * Refreshed on this host with the agent's token, never the app's. The server
 * revokes a token as it replaces it, so one refresh at a time.
 */
export async function freshSession(): Promise<AgentSession | undefined> {
	const s = getAgentSession();
	if (!s) return undefined;
	if (s.expiresAt - Date.now() > REFRESH_BEFORE_MS) return s;
	refreshing ??= (async () => {
		try {
			const res = await fetch('/api/security/refreshToken', {
				headers: {
					Authorization: s.accessToken,
					appCode: s.appCode,
					clientCode: s.clientCode,
				},
				credentials: 'omit',
			});
			if (!res.ok) {
				if (res.status === 401 || res.status === 403) setAgentSession(undefined);
				return getAgentSession();
			}
			const body = await res.json();
			const next: AgentSession = {
				...s,
				accessToken: body.accessToken,
				expiresAt: Number(body.accessTokenExpiryAt) * 1000 || s.expiresAt,
			};
			setAgentSession(next);
			return next;
		} catch {
			return getAgentSession();
		} finally {
			refreshing = undefined;
		}
	})();
	return refreshing;
}

/** End the agent's session on this host. The builder's own session is untouched. */
export async function disconnect(): Promise<void> {
	const s = current;
	setAgentSession(undefined);
	if (s) await revoke(s);
}

async function revoke(s: AgentSession): Promise<void> {
	try {
		await fetch('/api/security/revoke', {
			headers: { Authorization: s.accessToken, appCode: s.appCode, clientCode: s.clientCode },
			credentials: 'omit',
		});
	} catch {
		/* best effort: the token expires on its own */
	}
}

/**
 * Headers for an agent call. `appCode` is the builder for the AppBuilder agent and
 * the draft app for an app's own agent, which is what each agent's gate admits.
 */
export function agentHeaders(
	s: AgentSession | undefined,
	appCodeHeader: string,
): Record<string, string> {
	return {
		'Content-Type': 'application/json',
		Authorization: s ? `Bearer ${s.accessToken}` : '',
		clientCode: s?.clientCode ?? '',
		appCode: appCodeHeader,
	};
}
