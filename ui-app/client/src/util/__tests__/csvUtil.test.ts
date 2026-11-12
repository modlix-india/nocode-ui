import { ToArray } from '../csvUtil';

// The FileUpload's JSON_LIST_CSV / JSON_LIST_TSV reader (ADZ-1694 reads customer files with it).
describe('csvUtil.ToArray', () => {
	test('rows of cells, quotes and doubled quotes', () => {
		expect(ToArray('a,b\n"x, y","say ""hi"""')).toEqual([
			['a', 'b'],
			['x, y', 'say "hi"'],
		]);
	});

	test('a delimiter at the very end is not part of the last cell', () => {
		expect(ToArray('email,phone\nk@x.com,')).toEqual([['email', 'phone'], ['k@x.com']]);
		expect(ToArray('a\tb\nc\t', false, '\t')).toEqual([['a', 'b'], ['c']]);
	});

	test('the last cell keeps its last character', () => {
		expect(ToArray('email,phone\nk@x.com,98')).toEqual([
			['email', 'phone'],
			['k@x.com', '98'],
		]);
	});

	test('with headers: objects keyed by the header', () => {
		expect(ToArray('a,b\n1,2', true)).toEqual([{ a: '1', b: '2' }]);
	});
});
