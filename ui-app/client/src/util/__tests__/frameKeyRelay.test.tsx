/**
 * Escape typed inside an iframe must reach `document.body` of the page holding the
 * frame, which is where Popup listens for it.
 */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot, Root } from 'react-dom/client';
import { useFrameKeyRelay } from '../frameKeyRelay';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function Host({ onFrame }: { onFrame: (f: HTMLIFrameElement) => void }) {
	const [el, setEl] = React.useState<HTMLIFrameElement | null>(null);
	useFrameKeyRelay(el);
	return (
		<iframe
			ref={f => {
				setEl(f);
				if (f) onFrame(f);
			}}
		/>
	);
}

describe('useFrameKeyRelay', () => {
	let container: HTMLDivElement;
	let root: Root;
	let frame: HTMLIFrameElement;
	let seen: string[];
	const onBodyKey = (e: KeyboardEvent) => seen.push(`${e.type}:${e.key}`);

	beforeEach(() => {
		seen = [];
		container = document.createElement('div');
		document.body.appendChild(container);
		document.body.addEventListener('keyup', onBodyKey);
		root = createRoot(container);
		act(() => root.render(<Host onFrame={f => (frame = f)} />));
	});

	afterEach(() => {
		act(() => root.unmount());
		document.body.removeEventListener('keyup', onBodyKey);
		container.remove();
	});

	it('re-fires Escape from a same-origin frame document on the holding page', () => {
		frame.contentDocument!.dispatchEvent(
			new KeyboardEvent('keyup', { key: 'Escape', bubbles: true }),
		);
		expect(seen).toEqual(['keyup:Escape']);
	});

	it('does not re-fire other keys, or an Escape the frame already used', () => {
		const doc = frame.contentDocument!;
		doc.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', bubbles: true }));
		const used = new KeyboardEvent('keyup', { key: 'Escape', bubbles: true, cancelable: true });
		used.preventDefault();
		doc.dispatchEvent(used);
		expect(seen).toEqual([]);
	});

	it('re-fires Escape forwarded by a framed app, only from its own frame', () => {
		const data = { type: 'MLX_FRAME_KEY', eventType: 'keyup', key: 'Escape', code: 'Escape' };
		window.dispatchEvent(new MessageEvent('message', { data, source: window }));
		expect(seen).toEqual([]);

		window.dispatchEvent(
			new MessageEvent('message', { data, source: frame.contentWindow as Window }),
		);
		expect(seen).toEqual(['keyup:Escape']);
	});
});
