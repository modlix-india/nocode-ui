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
					if (!details?.pageName) return;
					// The application's own name for this page, which survives a URL change
					// in a way a path does not. The beacon also treats the first page name
					// as the moment a view becomes meaningful.
					const mlx = (globalThis as any).mlx;
					if (typeof mlx === 'function') mlx('page', details.pageName);
				},
				`${STORE_PREFIX}.urlDetails`,
			),
		);

		return () => cleanups.forEach(fn => fn());
	}, []);

	return null;
}
