import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { __setApplePlatformForTests } from '../comboUtil';
import { __resetLayersForTests } from '../layerStack';
import { shortcutRegistry } from '../shortcutRegistry';
import { STORE_PATH_SHORTCUTS } from '../../constants';
import { getDataFromPath } from '../../context/StoreContext';
import { useComponentShortcut } from '../useComponentShortcut';
import { ComponentProps, LocationHistory } from '../../types/common';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function makeProps(locationHistory: Array<LocationHistory>): ComponentProps {
	return {
		definition: { key: 'cmp1', name: 'Save', type: 'Button' },
		pageDefinition: {
			name: 'p',
			eventFunctions: {},
			translations: {},
			componentDefinition: {},
			rootComponent: 'r',
			properties: {},
		} as any,
		locationHistory,
		context: { pageName: 'testPage', shellPageName: 'shell', level: 0 },
	};
}

function Harness({
	locationHistory,
	onActivate,
}: Readonly<{ locationHistory: Array<LocationHistory>; onActivate: () => void }>) {
	const ref = React.useRef<HTMLButtonElement>(null);
	const { display, aria, titleSuffix } = useComponentShortcut({
		props: makeProps(locationHistory),
		componentKey: 'cmp1',
		shortcutKey: 'Mod+S',
		label: 'Save',
		elementRef: ref,
		onActivate,
	});
	return (
		<button ref={ref} data-display={display ?? ''} data-aria={aria ?? ''} data-title={titleSuffix ?? ''}>
			Save
		</button>
	);
}

function row(index: number): LocationHistory {
	return { location: 'Store.rows', index, pageName: 'testPage', componentKey: 'rep' };
}

beforeEach(() => {
	__setApplePlatformForTests(false);
	__resetLayersForTests();
	shortcutRegistry.__resetForTests();
	globalThis.designMode = '';
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
	__setApplePlatformForTests(undefined);
});

describe('components inside a repeater', () => {
	it('registers normally when there is no location history', () => {
		const onActivate = jest.fn();
		act(() => root.render(<Harness locationHistory={[]} onActivate={onActivate} />));

		expect(shortcutRegistry.all()).toHaveLength(1);

		act(() => {
			shortcutRegistry.dispatch(
				new KeyboardEvent('keydown', { key: 's', code: 'KeyS', ctrlKey: true } as any),
			);
		});
		expect(onActivate).toHaveBeenCalledTimes(1);
	});

	it('does not register when rendered inside a repeated row', () => {
		// A table with 100 rows would otherwise put 100 registrations on one combo,
		// which is a guaranteed conflict and no key can say which row it meant.
		const onActivate = jest.fn();
		act(() => root.render(<Harness locationHistory={[row(3)]} onActivate={onActivate} />));

		expect(shortcutRegistry.all()).toHaveLength(0);

		act(() => {
			shortcutRegistry.dispatch(
				new KeyboardEvent('keydown', { key: 's', code: 'KeyS', ctrlKey: true } as any),
			);
		});
		expect(onActivate).not.toHaveBeenCalled();
	});

	it('leaves no listener installed when every instance is repeated', () => {
		const spy = jest.spyOn(document, 'addEventListener');
		act(() => root.render(<Harness locationHistory={[row(0)]} onActivate={jest.fn()} />));
		expect(spy).not.toHaveBeenCalledWith('keydown', expect.any(Function), true);
		spy.mockRestore();
	});

	it('reports no display or aria inside a repeater, so no tooltip lies', () => {
		act(() => root.render(<Harness locationHistory={[row(0)]} onActivate={jest.fn()} />));
		const btn = container.querySelector('button')!;
		expect(btn.getAttribute('data-display')).toBe('');
		expect(btn.getAttribute('data-aria')).toBe('');
		expect(btn.getAttribute('data-title')).toBe('');
	});

	it('still reports display and aria outside a repeater', () => {
		act(() => root.render(<Harness locationHistory={[]} onActivate={jest.fn()} />));
		const btn = container.querySelector('button')!;
		expect(btn.getAttribute('data-display')).toBe('Ctrl+S');
		expect(btn.getAttribute('data-aria')).toBe('Control+S');
		expect(btn.getAttribute('data-title')).toBe(' (Ctrl+S)');
	});
});

describe('the store mirror', () => {
	it('publishes the OS-resolved key so a Text component can display it', () => {
		act(() => root.render(<Harness locationHistory={[]} onActivate={jest.fn()} />));

		const mirror = getDataFromPath(`${STORE_PATH_SHORTCUTS}.testPage.Save`, []);
		expect(mirror).toEqual({
			spec: 'Mod+S',
			display: 'Ctrl+S',
			aria: 'Control+S',
			label: 'Save',
		});
	});

	it('clears the mirror when the component unmounts', () => {
		act(() => root.render(<Harness locationHistory={[]} onActivate={jest.fn()} />));
		expect(getDataFromPath(`${STORE_PATH_SHORTCUTS}.testPage.Save`, [])).toBeDefined();

		act(() => root.render(<></>));
		expect(getDataFromPath(`${STORE_PATH_SHORTCUTS}.testPage.Save`, [])).toBeUndefined();
	});

	it('publishes nothing for a component inside a repeater', () => {
		act(() => root.render(<Harness locationHistory={[row(0)]} onActivate={jest.fn()} />));
		expect(getDataFromPath(`${STORE_PATH_SHORTCUTS}.testPage.Save`, [])).toBeUndefined();
	});
});
