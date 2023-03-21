import { PageDefinition } from './types/common';

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
		'EDITOR_PERSONALIZATION',
		p => (window.pageEditor = { ...window.pageEditor, personalization: p }),
	],
]);
