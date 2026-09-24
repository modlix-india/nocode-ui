import { useEffect } from 'react';
import { STORE_PREFIX } from '../constants';
import { addListenerAndCallImmediately } from '../context/StoreContext';
import {
	applyConsentToBeacon,
	getConsentCookieName,
	publishConsentState,
	readConsentRecord,
} from './analyticsConsent';

/**
 * The ingestion host, stamped in by webpack.local.js. Undefined in every other build,
 * where the document already carries the beacon, so every read of it is guarded.
 */
declare const __ANALYTICS_INGESTION_HOST__: string | undefined;

/**
 * Put the beacon on the page when the document did not come with one.
 *
 * Two of the three things that serve a document stamp the tag themselves, from
 * `ui.analytics.ingestionHost`: the Java `IndexHTMLService` and the SSR renderer. The
 * third is the webpack dev server, and its `index.html` cannot carry the tag statically:
 * one template serves every app and host there, and the data attributes come from the
 * application's own `analytics` properties, which it has no way to know.
 *
 * So the page assembles it here instead, where both halves exist: the application is in
 * the store by the time this runs, and the host comes from the build. Dev only, guarded
 * on the `nodeDev` flag that template sets, so a document from either real renderer is
 * never given a second tag.
 *
 * Without this, local capture fails in the quietest way there is: the consent box
 * appears, the visitor accepts, the decision is stored, the box hides itself, and
 * `applyConsentToBeacon` returns at its `typeof mlx !== 'function'` guard with nothing
 * to tell. Every surface looks correct and no event is ever sent.
 */
// NOTE: this is the THIRD place that writes this tag — IndexHTMLService.java and the SSR
// htmlRenderer are the other two, and all three have to agree. They already drifted once:
// heatmaps was added to both renderers and not here, and the symptom was a local page that
// recorded page views perfectly and no clicks at all, with nothing anywhere saying why.
function injectBeaconInDev(analytics: Record<string, unknown> | undefined) {
	if ((globalThis as any).nodeDev !== true) return;

	// A real beacon has replaced the stub and carries no `q`; a stub still has
	// one. Testing only for a function meant a stub counted as a beacon, and
	// nothing was ever loaded to replay it — page routing installs one when it
	// resolves, which on this template happens before this runs, so every local
	// event went nowhere and no surface said why.
	const existing = (globalThis as any).mlx;
	if (typeof existing === 'function' && !existing.q) return;

	const configured =
		typeof __ANALYTICS_INGESTION_HOST__ === 'string' ? __ANALYTICS_INGESTION_HOST__ : '';
	if (!configured) return;
	if (document.querySelector('script[data-mlx-beacon]')) return;

	// The same queue the stamped snippet installs, so an event fired before the async
	// script arrives is not lost. `arguments` rather than a rest array: the beacon
	// replays each entry positionally, and the two shapes must not drift.
	//
	// An existing stub is kept rather than replaced, because replacing it would
	// throw away whatever it is already holding.
	if (typeof existing !== 'function') {
		const q: unknown[] = [];
		const stub: any = function () {
			q.push(arguments);
		};
		stub.q = q;
		(globalThis as any).mlx = stub;
	}

	const attr = (v: unknown, dflt: boolean) =>
		String(v === undefined || v === null ? dflt : v !== false);

	const tag = document.createElement('script');
	tag.async = true;
	tag.src = `${configured.replace(/\/$/, '')}/a.js`;
	tag.setAttribute('data-mlx-beacon', 'dev');
	tag.setAttribute('data-autocapture', attr(analytics?.autocapture, true));
	tag.setAttribute('data-pageviews', attr(analytics?.capturePageviews, true));
	tag.setAttribute('data-pageleaves', attr(analytics?.capturePageleaves, true));
	// On unless the app says otherwise: one extra event per page view, where a heatmap is
	// one per click, and nothing it records is about the person.
	tag.setAttribute('data-scroll', attr(analytics?.captureScroll, true));
	// Off unless the app asks: every click on the page becomes an event, where autocapture
	// records only the labelled ones.
	tag.setAttribute(
		'data-heatmaps',
		attr((analytics?.heatmaps as { enabled?: boolean } | undefined)?.enabled, false),
	);
	// Unconditional, exactly as both renderers emit it. There is no application setting
	// that turns asking off, and a dev build is the last place to introduce one.
	tag.setAttribute('data-consent', 'required');
	document.head.appendChild(tag);
}

/**
 * Renders nothing. It binds the running app to the analytics beacon: the page identity the
 * app knows and the engine cannot infer, and the replay of a consent decision this browser
 * made on an earlier visit.
 *
 * It is much smaller than it was, and the things it no longer does are the point:
 *
 * - **It does not tell analytics which app or client this is.** The engine resolves the site
 *   itself, from signals the page cannot choose. A page that could name its own site could
 *   write into another tenant's numbers, so the ability is removed rather than guarded.
 * - **It does not identify the signed-in user.** Visitors are derived from a daily-rotating
 *   salt and are anonymous by construction; there is no person profile to attach a name to,
 *   and attaching one would undo the property that makes the cookie banner honest.
 *
 * The consent UI itself is not here either. An app points `properties.consentPage` at one of
 * its own pages and builds the box with components, driving it with
 * `UIEngine.GetAnalyticsConsent` and `UIEngine.SetAnalyticsConsent`.
 */
export function AnalyticsBinder() {
	useEffect(() => {
		const cleanups: Array<() => void> = [];

		// `Store.application` arrives after boot, and consent is read from it, so this hangs
		// off a listener rather than a one-shot read at mount.
		cleanups.push(
			addListenerAndCallImmediately(
				undefined,
				(_, app) => {
					if (!app) return;

					const state = publishConsentState();
					if (!state.enabled) return;

					// Before the consent replay below: that replay speaks to the queue
					// this installs, and on the dev server there is nothing to speak to
					// until it has run.
					injectBeaconInDev(app.properties?.analytics);

					// A visitor who already answered on a previous visit must not be asked
					// again, and must not spend this page load unmeasured: the beacon starts
					// opted out whenever consent is required.
					const record = readConsentRecord(
						getConsentCookieName(app.properties?.analytics),
					);
					if (record) applyConsentToBeacon(record);
				},
				`${STORE_PREFIX}.application`,
			),
		);

		cleanups.push(
			addListenerAndCallImmediately(
				undefined,
				(_, details) => {
					// The page that actually RENDERED, not the one the URL asked for.
					// They differ whenever a page-routing rule fired, and reporting the
					// requested one filed every view and every click on an A/B arm under
					// the address instead of under the arm. `servedPageName` is absent
					// when no rule fired, which is the ordinary case.
					const name = details?.servedPageName ?? details?.pageName;
					if (!name) return;
					// The application's own name for this page, which survives a URL change
					// in a way a path does not. The beacon also treats the first page name
					// as the moment a view becomes meaningful.
					const mlx = (globalThis as any).mlx;
					if (typeof mlx === 'function') mlx('page', name);
				},
				`${STORE_PREFIX}.urlDetails`,
			),
		);

		return () => cleanups.forEach(fn => fn());
	}, []);

	return null;
}
