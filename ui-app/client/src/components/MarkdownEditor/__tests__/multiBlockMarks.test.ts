import { createDocument, findBlock } from '../blockEditor/core/document';
import { handleKeyDown } from '../blockEditor/core/input';
import {
	activeMarksInRanges,
	blockSelectionTextRanges,
	selectionTextRanges,
	setMarkInRanges,
	toggleMarkInRanges,
} from '../blockEditor/core/operations';
import type { EditorDocument, Mark, Selection } from '../blockEditor/core/types';
import { blocksToMarkdown, markdownToBlocks } from '../blockEditor/markdown';

// A selection made across lines (two list items, a paragraph and a list item)
// must format all of it, and the toolbar buttons must show as on only when
// the WHOLE selection already has that style.

const SOURCE = [
	'Step 5 only accepts a Daily Budget number.',
	'',
	'- Maximize Conversion Value',
	'- Manual CPC',
	'',
	'***Campaigns rely on defaults.***',
].join('\n');

function load(md = SOURCE): EditorDocument {
	return createDocument(markdownToBlocks(md));
}

const md = (doc: EditorDocument) => blocksToMarkdown(doc.blocks).trimEnd();
const ids = (doc: EditorDocument) => doc.blocks.map(b => b.id);

function select(doc: EditorDocument, anchor: [number, number], focus: [number, number]): Selection {
	const all = ids(doc);
	return {
		anchor: { blockId: all[anchor[0]]!, offset: anchor[1] },
		focus: { blockId: all[focus[0]]!, offset: focus[1] },
	};
}

const toggle = (doc: EditorDocument, sel: Selection, mark: Mark) =>
	toggleMarkInRanges(doc, selectionTextRanges(doc, sel), mark).doc;

const active = (doc: EditorDocument, sel: Selection) =>
	activeMarksInRanges(doc, selectionTextRanges(doc, sel)).sort();

describe('selection ranges across blocks', () => {
	test('cover the tail of the first block, the head of the last, in order', () => {
		const doc = load();
		const [, a, b] = ids(doc);
		expect(selectionTextRanges(doc, select(doc, [1, 4], [2, 6]))).toEqual([
			{ blockId: a, from: 4, to: 'Maximize Conversion Value'.length },
			{ blockId: b, from: 0, to: 6 },
		]);
	});

	test('a backward selection gives the same ranges', () => {
		const doc = load();
		expect(selectionTextRanges(doc, select(doc, [2, 6], [1, 4]))).toEqual(
			selectionTextRanges(doc, select(doc, [1, 4], [2, 6])),
		);
	});

	test('an end at offset 0 of the next block does not include that block', () => {
		const doc = load();
		const ranges = selectionTextRanges(doc, select(doc, [1, 0], [3, 0]));
		expect(ranges.map(r => r.blockId)).toEqual(ids(doc).slice(1, 3));
	});
});

describe('active marks for a multi-block selection', () => {
	test('two plain list items: nothing shows as on, even with a bold italic block next to them', () => {
		const doc = load();
		// The reported case: both items selected up to the start of the bold
		// italic paragraph.
		expect(active(doc, select(doc, [1, 0], [3, 0]))).toEqual([]);
		expect(active(doc, select(doc, [1, 0], [2, 'Manual CPC'.length]))).toEqual([]);
	});

	test('on only when every selected character has the mark', () => {
		let doc = load('**one**\n\n**two** plain');
		expect(active(doc, select(doc, [0, 0], [1, 3]))).toEqual(['bold']);
		expect(active(doc, select(doc, [0, 0], [1, 9]))).toEqual([]);
		doc = load('***one***\n\n**two**');
		expect(active(doc, select(doc, [0, 1], [1, 2]))).toEqual(['bold']);
	});

	test('single-block selections still report their marks', () => {
		const doc = load('a **bold** b');
		expect(active(doc, select(doc, [0, 2], [0, 6]))).toEqual(['bold']);
		expect(active(doc, select(doc, [0, 0], [0, 6]))).toEqual([]);
	});
});

