import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RenderEngineContainer } from '../Engine/RenderEngineContainer';
import * as getAppDefinition from '../definitions/getAppDefinition.json';
import { runEvent } from '../components/util/runEvent';
import {
	addListener,
	addListenerAndCallImmediately,
	getDataFromPath,
	innerSetData,
	setData,
} from '../context/StoreContext';
import { GLOBAL_CONTEXT_NAME, STORE_PREFIX } from '../constants';
import { StyleResolution } from '../types/common';
import { StyleResolutionDefinition } from '../util/styleProcessor';
import { Messages } from './Messages/Messages';
import { isSlave, messageToMaster, SLAVE_FUNCTIONS } from '../slaveFunctions';
import { isNullValue } from '@fincity/kirun-js';
import GlobalLoader from './GlobalLoader';

// In design mode we are listening to the messages from editor

window.isDesignMode = isSlave;

function onMessageFromEditor(event: MessageEvent) {
	const { data: { type, payload } = {} } = event;
	if (!type || !type.startsWith('EDITOR_')) return;

	if (!SLAVE_FUNCTIONS.has(type)) throw Error('Unknown message from Editor : ' + type);

	SLAVE_FUNCTIONS.get(type)?.(payload);
	if (type === 'EDITOR_DEFINITION') {
		if (!payload || !payload.name) return;
		const storePage = getDataFromPath(`${STORE_PREFIX}.pageDefinition.${payload.name}`, []);
		if (storePage?.name !== payload.name) return;
		innerSetData(`${STORE_PREFIX}.pageDefinition.${payload.name}`, payload);
	}
}

function processTagType(headTags: any, tag: string) {
	if (!headTags) return;

	const existingLinks = document.head.getElementsByTagName(tag);
	for (let i = 0; i < existingLinks.length; i++) {
		document.head.removeChild(existingLinks[i]);
	}
	Object.entries(headTags)
		.sort((a: any[], b: any[]) => (b[1]?.order ?? 0) - (a[1]?.order ?? 0))
		.forEach(([key, attributes]: [string, any]) => {
			const link = document.createElement(tag);
			link.id = key;
			Object.entries(attributes).forEach(e => link.setAttribute(e[0], e[1] as string));
			document.head.appendChild(link);
		});
}

const addedKeySet = new Set<string>();

function processCodeParts(codeParts: any) {
	if (!codeParts) return;

	Object.entries(codeParts)
		.filter((e: any[]) => !!e[1].part)
		.sort(
			(a: any[], b: any[]) =>
				((b[1]?.order ?? 0) - (a[1]?.order ?? 0)) *
				(a[1]?.place.startsWith('AFTER_') ? 1 : -1),
		)
		.forEach(([key, code]: [string, any]) => {
			const setKey = `${code.place}_${key}`;
			if (addedKeySet.has(setKey)) return;

			let div = document.createElement('div');
			div.innerHTML = code.part.trim();

			if (code.place == 'AFTER_HEAD')
				Array.from(div.children)
					.reverse()
					.forEach(cp => document.head.insertBefore(cp, document.head.firstChild));
			else if (code.place == 'BEFORE_HEAD')
				Array.from(div.children).forEach(cp => document.head.appendChild(cp));
			else if (code.place == 'AFTER_BODY')
				Array.from(div.children)
					.reverse()
					.forEach(cp => document.body.insertBefore(cp, document.body.firstChild));
			else if (code.place == 'BEFORE_BODY')
				Array.from(div.children).forEach(cp => document.body.appendChild(cp));

			addedKeySet.add(setKey);
		});
}

function processFontPacks(fontPacks: any) {
	if (!fontPacks) return;

	Object.entries(fontPacks)
		.sort((a: any[], b: any[]) => (a[1]?.order ?? 0) - (b[1]?.order ?? 0))
		.forEach(([key, fontPack]: [string, any]) => {
			const setKey = `FONT_${key}`;
			if (addedKeySet.has(setKey)) return;

			let div = document.createElement('div');
			div.innerHTML = fontPack.code.trim();

			Array.from(div.children).forEach(cp => document.head.appendChild(cp));
		});
}

const ICON_PACKS = new Map<string, string>([
	[
		'FREE_FONT_AWESOME_ALL',
		'<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />',
	],

	[
		'MATERIAL_SYMBOLS_OUTLINED',
		'<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" /><link href="https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/MATERIAL_SYMBOLS/font.css" rel="stylesheet" />',
	],

	[
		'MATERIAL_SYMBOLS_ROUNDED',
		'<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" /><link href="https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/MATERIAL_SYMBOLS/font.css" rel="stylesheet" />',
	],

	[
		'MATERIAL_SYMBOLS_SHARP',
		'<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" /><link href="https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/MATERIAL_SYMBOLS/font.css" rel="stylesheet" />',
	],

	[
		'MATERIAL_ICONS_FILLED',
		'<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"><link href="https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/MATERIAL_ICONS/font.css" rel="stylesheet" />',
	],

	[
		'MATERIAL_ICONS_OUTLINED',
		'<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet"><link href="https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/MATERIAL_ICONS/font.css" rel="stylesheet" />',
	],

	[
		'MATERIAL_ICONS_ROUNDED',
		'<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"><link href="https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/MATERIAL_ICONS/font.css" rel="stylesheet" />',
	],

	[
		'MATERIAL_ICONS_SHARP',
		'<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet"><link href="https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/MATERIAL_ICONS/font.css" rel="stylesheet" />',
	],

	[
		'MATERIAL_ICONS_TWO_TONE',
		'<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Two+Tone" rel="stylesheet"><link href="https://cdn.jsdelivr.net/gh/fincity-india/nocode-ui-icon-packs@master/dist/fonts/MATERIAL_ICONS/font.css" rel="stylesheet" />',
	],
]);

