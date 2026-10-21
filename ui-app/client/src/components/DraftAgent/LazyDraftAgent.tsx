import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
	addListenerAndCallImmediately,
	getDataFromPath,
	PageStoreExtractor,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './draftAgentProperties';
import { claimPlacement } from './draftAgentPlacement';
import { usedComponents } from '../../App/usedComponents';
import { ComponentDefinition, ComponentProps, PageDefinition } from '../../types/common';
import PromptComponent from '../Prompt/Prompt';
import {
	AgentSession,
	agentHeaders,
	connectWithPopup,
	disconnect,
	findSession,
	freshSession,
	getAgentSession,
	onAgentSession,
	ProbeOutcome,
	setAgentSession,
} from './draftAgentAuth';
import {
	AGENTS,
	builderOrigins,
	DraftAgentMode,
	draftEnvOf,
	MESSAGE_TYPE,
	isMinimised,
	MODES,
	liveAgentEndpoint,
	runsHere,
	toRunIn,
	toDraftAgent,
	toMode,
	WINDOW_PATH,
} from './draftAgentEnv';
import { agentBaseUrl, toDraftMode } from '../Prompt/draftMode';
import { Attachment, toChatAttachments } from '../Prompt/attachments';
import { applyObjectChange, ObjectChange } from './draftAgentRefresh';
import { followRun, tailOf } from './draftAgentStream';
import { newSteerId, postSteer, QUEUED_NOTE, SteerQueue } from '../Prompt/steer';
import { DRAFT_AGENT_CSS } from './draftAgentCss';
import { activeObjectNow, PickedComponent } from './draftAgentContext';
import { usePicker } from './draftAgentPicker';

/**
 * The AI, inside the running draft of an app.
 *
 * The draft surface is where an app is checked before it is published. This puts
 * the builder's agent there too, so a change can be asked for while looking at
 * the real thing, and the page on screen refreshes as the agent saves.
 *
 * It signs in as the BUILDER (see draftAgentAuth), never as the draft app's own
 * user, and it only appears for someone whose builder account can edit this very
 * draft.
 */

export interface DraftAgentConfig {
	/** The mode to start in when the person has never picked one. */
	defaultMode: DraftAgentMode;
	/** Icon for the button; the app's `draftAgentIcon` property wins when set. */
	icon: string;
	/** Agent override; the app's `draftAgent` property otherwise. */
	agent?: string;
	/** Sign-in host override; the app's `draftAgentHost` property otherwise. */
	host?: string;
	/** Show a dimmed button that offers to connect when no builder session was found. */
	showWhenSignedOut: boolean;
	placeholder: string;
	/** Rendered in the detached window: one full-height chat, no other modes. */
	windowed?: boolean;
	/** `draft` (builder sign-in, draft host only) or `live` (this app's sign-in, live only). */
	runIn?: string;
	/** Where the agent's definition edits land: DRAFT (default), PAGE_ONLY_DRAFT or LIVE. */
	draftMode?: string;
	pageDefinition?: PageDefinition;
	locationHistory?: Array<any>;
	contextPageName?: string;
}

interface Prefs {
	mode?: DraftAgentMode;
	/** The panel the button opens back into. */
	panel?: 'left' | 'right' | 'compact';
	x?: number;
	y?: number;
	bx?: number;
	by?: number;
	width?: number;
	sessionId?: string | null;
}

const MIN_WIDTH = 320;
const MAX_WIDTH = 760;
const DEFAULT_WIDTH = 420;

function prefsKey(appCode: string) {
	return `mlxDraftAgent.${appCode || '_'}`;
}

function readPrefs(appCode: string): Prefs {
	try {
		return JSON.parse(window.localStorage.getItem(prefsKey(appCode)) ?? '{}') ?? {};
	} catch {
		return {};
	}
}

function writePrefs(appCode: string, prefs: Prefs) {
	try {
		window.localStorage.setItem(prefsKey(appCode), JSON.stringify(prefs));
	} catch {
		/* private mode or blocked storage: the defaults are fine */
	}
}

// The chrome's icons are Font Awesome, and an app need not load it: its icon packs
// are its own choice. Same stylesheet as App.tsx's FREE_FONT_AWESOME_ALL pack, added
// once, only when no Font Awesome sheet is on the page already.
const FONT_AWESOME = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css';

function ensureFontAwesome() {
	try {
		const has = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(l =>
			/font-?awesome/i.test((l as HTMLLinkElement).href),
		);
		if (has) return;
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = FONT_AWESOME;
		document.head.appendChild(link);
	} catch {
		/* icons are decoration; the controls still have labels */
	}
}

/**
 * Make room for the agent beside the app instead of covering it.
 *
 * A margin on `#app` is not enough: an app's fixed header, its popups and anything
 * sized to the viewport ignore it and slide under the panel. So `#app` itself
 * becomes a fixed box beside the panel, and a transform makes it the containing
 * block for the app's own fixed elements, which then fit the narrower box too.
 * The page already scrolls inside its own container, so the box scrolling is the
 * same as before. Only `vw` units still see the whole window.
 */
function useReservedSpace(side: 'left' | 'right' | undefined, px: number) {
	useEffect(() => {
		if (!side || !px) return;
		const app = document.getElementById('app');
		if (!app) return;
		const prev = app.getAttribute('style');
		Object.assign(app.style, {
			position: 'fixed',
			top: '0px',
			bottom: '0px',
			left: side === 'left' ? `${px}px` : '0px',
			right: side === 'right' ? `${px}px` : '0px',
			width: 'auto',
			height: 'auto',
			overflow: 'auto',
			transform: 'translateZ(0)',
		});
		window.dispatchEvent(new Event('resize'));
		return () => {
			if (prev === null) app.removeAttribute('style');
			else app.setAttribute('style', prev);
			window.dispatchEvent(new Event('resize'));
		};
	}, [side, px]);
}

/**
 * The agent's chrome lives outside `#app`, which is the box made narrower above
 * and would otherwise squeeze the panel along with the page.
 */
function Chrome({ children }: Readonly<{ children: React.ReactNode }>) {
	return createPortal(
		<>
			<style>{DRAFT_AGENT_CSS}</style>
			{children}
		</>,
		document.body,
	);
}

/** AppBuilder's AI mark (Material `auto_awesome`), inline so no icon pack is needed. */
function Sparkle({ size = 20 }: Readonly<{ size?: number }>) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
			<path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
		</svg>
	);
}

function AgentIcon({ icon, size }: Readonly<{ icon?: string; size?: number }>) {
	return icon ? <i className={icon} /> : <Sparkle size={size} />;
}

function clamp(v: number, lo: number, hi: number) {
	return Math.min(hi, Math.max(lo, v));
}

