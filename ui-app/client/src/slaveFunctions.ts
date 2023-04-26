import { setStoreData } from '@fincity/path-reactive-state-management';
import { ComponentDefinition, PageDefinition } from './types/common';
import duplicate from './util/duplicate';

export const isSlave = (() => {
	try {
		return window.self !== window.top;
	} catch (e) {
		return false;
	}
})();

const _parent = window.parent !== window.top ? window.parent : window.top;
export function messageToMaster(message: { type: string; payload: any | undefined }) {
	_parent.postMessage(message, '*');
}

export const SLAVE_FUNCTIONS = new Map<string, (payload: any) => void>([
	['EDITOR_TYPE', p => (window.designMode = p)],
	[
		'EDITOR_DEFINITION',
		p => (window.pageEditor = { ...window.pageEditor, editingPageDefinition: p }),
	],
	['EDITOR_SELECTION', p => (window.pageEditor = { ...window.pageEditor, selectedComponent: p })],
	[
		'EDITOR_SUB_SELECTION',
		p => (window.pageEditor = { ...window.pageEditor, selectedSubComponent: p }),
	],
	[
		'EDITOR_PERSONALIZATION',
		p => (window.pageEditor = { ...window.pageEditor, personalization: p }),
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
