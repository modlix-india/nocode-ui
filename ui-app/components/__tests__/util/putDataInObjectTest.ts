import { putDataInObject } from '../../src/components/util/putDataInObject';

describe('putDataInObject', () => {
	it('Key in object', () => {
		const object = { a: 2 };
		putDataInObject(object, 1, 'a');
		expect(object).toEqual({ a: 1 });
	});

	it('Key in array', () => {
		const object = { a: [2] };
		putDataInObject(object, 1, 'a[0]');
		expect(object).toEqual({ a: [1] });
	});

	it('Key in array with index', () => {
		const object = { a: [2] };
		putDataInObject(object, 1, 'a[0]');
		expect(object).toEqual({ a: [1] });
	});

	it('Key in array with index and key', () => {
		const object = { a: [{ b: 2 }] };
		putDataInObject(object, 1, 'a[0].b');
		expect(object).toEqual({ a: [{ b: 1 }] });
	});

	it('Key in array with index and key with non-int index', () => {
		const object: any = { a: [{ b: 2 }] };
		putDataInObject(object, 1, 'inthat["thats"].b');
		expect(1).toEqual(object.inthat.thats.b);
	});

	it('Key in array with index and key with int index', () => {
		const object = { a: [{ b: [] }] };
		putDataInObject(object, 1, 'a[0].b[0]');
		expect(object).toEqual({ a: [{ b: [1] }] });
	});

	it('Key in array with index and key with non-int index and key', () => {
		const object = [
			[0, 1],
			[2, 3],
		];
		putDataInObject(object, 4, '[1][0]');
		expect(object).toEqual([
			[0, 1],
			[4, 3],
		]);
	});

	it('Object in an array with index', () => {
		const object = [1, 2, { a: 3 }];
		putDataInObject(object, 4, '[2].a');
		expect(object).toEqual([1, 2, { a: 4 }]);
	});

	it('Object in an array with index and key', () => {
		const object = { a: { b: { c: 10 } } };
		putDataInObject(object, 4, 'a["b"].c');
		expect(object).toEqual({ a: { b: { c: 4 } } });
	});

	it('Object in an array with index and key', () => {
		const object = { a: { b: { c: 10 } } };
		putDataInObject(object, 4, 'a.b.c');
		expect(object).toEqual({ a: { b: { c: 4 } } });
	});

	it('Object in an array with index and key', () => {
		const object = { a: { b: { c: 10 } } };
		putDataInObject(object, 4, 'a.b["c"]');
		expect(object).toEqual({ a: { b: { c: 4 } } });
	});

	it('Object in an array with index and key', () => {
		const object = {};
		putDataInObject(object, 4, 'a["b"].c');
		expect(object).toEqual({ a: { b: { c: 4 } } });
	});

	it('Object in an array with index and key', () => {
		const object = {};
		putDataInObject(object, 4, 'a.b.c');
		expect(object).toEqual({ a: { b: { c: 4 } } });
	});

	it('Object in an array with index and key', () => {
		const object = {};
		putDataInObject(object, 4, "a.b['c']");
		expect(object).toEqual({ a: { b: { c: 4 } } });
	});

	it('Object in an array with index and key', () => {
		const object = {};
		putDataInObject(object, 4, 'a[0].c');
		expect(object).toEqual({ a: [{ c: 4 }] });
	});

	it('When no path is specified, the data is put in the root of the object', () => {
		const object = {};
		putDataInObject(object, 4, 'a');
		expect(object).toEqual({ a: 4 });
	});

	it('When no path is specified, the data is put in the root of the object', () => {
		const object = {};
		putDataInObject(object, 4, '');
		expect(object).toEqual({});
	});
});
