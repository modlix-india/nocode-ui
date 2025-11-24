import { IncomingHttpHeaders } from 'http';
import { AppDefinitionResponse } from '../../../client/src/App/appDefinition';
import { PageDefinition } from '../../../client/src/types/common';
import { processLocation } from '../../../client/src/util/locationProcessor';
import { AppBootstrapPayload } from '../../../client/src/types/bootstrap';

export interface LoadBootstrapOptions {
	headers: IncomingHttpHeaders;
	url?: string;
	pageName?: string;
	apiBaseUrl?: string;
}

const DEFAULT_API_BASE_URL = 'http://localhost:8080/';

const FORWARDED_HEADERS = [
	'authorization',
	'cookie',
	'x-forwarded-for',
	'x-forwarded-host',
	'x-forwarded-proto',
	'user-agent',
];

export async function loadBootstrapData(options: LoadBootstrapOptions): Promise<AppBootstrapPayload> {
	const apiBaseUrl = (options.apiBaseUrl || process.env.APP_API_BASE_URL || DEFAULT_API_BASE_URL).trim();

	const requestOptions: RequestConfig = {
		baseURL: apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`,
		headers: extractForwardHeaders(options.headers),
		withCredentials: true,
	};

	const locationLike = buildLocation(options.url);
	const locationDetails = processLocation(locationLike as Location);

	const authToken = getHeaderValue(options.headers, 'authorization');
	let auth: any = undefined;
	if (authToken) {
		const result = await verifyAuthToken(authToken, requestOptions);
		auth = result.auth;
		requestOptions.headers = result.axiosOptions.headers;
	}

	const appResult = await fetchApplicationDefinition(requestOptions);
	const theme = await fetchThemeDefinition(requestOptions);

	const appDefinitionResponse: AppDefinitionResponse = {
		auth,
		application: appResult.application,
		isApplicationLoadFailed: appResult.isApplicationLoadFailed,
		theme,
	};

	let requestedPageName =
		options.pageName || locationDetails.pageName || appResult.application?.properties?.defaultPage;

	const pageRequestOptions: RequestConfig = {
		...requestOptions,
		headers: { ...(requestOptions.headers ?? {}) },
	};

	if (locationDetails.appName) pageRequestOptions.headers!['appCode'] = locationDetails.appName;
	if (locationDetails.clientCode) pageRequestOptions.headers!['clientCode'] = locationDetails.clientCode;

	const pageDefinitionResponse = requestedPageName
		? await fetchPageDefinition(requestedPageName, pageRequestOptions)
		: undefined;

	return {
		appDefinitionResponse,
		pageDefinitionResponse,
		pageDefinitionRequestPageName: requestedPageName,
		urlDetails: {
			appCode: locationDetails.appName,
			clientCode: locationDetails.clientCode,
		},
		location: {
			pathname: locationLike.pathname ?? '/',
			search: locationLike.search ?? '',
			hash: locationLike.hash ?? '',
		},
	};
}

function extractForwardHeaders(headers: IncomingHttpHeaders) {
	return FORWARDED_HEADERS.reduce<Record<string, string>>((acc, header) => {
		const value = getHeaderValue(headers, header);
		if (value) acc[header] = value;
		return acc;
	}, {});
}

function getHeaderValue(headers: IncomingHttpHeaders, key: string) {
	const value = headers[key] ?? headers[key.toLowerCase()];
	if (Array.isArray(value)) return value[0];
	return value ?? undefined;
}

function buildLocation(rawUrl?: string) {
	if (!rawUrl) return { pathname: '/', search: '', hash: '' };
	try {
		const parsed = new URL(rawUrl, rawUrl.startsWith('http') ? undefined : 'http://ssr.local');
		return {
			pathname: parsed.pathname,
			search: parsed.search,
			hash: parsed.hash,
		};
	} catch {
		return { pathname: rawUrl, search: '', hash: '' };
	}
}

interface RequestConfig {
	baseURL?: string;
	headers?: Record<string, string>;
	withCredentials?: boolean;
}

async function fetchApplicationDefinition(
	config: RequestConfig,
): Promise<{ application?: AppDefinitionResponse['application']; isApplicationLoadFailed: boolean; language?: string }> {
	let application: AppDefinitionResponse['application'] | undefined = undefined;
	let isApplicationLoadFailed = false;
	let language: string | undefined = undefined;
	try {
		const response = await httpGet<any>('api/ui/application', config);
		application = response;
		language = response?.defaultLanguage;
	} catch (error) {
		isApplicationLoadFailed = true;
		console.error('Unable to load application definition:', error);
	}
	return { application, isApplicationLoadFailed, language };
}

async function fetchThemeDefinition(config: RequestConfig) {
	try {
		return await httpGet<any>('api/ui/theme', config);
	} catch (error) {
		console.error('Unable to load theme definition:', error);
		return undefined;
	}
}

async function fetchPageDefinition(pageName: string, config: RequestConfig): Promise<PageDefinition> {
	return httpGet<PageDefinition>(`api/ui/page/${pageName}`, config);
}

async function verifyAuthToken(authToken: string, config: RequestConfig) {
	config.headers = config.headers ?? {};
	config.headers.Authorization = normalizeAuthToken(authToken);

	try {
		const response = await httpGet<any>('api/security/verifyToken', config);
		return { auth: response, axiosOptions: config, language: response?.localeCode };
	} catch (error) {
		console.error('Unable to verify token:', error);
		return { axiosOptions: { headers: {} } };
	}
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

async function httpGet<T>(path: string, config: RequestConfig): Promise<T> {
	const base = config.baseURL ?? '';
	const url = base ? new URL(path, base).toString() : path;
	const response = await fetch(url, {
		method: 'GET',
		headers: config.headers as HeadersInit,
		credentials: config.withCredentials ? 'include' : 'omit',
	});
	if (!response.ok) {
		throw new Error(`Request to ${url} failed with status ${response.status}`);
	}
	if (response.status === 204) return undefined as T;
	return (await response.json()) as T;
}

