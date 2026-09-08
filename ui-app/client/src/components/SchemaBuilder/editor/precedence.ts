import { isNullValue } from '@fincity/kirun-js';

/**
 * What the KIRun runtime actually does with a schema, encoded once.
 *
 * `SchemaValidator.validate` evaluates a node in a fixed order and several keywords return
 * early, so a schema can carry settings the runtime never looks at. The editor used to guess at
 * that order and had it backwards in both directions: it hid the constraint sections whenever
 * `ref` was set (they are still enforced) and left them visible when `enums` was set (they are
 * not). Everything here mirrors the validator line for line so the tree and the details card can
 * show every keyword and say which ones are inert.
 *
 * SchemaValidator.validate:
 *   1. defaultValue  returns the default, but only when the value is null
 *   2. constant      returns
 *   3. enums         returns
 *   4. format        throws when no type is set
 *   5. type          TypeValidator applies that type's own constraints
 *   6. ref           runs AFTER step 5, then returns the referenced schema's result
 *   7. anyOf / oneOf / allOf, then not
 */

export type KeywordGroup =
	'type' | 'string' | 'number' | 'object' | 'array' | 'composition' | 'ref' | 'enums';

export interface InertFinding {
	group: KeywordGroup;
	overriddenBy: 'constant' | 'enums' | 'ref';
	reason: string;
}

export interface SchemaWarning {
	keyword: string;
	message: string;
}

/**
 * The keywords each details section owns, used both to decide whether a section opens by
 * default and to build the compact row's chips.
 *
 * `items` is deliberately absent from `array`: every array node in the tree has `items`, so
 * including it would make the section unconditionally open and the derivation meaningless.
 */
export const SECTION_KEYWORDS: Record<string, string[]> = {
	general: ['defaultValue', 'ref', 'enums', 'constant', 'description', 'comment'],
	string: ['minLength', 'maxLength', 'format', 'pattern'],
	number: ['multipleOf', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum'],
	object: [
		'minProperties',
		'maxProperties',
		'additionalProperties',
		'propertyNames',
		'patternProperties',
	],
	array: [
		'minItems',
		'maxItems',
		'uniqueItems',
		'additionalItems',
		'contains',
		'minContains',
		'maxContains',
	],
	composition: ['anyOf', 'oneOf', 'allOf', 'not'],
	examples: ['examples'],
};

/** Formats that StringValidator checks INSTEAD of `pattern`, per its if/else cascade. */
const PATTERN_SHADOWING_FORMATS = new Set(['DATETIME', 'TIME', 'DATE', 'EMAIL']);

const CONSTANT_KILLS: KeywordGroup[] = [
	'type',
	'string',
	'number',
	'object',
	'array',
	'composition',
	'ref',
	'enums',
];

const ENUM_KILLS: KeywordGroup[] = [
	'type',
	'string',
	'number',
	'object',
	'array',
	'composition',
	'ref',
];

const CONSTANT_REASON =
	'A constant value is set, so validation returns that value. Nothing else on this field is evaluated.';
const ENUM_REASON =
	'Allowed values are set, so validation only checks membership. Nothing else on this field is evaluated.';
const REF_REASON =
	'A reference is set, so validation returns after resolving it. anyOf, oneOf, allOf and not are never reached.';

/**
 * Whether a keyword carries a real setting. `false` counts as set (`additionalProperties: false`
 * and `uniqueItems: false` are both deliberate), but an empty string, array or object does not.
 */
export function isSet(v: any): boolean {
	if (isNullValue(v)) return false;
	if (Array.isArray(v)) return v.length > 0;
	if (typeof v === 'string') return v.length > 0;
	if (typeof v === 'object') return Object.keys(v).length > 0;
	return true;
}

export function hasAny(schema: any, keys: string[]): boolean {
	if (!schema || typeof schema !== 'object') return false;
	return keys.some(k => isSet(schema[k]));
}

/** A schema root has to be a JSON object. Guards the JSON view and the binding write. */
export function isSchemaObject(v: any): boolean {
	return !isNullValue(v) && typeof v === 'object' && !Array.isArray(v);
}

/**
 * The keyword groups this node declares that the runtime will never reach, with the reason to
 * show. An empty map means everything set on the node is live.
 */
export function inertGroups(schema: any): Map<KeywordGroup, InertFinding> {
	const out = new Map<KeywordGroup, InertFinding>();
	if (!schema || typeof schema !== 'object') return out;

	const mark = (groups: KeywordGroup[], by: InertFinding['overriddenBy'], reason: string) => {
		for (const group of groups) out.set(group, { group, overriddenBy: by, reason });
	};

	if (!isNullValue(schema.constant)) {
		mark(CONSTANT_KILLS, 'constant', CONSTANT_REASON);
		return out;
	}

	if (schema.enums?.length) {
		mark(ENUM_KILLS, 'enums', ENUM_REASON);
		return out;
	}

	// A ref is followed only after this node's own type and constraints have been applied, so
	// those stay live. Only the composition keywords sit past the return.
	if (isSet(schema.ref) && typeof schema.ref === 'string' && schema.ref.trim())
		mark(['composition'], 'ref', REF_REASON);

	return out;
}

/** Authoring mistakes that make the schema throw, or make it unsatisfiable. */
export function schemaWarnings(schema: any): SchemaWarning[] {
	if (!schema || typeof schema !== 'object') return [];

	const out: SchemaWarning[] = [];

	if (isSet(schema.format) && isNullValue(schema.type))
		out.push({
			keyword: 'format',
			message: 'A format needs a type. Validation throws until one is set.',
		});

	if (isSet(schema.pattern) && PATTERN_SHADOWING_FORMATS.has(String(schema.format).toUpperCase()))
		out.push({
			keyword: 'pattern',
			message: `The ${schema.format} format is checked instead of this pattern.`,
		});

	const inverted: Array<[string, string, string]> = [
		['minLength', 'maxLength', 'length'],
		['minimum', 'maximum', 'value'],
		['minItems', 'maxItems', 'item count'],
		['minProperties', 'maxProperties', 'property count'],
		['minContains', 'maxContains', 'contains count'],
	];

	for (const [minKey, maxKey, label] of inverted) {
		const min = schema[minKey];
		const max = schema[maxKey];
		if (typeof min === 'number' && typeof max === 'number' && min > max)
			out.push({
				keyword: minKey,
				message: `No value can pass: ${minKey} (${min}) is above ${maxKey} (${max}) for ${label}.`,
			});
	}

	return out;
}
