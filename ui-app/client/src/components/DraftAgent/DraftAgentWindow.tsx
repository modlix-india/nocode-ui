import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppStyle } from '../../App/AppStyle';
import { ErrorBoundary } from '../../App/ErrorBoundary';
import { DraftAgentApp } from './LazyDraftAgent';

/**
 * The detached mode: the agent alone, in its own browser window, on the draft's
 * own origin so it can share the session the page already has.
 *
 * Imported by index.tsx only for WINDOW_PATH, after the application definition is
 * in place, so the store and the theme are ready exactly as they are for a page.
 * The app itself is never rendered here; the page that opened this window shows
 * the agent's changes, and this window forwards them to it.
 */
export function renderDraftAgentWindow(root: HTMLElement) {
	const appCode = globalThis.appDefinitionResponse?.application?.appCode ?? '';
	document.title = appCode ? `AI: ${appCode} (draft)` : 'AI (draft)';
	root.innerHTML = '';
	createRoot(root).render(
		<ErrorBoundary>
			<AppStyle />
			<BrowserRouter>
				<DraftAgentApp
					windowed
					defaultMode="right"
					icon=""
					showWhenSignedOut
					placeholder="Ask the AI to change this app..."
				/>
			</BrowserRouter>
		</ErrorBoundary>,
	);
}
