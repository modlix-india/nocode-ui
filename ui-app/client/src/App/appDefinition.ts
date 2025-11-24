import { AxiosRequestConfig } from 'axios';
import { shortUUID } from '../util/shortUUID';
import {
	fetchApplicationDefinition,
	fetchThemeDefinition,
	verifyAuthToken,
} from '../shared/api/appData';

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
			applyDebugHeader(axiosOptions);
			const verifyResult = await verifyAuthToken(authToken, axiosOptions);
			axiosOptions = verifyResult.axiosOptions;
			auth = verifyResult.auth;
			language = verifyResult.language ?? language;
		}
	}

	const {
		application,
		isApplicationLoadFailed,
		language: appLanguage,
	} = await fetchApplicationDefinition(axiosOptions);

	if (!language) language = appLanguage;

	applyDebugHeader(axiosOptions);
	const theme = await fetchThemeDefinition(axiosOptions);

	if (language) localStorage.setItem(TOKEN_LANGUAGE, language);
	else localStorage.removeItem(TOKEN_LANGUAGE);

	return { auth, application, isApplicationLoadFailed, theme };
}

function applyDebugHeader(axiosOptions: AxiosRequestConfig<any>) {
	if (!globalThis.isDebugMode) return;
	if (!axiosOptions.headers) axiosOptions.headers = {};
	axiosOptions.headers['x-debug'] =
		(globalThis.isFullDebugMode ? 'full-' : '') + shortUUID();
}
