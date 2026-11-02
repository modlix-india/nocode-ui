import { blocksToMarkdown, markdownToBlocks } from '../blockEditor/markdown';
import { matchPeople, peopleForMentions, peopleMentionProvider } from '../mentionPeople';

describe('people to mention', () => {
	test('takes an id and a name from the shapes the platform returns', () => {
		expect(
			peopleForMentions([
				{ id: 142, name: 'Kiran Grandhi' },
				{ id: '236', userName: 'jonsnow' },
				{ userId: 7, firstName: 'Ann', lastName: 'Lee' },
				{ id: 9, label: 'Bo' },
				{ id: 142, name: 'Kiran again' },
				{ name: 'No id' },
				{ id: 3 },
				null,
			]),
		).toEqual([
			{ id: '142', label: 'Kiran Grandhi' },
			{ id: '236', label: 'jonsnow' },
			{ id: '7', label: 'Ann Lee' },
			{ id: '9', label: 'Bo' },
		]);
		expect(peopleForMentions(undefined)).toEqual([]);
		expect(peopleForMentions('x')).toEqual([]);
	});

	test('names starting with the filter come before names with a word that does', () => {
		const people = peopleForMentions([
			{ id: 1, name: 'Sam Kiran' },
			{ id: 2, name: 'Kiran Grandhi' },
			{ id: 3, name: 'Abdul' },
		]);
		expect(matchPeople(people, 'kir').map(p => p.id)).toEqual(['2', '1']);
		expect(matchPeople(people, '').map(p => p.id)).toEqual(['1', '2', '3']);
		expect(matchPeople(people, 'zz')).toEqual([]);
	});

	test('the provider offers user mentions', async () => {
		const provider = peopleMentionProvider(peopleForMentions([{ id: 236, name: 'Jon Snow' }]));
		expect(provider.kind).toBe('user');
		expect(await provider.search('jo', {})).toEqual([{ kind: 'user', id: '236', label: 'Jon Snow' }]);
	});

	test("a mention survives the markdown round trip, apostrophes included", () => {
		const md = "Can [@Jon O'Brien](mde://user/236) check this?";
		expect(blocksToMarkdown(markdownToBlocks(md)).trimEnd()).toBe(md);
	});
});

describe('the @ of an inserted mention', () => {
	test('is part of the pill, so it is not a new trigger', () => {
		const { isInMention } = require('../blockEditor/core/types');
		const content = [
			{ text: 'Hi ' },
			{ text: '@jonsnow', marks: [{ type: 'mention', attrs: { kind: 'user', id: '236' } }] },
			{ text: ' please check @an' },
		];
		expect(isInMention(content, 3)).toBe(true);
		expect(isInMention(content, 25)).toBe(false);
		expect(isInMention(content, 0)).toBe(false);
	});
});

describe('inserting a mention', () => {
	const { createDocument } = require('../blockEditor/core/document');
	const { insertMention } = require('../blockEditor/core/operations');
	const { getPlainText } = require('../blockEditor/core/types');

	function withText(text: string) {
		const doc = createDocument();
		doc.blocks[0].content = [{ text }];
		return doc;
	}

	test('adds a space after the pill and puts the caret after it', () => {
		const doc = withText('Hi @jo');
		const r = insertMention(doc, doc.blocks[0].id, 3, 6, '@Jon Snow', 'user', '236');
		expect(getPlainText(r.doc.blocks[0].content)).toBe('Hi @Jon Snow ');
		expect(r.selection.focus.offset).toBe(13);
	});

	test('does not double a space that is already there', () => {
		const doc = withText('Hi @jo there');
		const r = insertMention(doc, doc.blocks[0].id, 3, 6, '@Jon Snow', 'user', '236');
		expect(getPlainText(r.doc.blocks[0].content)).toBe('Hi @Jon Snow there');
		expect(r.selection.focus.offset).toBe(12);
	});
});
