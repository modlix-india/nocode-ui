import axios, { AxiosRequestConfig } from 'axios';
import { AppDefinitionResponse } from '../../App/appDefinition';
import { PageDefinition } from '../../types/common';

export interface ApplicationFetchResult {
	application?: AppDefinitionResponse['application'];
	isApplicationLoadFailed: boolean;
	language?: string;
}

export async function fetchApplicationDefinition(
	axiosOptions: AxiosRequestConfig<any>,
): Promise<ApplicationFetchResult> {
	let application = undefined;
	let isApplicationLoadFailed = false;
	let language = undefined;
	try {
		const response = await axios.get('api/ui/application', axiosOptions);
		if (response.status === 200) {
			application = response.data;
			language = response.data?.defaultLanguage ?? language;
		}
	} catch (e) {
		isApplicationLoadFailed = true;
		console.error('Unable to load application definition:', e);
	}
	return { application, isApplicationLoadFailed, language };
}

export async function fetchThemeDefinition(axiosOptions: AxiosRequestConfig<any>) {
	try {
		const response = await axios.get('api/ui/theme', axiosOptions);
		if (response.status === 200) return response.data;
	} catch (error) {
		console.error('Unable to load theme definition:', error);
	}
	return undefined;
}

export interface VerifyAuthTokenResult {
	auth?: any;
	axiosOptions: AxiosRequestConfig<any>;
	language?: string;
}

export async function verifyAuthToken(
	authToken: string,
	axiosOptions: AxiosRequestConfig<any>,
): Promise<VerifyAuthTokenResult> {
	try {
		axiosOptions.headers = axiosOptions.headers ?? {};
		axiosOptions.headers.Authorization = normalizeAuthToken(authToken);
		const response = await axios.get('api/security/verifyToken', axiosOptions);

		if (response.status === 200) {
			return {
				auth: response.data,
				axiosOptions,
				language: response.data?.localeCode,
			};
		}
	} catch (error) {
		console.error('Unable to verify token:', error);
		axiosOptions = { headers: {} };
	}
	return { axiosOptions };
}

function normalizeAuthToken(token: string) {
	const trimmed = token?.trim();
	if (!trimmed) return token;
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		try {
			return JSON.parse(trimmed);
		} catch {
			return trimmed.substring(1, trimmed.length - 1);
		}
	}
	return token;
}

export async function fetchPageDefinition(
	pageName: string,
	axiosOptions: AxiosRequestConfig<any>,
): Promise<PageDefinition> {
	return (await axios.get(`api/ui/page/${pageName}`, axiosOptions)).data;
}

