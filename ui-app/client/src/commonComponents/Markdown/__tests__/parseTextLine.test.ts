import { parseTextLine } from '../parseTextLine';
import { makeRefsAndRemove } from '../utils';

// Walks the lines the way MarkdownParser does and returns the element tags.
function tags(text: string): string[] {
	const lines = text.split('\n');
	const { footNoteRefs, urlRefs } = makeRefsAndRemove(lines);
	const out: string[] = [];
	for (let i = 0; i < lines.length; i++) {
		const { lineNumber, comp } = parseTextLine({
			componentKey: 'k',
			lines,
			lineNumber: i,
			styles: {},
			footNotes: { currentRefNumber: 0, footNoteRefs },
			urlRefs,
			location: undefined,
		} as any);
		i = lineNumber;
		for (const c of Array.isArray(comp) ? comp : [comp]) if (c) out.push(String(c.type));
	}
	return out;
}

describe('horizontal rules and setext headings', () => {
	test('--- after a blank line is a rule, not an empty heading', () => {
		const t = tags('Intro\n\n---\n\nAfter');
		expect(t).toContain('hr');
		expect(t).not.toContain('h2');
	});

	test('=== after a blank line is a rule too', () => {
		const t = tags('Intro\n\n===\n');
		expect(t).toContain('hr');
		expect(t).not.toContain('h1');
	});

	test('text underlined with --- or === is still a heading', () => {
		expect(tags('Title\n---')).toEqual(['h2']);
		expect(tags('Title\n===')).toEqual(['h1']);
	});

	test('--- at the very start is a rule', () => {
		expect(tags('---\nText')[0]).toBe('hr');
	});
});
