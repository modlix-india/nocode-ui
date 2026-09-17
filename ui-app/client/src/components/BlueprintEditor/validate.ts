/**
 * The single write gate.
 *
 * This file is the reason BlueprintEditor is a component rather than a page
 * composition. The rules below are conventions in a markdown document today,
 * and a markdown document will not survive three writers: a generator, this
 * editor, and an agent all put JSON into the same field. One function that
 * every write passes through will.
 *
 * ── Rule 1 is the one that fails silently ────────────────────────────────
 *
 * NO ARRAYS, at any depth. `DifferenceExtractor` on the Java side treats an
 * array as OPAQUE:
 *
 *     if (existing.isJsonPrimitive() || existing.isJsonArray())
 *         return Mono.just(incoming);
 *
 * So changing one item of a forty-item list makes a tenant's override carry all
 * forty, and the base client's later corrections to the other thirty-nine never
 * reach them again. Nothing anywhere reports this. Every list-shaped thing is
 * therefore a uid-keyed map with an `order` integer.
 *
 * ── Rule 2 is about how a binding resolves ───────────────────────────────
 *
 * `updateLocationForChild` builds a child's path as `${location}.${key}` with
 * no quoting, so a key holding a `.` nests instead of addressing, and a key
 * holding a `-` is parsed as subtraction. Minted uids must be letter-first
 * alphanumeric. Letter-first because `shortUUID` is base62 with the digits
 * leading its alphabet, so roughly one key in six would otherwise start with a
 * digit, and a leading digit in an expression path is at best untested.
 *
 * A refusal must be VISIBLE. A gate that drops a bad write quietly would join
 * the failures it exists to prevent.
 */

export interface ValidationIssue {
	/** Dotted path to the offending value, e.g. `plan.objects.abc.order`. */
	path: string;
	message: string;
}

export const UID_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/;

/** Keys that are legitimately not uids: the fixed vocabulary of the schema. */
const RESERVED_KEYS = new Set([
	'schemaVersion',
	'intent',
	'describes',
	'purpose',
	'decisions',
	'plan',
	'origin',
	'reconciled',
	'declined',
	'title',
	'name',
	'kind',
	'order',
	'feature',
	'componentKey',
	'layout',
	'route',
	'contentSource',
	'role',
	'appType',
	'audience',
	'glossary',
	'brand',
	'features',
	'objects',
	'security',
	'delivery',
	'sections',
	'fields',
	'relations',
	'lifecycle',
	'entity',
	'grain',
	'content',
	'media',
	'variables',
	'palette',
	'tone',
	'typeScale',
	'motion',
	'profiles',
	'gates',
	'access',
	'status',
	'why',
	'who',
	'requires',
	'shape',
	'steps',
	'trigger',
	'contract',
	'failureMode',
	'event',
	'channels',
	'audienceNote',
	'prompt',
	'generatedBy',
	'generatedAt',
	'fromTemplate',
	'choice',
	'because',
	'madeBy',
	'at',
	'supersedes',
	'area',
	'prose',
	'purposeNote',
	'in',
	'out',
	'does',
	'to',
	'cardinality',
	'required',
	'path',
	'param',
	'domains',
	'environments',
	'term',
	'means',
]);

/** Maps whose keys are minted uids and must therefore satisfy the charset. */
const UID_KEYED = new Set([
	'objects',
	'features',
	'sections',
	'fields',
	'relations',
	'decisions',
	'glossary',
	'profiles',
	'gates',
	'steps',
	'media',
	'ctas',
]);

const MAX_BYTES = 256 * 1024;

/**
 * Check a blueprint before it is written.
 *
 * Returns every issue rather than the first, so a malformed document produced
 * by a generator can be reported whole instead of one round trip per problem.
 */
export function validateBlueprint(blueprint: any): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	if (blueprint === undefined || blueprint === null) return issues;

	if (typeof blueprint !== 'object' || Array.isArray(blueprint)) {
		issues.push({ path: '', message: 'A blueprint must be an object.' });
		return issues;
	}

	walk(blueprint, '', null, issues);

	let size = 0;
	try {
		size = JSON.stringify(blueprint).length;
	} catch {
		issues.push({ path: '', message: 'A blueprint must be serialisable to JSON.' });
		return issues;
	}
	if (size > MAX_BYTES) {
		issues.push({
			path: '',
			message: `A blueprint is ${Math.round(size / 1024)}KB, over the ${MAX_BYTES / 1024}KB budget. Refused rather than truncated, because a silently shortened plan is worse than none.`,
		});
	}

	return issues;
}

function walk(node: any, path: string, parentKey: string | null, issues: ValidationIssue[]): void {
	if (Array.isArray(node)) {
		issues.push({
			path,
			message:
				'Arrays are not allowed anywhere in a blueprint. DifferenceExtractor treats an array as opaque, so one changed item carries the whole list into a tenant override and silently detaches them from later corrections. Use a uid-keyed map with an order integer.',
		});
		return;
	}
	if (node === null || typeof node !== 'object') return;

	const keysAreUids = parentKey !== null && UID_KEYED.has(parentKey);

	for (const [key, value] of Object.entries(node)) {
		const childPath = path ? `${path}.${key}` : key;

		if (keysAreUids && !RESERVED_KEYS.has(key) && !UID_PATTERN.test(key)) {
			issues.push({
				path: childPath,
				message: `"${key}" is not a usable key. A binding path is built by concatenation without quoting, so a dot nests and a hyphen is read as subtraction. Keys must be letter-first and alphanumeric.`,
			});
		}

		if (key === 'order' && value !== undefined && !Number.isInteger(value)) {
			issues.push({
				path: childPath,
				message:
					'order must be an integer. Inserts use gaps of 1000 so one insert is one write rather than a diff of every sibling.',
			});
		}

		walk(value, childPath, key, issues);
	}
}

/**
 * Mint a key that is safe to address.
 *
 * Letter-first, then alphanumeric, for the reason in the header comment.
 */
export function mintUid(): string {
	const alpha = 'abcdefghijklmnopqrstuvwxyz';
	const base = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let out = alpha[Math.floor(Math.random() * alpha.length)];
	for (let i = 0; i < 7; i++) out += base[Math.floor(Math.random() * base.length)];
	return out;
}

/**
 * The next order value for a keyed map.
 *
 * Gaps of 1000 so inserting between two siblings is one write. Renumbering
 * every sibling would, under the differ, be a diff of every sibling.
 */
export const ORDER_GAP = 1000;

export function nextOrder(map: { [k: string]: { order?: number } } | undefined): number {
	const values = Object.values(map ?? {});
	if (!values.length) return ORDER_GAP;
	return Math.max(...values.map(v => v?.order ?? 0)) + ORDER_GAP;
}

/**
 * The order value for something dropped between two neighbours.
 *
 * Returns null when there is no room left, which is the caller's signal to
 * renumber that one map rather than silently colliding.
 */
export function orderBetween(before?: number, after?: number): number | null {
	if (before === undefined && after === undefined) return ORDER_GAP;
	if (before === undefined) return Math.floor(after! / 2) || null;
	if (after === undefined) return before + ORDER_GAP;
	if (after - before < 2) return null;
	return Math.floor((before + after) / 2);
}
