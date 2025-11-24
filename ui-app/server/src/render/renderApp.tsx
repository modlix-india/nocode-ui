import { Writable } from 'node:stream';
import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { App } from '../../client/src/App/App';
import { AppStyle } from '../../client/src/App/AppStyle';
import { AppBootstrapPayload } from '../../client/src/types/bootstrap';
import { resetStore } from '../../client/src/context/StoreContext';

export interface RenderRequest {
	bootstrap: AppBootstrapPayload;
}

export interface RenderResponse {
	html: string;
	state: AppBootstrapPayload;
}

export async function renderApplication({ bootstrap }: RenderRequest): Promise<RenderResponse> {
	const previousBootstrap = globalThis.__APP_BOOTSTRAP__;
	const previousAppDef = globalThis.appDefinitionResponse;
	const previousPageDef = globalThis.pageDefinitionResponse;
	const previousPageRequest = globalThis.pageDefinitionRequestPageName;

	prepareGlobalFlags(bootstrap);
	globalThis.__APP_BOOTSTRAP__ = bootstrap;
	globalThis.appDefinitionResponse = bootstrap.appDefinitionResponse;
	globalThis.pageDefinitionResponse = bootstrap.pageDefinitionResponse;
	globalThis.pageDefinitionRequestPageName = bootstrap.pageDefinitionRequestPageName;

	resetStore();

	try {
		const html = await renderToString(
			<AppShell location={bootstrap.location} />,
		);

		const storeSnapshot =
			typeof globalThis.getStore === 'function' ? globalThis.getStore() : undefined;

		const state: AppBootstrapPayload = {
			...bootstrap,
			store: storeSnapshot,
		};

		return { html, state };
	} finally {
		globalThis.__APP_BOOTSTRAP__ = previousBootstrap;
		globalThis.appDefinitionResponse = previousAppDef;
		globalThis.pageDefinitionResponse = previousPageDef;
		globalThis.pageDefinitionRequestPageName = previousPageRequest;
	}
}

function AppShell({
	location,
}: {
	location?: { pathname?: string; search?: string; hash?: string };
}) {
	const locationString = `${location?.pathname ?? '/'}${location?.search ?? ''}${
		location?.hash ?? ''
	}`;
	return (
		<>
			<AppStyle />
			<App RouterComponent={StaticRouter} routerProps={{ location: locationString }} />
		</>
	);
}

function renderToString(node: React.ReactElement) {
	return new Promise<string>((resolve, reject) => {
		const chunks: Array<string> = [];
		let didError = false;

		const { pipe, abort } = renderToPipeableStream(node, {
			onAllReady() {
				const writable = new Writable({
					write(chunk, _encoding, callback) {
						chunks.push(Buffer.from(chunk).toString());
						callback();
					},
				});

				writable.on('finish', () => resolve(chunks.join('')));
				writable.on('error', err => reject(err));
				pipe(writable);
			},
			onShellError(err) {
				didError = true;
				reject(err);
			},
			onError(err) {
				didError = true;
				console.error('SSR render error', err);
			},
		});

		setTimeout(() => {
			if (!didError) abort();
		}, 10000);
	});
}

function prepareGlobalFlags(bootstrap: AppBootstrapPayload) {
	globalThis.nodeDev = false;
	globalThis.isDesignMode = false;
	globalThis.isFullDebugMode = false;
	globalThis.isDebugMode = false;
	globalThis.designMode = 'NONE';
	globalThis.styleProperties = globalThis.styleProperties ?? {};
	if (bootstrap?.urlDetails?.appCode) globalThis.domainAppCode = bootstrap.urlDetails.appCode;
	if (bootstrap?.urlDetails?.clientCode) globalThis.domainClientCode = bootstrap.urlDetails.clientCode;
}
