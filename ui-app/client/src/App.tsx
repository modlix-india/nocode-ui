import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RenderEngineContainer } from './Engine/RenderEngineContainer';
import * as getAppDefinition from './definitions/getAppDefinition.json';
import { runEvent } from './components/util/runEvent';
import { addListener } from './context/StoreContext';
import { STORE_PREFIX } from './constants';

function processTagType(headTags: any, tag: string) {
	if (!headTags) return;

	const existingLinks = document.head.getElementsByTagName(tag);
	for (let i = 0; i < existingLinks.length; i++) {
		document.head.removeChild(existingLinks[i]);
	}
	Object.entries(headTags).forEach(([key, attributes]: [string, any]) => {
		const link = document.createElement(tag);
		link.id = key;
		Object.entries(attributes).forEach(e => link.setAttribute(e[0], e[1] as string));
		document.head.appendChild(link);
	});
}

export function App() {
	const [isApplicationLoadFailed, setIsApplicationFailed] = useState(false);
	const [applicationLoaded, setApplicationLoaded] = useState(false);

	useEffect(() => {
		(async () => {
			await runEvent(getAppDefinition, 'initialLoadFunction');
			setApplicationLoaded(true);
		})();

		if (!globalThis.nodeDev) return;

		return addListener(`${STORE_PREFIX}.application`, (_, { properties } = {}) => {
			if (!properties) return;
			processTagType(properties.links, 'LINK');
			processTagType(properties.scripts, 'SCRIPT');
			processTagType(properties.metas, 'META');
		});
	}, []);

	useEffect(
		() =>
			addListener(`${STORE_PREFIX}.isApplicationLoadFailed`, (_, value) =>
				setIsApplicationFailed(value),
			),
		[],
	);

	if (isApplicationLoadFailed)
		return <>Application Load failed, Please contact your administrator</>;

	if (applicationLoaded)
		return (
			<BrowserRouter>
				<Routes>
					<Route path="/*" element={<RenderEngineContainer />} />
				</Routes>
			</BrowserRouter>
		);

	return <>Loading...</>;
}
