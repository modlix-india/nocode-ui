import { movePoint, parsePath, pathPoints, serializePath } from './svgPath';

describe('svgPath', () => {
	it('parses absolute commands', () => {
		const segs = parsePath('M10 10 L20 30 Z');
		expect(segs).toEqual([
			{ cmd: 'M', args: [10, 10] },
			{ cmd: 'L', args: [20, 30] },
			{ cmd: 'Z', args: [] },
		]);
	});

	it('normalizes relative commands to absolute', () => {
		const segs = parsePath('m10 10 l5 5 l5 -5');
		expect(segs).toEqual([
			{ cmd: 'M', args: [10, 10] },
			{ cmd: 'L', args: [15, 15] },
			{ cmd: 'L', args: [20, 10] },
		]);
	});

	it('handles implicit repeated commands (M then implicit L)', () => {
		const segs = parsePath('M0 0 10 10 20 0');
		expect(segs.map(s => s.cmd)).toEqual(['M', 'L', 'L']);
		expect(segs[2].args).toEqual([20, 0]);
	});

	it('handles H and V', () => {
		const segs = parsePath('M0 0 H50 V50');
		expect(segs).toEqual([
			{ cmd: 'M', args: [0, 0] },
			{ cmd: 'H', args: [50] },
			{ cmd: 'V', args: [50] },
		]);
	});

	it('round-trips cubic curves through serialize', () => {
		const d = 'M10 80 C 40 10 65 10 95 80';
		const segs = parsePath(d);
		expect(serializePath(segs)).toBe('M 10 80 C 40 10 65 10 95 80');
	});

	it('flattens points with anchors and controls', () => {
		const segs = parsePath('M0 0 C10 10 20 20 30 0');
		const pts = pathPoints(segs);
		// M anchor + C two controls + C anchor = 4
		expect(pts.length).toBe(4);
		expect(pts.filter(p => p.kind === 'control').length).toBe(2);
		const anchor = pts.find(p => p.segIndex === 1 && p.kind === 'anchor');
		expect([anchor?.x, anchor?.y]).toEqual([30, 0]);
	});

	it('gives H points the running y and V points the running x', () => {
		const segs = parsePath('M5 7 H50');
		const hPoint = pathPoints(segs).find(p => p.segIndex === 1);
		expect([hPoint?.x, hPoint?.y]).toEqual([50, 7]);
		expect(hPoint?.ayIndex).toBe(-1);
	});

	it('moves a point and updates only the mapped args', () => {
		const segs = parsePath('M0 0 L10 10');
		const pts = pathPoints(segs);
		const lAnchor = pts.find(p => p.segIndex === 1)!;
		const moved = movePoint(segs, lAnchor, 25, 35);
		expect(moved[1].args).toEqual([25, 35]);
		// original untouched
		expect(segs[1].args).toEqual([10, 10]);
	});

	it('moving an H point changes only x', () => {
		const segs = parsePath('M0 0 H50');
		const hPoint = pathPoints(segs).find(p => p.segIndex === 1)!;
		const moved = movePoint(segs, hPoint, 80, 999);
		expect(moved[1].args).toEqual([80]);
	});
});
