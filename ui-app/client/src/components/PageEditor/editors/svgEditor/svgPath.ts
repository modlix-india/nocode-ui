// Path-data (`<path d>`) parsing for the editor.
//
// parsePath normalizes everything to ABSOLUTE commands so editing is uniform.
// pathPoints flattens segments into editable points (anchors + control points),
// each carrying the segment + arg indices it maps back to, so the structured
// rows and the on-canvas drag handles share one model.

export interface PathSeg {
	cmd: string; // absolute command letter: M L H V C S Q T A Z
	args: number[];
}

export interface PathPoint {
	x: number;
	y: number;
	segIndex: number;
	axIndex: number; // index in seg.args holding x (-1 if none, e.g. V)
	ayIndex: number; // index in seg.args holding y (-1 if none, e.g. H)
	kind: 'anchor' | 'control';
}

const ARITY: Record<string, number> = {
	M: 2,
	L: 2,
	H: 1,
	V: 1,
	C: 6,
	S: 4,
	Q: 4,
	T: 2,
	A: 7,
	Z: 0,
};

// Tokenize into command letters and signed/decimal/exponent numbers.
function tokenize(d: string): string[] {
	return d.match(/[a-zA-Z]|-?\d*\.?\d+(?:[eE][+-]?\d+)?/g) ?? [];
}

function round(n: number): number {
	return Math.round(n * 1000) / 1000;
}

// Converts one relative command's args to absolute given the current point.
function toAbsoluteArgs(upper: string, args: number[], cx: number, cy: number): number[] {
	const out = [...args];
	switch (upper) {
		case 'H':
			out[0] += cx;
			break;
		case 'V':
			out[0] += cy;
			break;
		case 'A':
			out[5] += cx;
			out[6] += cy;
			break;
		default:
			// Every arg is an (x,y) pair offset for M/L/T/C/S/Q.
			for (let i = 0; i < out.length; i += 2) {
				out[i] += cx;
				out[i + 1] += cy;
			}
	}
	return out;
}

export function parsePath(d: string): PathSeg[] {
	const tokens = tokenize(d);
	const segs: PathSeg[] = [];
	let cx = 0;
	let cy = 0;
	let sx = 0;
	let sy = 0;
	let i = 0;
	let lastCmd = '';

	while (i < tokens.length) {
		let cmd = tokens[i];
		if (/[a-zA-Z]/.test(cmd)) {
			i++;
		} else {
			// Implicit repeat: a number where a command was expected reuses the
			// previous command (M repeats as L, m as l).
			cmd = lastCmd === 'M' ? 'L' : lastCmd === 'm' ? 'l' : lastCmd;
			if (!cmd) break;
		}

		const upper = cmd.toUpperCase();
		const relative = cmd !== upper;
		const arity = ARITY[upper];
		if (arity === undefined) break;

		if (upper === 'Z') {
			segs.push({ cmd: 'Z', args: [] });
			cx = sx;
			cy = sy;
			lastCmd = cmd;
			continue;
		}

		const raw = tokens.slice(i, i + arity).map(Number);
		if (raw.length < arity || raw.some(Number.isNaN)) break;
		i += arity;

		const args = relative ? toAbsoluteArgs(upper, raw, cx, cy) : raw;

		// advance current point
		if (upper === 'H') cx = args[0];
		else if (upper === 'V') cy = args[0];
		else {
			cx = args[args.length - 2];
			cy = args[args.length - 1];
		}
		if (upper === 'M') {
			sx = cx;
			sy = cy;
		}

		segs.push({ cmd: upper, args });
		lastCmd = cmd;
	}

	return segs;
}

export function serializePath(segs: PathSeg[]): string {
	return segs
		.map(s => (s.cmd === 'Z' ? 'Z' : `${s.cmd} ${s.args.map(round).join(' ')}`))
		.join(' ');
}

// Flattens segments into editable points. Tracks the running point so H/V
// handles can show the correct cross-axis position.
export function pathPoints(segs: PathSeg[]): PathPoint[] {
	const pts: PathPoint[] = [];
	let cx = 0;
	let cy = 0;

	const pair = (segIndex: number, ax: number, ay: number, kind: PathPoint['kind']) =>
		pts.push({
			x: segs[segIndex].args[ax],
			y: segs[segIndex].args[ay],
			segIndex,
			axIndex: ax,
			ayIndex: ay,
			kind,
		});

	segs.forEach((s, segIndex) => {
		switch (s.cmd) {
			case 'M':
			case 'L':
			case 'T':
				pair(segIndex, 0, 1, 'anchor');
				cx = s.args[0];
				cy = s.args[1];
				break;
			case 'H':
				pts.push({
					x: s.args[0],
					y: cy,
					segIndex,
					axIndex: 0,
					ayIndex: -1,
					kind: 'anchor',
				});
				cx = s.args[0];
				break;
			case 'V':
				pts.push({
					x: cx,
					y: s.args[0],
					segIndex,
					axIndex: -1,
					ayIndex: 0,
					kind: 'anchor',
				});
				cy = s.args[0];
				break;
			case 'C':
				pair(segIndex, 0, 1, 'control');
				pair(segIndex, 2, 3, 'control');
				pair(segIndex, 4, 5, 'anchor');
				cx = s.args[4];
				cy = s.args[5];
				break;
			case 'S':
			case 'Q':
				pair(segIndex, 0, 1, 'control');
				pair(segIndex, 2, 3, 'anchor');
				cx = s.args[2];
				cy = s.args[3];
				break;
			case 'A':
				pair(segIndex, 5, 6, 'anchor');
				cx = s.args[5];
				cy = s.args[6];
				break;
			default:
				break; // Z
		}
	});

	return pts;
}

export function movePoint(segs: PathSeg[], pt: PathPoint, x: number, y: number): PathSeg[] {
	const next = segs.map((s, idx) =>
		idx === pt.segIndex ? { cmd: s.cmd, args: [...s.args] } : s,
	);
	const seg = next[pt.segIndex];
	if (pt.axIndex >= 0) seg.args[pt.axIndex] = round(x);
	if (pt.ayIndex >= 0) seg.args[pt.ayIndex] = round(y);
	return next;
}
