/**
 * Pictures in a markdown text open large when the text asks for it (LZ-847, pictures in comments).
 * REAL: MarkdownParser, ImageLightbox. The page store is not touched: plain https pictures.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { MarkdownParser } from '../MarkdownParser';
import { closeImageLightbox } from '../../../components/util/ImageLightbox';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const TEXT = 'Two shots\n\n![first](https://x.test/a.png)\n\n![second](https://x.test/b.png)';

let container: HTMLDivElement;
let root: Root;

function mount(props: { imageLightbox?: boolean; editable?: boolean } = {}) {
	act(() => {
		root.render(
			<MemoryRouter>
				<MarkdownParser componentKey="k" text={TEXT} styles={{}} {...props} />
			</MemoryRouter>,
		);
	});
}

const dialog = () => document.body.querySelector('[role="dialog"]');
const pictures = () => Array.from(container.querySelectorAll<HTMLImageElement>('img._images'));

beforeEach(() => {
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => closeImageLightbox());
	act(() => root.unmount());
	container.remove();
	document.getElementById('image-lightbox-cursor')?.remove();
});

describe('image lightbox in markdown', () => {
	test('a click on a picture opens it large, with the clicked one first', () => {
		mount({ imageLightbox: true });
		act(() => pictures()[1].click());
		expect(dialog()).not.toBeNull();
		expect(dialog()!.querySelector('img')!.getAttribute('src')).toBe('https://x.test/b.png');
		expect(dialog()!.textContent).toContain('2 / 2');
		expect(document.getElementById('image-lightbox-cursor')).not.toBeNull();
	});

	test('the arrow buttons page through every picture of the text', () => {
		mount({ imageLightbox: true });
		act(() => pictures()[0].click());
		const next = dialog()!.querySelector<HTMLButtonElement>('[aria-label="Next picture"]')!;
		act(() => next.click());
		expect(dialog()!.querySelector('img')!.getAttribute('src')).toBe('https://x.test/b.png');
		act(() => next.click());
		expect(dialog()!.querySelector('img')!.getAttribute('src')).toBe('https://x.test/a.png');
	});

	test('Escape, the close button and a click outside the picture close it', () => {
		mount({ imageLightbox: true });
		act(() => pictures()[0].click());
		act(() => {
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		});
		expect(dialog()).toBeNull();

		act(() => pictures()[0].click());
		act(() => dialog()!.querySelector<HTMLButtonElement>('[aria-label="Close"]')!.click());
		expect(dialog()).toBeNull();

		act(() => pictures()[0].click());
		act(() => (dialog() as HTMLElement).click());
		expect(dialog()).toBeNull();
	});

	test('a click on the large picture itself keeps it open', () => {
		mount({ imageLightbox: true });
		act(() => pictures()[0].click());
		act(() => dialog()!.querySelector('img')!.click());
		expect(dialog()).not.toBeNull();
	});

	test('off by default, and never while editing', () => {
		mount();
		act(() => pictures()[0].click());
		expect(dialog()).toBeNull();
		mount({ imageLightbox: true, editable: true });
		act(() => pictures()[0].click());
		expect(dialog()).toBeNull();
	});
});