function useStoreValue<T>(path: string, fallback?: T): T | undefined {
	const [v, setV] = useState<T | undefined>(() => getDataFromPath(path, []) ?? fallback);
	useEffect(
		() => addListenerAndCallImmediately(undefined, (_, value) => setV(value ?? fallback), path),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[path],
	);
	return v;
}

/** Drag anything by a handle. Returns the pointerdown handler; a click below the threshold is passed through. */
function useDrag(
	pos: { x: number; y: number },
	size: () => { w: number; h: number },
	onMove: (x: number, y: number) => void,
	onEnd: (x: number, y: number) => void,
	onClick?: () => void,
) {
	return useCallback(
		(e: React.PointerEvent) => {
			if (e.button !== 0) return;
			const target = e.currentTarget as HTMLElement;
			const startX = e.clientX;
			const startY = e.clientY;
			let moved = false;
			let last = pos;
			target.setPointerCapture?.(e.pointerId);
			const move = (ev: PointerEvent) => {
				const dx = ev.clientX - startX;
				const dy = ev.clientY - startY;
				if (!moved && Math.abs(dx) + Math.abs(dy) < 5) return;
				moved = true;
				const { w, h } = size();
				last = {
					x: clamp(pos.x + dx, 4, window.innerWidth - w - 4),
					y: clamp(pos.y + dy, 4, window.innerHeight - h - 4),
				};
				onMove(last.x, last.y);
			};
			const up = () => {
				target.removeEventListener('pointermove', move);
				target.removeEventListener('pointerup', up);
				target.removeEventListener('pointercancel', up);
				if (moved) onEnd(last.x, last.y);
				else onClick?.();
			};
			target.addEventListener('pointermove', move);
			target.addEventListener('pointerup', up);
			target.addEventListener('pointercancel', up);
		},
		[pos, size, onMove, onEnd, onClick],
	);
}

interface RunState {
	busy: boolean;
	status: string;
	error?: string;
	confirmation?: { id: string; message: string; sessionId: string };
}

