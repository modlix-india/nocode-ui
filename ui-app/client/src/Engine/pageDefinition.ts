import axios, { AxiosRequestConfig } from 'axios';
import { PageDefinition } from '../types/common';
import { shortUUID } from '../util/shortUUID';

export default async function getPageDefinition(pageName: string, appCode?: string, clientCode?: string): Promise<PageDefinition> {

	const authToken = localStorage.getItem(
		globalThis.isDesignMode ? 'designMode_AuthToken' : 'AuthToken',
	);

	if (!authToken && globalThis.__APP_BOOTSTRAP__?.pageDefinition[pageName]) return globalThis.__APP_BOOTSTRAP__?.pageDefinition[pageName];
	
	const axiosConfig: AxiosRequestConfig<any> = { headers: {} };
	if (globalThis.isDebugMode) axiosConfig.headers!['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') +shortUUID();

	if (authToken) {
		axiosConfig.headers!['Authorization'] = JSON.parse(authToken);
	}

	if (appCode) axiosConfig.headers!['appCode'] = appCode;
	if (clientCode) axiosConfig.headers!['clientCode'] = clientCode;

	return (await axios.get(`api/ui/page/${pageName}`, axiosConfig)).data;
}
