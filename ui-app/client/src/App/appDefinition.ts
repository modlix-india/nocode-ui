import axios, { AxiosRequestConfig } from 'axios';
import { shortUUID } from '../util/shortUUID';

export interface AppDefinitionResponse {
	auth: any;
	application: any;
	isApplicationLoadFailed: boolean;
	theme: any;
}

export async function getAppDefinition(): Promise<AppDefinitionResponse> {
	let TOKEN_NAME = 'AuthToken';
	let TOKEN_EXPIRY = 'AuthTokenExpiry';
	let TOKEN_LANGUAGE = 'currentLanguage';

	if (globalThis.isDesignMode) {
		TOKEN_NAME = 'designMode_AuthToken';
		TOKEN_EXPIRY = 'designMode_AuthTokenExpiry';
		TOKEN_LANGUAGE = 'designMode_currentLanguage';
	}

	const authToken = localStorage.getItem(TOKEN_NAME);
	const authExpiry = localStorage.getItem(TOKEN_EXPIRY);

	let axiosOptions: AxiosRequestConfig<any> = { headers: {} };
	let language: string | undefined = undefined;
	let auth: any = undefined;
	if (authToken) {
		if (parseInt(authExpiry ?? '0') * 1000 < Date.now()) {
			localStorage.removeItem(TOKEN_NAME);
			localStorage.removeItem(TOKEN_EXPIRY);
		} else {
			({ axiosOptions, auth } = await makeVerifyTokenCall(
				axiosOptions,
				authToken,
				language,
				TOKEN_NAME,
				TOKEN_EXPIRY,
			));
		}
	}

	let application,
		isApplicationLoadFailed = false,
		theme;

	({ application, isApplicationLoadFailed, language } = await makeAppDefinitionCall(
		axiosOptions,
		language,
	));
	if (globalThis.isDebugMode) axiosOptions.headers!['x-debug'] = shortUUID();
	try {
		const response = await axios.get('api/ui/theme', axiosOptions);
		if (response.status === 200) theme = response.data;
	} catch (err) {}

	if (language) localStorage.setItem(TOKEN_LANGUAGE, language);
	else localStorage.removeItem(TOKEN_LANGUAGE);

	return { auth, application, isApplicationLoadFailed, theme };
}

async function makeAppDefinitionCall(
	axiosOptions: AxiosRequestConfig<any>,
	language: string | undefined,
) {
	let application = undefined;
	let isApplicationLoadFailed = false;
	try {
		const response = await axios.get('api/ui/application', axiosOptions);
		if (response.status === 200) {
			application = response.data;
			if (!language) language = response.data.defaultLanguage;
		}
	} catch (e) {
		isApplicationLoadFailed = true;
		console.error('Unable to load application definition:', e);
	}
	return { application, isApplicationLoadFailed, language };
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
			language = response.data.localeCode;
			// localStorage.setItem(, language);
		} else {
			localStorage.removeItem(TOKEN_NAME);
			localStorage.removeItem(TOKEN_EXPIRY);
			axiosOptions = {};
		}
		return { auth: response?.data, axiosOptions, language };
	} catch (e) {
		console.error('Unable to verify token:', e);
		// localStorage.removeItem(TOKEN_NAME);
		// localStorage.removeItem(TOKEN_EXPIRY);
		axiosOptions = { headers: {} };
		if (globalThis.isDebugMode) axiosOptions.headers!['x-debug'] = shortUUID();
	}
	return { axiosOptions, language };
}
