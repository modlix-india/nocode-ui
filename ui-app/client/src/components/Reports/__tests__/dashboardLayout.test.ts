import {
	addItem,
	clampItem,
	collides,
	compact,
	COLS,
	flowLayout,
	moveInOrder,
	moveItem,
	placeAtTop,
	resizeItem,
	sortLayout,
	pixelsToCells,
} from '../dashboardLayout';
import { LayoutItem } from '../reportTypes';

const noOverlap = (l: LayoutItem[]) => {
	for (const a of l) for (const b of l) if (a.id !== b.id) expect(collides(a, b)).toBe(false);
};

describe('12 column tile grid', () => {
	test('clamp keeps tiles inside 12 columns', () => {
		expect(clampItem({ id: 'a', x: 11, y: -3, w: 4, h: 0 })).toEqual({
			id: 'a',
			x: 8,
			y: 0,
			w: 4,
			h: 1,
		});
		expect(clampItem({ id: 'a', x: 0, y: 0, w: 40, h: 99 }).w).toBe(COLS);
	});

	test('addItem finds the first free spot', () => {
		let l: LayoutItem[] = [];
		l = addItem(l, 'a', 6, 2);
		l = addItem(l, 'b', 6, 2);
		l = addItem(l, 'c', 4, 2);
		expect(l.find(i => i.id === 'b')).toMatchObject({ x: 6, y: 0 });
		expect(l.find(i => i.id === 'c')).toMatchObject({ x: 0, y: 2 });
		noOverlap(l);
	});

	test('a drag onto another tile swaps them, no gaps', () => {
		const l = flowLayout([
			{ id: 'a', x: 0, y: 0, w: 6, h: 2 },
			{ id: 'b', x: 0, y: 0, w: 6, h: 2 },
		]);
		const moved = moveItem(l, 'b', 0, 0);
		expect(moved.find(i => i.id === 'b')).toMatchObject({ x: 0, y: 0 });
		noOverlap(moved);
	});

	test('snap resize stays inside the grid and pushes neighbours down', () => {
		const l = flowLayout([
			{ id: 'a', x: 0, y: 0, w: 6, h: 2 },
			{ id: 'b', x: 0, y: 0, w: 6, h: 2 },
		]);
		const r = resizeItem(l, 'a', 9, 3);
		expect(r.find(i => i.id === 'a')).toMatchObject({ w: 9, h: 3 });
		noOverlap(r);
		expect(resizeItem(l, 'b', 20, 2).find(i => i.id === 'b')!.w).toBe(6);
	});

	test('phone move up / down changes reading order', () => {
		const l = flowLayout([
			{ id: 'a', x: 0, y: 0, w: 12, h: 2 },
			{ id: 'b', x: 0, y: 0, w: 12, h: 3 },
			{ id: 'c', x: 0, y: 0, w: 12, h: 2 },
		]);
		const up = moveInOrder(l, 'c', -1);
		expect(sortLayout(up).map(i => i.id)).toEqual(['a', 'c', 'b']);
		const down = moveInOrder(l, 'a', 1);
		expect(sortLayout(down).map(i => i.id)).toEqual(['b', 'a', 'c']);
		expect(moveInOrder(l, 'a', -1)).toBe(l);
		noOverlap(up);
	});

	test('placeAtTop puts new tiles first and moves the rest below', () => {
		const l = flowLayout([{ id: 'a', x: 0, y: 0, w: 6, h: 2 }]);
		const r = placeAtTop(l, [{ id: 'n', x: 0, y: 0, w: 12, h: 3, isNew: true }]);
		expect(r.find(i => i.id === 'n')).toMatchObject({ x: 0, y: 0, isNew: true });
		expect(r.find(i => i.id === 'a')!.y).toBe(3);
		noOverlap(r);
	});

	test('compact removes gaps', () => {
		expect(compact([{ id: 'a', x: 0, y: 5, w: 4, h: 2 }])[0].y).toBe(0);
	});

	test('pixels to cells', () => {
		expect(pixelsToCells(130, 60)).toBe(2);
		expect(pixelsToCells(10, 0)).toBe(0);
	});
});
