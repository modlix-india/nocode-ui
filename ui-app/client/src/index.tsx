import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App/App';
import AppStyle from './App/AppStyle';
import { PageDefinition } from './types/common';

declare global {
	var nodeDev: boolean;
	var isDesignMode: boolean;
	var designMode: string;
	var getStore: () => any;
	var pageEditor: {
		selectedComponent: string;
		selectedSubComponent: string;
		editingPageDefinition: PageDefinition;
		personalization: any;
	};
}

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
