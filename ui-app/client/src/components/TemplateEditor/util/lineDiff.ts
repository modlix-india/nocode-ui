// A git-style line diff of two template sources (HTML or text), for the editor's Compare view.

export type DiffOp = 'eq' | 'del' | 'add';

export interface DiffLine {
	op: DiffOp;
	// Line numbers (1-based) in the old and the new source; absent on the side the line is not on.
	oldNo?: number;
	newNo?: number;
	text: string;
}

export interface DiffRow {
	// One row of the side by side view: the old line, the new line, or both (equal, or a changed pair).
	left?: DiffLine;
	right?: DiffLine;
}

export interface DiffHunk {
	oldStart: number;
	newStart: number;
	lines: DiffLine[];
	rows: DiffRow[];
}

export interface DiffResult {
	added: number;
	removed: number;
	hunks: DiffHunk[];
	// every line, in order, for the unified view of a short source
	all: DiffLine[];
}

// A minified template is one long line. Cut it where a reader would: between tags and after a CSS rule,
// so a change shows as the line it is. A source that already has lines is only normalised, not re-cut
// more than that.
export function splitSource(src: string): string[] {
	const s = (src ?? '').replace(/\r\n?/g, '\n');
	if (!s.trim()) return [];
	// A CSS rule ends a line only inside <style>: a } elsewhere closes a merge field.
	const cut = s
		.replace(
			/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
			(_m, a, css, c) => a + css.replace(/}\s*/g, '}\n') + c,
		)
		.replace(/>\s*</g, '>\n<');
	return cut.split('\n').map(l => l.replace(/\s+$/, ''));
}

const MAX_CELLS = 4_000_000;

// Longest common subsequence over lines. Equal prefix and suffix are peeled first, which is most of a small
// edit; a pair too big for the table falls back to "all old out, all new in" for the middle.
export function diffLines(oldLines: string[], newLines: string[]): DiffLine[] {
	let start = 0;
	while (
		start < oldLines.length &&
		start < newLines.length &&
		oldLines[start] === newLines[start]
	)
		start++;
	let endO = oldLines.length;
	let endN = newLines.length;
	while (endO > start && endN > start && oldLines[endO - 1] === newLines[endN - 1]) {
		endO--;
		endN--;
	}
	const a = oldLines.slice(start, endO);
	const b = newLines.slice(start, endN);
	const ops: Array<{ op: DiffOp; text: string }> = [];
	for (let i = 0; i < start; i++) ops.push({ op: 'eq', text: oldLines[i] });

	if (a.length * b.length > MAX_CELLS) {
		a.forEach(text => ops.push({ op: 'del', text }));
		b.forEach(text => ops.push({ op: 'add', text }));
	} else {
		const w = b.length + 1;
		const dp = new Uint32Array((a.length + 1) * w);
		for (let i = a.length - 1; i >= 0; i--)
			for (let j = b.length - 1; j >= 0; j--)
				dp[i * w + j] =
					a[i] === b[j]
						? dp[(i + 1) * w + j + 1] + 1
						: Math.max(dp[(i + 1) * w + j], dp[i * w + j + 1]);
		let i = 0;
		let j = 0;
		while (i < a.length && j < b.length) {
			if (a[i] === b[j]) {
				ops.push({ op: 'eq', text: a[i] });
				i++;
				j++;
			} else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) {
				ops.push({ op: 'del', text: a[i++] });
			} else {
				ops.push({ op: 'add', text: b[j++] });
			}
		}
		while (i < a.length) ops.push({ op: 'del', text: a[i++] });
		while (j < b.length) ops.push({ op: 'add', text: b[j++] });
	}
	for (let i = endO; i < oldLines.length; i++) ops.push({ op: 'eq', text: oldLines[i] });

	let o = 0;
	let n = 0;
	return ops.map(x => {
		if (x.op === 'eq') return { op: 'eq', oldNo: ++o, newNo: ++n, text: x.text };
		if (x.op === 'del') return { op: 'del', oldNo: ++o, text: x.text };
		return { op: 'add', newNo: ++n, text: x.text };
	});
}

// Pair the removed and added lines of one change side by side; a longer side leaves blanks opposite.
export function toRows(lines: DiffLine[]): DiffRow[] {
	const rows: DiffRow[] = [];
	let i = 0;
	while (i < lines.length) {
		const l = lines[i];
		if (l.op === 'eq') {
			rows.push({ left: l, right: l });
			i++;
			continue;
		}
		const dels: DiffLine[] = [];
		const adds: DiffLine[] = [];
		while (i < lines.length && lines[i].op !== 'eq') {
			(lines[i].op === 'del' ? dels : adds).push(lines[i]);
			i++;
		}
		for (let k = 0; k < Math.max(dels.length, adds.length); k++)
			rows.push({ left: dels[k], right: adds[k] });
	}
	return rows;
}

// Changes with `context` unchanged lines around them; changes closer than that join into one hunk.
export function compareSources(before: string, after: string, context = 3): DiffResult {
	const all = diffLines(splitSource(before), splitSource(after));
	const added = all.filter(l => l.op === 'add').length;
	const removed = all.filter(l => l.op === 'del').length;
	const keep = new Array<boolean>(all.length).fill(false);
	all.forEach((l, i) => {
		if (l.op === 'eq') return;
		for (let k = Math.max(0, i - context); k <= Math.min(all.length - 1, i + context); k++)
			keep[k] = true;
	});
	const hunks: DiffHunk[] = [];
	let cur: DiffLine[] | undefined;
	all.forEach((l, i) => {
		if (!keep[i]) {
			cur = undefined;
			return;
		}
		if (!cur) {
			cur = [];
			hunks.push({
				oldStart: l.oldNo ?? all.slice(0, i).filter(x => x.op !== 'add').length + 1,
				newStart: l.newNo ?? all.slice(0, i).filter(x => x.op !== 'del').length + 1,
				lines: cur,
				rows: [],
			});
		}
		cur.push(l);
	});
	hunks.forEach(h => (h.rows = toRows(h.lines)));
	return { added, removed, hunks, all };
}

// For a changed pair: the text before, the part that differs and the text after, so the view can mark
// just the words that moved.
export function splitChange(
	oldText: string,
	newText: string,
): { old: [string, string, string]; new: [string, string, string] } {
	let p = 0;
	while (p < oldText.length && p < newText.length && oldText[p] === newText[p]) p++;
	let s = 0;
	while (
		s < oldText.length - p &&
		s < newText.length - p &&
		oldText[oldText.length - 1 - s] === newText[newText.length - 1 - s]
	)
		s++;
	return {
		old: [
			oldText.slice(0, p),
			oldText.slice(p, oldText.length - s),
			oldText.slice(oldText.length - s),
		],
		new: [
			newText.slice(0, p),
			newText.slice(p, newText.length - s),
			newText.slice(newText.length - s),
		],
	};
}
