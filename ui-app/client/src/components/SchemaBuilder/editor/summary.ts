import { isNullValue } from '@fincity/kirun-js';
import { InertFinding, inertGroups, isSet, KeywordGroup } from './precedence';

/**
 * The compact row's "what is set on this field" strip.
 *
 * Without it a field carrying a defaultValue, a format, a pattern, a bound or an
 * additionalProperties rule looks exactly like a bare one, and the only way to find out is to
 * open the details card on every row in turn. Chips rather than one run of text, because each
 * one needs its own tooltip and its own inert marking.
 */

export interface SummaryChip {
	key: string;
	text: string;
	title: string;
	group?: KeywordGroup;
	inert?: InertFinding;
	muted?: boolean;
}

export interface RowSummary {
	chips: SummaryChip[];
	hiddenCount: number;
	title: string;
	description?: string;
}

/** Chips beyond this collapse into a single "+N more". */
const MAX_ROW_CHIPS = 6;
/** Identity chips are always shown, never collapsed. */
const ALWAYS_SHOWN = 4;

export function valuePreview(value: any): string {
	if (isNullValue(value)) return '';
	if (Array.isArray(value)) return value.length ? `[Array(${value.length})]` : '[Empty Array]';
	if (typeof value === 'object') return '[Object]';
	const text = typeof value === 'string' ? `"${value}"` : '' + value;
	return text.length > 24 ? `${text.slice(0, 24)}…` : text;
}

/**
 * The readable tail of a ref, mirroring how SchemaUtil resolves one: split at the first `/`,
 * then take everything after the last `.` of the head. So `myapp.Address` reads as `Address`
 * and `myapp.Address/properties/city` as `Address/properties/city`.
 */
export function refShortName(ref: string): string {
	if (!ref) return '';
	if (ref.startsWith('#')) return ref;

	const slash = ref.indexOf('/');
	const head = slash === -1 ? ref : ref.slice(0, slash);
	const tail = slash === -1 ? '' : ref.slice(slash);

	const dot = head.lastIndexOf('.');
	return (dot === -1 ? head : head.slice(dot + 1)) + tail;
}

