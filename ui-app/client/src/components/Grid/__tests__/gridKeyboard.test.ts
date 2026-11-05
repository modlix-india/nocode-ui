import { gridKeyboardProps } from '../gridKeyboard';

describe('gridKeyboardProps', () => {
	const key = (k: string, own = true) => {
		const target = {};
		return {
			key: k,
			target,
			currentTarget: own ? target : {},
			preventDefault: jest.fn(),
		} as any;
	};

	it('adds nothing by default', () => {
		expect(gridKeyboardProps(false, () => {}, undefined, undefined)).toEqual({});
		expect(gridKeyboardProps(undefined, () => {}, undefined, true)).toEqual({});
	});

	it('names the grid without making it a button', () => {
		expect(gridKeyboardProps(false, undefined, 'Meta lead form', undefined)).toEqual({
			'aria-label': 'Meta lead form',
		});
	});

	it('does nothing to a grid without a click handler', () => {
		expect(gridKeyboardProps(true, undefined, undefined, undefined)).toEqual({});
	});

	it('makes a clickable grid a focusable button that Enter and Space press', () => {
		const click = jest.fn();
		const p = gridKeyboardProps(true, click, 'Setup', false);
		expect(p.role).toBe('button');
		expect(p.tabIndex).toBe(0);
		expect(p['aria-label']).toBe('Setup');
		expect(p['aria-pressed']).toBe(false);
		const enter = key('Enter');
		p.onKeyDown(enter);
		p.onKeyDown(key(' '));
		p.onKeyDown(key('a'));
		expect(click).toHaveBeenCalledTimes(2);
		expect(enter.preventDefault).toHaveBeenCalled();
	});

	it('leaves key presses from a field inside the grid alone', () => {
		const click = jest.fn();
		gridKeyboardProps(true, click, undefined, undefined).onKeyDown(key('Enter', false));
		expect(click).not.toHaveBeenCalled();
	});
});
