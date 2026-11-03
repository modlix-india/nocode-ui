import { orderColumnKeys } from '../columnOrder';

const cols = (...pairs: Array<[string, number]>) =>
	pairs.map(([key, displayOrder]) => ({ key, displayOrder }));

describe('orderColumnKeys', () => {
	test('a column missing from the saved order goes after its design neighbour', () => {
		// The user moved Budget up after Product; Gender was then added after Budget by design.
		const columns = cols(
			['stage', 7],
			['status', 8],
			['product', 9],
			['budget', 15],
			['gender', 16],
			['action', 17],
		);
		const saved = { stage: 0, status: 1, product: 2, budget: 3, action: 4 };
		expect(orderColumnKeys(columns, saved)).toEqual([
			'stage',
			'status',
			'product',
			'budget',
			'gender',
			'action',
		]);
	});

	test('saved positions win over design order', () => {
		const columns = cols(['a', 1], ['b', 2], ['c', 3]);
		expect(orderColumnKeys(columns, { c: 0, a: 1, b: 2 })).toEqual(['c', 'a', 'b']);
	});

	test('several new columns keep their design order', () => {
		const columns = cols(['a', 1], ['x', 2], ['y', 3], ['b', 4]);
		expect(orderColumnKeys(columns, { b: 0, a: 1 })).toEqual(['b', 'a', 'x', 'y']);
	});

	test('a new first column stays first', () => {
		const columns = cols(['x', 0], ['a', 1], ['b', 2]);
		expect(orderColumnKeys(columns, { b: 0, a: 1 })).toEqual(['x', 'b', 'a']);
	});

	test('no saved positions gives the design order', () => {
		const columns = cols(['b', 2], ['a', 1], ['c', 3]);
		expect(orderColumnKeys(columns, {})).toEqual(['a', 'b', 'c']);
	});
});