export function DraftAgentApp(config: Readonly<DraftAgentConfig>) {
	const appCode = useStoreValue<string>('Store.application.appCode', '') ?? '';
	const props = useStoreValue<any>('Store.application.properties', {}) ?? {};
	const pageName = useStoreValue<string>('Store.urlDetails.pageName', '') ?? '';
	const [prefs, setPrefsState] = useState<Prefs>(() => readPrefs(appCode));
	const prefsRef = useRef(prefs);
	const setPrefs = useCallback(
		(patch: Partial<Prefs>) => {
			const next = { ...prefsRef.current, ...patch };
			prefsRef.current = next;
			setPrefsState(next);
			writePrefs(appCode, next);
		},
		[appCode],
	);
	useEffect(() => {
		const p = readPrefs(appCode);
		prefsRef.current = p;
		setPrefsState(p);
	}, [appCode]);

	const onDraftHost = !!globalThis.isDraftMode;
	// A live run signs in as this window's own user and talks to the agent the page
	// names; a draft run signs in as the builder and talks to appbuilder or leadzump.
	const runIn = toRunIn(config.runIn);
	const appMode = runIn === 'live';
	const agentName = toDraftAgent(config.agent || props.draftAgent);
	const agent = AGENTS[agentName];
	const liveAgent = (config.agent ?? '').trim().toLowerCase();
	const endpoint = appMode ? liveAgentEndpoint(liveAgent) : agent.endpoint;
	const agentTitle = appMode
		? liveAgent
			? liveAgent.charAt(0).toUpperCase() + liveAgent.slice(1)
			: 'AppBuilder'
		: agent.title;
	const draftMode = toDraftMode(config.draftMode || 'DRAFT');
	// This window's own sign-in, for `app` mode. Followed, not copied: the app's
	// refresher replaces the token every half hour and revokes the old one.
	const appAuth = useStoreValue<any>('Store.auth');
	const hostOverride: string | undefined = config.host || props.draftAgentHost || undefined;
	// Empty means AppBuilder's own AI mark (an inline SVG), not an icon-pack class.
	const icon: string = props.draftAgentIcon || config.icon || '';

	const [builderSession, setSession] = useState<AgentSession | undefined>(getAgentSession());
	const appSession = useMemo<AgentSession | undefined>(() => {
		if (!appMode || !appAuth?.accessToken) return undefined;
		const user = appAuth.user ?? {};
		return {
			accessToken: appAuth.accessToken,
			expiresAt: Number(appAuth.accessTokenExpiryAt) * 1000 || Date.now() + 30 * 60_000,
			appCode,
			clientCode: appAuth.loggedInClientCode ?? '',
			userName:
				[user.firstName, user.lastName].filter(Boolean).join(' ') || user.userName || '',
			origin: window.location.origin,
			label: props.title || appCode,
		};
	}, [appMode, appAuth, appCode, props.title]);
	const session = appMode ? appSession : builderSession;
	const [builderPhase, setPhase] = useState<'checking' | 'ready' | 'unavailable'>(
		getAgentSession() ? 'ready' : 'checking',
	);
	// In app mode there is nothing to look for: signed in or not is already known.
	const phase = appMode ? (appSession ? 'ready' : 'unavailable') : builderPhase;
	const [tried, setTried] = useState<ProbeOutcome[]>([]);

	const mode: DraftAgentMode = config.windowed ? 'right' : toMode(prefs.mode, config.defaultMode);
	const [menuOpen, setMenuOpen] = useState(false);
	const [connectOpen, setConnectOpen] = useState(false);
	const [run, setRun] = useState<RunState>({ busy: false, status: '' });
	const [reloadOwed, setReloadOwed] = useState(false);
	// Bumped by "New conversation" so the docked chat starts over. Not keyed on the
	// session id: a new chat learns its id mid-run, and remounting then would cut
	// the stream being watched.
	const [chatEpoch, setChatEpoch] = useState(0);
	const windowRef = useRef<Window | null>(null);
	const [windowOpen, setWindowOpen] = useState(false);

	useEffect(() => onAgentSession(s => setSession(s)), []);
	useEffect(() => {
		if (phase !== 'checking') ensureFontAwesome();
	}, [phase]);
	useEffect(() => {
		if (builderSession) setPhase('ready');
	}, [builderSession]);

	// ── Finding a builder session ─────────────────────────────────────────
	const askOpener = useCallback(async (): Promise<AgentSession | undefined> => {
		// The detached window is the draft app's own origin, so the page that opened
		// it can simply hand over the session it already has.
		const opener = window.opener as Window | null;
		if (!opener) return undefined;
		return new Promise(resolve => {
			const done = (s?: AgentSession) => {
				window.removeEventListener('message', onMsg);
				clearTimeout(t);
				resolve(s);
			};
			const onMsg = (e: MessageEvent) => {
				if (e.origin !== window.location.origin || e.source !== opener) return;
				if (e.data?.type !== MESSAGE_TYPE || e.data?.kind !== 'session') return;
				done(e.data.session);
			};
			window.addEventListener('message', onMsg);
			const t = setTimeout(() => done(undefined), 3000);
			opener.postMessage(
				{ type: MESSAGE_TYPE, kind: 'need-session' },
				window.location.origin,
			);
		});
	}, []);

	useEffect(() => {
		if (appMode || !appCode || getAgentSession()) return;
		let cancelled = false;
		(async () => {
			if (config.windowed) {
				const handed = await askOpener();
				if (cancelled) return;
				if (handed) {
					setAgentSession(handed);
					return;
				}
			}
			const { session: found, tried: t } = await findSession(
				appCode,
				agentName,
				hostOverride,
			);
			if (cancelled) return;
			setTried(t);
			if (!found) setPhase('unavailable');
		})();
		return () => {
			cancelled = true;
		};
	}, [appMode, appCode, agentName, hostOverride, config.windowed, askOpener]);

	// Keep the token alive while the page is open.
	useEffect(() => {
		const t = setInterval(() => {
			if (!appMode && getAgentSession()) freshSession();
		}, 60_000);
		return () => clearInterval(t);
	}, [appMode]);

	const connect = useCallback(
		async (origin: string) => {
			const env = draftEnvOf(window.location.hostname) ?? '';
			const builder = builderOrigins(env, agentName, hostOverride).find(
				b => b.origin === origin,
			);
			if (!builder) return;
			const o = await connectWithPopup(builder, appCode);
			setTried(prev => [
				...prev.filter(p => p.status === 'ok' || (p as any).origin !== origin),
				o,
			]);
			if (o.status === 'ok') {
				setAgentSession(o.session);
				setConnectOpen(false);
			}
		},
		[agentName, hostOverride, appCode],
	);

	// ── Seeing the agent's edits ──────────────────────────────────────────
	const onObjectChanged = useCallback(
		(change: ObjectChange) => {
			if (config.windowed && window.opener) {
				try {
					window.opener.postMessage(
						{ type: MESSAGE_TYPE, kind: 'object-changed', change },
						window.location.origin,
					);
				} catch {
					/* the opener went away; nothing to refresh */
				}
				return;
			}
			if (applyObjectChange(change)) setReloadOwed(true);
		},
		[config.windowed],
	);

	// The opener's side of the detached window.
	useEffect(() => {
		if (config.windowed) return;
		const onMsg = (e: MessageEvent) => {
			if (e.origin !== window.location.origin) return;
			if (!windowRef.current || e.source !== windowRef.current) return;
			const d = e.data;
			if (d?.type !== MESSAGE_TYPE) return;
			if (d.kind === 'need-session')
				windowRef.current.postMessage(
					{ type: MESSAGE_TYPE, kind: 'session', session: getAgentSession() },
					window.location.origin,
				);
			else if (d.kind === 'object-changed') {
				if (applyObjectChange(d.change)) setReloadOwed(true);
			} else if (d.kind === 'dock') setPrefs({ mode: toMode(d.mode, 'right') });
		};
		window.addEventListener('message', onMsg);
		const poll = setInterval(() => {
			if (windowRef.current?.closed) {
				windowRef.current = null;
				setWindowOpen(false);
			}
		}, 1000);
		return () => {
			window.removeEventListener('message', onMsg);
			clearInterval(poll);
		};
	}, [config.windowed, setPrefs]);

	const openWindow = useCallback(() => {
		const w = window.open(
			`${window.location.origin}${WINDOW_PATH}#${new URLSearchParams({
				app: appCode,
				runIn,
				agent: appMode ? liveAgent : agentName,
				draftMode,
			}).toString()}`,
			'mlxDraftAgentWindow',
			'popup=yes,width=520,height=820',
		);
		if (!w) {
			setRun(r => ({
				...r,
				error: 'The browser blocked the window. Allow pop-ups for this site.',
			}));
			return;
		}
		windowRef.current = w;
		setWindowOpen(true);
		w.focus();
	}, [appCode, runIn, appMode, liveAgent, agentName, draftMode]);

	const chooseMode = useCallback(
		(m: DraftAgentMode) => {
			setMenuOpen(false);
			if (config.windowed) {
				// Docking from the window: hand back to the page and close.
				window.opener?.postMessage(
					{ type: MESSAGE_TYPE, kind: 'dock', mode: m },
					window.location.origin,
				);
				window.close();
				return;
			}
			if (m === 'window') {
				openWindow();
				setPrefs({ mode: 'button' });
				return;
			}
			setPrefs(isMinimised(m) ? { mode: m } : { mode: m, panel: m as Prefs['panel'] });
		},
		[config.windowed, openWindow, setPrefs],
	);

	// ── The compact prompt's own run ──────────────────────────────────────
	const abortRef = useRef<AbortController | null>(null);
	const textRef = useRef('');
	// Steering, as in the Prompt (see Prompt/steer.ts): a message sent while a run
	// is going is queued into that run, never a second one.
	const steerQueue = useRef(new SteerQueue());
	const [queued, setQueued] = useState<string[]>([]);
	const syncQueued = useCallback(() => setQueued(steerQueue.current.texts()), []);
	const missedRef = useRef('');
	// Text the agent never read, going back to the floating prompt's box.
	const [handedBack, setHandedBack] = useState<{ text: string; key: number }>({
		text: '',
		key: 0,
	});
	const handBack = useCallback(
		(text: string) => text && setHandedBack(h => ({ text, key: h.key + 1 })),
		[],
	);

	const headers = useCallback(() => {
		if (appMode) {
			// Read at call time: the store holds the live token, the memo may be a refresh behind.
			const token = getDataFromPath('Store.auth.accessToken', []);
			const s = token ? { ...(appSession as AgentSession), accessToken: token } : appSession;
			return agentHeaders(s, appCode);
		}
		const s = getAgentSession();
		return agentHeaders(s, agent.appCodeHeader === 'builder' ? (s?.appCode ?? '') : appCode);
	}, [appMode, appSession, agent, appCode]);

	const surface = onDraftHost
		? `the running DRAFT of app '${appCode}', as its users would see it. Your page, theme and app edits land on this draft and the page refreshes to show them.`
		: `the LIVE app '${appCode}', as its users see it, signed in as the person asking. Edits land ${draftMode === 'LIVE' ? 'live' : 'as drafts unless said otherwise'}; the page refreshes to show what changed.`;

	// Picking a component on the page, with the page editor's own overlays. Only
	// while a panel is open in this window: the detached window is another document.
	const panelOpen = mode === 'left' || mode === 'right' || mode === 'compact';
	const picker = usePicker(pageName, !!session && panelOpen && !config.windowed);
	const pickedRef = useRef<PickedComponent[]>(picker.picked);
	pickedRef.current = picker.picked;

	// Read at send time, so it names the page and selection as they are now.
	const onScreenContext = useCallback((): Record<string, string> => {
		const active = activeObjectNow(pickedRef.current);
		return active ? { active_object: active } : {};
	}, []);

	const editorContext = useCallback(
		() => ({ surface, app_code: appCode, ...onScreenContext() }),
		[surface, appCode, onScreenContext],
	);

	const steer = useCallback(
		async (text: string) => {
			const sid = prefsRef.current.sessionId;
			if (!sid) {
				missedRef.current = missedRef.current ? `${missedRef.current}\n\n${text}` : text;
				return;
			}
			const steerId = newSteerId();
			steerQueue.current.add(steerId, text);
			syncQueued();
			const posted = await postSteer({
				baseUrl: agentBaseUrl(endpoint),
				headers: headers(),
				sessionId: sid,
				text,
				steerId,
			});
			if (posted === 'queued') return;
			steerQueue.current.drop(steerId);
			syncQueued();
			if (posted === 'missed') missedRef.current = text;
			else handBack(text);
		},
		[endpoint, headers, syncQueued, handBack],
	);

	const send = useCallback(
		async (message: string, attachments: Attachment[] = []) => {
			const text = message.trim();
			if (!text && !attachments.length) return;
			if (run.busy) {
				// Mid-run: queue it into this run. Text only, as in the Prompt.
				if (text) await steer(text);
				return;
			}
			await freshSession();
			const controller = new AbortController();
			abortRef.current = controller;
			textRef.current = '';
			setRun({ busy: true, status: 'Thinking...' });
			let sid = prefsRef.current.sessionId ?? null;
			let lostContact = false;
			try {
				const { status, outcome } = await followRun({
					endpoint,
					baseUrl: agentBaseUrl(endpoint),
					headers,
					signal: controller.signal,
					sessionId: () => sid,
					onReconnecting: () =>
						setRun(r => ({ ...r, status: 'Connection dropped. Reconnecting...' })),
					body: {
						message: text,
						session_id: sid,
						app_code: appCode,
						editor_context: editorContext(),
						draft_mode: draftMode,
						...(attachments.length
							? { attachments: await toChatAttachments(attachments) }
							: {}),
					},
					onEvent: ({ type, data }) => {
						if (data?.session_id && data.session_id !== sid) {
							sid = data.session_id;
							setPrefs({ sessionId: sid });
						}
						switch (type) {
							case 'replay_start':
								// A rejoin replays the turn from its start.
								textRef.current = '';
								break;
							case 'steer': {
								const verdict = steerQueue.current.settle(data);
								syncQueued();
								if (!verdict.applied) {
									if (verdict.ours) handBack(verdict.text);
									break;
								}
								// Read: what follows is the answer to it.
								textRef.current = '';
								setRun(r => ({ ...r, status: 'Thinking...' }));
								break;
							}
							case 'text':
								textRef.current += data.text ?? '';
								setRun(r => ({ ...r, status: tailOf(textRef.current) }));
								break;
							case 'tool_start':
								setRun(r => ({
									...r,
									status: `${data.display_name || data.tool_name || 'Working'}...`,
								}));
								break;
							case 'object_changed':
								onObjectChanged(data);
								break;
							case 'confirmation_request':
								setRun(r => ({
									...r,
									confirmation: {
										id: data.confirmation_id ?? '',
										message:
											data.message ||
											data.display_name ||
											'Allow this change?',
										sessionId: data.session_id ?? sid ?? '',
									},
								}));
								break;
							case 'error':
								setRun(r => ({
									...r,
									error: data.message ?? 'Something went wrong.',
								}));
								break;
						}
					},
				});
				if (outcome === 'over')
					// It finished while we were not connected, so its reply never
					// reached this line. Say where it is rather than nothing.
					setRun(r => ({
						...r,
						status:
							tailOf(textRef.current) ||
							'Done. Open the docked view to read the reply.',
					}));
				else if (outcome === 'lost')
					// Not an error: the run is on the server and carries on without
					// this connection. Saying "network error" here is what made a
					// change that went on to succeed look like a failure.
					lostContact = true;
				else if (status === 409)
					setRun(r => ({
						...r,
						error: 'The agent is still busy with this conversation. Open the docked view to follow it.',
					}));
				else if (status === 401 || status === 403) {
					setRun(r => ({ ...r, error: 'Your AI session ended. Reconnect to continue.' }));
					if (status === 401) setAgentSession(undefined);
				} else if (status >= 400)
					setRun(r => ({ ...r, error: `The agent answered ${status}.` }));
			} catch (e: any) {
				if (e?.name !== 'AbortError')
					setRun(r => ({ ...r, error: e?.message ?? 'Connection lost.' }));
			} finally {
				abortRef.current = null;
				// Queued and never read: the run ended first. Back to the box.
				for (const t of steerQueue.current.orphans()) handBack(t);
				syncQueued();
				setRun(r => ({
					...r,
					busy: false,
					confirmation: undefined,
					status: lostContact
						? 'Still working, but this window lost contact. Open the docked view to follow it.'
						: tailOf(textRef.current) || r.status,
				}));
			}
		},
		[
			run.busy,
			endpoint,
			draftMode,
			headers,
			appCode,
			editorContext,
			onObjectChanged,
			setPrefs,
			steer,
			syncQueued,
			handBack,
		],
	);

	// Send what missed its run as soon as the run is over.
	useEffect(() => {
		if (run.busy || !missedRef.current) return;
		const text = missedRef.current;
		missedRef.current = '';
		send(text);
	}, [run.busy, send]);

	const stop = useCallback(() => {
		const sid = prefsRef.current.sessionId;
		abortRef.current?.abort();
		if (sid)
			fetch(`${agentBaseUrl(endpoint)}/stop`, {
				method: 'POST',
				headers: headers(),
				body: JSON.stringify({ session_id: sid }),
			}).catch(() => undefined);
	}, [endpoint, headers]);

	const answer = useCallback(
		(approved: boolean) => {
			const c = run.confirmation;
			if (!c) return;
			setRun(r => ({ ...r, confirmation: undefined }));
			fetch(`${agentBaseUrl(endpoint)}/confirm`, {
				method: 'POST',
				headers: headers(),
				body: JSON.stringify({
					confirmation_id: c.id,
					session_id: c.sessionId,
					approved,
					selected: approved ? 'approve' : 'deny',
				}),
			}).catch(() => undefined);
		},
		[run.confirmation, endpoint, headers],
	);

	// A theme, style, app or shell change needs a full reload, which would cut a
	// run in progress. So it waits for the run to end, and in the docked view,
	// whose runs this component cannot see, it is offered as a button instead.
	useEffect(() => {
		if (!reloadOwed || run.busy) return;
		if (mode === 'compact' || mode === 'button') {
			const t = setTimeout(() => window.location.reload(), 800);
			return () => clearTimeout(t);
		}
	}, [reloadOwed, run.busy, mode]);

	// ── Rendering ─────────────────────────────────────────────────────────
	const docked = mode === 'left' || mode === 'right';
	// App mode signs in with the app: when nobody is signed in there is nothing to offer.
	// A live run with nobody signed in has nothing to offer: signing in is the app's job.
	const hidden = appMode ? !session : !session && phase !== 'ready' && !config.showWhenSignedOut;

	if (hidden) return <></>;

	const env = draftEnvOf(window.location.hostname) ?? '';
	const connectable = builderOrigins(env, agentName, hostOverride);

	const pickButton = config.windowed ? null : (
		<button
			className={`_mlxDAIconBtn ${picker.picking ? '_picking' : ''}`}
			onClick={picker.toggle}
			title={
				picker.picking
					? 'Click a component (Up arrow for its parent, Cmd/Ctrl-click for more, Esc to stop)'
					: 'Select a component on the page'
			}
			aria-label="Select a component on the page"
			aria-pressed={picker.picking}
		>
			<i className="fa fa-solid fa-arrow-pointer" />
		</button>
	);

	const pickedChips =
		picker.picked.length || picker.picking ? (
			<div className="_mlxDAPicked">
				{picker.picked.map(c => (
					<span key={c.key} className="_mlxDAPickedChip" title={`${c.type} - ${c.key}`}>
						<i className="fa fa-solid fa-arrow-pointer" />
						<span>
							{c.type} '{c.name || c.key}'
						</span>
						<button
							onClick={() => picker.remove(c.key)}
							title="Clear"
							aria-label={`Clear ${c.name || c.key}`}
						>
							<i className="fa fa-solid fa-xmark" />
						</button>
					</span>
				))}
				{picker.picking && !picker.picked.length && (
					<span className="_mlxDAPickHint">
						Click a component on the page. Up arrow selects its parent, Esc stops.
					</span>
				)}
			</div>
		) : null;

	const modeMenu = menuOpen ? (
		<div className="_mlxDAMenu" role="menu">
			{MODES.filter(m => !(config.windowed && m.mode === 'window')).map(m => (
				<button
					key={m.mode}
					role="menuitem"
					className={`_mlxDAMenuItem ${mode === m.mode ? '_active' : ''}`}
					onClick={() => chooseMode(m.mode)}
				>
					<i className={m.icon} />{' '}
					{config.windowed && m.mode !== 'window'
						? `Back to page: ${m.label.toLowerCase()}`
						: m.label}
				</button>
			))}
			<div className="_mlxDAMenuSep" />
			<button
				role="menuitem"
				className="_mlxDAMenuItem"
				onClick={() => {
					setMenuOpen(false);
					setPrefs({ sessionId: null });
					setRun({ busy: false, status: '' });
					setChatEpoch(e => e + 1);
				}}
			>
				<i className="fa fa-solid fa-plus" /> New conversation
			</button>
			{!appMode && (
				// Only the agent's own builder session can be ended here; in app mode the
				// session is the app's, and signing out of it belongs to the app.
				<button
					role="menuitem"
					className="_mlxDAMenuItem"
					onClick={() => {
						setMenuOpen(false);
						disconnect();
						setPhase('unavailable');
					}}
				>
					<i className="fa fa-solid fa-right-from-bracket" /> Disconnect{' '}
					{session?.label ?? ''}
				</button>
			)}
		</div>
	) : null;

	const reloadChip = reloadOwed ? (
		<button
			className="_mlxDAReload"
			onClick={() => window.location.reload()}
			title="Theme, style or app settings changed"
		>
			<i className="fa fa-solid fa-rotate-right" /> Reload to see all changes
		</button>
	) : null;

	if (!session) {
		const railTitle =
			phase === 'checking' ? 'Looking for your builder sign-in...' : 'Connect the AI';
		const toggleConnect = () => phase !== 'checking' && setConnectOpen(o => !o);
		let cardStyle: React.CSSProperties;
		if (config.windowed) cardStyle = { left: '50%', top: 80, transform: 'translateX(-50%)' };
		else cardStyle = connectPosition(prefs);
		return (
			<Chrome>
				{/* Not connected yet, whatever was open last: the FAB, dimmed. */}
				{!config.windowed && (
					<FloatingButton
						icon={icon}
						busy={false}
						dim
						prefs={prefs}
						setPrefs={setPrefs}
						title={railTitle}
						onClick={toggleConnect}
					/>
				)}
				{phase !== 'checking' && (connectOpen || config.windowed) && (
					<div className="_mlxDAConnect" style={cardStyle}>
						<div className="_mlxDAConnectTitle">Edit this draft with AI</div>
						<p className="_mlxDAConnectText">
							Sign in with the account that builds this app. The app's own sign-in is
							not used.
						</p>
						{connectable.map(b => {
							const o = tried.find(
								t => t.status !== 'ok' && (t as any).origin === b.origin,
							) as any;
							return (
								<div key={b.origin} className="_mlxDAConnectRow">
									<button
										className="_mlxDAConnectBtn"
										onClick={() => connect(b.origin)}
									>
										Continue with {b.label}
									</button>
									{o?.status === 'no-access' && (
										<span className="_mlxDAConnectNote">
											Signed in, but that account cannot edit this draft.
										</span>
									)}
									{o?.status === 'error' && o.message && (
										<span className="_mlxDAConnectNote">{o.message}</span>
									)}
								</div>
							);
						})}
					</div>
				)}
			</Chrome>
		);
	}

	if (mode === 'left' || mode === 'right') {
		return (
			<Chrome>
				<DockedPanel
					side={mode}
					windowed={!!config.windowed}
					width={prefs.width ?? DEFAULT_WIDTH}
					onWidth={w => setPrefs({ width: w })}
					title={agentTitle}
					session={session}
					menu={modeMenu}
					onMenu={() => setMenuOpen(o => !o)}
					onClose={() => (config.windowed ? window.close() : chooseMode('button'))}
					reloadChip={reloadChip}
					pickButton={pickButton}
				>
					<ChatPane
						key={chatEpoch}
						appCode={appCode}
						pageName={pageName}
						endpoint={endpoint}
						surface={surface}
						draftMode={draftMode}
						onDraftHost={onDraftHost}
						sessionId={prefs.sessionId ?? ''}
						onSession={id =>
							id && id !== prefsRef.current.sessionId && setPrefs({ sessionId: id })
						}
						headers={headers}
						onObjectChanged={onObjectChanged}
						pageDefinition={config.pageDefinition}
						locationHistory={config.locationHistory}
						contextPageName={config.contextPageName}
						editorContextExtra={onScreenContext}
						inputAddon={pickedChips}
					/>
				</DockedPanel>
			</Chrome>
		);
	}

	if (mode === 'compact') {
		return (
			<Chrome>
				<CompactPrompt
					prefs={prefs}
					setPrefs={setPrefs}
					run={run}
					placeholder={config.placeholder}
					onSend={send}
					queued={queued}
					handedBack={handedBack}
					onStop={stop}
					onAnswer={answer}
					onMenu={() => setMenuOpen(o => !o)}
					onMinimise={() => chooseMode('button')}
					onDismissError={() => setRun(r => ({ ...r, error: undefined }))}
					menu={modeMenu}
					reloadChip={reloadChip}
					pickButton={pickButton}
					pickedChips={pickedChips}
				/>
			</Chrome>
		);
	}

	const openPanel = () => {
		if (windowOpen && windowRef.current) windowRef.current.focus();
		// Whichever panel was used last (remembered per app in localStorage); the
		// floating prompt the first time.
		else chooseMode(prefs.panel ?? 'compact');
	};
	const openTitle = windowOpen ? 'The AI is open in another window' : `Open the ${agentTitle} AI`;

	return (
		<Chrome>
			<FloatingButton
				icon={icon}
				busy={run.busy}
				windowOpen={windowOpen}
				prefs={prefs}
				setPrefs={setPrefs}
				title={openTitle}
				onClick={openPanel}
			/>
			{reloadChip && <div className="_mlxDAReloadFloat">{reloadChip}</div>}
		</Chrome>
	);
}

