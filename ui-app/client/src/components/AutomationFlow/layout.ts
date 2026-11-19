import { AutomationDoc, AutomationNode, Transition } from './automationTypes';

/**
 * The automation graph laid out as nested sequences of cards.
 *
 * A document is a graph (`start`, `nodes`, `transitions`), and the view is a
 * column of cards with lanes: an IF opens a Yes and an Otherwise lane, a SPLIT
 * opens side by side lanes, and the lanes close where the paths meet again (a
 * JOIN, or any node every lane reaches). A path that leads back to a card
 * already drawn becomes a "go back to" item instead of a crossing line, and a
 * node nothing reaches is listed separately so an edit never hides it.
 *
 * Every gap on a rail carries what an insert there has to rewire (see `Gap`).
 */

/**
 * A place on a rail where a step can be inserted.
 *
 * - `indices`: the transitions that currently cross this gap; an insert points
 *   them at the new node and adds new -> `to`.
 * - no indices but `from`: an open end; an insert adds `from` -> new (with `branch`).
 * - `start`: the gap under WHEN; an insert becomes the new `start`.
 * - `laneEnd`: the last gap of a lane, before it rejoins. Only here (and at an
 *   open end) may a lane be ended early with END.
 */
export interface Gap {
	indices: number[];
	from?: string;
	branch?: string;
	to?: string;
	start?: boolean;
	laneEnd?: boolean;
}

export interface CardItem {
	kind: 'card';
	key: string;
	node: AutomationNode;
	before?: Gap;
}

export interface BranchItem {
	kind: 'branch';
	key: string;
	node: AutomationNode;
	type: 'CHECK' | 'SPLIT';
	lanes: Lane[];
	/** Where the lanes meet again, if they do. */
	mergeKey?: string;
	/** The JOIN node that closes a SPLIT (or a CHECK merging at a JOIN). Not drawn. */
	joinKey?: string;
	before?: Gap;
}

export interface GotoItem {
	kind: 'goto';
	target: string;
	before?: Gap;
}

export type FlowItem = CardItem | BranchItem | GotoItem;

export interface Seq {
	items: FlowItem[];
	/** The gap after the last item, when there is one (not after END or a go back). */
	tail?: Gap;
}

export interface Lane {
	label: string;
	branch?: string;
	seq: Seq;
	/** The lane runs on into the merge point (drawn as a lane that closes). */
	closes: boolean;
}

export interface FlowLayout {
	/** Everything under the WHEN card. */
	seq: Seq;
	/** Nodes nothing reaches from `start`. */
	orphans: string[];
}

interface WalkResult extends Seq {
	endedAt?: string;
}

function outgoing(transitions: Transition[], key: string): Array<[Transition, number]> {
	const out: Array<[Transition, number]> = [];
	transitions.forEach((t, i) => {
		if (t && t.from === key) out.push([t, i]);
	});
	return out;
}

function gapOf(t: Transition, i: number): Gap {
	return { indices: [i], from: t.from, branch: t.branch, to: t.to };
}

const isYes = (b: string | undefined) => String(b ?? '').toLowerCase() === 'yes';

/** The lanes a CHECK or SPLIT opens: [label, branch, transition] per lane. */
export function lanesOf(
	type: 'CHECK' | 'SPLIT',
	key: string,
	transitions: Transition[],
): Array<{ label: string; branch?: string; t?: [Transition, number] }> {
	const outs = outgoing(transitions, key);
	if (type === 'CHECK') {
		const yes = outs.find(([t]) => isYes(t.branch));
		const otherwise = outs.find(([t]) => !isYes(t.branch));
		return [
			{ label: 'Yes', branch: 'yes', t: yes },
			{ label: 'Otherwise', branch: 'otherwise', t: otherwise },
		];
	}
	return outs.map((t, i) => ({ label: `Lane ${i + 1}`, branch: t[0].branch, t }));
}

