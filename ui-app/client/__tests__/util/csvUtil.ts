import fs from 'fs';
import { ToArray } from '../../src/util/csvUtil';

test('CSV Util', () => {
	//CSV parsing Testcase
	expect(ToArray(``)).toMatchObject([]);

	expect(ToArray(`a,b,c`)).toMatchObject([['a', 'b', 'c']]);
	expect(ToArray(`a,b,c\n1,2,3`)).toMatchObject([
		['a', 'b', 'c'],
		['1', '2', '3'],
	]);
	expect(ToArray(`a,b,c\n1,2,3\n4,5,6`)).toMatchObject([
		['a', 'b', 'c'],
		['1', '2', '3'],
		['4', '5', '6'],
	]);

	//CSV parsing with quotes Testcase
	expect(ToArray(`a,b,c\n"1,2,3",4,5`)).toMatchObject([
		['a', 'b', 'c'],
		['1,2,3', '4', '5'],
	]);
	expect(ToArray(`a,b,c\n"1,2,3",4,5\n6,7,8`)).toMatchObject([
		['a', 'b', 'c'],
		['1,2,3', '4', '5'],
		['6', '7', '8'],
	]);
	expect(ToArray(`a,b,c\n"1,2,3",4,5\n6,7,8\n9,10,11`)).toMatchObject([
		['a', 'b', 'c'],
		['1,2,3', '4', '5'],
		['6', '7', '8'],
		['9', '10', '11'],
	]);

	//CSV parsing with quotes and newlines Testcase
	expect(ToArray(`a,b,c\n"1,2,3",4,5\n6,7,8\n9,10,11\n"12\n13",14,15`)).toMatchObject([
		['a', 'b', 'c'],
		['1,2,3', '4', '5'],
		['6', '7', '8'],
		['9', '10', '11'],
		['12\n13', '14', '15'],
	]);
	expect(ToArray(`a,b,c\n"1,2,3",4,5\n6,7,8\n9,10,11\n"12\n13",14,15\n16,17,18`)).toMatchObject([
		['a', 'b', 'c'],
		['1,2,3', '4', '5'],
		['6', '7', '8'],
		['9', '10', '11'],
		['12\n13', '14', '15'],
		['16', '17', '18'],
	]);
	expect(
		ToArray(`a,b,c\n"1,2,3",4,5\n6,7,8\n9,10,11\n"12\n13",14,15\n16,17,18\n19,20,21`),
	).toMatchObject([
		['a', 'b', 'c'],
		['1,2,3', '4', '5'],
		['6', '7', '8'],
		['9', '10', '11'],
		['12\n13', '14', '15'],
		['16', '17', '18'],
		['19', '20', '21'],
	]);

	//CSV parsing with double quotes and newlines and quotes Testcase
	expect(
		ToArray(`"Field","ABC ""XYZ"" PQRS","Field"
"Field","ABC ""XYZ""","Field"
"Field","ABC ""A"" ""B"" TEST","Field"
"Field","ABC 2.5"" ""C"" Test","Field"`),
	).toMatchObject([
		['Field', 'ABC "XYZ" PQRS', 'Field'],
		['Field', 'ABC "XYZ"', 'Field'],
		['Field', 'ABC "A" "B" TEST', 'Field'],
		['Field', 'ABC 2.5" "C" Test', 'Field'],
	]);
});

test('CSV Util - Error', () => {
	expect(() => ToArray(`a,b,c\n"1,2,3,4,5\n6,7,8\n9,10,11\n`)).toThrowError();
});

