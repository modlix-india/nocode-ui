/**
 * Where a draft app lives, and where the people who build it sign in.
 *
 * The draft surface is served on a minted host, `d<32 hex>.<env>.modlix.com`
 * (no env label on production). The person building the app is signed in
 * somewhere else entirely: AppBuilder (`appbuilder.<env>.modlix.com`) or SiteZump
 * (`<env>.sitezump.ai`). Those sessions never reach the draft host by themselves:
 * the auth cookie is host-only and a token only works on the host it was minted
 * for. Everything in this module is pure, so the rules about which origins may
 * talk to which can be tested without a browser.
 */

export type DraftEnv = 'local' | 'dev' | 'stage' | '';

export interface BuilderOrigin {
	origin: string;
	label: string;
}

/**
 * Path the builder origin answers with the token hand-off instead of the app.
 *
 * One segment on purpose: the client's calls are relative (`api/...`), so under a
 * nested path they would resolve beneath it and miss the API.
 */
export const BRIDGE_PATH = '/__mlx-agent-bridge';

/** Path the draft origin answers with the agent alone, for the detached window. One segment, as above. */
export const WINDOW_PATH = '/__mlx-agent-window';

/** `type` on every postMessage this feature sends, so nothing else is mistaken for one. */
export const MESSAGE_TYPE = 'mlx-draft-agent';

const DRAFT_HOST = /^d[0-9a-f]{32}\.(?:(local|dev|stage)\.)?modlix\.com$/;

/**
 * The environment of a draft host, or undefined when this is not one.
 *
 * Only the permanent `d` link counts. The `t-` hosts are the page editor's own
 * preview grants: they live inside the editor, which already has a sidekick, and
 * nobody browses one directly.
 */
export function draftEnvOf(hostname: string): DraftEnv | undefined {
	const m = DRAFT_HOST.exec((hostname ?? '').toLowerCase());
	if (!m) return undefined;
	return (m[1] ?? '') as DraftEnv;
}

/**
 * The environment label of any platform host: the label just before the
 * registrable domain, when it is one of ours. `appbuilder.local.modlix.com` and
 * `local.leadzump.ai` are local, `appbuilder.modlix.com` and `leadzump.ai` are
 * production. Undefined for a host that cannot be one of ours (no dots, an IP).
 */
export function envOfHost(hostname: string): DraftEnv | undefined {
	const labels = (hostname ?? '').toLowerCase().split('.').filter(Boolean);
	if (labels.length < 2 || labels.every(l => /^\d+$/.test(l))) return undefined;
	const sub = labels.slice(0, -2);
	const last = sub[sub.length - 1];
	return last === 'local' || last === 'dev' || last === 'stage' ? last : '';
}

export const ENV_PLACEHOLDER = '<env.>';

/**
 * Put an environment into a host name.
 *
 * A template says exactly where it goes: `<env.>` becomes `dev.`, `stage.` or
 * `local.`, and nothing on production, so `<env.>leadzump.ai` is `dev.leadzump.ai`
 * and `leadzump.<env.>modlix.com` is `leadzump.dev.modlix.com`. The same value then
 * works on every environment and survives a transport unchanged.
 *
 * Without a template the label goes just before the registrable domain:
 * `appbuilder.modlix.com` becomes `appbuilder.dev.modlix.com`, `leadzump.ai`
 * becomes `dev.leadzump.ai`.
 */
export function hostForEnv(prodHost: string, env: DraftEnv): string {
	const raw = (prodHost ?? '').trim().toLowerCase();
	if (raw.includes(ENV_PLACEHOLDER))
		return hostOfPattern(raw.split(ENV_PLACEHOLDER).join(env ? `${env}.` : ''));

	const clean = hostOfPattern(prodHost);
	if (!env || !clean) return clean;
	const labels = clean.split('.');
	if (labels.length < 2) return clean;
	// Already carries an env label: trust what the author wrote.
	if (envOfHost(clean)) return clean;
	return [...labels.slice(0, -2), env, ...labels.slice(-2)].join('.');
}

/**
 * Where the people who build this app sign in, in the order they are tried.
 *
 * An explicit `draftAgentHost` on the app is the whole answer. Otherwise the
 * LeadZump agent signs in where LeadZump's own customers do, because they have no
 * AppBuilder or SiteZump account, the CXZump agent on cxzump.ai (cxlanding, where
 * builders manage CXZump; CXZump itself lives on each builder's domain), and the
 * AppBuilder agent tries AppBuilder and then SiteZump.
 */
