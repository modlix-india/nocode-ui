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

describe('popPosition with the measured menu height (ADZ-2178)', () => {
	// 1440x765 window, a card foot button at y 532..560: 193px of room below, 520px above.
	const btn = { top: 532, bottom: 560, left: 1100, right: 1130 };

	it('flipped up a 130px menu that fits below when it assumed a 220px need', () => {
		const unmeasured = popPosition(btn, 'right', 1440, 765);
		expect(unmeasured.bottom).toBeDefined();
		const p = popPosition(btn, 'right', 1440, 765, 130);
		expect(p.top).toBe(564);
		expect(p.bottom).toBeUndefined();
		expect(p.right).toBe(310);
	});

	it('opens up only when the menu does not fit below and there is more room above', () => {
		const p = popPosition(btn, 'right', 1440, 765, 260);
		expect(p.top).toBeUndefined();
		expect(p.bottom).toBe(765 - 532 + 4);
	});

	it('stays under the button when neither side fits but below is larger', () => {
		const p = popPosition({ top: 20, bottom: 48, left: 10, right: 40 }, 'left', 390, 300, 400);
		expect(p.top).toBe(52);
		expect(p.maxHeight).toBeGreaterThanOrEqual(120);
	});

	it('fits exactly: opens under at the boundary, up one pixel past it', () => {
		const below = 765 - 560 - 4 - 8; // 193
		expect(popPosition(btn, 'right', 1440, 765, below).top).toBe(564);
		expect(popPosition(btn, 'right', 1440, 765, below + 1).bottom).toBeDefined();
	});

	it('never lets a tall menu take more than 520px', () => {
		const p = popPosition({ top: 100, bottom: 128, left: 10, right: 40 }, 'left', 1440, 1200, 900);
		expect(p.top).toBe(132);
		expect(p.maxHeight).toBe(520);
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
