/**
 * The shared drag rules behind Grid's dragToMove (CXZ-1742): a press under the
 * threshold is a tap, a drag follows the pointer inside the window, positions are
 * distances from the right and bottom edges.
 */
import {
	clamp,
	clampOffsets,
	DRAG_THRESHOLD,
	isEdgeOffsets,
	startPointerDrag,
} from '../usePointerDrag';

const VIEWPORT = { width: 1000, height: 800 };
const viewport = () => VIEWPORT;

// A 48 px button parked 24 px from the right and bottom edges.
function button(): HTMLElement {
	const el = document.createElement('button');
	el.getBoundingClientRect = () =>
		({
			left: 1000 - 24 - 48,
			top: 800 - 24 - 48,
			width: 48,
			height: 48,
			right: 1000 - 24,
			bottom: 800 - 24,
		}) as DOMRect;
	document.body.appendChild(el);
	return el;
}

const pointer = (el: HTMLElement, type: string, clientX: number, clientY: number) =>
	el.dispatchEvent(new MouseEvent(type, { clientX, clientY }));

const START = { button: 0, clientX: 950, clientY: 750 };

describe('clamp', () => {
	it('keeps a value inside the range', () => {
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(-3, 0, 10)).toBe(0);
		expect(clamp(30, 0, 10)).toBe(10);
	});

	it('hugs the low edge when the range is empty (a window narrower than the element)', () => {
		expect(clamp(50, 8, 2)).toBe(8);
	});
});

describe('clampOffsets', () => {
	it('keeps an element the inset inside every edge', () => {
		const size = { width: 48, height: 48 };
		expect(clampOffsets({ right: -40, bottom: 2000 }, size, 8, VIEWPORT)).toEqual({
			right: 8,
			bottom: 800 - 48 - 8,
		});
		expect(clampOffsets({ right: 100, bottom: 100 }, size, 8, VIEWPORT)).toEqual({
			right: 100,
			bottom: 100,
		});
	});

	it('brings a position saved on a wide screen back inside a phone', () => {
		const size = { width: 48, height: 48 };
		expect(
			clampOffsets({ right: 1300, bottom: 40 }, size, 4, { width: 390, height: 844 }),
		).toEqual({ right: 390 - 48 - 4, bottom: 40 });
	});
});

describe('isEdgeOffsets', () => {
	it('accepts numbers only', () => {
		expect(isEdgeOffsets({ right: 1, bottom: 2 })).toBe(true);
		expect(isEdgeOffsets({ right: '1', bottom: 2 })).toBe(false);
		expect(isEdgeOffsets({ right: NaN, bottom: 2 })).toBe(false);
		expect(isEdgeOffsets(undefined)).toBe(false);
		expect(isEdgeOffsets('x')).toBe(false);
	});
});

describe('startPointerDrag', () => {
	it('treats a press that moves less than the threshold as a click', () => {
		const el = button();
		const onMove = jest.fn();
		const onEnd = jest.fn();
		const dragged = startPointerDrag(el, START, { inset: 4, onMove, onEnd, viewport });

		pointer(el, 'pointermove', START.clientX + DRAG_THRESHOLD - 3, START.clientY + 1);
		pointer(el, 'pointerup', START.clientX + 2, START.clientY + 1);

		expect(onMove).not.toHaveBeenCalled();
		expect(onEnd).not.toHaveBeenCalled();
		expect(dragged()).toBe(false);
	});

	it('follows the pointer and reports the release as distances from the right and bottom', () => {
		const el = button();
		const onMove = jest.fn();
		const onEnd = jest.fn();
		const dragged = startPointerDrag(el, START, { inset: 4, onMove, onEnd, viewport });

		pointer(el, 'pointermove', START.clientX - 100, START.clientY - 200);
		expect(onMove).toHaveBeenLastCalledWith({ right: 124, bottom: 224 });
		pointer(el, 'pointerup', START.clientX - 100, START.clientY - 200);

		expect(onEnd).toHaveBeenCalledTimes(1);
		expect(onEnd).toHaveBeenCalledWith({ right: 124, bottom: 224 });
		expect(dragged()).toBe(true);
	});

	it('keeps the element inside the window by the inset', () => {
		const el = button();
		const onEnd = jest.fn();
		startPointerDrag(el, START, { inset: 16, onMove: jest.fn(), onEnd, viewport });

		// Far past the top left corner.
		pointer(el, 'pointermove', -5000, -5000);
		pointer(el, 'pointerup', -5000, -5000);
		expect(onEnd).toHaveBeenCalledWith({ right: 1000 - 16 - 48, bottom: 800 - 16 - 48 });
	});

	it('calls onStart once, when the press crosses the threshold', () => {
		const el = button();
		const onStart = jest.fn();
		startPointerDrag(el, START, {
			inset: 4,
			onStart,
			onMove: jest.fn(),
			onEnd: jest.fn(),
			viewport,
		});
		pointer(el, 'pointermove', START.clientX + 2, START.clientY);
		expect(onStart).not.toHaveBeenCalled();
		pointer(el, 'pointermove', START.clientX - 40, START.clientY);
		pointer(el, 'pointermove', START.clientX - 80, START.clientY);
		pointer(el, 'pointerup', START.clientX - 80, START.clientY);
		expect(onStart).toHaveBeenCalledTimes(1);
	});

	it('ignores a second finger', () => {
		const el = button();
		const onMove = jest.fn();
		startPointerDrag(
			el,
			{ ...START, isPrimary: false },
			{ inset: 4, onMove, onEnd: jest.fn(), viewport },
		);
		pointer(el, 'pointermove', START.clientX - 300, START.clientY);
		expect(onMove).not.toHaveBeenCalled();
	});

	it('stops listening after the release', () => {
		const el = button();
		const onMove = jest.fn();
		startPointerDrag(el, START, { inset: 4, onMove, onEnd: jest.fn(), viewport });
		pointer(el, 'pointerup', START.clientX, START.clientY);
		pointer(el, 'pointermove', START.clientX - 300, START.clientY);
		expect(onMove).not.toHaveBeenCalled();
	});

	it('ends a drag on pointercancel too', () => {
		const el = button();
		const onEnd = jest.fn();
		startPointerDrag(el, START, { inset: 4, onMove: jest.fn(), onEnd, viewport });
		pointer(el, 'pointermove', START.clientX - 50, START.clientY);
		pointer(el, 'pointercancel', START.clientX - 50, START.clientY);
		expect(onEnd).toHaveBeenCalledWith({ right: 74, bottom: 24 });
	});

	it('ignores a press that is not the main button', () => {
		const el = button();
		const onMove = jest.fn();
		startPointerDrag(
			el,
			{ ...START, button: 2 },
			{ inset: 4, onMove, onEnd: jest.fn(), viewport },
		);
		pointer(el, 'pointermove', START.clientX - 300, START.clientY);
		expect(onMove).not.toHaveBeenCalled();
	});
});
