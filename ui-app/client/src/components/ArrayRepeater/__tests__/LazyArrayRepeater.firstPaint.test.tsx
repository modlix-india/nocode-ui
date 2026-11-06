/**
 * ArrayRepeater rows in the first paint: a list whose value is already in the store draws its rows
 * in the very first render, not only after the store listener (an effect, which runs after the
 * browser paints) fills them. Server rendering runs no effects, so it shows the first render alone.
 *
 * REAL: LazyArrayRepeater and its row building. STUBBED: the store, useDefinition, style processing,
 * helper overlays and Children (one marker per row).
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const storeValues = new Map<string, any>();
const listeners = new Map<string, (path: string, value: any) => void>();
jest.mock('../../../context/StoreContext', () => ({
	PageStoreExtractor: {
		getForContext: () => ({ getPageName: () => 'testpage', getPrefix: () => 'Page.' }),
	},
	UrlDetailsExtractor: { getForContext: () => ({ getPrefix: () => 'Url.' }) },
	storeExtractor: { getPrefix: () => 'Store.' },
	localStoreExtractor: { getPrefix: () => 'LocalStore.' },
	themeExtractor: { getPrefix: () => 'Theme.' },
	addListenerAndCallImmediatelyWithChildrenActivity: (
		_pageName: string,
		callback: (path: string, value: any) => void,
		path: string,
	) => {
		listeners.set(path, callback);
		callback(path, storeValues.get(path));
		return () => listeners.delete(path);
	},
	getPathFromLocation: (bp: any) => bp?.value ?? bp,
	getDataFromPath: (path: string) => storeValues.get(path),
	setData: (path: string, value: any) => {
		storeValues.set(path, value);
		listeners.get(path)?.(path, value);
	},
}));
jest.mock('../../../context/ParentExtractor', () => ({ ParentExtractorForRunEvent: jest.fn() }));
jest.mock('../../util/runEvent', () => ({ runEvent: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../../util/updateLoactionForChild', () => ({
	updateLocationForChild: (_k: string, _b: any, index: any) => ({ index }),
}));
jest.mock('../../../util/styleProcessor', () => ({
	processComponentStylePseudoClasses: () => ({}),
}));
jest.mock('../../HelperComponents/SubHelperComponent', () => ({ SubHelperComponent: () => null }));
jest.mock('../../HelperComponents/HelperComponent', () => ({ HelperComponent: () => null }));
jest.mock('../../Children', () => ({
	__esModule: true,
	default: ({ locationHistory }: any) => (
		<span className="row">{String(locationHistory[locationHistory.length - 1].index)}</span>
	),
}));
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({
		key: 'rep',
		properties: {
			showAdd: false,
			showDelete: false,
			showMove: false,
			plainItems: true,
			layout: 'SINGLECOLUMNLAYOUT',
		},
		stylePropertiesWithPseudoStates: {},
	}),
}));

import ArrayRepeater from '../LazyArrayRepeater';

const PATH = 'Page.drafts';

function element() {
	return (
		<ArrayRepeater
			definition={{
				key: 'rep',
				name: 'rep',
				type: 'ArrayRepeater',
				bindingPath: { type: 'VALUE', value: PATH },
				children: { row: true },
			}}
			pageDefinition={{ eventFunctions: {}, translations: {} } as any}
			locationHistory={[]}
			context={{ pageName: 'testpage' } as any}
		/>
	);
}

function rows(html: string): string[] {
	return Array.from(html.matchAll(/<span class="row">([^<]*)<\/span>/g)).map(m => m[1]);
}

describe('ArrayRepeater first paint', () => {
	beforeEach(() => {
		storeValues.clear();
		listeners.clear();
	});

	it('draws the rows of a value already in the store in the first render', () => {
		storeValues.set(PATH, [{ name: 'a' }, { name: 'b' }, { name: 'c' }]);
		expect(rows(renderToStaticMarkup(element()))).toEqual(['0', '1', '2']);
	});

	it('draws no rows when the value is not there yet', () => {
		expect(rows(renderToStaticMarkup(element()))).toEqual([]);
	});

	it('still follows the store after mounting, keeping one DOM node per row', () => {
		storeValues.set(PATH, [{ name: 'a' }, { name: 'b' }]);
		const container = document.createElement('div');
		const root = createRoot(container);
		act(() => root.render(element()));
		const first = container.querySelectorAll('.row')[0];
		expect(container.querySelectorAll('.row')).toHaveLength(2);

		act(() => {
			storeValues.set(PATH, [{ name: 'a' }, { name: 'b' }, { name: 'c' }]);
			listeners.get(PATH)?.(PATH, storeValues.get(PATH));
		});
		expect(container.querySelectorAll('.row')).toHaveLength(3);
		// the first row kept its key across the first render and the listener's call
		expect(container.querySelectorAll('.row')[0]).toBe(first);

		act(() => {
			storeValues.set(PATH, []);
			listeners.get(PATH)?.(PATH, []);
		});
		expect(container.querySelectorAll('.row')).toHaveLength(0);
		act(() => root.unmount());
	});
});
