import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RenderEngineContainer } from '../Engine/RenderEngineContainer';
import * as getAppDefinition from '../definitions/getAppDefinition.json';
import { runEvent } from '../components/util/runEvent';
import { addListener, setData, store } from '../context/StoreContext';
import { STORE_PREFIX } from '../constants';
import { StyleResolution } from '../types/common';
import { StyleResolutionDefinition } from '../util/styleProcessor';

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

		return addListener(
			(_, { properties } = {}) => {
				if (!properties) return;
				processTagType(properties.links, 'LINK');
				processTagType(properties.scripts, 'SCRIPT');
				processTagType(properties.metas, 'META');
			},
			undefined,
			`${STORE_PREFIX}.application`,
		);
	}, []);

	useEffect(
		() =>
			addListener(
				(_, value) => setIsApplicationFailed(value),
				undefined,
				`${STORE_PREFIX}.isApplicationLoadFailed`,
			),
		[],
	);

	if (isApplicationLoadFailed)
		return <>Application Load failed, Please contact your administrator</>;

	if (!applicationLoaded) return <>Loading...</>;
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/*" element={<RenderEngineContainer />} />
			</Routes>
		</BrowserRouter>
	);
}

let currentDevices = '';
function setDeviceType() {
	const size = document.body.offsetWidth;
	const newDevices: { [key: string]: boolean } = {};

	if (size >= (StyleResolutionDefinition.get(StyleResolution.WIDE_SCREEN)?.minWidth ?? 1281)) {
		newDevices[StyleResolution.WIDE_SCREEN] = true;
		newDevices[StyleResolution.DESKTOP_SCREEN] = true;
		newDevices[StyleResolution.TABLET_LANDSCAPE_SCREEN] = true;
		newDevices[StyleResolution.TABLET_POTRAIT_SCREEN] = true;
		newDevices[StyleResolution.MOBILE_LANDSCAPE_SCREEN] = true;
		newDevices[StyleResolution.MOBILE_POTRAIT_SCREEN] = true;
	} else if (
		size >= (StyleResolutionDefinition.get(StyleResolution.DESKTOP_SCREEN)?.minWidth ?? 1025)
	) {
		newDevices[StyleResolution.DESKTOP_SCREEN_ONLY] = true;
		newDevices[StyleResolution.DESKTOP_SCREEN] = true;
		newDevices[StyleResolution.TABLET_LANDSCAPE_SCREEN] = true;
		newDevices[StyleResolution.TABLET_POTRAIT_SCREEN] = true;
		newDevices[StyleResolution.MOBILE_LANDSCAPE_SCREEN] = true;
		newDevices[StyleResolution.MOBILE_POTRAIT_SCREEN] = true;
	} else if (
		size >=
		(StyleResolutionDefinition.get(StyleResolution.TABLET_LANDSCAPE_SCREEN)?.minWidth ?? 961)
	) {
		newDevices[StyleResolution.TABLET_LANDSCAPE_SCREEN_ONLY] = true;
		newDevices[StyleResolution.TABLET_LANDSCAPE_SCREEN] = true;
		newDevices[StyleResolution.TABLET_POTRAIT_SCREEN] = true;
		newDevices[StyleResolution.MOBILE_LANDSCAPE_SCREEN] = true;
		newDevices[StyleResolution.MOBILE_POTRAIT_SCREEN] = true;
	} else if (
		size >=
		(StyleResolutionDefinition.get(StyleResolution.TABLET_POTRAIT_SCREEN)?.minWidth ?? 641)
	) {
		newDevices[StyleResolution.TABLET_POTRAIT_SCREEN_ONLY] = true;
		newDevices[StyleResolution.TABLET_POTRAIT_SCREEN] = true;
		newDevices[StyleResolution.MOBILE_LANDSCAPE_SCREEN] = true;
		newDevices[StyleResolution.MOBILE_POTRAIT_SCREEN] = true;
	} else if (
		size >=
		(StyleResolutionDefinition.get(StyleResolution.MOBILE_LANDSCAPE_SCREEN)?.minWidth ?? 481)
	) {
		newDevices[StyleResolution.MOBILE_LANDSCAPE_SCREEN_ONLY] = true;
		newDevices[StyleResolution.MOBILE_LANDSCAPE_SCREEN] = true;
		newDevices[StyleResolution.MOBILE_POTRAIT_SCREEN] = true;
	} else {
		newDevices[StyleResolution.MOBILE_POTRAIT_SCREEN_ONLY] = true;
		newDevices[StyleResolution.MOBILE_POTRAIT_SCREEN] = true;
	}

	let devicesString = JSON.stringify(newDevices);

	if (currentDevices === devicesString) return;
	currentDevices = devicesString;
	setData('Store.devices', newDevices);
}

window.addEventListener('load', setDeviceType);
window.addEventListener('resize', setDeviceType);
