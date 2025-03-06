import axios, { AxiosRequestConfig } from 'axios';
import { PageDefinition } from '../types/common';
import { shortUUID } from '../util/shortUUID';

export default async function getPageDefinition(pageName: string): Promise<PageDefinition> {
	const axiosConfig: AxiosRequestConfig<any> = { headers: {} };
	if (globalThis.isDebugMode) axiosConfig.headers!['x-debug'] = shortUUID();

	const authToken = localStorage.getItem(
		globalThis.isDesignMode ? 'designmode_AuthToken' : 'AuthToken',
	);

	if (authToken) {
		axiosConfig.headers!['Authorization'] = JSON.parse(authToken);
	}

	return (await axios.get(`api/ui/page/${pageName}`, axiosConfig)).data;
}