function connectPosition(prefs: Prefs): React.CSSProperties {
	const bx = prefs.bx ?? window.innerWidth - 76;
	const by = prefs.by ?? window.innerHeight - 110;
	const left = clamp(bx - 260, 8, window.innerWidth - 328);
	const top = by > 300 ? undefined : by + 64;
	return top === undefined ? { left, bottom: window.innerHeight - by + 10 } : { left, top };
}

function FloatingButton({
	icon,
	busy,
	dim,
	windowOpen,
	prefs,
	setPrefs,
	title,
	onClick,
}: Readonly<{
	icon: string;
	busy: boolean;
	dim?: boolean;
	windowOpen?: boolean;
	prefs: Prefs;
	setPrefs: (p: Partial<Prefs>) => void;
	title: string;
	onClick: () => void;
}>) {
	const SIZE = 52;
	const [pos, setPos] = useState(() => ({
		x: clamp(prefs.bx ?? window.innerWidth - SIZE - 24, 4, window.innerWidth - SIZE - 4),
		y: clamp(prefs.by ?? window.innerHeight - SIZE - 120, 4, window.innerHeight - SIZE - 4),
	}));
	const size = useCallback(() => ({ w: SIZE, h: SIZE }), []);
	const onDown = useDrag(
		pos,
		size,
		(x, y) => setPos({ x, y }),
		(x, y) => setPrefs({ bx: x, by: y }),
		onClick,
	);
	return (
		<button
			className={`_mlxDAButton ${busy ? '_busy' : ''} ${dim ? '_dim' : ''} ${windowOpen ? '_away' : ''}`}
			style={{ left: pos.x, top: pos.y }}
			title={title}
			aria-label={title}
			onPointerDown={onDown}
			onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
		>
			<span className="_mlxDARing" aria-hidden="true" />
			<span className="_mlxDAButtonFace">
				<AgentIcon icon={icon} size={22} />
			</span>
		</button>
	);
}

