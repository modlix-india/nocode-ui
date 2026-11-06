import type { IncomingMessage, ServerResponse } from 'node:http';
import { getConfig } from '../config/configLoader.js';
import logger from '../config/logger.js';
import { botFor, type KnownBot } from '../render/bots.js';
import { resolveCodesFromRequest } from '../resolver/codeResolver.js';

/**
 * Crawler visits, seen where they can be seen (PLAT-1551).
 *
 * Most AI crawlers (GPTBot, PerplexityBot, ClaudeBot and the rest) run no JavaScript, so the
 * analytics beacon never sees them. This server does: every page they fetch passes through it.
 * Each page a known bot fetched (`render/bots.ts`) is reported to the analytics engine's `POST /c`
 * as { site, path, bot, ai, status }, and the engine files it under the site's own crawl
 * partition, where the `crawlerVisits` widget reads it per app.
 *
 * Nothing here may slow or fail a response:
 * - the hook only checks the User-Agent on the way in; everything else happens after the
 *   response has finished (`res.on('finish')`);
 * - visits wait in a bounded in-memory queue and go out in batches on a timer; a full queue drops
 *   the newest, a failed send drops that batch, and neither is retried;
 * - every step is inside a catch, and a send has a hard time limit.
 *
 * Off unless the engine's private address (the one the ui service reads `/q` from; never the public
 * Worker) and its server secret are both set: ANALYTICS_ENGINE_URL and ANALYTICS_SERVER_SECRET, or,
 * when those are absent, `ui.analytics.engine.url` and `ui.analytics.engine.serverSecret` from the
 * config server (how the units' hosts configure ssr).
 *
 * A bot visit keeps the bot's name, the path, the status and the time. No IP, no User-Agent
 * string, nothing from a person.
 */

/** Bots whose purpose is an AI model's training or answers. */
export function isAiBot(bot: KnownBot): boolean {
	return bot.purpose.startsWith('ai-');
}

export interface CrawlerVisit {
	/** The engine's site key: app code lower case, client code upper (`site_key` in ui-shell). */
	s: string;
	/** The path that was fetched, without the query string. */
	u: string;
	bot: string;
	ai: boolean;
	/** The status the page answered with. */
	st: number;
}

interface Settings {
	url: string;
	secret: string;
	maxQueue: number;
	maxBatch: number;
	flushEveryMs: number;
	sendTimeoutMs: number;
	/** Visits whose site is still being resolved; past this they are dropped, not awaited. */
	maxResolving: number;
}

function fromConfig(): { engineUrl?: string; serverSecret?: string } {
	try {
		return getConfig().analytics;
	} catch {
		return {}; // config not loaded (tests, early start): the environment alone decides
	}
}

function settingsFromEnv(): Settings {
	const cfg = fromConfig();
	return {
		url: (process.env.ANALYTICS_ENGINE_URL || cfg.engineUrl || '').trim().replace(/\/+$/, ''),
		secret: (process.env.ANALYTICS_SERVER_SECRET || cfg.serverSecret || '').trim(),
		maxQueue: 2000,
		maxBatch: 200,
		flushEveryMs: 5000,
		sendTimeoutMs: 3000,
		maxResolving: 64,
	};
}

let settings: Settings | undefined;
let queue: CrawlerVisit[] = [];
let resolving = 0;
let sending = false;
let timer: NodeJS.Timeout | undefined;
let lastWarnAt = 0;

const stats = { observed: 0, queued: 0, sent: 0, dropped: 0 };

function current(): Settings {
	if (!settings) settings = settingsFromEnv();
	return settings;
}

export function crawlerVisitsEnabled(): boolean {
	const s = current();
	return !!s.url && !!s.secret;
}

// Files the bots fetch alongside a page; the page itself is what is counted.
const ASSET = /\.(?:js|mjs|cjs|css|map|json|png|jpe?g|gif|svg|webp|avif|ico|bmp|woff2?|ttf|otf|eot|mp4|webm|mp3|pdf|zip|gz|br|wasm)$/i;

