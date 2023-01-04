import { getSelectedKeys } from '../../../src/components/util/getSelectedKeys';

describe('Tests for getSelectedKeys', () => {
	test('Single Select - Object - Key', () => {
		const data = [
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
		];
		const selected = { name: 'Kiran', id: 6, department: 'IT' };

		expect(getSelectedKeys(data, selected)).toStrictEqual(6);
	});

	test('Multiple Select - Object - Key', () => {
		const data = [
			{ key: 'b', label: 'a', value: [{ a: 'b' }, 'hello'] },
			{ key: 'c', label: 'c', value: [{ a: 'c' }, 'world'] },
			{ key: 'd', label: 'e', value: [{ a: 'd' }, 'earth'] },
			{ key: 'e', label: 'g', value: [{ a: 'e' }, 'mars'] },
		];
		const selected = [
			[{ a: 'b' }, 'hello'],
			[{ a: 'c' }, 'world'],
		];

		expect(getSelectedKeys(data, selected, true)).toStrictEqual(['b', 'c']);
	});

	test('Multiple Select set to false - Object - Key - should return undefined', () => {
		const data = [
			{ key: 'b', label: 'a', value: [{ a: 'b' }, 'hello'] },
			{ key: 'c', label: 'c', value: [{ a: 'c' }, 'world'] },
			{ key: 'd', label: 'e', value: [{ a: 'd' }, 'earth'] },
			{ key: 'e', label: 'g', value: [{ a: 'e' }, 'mars'] },
		];
		const selected = [
			[{ a: 'b' }, 'hello'],
			[{ a: 'c' }, 'world'],
		];

		expect(getSelectedKeys(data, selected, false)).toStrictEqual(undefined);
	});

	test('Single Select but multiple select is set to true - Object - Key - should return []', () => {
		const data = [
			{ key: 'b', label: 'a', value: [{ a: 'b' }, 'hello'] },
			{ key: 'c', label: 'c', value: [{ a: 'c' }, 'world'] },
			{ key: 'd', label: 'e', value: [{ a: 'd' }, 'earth'] },
			{ key: 'e', label: 'g', value: [{ a: 'e' }, 'mars'] },
		];
		const selected = [{ a: 'b' }, 'hello'];

		expect(getSelectedKeys(data, selected, true)).toStrictEqual([]);
	});
});
