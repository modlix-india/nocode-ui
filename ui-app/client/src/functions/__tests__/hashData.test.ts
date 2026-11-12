import { FunctionExecutionParameters } from '@fincity/kirun-js';
import { webcrypto } from 'crypto';
import { TextEncoder as NodeTextEncoder } from 'util';
import { HashData } from '../HashData';

// jsdom has no Web Crypto digest; Node's is the same implementation browsers expose.
beforeAll(() => {
	Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
	if (!(globalThis as any).TextEncoder) (globalThis as any).TextEncoder = NodeTextEncoder;
});

// internalExecute rather than execute: the latter validates arguments against a schema
// repository that only a running engine supplies, and the logic under test is all in here.
async function run(data: any, algorithm?: string, primitiveLevel?: boolean) {
	const args = new Map<string, any>([['data', data]]);
	if (algorithm !== undefined) args.set('algorithm', algorithm);
	if (primitiveLevel !== undefined) args.set('primitiveLevel', primitiveLevel);
	const context = { getArguments: () => args } as FunctionExecutionParameters;
	const out = await (new HashData() as any).internalExecute(context);
	const r = out.allResults()[0];
	expect(r.getName()).toBe('output');
	return r.getResult().get('result');
}

const EMPTY_256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const ABC_256 = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';

describe('UIEngine.HashData', () => {
	test('signature mirrors CoreServices.Hash.HashData', () => {
		const sig = new HashData().getSignature();
		expect(sig.getFullName()).toBe('UIEngine.HashData');
		expect(Array.from(sig.getParameters().keys())).toEqual([
			'data',
			'algorithm',
			'primitiveLevel',
		]);
		expect(sig.getParameters().get('algorithm')!.getSchema().getDefaultValue()).toBe('SHA-256');
		expect(sig.getParameters().get('primitiveLevel')!.getSchema().getDefaultValue()).toBe(
			false,
		);
		expect(Array.from(sig.getEvents().get('output')!.getParameters().keys())).toEqual([
			'result',
		]);
	});

	test('known SHA-256 vectors, lower case hex; SHA-256 is the default', async () => {
		expect(await run('')).toBe(EMPTY_256);
		expect(await run('abc')).toBe(ABC_256);
		expect(await run('abc', 'SHA-256')).toBe(ABC_256);
		expect(await run('abc', 'sha256')).toBe(ABC_256);
	});

	test('unicode text is hashed as its UTF-8 bytes', async () => {
		expect(await run('é')).toBe(
			'4a99557e4033c3539de2eb65472017cad5f9557f7a0625a09f1c3f6e2ba69c4c',
		);
		expect(await run('café')).toBe(
			'850f7dc43910ff890f8879c0ed26fe697c93a067ad93a7d50f466a7028a9bf4e',
		);
		expect(await run('日本')).toBe(
			'cf2abf0c5be326cb922a70f8163f91079c4d9aa8655c60ead89ad545c9de2e92',
		);
		expect(await run('\u{1F333}')).toBe(
			'5af3c1a8aa660fab6c1ff1c61febd348ab3529e86fec4762467f682339bef201',
		);
		// NFC and NFD forms are different bytes, so different hashes: normalising is the caller's job
		expect(await run('café')).not.toBe(await run('café'));
	});

	test('other algorithms', async () => {
		expect(await run('abc', 'SHA-1')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
		expect(await run('abc', 'SHA-384')).toBe(
			'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7',
		);
		expect(await run('abc', 'SHA-512')).toBe(
			'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
		);
	});

	test('an array answers an array of hashes in the same order; nested arrays keep their shape', async () => {
		expect(await run(['abc', '', 'abc'])).toEqual([ABC_256, EMPTY_256, ABC_256]);
		expect(await run([['abc', ''], ['abc']])).toEqual([[ABC_256, EMPTY_256], [ABC_256]]);
		expect(await run([])).toEqual([]);
		const many = Array.from({ length: 10001 }, (_, i) => (i % 2 ? 'abc' : ''));
		const out = await run(many);
		expect(out).toHaveLength(10001);
		expect(out[0]).toBe(EMPTY_256);
		expect(out[10000]).toBe(EMPTY_256);
		expect(out[9999]).toBe(ABC_256);
	});

	test('numbers, booleans and null are hashed as their text, as core does', async () => {
		expect(await run(null)).toBe(await run('null'));
		expect(await run(12)).toBe(await run('12'));
		expect(await run(true)).toBe(await run('true'));
		expect(await run({ a: 1 })).toBe(await run('{"a":1}'));
		expect(await run({ a: 'abc' }, 'SHA-256', true)).toEqual({
			[await run('a')]: ABC_256,
		});
	});

	test('MD5, MD2 and MD4 are refused with a plain error; so is an empty or unknown name', async () => {
		await expect(run('abc', 'MD5')).rejects.toThrow(
			/not supported in the browser: MD5\. Use SHA-256, SHA-384, SHA-512 or SHA-1/,
		);
		await expect(run('abc', 'MD4')).rejects.toThrow(/not supported in the browser: MD4/);
		await expect(run('abc', 'MD2')).rejects.toThrow(/not supported in the browser: MD2/);
		await expect(run('abc', ' ')).rejects.toThrow('Algorithm cannot be null or empty');
		await expect(run('abc', 'WHIRLPOOL')).rejects.toThrow(
			'Hash algorithm not supported: WHIRLPOOL',
		);
	});
});