function CompactPrompt({
	prefs,
	setPrefs,
	run,
	placeholder,
	onSend,
	queued,
	handedBack,
	onStop,
	onAnswer,
	onMenu,
	onMinimise,
	onDismissError,
	menu,
	reloadChip,
	pickButton,
	pickedChips,
}: Readonly<{
	prefs: Prefs;
	setPrefs: (p: Partial<Prefs>) => void;
	run: RunState;
	placeholder: string;
	onSend: (m: string, attachments: Attachment[]) => void;
	queued: string[];
	handedBack: { text: string; key: number };
	onStop: () => void;
	onAnswer: (approved: boolean) => void;
	onMenu: () => void;
	onMinimise: () => void;
	onDismissError: () => void;
	menu: React.ReactNode;
	reloadChip: React.ReactNode;
	pickButton: React.ReactNode;
	pickedChips: React.ReactNode;
}>) {
	const WIDTH = Math.min(440, window.innerWidth - 16);
	const boxRef = useRef<HTMLDivElement>(null);
	const [text, setText] = useState('');
	// Keyed on the hand-back, not its text: the same words twice still come back.
	const lastHandBack = useRef(0);
	useEffect(() => {
		if (!handedBack.key || handedBack.key === lastHandBack.current) return;
		lastHandBack.current = handedBack.key;
		setText(t => (t.trim() ? `${t.trim()}\n\n${handedBack.text}` : handedBack.text));
	}, [handedBack]);
	const [pos, setPos] = useState(() => ({
		x: clamp(prefs.x ?? (window.innerWidth - WIDTH) / 2, 4, window.innerWidth - WIDTH - 4),
		y: clamp(prefs.y ?? window.innerHeight - 140, 4, window.innerHeight - 64),
	}));
	const size = useCallback(
		() => ({ w: boxRef.current?.offsetWidth ?? WIDTH, h: boxRef.current?.offsetHeight ?? 56 }),
		[WIDTH],
	);
	const onDown = useDrag(
		pos,
		size,
		(x, y) => setPos({ x, y }),
		(x, y) => setPrefs({ x, y }),
	);
	const taRef = useRef<HTMLTextAreaElement>(null);
	useEffect(() => {
		const ta = taRef.current;
		if (!ta) return;
		ta.style.height = 'auto';
		ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
		// A scrollbar only once the text outgrows the box; before that the empty
		// track showed beside the send button.
		ta.style.overflowY = ta.scrollHeight > 120 ? 'auto' : 'hidden';
	}, [text]);

	// Images and files, as the Prompt component takes them: picked, pasted or dropped.
	const [attachments, setAttachments] = useState<Attachment[]>([]);
	const fileRef = useRef<HTMLInputElement>(null);
	const [dragging, setDragging] = useState(false);
	const addFiles = (files: FileList | File[] | null | undefined) => {
		const picked = Array.from(files ?? []).map(file => ({
			id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
			type: (file.type.startsWith('image/') ? 'image' : 'file') as Attachment['type'],
			name: file.name || 'pasted-image.png',
			url: URL.createObjectURL(file),
			mimeType: file.type,
			file,
		}));
		if (picked.length) setAttachments(prev => [...prev, ...picked]);
	};
	const removeAttachment = (id: string) =>
		setAttachments(prev => {
			const gone = prev.find(a => a.id === id);
			if (gone?.url.startsWith('blob:')) URL.revokeObjectURL(gone.url);
			return prev.filter(a => a.id !== id);
		});

	const submit = () => {
		if (!text.trim() && !attachments.length) return;
		// Mid-run this queues the text into the run (attachments wait for the next send).
		if (run.busy && !text.trim()) return;
		onSend(text, run.busy ? [] : attachments);
		setText('');
		// The object URLs are not revoked here: the send reads the files first.
		if (!run.busy) setAttachments([]);
	};

	return (
		<div
			ref={boxRef}
			className={`_mlxDACompact ${run.busy ? '_busy' : ''} ${dragging ? '_dragging' : ''}`}
			style={{ left: pos.x, top: pos.y, width: WIDTH }}
			onDragOver={e => {
				if (!Array.from(e.dataTransfer.types).includes('Files')) return;
				e.preventDefault();
				setDragging(true);
			}}
			onDragLeave={() => setDragging(false)}
			onDrop={e => {
				if (!e.dataTransfer.files?.length) return;
				e.preventDefault();
				setDragging(false);
				addFiles(e.dataTransfer.files);
			}}
		>
			<span className="_mlxDARing" aria-hidden="true" />
			<div className="_mlxDACompactInner">
				{pickedChips}
				{attachments.length > 0 && (
					<div className="_mlxDAAttachments">
						{attachments.map(a => (
							<span key={a.id} className="_mlxDAAttachment" title={a.name}>
								{a.type === 'image' ? (
									<img src={a.url} alt={a.name} />
								) : (
									<span className="_mlxDAAttachmentFile">
										<i className="fa fa-solid fa-file" /> {a.name}
									</span>
								)}
								<button
									className="_mlxDAAttachmentRemove"
									onClick={() => removeAttachment(a.id)}
									title="Remove"
									aria-label={`Remove ${a.name}`}
								>
									<i className="fa fa-solid fa-xmark" />
								</button>
							</span>
						))}
					</div>
				)}
				<div className="_mlxDACompactRow">
					<button
						className="_mlxDAGrip"
						onPointerDown={onDown}
						title="Drag"
						aria-label="Drag"
					>
						<i className="fa fa-solid fa-grip-vertical" />
					</button>
					<button
						className="_mlxDAIconBtn"
						onClick={() => fileRef.current?.click()}
						title="Add images or files"
						aria-label="Add images or files"
					>
						<i className="fa fa-solid fa-plus" />
					</button>
					{pickButton}
					<input
						ref={fileRef}
						type="file"
						multiple
						accept="image/*,.pdf,.txt,.csv,.json,.xml,.doc,.docx,.xls,.xlsx"
						style={{ display: 'none' }}
						onChange={e => {
							addFiles(e.target.files);
							e.target.value = '';
						}}
					/>
					<textarea
						ref={taRef}
						className="_mlxDAInput"
						rows={1}
						value={text}
						placeholder={
							run.busy ? 'Send a message to steer the agent...' : placeholder
						}
						onChange={e => setText(e.target.value)}
						onPaste={e => {
							const images = Array.from(e.clipboardData?.items ?? [])
								.filter(i => i.type.startsWith('image/'))
								.map(i => i.getAsFile())
								.filter((f): f is File => !!f);
							if (!images.length) return;
							e.preventDefault();
							addFiles(images);
						}}
						onKeyDown={e => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								submit();
							}
						}}
					/>
					{run.busy && text.trim() ? (
						<button
							className="_mlxDAIconBtn _send"
							onClick={submit}
							title="Send to the running turn"
							aria-label="Send to the running turn"
						>
							<i className="fa fa-solid fa-arrow-up" />
						</button>
					) : null}
					{run.busy ? (
						<button
							className="_mlxDAIconBtn _send"
							onClick={onStop}
							title="Stop"
							aria-label="Stop"
						>
							<i className="fa fa-solid fa-stop" />
						</button>
					) : (
						<button
							className="_mlxDAIconBtn _send"
							onClick={submit}
							disabled={!text.trim() && !attachments.length}
							title="Send"
							aria-label="Send"
						>
							<i className="fa fa-solid fa-arrow-up" />
						</button>
					)}
					<button
						className="_mlxDAIconBtn"
						onClick={onMenu}
						title="Layout and options"
						aria-label="Layout and options"
					>
						<i className="fa fa-solid fa-ellipsis" />
					</button>
					<button
						className="_mlxDAIconBtn"
						onClick={onMinimise}
						title="Minimise"
						aria-label="Minimise"
					>
						<i className="fa fa-solid fa-minus" />
					</button>
				</div>
				{queued.map((q, i) => (
					<div className="_mlxDAStatus _queued" key={`${i}_${q}`}>
						<span className="_mlxDAQueuedText">{q}</span> {QUEUED_NOTE}
					</div>
				))}
				{(run.status || run.error) && (
					<div className={`_mlxDAStatus ${run.error ? '_error' : ''}`}>
						{run.error ? (
							<>
								<span>{run.error}</span>
								<button className="_mlxDALink" onClick={onDismissError}>
									Dismiss
								</button>
							</>
						) : (
							run.status
						)}
					</div>
				)}
				{run.confirmation && (
					<div className="_mlxDAConfirm">
						<span>{run.confirmation.message}</span>
						<button className="_mlxDAConfirmBtn _yes" onClick={() => onAnswer(true)}>
							Allow
						</button>
						<button className="_mlxDAConfirmBtn" onClick={() => onAnswer(false)}>
							Deny
						</button>
					</div>
				)}
				{reloadChip}
			</div>
			{menu && <div className="_mlxDAMenuWrap _up">{menu}</div>}
		</div>
	);
}

