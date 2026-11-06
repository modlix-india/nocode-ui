import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import CommonCheckbox from '../CommonCheckbox';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../components/HelperComponents/SubHelperComponent', () => ({
	SubHelperComponent: () => null,
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

function box(): HTMLElement {
	const el = container.querySelector<HTMLElement>('[role=checkbox]');
	if (!el) throw new Error('no checkbox rendered');
	return el;
}

describe('CommonCheckbox accessible name (opt-in)', () => {
	it('keeps the old attributes when no ariaLabel is given', () => {
		act(() => root.render(<CommonCheckbox isChecked={true} id="cb" />));
		expect(box().hasAttribute('aria-label')).toBe(false);
		expect(box().hasAttribute('aria-checked')).toBe(false);
		expect(box().getAttribute('tabindex')).toBe('0');
	});

	it('names the box and reports its state with ariaLabel', () => {
		act(() =>
			root.render(<CommonCheckbox isChecked={false} id="cb" ariaLabel="Use housing" />),
		);
		expect(box().getAttribute('aria-label')).toBe('Use housing');
		expect(box().getAttribute('aria-checked')).toBe('false');
		expect(box().hasAttribute('aria-disabled')).toBe(false);

		act(() =>
			root.render(
				<CommonCheckbox
					isChecked={true}
					id="cb"
					ariaLabel="Use housing"
					isReadOnly={true}
				/>,
			),
		);
		expect(box().getAttribute('aria-checked')).toBe('true');
		expect(box().getAttribute('aria-disabled')).toBe('true');
	});
});
