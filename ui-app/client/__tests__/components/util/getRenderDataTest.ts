import { getRenderData } from '../../../src/components/util/getRenderData';
import { PageStoreExtractor } from '../../../src/context/StoreContext';
import { ComponentProperty } from '../../../src/types/common';

describe('Testing data with different structures for iteration', () => {
	test('List of Strings', () => {
		const data = ['Raja', 'Avinash', 'Alli', 'Akhilesh', 'Surendhar', 'Kiran'];
		const dataType = 'LIST_OF_STRINGS';
		const uniqueKeyType = 'OBJECT';
		const selectionType = 'OBJECT';
		expect(getRenderData(data, dataType, uniqueKeyType, '', selectionType)).toStrictEqual([
			{ key: 'Raja', label: 'Raja', value: 'Raja' },
			{ key: 'Avinash', label: 'Avinash', value: 'Avinash' },
			{ key: 'Alli', label: 'Alli', value: 'Alli' },
			{ key: 'Akhilesh', label: 'Akhilesh', value: 'Akhilesh' },
			{ key: 'Surendhar', label: 'Surendhar', value: 'Surendhar' },
			{ key: 'Kiran', label: 'Kiran', value: 'Kiran' },
		]);
	});

	test('List of Strings with selection as index', () => {
		const testList = ['Raja', 'Avinash', 'Alli', 'Akhilesh', 'Surendhar', 'Kiran'];
		const dataType = 'LIST_OF_STRINGS';
		const uniqueKeyType = 'OBJECT';
		const selectionType = 'INDEX';
		expect(getRenderData(testList, dataType, uniqueKeyType, '', selectionType)).toStrictEqual([
			{ key: 'Raja', label: 'Raja', value: 0 },
			{ key: 'Avinash', label: 'Avinash', value: 1 },
			{ key: 'Alli', label: 'Alli', value: 2 },
			{ key: 'Akhilesh', label: 'Akhilesh', value: 3 },
			{ key: 'Surendhar', label: 'Surendhar', value: 4 },
			{ key: 'Kiran', label: 'Kiran', value: 5 },
		]);
	});

	test('List of Strings with uniquekey as index', () => {
		const testList = ['Raja', 'Avinash', 'Alli', 'Akhilesh', 'Surendhar', 'Kiran'];
		const dataType = 'LIST_OF_STRINGS';
		const uniqueKeyType = 'INDEX';
		const selectionType = 'INDEX';
		expect(getRenderData(testList, dataType, uniqueKeyType, '', selectionType)).toStrictEqual([
			{ key: 0, label: 'Raja', value: 0 },
			{ key: 1, label: 'Avinash', value: 1 },
			{ key: 2, label: 'Alli', value: 2 },
			{ key: 3, label: 'Akhilesh', value: 3 },
			{ key: 4, label: 'Surendhar', value: 4 },
			{ key: 5, label: 'Kiran', value: 5 },
		]);
	});

	test('List of Objects', () => {
		const testList = [
			{ name: 'Raja', id: 1, department: 'IT' },
			{ name: 'Avinash', id: 2, department: 'CS' },
			{ name: 'Alli', id: 3, department: 'EE' },
			{ name: 'Akhilesh', id: 4, department: 'EC' },
			{ name: 'Surendhar', id: 5, department: 'IT' },
			{ name: 'Kiran', id: 6, department: 'IT' },
		];
		const dataType = 'LIST_OF_OBJECTS';
		const uniqueKeyType = 'KEY';
		const uniqueKey = 'id';
		const selectionType = 'KEY';
		const selectionKey = 'department';
		const labelKey = 'name';
		expect(
			getRenderData(
				testList,
				dataType,
				uniqueKeyType,
				uniqueKey,
				selectionType,
				selectionKey,
				undefined,
				labelKey,
			),
		).toStrictEqual([
			{ key: 1, label: 'Raja', value: 'IT' },
			{ key: 2, label: 'Avinash', value: 'CS' },
			{ key: 3, label: 'Alli', value: 'EE' },
			{ key: 4, label: 'Akhilesh', value: 'EC' },
			{ key: 5, label: 'Surendhar', value: 'IT' },
			{ key: 6, label: 'Kiran', value: 'IT' },
		]);
	});

	test('List of Objects with selection type as object', () => {
		const testList = [
			{ name: 'Raja', id: 1, department: 'IT' },
			{ name: 'Avinash', id: 2, department: 'CS' },
			{ name: 'Alli', id: 3, department: 'EE' },
			{ name: 'Akhilesh', id: 4, department: 'EC' },
			{ name: 'Surendhar', id: 5, department: 'IT' },
			{ name: 'Kiran', id: 6, department: 'IT' },
		];
		const dataType = 'LIST_OF_OBJECTS';
		const uniqueKeyType = 'KEY';
		const uniqueKey = 'id';
		const selectionType = 'OBJECT';
		const selectionKey = '';
		const labelKey = 'name';
		expect(
			getRenderData(
				testList,
				dataType,
				uniqueKeyType,
				uniqueKey,
				selectionType,
				selectionKey,
				undefined,
				labelKey,
			),
		).toStrictEqual([
			{
				key: 1,
				label: 'Raja',
				value: { name: 'Raja', id: 1, department: 'IT' },
			},
			{
				key: 2,
				label: 'Avinash',
				value: { name: 'Avinash', id: 2, department: 'CS' },
			},
			{
				key: 3,
				label: 'Alli',
				value: { name: 'Alli', id: 3, department: 'EE' },
			},
			{
				key: 4,
				label: 'Akhilesh',
				value: { name: 'Akhilesh', id: 4, department: 'EC' },
			},
			{
				key: 5,
				label: 'Surendhar',
				value: { name: 'Surendhar', id: 5, department: 'IT' },
			},
			{
				key: 6,
				label: 'Kiran',
				value: { name: 'Kiran', id: 6, department: 'IT' },
			},
		]);
	});

	test('List of Objects with selection key as path', () => {
		const testList = [
			{
				name: 'Raja',
				id: 1,
				department: 'IT',
				links: { a: { b: 'c' } },
			},
			{
				name: 'Avinash',
				id: 2,
				department: 'CS',
				links: { a: { b: 'c' } },
			},
			{
				name: 'Alli',
				id: 3,
				department: 'EE',
				links: { a: { b: 'c' } },
			},
			{
				name: 'Akhilesh',
				id: 4,
				department: 'EC',
				links: { a: { b: 'c' } },
			},
			{
				name: 'Surendhar',
				id: 5,
				department: 'IT',
				links: { a: { b: 'c' } },
			},
			{
				name: 'Kiran',
				id: 6,
				department: 'IT',
				links: { a: { b: 'c' } },
			},
		];
		const dataType = 'LIST_OF_OBJECTS';
		const uniqueKeyType = 'KEY';
		const uniqueKey = 'id';
		const selectionType = 'KEY';
		const selectionKey = 'links.a.b';
		const labelKey = 'name';
		expect(
			getRenderData(
				testList,
				dataType,
				uniqueKeyType,
				uniqueKey,
				selectionType,
				selectionKey,
				undefined,
				labelKey,
			),
		).toStrictEqual([
			{ key: 1, label: 'Raja', value: 'c' },
			{ key: 2, label: 'Avinash', value: 'c' },
			{ key: 3, label: 'Alli', value: 'c' },
			{ key: 4, label: 'Akhilesh', value: 'c' },
			{ key: 5, label: 'Surendhar', value: 'c' },
			{ key: 6, label: 'Kiran', value: 'c' },
		]);
	});

	test('List of Objects with uniquekey as path', () => {
		const testList = [
			{
				name: 'Raja',
				id: 1,
				department: 'IT',
				links: { a: { b: 'c' } },
			},
			{
				name: 'Avinash',
				id: 2,
				department: 'CS',
				links: { a: { b: 'c' } },
			},
			{
				name: 'Alli',
				id: 3,
				department: 'EE',
				links: { a: { b: 'c' } },
			},
			{
				name: 'Akhilesh',
				id: 4,
				department: 'EC',
				links: { a: { b: 'c' } },
			},
			{
				name: 'Surendhar',
				id: 5,
				department: 'IT',
				links: { a: { b: 'c' } },
			},
			{
				name: 'Kiran',
				id: 6,
				department: 'IT',
				links: { a: { b: 'c' } },
			},
		];
		const dataType = 'LIST_OF_OBJECTS';
		const uniqueKeyType = 'KEY';
		const uniqueKey = 'links.a.b';
		const selectionType = 'KEY';
		const selectionKey = 'links.a.b';
		const labelKey = 'name';
		expect(
			getRenderData(
				testList,
				dataType,
				uniqueKeyType,
				uniqueKey,
				selectionType,
				selectionKey,
				undefined,
				labelKey,
			),
		).toStrictEqual([
			{ key: 'c', label: 'Raja', value: 'c' },
			{ key: 'c', label: 'Avinash', value: 'c' },
			{ key: 'c', label: 'Alli', value: 'c' },
			{ key: 'c', label: 'Akhilesh', value: 'c' },
			{ key: 'c', label: 'Surendhar', value: 'c' },
			{ key: 'c', label: 'Kiran', value: 'c' },
		]);
	});

	test('List of Lists with uniquekey and selection as keys', () => {
		const testList = [
			[
				{
					name: 'Raja',
					id: 1,
					department: 'IT',
					links: { a: { b: 'c' } },
				},
			],
			[
				{
					name: 'Avinash',
					id: 2,
					department: 'CS',
					links: { a: { b: 'c' } },
				},
			],
			[
				{
					name: 'Alli',
					id: 3,
					department: 'EE',
					links: { a: { b: 'c' } },
				},
			],
			[
				{
					name: 'Akhilesh',
					id: 4,
					department: 'EC',
					links: { a: { b: 'c' } },
				},
			],
			[
				{
					name: 'Surendhar',
					id: 5,
					department: 'IT',
					links: { a: { b: 'c' } },
				},
			],
			[
				{
					name: 'Kiran',
					id: 6,
					department: 'IT',
					links: { a: { b: 'c' } },
				},
			],
		];
		const dataType = 'LIST_OF_LISTS';
		const uniqueKeyType = 'KEY';
		const uniqueKey = '0.id';
		const selectionType = 'KEY';
		const selectionKey = '0.links.a.b';
		const labelKey = '0.name';
		expect(
			getRenderData(
				testList,
				dataType,
				uniqueKeyType,
				uniqueKey,
				selectionType,
				selectionKey,
				undefined,
				labelKey,
			),
		).toStrictEqual([
			{ key: 1, label: 'Raja', value: 'c' },
			{ key: 2, label: 'Avinash', value: 'c' },
			{ key: 3, label: 'Alli', value: 'c' },
			{ key: 4, label: 'Akhilesh', value: 'c' },
			{ key: 5, label: 'Surendhar', value: 'c' },
			{ key: 6, label: 'Kiran', value: 'c' },
		]);
	});

	test('Object with primitives with object selection', () => {
		const testList = {
			a: 'b',
			c: true,
			e: 'f',
			g: 'h',
		};
		const dataType = 'OBJECT_OF_PRIMITIVES';
		const uniqueKeyType = 'OBJECT';
		const selectionType = 'OBJECT';
		const labelKeyType = 'OBJECT';

		expect(
			getRenderData(testList, dataType, uniqueKeyType, '', selectionType, '', labelKeyType),
		).toStrictEqual([
			{ key: 'b', label: 'b', value: 'b' },
			{ key: true, label: true, value: true },
			{ key: 'f', label: 'f', value: 'f' },
			{ key: 'h', label: 'h', value: 'h' },
		]);
	});

	test('Object with primitives with index selection', () => {
		const testList = {
			a: 'b',
			c: true,
			e: 'f',
			g: 'h',
		};
		const dataType = 'OBJECT_OF_PRIMITIVES';
		const uniqueKeyType = 'INDEX';
		const selectionType = 'INDEX';
		const labelKeyType = 'INDEX';

		expect(
			getRenderData(testList, dataType, uniqueKeyType, '', selectionType, '', labelKeyType),
		).toStrictEqual([
			{ key: 0, label: 0, value: 0 },
			{ key: 1, label: 1, value: 1 },
			{ key: 2, label: 2, value: 2 },
			{ key: 3, label: 3, value: 3 },
		]);
	});

	test('Object of Objects with index selection', () => {
		const testList = {
			a: { a: 'b' },
			c: { c: true },
			e: { e: 'f' },
			g: { g: 'h' },
		};
		const dataType = 'OBJECT_OF_OBJECTS';
		const uniqueKeyType = 'INDEX';
		const selectionType = 'INDEX';
		const labelKeyType = 'INDEX';

		expect(
			getRenderData(testList, dataType, uniqueKeyType, '', selectionType, '', labelKeyType),
		).toStrictEqual([
			{ key: 'a', label: 'a', value: 'a' },
			{ key: 'c', label: 'c', value: 'c' },
			{ key: 'e', label: 'e', value: 'e' },
			{ key: 'g', label: 'g', value: 'g' },
		]);
	});

	test('Object of Objects with key selection', () => {
		const testList = {
			a: { test: { test: 'b' } },
			c: { test: { test: true } },
			e: { test: { test: 'f' } },
			g: { test: { test: 'h' } },
		};
		const dataType = 'OBJECT_OF_OBJECTS';
		const uniqueKeyType = 'KEY';
		const uniqueKey = 'test.test';
		const selectionType = 'INDEX';
		const labelKeyType = 'INDEX';

		expect(
			getRenderData(
				testList,
				dataType,
				uniqueKeyType,
				uniqueKey,
				selectionType,
				'',
				labelKeyType,
			),
		).toStrictEqual([
			{ key: 'b', label: 'a', value: 'a' },
			{ key: true, label: 'c', value: 'c' },
			{ key: 'f', label: 'e', value: 'e' },
			{ key: 'h', label: 'g', value: 'g' },
		]);
	});

	test('Object of Objects with Object selection', () => {
		const testList = {
			a: { test: { test: 'b' } },
			c: { test: { test: true } },
			e: { test: { test: 'f' } },
			g: { test: { test: 'h' } },
		};
		const dataType = 'OBJECT_OF_OBJECTS';
		const uniqueKeyType = 'KEY';
		const uniqueKey = 'test.test';
		const selectionType = 'OBJECT';
		const labelKeyType = 'INDEX';

		expect(
			getRenderData(
				testList,
				dataType,
				uniqueKeyType,
				uniqueKey,
				selectionType,
				'',
				labelKeyType,
			),
		).toStrictEqual([
			{ key: 'b', label: 'a', value: { test: { test: 'b' } } },
			{ key: true, label: 'c', value: { test: { test: true } } },
			{ key: 'f', label: 'e', value: { test: { test: 'f' } } },
			{ key: 'h', label: 'g', value: { test: { test: 'h' } } },
		]);
	});

	test('Object of Lists with index selection', () => {
		const testList = {
			a: [{ a: 'b' }, 'hello'],
			c: [{ a: 'c' }, 'world'],
			e: [{ a: 'd' }, 'earth'],
			g: [{ a: 'e' }, 'mars'],
		};
		const dataType = 'OBJECT_OF_LISTS';
		const uniqueKeyType = 'INDEX';
		const selectionType = 'OBJECT';
		const labelKeyType = 'INDEX';

		expect(
			getRenderData(testList, dataType, uniqueKeyType, '', selectionType, '', labelKeyType),
		).toStrictEqual([
			{ key: 'a', label: 'a', value: [{ a: 'b' }, 'hello'] },
			{ key: 'c', label: 'c', value: [{ a: 'c' }, 'world'] },
			{ key: 'e', label: 'e', value: [{ a: 'd' }, 'earth'] },
			{ key: 'g', label: 'g', value: [{ a: 'e' }, 'mars'] },
		]);
	});

	test('Object of Lists with key selection', () => {
		const testList = {
			a: [{ a: 'b' }, 'hello'],
			c: [{ a: 'c' }, 'world'],
			e: [{ a: 'd' }, 'earth'],
			g: [{ a: 'e' }, 'mars'],
		};
		const dataType = 'OBJECT_OF_LISTS';
		const uniqueKeyType = 'KEY';
		const uniqueKey = '0.a';
		const selectionType = 'KEY';
		const selectionKey = '0.a';
		const labelKeyType = 'INDEX';

		expect(
			getRenderData(
				testList,
				dataType,
				uniqueKeyType,
				uniqueKey,
				selectionType,
				selectionKey,
				labelKeyType,
			),
		).toStrictEqual([
			{ key: 'b', label: 'a', value: 'b' },
			{ key: 'c', label: 'c', value: 'c' },
			{ key: 'd', label: 'e', value: 'd' },
			{ key: 'e', label: 'g', value: 'e' },
		]);
	});

	test('Object of Lists with Object selection', () => {
		const testList = {
			a: [{ a: 'b' }, 'hello'],
			c: [{ a: 'c' }, 'world'],
			e: [{ a: 'd' }, 'earth'],
			g: [{ a: 'e' }, 'mars'],
		};
		const dataType = 'OBJECT_OF_LISTS';
		const uniqueKeyType = 'KEY';
		const uniqueKey = '0.a';
		const selectionType = 'OBJECT';
		const labelKeyType = 'INDEX';

		expect(
			getRenderData(
				testList,
				dataType,
				uniqueKeyType,
				uniqueKey,
				selectionType,
				'',
				labelKeyType,
			),
		).toStrictEqual([
			{ key: 'b', label: 'a', value: [{ a: 'b' }, 'hello'] },
			{ key: 'c', label: 'c', value: [{ a: 'c' }, 'world'] },
			{ key: 'd', label: 'e', value: [{ a: 'd' }, 'earth'] },
			{ key: 'e', label: 'g', value: [{ a: 'e' }, 'mars'] },
		]);
	});
});
