/**
 * What each comparison of a condition row accepts (LZT-2783). Pure rules, kept
 * out of the panel so they can be tested without a DOM:
 *
 *   is more than / at least / less than / at most  one number
 *   is between                                      two values of the field's type
 *   is one of                                       a list of values
 *   contains / is like                              text, `%` stands for any text
 *
 * The core service already evaluates all of these (a list or a comma text for
 * "is one of", numbers compared as numbers, dates as ISO text), so this only
 * keeps the editor from writing values the comparison cannot use.
 */

export type ValueKind = 'number' | 'date' | 'datetime' | 'text';
export type OperatorKind = 'numeric' | 'range' | 'multi' | 'text' | 'single' | 'none';

const NUMERIC_OPS = new Set(['GREATER_THAN', 'GREATER_THAN_EQUAL', 'LESS_THAN', 'LESS_THAN_EQUAL']);
const NUMBER_TYPES = new Set([
	'INTEGER',
	'LONG',
	'SHORT',
	'FLOAT',
	'DOUBLE',
	'NUMBER',
	'DECIMAL',
	'BIGDECIMAL',
	'INT',
]);
const DATETIME_TYPES = new Set(['DATETIME', 'TIMESTAMP', 'LOCALDATETIME', 'DATE_TIME']);

export function operatorKind(op: string | undefined): OperatorKind {
	const o = String(op ?? 'EQUALS').toUpperCase();
	if (NUMERIC_OPS.has(o)) return 'numeric';
	if (o === 'BETWEEN') return 'range';
	if (o === 'IN') return 'multi';
	if (o === 'LIKE' || o === 'STRING_LOOSE_EQUAL') return 'text';
	if (['IS_TRUE', 'IS_FALSE', 'IS_NULL', 'IS_NOT_NULL'].includes(o)) return 'none';
	return 'single';
}

/** The kind of value a field of this catalog type holds. */
export function valueKindOf(type: string | undefined): ValueKind {
	const t = String(type ?? '').toUpperCase();
	if (NUMBER_TYPES.has(t)) return 'number';
	if (DATETIME_TYPES.has(t)) return 'datetime';
	if (t === 'DATE' || t === 'LOCALDATE') return 'date';
	return 'text';
}

/** A reference to another value (`{{trigger.amount}}`) is left for the run to fill in. */
export const isReference = (v: any): boolean => /^\s*\{\{.*\}\}\s*$/.test(String(v ?? ''));

const NUMBER_RE = /^-?\d*\.?\d*$/;

/** Whether `v` is something a number comparison can read (or a reference). */
export function isNumberText(v: any): boolean {
	if (v === undefined || v === null || v === '') return true;
	const s = String(v).trim();
	if (isReference(s)) return true;
	return NUMBER_RE.test(s) && s !== '-' && s !== '.' && s !== '-.';
}

/**
 * The text a number box keeps while the person types: digits, one dot and a
 * leading minus; a reference being typed (`{{...`) passes through. Letters are
 * dropped, so "1234ABCD" becomes "1234".
 */
export function numberTyping(raw: string): string {
	const s = String(raw ?? '');
	if (s.trimStart().startsWith('{')) return s;
	let out = '';
	for (const ch of s) {
		if (ch >= '0' && ch <= '9') out += ch;
		else if (ch === '-' && out === '') out = '-';
		else if (ch === '.' && !out.includes('.')) out += '.';
	}
	return out;
}

const blank = (v: any) => v === undefined || v === null || String(v).trim() === '';

/** Orders two range ends the way the core does: as numbers when both are, else as text. */
function order(a: any, b: any): number {
	const x = Number(String(a).trim());
	const y = Number(String(b).trim());
	if (!isNaN(x) && !isNaN(y) && String(a).trim() !== '' && String(b).trim() !== '') return x - y;
	return String(a).localeCompare(String(b));
}

/** A message for a condition that cannot work, or '' when it is fine. */
export function conditionProblem(
	op: string | undefined,
	value: any,
	toValue: any,
	kind: ValueKind,
): string {
	const k = operatorKind(op);
	if (k === 'numeric') {
		if (!isNumberText(value)) return 'Enter a number.';
		return '';
	}
	if (k === 'range') {
		if (blank(value) || blank(toValue)) return 'Fill in both ends of the range.';
		if (kind === 'number' && (!isNumberText(value) || !isNumberText(toValue)))
			return 'Enter numbers.';
		if (isReference(value) || isReference(toValue)) return '';
		if (order(value, toValue) > 0) return 'The first value must not be above the second.';
		return '';
	}
	if (k === 'multi') {
		return listOf(value).length ? '' : 'Choose or enter at least one value.';
	}
	return '';
}

/** The values of an "is one of" condition: a list, or the comma text older conditions hold. */
export function listOf(v: any): any[] {
	if (Array.isArray(v)) return v.filter(x => !blank(x));
	if (blank(v)) return [];
	return String(v)
		.split(',')
		.map(s => s.trim())
		.filter(Boolean);
}

/**
 * The value a condition keeps when its comparison changes: "is one of" takes
 * the old single value as its first entry and gives back its first entry; a
 * number comparison drops a value that is not a number.
 */
export function carryValue(from: string | undefined, to: string, value: any): any {
	const a = operatorKind(from);
	const b = operatorKind(to);
	if (a === b) return value;
	if (b === 'multi') {
		return listOf(value);
	}
	let next = value;
	if (a === 'multi') {
		const first = listOf(value)[0];
		next = first === undefined ? '' : first;
	}
	if (b === 'numeric' && !isNumberText(next)) return '';
	return next;
}

/** An "is like" pattern: `%` is any text. Only a pattern that is not empty is valid. */
export function patternProblem(v: any): string {
	return blank(v) ? 'Enter some text.' : '';
}
