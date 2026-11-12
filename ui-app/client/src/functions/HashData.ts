import {
	AbstractFunction,
	Event,
	EventResult,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	KIRuntimeException,
	Parameter,
	Schema,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';

/**
 * UIEngine.HashData: the browser twin of core's `CoreServices.Hash.HashData` (same parameter names, defaults and
 * output `result`, lower case hex). Digests go through Web Crypto, so only the algorithms browsers have natively are
 * offered: SHA-256 (default), SHA-384, SHA-512 and SHA-1. MD5, MD2 and MD4 are refused with a plain error.
 *
 * One generalisation over core: an array is hashed element by element (nested arrays keep their shape), so a page
 * hashes a whole column, or a whole batch of rows, in ONE call.
 *
 * One deliberate difference: a text is hashed as its own UTF-8 bytes. Core hashes a string's JSON form, quotes
 * included (`"abc"`, a Java JsonElement.toString() legacy), which no ad platform or other system expects.
 */

const ALGORITHMS = ['SHA-256', 'SHA-384', 'SHA-512', 'MD5', 'MD2', 'MD4', 'SHA-1'];

const WEB_CRYPTO: Record<string, string> = {
	'SHA-256': 'SHA-256',
	SHA256: 'SHA-256',
	'SHA-384': 'SHA-384',
	SHA384: 'SHA-384',
	'SHA-512': 'SHA-512',
	SHA512: 'SHA-512',
	'SHA-1': 'SHA-1',
	SHA1: 'SHA-1',
	SHA: 'SHA-1',
};

/** Values hashed at a time; keeps the number of pending digests bounded on a 200,000 value column. */
const CHUNK = 4096;

const HEX = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));

function hex(buf: ArrayBuffer): string {
	const b = new Uint8Array(buf);
	let s = '';
	for (let i = 0; i < b.length; i++) s += HEX[b[i]];
	return s;
}

/** The Web Crypto name of an algorithm, or an error that says why it cannot be used here. */
function webCryptoAlgorithm(algorithm: unknown): string {
	const name = typeof algorithm === 'string' ? algorithm.trim() : '';
	if (!name) throw new KIRuntimeException('Algorithm cannot be null or empty');
	const wc = WEB_CRYPTO[name.toUpperCase()];
	if (wc) return wc;
	if (ALGORITHMS.includes(name.toUpperCase()))
		throw new KIRuntimeException(
			`Hash algorithm not supported in the browser: ${name}. Use SHA-256, SHA-384, SHA-512 or SHA-1 (core's CoreServices.Hash.HashData has ${name}).`,
		);
	throw new KIRuntimeException(`Hash algorithm not supported: ${name}`);
}

/** The text a value is hashed as: a string as itself, null as "null" (as core), anything else as its JSON. */
function textOf(v: any): string {
	if (v === undefined || v === null) return 'null';
	if (typeof v === 'string') return v;
	if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint') return String(v);
	return JSON.stringify(v);
}

class Hasher {
	private readonly cache = new Map<string, Promise<string>>();
	private readonly encoder = new TextEncoder();

	constructor(
		private readonly subtle: SubtleCrypto,
		private readonly algorithm: string,
	) {}

	text(s: string): Promise<string> {
		let p = this.cache.get(s);
		if (!p) {
			p = this.subtle.digest(this.algorithm, this.encoder.encode(s)).then(hex);
			this.cache.set(s, p);
		}
		return p;
	}

	/** Same shape back: arrays element by element, objects by key and value when primitiveLevel. */
	async value(v: any, primitiveLevel: boolean): Promise<any> {
		if (Array.isArray(v)) return this.array(v, primitiveLevel);
		if (primitiveLevel && v !== null && typeof v === 'object') {
			const out: Record<string, any> = {};
			for (const [k, x] of Object.entries(v))
				out[await this.text(k)] = await this.value(x, primitiveLevel);
			return out;
		}
		return this.text(textOf(v));
	}

	private async array(a: any[], primitiveLevel: boolean): Promise<any[]> {
		const out = new Array(a.length);
		for (let i = 0; i < a.length; i += CHUNK) {
			const end = Math.min(a.length, i + CHUNK);
			const part: Promise<any>[] = [];
			for (let j = i; j < end; j++) part.push(this.value(a[j], primitiveLevel));
			const done = await Promise.all(part);
			for (let j = i; j < end; j++) out[j] = done[j - i];
		}
		return out;
	}
}

// Only the class may be exported from this file: functions/index.ts instantiates every export of all.ts.
async function hashData(data: any, algorithm: string = 'SHA-256', primitiveLevel = false) {
	const wc = webCryptoAlgorithm(algorithm);
	const subtle = globalThis.crypto?.subtle;
	if (!subtle)
		throw new KIRuntimeException(
			'This browser cannot hash: Web Crypto is missing (it needs https and a current browser).',
		);
	return new Hasher(subtle, wc).value(data, primitiveLevel);
}

const SIGNATURE = new FunctionSignature('HashData')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('data', Schema.ofAny('data')),
			Parameter.ofEntry(
				'algorithm',
				Schema.ofString('algorithm').setEnums(ALGORITHMS).setDefaultValue('SHA-256'),
			),
			Parameter.ofEntry(
				'primitiveLevel',
				Schema.ofBoolean('primitiveLevel').setDefaultValue(false),
			),
		]),
	)
	.setEvents(new Map([Event.outputEventMapEntry(new Map([['result', Schema.ofAny('result')]]))]))
	.setDescription(
		'Hashes a text, or every text of an array in one call, in the browser (lower case hex), like CoreServices.Hash.HashData',
	)
	.setDocumentation(
		'# UIEngine.HashData\n\nThe browser twin of `CoreServices.Hash.HashData`: same parameters, same `result`, lower case hex. Nothing leaves the browser.\n\n## Parameters\n\n- **data** (Any): a text, or an array of texts (arrays inside arrays keep their shape). An array answers an array of hashes in the same order, so a whole column or a whole batch of rows is hashed in ONE call. A number or true / false is hashed as its text, a missing value as `null`, an object as its JSON text\n- **algorithm** (String, default SHA-256): SHA-256, SHA-384, SHA-512 or SHA-1 (Web Crypto). MD5, MD2 and MD4 are refused here: use the core function for those\n- **primitiveLevel** (Boolean, default false): with true, an object\'s keys and values are hashed one by one, as core does\n\n## Events\n\n- **output**\n  - `result`: the hash (64 hex characters for SHA-256), or the array of hashes\n\n## Difference from core\n\nA text is hashed as its own UTF-8 bytes: `abc` hashes `abc`. Core hashes a string\'s JSON form, quotes included (`"abc"`), so core and browser hashes of the same text differ. An empty text hashes to the hash of an empty text (for SHA-256 e3b0c442...b855); a page that needs an empty cell to stay empty replaces that value.',
	);

export class HashData extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const args = context.getArguments();
		const result = await hashData(
			args?.get('data'),
			args?.get('algorithm') ?? 'SHA-256',
			args?.get('primitiveLevel') === true,
		);
		return new FunctionOutput([EventResult.outputOf(new Map([['result', result]]))]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
