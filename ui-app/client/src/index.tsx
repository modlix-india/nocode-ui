import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App/App';
import AppStyle from './App/AppStyle';
import { PageDefinition } from './types/common';
import { REPO_SERVER, RemoteRepository } from './Engine/RemoteRepository';
import { Function, Schema } from '@fincity/kirun-js';

declare global {
	var nodeDev: boolean;
	var isDesignMode: boolean;
	var designMode: string;
	var getStore: () => any;
	var isDebugMode: boolean;
	var pageEditor: {
		selectedComponent: string;
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
	var cdnHostName: string;
}

globalThis.getRemoteFunctionRepository = RemoteRepository.getRemoteFunctionRepository;
globalThis.getRemoteSchemaRepository = RemoteRepository.getRemoteSchemaRepository;

// To enable debug mode, add ?debug to the URL
window.isDebugMode = window.location.search.indexOf('debug') != -1;

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
