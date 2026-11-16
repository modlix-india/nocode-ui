/**
 * The Link component's opt-in tooltip: with `tooltip` set the anchor carries it as its
 * title (the full label when an ellipsis style cuts it short); without it the anchor has
 * no title, as before.
 *
 * REAL: the component, getTranslations. STUBBED: the store, the definition resolver,
 * style processing and the helper overlays.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../context/StoreContext', () => ({
	PageStoreExtractor: { getForContext: () => ({ getPageName: () => 'testpage' }) },
	UrlDetailsExtractor: { getForContext: () => ({}) },
	getDataFromPath: () => undefined,
}));
jest.mock('../../../util/styleProcessor', () => ({
	processComponentStylePseudoClasses: () => ({}),
	processStyleObjectToCSS: () => '',
}));
jest.mock('../LinkStyle', () => ({ __esModule: true, default: () => null }));
jest.mock('../../HelperComponents/SubHelperComponent', () => ({
	SubHelperComponent: () => null,
}));
jest.mock('../../HelperComponents/HelperComponent', () => ({ HelperComponent: () => null }));

let properties: Record<string, any> = {};
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({ key: 'lnk', properties, stylePropertiesWithPseudoStates: {} }),
}));

import linkDescriptor from '../Link';

const Link = linkDescriptor.component as React.FunctionComponent<any>;

let container: HTMLDivElement;
let root: Root;

function render(props: Record<string, any>) {
	properties = { linkPath: '/campaign/1', ...props };
	act(() =>
		root.render(
			<MemoryRouter>
				<Link
					definition={{ key: 'lnk', name: 'lnk', type: 'Link', properties: {} }}
					pageDefinition={{ name: 'testpage', translations: {} }}
					locationHistory={[]}
					context={{ pageName: 'testpage' }}
				/>
			</MemoryRouter>,
		),
	);
}

function anchor(): HTMLAnchorElement {
	const el = container.querySelector<HTMLAnchorElement>('a.compLink');
	if (!el) throw new Error('no link rendered');
	return el;
}

beforeEach(() => {
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

describe('Link tooltip', () => {
	test('no tooltip: no title, as before', () => {
		render({ label: 'A very long campaign name' });
		expect(anchor().hasAttribute('title')).toBe(false);
		expect(anchor().textContent).toBe('A very long campaign name');
	});

	test('tooltip set: shown as the title', () => {
		render({ label: 'A very long campaign name', tooltip: 'A very long campaign name' });
		expect(anchor().getAttribute('title')).toBe('A very long campaign name');
	});

	test('the property is defined and has no default', () => {
		const def = linkDescriptor.properties.find(p => p.name === 'tooltip');
		expect(def).toBeDefined();
		expect(def?.defaultValue).toBeUndefined();
	});
});
