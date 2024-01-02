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
	_parent.postMessage({ ...message, editorType: window.designMode }, '*');
}

export const SLAVE_FUNCTIONS = new Map<string, (payload: any) => void>([
	['EDITOR_TYPE', p => (window.designMode = p)],
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

export function componentDefinitionPropertyUpdate(
	compDef: ComponentDefinition,
	...kvPairs: string[]
) {
	const def = duplicate(compDef) as ComponentDefinition;
	if (!def.properties) def.properties = {};
	if (!def.styleProperties) def.styleProperties = {};

	if (kvPairs.length % 2 !== 0) throw new Error('Invalid number of arguments');

	for (let i = 0; i < kvPairs.length; i += 2) {
		const key = kvPairs[i];
		const value = kvPairs[i + 1];
	}

	return compDef;
}
