import { FunctionExecutionParameters } from '@fincity/kirun-js';
import { CharacterCount } from '../CharacterCount';

// internalExecute rather than execute: the latter validates arguments against a schema
// repository that only a running engine supplies, and the logic under test is all in here.
async function run(values: any, trim?: boolean) {
	const args = new Map<string, any>([['values', values]]);
	if (trim !== undefined) args.set('trim', trim);
	const context = { getArguments: () => args } as FunctionExecutionParameters;
	const out = await (new CharacterCount() as any).internalExecute(context);
	return out.allResults()[0].getResult().get('counts');
}

describe('ADZ-1461: UIEngine.CharacterCount counts an emoji as one character', () => {
	test('an emoji is one character, not two UTF-16 units', async () => {
		const tree = 'Live in nature’s embrace \u{1F333}.';
		expect(tree).toHaveLength(28);
		expect(await run([tree])).toEqual([27]);
	});

	test('trim drops leading and trailing spaces only when asked', async () => {
		expect(await run(['  ab  '], false)).toEqual([6]);
		expect(await run(['  ab  '], true)).toEqual([2]);
	});

	test('missing values count 0, other values count as their text', async () => {
		expect(await run([undefined, null, 1234], true)).toEqual([0, 0, 4]);
	});

	test('one count per value, in order; no list gives no counts', async () => {
		expect(await run(['a\u{1F333}', '', null, ' x '], true)).toEqual([2, 0, 0, 1]);
		expect(await run([' x '])).toEqual([3]);
		expect(await run(undefined)).toEqual([]);
	});
});
