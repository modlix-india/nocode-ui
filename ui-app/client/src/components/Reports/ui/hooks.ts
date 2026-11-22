import { useCallback, useEffect, useState } from 'react';
import {
	loadCatalog,
	loadMeasureCaps,
	onCatalogInvalidated,
	ReportTransport,
	transportFor,
} from '../reportApi';
import { ReportCatalog } from '../reportTypes';

/** The server transport, or the sample data one (loaded as its own chunk) when asked. */
export function useTransport(useFixtures: boolean | undefined): ReportTransport | undefined {
	const [t, setT] = useState<ReportTransport | undefined>(undefined);
	useEffect(() => {
		let alive = true;
		transportFor(!!useFixtures).then(v => alive && setT(() => v));
		return () => {
			alive = false;
		};
	}, [useFixtures]);
	return t;
}

export interface CatalogState {
	catalog?: ReportCatalog;
	error?: string;
	loading: boolean;
	retry: () => void;
}

/** The app's catalog (once per function per page load). */
export function useCatalog(
	transport: ReportTransport | undefined,
	catalogFunction: string,
): CatalogState {
	const [state, setState] = useState<{
		catalog?: ReportCatalog;
		error?: string;
		loading: boolean;
	}>({ loading: true });
	const [attempt, setAttempt] = useState(0);
	// A dataset import or delete changes the catalog: load it again (the old one stays shown).
	useEffect(() => onCatalogInvalidated(() => setAttempt(a => a + 1)), []);
	useEffect(() => {
		if (!transport || !catalogFunction) {
			setState({
				loading: !transport,
				error: catalogFunction ? undefined : 'No catalog function is set.',
			});
			return;
		}
		let alive = true;
		setState(s => ({ ...s, loading: true, error: undefined }));
		void loadMeasureCaps(transport);
		loadCatalog(transport, catalogFunction).then(
			catalog => alive && setState({ catalog, loading: false }),
			e =>
				alive &&
				setState({
					loading: false,
					error: e?.message ?? 'The report catalog could not be loaded.',
				}),
		);
		return () => {
			alive = false;
		};
	}, [transport, catalogFunction, attempt]);
	const retry = useCallback(() => setAttempt(a => a + 1), []);
	return { ...state, retry };
}

/** Width of an element, followed as it changes (phone layout, column size). */
export function useWidth(ref: React.RefObject<HTMLElement | null>): number {
	const [w, setW] = useState(0);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const read = () => setW(el.clientWidth);
		read();
		if (typeof ResizeObserver === 'undefined') {
			window.addEventListener('resize', read);
			return () => window.removeEventListener('resize', read);
		}
		const ro = new ResizeObserver(read);
		ro.observe(el);
		return () => ro.disconnect();
	}, [ref]);
	return w;
}