function DockedPanel({
	side,
	windowed,
	width,
	onWidth,
	title,
	session,
	menu,
	onMenu,
	onClose,
	reloadChip,
	pickButton,
	children,
}: Readonly<{
	side: 'left' | 'right';
	windowed: boolean;
	width: number;
	onWidth: (w: number) => void;
	title: string;
	session: AgentSession;
	menu: React.ReactNode;
	onMenu: () => void;
	onClose: () => void;
	reloadChip: React.ReactNode;
	pickButton?: React.ReactNode;
	children: React.ReactNode;
}>) {
	const [w, setW] = useState(clamp(width, MIN_WIDTH, MAX_WIDTH));

	// Take the room the panel needs, live while it is being resized.
	useReservedSpace(windowed ? undefined : side, w);

	const onResize = (e: React.PointerEvent) => {
		e.preventDefault();
		const startX = e.clientX;
		const startW = w;
		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture?.(e.pointerId);
		let last = startW;
		const move = (ev: PointerEvent) => {
			const dx = ev.clientX - startX;
			last = clamp(side === 'right' ? startW - dx : startW + dx, MIN_WIDTH, MAX_WIDTH);
			setW(last);
		};
		const up = () => {
			target.removeEventListener('pointermove', move);
			target.removeEventListener('pointerup', up);
			onWidth(last);
		};
		target.addEventListener('pointermove', move);
		target.addEventListener('pointerup', up);
	};

	return (
		<div
			className={`_mlxDADock _${side} ${windowed ? '_windowed' : ''}`}
			style={windowed ? undefined : { width: w }}
		>
			{!windowed && (
				<div
					className="_mlxDAResizer"
					onPointerDown={onResize}
					aria-label="Resize the AI panel"
					role="separator"
				/>
			)}
			<div className="_mlxDAHeader">
				<span className="_mlxDAHeaderIcon">
					<Sparkle size={18} />
				</span>
				<span className="_mlxDATitle">{title} AI</span>
				<span className="_mlxDAWho" title={`Signed in through ${session.label}`}>
					{session.userName ? `${session.userName} · ` : ''}
					{session.label}
				</span>
				{pickButton}
				<button
					className="_mlxDAIconBtn"
					onClick={onMenu}
					title="Layout and options"
					aria-label="Layout and options"
				>
					<i className="fa fa-solid fa-ellipsis" />
				</button>
				<button
					className="_mlxDAIconBtn"
					onClick={onClose}
					title={windowed ? 'Close window' : 'Minimise'}
					aria-label="Close"
				>
					<i className="fa fa-solid fa-xmark" />
				</button>
				{menu && <div className="_mlxDAMenuWrap _down">{menu}</div>}
			</div>
			{reloadChip && <div className="_mlxDADockNotice">{reloadChip}</div>}
			<div className="_mlxDABody">{children}</div>
		</div>
	);
}

