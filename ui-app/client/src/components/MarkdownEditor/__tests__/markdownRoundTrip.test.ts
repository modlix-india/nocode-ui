import { blocksToMarkdown, markdownToBlocks } from '../blockEditor/markdown';

// The editor reads the stored markdown on load and writes it back on every
// edit, so anything it cannot reproduce is lost the first time a user saves.
// These cases come from markdown that already lives in Modlix pages.

const roundTrip = (md: string) => blocksToMarkdown(markdownToBlocks(md));

function expectSame(md: string) {
	expect(roundTrip(md).trimEnd()).toBe(md.trimEnd());
}

function expectStable(md: string) {
	const once = roundTrip(md);
	expect(roundTrip(once)).toBe(once);
}

describe('markdown round trip', () => {
	test('a typical document comes back unchanged', () => {
		expectSame(
			[
				'# Project notes',
				'',
				'This is **bold**, *italic*, `code`, ~~strike~~ and a [link](https://modlix.com).',
				'',
				'## Checklist',
				'',
				'- [x] Done',
				'- [ ] Open',
				'',
				'1. First',
				'2. Second',
				'   1. Nested',
				'3. Third',
				'',
				'- Bullet',
				'  - Nested bullet',
				'',
				'> A quote with **bold**.',
				'',
				'```js',
				'const a = 1;',
				'```',
				'',
				'---',
				'',
				'| Name | Role |',
				'| --- | --- |',
				'| Asha | Admin |',
			].join('\n'),
		);
	});

	test('table cells keep their inline markdown and escaped pipes', () => {
		expectSame(
			[
				'| Feature | Code |',
				'| --- | :---: |',
				'| **Bold** | `x[::-1]` |',
				'| a \\| b | [link](https://x.y) |',
			].join('\n'),
		);
	});

	test('tables without outer pipes are read', () => {
		const blocks = markdownToBlocks('A | B\n--- | ---\n1 | 2\n');
		expect(blocks).toHaveLength(1);
		expect(blocks[0].type).toBe('table');
		expect(blocks[0].props.tableData).toEqual([
			['A', 'B'],
			['1', '2'],
		]);
	});

	test('footnote definitions are kept', () => {
		expectSame('Text with a note[^1].\n\n[^1]: The note text.');
	});

	test('text is not rewritten: quotes, dashes, emoticons, shortcodes', () => {
		expectSame('Hello\n{style="color:red"}');
		expectSame('Run it with --force... (c) :) :smile:');
	});

	test('underscores inside words stay literal', () => {
		expectSame('Use snake_case_names and __GI___clock_gettime here.');
	});

	test('escaped markers stay escaped', () => {
		expectSame('\\*not italic\\* and \\*\\*not bold\\*\\*');
		expectSame('1\\. not a list');
	});

	test('a numbered list keeps its start number', () => {
		expectSame('5. five\n6. six');
	});

	test('bare URLs stay bare and explicit links stay explicit', () => {
		expectSame('https://www.youtube.com/watch?v=abc');
		expectSame('See [https://modlix.com](https://modlix.com) now.');
	});

	test('link and image titles are kept', () => {
		expectSame('A [link](https://example.com "tooltip") here.');
		expectSame('![alt](https://img.example/a.png "Title")');
	});

	test('image size is written in the attribute form Modlix reads', () => {
		const blocks = markdownToBlocks('![a](https://x/a.png){width=300 height=200}');
		expect(blocks[0].props.width).toBe(300);
		expect(roundTrip('![a](https://x/a.png){width=300 height=200}').trimEnd()).toBe(
			'![a](https://x/a.png){width="300" height="200"}',
		);
	});

	test('an image inside text stays part of the paragraph', () => {
		const blocks = markdownToBlocks('Before ![icon](https://x/i.png) after');
		expect(blocks).toHaveLength(1);
		expect(blocks[0].type).toBe('paragraph');
		expectSame('Before ![icon](https://x/i.png) after');
	});

	test('nested <details> blocks and the open attribute survive', () => {
		const md = [
			'<details open>',
			'<summary>Outer</summary>',
			'',
			'Level one.',
			'',
			'<details>',
			'<summary>Inner</summary>',
			'',
			'Level two.',
			'',
			'</details>',
			'',
			'</details>',
		].join('\n');
		const blocks = markdownToBlocks(md);
		expect(blocks).toHaveLength(1);
		expect(blocks[0].props.open).toBe(true);
		expectStable(md);
	});

	test('blocks indented under a list item stay inside it', () => {
		const md = ['1. First', '2. Second', '   > Quoted inside the list', '3. Third'].join('\n');
		const out = roundTrip(md);
		expect(out).toContain('   > Quoted inside the list');
		expect(out).toContain('3. Third');
		expectStable(md);
	});

	test('nested emphasis is written as one run', () => {
		expectSame('*You **can** combine them*');
		expectSame('**bold with [a link](https://x.y) inside**');
	});

	test('a fence marker with text after it on the same line is inline code', () => {
		const blocks = markdownToBlocks('``` code ``` **text**');
		expect(blocks).toHaveLength(1);
		expect(blocks[0].type).toBe('paragraph');
		expect(blocks[0].content[0]).toEqual({ text: ' code ', marks: [{ type: 'code' }] });
		expectStable('``` code ``` **text**');
	});

	test('spaces inside a code span are kept', () => {
		expectSame('Put ` - ` between them.');
	});

	test('code containing backticks gets a longer fence', () => {
		expectSame('Use ``a `tick` here`` inline.');
	});

	test('nested quotes keep their level', () => {
		expectSame('>> nested\n>> quote\n>\n> outer');
	});

	test('empty list items are kept', () => {
		expectStable('- one\n-');
	});

	test('serializing twice gives the same markdown', () => {
		expectStable(
			[
				'- 95%  postgres  [.] agg (inlined)',
				'   - agg (inlined)',
				'      - 79% fetch',
				'               + 25% SeqNext',
			].join('\n'),
		);
	});
});
