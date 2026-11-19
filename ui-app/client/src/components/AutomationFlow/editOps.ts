import { AutomationDoc, AutomationNode, NodeType, Transition } from './automationTypes';
import { BranchItem, FlowItem, Gap, Seq, layoutAutomation, locate } from './layout';

/**
 * Edits on the document's graph. Each takes a document and answers a NEW one
 * (the input is never mutated, it usually lives in the page store), and each
 * keeps the graph whole: an insert between A and B rewires A -> new -> B, a
 * remove reconnects what was on either side.
 */

export type InsertKind = 'ACTION' | 'WAIT' | 'CHECK' | 'SPLIT' | 'END';

export function cloneDoc(doc: AutomationDoc | undefined): AutomationDoc {
	const d: AutomationDoc = doc ? JSON.parse(JSON.stringify(doc)) : {};
	d.nodes = d.nodes ?? {};
	d.transitions = (d.transitions ?? []).filter(Boolean);
	return d;
}

/** The next free `stepN` key, never reusing a number already present. */
export function nextKey(doc: AutomationDoc, prefix = 'step'): string {
	const keys = Object.keys(doc.nodes ?? {});
	let max = 0;
	const re = new RegExp(`^${prefix}(\\d+)$`);
	for (const k of keys) {
		const m = re.exec(k);
		if (m) max = Math.max(max, Number(m[1]));
	}
	let n = max + 1;
	while (doc.nodes?.[`${prefix}${n}`]) n++;
	return `${prefix}${n}`;
}

function newNode(kind: InsertKind): AutomationNode {
	switch (kind) {
		case 'ACTION':
			return { type: 'ACTION', action: '', params: {} };
		case 'WAIT':
			return { type: 'WAIT', for: 'P1D' };
		case 'CHECK':
			return { type: 'CHECK', condition: { operator: 'AND', conditions: [] } };
		case 'SPLIT':
			return { type: 'SPLIT' };
		default:
			return { type: kind as NodeType };
	}
}

/** Whether "End" may be offered at a gap: only where a path ends or a lane rejoins. */
export function canEndAt(gap: Gap): boolean {
	return !gap.to || !!gap.laneEnd;
}

/**
 * Inserts a new step at `gap`. Answers the new document and the new node's key.
 *
 * A CHECK arrives with empty Yes and Otherwise lanes (both rejoin at what came
 * next); a SPLIT with two empty lanes and the JOIN that closes them.
 */
export function insertAt(
	doc: AutomationDoc | undefined,
	gap: Gap,
	kind: InsertKind,
): { doc: AutomationDoc; key: string } {
	const d = cloneDoc(doc);
	const key = nextKey(d);
	d.nodes![key] = newNode(kind);
	const ts = d.transitions!;
	const to = gap.to;

	// Point everything that crossed the gap at the new node.
	if (gap.start) d.start = key;
	for (const i of gap.indices) if (ts[i]) ts[i] = { ...ts[i], to: key };
	if (!gap.start && !gap.indices.length && gap.from)
		ts.push({ from: gap.from, to: key, ...(gap.branch ? { branch: gap.branch } : {}) });

	// And the new node on to what came after.
	if (kind === 'END') {
		// An END cuts the path. Only offered where nothing (or only a rejoin) follows.
	} else if (kind === 'CHECK') {
		if (to) {
			ts.push({ from: key, to, branch: 'yes' });
			ts.push({ from: key, to, branch: 'otherwise' });
		}
	} else if (kind === 'SPLIT') {
		const join = nextKey(d);
		d.nodes![join] = { type: 'JOIN' };
		ts.push({ from: key, to: join });
		ts.push({ from: key, to: join });
		if (to) ts.push({ from: join, to });
	} else if (to) {
		ts.push({ from: key, to });
	}
	return { doc: d, key };
}

function keysInSeq(seq: Seq, into: Set<string>): Set<string> {
	for (const it of seq.items) {
		if (it.kind === 'goto') continue;
		into.add(it.key);
		if (it.kind === 'branch') {
			if (it.joinKey) into.add(it.joinKey);
			for (const l of it.lanes) keysInSeq(l.seq, into);
		}
	}
	return into;
}

function firstKey(seq: Seq): string | undefined {
	const it = seq.items[0];
	if (!it) return undefined;
	return it.kind === 'goto' ? it.target : it.key;
}

/**
 * Removes a step and reconnects around it.
 *
 * An ACTION, WAIT or END: whatever led into it now leads to what followed it.
 * An IF or AT THE SAME TIME: its first lane (Yes, or lane 1) is kept in its
 * place and runs on to where the lanes met; the other lanes and their steps go,
 * and so does the JOIN. That keeps the steps people most often mean to keep,
 * rather than deleting a whole subtree for one click.
 */
