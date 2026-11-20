import {
	AutomationDoc,
	AutomationNode,
	Catalog,
	CatalogAction,
	CatalogTrigger,
	Condition,
	ConditionGroup,
	ConditionLeaf,
	TRIGGER_KEY,
	Variable,
} from './automationTypes';
import { periodToWords } from './period';

/**
 * One piece of a card's sentence: plain words, or a chosen value drawn as a
 * chip. An `empty` chip is a blank still to be filled ("choose template").
 */
export interface Segment {
	text: string;
	chip?: boolean;
	empty?: boolean;
}

/** Resolves an option value to its label, when the options are known. */
export type OptionLabeller = (fieldOrParam: string, value: any) => string | undefined;

const VAR_RE = /\{\{\s*([^}]+?)\s*\}\}/g;
const SOLE_VAR_RE = /^\{\{\s*([^}]+?)\s*\}\}$/;

export function findTrigger(catalog: Catalog | undefined, key: string | undefined) {
	if (!key) return undefined;
	return catalog?.triggers?.find(t => t.key === key);
}

export function findAction(catalog: Catalog | undefined, key: string | undefined) {
	if (!key) return undefined;
	return catalog?.actions?.find(a => a.key === key);
}

/** "send WhatsApp template" -> "Send WhatsApp template". */
export function capitalise(s: string): string {
	return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Nodes from which `target` can be reached, i.e. the steps that ran before it. */
export function ancestorsOf(doc: AutomationDoc, target: string): Set<string> {
	const back = new Map<string, string[]>();
	for (const t of doc.transitions ?? []) {
		if (!back.has(t.to)) back.set(t.to, []);
		back.get(t.to)!.push(t.from);
	}
	const seen = new Set<string>();
	const queue = [...(back.get(target) ?? [])];
	while (queue.length) {
		const k = queue.shift()!;
		if (seen.has(k)) continue;
		seen.add(k);
		queue.push(...(back.get(k) ?? []));
	}
	seen.delete(target);
	return seen;
}

/** A plain title for a node, for "go back to", the editor and the chat reference. */
export function nodeTitle(doc: AutomationDoc, catalog: Catalog | undefined, key: string): string {
	if (key === TRIGGER_KEY) {
		const trig = findTrigger(catalog, doc.trigger?.key);
		return trig ? `When ${trig.sentence}` : 'When';
	}
	const node = doc.nodes?.[key];
	if (!node) return key;
	if (node.title) return node.title;
	if (node.type === 'ACTION') {
		const act = findAction(catalog, node.action);
		return act?.title ?? node.action ?? key;
	}
	if (node.type === 'WAIT') return 'Wait';
	if (node.type === 'CHECK') return 'Check';
	if (node.type === 'SPLIT') return 'At the same time';
	if (node.type === 'END') return 'End';
	return key;
}

/**
 * What a param or a condition may refer to at `nodeKey`: the trigger's fields
 * and the outputs of every ACTION that runs before it. With no node (or the
 * trigger itself), only the trigger's fields.
 */
export function variablesFor(
	doc: AutomationDoc,
	catalog: Catalog | undefined,
	nodeKey?: string,
): Variable[] {
	const out: Variable[] = [];
	const trig = findTrigger(catalog, doc.trigger?.key);
	for (const f of trig?.fields ?? [])
		out.push({ path: `trigger.${f.name}`, label: f.label, type: f.type, options: f.options });
	if (!nodeKey || nodeKey === TRIGGER_KEY) return out;
	const before = ancestorsOf(doc, nodeKey);
	for (const [key, node] of Object.entries(doc.nodes ?? {})) {
		if (node?.type !== 'ACTION' || !before.has(key)) continue;
		const act = findAction(catalog, node.action);
		const stepTitle = node.title ?? act?.title ?? key;
		for (const o of act?.outputs ?? [])
			out.push({
				path: `steps.${key}.${o.name}`,
				label: o.label,
				group: stepTitle,
				type: o.type,
			});
	}
	return out;
}

/** Every variable anywhere in the document: what a chip may need a label for. */
export function allVariables(doc: AutomationDoc, catalog: Catalog | undefined): Variable[] {
	const out = variablesFor(doc, catalog);
	for (const [key, node] of Object.entries(doc.nodes ?? {})) {
		if (node?.type !== 'ACTION') continue;
		const act = findAction(catalog, node.action);
		const stepTitle = node.title ?? act?.title ?? key;
		for (const o of act?.outputs ?? [])
			out.push({ path: `steps.${key}.${o.name}`, label: o.label, group: stepTitle });
	}
	// Inside a wait-for-event filter the event's own fields are `event.<name>`.
	for (const node of Object.values(doc.nodes ?? {})) {
		const ev = node?.type === 'WAIT' ? findTrigger(catalog, node.untilEvent?.key) : undefined;
		for (const f of ev?.fields ?? [])
			if (!out.some(v => v.path === `event.${f.name}`))
				out.push({
					path: `event.${f.name}`,
					label: f.label,
					type: f.type,
					options: f.options,
				});
	}
	return out;
}

/** A variable as a picker lists it: "Message id (Send WhatsApp template)". */
export function pickLabel(v: Variable): string {
	return v.group ? `${v.label} (${v.group})` : v.label;
}

/** The label for a path ("trigger.leadName" -> "Lead name"), or the path itself. */
export function labelForPath(path: string, vars: Variable[]): string {
	const p = path.trim();
	const found = vars.find(v => v.path === p);
	if (found) return found.label;
	return p;
}

/**
 * A param value as words: `{{trigger.leadName}}` -> "Lead name"; text with
 * paths inside -> the text with each path replaced by its label; an option
 * value -> its label when known.
 */
export function valueToWords(
	value: any,
	vars: Variable[],
	optionLabel?: (value: any) => string | undefined,
): string {
	if (value === undefined || value === null || value === '') return '';
	if (typeof value === 'boolean') return value ? 'yes' : 'no';
	if (typeof value === 'object') {
		if (Array.isArray(value))
			return value.map(v => valueToWords(v, vars, optionLabel)).join(', ');
		return JSON.stringify(value);
	}
	const s = String(value);
	const sole = SOLE_VAR_RE.exec(s);
	if (sole) return labelForPath(sole[1], vars);
	if (s.includes('{{')) return s.replace(VAR_RE, (_, p) => labelForPath(p, vars));
	return optionLabel?.(value) ?? s;
}

/**
 * A catalog sentence with its `{name}` placeholders filled from `values`.
 * A filled placeholder becomes a chip; an unfilled one an empty chip with the
 * param's label, so the blank reads as what to choose.
 */
export function fillSentence(
	sentence: string,
	values: Record<string, any> | undefined,
	vars: Variable[],
	labels: Record<string, string> = {},
	optionLabel?: OptionLabeller,
): Segment[] {
	const segs: Segment[] = [];
	const re = /\{(\w+)\}/g;
	let last = 0;
	let m: RegExpExecArray | null;
	while ((m = re.exec(sentence))) {
		if (m.index > last) segs.push({ text: sentence.slice(last, m.index) });
		const name = m[1];
		const words = valueToWords(values?.[name], vars, v => optionLabel?.(name, v));
		if (words) segs.push({ text: words, chip: true });
		else segs.push({ text: labels[name] ?? name, chip: true, empty: true });
		last = m.index + m[0].length;
	}
	if (last < sentence.length) segs.push({ text: sentence.slice(last) });
	return segs;
}

// ───────────────────────────── conditions ─────────────────────────────

const OPERATOR_WORDS: Record<string, string> = {
	EQUALS: 'is',
	NOT_EQUALS: 'is not',
	GREATER_THAN: 'is more than',
	GREATER_THAN_EQUAL: 'is at least',
	LESS_THAN: 'is less than',
	LESS_THAN_EQUAL: 'is at most',
	BETWEEN: 'is between',
	IN: 'is one of',
	LIKE: 'contains',
	STRING_LOOSE_EQUAL: 'is like',
	IS_TRUE: 'is true',
	IS_FALSE: 'is false',
	IS_NULL: 'is empty',
	IS_NOT_NULL: 'is filled in',
};

/** The operators a condition row offers, in the order the picker lists them. */
export const OPERATORS: Array<{
	value: string;
	label: string;
	needsValue: boolean;
	needsTo?: boolean;
}> = [
	{ value: 'EQUALS', label: 'is', needsValue: true },
	{ value: 'NOT_EQUALS', label: 'is not', needsValue: true },
	{ value: 'GREATER_THAN', label: 'is more than', needsValue: true },
	{ value: 'GREATER_THAN_EQUAL', label: 'is at least', needsValue: true },
	{ value: 'LESS_THAN', label: 'is less than', needsValue: true },
	{ value: 'LESS_THAN_EQUAL', label: 'is at most', needsValue: true },
	{ value: 'BETWEEN', label: 'is between', needsValue: true, needsTo: true },
	{ value: 'IN', label: 'is one of', needsValue: true },
	{ value: 'LIKE', label: 'contains', needsValue: true },
	{ value: 'STRING_LOOSE_EQUAL', label: 'is like', needsValue: true },
	{ value: 'IS_TRUE', label: 'is true', needsValue: false },
	{ value: 'IS_FALSE', label: 'is false', needsValue: false },
	{ value: 'IS_NULL', label: 'is empty', needsValue: false },
	{ value: 'IS_NOT_NULL', label: 'is filled in', needsValue: false },
];

export function operatorNeedsValue(op: string): boolean {
	return OPERATORS.find(o => o.value === op)?.needsValue ?? true;
}

export function isGroup(c: Condition | undefined): c is ConditionGroup {
	return !!c && Array.isArray((c as ConditionGroup).conditions);
}

function leafToWords(leaf: ConditionLeaf, vars: Variable[], optionLabel?: OptionLabeller): string {
	const field = labelForPath(String(leaf.field ?? '').replace(/^\{\{\s*|\s*\}\}$/g, ''), vars);
	const op = String(leaf.operator ?? 'EQUALS').toUpperCase();
	const val = (v: any) => valueToWords(v, vars, x => optionLabel?.(leaf.field, x)) || '…';
	let words: string;
	switch (op) {
		// A true/false field reads as the statement itself: "the message was read".
		case 'IS_TRUE':
			words = field;
			break;
		case 'IS_FALSE':
			words = `not ${field}`;
			break;
		case 'IS_NULL':
		case 'IS_NOT_NULL':
			words = `${field} ${OPERATOR_WORDS[op]}`;
			break;
		case 'BETWEEN':
			words = `${field} is between ${val(leaf.value)} and ${val(leaf.toValue)}`;
			break;
		case 'IN': {
			const list = Array.isArray(leaf.value)
				? leaf.value
				: String(leaf.value ?? '')
						.split(',')
						.map(s => s.trim())
						.filter(Boolean);
			words = `${field} is one of ${list.length ? list.map(val).join(', ') : '…'}`;
			break;
		}
		default:
			words = `${field} ${OPERATOR_WORDS[op] ?? op.toLowerCase()} ${val(leaf.value)}`;
	}
	return leaf.negate ? `not (${words})` : words;
}

/**
 * A condition in words: "Stage is Won and Amount is more than 1000". A nested
 * group with the other joiner is bracketed so "and" and "or" never blur.
 */
export function conditionToWords(
	cond: Condition | undefined,
	vars: Variable[],
	optionLabel?: OptionLabeller,
	nested = false,
): string {
	if (!cond) return '';
	if (!isGroup(cond)) return leafToWords(cond, vars, optionLabel);
	const parts = (cond.conditions ?? [])
		.map(c => conditionToWords(c, vars, optionLabel, true))
		.filter(Boolean);
	if (!parts.length) return '';
	const joiner = cond.operator === 'OR' ? ' or ' : ' and ';
	let words = parts.join(joiner);
	if (cond.negate) return `not (${words})`;
	if (nested && parts.length > 1) words = `(${words})`;
	return words;
}

// ───────────────────────────── cards ─────────────────────────────

export interface CardText {
	/** The word on the card's left: WHEN, DO, WAIT, IF, AT THE SAME TIME, END. */
	verb: string;
	segments: Segment[];
	/** A second line, e.g. the trigger filter ("where Stage is Won"). */
	detail?: string;
}

/**
 * The values a trigger's filter pins with "is": `trigger.threshold is 90` gives
 * `{ threshold: 90 }`, so a sentence such as "reaches {threshold}% of its budget"
 * reads "reaches 90% of its budget". Only a filter that must hold as a whole
 * (a single condition or an AND group) pins anything.
 */
export function pinnedTriggerValues(filter: Condition | undefined): Record<string, any> {
	const out: Record<string, any> = {};
	const walk = (c: Condition | undefined) => {
		if (!c) return;
		if (isGroup(c)) {
			if (c.operator === 'OR' || c.negate) return;
			c.conditions?.forEach(walk);
			return;
		}
		const m = /^\s*(?:\{\{\s*)?trigger\.(\w+)\s*(?:\}\})?\s*$/.exec(String(c.field ?? ''));
		if (m && !c.negate && String(c.operator ?? 'EQUALS').toUpperCase() === 'EQUALS')
			out[m[1]] = c.value;
	};
	walk(filter);
	return out;
}

export function triggerCard(
	doc: AutomationDoc,
	catalog: Catalog | undefined,
	vars: Variable[],
	optionLabel?: OptionLabeller,
): CardText {
	const trig: CatalogTrigger | undefined = findTrigger(catalog, doc.trigger?.key);
	const labels: Record<string, string> = {};
	for (const f of trig?.fields ?? []) labels[f.name] = f.label;
	const segments: Segment[] = trig
		? fillSentence(trig.sentence, pinnedTriggerValues(doc.trigger?.filter), vars, labels)
		: doc.trigger?.key
			? [{ text: doc.trigger.key, chip: true }]
			: [{ text: 'choose what starts this', chip: true, empty: true }];
	const filter = conditionToWords(doc.trigger?.filter, vars, optionLabel);
	return { verb: 'WHEN', segments, detail: filter ? `where ${filter}` : undefined };
}

export function nodeCard(
	doc: AutomationDoc,
	catalog: Catalog | undefined,
	key: string,
	vars: Variable[],
	optionLabel?: OptionLabeller,
): CardText {
	const node: AutomationNode | undefined = doc.nodes?.[key];
	if (!node) return { verb: '', segments: [{ text: key }] };
	switch (node.type) {
		case 'ACTION': {
			const act: CatalogAction | undefined = findAction(catalog, node.action);
			if (!act) {
				return {
					verb: 'DO',
					segments: node.action
						? [{ text: node.title ?? node.action }]
						: [{ text: 'choose what to do', chip: true, empty: true }],
				};
			}
			const labels: Record<string, string> = {};
			for (const p of act.params ?? []) labels[p.name] = p.label;
			// A param with a fixed list shows its choice's label ("Deal assigned to you").
			const fixed = (act.params ?? []).filter(p => p.choices?.length);
			const label: OptionLabeller | undefined = fixed.length
				? (name, value) =>
						fixed
							.find(p => p.name === name)
							?.choices?.find(c => String(c.value) === String(value))?.label ??
						optionLabel?.(name, value)
				: optionLabel;
			return {
				verb: 'DO',
				segments: fillSentence(act.sentence, node.params, vars, labels, label),
			};
		}
		case 'WAIT':
			return { verb: 'WAIT', segments: waitSegments(node, catalog, vars, optionLabel) };
		case 'CHECK': {
			const words = conditionToWords(node.condition, vars, optionLabel);
			return {
				verb: 'IF',
				segments: words
					? [{ text: words }]
					: [{ text: 'choose what to check', chip: true, empty: true }],
			};
		}
		case 'SPLIT':
			return { verb: 'AT THE SAME TIME', segments: node.title ? [{ text: node.title }] : [] };
		case 'END':
			return { verb: 'END', segments: node.title ? [{ text: node.title }] : [] };
		default:
			return { verb: String(node.type ?? ''), segments: [{ text: node.title ?? key }] };
	}
}

function waitSegments(
	node: AutomationNode,
	catalog: Catalog | undefined,
	vars: Variable[],
	optionLabel?: OptionLabeller,
): Segment[] {
	if (node.untilEvent) {
		const trig = findTrigger(catalog, node.untilEvent.key);
		const segs: Segment[] = [{ text: 'until ' }];
		if (trig) segs.push({ text: trig.sentence });
		else if (node.untilEvent.key) segs.push({ text: node.untilEvent.key, chip: true });
		else segs.push({ text: 'something happens', chip: true, empty: true });
		const filter = conditionToWords(node.untilEvent.filter, vars, optionLabel);
		if (filter) segs.push({ text: ` where ${filter}` });
		if (node.timeout) {
			segs.push({ text: ', at most ' });
			segs.push({ text: periodToWords(node.timeout), chip: true });
		}
		return segs;
	}
	if (node.until) {
		return [{ text: 'until ' }, { text: valueToWords(node.until, vars), chip: true }];
	}
	if (node.for) return [{ text: periodToWords(node.for), chip: true }];
	return [{ text: 'how long', chip: true, empty: true }];
}

/** A card's sentence as one plain string: "Wait 2 days", "Send the WhatsApp template Welcome". */
export function cardPlainText(card: CardText): string {
	const body = card.segments.map(s => s.text).join('');
	if (card.verb === 'DO') return capitalise(body);
	if (card.verb === 'WAIT') return `Wait ${body}`;
	if (card.verb === 'IF') return `If ${body}`;
	if (card.verb === 'WHEN') return `When ${body}`;
	if (card.verb === 'AT THE SAME TIME')
		return body ? `At the same time: ${body}` : 'At the same time';
	if (card.verb === 'END') return body ? `End: ${body}` : 'End';
	return body;
}