function processIconPacks(iconPacks: any) {
	if (!iconPacks) return;

	Object.entries(iconPacks).forEach(([key, iconPack]: [string, any]) => {
		const setKey = `ICON_${key}`;
		if (addedKeySet.has(setKey)) return;

		let code = iconPack.code;

		if (isNullValue(code)) code = ICON_PACKS.get(iconPack.name);

		let div = document.createElement('div');
		div.innerHTML = code.trim();

		Array.from(div.children).forEach(cp => document.head.appendChild(cp));
	});
}

export function App() {
	const [isApplicationLoadFailed, setIsApplicationFailed] = useState(false);
	const [applicationLoaded, setApplicationLoaded] = useState(false);

	const [firstTime, setFirstTime] = useState(true);
	useEffect(
		() =>
			addListenerAndCallImmediately(
				async (_, appDef) => {
					if (appDef === undefined) {
						await runEvent(
							getAppDefinition,
							'initialLoadFunction',
							GLOBAL_CONTEXT_NAME,
							[],
						);
						setApplicationLoaded(true);
						return;
					}

					if (appDef && firstTime) {
						setFirstTime(false);
						if (window.isDesignMode) {
							window.addEventListener('message', onMessageFromEditor);
							messageToMaster({ type: 'SLAVE_STARTED', payload: undefined });
						}
					}

					const { properties } = appDef;
					if (!properties || (!globalThis.nodeDev && !globalThis.isDesignMode)) return;

					processTagType(properties.links, 'LINK');
					processTagType(properties.scripts, 'SCRIPT');
					processTagType(properties.metas, 'META');
					processFontPacks(properties.fontPacks);
					processIconPacks(properties.iconPacks);
					processCodeParts(properties.codeParts);
				},
				undefined,
				`${STORE_PREFIX}.application`,
			),
		[firstTime, setFirstTime],
	);

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

	if (!applicationLoaded) return <GlobalLoader noSpin={true} />;
	return (
		<>
			<BrowserRouter>
				<Routes>
					<Route path="/*" element={<RenderEngineContainer />} />
				</Routes>
			</BrowserRouter>
			<Messages />
		</>
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

	if (
		size <=
		StyleResolutionDefinition.get(StyleResolution.MOBILE_LANDSCAPE_SCREEN_SMALL)?.maxWidth!
	) {
		newDevices[StyleResolution.MOBILE_LANDSCAPE_SCREEN_SMALL] = true;
		newDevices[StyleResolution.TABLET_POTRAIT_SCREEN_SMALL] = true;
		newDevices[StyleResolution.TABLET_LANDSCAPE_SCREEN_SMALL] = true;
		newDevices[StyleResolution.DESKTOP_SCREEN_SMALL] = true;
	}
	if (
		size <=
		StyleResolutionDefinition.get(StyleResolution.TABLET_POTRAIT_SCREEN_SMALL)?.maxWidth!
	) {
		newDevices[StyleResolution.TABLET_POTRAIT_SCREEN_SMALL] = true;
		newDevices[StyleResolution.TABLET_LANDSCAPE_SCREEN_SMALL] = true;
		newDevices[StyleResolution.DESKTOP_SCREEN_SMALL] = true;
	}
	if (
		size <=
		StyleResolutionDefinition.get(StyleResolution.TABLET_LANDSCAPE_SCREEN_SMALL)?.maxWidth!
	) {
		newDevices[StyleResolution.TABLET_LANDSCAPE_SCREEN_SMALL] = true;
		newDevices[StyleResolution.DESKTOP_SCREEN_SMALL] = true;
	}
	if (size <= StyleResolutionDefinition.get(StyleResolution.DESKTOP_SCREEN_SMALL)?.maxWidth!) {
		newDevices[StyleResolution.DESKTOP_SCREEN_SMALL] = true;
	}

	let devicesString = JSON.stringify(newDevices);

	if (currentDevices === devicesString) return;
	currentDevices = devicesString;
	setData('Store.devices', newDevices);
	setData('Store.window.innerWidth', window.innerWidth);
	setData('Store.window.innerHeight', window.innerHeight);
	setData('Store.window.outerWidth', window.outerWidth);
	setData('Store.window.outerHeight', window.outerHeight);
	setData('Store.window.screenWidth', window.screen.width);
	setData('Store.window.screenHeight', window.screen.height);
	setData('Store.window.devicePixelRatio', window.devicePixelRatio);
	setData('Store.window.isLandscape', window.innerWidth > window.innerHeight);
	setData('Store.window.isPortrait', window.innerWidth < window.innerHeight);
	setData('Store.window.isMaximized', window.outerWidth === window.screen.width);
	setData('Store.window.isMinimized', window.outerWidth === 0);
	setData('Store.window.screenLeft', window.screenLeft);
	setData('Store.window.screenTop', window.screenTop);
	setScrollDetails();
}

function setScrollDetails() {
	let size = document.body.scrollHeight - window.innerHeight;
	setData(
		'Store.window.scrollYPercentage',
		size <= 0 ? 0 : 100 - (Math.round(((size - window.scrollY) * 100) / size) || 0),
	);
	setData('Store.window.scrollY', window.scrollY);

	size = document.body.scrollWidth - window.innerWidth;
	setData(
		'Store.window.scrollXPercentage',
		size <= 0 ? 0 : 100 - (Math.round(((size - window.scrollX) * 100) / size) || 0),
	);

	setData('Store.window.scrollX', window.scrollX);
}

setDeviceType();
window.addEventListener('resize', setDeviceType);
window.addEventListener('scroll', setScrollDetails);
