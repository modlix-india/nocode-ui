import { AppDefinitionResponse } from '../App/appDefinition';
import { PageDefinition } from './common';

export interface AppBootstrapPayload {
	appDefinitionResponse?: AppDefinitionResponse;
	pageDefinitionResponse?: PageDefinition;
	pageDefinitionRequestPageName?: string;
	urlDetails?: {
		appCode?: string;
		clientCode?: string;
	};
	store?: any;
	location?: {
		pathname: string;
		search: string;
		hash?: string;
	};
	requestedPageName?: string;
}

declare global {
	var __APP_BOOTSTRAP__: AppBootstrapPayload | undefined;
}

export {};

