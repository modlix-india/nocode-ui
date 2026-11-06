/**
 * Crawlers and AI fetchers, by User-Agent: the one list the SSR uses to tell a bot from a person
 * (server rendering for bots, PLAT-1545; AI crawler visit logging, PLAT-1551). Add a bot here and
 * every caller sees it.
 *
 * `runsScripts` says whether the bot executes the page's JavaScript. Search engines that render
 * (Googlebot, bingbot, Applebot and a few others) get a document that still hydrates; the AI
 * fetchers that only read the HTML get a lean one without the client's bootstrap data, so the
 * text is near the top of a small document. A bot listed as not running scripts that does run
 * them still gets a working page: the client then loads the definitions itself.
 *
 * Matched case-insensitively as a substring of the User-Agent, on a word boundary before it.
 */
export interface KnownBot {
	/** The product token as it appears in the User-Agent. */
	token: string;
	/** Who runs it, for logs and reports. */
	operator: string;
	/** What it is for: an AI model's training or answers, or a search index. */
	purpose: 'ai-training' | 'ai-search' | 'ai-user' | 'search' | 'other';
	runsScripts: boolean;
}

export const KNOWN_BOTS: readonly KnownBot[] = [
	// OpenAI
	{ token: 'GPTBot', operator: 'OpenAI', purpose: 'ai-training', runsScripts: false },
	{ token: 'OAI-SearchBot', operator: 'OpenAI', purpose: 'ai-search', runsScripts: false },
	{ token: 'ChatGPT-User', operator: 'OpenAI', purpose: 'ai-user', runsScripts: false },
	// Anthropic
	{ token: 'ClaudeBot', operator: 'Anthropic', purpose: 'ai-training', runsScripts: false },
	{ token: 'Claude-SearchBot', operator: 'Anthropic', purpose: 'ai-search', runsScripts: false },
	{ token: 'Claude-User', operator: 'Anthropic', purpose: 'ai-user', runsScripts: false },
	{ token: 'Claude-Web', operator: 'Anthropic', purpose: 'ai-user', runsScripts: false },
	{ token: 'anthropic-ai', operator: 'Anthropic', purpose: 'ai-training', runsScripts: false },
	// Perplexity
	{ token: 'PerplexityBot', operator: 'Perplexity', purpose: 'ai-search', runsScripts: false },
	{ token: 'Perplexity-User', operator: 'Perplexity', purpose: 'ai-user', runsScripts: false },
	// Google (Google-Extended is a robots.txt token, listed for any fetcher that sends it)
	{ token: 'Google-Extended', operator: 'Google', purpose: 'ai-training', runsScripts: false },
	{ token: 'Google-CloudVertexBot', operator: 'Google', purpose: 'ai-search', runsScripts: false },
	{ token: 'Googlebot', operator: 'Google', purpose: 'search', runsScripts: true },
	{ token: 'Google-InspectionTool', operator: 'Google', purpose: 'search', runsScripts: true },
	{ token: 'GoogleOther', operator: 'Google', purpose: 'other', runsScripts: false },
	{ token: 'Storebot-Google', operator: 'Google', purpose: 'search', runsScripts: true },
	{ token: 'AdsBot-Google', operator: 'Google', purpose: 'other', runsScripts: true },
	// Microsoft
	{ token: 'bingbot', operator: 'Microsoft', purpose: 'search', runsScripts: true },
	{ token: 'BingPreview', operator: 'Microsoft', purpose: 'search', runsScripts: true },
	// Apple
	{ token: 'Applebot-Extended', operator: 'Apple', purpose: 'ai-training', runsScripts: false },
	{ token: 'Applebot', operator: 'Apple', purpose: 'search', runsScripts: true },
	// Others
	{ token: 'CCBot', operator: 'Common Crawl', purpose: 'ai-training', runsScripts: false },
	{ token: 'meta-externalagent', operator: 'Meta', purpose: 'ai-training', runsScripts: false },
	{ token: 'meta-externalfetcher', operator: 'Meta', purpose: 'ai-user', runsScripts: false },
	{ token: 'FacebookBot', operator: 'Meta', purpose: 'ai-training', runsScripts: false },
	{ token: 'Bytespider', operator: 'ByteDance', purpose: 'ai-training', runsScripts: false },
	{ token: 'Amazonbot', operator: 'Amazon', purpose: 'ai-search', runsScripts: false },
	{ token: 'cohere-ai', operator: 'Cohere', purpose: 'ai-training', runsScripts: false },
	{ token: 'MistralAI-User', operator: 'Mistral', purpose: 'ai-user', runsScripts: false },
	{ token: 'YouBot', operator: 'You.com', purpose: 'ai-search', runsScripts: false },
	{ token: 'Diffbot', operator: 'Diffbot', purpose: 'ai-training', runsScripts: false },
	{ token: 'DuckAssistBot', operator: 'DuckDuckGo', purpose: 'ai-search', runsScripts: false },
	{ token: 'DuckDuckBot', operator: 'DuckDuckGo', purpose: 'search', runsScripts: false },
	{ token: 'YandexBot', operator: 'Yandex', purpose: 'search', runsScripts: true },
	{ token: 'Baiduspider', operator: 'Baidu', purpose: 'search', runsScripts: false },
	{ token: 'PetalBot', operator: 'Huawei', purpose: 'search', runsScripts: false },
	{ token: 'SeznamBot', operator: 'Seznam', purpose: 'search', runsScripts: false },
	{ token: 'Timpibot', operator: 'Timpi', purpose: 'ai-training', runsScripts: false },
	{ token: 'ImagesiftBot', operator: 'ImageSift', purpose: 'ai-training', runsScripts: false },
	{ token: 'omgili', operator: 'Webz.io', purpose: 'ai-training', runsScripts: false },
];

/** The tokens alone, for callers that only need the names. */
export const BOT_USER_AGENT_TOKENS: readonly string[] = KNOWN_BOTS.map(b => b.token);

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Longest first, so `Applebot-Extended` wins over `Applebot` and `Claude-SearchBot` over nothing
// shorter that it contains.
const BY_LENGTH = [...KNOWN_BOTS].sort((a, b) => b.token.length - a.token.length);
const PATTERN = new RegExp(`(?:^|[^a-z0-9])(${BY_LENGTH.map(b => escapeRegExp(b.token)).join('|')})`, 'i');
const BY_TOKEN = new Map(KNOWN_BOTS.map(b => [b.token.toLowerCase(), b]));

/** The known bot this User-Agent belongs to, or undefined for anything else. */
export function botFor(userAgent: string | string[] | undefined | null): KnownBot | undefined {
	const ua = Array.isArray(userAgent) ? userAgent.join(' ') : userAgent;
	if (!ua) return undefined;
	const m = PATTERN.exec(ua);
	return m ? BY_TOKEN.get(m[1].toLowerCase()) : undefined;
}

/** Whether the User-Agent is one of the known crawlers or AI fetchers. */
export function isBot(userAgent: string | string[] | undefined | null): boolean {
	return !!botFor(userAgent);
}
