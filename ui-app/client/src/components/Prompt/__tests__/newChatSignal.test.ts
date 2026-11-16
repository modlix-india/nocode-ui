import { newChatAsked } from '../newChatSignal';

describe('newChatAsked', () => {
	test('a value written by the page asks for a new chat', () => {
		expect(newChatAsked(true)).toBe(true);
		expect(newChatAsked(1794831861383)).toBe(true);
		expect(newChatAsked('start-over')).toBe(true);
		expect(newChatAsked({ at: 1 })).toBe(true);
	});

	test('the cleared path asks nothing, so the ask never fires twice', () => {
		expect(newChatAsked(undefined)).toBe(false);
		expect(newChatAsked(null)).toBe(false);
		expect(newChatAsked(false)).toBe(false);
		expect(newChatAsked('')).toBe(false);
		expect(newChatAsked('   ')).toBe(false);
		expect(newChatAsked(0)).toBe(false);
		expect(newChatAsked(Number.NaN)).toBe(false);
	});
});
