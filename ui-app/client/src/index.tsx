import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App/App';
import AppStyle from './App/AppStyle';
import { PageDefinition } from './types/common';
import { REPO_SERVER, RemoteRepository } from './Engine/RemoteRepository';
import { Function, Schema } from '@fincity/kirun-js';
import axios from 'axios';
declare global {
	var nodeDev: boolean;
	var isDesignMode: boolean;
	var designMode: string;
	var screenType: string;
	var getStore: () => any;
	var isDebugMode: boolean;
	var pageEditor: {
		selectedComponents: string[];
		selectedSubComponent: string;
		editingPageDefinition: PageDefinition;
		personalization: any;
	};
	var fillerValueEditor: {
		selectedComponent?: string;
		selectedSectionNumber?: number;
		personalization?: any;
	};
	var getRemoteFunctionRepository: (
		appCode: string | undefined,
		clientCode: string | undefined,
		includeRemoteKIRunSchemas: boolean,
		repoServer: REPO_SERVER,
	) => RemoteRepository<Function>;
	var getRemoteSchemaRepository: (
		appCode: string | undefined,
		clientCode: string | undefined,
		includeRemoteKIRunSchemas: boolean,
		repoServer: REPO_SERVER,
	) => RemoteRepository<Schema>;
	var cdnPrefix: string;
	var determineRightClickPosition: (e: MouseEvent) => { x: number; y: number };
	var domainClientCode: string;
	var domainAppCode: string;
	var lastInteracted: number;
	// var d3: typeof import('d3/index');
}

globalThis.getRemoteFunctionRepository = RemoteRepository.getRemoteFunctionRepository;
globalThis.getRemoteSchemaRepository = RemoteRepository.getRemoteSchemaRepository;

// To enable debug mode, add ?debug to the URL
window.isDebugMode = window.location.search.indexOf('debug') != -1;

// To check if the app is being interacted with
window.lastInteracted = Date.now();

const THREE_MINUTES = 3 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;
setInterval(async () => {
	const AUTH_TOKEN_EXPIRY = window.isDebugMode ? 'designMode_AuthTokenExpiry' : 'AuthTokenExpiry';
	const AUTH_TOKEN = window.isDebugMode ? 'designMode_AuthToken' : 'AuthToken';
	let authTokenExpiry = parseInt(window.localStorage.getItem(AUTH_TOKEN_EXPIRY) ?? '0');
	if (isNaN(authTokenExpiry)) return;
	authTokenExpiry *= 1000;

	const now = Date.now();

	if (
		authTokenExpiry < now || // Token is already expired
		authTokenExpiry - now > THREE_MINUTES || // Token expires in more than 2 minutes
		now - window.lastInteracted > FIFTEEN_MINUTES // No interaction for 15 minutes
	)
		return;

	// Refresh token

	const token = window.localStorage.getItem(AUTH_TOKEN);
	if (!token) return;

	axios({
		url: 'api/security/refreshToken',
		method: 'GET',
		headers: {
			Authorization: JSON.parse(token ?? '""'),
		},
	}).then(response => {
		window.localStorage.setItem(AUTH_TOKEN, JSON.stringify(response.data.accessToken));
		window.localStorage.setItem(AUTH_TOKEN_EXPIRY, response.data.accessTokenExpiryAt);
	});
}, 60000);

const app = document.getElementById('app');
if (!app) {
	const span = document.createElement('SPAN');
	span.innerHTML = 'Unable to find "app" div to start the application.';
	document.body.appendChild(span);
} else {
	const root = createRoot(app);
	root.render(
		<>
			<AppStyle />
			<App />
		</>,
	);
}
