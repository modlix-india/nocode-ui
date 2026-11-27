import { whatsAppToMarkdown } from '../whatsAppFormat';

describe('whatsAppToMarkdown', () => {
	it('turns WhatsApp bold, italic and strikethrough into the markdown the Text component renders', () => {
		expect(whatsAppToMarkdown('*Connected. Quiet. Convenient.*')).toBe(
			'**Connected. Quiet. Convenient.**',
		);
		expect(whatsAppToMarkdown('_italic_')).toBe('*italic*');
		expect(whatsAppToMarkdown('~gone~')).toBe('~~gone~~');
	});

	it('formats marks inside a sentence and several in one line', () => {
		expect(whatsAppToMarkdown('Hi *Ravi*, your _visit_ is ~cancelled~ *confirmed*.')).toBe(
			'Hi **Ravi**, your *visit* is ~~cancelled~~ **confirmed**.',
		);
	});

	it('keeps a mark that only opens or has spaces next to it, as plain text', () => {
		expect(whatsAppToMarkdown('2 * 3 * 4')).toBe('2 \\* 3 \\* 4');
		expect(whatsAppToMarkdown('a * b*')).toBe('a \\* b\\*');
		expect(whatsAppToMarkdown('only *one star')).toBe('only \\*one star');
	});

	it('does not format marks inside a word (snake_case stays as typed)', () => {
		expect(whatsAppToMarkdown('site_visit_reminder')).toBe('site\\_visit\\_reminder');
		expect(whatsAppToMarkdown('a~b~c')).toBe('a\\~b\\~c');
	});

	it('formats text with an emoji in front, as in a real template', () => {
		expect(whatsAppToMarkdown('✨ *Connected. Quiet. Convenient.*')).toBe(
			'✨ **Connected. Quiet. Convenient.**',
		);
	});

	it('turns triple backticks into a code span and does not format inside it', () => {
		expect(whatsAppToMarkdown('```code *x*```')).toBe('`code *x*`');
		expect(whatsAppToMarkdown('use `*raw*` and *bold*')).toBe('use `*raw*` and **bold**');
	});

	it('handles several lines', () => {
		expect(whatsAppToMarkdown('*Title*\nline two\n_end_')).toBe('**Title**\nline two\n*end*');
	});

	it('returns an empty string for nothing', () => {
		expect(whatsAppToMarkdown('')).toBe('');
	});
});
