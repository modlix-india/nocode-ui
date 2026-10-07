import axios, { AxiosRequestConfig } from 'axios';
import { PageDefinition } from '../types/common';
import { shortUUID } from '../util/shortUUID';

export default async function getPageDefinition(
	pageName: string,
	appCode?: string,
	clientCode?: string,
): Promise<PageDefinition> {
	const authToken = localStorage.getItem(
		globalThis.isDesignMode ? 'designMode_AuthToken' : 'AuthToken',
	);

	if (!authToken && globalThis.__APP_BOOTSTRAP__?.pageDefinition[pageName])
		return globalThis.__APP_BOOTSTRAP__?.pageDefinition[pageName];

	const axiosConfig: AxiosRequestConfig<any> = { headers: {} };
	if (globalThis.isDebugMode)
		axiosConfig.headers!['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') + shortUUID();

	if (authToken) {
		axiosConfig.headers!['Authorization'] = JSON.parse(authToken);
	}

	if (appCode) axiosConfig.headers!['appCode'] = appCode;
	if (clientCode) axiosConfig.headers!['clientCode'] = clientCode;

	// The definition is served with `max-age=604800`, so the browser answered from its
	// cache for a week whatever the login state: with the token gone (logged out, storage
	// cleared) a page fetched while signed in still rendered its signed-in definition. The
	// server's ETag already differs by login state; `max-age=0` makes the browser ask with
	// If-None-Match every time, which costs a 304 when nothing changed. Not `no-cache`:
	// browsers treat that request header as a full reload and skip the cached copy entirely.
	axiosConfig.headers!['Cache-Control'] = 'max-age=0';

	return (await axios.get(`api/ui/page/${pageName}`, axiosConfig)).data;
}
