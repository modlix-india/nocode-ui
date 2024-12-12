import axios, { AxiosRequestConfig } from 'axios';
import { STORE_PREFIX } from '../constants';
import { setData } from '../context/StoreContext';
import { shortUUID } from '../util/shortUUID';

let firstTime = true;
export default async function getAppDefinition() {
	let TOKEN_NAME = 'AuthToken';
	let TOKEN_EXPIRY = 'AuthTokenExpiry';

	if (window.isDesignMode) {
		TOKEN_NAME = 'designmode_AuthToken';
		TOKEN_EXPIRY = 'designmode_AuthTokenExpiry';
	}

	const authToken = localStorage.getItem(TOKEN_NAME);
	const authExpiry = localStorage.getItem(TOKEN_EXPIRY);

	let axiosOptions: AxiosRequestConfig<any> = { headers: {} };
	let language: string | undefined = undefined;
	if (authToken) {
		if (parseInt(authExpiry ?? '0') * 1000 < Date.now()) {
			localStorage.removeItem(TOKEN_NAME);
			localStorage.removeItem(TOKEN_EXPIRY);
		} else {
			({ axiosOptions, language } = await makeVerifyTokenCall(
				axiosOptions,
				authToken,
				language,
				TOKEN_NAME,
				TOKEN_EXPIRY,
			));
		}
	}

	if (firstTime && globalThis.applicationDefinition) {
		setData(`${STORE_PREFIX}.application`, globalThis.applicationDefinition);
		if (!language) language = globalThis.applicationDefinition.defaultLanguage;
	} else {
		language = await makeAppDefinitionCall(axiosOptions, language);
	}

	(async () => {
		if (globalThis.isDebugMode) axiosOptions.headers!['x-debug'] = shortUUID();
		const response = await axios.get('api/ui/theme', axiosOptions);
		if (response.status === 200) setData(`${STORE_PREFIX}.theme`, response.data);
	})();

	(async () => {
		setData('LocalStore.currentLanguage', language);
	})();

	firstTime = false;
}

async function makeAppDefinitionCall(
	axiosOptions: AxiosRequestConfig<any>,
	language: string | undefined,
) {
	try {
		const response = await axios.get('api/ui/application', axiosOptions);
		if (response.status === 200) {
			setData(`${STORE_PREFIX}.application`, response.data);
			if (!language) language = response.data.defaultLanguage;
		}
	} catch (e) {
		setData(`${STORE_PREFIX}.isApplicationLoadFailed`, true);
		console.error('Unable to load application definition:', e);
	}
	return language;
}

async function makeVerifyTokenCall(
	axiosOptions: AxiosRequestConfig<any>,
	authToken: string,
	language: string | undefined,
	TOKEN_NAME: string,
	TOKEN_EXPIRY: string,
) {
	try {
		axiosOptions.headers!.Authorization = JSON.parse(authToken);
		if (globalThis.isDebugMode) axiosOptions.headers!['x-debug'] = shortUUID();
		const response = await axios.get('api/security/verifyToken', axiosOptions);

		if (response.status === 200) {
			setData('Store.auth', response.data);
			language = response.data.localeCode;
		} else {
			localStorage.removeItem(TOKEN_NAME);
			localStorage.removeItem(TOKEN_EXPIRY);
			axiosOptions = {};
		}
	} catch (e) {
		localStorage.removeItem(TOKEN_NAME);
		localStorage.removeItem(TOKEN_EXPIRY);
		axiosOptions = { headers: {} };
		if (globalThis.isDebugMode) axiosOptions.headers!['x-debug'] = shortUUID();
		console.error('Unable to verify token:', e);
	}
	return { axiosOptions, language };
}