describe('toggling a mark across blocks', () => {
	test('bold and italic apply to two whole list items and store valid markdown', () => {
		let doc = load();
		const sel = select(doc, [1, 0], [2, 'Manual CPC'.length]);
		doc = toggle(doc, sel, { type: 'bold' });
		doc = toggle(doc, sel, { type: 'italic' });
		expect(active(doc, sel)).toEqual(['bold', 'italic']);
		expect(md(doc)).toBe(
			[
				'Step 5 only accepts a Daily Budget number.',
				'',
				'- ***Maximize Conversion Value***',
				'- ***Manual CPC***',
				'',
				'***Campaigns rely on defaults.***',
			].join('\n'),
		);
		// The stored markdown reads back to the same document.
		expect(blocksToMarkdown(markdownToBlocks(md(doc))).trimEnd()).toBe(md(doc));
	});

	test('a second click on the same selection toggles the mark back off', () => {
		const start = load();
		const sel = select(start, [1, 0], [2, 'Manual CPC'.length]);
		const on = toggle(start, sel, { type: 'bold' });
		const off = toggle(on, sel, { type: 'bold' });
		expect(md(off)).toBe(md(start));
		expect(active(off, sel)).toEqual([]);
	});

	test('a paragraph and a list item, partly selected', () => {
		let doc = load();
		// "number." of the paragraph through "Maximize" of the first item.
		const sel = select(doc, [0, 34], [1, 8]);
		doc = toggle(doc, sel, { type: 'bold' });
		expect(md(doc).split('\n').slice(0, 3)).toEqual([
			'Step 5 only accepts a Daily Budget **number.**',
			'',
			'- **Maximize** Conversion Value',
		]);
	});

	test('when only part of the selection is bold, the first click makes all of it bold', () => {
		let doc = load('**one**\n\ntwo');
		const sel = select(doc, [0, 0], [1, 3]);
		doc = toggle(doc, sel, { type: 'bold' });
		expect(md(doc)).toBe('**one**\n\n**two**');
	});

	test('underline, strike, code, link, sub and sup also cover every block', () => {
		const marks: Mark[] = [
			{ type: 'underline' },
			{ type: 'strikethrough' },
			{ type: 'code' },
			{ type: 'link', attrs: { href: 'https://modlix.com' } },
			{ type: 'superscript' },
			{ type: 'subscript' },
		];
		for (const mark of marks) {
			const doc = load('one\n\ntwo');
			const sel = select(doc, [0, 0], [1, 3]);
			const next = toggle(doc, sel, mark);
			expect(active(next, sel)).toEqual([mark.type]);
			for (const b of next.blocks) {
				expect(findBlock(next, b.id)!.content[0]!.marks?.map(m => m.type)).toEqual([
					mark.type,
				]);
			}
		}
		const plain = load('one\n\ntwo');
		const linked = toggle(plain, select(plain, [0, 0], [1, 3]), {
			type: 'link',
			attrs: { href: 'https://modlix.com' },
		});
		expect(md(linked)).toBe('[one](https://modlix.com)\n\n[two](https://modlix.com)');
	});

	test('one undo step per click: one replaceContent op per changed block', () => {
		const doc = load();
		const result = toggleMarkInRanges(
			doc,
			selectionTextRanges(doc, select(doc, [1, 0], [2, 'Manual CPC'.length])),
			{ type: 'bold' },
		);
		expect(result.ops.map(o => o.type)).toEqual(['replaceContent', 'replaceContent']);
		expect(result.selection).toBeNull();
	});

	test('code blocks in the middle are left as they are', () => {
		let doc = load('one\n\n```\ncode\n```\n\ntwo');
		const sel = select(doc, [0, 0], [2, 3]);
		doc = toggle(doc, sel, { type: 'bold' });
		expect(md(doc)).toBe('**one**\n\n```\ncode\n```\n\n**two**');
	});
});

describe('whole-block selection (drag across blocks)', () => {
	test('formats every selected block, nested items included', () => {
		let doc = load('- one\n  - nested\n- two\n\nlast');
		const ranges = blockSelectionTextRanges(doc, ids(doc).slice(0, 2));
		expect(activeMarksInRanges(doc, ranges)).toEqual([]);
		doc = toggleMarkInRanges(doc, ranges, { type: 'italic' }).doc;
		expect(md(doc)).toBe('- *one*\n  - *nested*\n- *two*\n\nlast');
		expect(
			activeMarksInRanges(doc, blockSelectionTextRanges(doc, ids(doc).slice(0, 2))),
		).toEqual(['italic']);
	});

	test('colour and font picks replace across blocks', () => {
		let doc = load('one\n\ntwo');
		const ranges = blockSelectionTextRanges(doc, ids(doc));
		doc = setMarkInRanges(doc, ranges, 'color', { color: 'red' }).doc;
		doc = setMarkInRanges(doc, ranges, 'color', { color: 'blue' }).doc;
		for (const b of doc.blocks) {
			expect(b.content[0]!.marks).toEqual([{ type: 'color', attrs: { color: 'blue' } }]);
		}
	});
});

describe('keyboard shortcuts across blocks', () => {
	test('Cmd+B and Cmd+I format a selection across two list items', () => {
		let doc = load();
		const sel = select(doc, [1, 0], [2, 'Manual CPC'.length]);
		for (const key of ['b', 'i']) {
			const event = { key, metaKey: true, preventDefault() {} } as unknown as KeyboardEvent;
			const { result, handled } = handleKeyDown({ doc, selection: sel }, event);
			expect(handled).toBe(true);
			expect(result.selection).toEqual(sel);
			doc = result.doc;
		}
		expect(md(doc)).toContain('- ***Maximize Conversion Value***\n- ***Manual CPC***');
	});
});
