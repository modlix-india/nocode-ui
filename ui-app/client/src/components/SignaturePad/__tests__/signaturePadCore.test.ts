/**
 * SignaturePad value logic: nothing drawn gives no value, a stroke gives a PNG data URL cropped to
 * the ink, the whole pad when trimming is off, and a smaller scale when the image is too long for
 * CXZump docSign. The canvas is a fake that records its size and the drawing calls.
 */
import {
	addPoint,
	exportSignature,
	isImageValue,
	isSignatureEmpty,
	SignatureStroke,
	strokesBounds,
} from '../signaturePadCore';

type FakeCanvas = {
	width: number;
	height: number;
	calls: Array<string>;
	getContext: () => any;
	toDataURL: (t?: string) => string;
};

function fakeCanvasFactory(urlFor: (c: FakeCanvas) => string = () => 'data:image/png;base64,AAAA') {
	const made: Array<FakeCanvas> = [];
	const create = () => {
		const calls: Array<string> = [];
		const rec =
			(name: string) =>
			(...a: any[]) =>
				calls.push(
					`${name}(${a.map(x => (typeof x === 'number' ? Math.round(x) : x)).join(',')})`,
				);
		const canvas: FakeCanvas = {
			width: 0,
			height: 0,
			calls,
			getContext: () => ({
				beginPath: rec('beginPath'),
				moveTo: rec('moveTo'),
				lineTo: rec('lineTo'),
				quadraticCurveTo: rec('quadraticCurveTo'),
				arc: rec('arc'),
				fill: rec('fill'),
				stroke: rec('stroke'),
				setTransform: rec('setTransform'),
				translate: rec('translate'),
				clearRect: rec('clearRect'),
				save: rec('save'),
				restore: rec('restore'),
				scale: rec('scale'),
				drawImage: rec('drawImage'),
			}),
			toDataURL: (t?: string) => {
				calls.push(`toDataURL(${t})`);
				return urlFor(canvas);
			},
		};
		made.push(canvas);
		return canvas;
	};
	return { made, create };
}

function stroke(points: Array<[number, number]>, width = 2): SignatureStroke {
	const s: SignatureStroke = { color: '#111827', width, points: [] };
	points.forEach(([x, y]) => addPoint(s, { x, y }));
	return s;
}

test('empty: no strokes, or strokes without points, give no value', () => {
	const { made, create } = fakeCanvasFactory();
	expect(isSignatureEmpty([])).toBe(true);
	expect(
		exportSignature([], { trim: true, padWidth: 300, padHeight: 150, createCanvas: create }),
	).toBeUndefined();
	expect(
		exportSignature([{ color: '#000', width: 2, points: [] }], {
			trim: true,
			padWidth: 300,
			padHeight: 150,
			createCanvas: create,
		}),
	).toBeUndefined();
	expect(made).toHaveLength(0);
});

test('after a stroke: a PNG data URL, cropped to the ink plus the margin, at 2x', () => {
	const { made, create } = fakeCanvasFactory();
	const s = stroke([
		[50, 60],
		[80, 70],
		[120, 90],
	]);
	expect(isSignatureEmpty([s])).toBe(false);
	expect(strokesBounds([s])).toEqual({ minX: 49, minY: 59, maxX: 121, maxY: 91 });

	const url = exportSignature([s], {
		trim: true,
		padWidth: 300,
		padHeight: 150,
		createCanvas: create,
	});
	expect(url).toBe('data:image/png;base64,AAAA');
	expect(made).toHaveLength(1);
	// ink 49..121 x 59..91, margin 4: origin (45, 55), size 80 x 40, at scale 2
	expect(made[0].width).toBe(160);
	expect(made[0].height).toBe(80);
	expect(made[0].calls).toContain('translate(-45,-55)');
	expect(made[0].calls).toContain('toDataURL(image/png)');
	// smoothed: a quadratic curve through the middle point, nothing filled (no background)
	expect(made[0].calls.some(c => c.startsWith('quadraticCurveTo('))).toBe(true);
	expect(made[0].calls).not.toContain('fill()');
});

test('trimming off: the image is the whole pad', () => {
	const { made, create } = fakeCanvasFactory();
	exportSignature(
		[
			stroke([
				[10, 10],
				[40, 20],
			]),
		],
		{
			trim: false,
			padWidth: 300,
			padHeight: 150,
			createCanvas: create,
		},
	);
	expect(made[0].width).toBe(600);
	expect(made[0].height).toBe(300);
	expect(made[0].calls).toContain('translate(0,0)');
});

test('a single tap is a dot', () => {
	const { made, create } = fakeCanvasFactory();
	const url = exportSignature([stroke([[20, 20]], 4)], {
		trim: true,
		padWidth: 300,
		padHeight: 150,
		createCanvas: create,
	});
	expect(url).toMatch(/^data:image\/png/);
	expect(made[0].calls).toContain('fill()');
});

test('clear: after the strokes are removed there is no value again', () => {
	const { create } = fakeCanvasFactory();
	const strokes = [
		stroke([
			[10, 10],
			[40, 20],
		]),
	];
	expect(
		exportSignature(strokes, {
			trim: true,
			padWidth: 300,
			padHeight: 150,
			createCanvas: create,
		}),
	).toBeDefined();
	strokes.length = 0;
	expect(
		exportSignature(strokes, {
			trim: true,
			padWidth: 300,
			padHeight: 150,
			createCanvas: create,
		}),
	).toBeUndefined();
});

test('an image too long for docSign is exported again at a smaller scale', () => {
	const { made, create } = fakeCanvasFactory(
		c => 'data:image/png;base64,' + 'A'.repeat(c.width * 10),
	);
	const url = exportSignature(
		[
			stroke([
				[0, 0],
				[100, 0],
			]),
		],
		{
			trim: true,
			padWidth: 300,
			padHeight: 150,
			createCanvas: create,
			maxLength: 1500,
		},
	);
	// widths 220 (2x), 165 (1.5x), 110 (1x): the 1x one is the first under 1500 characters
	expect(made.map(c => c.width)).toEqual([220, 165, 110]);
	expect(url!.length).toBeLessThan(1500);
});

test('points closer than the minimum distance are dropped', () => {
	const s = stroke([
		[10, 10],
		[10.2, 10.2],
		[12, 10],
	]);
	expect(s.points).toEqual([
		{ x: 10, y: 10 },
		{ x: 12, y: 10 },
	]);
});

test('bound values the pad shows as an image', () => {
	expect(isImageValue('data:image/png;base64,AAAA')).toBe(true);
	expect(isImageValue('')).toBe(false);
	expect(isImageValue('data:,')).toBe(false);
	expect(isImageValue(undefined)).toBe(false);
	expect(isImageValue({})).toBe(false);
});
