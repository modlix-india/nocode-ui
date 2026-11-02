import { NOT_SEEN, sessionChange } from '../sessionWatch';

describe('sessionChange', () => {
	test('the first render with no chat open says nothing', () => {
		expect(sessionChange(NOT_SEEN, null)).toBeUndefined();
	});

	test('a chat reopened at load is heard', () => {
		expect(sessionChange(NOT_SEEN, 'S1')).toEqual({ value: 'S1', fire: true });
	});

	test('switching chats and starting a new one are heard; a new chat writes an empty id', () => {
		expect(sessionChange('S1', 'S2')).toEqual({ value: 'S2', fire: true });
		expect(sessionChange('S2', null)).toEqual({ value: '', fire: true });
		expect(sessionChange(null, 'S3')).toEqual({ value: 'S3', fire: true });
	});

	test('the same chat again says nothing', () => {
		expect(sessionChange('S1', 'S1')).toBeUndefined();
		expect(sessionChange(null, null)).toBeUndefined();
	});
});
