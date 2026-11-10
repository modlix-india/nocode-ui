import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import CommonInputText from '../CommonInputText';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../components/HelperComponents/SubHelperComponent', () => ({
	SubHelperComponent: () => null,
}));
jest.mock('../../components/HelperComponents/HelperComponent', () => ({
	HelperComponent: () => null,
}));

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

const base = {
	id: 'field',
	readOnly: false,
	value: 'Fincity',
	translations: {},
	context: { pageName: 'testpage' } as any,
	definition: { key: 'field', name: 'field', type: 'TextBox' } as any,
	designType: '_default',
	colorScheme: '_primary',
	cssPrefix: 'comp compTextBox',
};

function input(): HTMLInputElement {
	const el = container.querySelector<HTMLInputElement>('input');
	if (!el) throw new Error('no input rendered');
	return el;
}

const ROLE_ATTRS = [
	'role',
	'aria-expanded',
	'aria-controls',
	'aria-haspopup',
	'aria-activedescendant',
];

describe('CommonInputText role ARIA (opt-in)', () => {
	it('adds none of the role attributes by default', () => {
		act(() => root.render(<CommonInputText {...base} />));
		ROLE_ATTRS.forEach(a => expect(input().hasAttribute(a)).toBe(false));
	});

	it('passes the combobox attributes through to the input', () => {
		act(() =>
			root.render(
				<CommonInputText
					{...base}
					ariaRole="combobox"
					ariaHasPopup="listbox"
					ariaExpanded={true}
					ariaControls="list1"
					ariaActiveDescendant="list1_0"
				/>,
			),
		);
		expect(input().getAttribute('role')).toBe('combobox');
		expect(input().getAttribute('aria-haspopup')).toBe('listbox');
		expect(input().getAttribute('aria-expanded')).toBe('true');
		expect(input().getAttribute('aria-controls')).toBe('list1');
		expect(input().getAttribute('aria-activedescendant')).toBe('list1_0');
	});

	it('renders a collapsed state as aria-expanded false, not as a missing attribute', () => {
		act(() =>
			root.render(<CommonInputText {...base} ariaRole="combobox" ariaExpanded={false} />),
		);
		expect(input().getAttribute('aria-expanded')).toBe('false');
	});
});