test('CSV check from files', () => {
	let str = fs.readFileSync('./__tests__/util/csvs/comma_in_quotes.csv', 'utf8');

	expect(ToArray(str)).toMatchObject([
		['first', 'last', 'address', 'city', 'zip'],
		['John', 'Doe', '120 any st.', 'Anytown, WW', '08123'],
	]);

	expect(ToArray(str, true)).toMatchObject([
		{
			address: '120 any st.',
			city: 'Anytown, WW',
			first: 'John',
			last: 'Doe',
			zip: '08123',
		},
	]);

	str = fs.readFileSync('./__tests__/util/csvs/empty_crlf.csv', 'utf8');

	expect(ToArray(str)).toMatchObject([['a', 'b', 'c'], ['1'], ['2', '3', '4']]);

	expect(ToArray(str, true)).toMatchObject([{ a: '1' }, { a: '2', b: '3', c: '4' }]);

	str = fs.readFileSync('./__tests__/util/csvs/empty.csv', 'utf8');

	expect(ToArray(str)).toMatchObject([['a', 'b', 'c'], ['1'], ['2', '3', '4']]);

	expect(ToArray(str, true)).toMatchObject([{ a: '1' }, { a: '2', b: '3', c: '4' }]);

	str = fs.readFileSync('./__tests__/util/csvs/escaped_quotes.csv', 'utf8');

	expect(ToArray(str)).toMatchObject([
		['a', 'b'],
		['1', 'ha "ha" ha'],
		['3', '4'],
	]);

	expect(ToArray(str, true)).toMatchObject([
		{ a: '1', b: 'ha "ha" ha' },
		{ a: '3', b: '4' },
	]);

	str = fs.readFileSync('./__tests__/util/csvs/json.csv', 'utf8');
	expect(ToArray(str)).toMatchObject([
		['key', 'val'],
		['1', '{"type": "Point", "coordinates": [102.0, 0.5]}'],
	]);

	expect(ToArray(str, true)).toMatchObject([
		{ key: '1', val: '{"type": "Point", "coordinates": [102.0, 0.5]}' },
	]);

	str = fs.readFileSync('./__tests__/util/csvs/newlines_crlf.csv', 'utf8');
	expect(ToArray(str)).toMatchObject([
		['a', 'b', 'c'],
		['1', '2', '3'],
		['Once upon \r\na time', '5', '6'],
		['7', '8', '9'],
	]);

	expect(ToArray(str, true)).toMatchObject([
		{ a: '1', b: '2', c: '3' },
		{ a: 'Once upon \r\na time', b: '5', c: '6' },
		{ a: '7', b: '8', c: '9' },
	]);

	str = fs.readFileSync('./__tests__/util/csvs/newlines.csv', 'utf8');
	expect(ToArray(str)).toMatchObject([
		['a', 'b', 'c'],
		['1', '2', '3'],
		['Once upon \na time', '5', '6'],
		['7', '8', '9'],
	]);

	expect(ToArray(str, true)).toMatchObject([
		{ a: '1', b: '2', c: '3' },
		{ a: 'Once upon \na time', b: '5', c: '6' },
		{ a: '7', b: '8', c: '9' },
	]);

	str = fs.readFileSync('./__tests__/util/csvs/quotes_and_newlines.csv', 'utf8');
	expect(ToArray(str)).toMatchObject([
		['a', 'b'],
		['1', 'ha \n"ha" \nha'],
		['3', '4'],
	]);

	expect(ToArray(str, true)).toMatchObject([
		{ a: '1', b: 'ha \n"ha" \nha' },
		{ a: '3', b: '4' },
	]);

	str = fs.readFileSync('./__tests__/util/csvs/simple_crlf.csv', 'utf8');
	expect(ToArray(str)).toMatchObject([
		['a', 'b', 'c'],
		['1', '2', '3'],
	]);

	expect(ToArray(str, true)).toMatchObject([{ a: '1', b: '2', c: '3' }]);

	str = fs.readFileSync('./__tests__/util/csvs/simple.csv', 'utf8');
	expect(ToArray(str)).toMatchObject([
		['a', 'b', 'c'],
		['1', '2', '3'],
	]);

	expect(ToArray(str, true)).toMatchObject([{ a: '1', b: '2', c: '3' }]);

	str = fs.readFileSync('./__tests__/util/csvs/utf8.csv', 'utf8');
	expect(ToArray(str)).toMatchObject([
		['a', 'b', 'c'],
		['1', '2', '3'],
		['4', '5', 'ʤ'],
	]);

	expect(ToArray(str, true)).toMatchObject([
		{ a: '1', b: '2', c: '3' },
		{ a: '4', b: '5', c: 'ʤ' },
	]);
});

test('Tsv Check', () => {
	let str = fs.readFileSync('./__tests__/util/tsvs/comma_in_quotes.tsv', 'utf8');

	expect(ToArray(str, false, '\t')).toMatchObject([
		['first', 'last', 'address', 'city', 'zip'],
		['John', 'Doe', '120 any st.', 'Anytown\t WW', '08123'],
	]);

	expect(ToArray(str, true, '\t')).toMatchObject([
		{
			address: '120 any st.',
			city: 'Anytown\t WW',
			first: 'John',
			last: 'Doe',
			zip: '08123',
		},
	]);

	let lists = [
		[
			'This line and the following should be skipped. The third is ignored automatically because it is blank',
		],
		undefined,
		undefined,
		['Year', 'Make', 'Model', 'Description', 'Price'],
		['1997', 'Ford', 'E350', 'ac, abs, moon', '3000.00'],
		['1999', 'Chevy', 'Venture Extended Edition', undefined, '4900.00'],
		['#this is a comment and should be ignored'],
		['1996', 'Jeep', 'Grand Cherokee', 'MUST SELL!\\nair, moon roof, loaded', '4799.00'],
		['-->skipping this line (10) as well'],
		['1999', 'Chevy', 'Venture Extended Edition, Very Large', undefined, '5000.00'],
		[undefined, undefined, 'Venture Extended Edition', undefined, '4900.00'],
		undefined,
		[' ', ' ', ' ', ' ', ' '],
		[undefined, undefined, ' 5 '],
		['  '],
		['1997 ', ' Ford ', 'E350', 'ac, abs, moon\\t', ' 3000.00 \\t'],
		['1997', ' Ford ', 'E350', ' ac, abs, moon \\t', '3000.00  \\t'],
		['  1997', ' Ford ', 'E350', ' ac, abs, moon \\t', '3000.00'],
		['    19 97 ', ' Fo rd ', 'E350', ' ac, abs, moon \\t', '3000.00'],
		['\\t\\t', ' ', '  ', '   \\t', '30 00.00\\t'],
		['1997', 'Ford', 'E350', '  ac, abs, moon  ', '3000.00'],
		['1997', 'Ford', 'E350', ' ac, abs, moon  ', '3000.00'],
	];

	str = fs.readFileSync('./__tests__/util/tsvs/essential.tsv', 'utf8');
	expect(ToArray(str, false, '\t')).toMatchObject(lists);

	str = fs.readFileSync('./__tests__/util/tsvs/essential-dos.tsv', 'utf8');
	expect(ToArray(str, false, '\t')).toMatchObject(lists);
});
