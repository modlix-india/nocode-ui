import { duplicate } from '@fincity/kirun-js';
import { STORE_PREFIX } from './constants';
import { getDataFromPath, setData } from './context/StoreContext';

const _parent = window.parent !== window.top ? window.parent : window.top;

export function messageToMaster(message: { type: string; payload: any }) {
	_parent.postMessage(
		{ ...message, editorType: globalThis.designMode, screenType: globalThis.screenType },
		'*',
	);
}

export const SLAVE_FUNCTIONS = new Map<string, (payload: any) => void>([
	[
		'EDITOR_TYPE',
		p => {
			globalThis.designMode = p.type;
			globalThis.screenType = p.screenType;

			window.raiseDesignModeChangeEvent();
		},
	],
	[
		'EDITOR_FILLER_SECTION_SELECTION',
		p => {
			if (!globalThis.fillerValueEditor) globalThis.fillerValueEditor = {};
			globalThis.fillerValueEditor.selectedComponent = p?.section.gridKey;
			globalThis.fillerValueEditor.selectedSectionNumber = p?.sectionNumber;
		},
	],
	[
		'EDITOR_DEFINITION',
		p => (globalThis.pageEditor = { ...globalThis.pageEditor, editingPageDefinition: p }),
	],
	[
		'EDITOR_SELECTION',
		p =>
		(globalThis.pageEditor = {
			...globalThis.pageEditor,
			selectedComponents: p as string[],
		}),
	],
	[
		'EDITOR_SUB_SELECTION',
		p => (globalThis.pageEditor = { ...globalThis.pageEditor, selectedSubComponent: p }),
	],
	[
		'EDITOR_PERSONALIZATION',
		p => (globalThis.pageEditor = { ...globalThis.pageEditor, personalization: p }),
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

	// The editor used to drive these three straight off the iframe element:
	// `contentWindow.location.reload()`, `contentWindow.history.back()`. Once the
	// preview moved onto its own draft-edit hostname those became cross-origin
	// property access and throw, so the frame does it to itself instead. It is also
	// the more honest shape -- navigating this document was never the parent's to do.
	['EDITOR_RELOAD', () => window.location.reload()],
	['EDITOR_HISTORY_BACK', () => window.history.back()],
	['EDITOR_HISTORY_FORWARD', () => window.history.forward()],
]);

if (globalThis.isDesignMode) {
	/**
	 * Raw viewport coordinates, for the master to translate.
	 *
	 * This used to reach up into `parent.window.document` for the iframe's rect and
	 * scale factor, which is cross-origin once the preview is on its own hostname.
	 * The master has the element and the layout, so it does the arithmetic -- see
	 * `toMasterPosition` in the page editor's masterFunctions.
	 */
	globalThis.determineRightClickPosition = e => ({ x: e.clientX, y: e.clientY });
}