export function builderOrigins(
	env: DraftEnv,
	agent: DraftAgentName = 'appbuilder',
	hostOverride?: string,
): BuilderOrigin[] {
	const named = (prodHost: string, label: string): BuilderOrigin => ({
		origin: `https://${hostForEnv(prodHost, env)}`,
		label,
	});

	// The label is the host actually used, never the `<env.>` template.
	if (hostOverride && hostOfPattern(hostOverride))
		return [named(hostOverride, hostForEnv(hostOverride, env))];

	if (agent === 'leadzump') return [named('leadzump.ai', 'LeadZump')];

	// CXZump itself runs on each builder's own domain. Builders sign in on cxzump.ai,
	// which serves cxlanding: the self-serve app they manage CXZump from. The local
	// stack has no cxzump.ai host (nothing resolves local.cxzump.ai), so local signs in
	// on cxlanding's own modlix.com host instead. Kept here rather than in the app's
	// `draftAgentHost`, because that property travels with a transport to every env.
	if (agent === 'cxzump')
		return env === 'local'
			? [named('cxlanding.local.modlix.com', 'CXZump')]
			: [named('cxzump.ai', 'CXZump')];

	return [named('appbuilder.modlix.com', 'AppBuilder'), named('sitezump.ai', 'SiteZump')];
}

/**
 * May the bridge on `bridgeHost` hand its sign-in to `parentOrigin`?
 *
 * Only to an https draft host of the SAME environment. A dev builder session has
 * no business on a stage draft, and anything that is not a draft host is not
 * asking on behalf of a draft at all. This is only the shape check; the bridge
 * also proves with the server that this host is the user's own draft of the app.
 */
export function isAllowedParent(parentOrigin: string, bridgeHost: string): boolean {
	const env = envOfHost(bridgeHost);
	if (env === undefined) return false;
	let url: URL;
	try {
		url = new URL(parentOrigin);
	} catch {
		return false;
	}
	if (url.protocol !== 'https:' || url.port) return false;
	if (url.origin !== parentOrigin) return false;
	return draftEnvOf(url.hostname) === env;
}