/** The full chat, which is the platform's own Prompt component signed in as the builder. */
function ChatPane({
	appCode,
	pageName,
	endpoint,
	surface,
	draftMode,
	onDraftHost,
	sessionId,
	onSession,
	headers,
	onObjectChanged,
	pageDefinition,
	locationHistory,
	contextPageName,
	editorContextExtra,
	inputAddon,
}: Readonly<{
	appCode: string;
	pageName: string;
	endpoint: string;
	surface: string;
	draftMode: string;
	onDraftHost: boolean;
	sessionId: string;
	onSession: (id: string | null) => void;
	headers: () => Record<string, string>;
	onObjectChanged: (c: ObjectChange) => void;
	pageDefinition?: PageDefinition;
	locationHistory?: Array<any>;
	contextPageName?: string;
	/** The page on screen and what is picked on it, read when a message is sent. */
	editorContextExtra?: () => Record<string, string>;
	/** Shown above the chat's input: the picked components. */
	inputAddon?: React.ReactNode;
}>) {
	usedComponents.using('Prompt');
	const Prompt = PromptComponent.component as React.ComponentType<any>;

	const definition = useMemo<ComponentDefinition>(
		() => ({
			key: 'mlxDraftAgentChat',
			name: 'mlxDraftAgentChat',
			type: 'Prompt',
			properties: {
				agentEndpoint: { value: endpoint },
				targetAppCode: { value: appCode },
				initialSessionId: { value: sessionId },
				contextSurface: { value: surface },
				activeObject: { value: pageName ? `page '${pageName}'` : '' },
				draftMode: { value: draftMode },
				placeholder: { value: 'Describe a change to this app...' },
				welcomeMessage: {
					value: onDraftHost
						? 'What should we change? Your edits go to this draft, not live.'
						: draftMode === 'LIVE'
							? 'What should we change? Edits go live straight away.'
							: 'What should we change? Edits are saved as drafts for review.',
				},
				showSessions: { value: true },
				sessionsMode: { value: '_overlay' },
				showToolCalls: { value: true },
				enableFeedback: { value: false },
				enableVoiceInput: { value: false },
				showModelSelector: { value: false },
			},
		}),
		// The session is read once on mount; following it afterwards would remount the chat.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[endpoint, appCode, pageName, surface, draftMode, onDraftHost],
	);

	const pageDef = useMemo<PageDefinition>(
		() =>
			pageDefinition ??
			({
				name: contextPageName ?? '_mlxDraftAgent',
				eventFunctions: {},
				componentDefinition: {},
			} as any),
		[pageDefinition, contextPageName],
	);

	return (
		<Prompt
			definition={definition}
			pageDefinition={pageDef}
			locationHistory={locationHistory ?? []}
			context={{ pageName: contextPageName ?? '_mlxDraftAgent' }}
			authHeaders={headers}
			onObjectSaved={onObjectChanged}
			onSessionChange={onSession}
			editorContextExtra={editorContextExtra}
			inputAddon={inputAddon}
		/>
	);
}

