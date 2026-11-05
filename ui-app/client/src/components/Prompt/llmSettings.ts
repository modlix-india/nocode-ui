import { getDataFromPath, PageStoreExtractor } from '../../context/StoreContext';
import { LocationHistory } from '../../types/common';
import { STORE_PREFIX } from '../../constants';

/**
 * A client's own LLM provider, model and key for an app's agents.
 *
 * The AI service picks, per run, the first complete setting along the chain:
 * the signed-in user's client, its managing client, the client whose URL this
 * is, then SYSTEM, and its own default when none is set.
 */

export interface LlmEffective {
	source: 'own' | 'managing' | 'url' | 'system' | 'platform';
	sourceClientCode?: string;
}

/**
 * The client whose URL the page is on, sent as the `urlClientCode` header so the
 * AI service can fall back to that client's setting. The app definition's
 * `urlClientCode` is the resolved one; the path segment covers a page served
 * without it.
 */
export function urlClientCodeOf(
	locationHistory: Array<LocationHistory> = [],
	pageExtractor?: PageStoreExtractor,
): string {
	const extractors = pageExtractor ? [pageExtractor] : [];
	return (
		getDataFromPath(
			`${STORE_PREFIX}.application.urlClientCode`,
			locationHistory,
			...extractors,
		) ??
		getDataFromPath(`${STORE_PREFIX}.url.clientCode`, locationHistory, ...extractors) ??
		''
	);
}

/** Where the agent's models come from, in words for the model selector. */
export function sourceLabel(effective?: LlmEffective): string {
	const who = effective?.sourceClientCode ? ` (${effective.sourceClientCode})` : '';
	switch (effective?.source) {
		case 'own':
			return 'Using your own AI settings';
		case 'managing':
			return `Using your managing client's AI settings${who}`;
		case 'url':
			return `Using this site's AI settings${who}`;
		case 'system':
			return 'Using the system AI settings';
		default:
			return 'Using the default AI';
	}
}
