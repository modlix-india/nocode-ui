/**
 * Where the agent's definition edits land.
 *
 * Mirrors the server's `DraftScope` and is sent to it verbatim as `draft_mode`.
 *
 * Three settings rather than a switch, because the surfaces embedding the chat
 * do not agree about what a draft is. AppBuilder drafts everything and has a
 * pending bar to publish it. An editor that publishes one page at a time has a
 * review step for the page and none for a storage or a connection, so drafting
 * one of those would strand it with nothing able to ship it.
 */
export type DraftMode = 'LIVE' | 'DRAFT' | 'PAGE_ONLY_DRAFT';

export const DRAFT_MODES: ReadonlyArray<DraftMode> = ['LIVE', 'DRAFT', 'PAGE_ONLY_DRAFT'];

/**
 * Read an authored property value as a draft mode.
 *
 * Unrecognised means DRAFT, matching the server, so a typo ends up somewhere a
 * change can be reviewed rather than in front of real users.
 *
 * A legacy boolean is the one carve-out, and it is deliberate. This property
 * used to be a bool, and `false` was the only way an author could say "write
 * live". Folding that into DRAFT would send their agent's edits to a draft on a
 * surface that has no publish UI to ship it, where they would sit unnoticed. So
 * an explicit legacy `false` keeps meaning live.
 */
export function toDraftMode(value: any): DraftMode {
	if (value === false) return 'LIVE';
	if (value === true) return 'DRAFT';
	const v = typeof value === 'string' ? value.trim().toUpperCase() : '';
	return (DRAFT_MODES as ReadonlyArray<string>).includes(v) ? (v as DraftMode) : 'DRAFT';
}

/**
 * The agent's root, from its chat endpoint: `/api/ai/leadzump/chat?draftmode=false`
 * gives `/api/ai/leadzump`, which the sessions, stop, confirm and other routes hang
 * off. The query string belongs to the chat call alone: an endpoint carrying one
 * (`?draftmode=false` keeps the LeadZump assistant off the app builder) used to
 * leave `/chat?...` in place and send every other call to a path that does not exist.
 */
export function agentBaseUrl(endpoint: string): string {
	return (endpoint ?? '').split('?')[0].replace(/\/chat\/?$/, '');
}

/**
 * The shared learning routes (`/api/ai/learning/...`) sit beside the agents, not under one:
 * `/api/ai/leadzump/chat` gives `/api/ai/learning`. Only `/appbuilder` used to be stripped, so
 * every other agent's ratings went to `/api/ai/<agent>/learning/feedback` and were lost (404).
 */
export function learningBaseUrl(endpoint: string): string {
	return agentBaseUrl(endpoint).replace(/\/[^/]+\/?$/, '') + '/learning';
}
