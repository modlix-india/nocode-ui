import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { MarkdownParser } from '../MarkdownParser';

const html = (text: string) =>
	renderToStaticMarkup(
		<MemoryRouter>
			<MarkdownParser componentKey="k" text={text} styles={{}} />
		</MemoryRouter>,
	);

describe('mentions in markdown', () => {
	test('a stored mention renders as a chip, not a link', () => {
		const out = html("Can [@Jon O'Brien](mde://user/236) check this?");
		expect(out).toContain('class="_mention mde-mention mde-mention-user"');
		expect(out).toContain('data-mention-id="236"');
		expect(out).toContain('@Jon O&#x27;Brien');
		expect(out).not.toContain('mde://');
	});

	test('ordinary links stay links', () => {
		expect(html('See [the docs](https://modlix.com/docs)')).toContain('href="https://modlix.com/docs"');
	});
});
