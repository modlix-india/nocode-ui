import RepetetiveArray from '../../src/util/RepetetiveArray';

describe('RepetetiveArray', () => {
	it('Test values', () => {
		const ra = new RepetetiveArray<number>();

		ra.push(1);
		ra.push(1);
		expect(ra.toArray()).toEqual([1, 1]);
		expect(ra.getDefaultValue()).toEqual(1);
		expect(ra.size()).toEqual(2);

		ra.push(2);
		ra.push(2);
		ra.push(2);
		expect(ra.toArray()).toEqual([1, 1, 2, 2, 2]);
		expect(ra.getDefaultValue()).toEqual(2);
		expect(ra.size()).toEqual(5);

		ra.push(3);
		ra.push(3);
		ra.push(3);
		ra.push(3);
		ra.push(3);
		ra.push(3);
		ra.push(3);

		expect(ra.toArray()).toEqual([1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3]);
		expect(ra.getDefaultValue()).toEqual(3);
		expect(ra.size()).toEqual(12);
	});

	it('Test insert', () => {
		const ra = new RepetetiveArray<number>();

		ra.push(1);
		ra.push(1);
		ra.push(2);
		ra.push(4);

		ra.insert(2, 3);
		expect(ra.toArray()).toEqual([1, 1, 3, 2, 4]);
		expect(ra.getDefaultValue()).toEqual(1);

		ra.insert(0, 2);
		expect(ra.toArray()).toEqual([2, 1, 1, 3, 2, 4]);
		expect(ra.getDefaultValue()).toEqual(1);

		ra.insert(ra.size(), 2);
		ra.insert(ra.size(), 2);
		ra.insert(ra.size(), 2);
		expect(ra.toArray()).toEqual([2, 1, 1, 3, 2, 4, 2, 2, 2]);
		expect(ra.getDefaultValue()).toEqual(2);
	});

	it('Test remove', () => {
		const ra = new RepetetiveArray<number>();

		ra.push(1);
		ra.push(1);
		ra.push(2);
		ra.push(4);

		ra.remove(2);
		expect(ra.toArray()).toEqual([1, 1, 4]);
		expect(ra.getDefaultValue()).toEqual(1);

		ra.remove(0);
		expect(ra.toArray()).toEqual([1, 4]);
		expect(ra.getDefaultValue()).toEqual(1);

		ra.remove(1);
		expect(ra.toArray()).toEqual([1]);
		expect(ra.getDefaultValue()).toEqual(1);

		ra.remove(0);
		expect(ra.toArray()).toEqual([]);
	});

	it('Test map function', () => {
		const ra = new RepetetiveArray<number>();

		ra.push(1);
		ra.push(1);
		ra.push(2);
		ra.push(4);

		const mapped = ra.map(value => value * 2);
		expect(mapped).toEqual([2, 2, 4, 8]);
	});

	it('Test filter function', () => {
		const ra = new RepetetiveArray<number>();

		ra.push(1);
		ra.push(1);
		ra.push(2);
		ra.push(4);

		const filtered = ra.filter(value => value % 2 === 0);
		expect(filtered).toEqual([2, 4]);
	});
});