export function removeNode(doc: AutomationDoc | undefined, key: string): AutomationDoc {
	const d = cloneDoc(doc);
	const node = d.nodes![key];
	if (!node) return d;

	if (node.type === 'CHECK' || node.type === 'SPLIT') {
		const layout = layoutAutomation(d);
		const found = locate(layout, key);
		const item = found?.seq.items[found.index] as BranchItem | undefined;
		if (item?.kind === 'branch') return removeBranch(d, item);
	}

	const ts = d.transitions!;
	const outs = ts.filter(t => t.from === key);
	const next = outs.find(t => !t.branch)?.to ?? outs[0]?.to;
	const rewired: Transition[] = [];
	for (const t of ts) {
		if (t.from === key) continue;
		if (t.to === key) {
			if (next !== undefined && next !== key) rewired.push({ ...t, to: next });
			continue;
		}
		rewired.push(t);
	}
	d.transitions = rewired;
	if (d.start === key) d.start = next;
	delete d.nodes![key];
	return d;
}

function removeBranch(d: AutomationDoc, item: BranchItem): AutomationDoc {
	const [keep, ...drop] = item.lanes;
	const gone = new Set<string>([item.key]);
	for (const l of drop) keysInSeq(l.seq, gone);
	// Lane 1's own steps stay; anything it shares with a dropped lane is not lane-only.
	const kept = keysInSeq(keep?.seq ?? { items: [] }, new Set<string>());
	for (const k of kept) gone.delete(k);
	if (item.mergeKey) gone.delete(item.mergeKey);

	let after: string | undefined = item.mergeKey;
	if (item.joinKey) {
		gone.add(item.joinKey);
		const out = d.transitions!.find(t => t.from === item.joinKey);
		after = out?.to;
	}
	// Where the kept lane starts (if it has steps) or, for an empty lane, where it led.
	const laneStart = keep?.seq.items.length ? firstKey(keep.seq) : after;

	const ts: Transition[] = [];
	for (const t of d.transitions!) {
		if (t.from === item.key) continue;
		if (item.joinKey && t.from === item.joinKey) continue;
		if (gone.has(t.from)) continue;
		if (t.to === item.key) {
			if (laneStart) ts.push({ ...t, to: laneStart });
			continue;
		}
		if (item.joinKey && t.to === item.joinKey) {
			if (after) ts.push({ ...t, to: after });
			continue;
		}
		if (gone.has(t.to)) continue;
		ts.push(t);
	}
	d.transitions = ts;
	if (d.start === item.key) d.start = laneStart;
	for (const k of gone) delete d.nodes![k];
	return d;
}

const SIMPLE = new Set(['ACTION', 'WAIT']);

function simpleAt(seq: Seq, i: number): string | undefined {
	const it: FlowItem | undefined = seq.items[i];
	return it?.kind === 'card' && SIMPLE.has(it.node.type) ? it.key : undefined;
}

/** Whether a card can move up (or down) within its sequence: both it and its neighbour are DO or WAIT. */
export function canMove(doc: AutomationDoc | undefined, key: string, dir: -1 | 1): boolean {
	const found = locate(layoutAutomation(doc), key);
	if (!found) return false;
	return !!simpleAt(found.seq, found.index) && !!simpleAt(found.seq, found.index + dir);
}

/**
 * Swaps a DO or WAIT card with its neighbour in the same sequence:
 * P -> X becomes X -> P, with whatever led into P now leading into X and
 * whatever followed X now following P.
 */
export function moveNode(doc: AutomationDoc | undefined, key: string, dir: -1 | 1): AutomationDoc {
	const d = cloneDoc(doc);
	const found = locate(layoutAutomation(d), key);
	if (!found) return d;
	const a = simpleAt(found.seq, dir === -1 ? found.index - 1 : found.index);
	const b = simpleAt(found.seq, dir === -1 ? found.index : found.index + 1);
	if (!a || !b) return d;
	// a -> b becomes b -> a.
	d.transitions = d.transitions!.map(t => {
		if (t.from === a && t.to === b) return { ...t, from: b, to: a };
		if (t.to === a) return { ...t, to: b };
		if (t.from === b) return { ...t, from: a };
		return t;
	});
	if (d.start === a) d.start = b;
	return d;
}

/** Replaces one node's fields (shallow), keeping its key and its place. */
export function updateNode(
	doc: AutomationDoc | undefined,
	key: string,
	patch: Partial<AutomationNode>,
): AutomationDoc {
	const d = cloneDoc(doc);
	const cur = d.nodes![key];
	if (!cur) return d;
	const next: AutomationNode = { ...cur, ...patch } as AutomationNode;
	for (const [k, v] of Object.entries(patch)) if (v === undefined) delete (next as any)[k];
	d.nodes![key] = next;
	return d;
}