/** The hostname inside a stored url pattern, which may or may not carry a scheme or port. */
export function hostOfPattern(pattern: string | undefined): string {
	if (!pattern) return '';
	return pattern
		.trim()
		.toLowerCase()
		.replace(/^[a-z]+:\/\//, '')
		.replace(/[/:].*$/, '');
}

export type DraftAgentName = 'appbuilder' | 'leadzump' | 'cxzump';

/**
 * The agent a draft talks to, from the app's `draftAgent` property.
 *
 * Missing or unrecognised means AppBuilder, which is the agent that builds.
 */
export function toDraftAgent(value: any): DraftAgentName {
	const v = typeof value === 'string' ? value.trim().toLowerCase() : '';
	return v === 'leadzump' || v === 'cxzump' ? v : 'appbuilder';
}

export interface AgentConfig {
	endpoint: string;
	/**
	 * The `appCode` header. The AppBuilder agent admits only the builder apps, so it
	 * gets the builder the user signed in with. The LeadZump and CXZump agents admit
	 * only their own app, so they get the draft app's code.
	 */
	appCodeHeader: 'builder' | 'draftApp';
	title: string;
}

export const AGENTS: Record<DraftAgentName, AgentConfig> = {
	appbuilder: { endpoint: '/api/ai/appbuilder/chat', appCodeHeader: 'builder', title: 'Builder' },
	leadzump: { endpoint: '/api/ai/leadzump/chat', appCodeHeader: 'draftApp', title: 'LeadZump' },
	cxzump: { endpoint: '/api/ai/cxzump/chat', appCodeHeader: 'draftApp', title: 'CXZump' },
};

/**
 * Bridge hash parameter asking for a token of the DRAFT app rather than of the
 * builder session's own app. Value {@link TOKEN_FOR_DRAFT_APP}; absent means the
 * session's app, which is what every bridge did before it existed.
 */
export const TOKEN_FOR_PARAM = 'token';
export const TOKEN_FOR_DRAFT_APP = 'app';

/**
 * Whether this agent needs a token of the draft app itself.
 *
 * The agents that admit only their own app (LeadZump, CXZump) work that app's
 * server functions, whose authorities follow the token's app. Their builders may
 * sign in on another app: CXZump builders sign in on cxlanding (cxzump.ai), so a
 * cxlanding token would carry cxlanding's profiles and every CxZump call would be
 * refused. The AppBuilder agent admits only the builder apps, so it keeps the
 * builder's token.
 */
export function wantsDraftAppToken(agent: DraftAgentName): boolean {
	return AGENTS[agent]?.appCodeHeader === 'draftApp';
}

/**
 * The app the bridge mints its one-time token for.
 *
 * The draft app when asked for it, else the session's own app. Security mints a
 * token for another app only when the two apps depend on each other (either
 * direction; `makeOneTimeToken`), so cxlanding (which depends on cxzump) can mint
 * for cxzump and an unrelated app is refused there, not here. When the draft app IS
 * the session's app (LeadZump on leadzump.ai) nothing changes.
 */
export function tokenAppCode(sessionApp: string, draftApp: string, wantDraftApp: boolean): string {
	const draft = (draftApp ?? '').trim();
	return wantDraftApp && draft ? draft : (sessionApp ?? '');
}

/**
 * Whether a session (cached for the tab, or just redeemed) can serve this agent on
 * this draft: an agent that needs the draft app's token cannot use one of another
 * app, such as a cxlanding token cached by an older bundle.
 */
export function sessionFitsAgent(
	sessionApp: string | undefined,
	draftApp: string,
	agent: DraftAgentName,
): boolean {
	if (!wantsDraftAppToken(agent)) return true;
	return (sessionApp ?? '').toLowerCase() === (draftApp ?? '').toLowerCase();
}

export type DraftAgentMode = 'left' | 'right' | 'compact' | 'button' | 'window';

export const MODES: ReadonlyArray<{ mode: DraftAgentMode; label: string; icon: string }> = [
	{ mode: 'left', label: 'Dock left', icon: 'fa fa-solid fa-table-columns' },
	{ mode: 'right', label: 'Dock right', icon: 'fa fa-solid fa-table-columns fa-flip-horizontal' },
	{ mode: 'compact', label: 'Floating prompt', icon: 'fa fa-solid fa-message' },
	{ mode: 'button', label: 'Minimise', icon: 'fa fa-solid fa-minus' },
	{ mode: 'window', label: 'Open in a new window', icon: 'fa fa-solid fa-up-right-from-square' },
];

export function toMode(value: any, fallback: DraftAgentMode = 'button'): DraftAgentMode {
	// The side rail is retired: the FAB is the one minimised state.
	if (value === 'rail') return 'button';
	return MODES.some(m => m.mode === value) ? (value as DraftAgentMode) : fallback;
}

/**
 * Where a placed agent runs, and with it whose session it uses.
 *
 * `draft` (the default, and what every draft host gets on its own): only on the
 * app's draft host, signed in as the BUILDER through the bridge, never as the
 * app's user. `live`: only on the live app, signed in as whoever this window is
 * signed in as, talking to the agent the page names. Each is invisible on the
 * other surface, so one page definition can carry both.
 */
export type RunIn = 'draft' | 'live';

export function toRunIn(value: any): RunIn {
	const v = typeof value === 'string' ? value.trim().toLowerCase().replace(/^_/, '') : '';
	return v === 'live' ? 'live' : 'draft';
}

export function runsHere(runIn: RunIn, onDraftHost: boolean): boolean {
	return runIn === 'draft' ? onDraftHost : !onDraftHost;
}

/**
 * A live run's agent, by name: `leadzump` is `/api/ai/leadzump/chat?draftmode=false`. Anything but
 * a plain name is dropped rather than built into a URL, so a property can only ever
 * pick one of the AI service's own agents.
 */
export function liveAgentEndpoint(name: string): string {
	const clean = (name ?? '').trim().toLowerCase();
	// `draftmode=false`: a live run is the live app, where the agent works the app's
	// data and does not change the app itself (LeadZump's `app_change` reads it).
	return `/api/ai/${/^[a-z0-9_-]+$/.test(clean) ? clean : 'appbuilder'}/chat?draftmode=false`;
}

/** The minimised state: the FAB, which "close" and "open in a window" fall back to. */
export function isMinimised(mode: DraftAgentMode): boolean {
	return mode === 'button';
}
