import { duplicate } from '@fincity/kirun-js';
import { getDataFromPath, setData } from './context/StoreContext';
import { ComponentDefinition } from './types/common';
import { STORE_PREFIX } from './constants';

export const isSlave = (() => {
	try {
		return window.self !== window.top;
	} catch (e) {
		return false;
	}
})();

const _parent = window.parent !== window.top ? window.parent : window.top;
export function messageToMaster(message: { type: string; payload: any | undefined }) {
	_parent.postMessage(
		{ ...message, editorType: window.designMode, screenType: window.screenType },
		'*',
	);
}

export const SLAVE_FUNCTIONS = new Map<string, (payload: any) => void>([
	[
		'EDITOR_TYPE',
		p => {
			window.designMode = p.type;
			window.screenType = p.screenType;
		},
	],
	[
		'EDITOR_FILLER_SECTION_SELECTION',
		p => {
			if (!window.fillerValueEditor) window.fillerValueEditor = {};
			window.fillerValueEditor.selectedComponent = p?.section.gridKey;
			window.fillerValueEditor.selectedSectionNumber = p?.sectionNumber;
		},
	],
	[
		'EDITOR_DEFINITION',
		p => (window.pageEditor = { ...window.pageEditor, editingPageDefinition: p }),
	],
	[
		'EDITOR_SELECTION',
		p => (window.pageEditor = { ...window.pageEditor, selectedComponents: p as string[] }),
	],
	[
		'EDITOR_SUB_SELECTION',
		p => (window.pageEditor = { ...window.pageEditor, selectedSubComponent: p }),
	],
	[
		'EDITOR_PERSONALIZATION',
		p => (window.pageEditor = { ...window.pageEditor, personalization: p }),
	],
	[
		'EDITOR_APP_DEFINITION',
		p => {
			if (!p) return;
			const appPath = `${STORE_PREFIX}.application`;
			const app = duplicate(getDataFromPath(appPath, []));
			if (!app) return;
			if (!app.properties) app.properties = {};
			if (p.properties.iconPacks) {
				app.properties.iconPacks = p.properties.iconPacks;
			}
			if (p.properties.fontPacks) {
				app.properties.fontPacks = p.properties.fontPacks;
			}
			setData(appPath, app);
		},
	],
	[
		'EDITOR_FILLER_VALUE_CHANGE',
		p => {
			if (!p) return;
			const appPath = `${STORE_PREFIX}.application`;
			const app = duplicate(getDataFromPath(appPath, []));
			if (!app) return;
			if (!app.properties) app.properties = {};

			app.properties.fillerValues = p.values;
			setData(appPath, app);
		},
	],
]);

window.determineClickPosition = e => {
	const iframe = parent.window.document.getElementById(window.screenType);

	if (!iframe) return { x: 0, y: 0 };

	const iframeRect = iframe.getBoundingClientRect();
	console.log(iframeRect, iframe.dataset.scaleFactor);

	const point = {
		x: e.clientX * Number(iframe.dataset.scaleFactor ?? 1) + iframeRect.x,
		y: e.clientY * Number(iframe.dataset.scaleFactor ?? 1) + iframeRect.y,
	};
	console.log(point);
	return point;
};

if (isSlave) {
	window.addEventListener('mousedown', (e: MouseEvent) => {
		e.preventDefault();

		if (e.button !== 2) return;

		let key = e.currentTarget?.id || e.target?.id;
		if (!key) return;
		if (!key.startsWith('helper_component_key_')) return;
		key = key.substring(21);
		e.stopPropagation();

		messageToMaster({
			type: 'SLAVE_CONTEXT_MENU',
			payload: {
				componentKey: key,
				menuPosition: window.determineClickPosition(e),
			},
		});
	});
}
