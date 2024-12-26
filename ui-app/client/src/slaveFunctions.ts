import { duplicate } from '@fincity/kirun-js';
import { STORE_PREFIX } from './constants';
import { getDataFromPath, setData } from './context/StoreContext';

export const isSlave = (() => {
	try {
		return window.self !== window.top;
	} catch (e) {
		return false;
	}
})();

const _parent = window.parent !== window.top ? window.parent : window.top;
export function messageToMaster(message: { type: string; payload: any }) {
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
	[
		'EDITOR_APP_THEME',
		p => {
			setData(`${STORE_PREFIX}.theme`, p?.variables);
		},
	],
]);

if (isSlave) {
	window.determineRightClickPosition = e => {
		const iframe = parent.window.document.getElementById(window.screenType);
		if (!iframe) return { x: 0, y: 0 };

		const iframeRect = iframe.getBoundingClientRect();
		const sf = iframe.dataset.scaleFactor ? parseInt(iframe.dataset.scaleFactor) : 1;

		let top = iframeRect.top;
		let left = iframeRect.left;

		const point = {
			x: e.clientX * sf + left,
			y: e.clientY * sf + top,
		};
		return point;
	};
}
