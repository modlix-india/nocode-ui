import { consumeEscape } from '../blockEditor/features/escape-guard';
import {
	caretPopoverPlacement,
	fixedContainingBlockBox,
	fixedContainingBlockOffset,
	followAnchor,
	placeInViewport,
	toFixedCoords,
} from '../blockEditor/features/fixed-position';

// The block options menu and the format toolbar are `position: fixed` and are
// handed viewport coordinates. Inside LoopZump's item popup the blurred,
// scrolling backdrop is the containing block for `fixed`, so the menu has to be
// shifted by that block's offset or it opens at the top of the ticket.

const VIEWPORT = { width: 1440, height: 640 };
const MENU = { width: 200, height: 270 };

describe('placeInViewport', () => {
	test('opens at the anchor when it fits', () => {
		expect(placeInViewport({ x: 635, y: 200 }, MENU, VIEWPORT)).toEqual({ x: 635, y: 200 });
	});

	test('flips above the anchor near the bottom of the screen', () => {
		expect(placeInViewport({ x: 635, y: 500 }, MENU, VIEWPORT)).toEqual({ x: 635, y: 222 });
	});

	test('pinned inside the screen when it fits neither below nor above', () => {
		const tall = { width: 200, height: 600 };
		expect(placeInViewport({ x: 635, y: 300 }, tall, VIEWPORT)).toEqual({ x: 635, y: 32 });
	});

	test('pulled back from the right and left edges', () => {
		expect(placeInViewport({ x: 1400, y: 100 }, MENU, VIEWPORT).x).toBe(1440 - 200 - 8);
		expect(placeInViewport({ x: -20, y: 100 }, MENU, VIEWPORT).x).toBe(8);
	});
});

describe('fixed coordinates inside a scrolled popup', () => {
	test('a backdrop scrolled by 251px moves the menu down by 251px in its own coordinates', () => {
		// The reported case: the grip is at y=368 on screen, the popup backdrop
		// (the containing block) is scrolled by 251, so its (0,0) is at y=-251.
		const viewportPos = placeInViewport({ x: 635, y: 368 }, MENU, VIEWPORT);
		const css = toFixedCoords(viewportPos, { x: 0, y: -251 });
		// On screen it lands at css.y + offset.y, which is the intended spot.
		expect(css.y - 251).toBe(viewportPos.y);
		expect(css).toEqual({ x: 635, y: viewportPos.y + 251 });
	});

	test('no containing-block offset leaves the coordinates as they are', () => {
		expect(toFixedCoords({ x: 10, y: 20 }, { x: 0, y: 0 })).toEqual({ x: 10, y: 20 });
	});

	test('fixedContainingBlockOffset measures a probe and removes it', () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		const spy = jest
			.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
			.mockReturnValue({ left: 12, top: -251 } as DOMRect);
		expect(fixedContainingBlockOffset(host)).toEqual({ x: 12, y: -251 });
		expect(host.childNodes.length).toBe(0);
		spy.mockRestore();
		expect(fixedContainingBlockOffset(null)).toEqual({ x: 0, y: 0 });
	});
});

describe('followAnchor', () => {
	test('the menu moves with its block when the editor scrolls', () => {
		expect(followAnchor({ x: 635, y: 368 }, { x: 600, y: 350 }, { x: 600, y: 250 })).toEqual({
			x: 635,
			y: 268,
		});
	});
});

describe('caret popovers (slash menu, mention picker, emoji picker)', () => {
	const viewportBox = { x: 0, y: 0, right: 1440, bottom: 640 };
	// The popup backdrop scrolled by 251px: its box starts 251px above the
	// screen and, being 640px tall, ends at 389.
	const scrolledBox = { x: 0, y: -251, right: 1440, bottom: 389 };

	test('below the caret on a plain page, unchanged from before', () => {
		expect(caretPopoverPlacement({ x: 300, y: 100 }, 340, viewportBox, 640)).toEqual({
			left: 300,
			top: 100,
		});
	});

	test('flipped up on a plain page keeps the old bottom value', () => {
		expect(caretPopoverPlacement({ x: 300, y: 500 }, 340, viewportBox, 640)).toEqual({
			left: 300,
			bottom: 640 - 500 + 8,
		});
	});

	test('inside a scrolled popup: top is shifted by the scroll', () => {
		const style = caretPopoverPlacement({ x: 300, y: 100 }, 340, scrolledBox, 640);
		expect(style.top! + scrolledBox.y).toBe(100);
	});

	test('inside a scrolled popup: the flipped bottom edge still sits 8px above the caret', () => {
		const style = caretPopoverPlacement({ x: 300, y: 500 }, 340, scrolledBox, 640);
		// On screen the bottom edge is at box.bottom - bottom.
		expect(scrolledBox.bottom - style.bottom!).toBe(492);
	});

	test('fixedContainingBlockBox falls back to the viewport without a host', () => {
		expect(fixedContainingBlockBox(null)).toEqual({
			x: 0,
			y: 0,
			right: window.innerWidth,
			bottom: window.innerHeight,
		});
	});
});

describe('Escape in an editor menu does not reach the popup around the editor', () => {
	test('the matching keyup is swallowed once, the next one gets through', () => {
		const popupClose = jest.fn();
		const onBodyKeyUp = (e: KeyboardEvent) => {
			if (e.key === 'Escape') popupClose();
		};
		document.body.addEventListener('keyup', onBodyKeyUp);

		const keydown = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
		const keydownBubbled = jest.fn();
		document.body.addEventListener('keydown', keydownBubbled);
		document.addEventListener(
			'keydown',
			e => {
				consumeEscape(e);
			},
			{ capture: true, once: true },
		);
		document.body.dispatchEvent(keydown);
		expect(keydown.defaultPrevented).toBe(true);
		expect(keydownBubbled).not.toHaveBeenCalled();

		document.body.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', bubbles: true }));
		expect(popupClose).not.toHaveBeenCalled();

		document.body.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', bubbles: true }));
		expect(popupClose).toHaveBeenCalledTimes(1);

		document.body.removeEventListener('keyup', onBodyKeyUp);
		document.body.removeEventListener('keydown', keydownBubbled);
	});

	test('other keys are not swallowed, and the guard gives up after the timeout', () => {
		jest.useFakeTimers();
		const seen = jest.fn();
		const onBodyKeyUp = (e: KeyboardEvent) => seen(e.key);
		document.body.addEventListener('keyup', onBodyKeyUp);
		consumeEscape();
		document.body.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', bubbles: true }));
		jest.advanceTimersByTime(2500);
		document.body.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', bubbles: true }));
		expect(seen.mock.calls).toEqual([['a'], ['Escape']]);
		document.body.removeEventListener('keyup', onBodyKeyUp);
		jest.useRealTimers();
	});
});
