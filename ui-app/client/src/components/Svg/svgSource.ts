import axios from 'axios';
import { Location as ReactLocation } from 'react-router-dom';
import { LOCAL_STORE_PREFIX } from '../../constants';
import { getDataFromPath } from '../../context/StoreContext';
import { shortUUID } from '../../util/shortUUID';
import { getHref } from '../util/getHref';
import getSrcUrl from '../util/getSrcUrl';

// Resolves a raw `src` value into a fetchable URL using the same CDN/static
// rules as the Image component (getHref + getSrcUrl).
export function resolveSvgUrl(src: string | undefined, location: ReactLocation | Location): string {
	if (!src) return '';
	return getSrcUrl(getHref(src, location)) ?? '';
}

// Fetches an SVG file as text, attaching the auth header so secured files work.
async function secureFetch(url: string): Promise<string> {
	const headers: any = {
		Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
	};
	if (globalThis.isDebugMode)
		headers['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') + shortUUID();

	return await axios.get(url, { responseType: 'text', headers }).then(res => res.data);
}

// Fetches SVG markup as text, using the auth-aware path for secured files.
export async function fetchSvgText(url: string): Promise<string> {
	const text = url.includes('api/files/secured')
		? await secureFetch(url)
		: (await axios.get(url, { responseType: 'text' })).data;
	return typeof text === 'string' ? text : '';
}
