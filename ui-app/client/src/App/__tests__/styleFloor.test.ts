/**
 * Which component styles reach the document.
 *
 * The rule that matters is monotonicity. A page does not know up front what it
 * will render: a shell, a SubPage whose `pageName` is an expression and whose
 * `appCode` may point at another application, or a repeater fed by a fetch all
 * decide at runtime. So the set only ever grows -- anything that could remove
 * a name would un-style something already on screen.
 */
import { ALWAYS_STYLED, hasNewNames, styledComponents } from '../styleFloor';

describe('styledComponents', () => {
	it('starts from the floor even with nothing rendered', () => {
		const s = styledComponents([]);
		for (const n of ALWAYS_STYLED) expect(s.has(n)).toBe(true);
	});

	it('adds what has rendered', () => {
		const s = styledComponents(['Tree', 'Carousel']);
		expect(s.has('Tree')).toBe(true);
		expect(s.has('Carousel')).toBe(true);
	});

	it('never drops a name that was there before', () => {
		// A SubPage arriving after first paint must be able to ADD without
		// anything already on screen losing its styling.
		const first = styledComponents(['Tree']);
		const second = styledComponents(['Carousel'], first);
		expect(second.has('Tree')).toBe(true);
		expect(second.has('Carousel')).toBe(true);
	});

	it('keeps the floor even if a caller passes a set without it', () => {
		const s = styledComponents([], new Set(['Tree']));
		expect(s.has('Grid')).toBe(true);
		expect(s.has('Tree')).toBe(true);
	});

	it('does not mutate the set it was given', () => {
		const prev = styledComponents(['Tree']);
		const size = prev.size;
		styledComponents(['Carousel'], prev);
		expect(prev.size).toBe(size);
		expect(prev.has('Carousel')).toBe(false);
	});

	it('ignores empty names', () => {
		expect(styledComponents(['', 'Tree']).has('')).toBe(false);
	});

	it('carries the components a page is framed with, so a miss is never bare', () => {
		// Losing one component's styling looks wrong; losing the page's frame
		// and typography looks broken.
		for (const n of ['Grid', 'Text', 'Button', 'Image', 'Page', 'SubPage'])
			expect(ALWAYS_STYLED.has(n)).toBe(true);
	});
});

describe('hasNewNames', () => {
	it('is false when nothing was added, so no re-render is committed', () => {
		const a = styledComponents(['Tree']);
		expect(hasNewNames(a, styledComponents(['Tree'], a))).toBe(false);
	});

	it('is true when something was added', () => {
		const a = styledComponents(['Tree']);
		expect(hasNewNames(a, styledComponents(['Carousel'], a))).toBe(true);
	});

	it('is true on a size change even if it cannot see which name differs', () => {
		expect(hasNewNames(new Set(['a']), new Set(['a', 'b']))).toBe(true);
		expect(hasNewNames(new Set(['a', 'b']), new Set(['a']))).toBe(true);
	});
});
