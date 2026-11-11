/**
 * Popup drawer CSS: the rules only target `._drawer`, so a popup without the property is
 * styled exactly as before. REAL: PopupStyles and the style processor.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PopupStyles from '../PopupStyles';

describe('PopupStyles drawer rules', () => {
	const css = renderToStaticMarkup(<PopupStyles theme={new Map()} />);

	it('makes a drawer full height and flush to its edge', () => {
		expect(css).toContain('._drawer.backdrop { align-items: stretch; padding: 0;');
		expect(css).toMatch(/\._drawer\.backdrop > \.modal \{[^}]*height: 100%;/);
		expect(css).toMatch(
			/\._drawer\._right_top\.backdrop > \.modal[^{]*\{[^}]*border-top-right-radius: 0;/,
		);
	});

	it('slides in from the named side and stops for reduced motion', () => {
		expect(css).toContain('@keyframes popupDrawerFromRight');
		expect(css).toContain('@keyframes popupDrawerFromLeft');
		expect(css).toMatch(
			/prefers-reduced-motion: reduce\)[^@]*_drawer\.backdrop > \.modal \{ animation: none; \}/,
		);
	});

	it('leaves the non drawer rules untouched', () => {
		expect(css).toContain(
			'._right_top.backdrop { align-items: flex-start; justify-content: flex-end; }',
		);
		// every rule that sets the drawer's full height is scoped to ._drawer
		const rules = css.split('}').filter(r => r.includes('height: 100%'));
		expect(rules.length).toBeGreaterThan(0);
		rules.forEach(r => expect(r.substring(0, r.indexOf('{'))).toContain('._drawer'));
	});
});

describe('PopupStyles drawer closing rules', () => {
	const css = renderToStaticMarkup(<PopupStyles theme={new Map()} />);

	it('slides a closing drawer out the way it came and lets clicks through', () => {
		expect(css).toContain('._drawer._closing.backdrop { pointer-events: none; }');
		expect(css).toContain('@keyframes popupDrawerToRight');
		expect(css).toContain('@keyframes popupDrawerToLeft');
		expect(css).toMatch(
			/\._drawer\._closing\._right_top\.backdrop > \.modal[^{]*\{ animation-name: popupDrawerToRight; \}/,
		);
	});
});