/** The path to report for a request URL, or undefined when it is not a page. */
export function pagePathOf(rawUrl: string | undefined): string | undefined {
	let path = rawUrl || '/';
	const q = path.search(/[?#]/);
	if (q >= 0) path = path.slice(0, q);
	if (!path.startsWith('/')) return undefined;
	if (path.startsWith('/api/') || path === '/health') return undefined;
	if (ASSET.test(path)) return undefined;
	return path.length > 512 ? path.slice(0, 512) : path;
}

/** `site_key` in ui-shell, so the engine's site for a page and for a dashboard query agree. */
export function siteKey(appCode: string, clientCode: string): string {
	return `${appCode.toLowerCase()}_${clientCode.toUpperCase()}`;
}

/**
 * The hook. Called once per page request before it is handled; returns at once.
 */
export function observeCrawlerVisit(req: IncomingMessage, res: ServerResponse): void {
	try {
		if (req.method !== 'GET' && req.method !== 'HEAD') return;
		const bot = botFor(req.headers['user-agent']);
		if (!bot) return;
		if (!crawlerVisitsEnabled()) return;
		const path = pagePathOf(req.url);
		if (!path) return;
		stats.observed++;
		res.once('finish', () => {
			void record(req, path, bot, res.statusCode).catch(() => undefined);
		});
	} catch {
		// Never the response's problem.
	}
}

async function record(req: IncomingMessage, path: string, bot: KnownBot, status: number): Promise<void> {
	const s = current();
	if (queue.length >= s.maxQueue || resolving >= s.maxResolving) {
		stats.dropped++;
		return;
	}
	resolving++;
	try {
		const headers = new Headers();
		for (const [k, v] of Object.entries(req.headers)) {
			if (v === undefined) continue;
			if (Array.isArray(v)) v.forEach(x => headers.append(k, x));
			else headers.set(k, v);
		}
		// The same resolution the page itself used (cached in Redis for ten minutes).
		const codes = await resolveCodesFromRequest({
			url: `http://${req.headers.host ?? 'localhost'}${req.url ?? '/'}`,
			headers,
		} as Request);
		if (!codes.appCode || codes.appCode === 'nothing' || !codes.clientCode) {
			stats.dropped++;
			return;
		}
		enqueue({ s: siteKey(codes.appCode, codes.clientCode), u: path, bot: bot.token, ai: isAiBot(bot), st: status });
	} catch {
		stats.dropped++;
	} finally {
		resolving--;
	}
}

function enqueue(visit: CrawlerVisit): void {
	const s = current();
	if (queue.length >= s.maxQueue) {
		stats.dropped++;
		return;
	}
	queue.push(visit);
	stats.queued++;
	if (!timer) {
		timer = setInterval(() => void flushCrawlerVisits(), s.flushEveryMs);
		timer.unref();
	}
	if (queue.length >= s.maxBatch) setImmediate(() => void flushCrawlerVisits());
}

/**
 * Sends what is queued, one batch at a time. Exported for tests and for a shutdown that wants
 * the last few out; resolves when done and never rejects.
 */
export async function flushCrawlerVisits(): Promise<void> {
	if (sending || queue.length === 0) return;
	const s = current();
	sending = true;
	try {
		while (queue.length > 0) {
			const batch = queue.splice(0, s.maxBatch);
			try {
				const r = await fetch(`${s.url}/c`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.secret}` },
					body: JSON.stringify({ b: batch }),
					signal: AbortSignal.timeout(s.sendTimeoutMs),
				});
				if (!r.ok) throw new Error(`analytics engine answered ${r.status}`);
				stats.sent += batch.length;
			} catch (error) {
				stats.dropped += batch.length;
				// One line a minute at most: an engine that is down must not flood the log.
				if (Date.now() - lastWarnAt > 60_000) {
					lastWarnAt = Date.now();
					logger.warn('Crawler visits not sent; dropped', { count: batch.length, error: String(error) });
				}
				break;
			}
		}
	} finally {
		sending = false;
	}
}

export function crawlerVisitStats(): Readonly<typeof stats> & { queue: number } {
	return { ...stats, queue: queue.length };
}

/** Tests only: replace the settings and empty the queue. */
export function resetCrawlerVisitsForTests(overrides: Partial<Settings> = {}): void {
	settings = { ...settingsFromEnv(), ...overrides };
	queue = [];
	resolving = 0;
	sending = false;
	if (timer) clearInterval(timer);
	timer = undefined;
	stats.observed = stats.queued = stats.sent = stats.dropped = 0;
}
