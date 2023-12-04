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
			{ key: 'Raja', label: 'Raja', value: 'Raja', originalObjectKey: 0 },
			{ key: 'Avinash', label: 'Avinash', value: 'Avinash', originalObjectKey: 1 },
			{ key: 'Alli', label: 'Alli', value: 'Alli', originalObjectKey: 2 },
			{ key: 'Akhilesh', label: 'Akhilesh', value: 'Akhilesh', originalObjectKey: 3 },
			{ key: 'Surendhar', label: 'Surendhar', value: 'Surendhar', originalObjectKey: 4 },
			{ key: 'Kiran', label: 'Kiran', value: 'Kiran', originalObjectKey: 5 },
		]);
	});

	test('List of Strings with selection as index', () => {
		const testList = ['Raja', 'Avinash', 'Alli', 'Akhilesh', 'Surendhar', 'Kiran'];
		const dataType = 'LIST_OF_STRINGS';
		const uniqueKeyType = 'OBJECT';
		const selectionType = 'INDEX';
		expect(getRenderData(testList, dataType, uniqueKeyType, '', selectionType)).toStrictEqual([
			{ key: 'Raja', label: 'Raja', value: 0, originalObjectKey: 0 },
			{ key: 'Avinash', label: 'Avinash', value: 1, originalObjectKey: 1 },
			{ key: 'Alli', label: 'Alli', value: 2, originalObjectKey: 2 },
			{ key: 'Akhilesh', label: 'Akhilesh', value: 3, originalObjectKey: 3 },
			{ key: 'Surendhar', label: 'Surendhar', value: 4, originalObjectKey: 4 },
			{ key: 'Kiran', label: 'Kiran', value: 5, originalObjectKey: 5 },
		]);
	});

	test('List of Strings with uniquekey as index', () => {
		const testList = ['Raja', 'Avinash', 'Alli', 'Akhilesh', 'Surendhar', 'Kiran'];
		const dataType = 'LIST_OF_STRINGS';
		const uniqueKeyType = 'INDEX';
		const selectionType = 'INDEX';
		expect(getRenderData(testList, dataType, uniqueKeyType, '', selectionType)).toStrictEqual([
			{ key: 0, label: 'Raja', value: 0, originalObjectKey: 0 },
			{ key: 1, label: 'Avinash', value: 1, originalObjectKey: 1 },
			{ key: 2, label: 'Alli', value: 2, originalObjectKey: 2 },
			{ key: 3, label: 'Akhilesh', value: 3, originalObjectKey: 3 },
			{ key: 4, label: 'Surendhar', value: 4, originalObjectKey: 4 },
			{ key: 5, label: 'Kiran', value: 5, originalObjectKey: 5 },
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
			{ key: 1, label: 'Raja', value: 'IT', originalObjectKey: 0 },
			{ key: 2, label: 'Avinash', value: 'CS', originalObjectKey: 1 },
			{ key: 3, label: 'Alli', value: 'EE', originalObjectKey: 2 },
			{ key: 4, label: 'Akhilesh', value: 'EC', originalObjectKey: 3 },
			{ key: 5, label: 'Surendhar', value: 'IT', originalObjectKey: 4 },
			{ key: 6, label: 'Kiran', value: 'IT', originalObjectKey: 5 },
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
				originalObjectKey: 0,
			},
			{
				key: 2,
				label: 'Avinash',
				value: { name: 'Avinash', id: 2, department: 'CS' },
				originalObjectKey: 1,
			},
			{
				key: 3,
				label: 'Alli',
				value: { name: 'Alli', id: 3, department: 'EE' },
				originalObjectKey: 2,
			},
			{
				key: 4,
				label: 'Akhilesh',
				value: { name: 'Akhilesh', id: 4, department: 'EC' },
				originalObjectKey: 3,
			},
			{
				key: 5,
				label: 'Surendhar',
				value: { name: 'Surendhar', id: 5, department: 'IT' },
				originalObjectKey: 4,
			},
			{
				key: 6,
				label: 'Kiran',
				value: { name: 'Kiran', id: 6, department: 'IT' },
				originalObjectKey: 5,
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
				originalObjectKey: 0,
			},
			{
				name: 'Avinash',
				id: 2,
				department: 'CS',
				links: { a: { b: 'c' } },
				originalObjectKey: 1,
			},
			{
				name: 'Alli',
				id: 3,
				department: 'EE',
				links: { a: { b: 'c' } },
				originalObjectKey: 2,
			},
			{
				name: 'Akhilesh',
				id: 4,
				department: 'EC',
				links: { a: { b: 'c' } },
				originalObjectKey: 3,
			},
			{
				name: 'Surendhar',
				id: 5,
				department: 'IT',
				links: { a: { b: 'c' } },
				originalObjectKey: 4,
			},
			{
				name: 'Kiran',
				id: 6,
				department: 'IT',
				links: { a: { b: 'c' } },
				originalObjectKey: 5,
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
			{ key: 1, label: 'Raja', value: 'c', originalObjectKey: 0 },
			{ key: 2, label: 'Avinash', value: 'c', originalObjectKey: 1 },
			{ key: 3, label: 'Alli', value: 'c', originalObjectKey: 2 },
			{ key: 4, label: 'Akhilesh', value: 'c', originalObjectKey: 3 },
			{ key: 5, label: 'Surendhar', value: 'c', originalObjectKey: 4 },
			{ key: 6, label: 'Kiran', value: 'c', originalObjectKey: 5 },
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
			{ key: 'c', label: 'Raja', value: 'c', originalObjectKey: 0 },
			{ key: 'c', label: 'Avinash', value: 'c', originalObjectKey: 1 },
			{ key: 'c', label: 'Alli', value: 'c', originalObjectKey: 2 },
			{ key: 'c', label: 'Akhilesh', value: 'c', originalObjectKey: 3 },
			{ key: 'c', label: 'Surendhar', value: 'c', originalObjectKey: 4 },
			{ key: 'c', label: 'Kiran', value: 'c', originalObjectKey: 5 },
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
			{ key: 1, label: 'Raja', value: 'c', originalObjectKey: 0 },
			{ key: 2, label: 'Avinash', value: 'c', originalObjectKey: 1 },
			{ key: 3, label: 'Alli', value: 'c', originalObjectKey: 2 },
			{ key: 4, label: 'Akhilesh', value: 'c', originalObjectKey: 3 },
			{ key: 5, label: 'Surendhar', value: 'c', originalObjectKey: 4 },
			{ key: 6, label: 'Kiran', value: 'c', originalObjectKey: 5 },
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
			{ key: 'b', label: 'b', value: 'b', originalObjectKey: 'a' },
			{ key: true, label: true, value: true, originalObjectKey: 'c' },
			{ key: 'f', label: 'f', value: 'f', originalObjectKey: 'e' },
			{ key: 'h', label: 'h', value: 'h', originalObjectKey: 'g' },
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
			{ key: 'a', label: 'a', value: 'a', originalObjectKey: 'a' },
			{ key: 'c', label: 'c', value: 'c', originalObjectKey: 'c' },
			{ key: 'e', label: 'e', value: 'e', originalObjectKey: 'e' },
			{ key: 'g', label: 'g', value: 'g', originalObjectKey: 'g' },
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
			{ key: 'a', label: 'a', value: 'a', originalObjectKey: 'a' },
			{ key: 'c', label: 'c', value: 'c', originalObjectKey: 'c' },
			{ key: 'e', label: 'e', value: 'e', originalObjectKey: 'e' },
			{ key: 'g', label: 'g', value: 'g', originalObjectKey: 'g' },
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
			{ key: 'b', label: 'a', value: 'a', originalObjectKey: 'a' },
			{ key: true, label: 'c', value: 'c', originalObjectKey: 'c' },
			{ key: 'f', label: 'e', value: 'e', originalObjectKey: 'e' },
			{ key: 'h', label: 'g', value: 'g', originalObjectKey: 'g' },
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
			{ key: 'b', label: 'a', value: { test: { test: 'b' } }, originalObjectKey: 'a' },
			{ key: true, label: 'c', value: { test: { test: true } }, originalObjectKey: 'c' },
			{ key: 'f', label: 'e', value: { test: { test: 'f' } }, originalObjectKey: 'e' },
			{ key: 'h', label: 'g', value: { test: { test: 'h' } }, originalObjectKey: 'g' },
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
			{ key: 'a', label: 'a', value: [{ a: 'b' }, 'hello'], originalObjectKey: 'a' },
			{ key: 'c', label: 'c', value: [{ a: 'c' }, 'world'], originalObjectKey: 'c' },
			{ key: 'e', label: 'e', value: [{ a: 'd' }, 'earth'], originalObjectKey: 'e' },
			{ key: 'g', label: 'g', value: [{ a: 'e' }, 'mars'], originalObjectKey: 'g' },
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
			{ key: 'b', label: 'a', value: 'b', originalObjectKey: 'a' },
			{ key: 'c', label: 'c', value: 'c', originalObjectKey: 'c' },
			{ key: 'd', label: 'e', value: 'd', originalObjectKey: 'e' },
			{ key: 'e', label: 'g', value: 'e', originalObjectKey: 'g' },
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
			{ key: 'b', label: 'a', value: [{ a: 'b' }, 'hello'], originalObjectKey: 'a' },
			{ key: 'c', label: 'c', value: [{ a: 'c' }, 'world'], originalObjectKey: 'c' },
			{ key: 'd', label: 'e', value: [{ a: 'd' }, 'earth'], originalObjectKey: 'e' },
			{ key: 'e', label: 'g', value: [{ a: 'e' }, 'mars'], originalObjectKey: 'g' },
		]);
	});
});
