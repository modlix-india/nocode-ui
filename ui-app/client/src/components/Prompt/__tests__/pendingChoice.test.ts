/**
 * ADZ-842: a reopened chat draws the chips of a question that is still open, and none once it was answered.
 */

import { mapHistoryToMessages } from '../LazyPrompt';

const options = [
	{ label: 'Valmark', value: 'Valmark' },
	{ label: 'White Waters', value: 'White Waters' },
];

const history = [
	{ turn_number: 1, user_instruction: 'Start a campaign', assistant_summary: 'Which product is it for?' },
];

describe('mapHistoryToMessages with a pending choice', () => {
	it('puts the chips on the reply the question was asked on', () => {
		const msgs = mapHistoryToMessages(history, { turn: 1, options });
		expect(msgs[msgs.length - 1].suggestions).toEqual({ options, mode: 'single' });
	});

	it('keeps a multi pick as a multi pick', () => {
		const msgs = mapHistoryToMessages(history, { turn: 1, options, mode: 'multi' });
		expect(msgs[msgs.length - 1].suggestions?.mode).toBe('multi');
	});

	it('draws no chips when there is no pending choice, or it belongs to another turn', () => {
		expect(mapHistoryToMessages(history, null).some(m => m.suggestions)).toBe(false);
		expect(mapHistoryToMessages(history, { turn: 2, options }).some(m => m.suggestions)).toBe(false);
	});

	it('draws no chips under a reply the person already answered', () => {
		const answered = [
			...history,
			{ turn_number: 2, user_instruction: 'Valmark', assistant_summary: 'Which platform?' },
		];
		const msgs = mapHistoryToMessages(answered, { turn: 1, options });
		expect(msgs.some(m => m.suggestions)).toBe(false);
	});
});