export function summarize(schema: any): RowSummary {
	if (!schema || typeof schema !== 'object') return { chips: [], hiddenCount: 0, title: '' };

	const inert = inertGroups(schema);
	const all: SummaryChip[] = [];

	const add = (key: string, text: string, title: string, group?: KeywordGroup) => {
		all.push({ key, text, title, group, inert: group ? inert.get(group) : undefined });
	};

	// Identity first: what this field IS, before what constrains it.
	if (isSet(schema.ref))
		add('ref', `→ ${refShortName(String(schema.ref))}`, `ref: ${schema.ref}`, 'ref');
	if (!isNullValue(schema.constant))
		add(
			'constant',
			`= ${valuePreview(schema.constant)}`,
			`constant: ${valuePreview(schema.constant)}`,
		);
	if (!isNullValue(schema.defaultValue))
		add(
			'defaultValue',
			`default ${valuePreview(schema.defaultValue)}`,
			`defaultValue: ${valuePreview(schema.defaultValue)}`,
		);
	if (schema.enums?.length)
		add(
			'enums',
			`enum(${schema.enums.length})`,
			`Allowed values: ${schema.enums.slice(0, 3).map(valuePreview).join(', ')}${
				schema.enums.length > 3 ? ', …' : ''
			}`,
			'enums',
		);

	// String
	if (isSet(schema.format))
		add('format', String(schema.format).toLowerCase(), `format: ${schema.format}`, 'string');
	if (isSet(schema.pattern)) add('pattern', 'pattern', `pattern: ${schema.pattern}`, 'string');
	addRange(add, schema, 'minLength', 'maxLength', 'len', 'Length', 'string');

	// Number
	addRange(add, schema, 'minimum', 'maximum', '', 'Value', 'number');
	addRange(
		add,
		schema,
		'exclusiveMinimum',
		'exclusiveMaximum',
		'excl',
		'Value, exclusive',
		'number',
	);
	if (typeof schema.multipleOf === 'number')
		add('multipleOf', `x${schema.multipleOf}`, `A multiple of ${schema.multipleOf}`, 'number');

	// Object
	addRange(add, schema, 'minProperties', 'maxProperties', 'props', 'Property count', 'object');
	if (schema.additionalProperties === false)
		add(
			'addl',
			'closed',
			'additionalProperties: false. Unknown properties are rejected',
			'object',
		);
	else if (isSet(schema.additionalProperties) && typeof schema.additionalProperties === 'object')
		add('addl', 'addl schema', 'Properties beyond those listed must match a schema', 'object');
	if (isSet(schema.propertyNames))
		add('propertyNames', 'key rules', 'Property names must match a schema', 'object');
	const patterns = Object.keys(schema.patternProperties ?? {});
	if (patterns.length)
		add(
			'patternProperties',
			`patterns(${patterns.length})`,
			`Pattern properties: ${patterns.join(', ')}`,
			'object',
		);

	// Array
	addRange(add, schema, 'minItems', 'maxItems', 'items', 'Item count', 'array');
	if (schema.uniqueItems === true)
		add('uniqueItems', 'unique', 'All items must be distinct', 'array');
	if (Array.isArray(schema.items))
		add(
			'tuple',
			`tuple(${schema.items.length})`,
			`A tuple of ${schema.items.length} positions`,
			'array',
		);
	if (isSet(schema.contains)) add('contains', 'contains', containsTitle(schema), 'array');
	if (schema.additionalItems === false)
		add('addlItems', 'closed items', 'Items beyond the tuple are rejected', 'array');

	// Composition last: the user reports barely using it.
	for (const keyword of ['anyOf', 'oneOf', 'allOf'])
		if (schema[keyword]?.length)
			add(
				keyword,
				`${keyword}(${schema[keyword].length})`,
				`${keyword}: ${schema[keyword].length} schemas`,
				'composition',
			);
	if (isSet(schema.not)) add('not', 'not', 'Must NOT match a schema', 'composition');

	const description = schema.description || schema.comment || undefined;
	const title = all.map(c => c.title).join('\n');

	if (all.length <= MAX_ROW_CHIPS) return { chips: all, hiddenCount: 0, title, description };

	const shown = all.slice(0, Math.max(ALWAYS_SHOWN, MAX_ROW_CHIPS - 1));
	const rest = all.slice(shown.length);
	shown.push({
		key: '_more',
		text: `+${rest.length} more`,
		title: rest.map(c => c.title).join('\n'),
		muted: true,
	});

	return { chips: shown, hiddenCount: rest.length, title, description };
}

function containsTitle(schema: any): string {
	const bounds: string[] = [];
	if (typeof schema.minContains === 'number') bounds.push(`at least ${schema.minContains}`);
	if (typeof schema.maxContains === 'number') bounds.push(`at most ${schema.maxContains}`);
	return bounds.length
		? `${bounds.join(', ')} item(s) must match a schema`
		: 'At least one item must match a schema';
}

function addRange(
	add: (key: string, text: string, title: string, group?: KeywordGroup) => void,
	schema: any,
	minKey: string,
	maxKey: string,
	shortLabel: string,
	longLabel: string,
	group: KeywordGroup,
) {
	const min = schema[minKey];
	const max = schema[maxKey];
	const hasMin = typeof min === 'number';
	const hasMax = typeof max === 'number';
	if (!hasMin && !hasMax) return;

	let span: string;
	if (hasMin && hasMax) span = `${min}..${max}`;
	else if (hasMin) span = `${min}+`;
	else span = `up to ${max}`;

	add(minKey, shortLabel ? `${shortLabel} ${span}` : span, `${longLabel} ${span}`, group);
}
