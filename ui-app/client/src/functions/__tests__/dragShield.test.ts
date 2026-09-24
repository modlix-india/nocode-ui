import { onMouseDownDragStartCurry, startDragShield } from '../utils';

/**
 * A drag tracks the pointer with listeners on this document. An iframe is a
 * document of its own, so the moment the pointer is over one, no mousemove
 * arrives and the mouseup that should end the drag lands in the frame instead:
 * the drag freezes, still armed, still following the pointer once it comes back.
 *
 * The fix is a transparent element over the whole viewport for the length of the
 * drag, above every frame, so those events stay in THIS document. jsdom will not
 * do the hit testing that proves it, so what is asserted here is the contract the
 * fix rests on: the shield exists while the drag does, it is above everything,
 * and every path that ends the drag takes it away again -- a shield left behind
 * would swallow every click on the page.
 */

const shields = () => document.querySelectorAll('[data-drag-shield]');

const mouseDown = (target: HTMLElement, buttons = 1) =>
	({
		buttons,
		clientX: 100,
		clientY: 100,
		currentTarget: target,
		preventDefault: () => {},
		stopPropagation: () => {},
	}) as unknown as React.MouseEvent;

describe('startDragShield', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('covers the viewport above everything, and leaves nothing behind', () => {
		const release = startDragShield('col-resize');

		expect(shields()).toHaveLength(1);
		const shield = shields()[0] as HTMLElement;
		expect(shield.style.position).toBe('fixed');
		expect(shield.style.cursor).toBe('col-resize');
		expect(Number(shield.style.zIndex)).toBeGreaterThan(1000000);

		release();
		expect(shields()).toHaveLength(0);
	});

	it('releases once, however many times it is called', () => {
		const release = startDragShield();
		startDragShield();
		release();
		release();

		expect(shields()).toHaveLength(1);
	});

	it('does not take a cursor of its own when there is none to keep', () => {
		const release = startDragShield('auto');
		expect((shields()[0] as HTMLElement).style.cursor).toBe('');
		release();
	});
});

describe('onMouseDownDragStartCurry', () => {
	let grip: HTMLElement;

	beforeEach(() => {
		grip = document.createElement('div');
		grip.style.cursor = 'row-resize';
		document.body.appendChild(grip);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('shields the drag from mousedown to mouseup', () => {
		const onDragEnd = jest.fn();
		onMouseDownDragStartCurry(0, 0, undefined, onDragEnd)(mouseDown(grip));

		expect(shields()).toHaveLength(1);
		// The grip's cursor, kept for the whole drag: the pointer is over the
		// shield from here on, so the grip's own CSS no longer reaches it.
		expect((shields()[0] as HTMLElement).style.cursor).toBe('row-resize');

		document.body.dispatchEvent(
			new MouseEvent('mousemove', { buttons: 1, clientX: 140, clientY: 100, bubbles: true }),
		);
		expect(shields()).toHaveLength(1);

		document.body.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
		expect(onDragEnd).toHaveBeenCalledTimes(1);
		expect(onDragEnd.mock.calls[0][2]).toBe(40);
		expect(shields()).toHaveLength(0);
	});

	it('removes the shield when the drag ends without a mouseup', () => {
		// The button released where this document never saw it. The next move with
		// no button held is what tells us, and it has to clean up like an end.
		onMouseDownDragStartCurry(0, 0)(mouseDown(grip));
		document.body.dispatchEvent(new MouseEvent('mousemove', { buttons: 0, bubbles: true }));
		expect(shields()).toHaveLength(0);

		// Leaving the window is the other one.
		onMouseDownDragStartCurry(0, 0)(mouseDown(grip));
		document.body.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
		expect(shields()).toHaveLength(0);
	});

	it('shields nothing when the drag never starts', () => {
		onMouseDownDragStartCurry(0, 0)(mouseDown(grip, 2));
		expect(shields()).toHaveLength(0);
	});
});
