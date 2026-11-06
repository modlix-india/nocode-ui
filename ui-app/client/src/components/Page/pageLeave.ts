import { getDataFromPath, PageStoreExtractor } from '../../context/StoreContext';
import { LocationHistory, PageDefinition } from '../../types/common';
import { runEvent } from '../util/runEvent';

/**
 * Runs the page's opt-in `onLeaveEvent` (page property) and resolves when it is done. Pages
 * without the property are untouched. A failing event never stops the person leaving.
 */
export async function runPageLeaveEvent(
	pageName: string,
	pageDefinition: PageDefinition | undefined,
	locationHistory: Array<LocationHistory>,
): Promise<void> {
	if (globalThis.isDesignMode) return;
	const eventName = pageDefinition?.properties?.onLeaveEvent;
	const fn = eventName ? pageDefinition?.eventFunctions?.[eventName] : undefined;
	if (!fn) return;
	try {
		await runEvent(fn, 'pageOnLeave', pageName, locationHistory, pageDefinition);
	} catch {
		// leaving goes on
	}
}

/**
 * A `beforeunload` listener for the opt-in `leaveWarningPath` page property: while the value at
 * that store path is truthy the browser asks before the tab is reloaded or closed.
 */
export function pageLeaveWarning(pageName: string, path: string) {
	return (e: BeforeUnloadEvent) => {
		if (globalThis.isDesignMode) return;
		const value = getDataFromPath(path, [], PageStoreExtractor.getForContext(pageName));
		if (!value) return;
		e.preventDefault();
		// older browsers read returnValue
		e.returnValue = '';
	};
}
