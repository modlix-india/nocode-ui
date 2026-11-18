import { tabKeyTarget } from '../tabsKeys';

describe('tabKeyTarget', () => {
	const all = [0, 1, 2];

	it('moves right and left and wraps at the ends', () => {
		expect(tabKeyTarget('ArrowRight', 0, all, false)).toBe(1);
		expect(tabKeyTarget('ArrowRight', 2, all, false)).toBe(0);
		expect(tabKeyTarget('ArrowLeft', 1, all, false)).toBe(0);
		expect(tabKeyTarget('ArrowLeft', 0, all, false)).toBe(2);
	});

	it('jumps to the ends with Home and End', () => {
		expect(tabKeyTarget('Home', 2, all, false)).toBe(0);
		expect(tabKeyTarget('End', 0, all, false)).toBe(2);
	});

	it('uses Up and Down only when the tabs are vertical', () => {
		expect(tabKeyTarget('ArrowDown', 0, all, false)).toBe(-1);
		expect(tabKeyTarget('ArrowUp', 0, all, false)).toBe(-1);
		expect(tabKeyTarget('ArrowDown', 0, all, true)).toBe(1);
		expect(tabKeyTarget('ArrowUp', 0, all, true)).toBe(2);
	});

	it('skips positions that hold no tab', () => {
		expect(tabKeyTarget('ArrowRight', 0, [0, 2], false)).toBe(2);
		expect(tabKeyTarget('ArrowLeft', 0, [0, 2], false)).toBe(2);
		expect(tabKeyTarget('End', 0, [0, 2], false)).toBe(2);
	});

	it('answers -1 for other keys and for an empty list', () => {
		expect(tabKeyTarget('a', 0, all, false)).toBe(-1);
		expect(tabKeyTarget('Tab', 0, all, false)).toBe(-1);
		expect(tabKeyTarget('ArrowRight', 0, [], false)).toBe(-1);
	});

	it('stays on the only tab', () => {
		expect(tabKeyTarget('ArrowRight', 0, [0], false)).toBe(0);
		expect(tabKeyTarget('ArrowLeft', 0, [0], false)).toBe(0);
	});
});
