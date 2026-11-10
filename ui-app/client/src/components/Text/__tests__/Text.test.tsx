/**
 * The Text component's tooltip. Its title used to repeat the text on the wrapper at all
 * times, so screen readers read the title and then the text: every line twice. The
 * echo of the text now sits on the element only while the mouse is over it, while an
 * authored tooltip, or text cut short by Text Length, keeps a real title.
 *
 * REAL: the component, getTranslations, formatString. STUBBED: the store, the
 * definition resolver, style processing and the helper overlays.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../context/StoreContext', () => ({
	PageStoreExtractor: { getForContext: () => ({ getPageName: () => 'testpage' }) },
	UrlDetailsExtractor: { getForContext: () => ({}) },
	addListenerAndCallImmediatelyWithChildrenActivity: () => () => {},
	getDataFromPath: () => undefined,
}));
jest.mock('../../../util/styleProcessor', () => ({
	processComponentStylePseudoClasses: () => ({}),
}));
jest.mock('../TextStyle', () => ({ __esModule: true, default: () => null }));
jest.mock('../../HelperComponents/SubHelperComponent', () => ({
	SubHelperComponent: () => null,
}));
jest.mock('../../HelperComponents/HelperComponent', () => ({ HelperComponent: () => null }));
jest.mock('../../../commonComponents/Markdown/MarkdownParser', () => ({
	MarkdownParser: () => null,
}));

let properties: Record<string, any> = {};
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({ key: 'txt', properties, stylePropertiesWithPseudoStates: {} }),
}));

import textDescriptor from '../Text';

const Text = textDescriptor.component as React.FunctionComponent<any>;

let container: HTMLDivElement;
let root: Root;

function render(props: Record<string, any>) {
	properties = {
		textContainer: 'SPAN',
		stringFormat: 'STRING',
		textColor: '',
		...props,
	};
	act(() =>
		root.render(
			<Text
				definition={{ key: 'txt', name: 'txt', type: 'Text', properties: {} }}
				pageDefinition={{ name: 'testpage', translations: {} }}
				locationHistory={[]}
				context={{ pageName: 'testpage' }}
			/>,
		),
	);
}

function wrapper(): HTMLElement {
	const el = container.querySelector<HTMLElement>('.compText');
	if (!el) throw new Error('no text rendered');
	return el;
}

// React's onMouseEnter/onMouseLeave are driven by mouseover/mouseout.
function hover() {
	act(() => {
		wrapper().dispatchEvent(
			new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }),
		);
	});
}

function unhover() {
	act(() => {
		wrapper().dispatchEvent(
			new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }),
		);
	});
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

describe('Text tooltip', () => {
	it('carries no title at rest, so the text is announced once', () => {
		render({ text: 'Call agents' });
		expect(wrapper().hasAttribute('title')).toBe(false);
		expect(wrapper().textContent).toBe('Call agents');
	});

	it('still shows the text as a tooltip while hovered, and drops it after', () => {
		render({ text: 'Call agents' });
		hover();
		expect(wrapper().getAttribute('title')).toBe('Call agents');
		unhover();
		expect(wrapper().hasAttribute('title')).toBe(false);
	});

	it('follows a text that changes during the hover', () => {
		render({ text: '00:01' });
		hover();
		render({ text: '00:02' });
		expect(wrapper().getAttribute('title')).toBe('00:02');
	});

	it('shows no tooltip with removeToolTip', () => {
		render({ text: 'Call agents', removeToolTip: true });
		hover();
		expect(wrapper().hasAttribute('title')).toBe(false);
	});

	it('keeps an authored tooltip as a real title, also over removeToolTip', () => {
		render({ text: 'Done when', tooltip: 'The date the task was closed' });
		expect(wrapper().getAttribute('title')).toBe('The date the task was closed');
		hover();
		unhover();
		expect(wrapper().getAttribute('title')).toBe('The date the task was closed');

		render({ text: 'Done when', tooltip: 'Closed on', removeToolTip: true });
		expect(wrapper().getAttribute('title')).toBe('Closed on');
	});

	it('keeps the full text as a title when Text Length cuts it short', () => {
		render({ text: 'A rather long line of text', textLength: 10 });
		expect(wrapper().textContent).toBe('A rathe...');
		expect(wrapper().getAttribute('title')).toBe('A rather long line of text');
		hover();
		unhover();
		expect(wrapper().getAttribute('title')).toBe('A rather long line of text');
	});

	it('has no title when Text Length does not cut the text', () => {
		render({ text: 'Short', textLength: 10 });
		expect(wrapper().hasAttribute('title')).toBe(false);
	});
});