export default function LazyDraftAgent(props: Readonly<ComponentProps>) {
	// Placed on a page: the page's own definition supplies the settings, and the
	// copy every draft host gets on its own stands aside while this one is mounted.
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(props.context.pageName);
	const {
		properties: {
			defaultMode = 'button',
			agent = '',
			host = '',
			runIn = 'draft',
			draftMode = 'DRAFT',
			icon = '',
			placeholder = 'Ask the AI to change this app...',
			showWhenSignedOut = true,
		} = {},
	} = useDefinition(
		props.definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		props.locationHistory,
		pageExtractor,
		urlExtractor,
	);

	// A draft run shows only on the draft host, a live run only on the live app.
	const shows = !globalThis.isDesignMode && runsHere(toRunIn(runIn), !!globalThis.isDraftMode);
	// Only a draft run that is actually showing replaces the copy every draft host gets:
	// a live run placed on the same page must not leave the draft without its agent.
	const replacesDraftCopy = shows && toRunIn(runIn) === 'draft';
	useEffect(() => (replacesDraftCopy ? claimPlacement() : undefined), [replacesDraftCopy]);

	if (!shows) return <></>;

	return (
		<DraftAgentApp
			defaultMode={toMode(defaultMode)}
			icon={icon}
			agent={agent}
			host={host}
			runIn={runIn}
			draftMode={draftMode}
			showWhenSignedOut={showWhenSignedOut !== false}
			placeholder={placeholder}
			pageDefinition={props.pageDefinition}
			locationHistory={props.locationHistory}
			contextPageName={props.context?.pageName}
		/>
	);
}
