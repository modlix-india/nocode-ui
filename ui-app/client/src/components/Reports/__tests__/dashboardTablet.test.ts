import { sortLayout, tabletLayout } from '../dashboardLayout';
import { LayoutItem } from '../reportTypes';

const it3 = (id: string, x: number, y: number, w: number, h = 2): LayoutItem => ({
	id,
	x,
	y,
	w,
	h,
});

describe('tablet layout', () => {
	test('small tiles pair up at half width, wide ones take the row, in reading order', () => {
		// The cxzump dashboard's first row: 3, 2, 2 and 3 wide KPIs, then a 6 + 6 chart row.
		const desk = [
			it3('a', 0, 0, 3),
			it3('b', 3, 0, 2),
			it3('c', 5, 0, 2),
			it3('d', 9, 0, 3),
			it3('e', 0, 2, 6, 4),
			it3('f', 6, 2, 6, 4),
		];
		const tab = tabletLayout(sortLayout(desk));
		const at = (id: string) => tab.find(t => t.id === id)!;
		expect([at('a'), at('b')].map(t => [t.x, t.y, t.w])).toEqual([
			[0, 0, 6],
			[6, 0, 6],
		]);
		expect([at('c'), at('d')].map(t => [t.x, t.y, t.w])).toEqual([
			[0, 2, 6],
			[6, 2, 6],
		]);
		expect([at('e'), at('f')].map(t => [t.x, t.y, t.w])).toEqual([
			[0, 4, 12],
			[0, 8, 12],
		]);
		expect(sortLayout(tab).map(t => t.id)).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
	});

	test('keeps each tile height and never overlaps', () => {
		const tab = tabletLayout([
			it3('a', 0, 0, 4, 3),
			it3('b', 4, 0, 4, 1),
			it3('c', 8, 0, 4, 2),
		]);
		expect(tab.map(t => t.h)).toEqual([3, 1, 2]);
		for (const p of tab)
			for (const q of tab)
				if (p !== q)
					expect(
						p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.h && q.y < p.y + p.h,
					).toBe(false);
	});
});
