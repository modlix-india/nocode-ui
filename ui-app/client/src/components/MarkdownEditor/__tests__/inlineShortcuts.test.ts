import { createDocument } from '../blockEditor/core/document';
import { handleBeforeInput } from '../blockEditor/core/input';
import { getPlainText, type EditorDocument, type Selection } from '../blockEditor/core/types';

// Types `text` one character at a time into the first block, the way the
// browser's beforeinput events arrive, and returns the resulting document.
function typeInto(text: string): EditorDocument {
	let doc = createDocument();
	const blockId = doc.blocks[0].id;
	let selection: Selection = { anchor: { blockId, offset: 0 }, focus: { blockId, offset: 0 } };
	for (const ch of text) {
		const event = {
			inputType: 'insertText',
			data: ch,
			preventDefault() {},
		} as unknown as InputEvent;
		const { result, handled } = handleBeforeInput({ doc, selection }, event);
		expect(handled).toBe(true);
		doc = result.doc;
		if (result.selection) selection = result.selection;
	}
	return doc;
}

const spans = (doc: EditorDocument) =>
	doc.blocks[0].content.map(s => [s.text, (s.marks ?? []).map(m => m.type).join('+')]);

describe('inline markdown shortcuts', () => {
	test('**bold** becomes bold and typing after it is plain', () => {
		const doc = typeInto('a **bold** b');
		expect(getPlainText(doc.blocks[0].content)).toBe('a bold b');
		expect(spans(doc)).toEqual([
			['a ', ''],
			['bold', 'bold'],
			[' b', ''],
		]);
	});

	test('*italic*, `code` and ~~strike~~', () => {
		expect(spans(typeInto('*it*'))).toEqual([['it', 'italic']]);
		expect(spans(typeInto('`x`'))).toEqual([['x', 'code']]);
		expect(spans(typeInto('~~gone~~'))).toEqual([['gone', 'strikethrough']]);
	});

	test('maths and snake_case are left alone', () => {
		expect(getPlainText(typeInto('2*3*4').blocks[0].content)).toBe('2*3*4');
		expect(getPlainText(typeInto('snake_case_name').blocks[0].content)).toBe('snake_case_name');
	});

	test('a delimiter pair with spaces inside is not formatting', () => {
		expect(getPlainText(typeInto('a * b * c').blocks[0].content)).toBe('a * b * c');
	});
});
