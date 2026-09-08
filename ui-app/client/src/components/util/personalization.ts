import axios from 'axios';
import { deepEqual, duplicate } from '@fincity/kirun-js';
import { LOCAL_STORE_PREFIX, STORE_PREFIX } from '../../constants';
import {
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	PageStoreExtractor,
	setData as setStoreData,
} from '../../context/StoreContext';

/**
 * Per-user, per-component preferences (Table column order, Prompt sidebar width,
 * Grid pane size...) persisted through the UI personalization service.
 *
 * One document per component: `api/ui/personalization/<appCode>/<prefix>_<pageName>_<key>`.
 * The document is mirrored into a store path so the component just reads and writes
 * the store; every change to that path is POSTed back on a 2s debounce.
 *
 * This was written twice, in Table and in Prompt, and the two copies had drifted:
 * Table's debounce clear was negated (so it never cancelled a pending write) and its
 * GET had no catch (so a first-ever load, where no document exists yet, raised an
 * unhandled rejection). Both are fixed here.
 *
 * @returns the unsubscribe function, so callers can return it straight from useEffect.
 */
export function personalizationEvent({
	prefix,
	personalizationBindingPath,
	key,
	locationHistory,
	pageExtractor,
	onLoad,
}: {
	/** Document name prefix, one per component type: 'table', 'prompt', 'grid'. */
	prefix: string;
	personalizationBindingPath: string | undefined;
	key: string;
	locationHistory: any[];
	pageExtractor: PageStoreExtractor;
	/** Called once with the loaded document, for state the component holds outside the store. */
	onLoad?: (data: any) => void;
}): (() => void) | undefined {
	if (!personalizationBindingPath) return;

	const appCode = getDataFromPath(
		`${STORE_PREFIX}.application.appCode`,
		locationHistory,
		pageExtractor,
	);
	const url = `api/ui/personalization/${appCode}/${prefix}_${pageExtractor.getPageName()}_${key}`;

	const authHeaders = () => ({
		Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
	});

	let currentObject: any;
	(async () => {
		try {
			const po = await axios.get(url, { headers: authHeaders() });
			if (po.data) {
				setStoreData(personalizationBindingPath, po.data, pageExtractor.getPageName());
				onLoad?.(po.data);
			}
			currentObject = duplicate(po.data);
		} catch {
			// Silently fail: there is no document until the first preference is saved,
			// and a missing preference must never break the component.
		}
	})();

	let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
	return addListenerAndCallImmediatelyWithChildrenActivity(
		pageExtractor.getPageName(),
		(_, v) => {
			if (timeoutHandle) clearTimeout(timeoutHandle);
			if (deepEqual(currentObject, v) || currentObject === undefined) return;
			currentObject = duplicate(v);

			timeoutHandle = setTimeout(() => {
				(async () => {
					try {
						await axios.post(url, v, { headers: authHeaders() });
					} catch {
						// Silently fail: personalization is a convenience, not data.
					}
					timeoutHandle = undefined;
				})();
			}, 2000);
		},
		personalizationBindingPath,
	);
}
