import { prerenderToNodeStream } from 'react-dom/static';
import { ErrorBoundary } from '../App/ErrorBoundary';
import { getAppDefinition } from '../App/appDefinition';
import getPageDefinition from '../Engine/pageDefinition';
import { processLocation } from '../util/locationProcessor';
import DraftBanner from '../components/DraftBanner';
import { stylePropertyComponentsFor } from './stylePropertyComponents';

/**
 * Renders the page at `window.location` to HTML with the REAL client components, for the
 * browser to hydrate. The caller provides the DOM globals (a jsdom window at the page's URL)
 * and `globalThis.__APP_BOOTSTRAP__`, exactly as the SSR document gives them to the browser,
 * so the definitions below come from the bootstrap and no request leaves the process.
 *
 * The tree must stay identical to the one `index.tsx` renders, or hydration cannot match it.
 * The only difference is the router: there is no history here, so `App` gets the location.
 * Effects never run in a server render, so page onLoad functions do not either.
 */
export async function renderPage(
	// Every `/styleProperties/<Name>.json` the server can read, by component name. Only the
	// ones this page uses are applied, exactly as the browser preloads them before hydrating.
	available: Record<string, any> = {},
): Promise<string> {
	// The globals index.tsx sets on import (the server never imports it). Phase 1 moves these
	// into one module both entries import, so they cannot drift.
	globalThis.__SSR_RENDERING__ = true;
	globalThis.debugContext = {};
	// Filled below from `available`, by the same rule the browser preloads with.
	globalThis.styleProperties = {};
	const listeners: Set<() => void> = new Set();
	globalThis.removeDesignModeChangeListener = (fn: () => void) => listeners.delete(fn);
	globalThis.addDesignModeChangeListener = (fn: () => void) => {
		listeners.add(fn);
		return () => globalThis.removeDesignModeChangeListener(fn);
	};
	globalThis.raiseDesignModeChangeEvent = () => listeners.forEach(fn => fn());
	globalThis.isDesignMode = false;
	globalThis.isDebugMode = false;
	globalThis.isDraftMode = document.documentElement.getAttribute('data-draft') === 'true';
	globalThis.lastInteracted = Date.now();

	const pageName = processLocation(window.location)?.pageName;

	let appDefinitionResponse, pageDefinitionResponse;
	if (pageName) {
		globalThis.pageDefinitionRequestPageName = pageName;
		const page = getPageDefinition(pageName);
		[appDefinitionResponse, pageDefinitionResponse] = await Promise.all([
			getAppDefinition(() => page),
			page,
		]);
	} else {
		let page: Promise<any> | undefined;
		appDefinitionResponse = await getAppDefinition(application => {
			globalThis.pageDefinitionRequestPageName = application?.properties?.defaultPage;
			page = getPageDefinition(globalThis.pageDefinitionRequestPageName);
			return page;
		});
		globalThis.pageDefinitionRequestPageName ??=
			appDefinitionResponse?.application?.properties?.defaultPage;
		pageDefinitionResponse = await (page ??
			getPageDefinition(globalThis.pageDefinitionRequestPageName));
	}

	globalThis.appDefinitionResponse = appDefinitionResponse;
	globalThis.pageDefinitionResponse = pageDefinitionResponse;
	for (const name of stylePropertyComponentsFor(pageDefinitionResponse))
		if (available[name]) globalThis.styleProperties[name] = available[name];

	const { App } = await import('../App/App');
	const { AppStyle } = await import('../App/AppStyle');

	const { prelude } = await prerenderToNodeStream(
		<ErrorBoundary>
			<AppStyle />
			<App location={window.location.pathname + window.location.search} />
			<DraftBanner />
		</ErrorBoundary>,
	);

	const chunks: Buffer[] = [];
	for await (const chunk of prelude) chunks.push(Buffer.from(chunk));
	return Buffer.concat(chunks).toString('utf8');
}
