import { popPosition } from '../ui/portal';
import { reportCss } from '../reportStyle';

describe('popPosition', () => {
	it('opens under the anchor when there is room', () => {
		const p = popPosition({ top: 100, bottom: 130, left: 200, right: 230 }, 'right', 390, 844);
		expect(p.top).toBe(134);
		expect(p.bottom).toBeUndefined();
		expect(p.right).toBe(160);
	});

	it('opens above a button near the bottom with its bottom edge on the button (ADZ-2173)', () => {
		// A button 28px tall at the foot of a 844px phone window: not enough room below.
		const p = popPosition({ top: 816, bottom: 844, left: 340, right: 369 }, 'right', 390, 844);
		expect(p.top).toBeUndefined();
		// bottom edge = viewport height - (button top - gap): the menu hugs the button however short it is
		expect(p.bottom).toBe(844 - 816 + 4);
		expect(p.maxHeight).toBeLessThanOrEqual(520);
	});

	it('keeps the upward menu inside the window', () => {
		const p = popPosition({ top: 300, bottom: 328, left: 10, right: 40 }, 'left', 390, 340);
		expect(p.bottom).toBeGreaterThanOrEqual(8);
		expect(340 - (p.bottom as number) - p.maxHeight).toBeGreaterThanOrEqual(0);
	});
});

describe('report library card preview (ADZ-2176)', () => {
	it('lets the table and list inside the preview take the pointer so they scroll', () => {
		const css = reportCss('.x');
		expect(css).toMatch(
			/\._rpCardMini \._rpTableWrap, \.x \._rpCardMini \._rpList \{ pointer-events: auto;/,
		);
	});
});