export function layoutAutomation(doc: AutomationDoc | undefined): FlowLayout {
	const nodes = doc?.nodes ?? {};
	const transitions = doc?.transitions ?? [];
	const drawn = new Set<string>();

	/** Breadth-first distances from `start`, never entering drawn nodes or past a closer. */
	const distances = (start: string, closers: Set<string>): Map<string, number> => {
		const dist = new Map<string, number>();
		const queue: string[] = [start];
		dist.set(start, 0);
		while (queue.length) {
			const k = queue.shift()!;
			if (closers.has(k)) continue;
			for (const [t] of outgoing(transitions, k)) {
				if (dist.has(t.to) || drawn.has(t.to)) continue;
				dist.set(t.to, dist.get(k)! + 1);
				queue.push(t.to);
			}
		}
		return dist;
	};

	/** Where lanes starting at `starts` meet: reachable from all, nearest for the farthest lane. */
	const findMerge = (starts: string[], closers: Set<string>): string | undefined => {
		if (starts.length < 2) return undefined;
		const maps = starts.map(s =>
			drawn.has(s) ? new Map<string, number>() : distances(s, closers),
		);
		let best: string | undefined;
		let bestMax = Infinity;
		let bestSum = Infinity;
		for (const [k] of maps[0]) {
			if (!maps.every(m => m.has(k))) continue;
			const ds = maps.map(m => m.get(k)!);
			const mx = Math.max(...ds);
			const sum = ds.reduce((a, b) => a + b, 0);
			const better =
				mx < bestMax ||
				(mx === bestMax && sum < bestSum) ||
				(mx === bestMax &&
					sum === bestSum &&
					nodes[k]?.type === 'JOIN' &&
					nodes[best!]?.type !== 'JOIN');
			if (better) {
				best = k;
				bestMax = mx;
				bestSum = sum;
			}
		}
		return best;
	};

	/** Keys drawn inside a sequence, recursively (for the merge gap). */
	const keysIn = (seq: Seq, into: Set<string>) => {
		for (const it of seq.items) {
			if (it.kind === 'goto') continue;
			into.add(it.key);
			if (it.kind === 'branch') for (const l of it.lanes) keysIn(l.seq, into);
		}
		return into;
	};

	const walk = (
		start: string | undefined,
		via: Gap | undefined,
		closers: Set<string>,
	): WalkResult => {
		const items: FlowItem[] = [];
		let gap = via;
		let cur = start;
		while (cur !== undefined && cur !== null && cur !== '') {
			if (closers.has(cur))
				return { items, tail: gap ? { ...gap, laneEnd: true } : undefined, endedAt: cur };
			if (drawn.has(cur)) {
				items.push({ kind: 'goto', target: cur, before: gap });
				return { items };
			}
			const node = nodes[cur];
			if (!node) return { items, tail: gap };
			drawn.add(cur);

			if (node.type === 'JOIN') {
				// A join that closes nothing here: pass through it, it is never a card.
				const out = outgoing(transitions, cur)[0];
				gap = out ? gapOf(out[0], out[1]) : { indices: [], from: cur };
				cur = out?.[0].to;
				continue;
			}

			if (node.type === 'CHECK' || node.type === 'SPLIT') {
				const type = node.type;
				const defs = lanesOf(type, cur, transitions);
				const starts = defs.filter(d => d.t).map(d => d.t![0].to);
				const merge = defs.every(d => d.t) ? findMerge(starts, closers) : undefined;
				const inner = new Set(closers);
				if (merge) inner.add(merge);
				const lanes: Lane[] = defs.map(d => {
					if (!d.t)
						return {
							label: d.label,
							branch: d.branch,
							seq: { items: [], tail: { indices: [], from: cur!, branch: d.branch } },
							closes: false,
						};
					const r = walk(d.t[0].to, gapOf(d.t[0], d.t[1]), inner);
					return {
						label: d.label,
						branch: d.branch,
						seq: { items: r.items, tail: r.tail },
						closes: !!merge && r.endedAt === merge,
					};
				});
				const branchKey = cur;
				const item: BranchItem = {
					kind: 'branch',
					key: branchKey,
					node,
					type,
					lanes,
					mergeKey: merge,
					joinKey: merge && nodes[merge]?.type === 'JOIN' ? merge : undefined,
					before: gap,
				};
				items.push(item);
				if (!merge) return { items };
				if (closers.has(merge)) return { items, endedAt: merge };
				if (drawn.has(merge)) {
					items.push({ kind: 'goto', target: merge });
					return { items };
				}
				if (nodes[merge]?.type === 'JOIN') {
					drawn.add(merge);
					const out = outgoing(transitions, merge)[0];
					gap = out ? gapOf(out[0], out[1]) : { indices: [], from: merge };
					cur = out?.[0].to;
					continue;
				}
				// The lanes meet at an ordinary node: inserting here rewires every lane's last arrow.
				const inside = keysIn({ items: [item] }, new Set<string>());
				const indices: number[] = [];
				transitions.forEach((t, i) => {
					if (t && t.to === merge && inside.has(t.from)) indices.push(i);
				});
				gap = { indices, to: merge };
				cur = merge;
				continue;
			}

			items.push({ kind: 'card', key: cur, node, before: gap });
			if (node.type === 'END') return { items };
			const outs = outgoing(transitions, cur);
			const out = outs.find(([t]) => !t.branch) ?? outs[0];
			gap = out ? gapOf(out[0], out[1]) : { indices: [], from: cur };
			cur = out?.[0].to;
		}
		return { items, tail: gap };
	};

	const start = doc?.start && nodes[doc.start] ? doc.start : undefined;
	const r = walk(start, { indices: [], start: true, to: start }, new Set());
	// The start gap is a gap even when nothing has been added yet.
	const seq: Seq = {
		items: r.items,
		tail: r.items.length ? r.tail : { indices: [], start: true },
	};
	const orphans = Object.keys(nodes).filter(k => !drawn.has(k) && nodes[k]?.type !== 'JOIN');
	return { seq, orphans };
}

/** Every card key in drawing order (WHEN excluded): what keyboard and run views walk. */
export function cardKeysInOrder(layout: FlowLayout): string[] {
	const out: string[] = [];
	const visit = (seq: Seq) => {
		for (const it of seq.items) {
			if (it.kind === 'goto') continue;
			out.push(it.key);
			if (it.kind === 'branch') it.lanes.forEach(l => visit(l.seq));
		}
	};
	visit(layout.seq);
	return out.concat(layout.orphans);
}

/** Finds the sequence holding `key` and its index there. */
export function locate(
	layout: FlowLayout,
	key: string,
): { seq: Seq; index: number; parent?: BranchItem } | undefined {
	const visit = (seq: Seq, parent?: BranchItem): ReturnType<typeof locate> => {
		for (let i = 0; i < seq.items.length; i++) {
			const it = seq.items[i];
			if (it.kind !== 'goto' && it.key === key) return { seq, index: i, parent };
			if (it.kind === 'branch')
				for (const l of it.lanes) {
					const f = visit(l.seq, it);
					if (f) return f;
				}
		}
		return undefined;
	};
	return visit(layout.seq);
}
