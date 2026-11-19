import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CompareTabs from '../CompareTabs';

const sections = [{ label: 'Body (en)', before: '<p>a</p>', after: '<p>b</p>' }];
const props = { sections, before: {}, after: {}, data: {}, headers: {} };

describe('CompareTabs', () => {
	it('shows only the code lines for a template that is not a PDF', () => {
		const html = renderToStaticMarkup(<CompareTabs isPdf={false} {...props} />);
		expect(html).toContain('lines changed');
		expect(html).not.toContain('PDF side by side');
	});
	it('offers the PDF views and the code lines for a PDF template', () => {
		const html = renderToStaticMarkup(<CompareTabs isPdf {...props} />);
		expect(html).toContain('PDF side by side');
		expect(html).toContain('Differences');
		expect(html).toContain('Code lines');
	});
});
