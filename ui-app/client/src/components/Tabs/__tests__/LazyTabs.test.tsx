/**
 * Keyboard and screen reader wiring of the Tabs component (ADZ-2014): tablist, tab with
 * aria-selected, one tab stop, arrow / Home / End keys, tabpanel named by the selected tab.
 * The page store, the definition hook and the children are mocked so only the component's own
 * logic runs in jsdom.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

let mockProps: any = {};

jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({ properties: mockProps, stylePropertiesWithPseudoStates: {} }),
}));

jest.mock('../../../context/StoreContext', () => ({
	__esModule: true,
	getPathFromLocation: (p: string) => p,
	getDataFromPath: () => undefined,
	setData: jest.fn(),
	addListenerAndCallImmediately: () => () => undefined,
	PageStoreExtractor: { getForContext: () => ({ getPageName: () => 'p' }) },
	UrlDetailsExtractor: { getForContext: () => ({}) },
}));

jest.mock('../../../util/styleProcessor', () => ({
	__esModule: true,
	processComponentStylePseudoClasses: () => ({}),
}));

jest.mock('../../Children', () => ({ __esModule: true, default: () => null }));
jest.mock('../../HelperComponents/HelperComponent', () => ({
	__esModule: true,
	HelperComponent: () => null,
}));
jest.mock('../../HelperComponents/SubHelperComponent', () => ({
	__esModule: true,
	SubHelperComponent: () => null,
}));
jest.mock('../../util/runEvent', () => ({ __esModule: true, runEvent: jest.fn() }));

// eslint-disable-next-line import/first
import LazyTabs from '../LazyTabs';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const baseProps: any = {
	definition: { key: 'tabs1', name: 'tabs', type: 'Tabs', children: {} },
	context: { pageName: 'p' },
	pageDefinition: { componentDefinition: {}, translations: {} },
	locationHistory: [],
};

function key(el: Element, k: string) {
	act(() => {
		el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
	});
}

describe('LazyTabs accessibility', () => {
	let container: HTMLElement;
	let root: Root | undefined;

	function mount(props: any) {
		mockProps = {
			tabs: ['Chat', 'Product', 'Ads'],
			icon: [],
			image: [],
			showLabel: true,
			tabsOrientation: '_horizontal',
			...props,
		};
		root = createRoot(container);
		act(() => {
			root!.render(<LazyTabs {...baseProps} />);
		});
	}

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		if (root) act(() => root!.unmount());
		root = undefined;
		container.remove();
	});

	const tabs = () => Array.from(container.querySelectorAll('[role="tab"]')) as HTMLElement[];

	it('renders a tablist of tabs with one tab stop and a labelled panel', () => {
		mount({ defaultActive: 'Product', ariaLabel: 'Campaign panel' });
		const list = container.querySelector('[role="tablist"]') as HTMLElement;
		expect(list).not.toBeNull();
		expect(list.getAttribute('aria-label')).toBe('Campaign panel');
		expect(tabs().map(t => t.getAttribute('aria-selected'))).toEqual([
			'false',
			'true',
			'false',
		]);
		expect(tabs().map(t => t.tabIndex)).toEqual([-1, 0, -1]);
		const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
		expect(panel.getAttribute('aria-labelledby')).toBe(tabs()[1].id);
		tabs().forEach(t => expect(t.getAttribute('aria-controls')).toBe(panel.id));
	});

	it('leaves the tab row unnamed when no accessible name is set', () => {
		mount({});
		const list = container.querySelector('[role="tablist"]') as HTMLElement;
		expect(list.hasAttribute('aria-label')).toBe(false);
	});

	it('Left and Right select the neighbour, move focus and wrap', () => {
		mount({ defaultActive: 'Chat' });
		tabs()[0].focus();
		key(tabs()[0], 'ArrowRight');
		expect(tabs().map(t => t.getAttribute('aria-selected'))).toEqual([
			'false',
			'true',
			'false',
		]);
		expect(document.activeElement).toBe(tabs()[1]);
		expect(tabs().map(t => t.tabIndex)).toEqual([-1, 0, -1]);
		key(tabs()[1], 'ArrowLeft');
		key(tabs()[0], 'ArrowLeft');
		expect(tabs()[2].getAttribute('aria-selected')).toBe('true');
		expect(document.activeElement).toBe(tabs()[2]);
	});

	it('Home and End jump to the ends', () => {
		mount({ defaultActive: 'Product' });
		tabs()[1].focus();
		key(tabs()[1], 'End');
		expect(tabs()[2].getAttribute('aria-selected')).toBe('true');
		key(tabs()[2], 'Home');
		expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
		expect(document.activeElement).toBe(tabs()[0]);
	});

	it('Enter and Space pick the focused tab', () => {
		mount({ defaultActive: 'Chat' });
		key(tabs()[2], 'Enter');
		expect(tabs()[2].getAttribute('aria-selected')).toBe('true');
		key(tabs()[1], ' ');
		expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
	});

	it('names an icon only tab from its label', () => {
		mount({ showLabel: false });
		expect(tabs().map(t => t.getAttribute('aria-label'))).toEqual(['Chat', 'Product', 'Ads']);
	});

	it('uses Up and Down only when vertical', () => {
		mount({ defaultActive: 'Chat', tabsOrientation: '_vertical' });
		const list = container.querySelector('[role="tablist"]') as HTMLElement;
		expect(list.getAttribute('aria-orientation')).toBe('vertical');
		key(tabs()[0], 'ArrowDown');
		expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
	});
});

describe('LazyTabs highlighter on a wrapped row', () => {
	let container: HTMLElement;
	let root: Root | undefined;
	const geometry = { offsetHeight: 32, offsetTop: 40, offsetLeft: 12, offsetWidth: 90 };
	const saved: Record<string, PropertyDescriptor | undefined> = {};

	beforeAll(() => {
		for (const [k, v] of Object.entries(geometry)) {
			saved[k] = Object.getOwnPropertyDescriptor(HTMLElement.prototype, k);
			Object.defineProperty(HTMLElement.prototype, k, { configurable: true, get: () => v });
		}
	});
	afterAll(() => {
		for (const k of Object.keys(geometry))
			if (saved[k]) Object.defineProperty(HTMLElement.prototype, k, saved[k]!);
	});
	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});
	afterEach(() => {
		if (root) act(() => root!.unmount());
		root = undefined;
		container.remove();
		jest.restoreAllMocks();
	});

	function highlighterHeight(flexWrap: string) {
		const real = window.getComputedStyle;
		jest.spyOn(window, 'getComputedStyle').mockImplementation((el: Element) =>
			(el as HTMLElement).classList?.contains('tabsContainer')
				? ({ flexWrap } as CSSStyleDeclaration)
				: real(el),
		);
		mockProps = {
			tabs: ['Chat', 'Product', 'Ads'],
			icon: [],
			image: [],
			showLabel: true,
			tabsOrientation: '_horizontal',
			defaultActive: 'Ads',
		};
		root = createRoot(container);
		act(() => {
			root!.render(<LazyTabs {...baseProps} />);
		});
		return (container.querySelector('.tabHighlighter') as HTMLElement).style.height;
	}

	it('takes the tab height when the row wraps', () => {
		expect(highlighterHeight('wrap')).toBe('32px');
	});

	it('keeps the full row height when the row does not wrap', () => {
		expect(highlighterHeight('nowrap')).toBe('100%');
	});
});
