import axios, { AxiosRequestConfig } from 'axios';
import { setData } from '../context/StoreContext';
import { shortUUID } from '../util/shortUUID';

export default async function getPageDefinition(pageName: string) {
	const axiosConfig: AxiosRequestConfig<any> = { headers: {} };
	if (globalThis.isDebugMode) axiosConfig.headers!['x-debug'] = shortUUID();

	const authToken = localStorage.getItem(
		globalThis.isDebugMode ? 'designmode_AuthToken' : 'AuthToken',
	);

	if (authToken) {
		axiosConfig.headers!['Authorization'] = JSON.parse(authToken);
	}

	const response = await axios.get(`api/ui/page/${pageName}`, axiosConfig);
	setData(`Store.pageDefinition.${pageName}`, response.data);
}
