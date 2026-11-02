/**
 * The drawing and export logic of the SignaturePad, kept free of React and the store so it can be
 * tested with a fake canvas. Only LazySignaturePad imports this file, so it ships in the lazy chunk.
 *
 * Points are kept in CSS pixels relative to the pad. Strokes are smoothed with quadratic curves
 * through the midpoints of consecutive points; the live drawing (drawSegment / drawStrokeEnd) and
 * the full redraw (drawStroke) trace the same curve, so a resize or an undo repaints exactly what
 * the signer saw.
 */

export type SignaturePoint = { x: number; y: number };
export type SignatureStroke = { color: string; width: number; points: Array<SignaturePoint> };

/** CXZump docSign refuses an image of 300000 characters or more; stay well under that. */
export const MAX_IMAGE_LENGTH = 280000;
/** Export scales tried in order until the data URL fits MAX_IMAGE_LENGTH. */
export const EXPORT_SCALES = [2, 1.5, 1, 0.75];
/** Points closer than this (CSS px) to the previous one are dropped: less noise, smaller PNG. */
export const MIN_POINT_DISTANCE = 0.75;

export const DEFAULT_PEN_COLOR = '#111827';
export const DEFAULT_PEN_WIDTH = 2.5;
export const DEFAULT_PAD_HEIGHT = 180;

type Ctx2D = Pick<
	CanvasRenderingContext2D,
	| 'beginPath'
	| 'moveTo'
	| 'lineTo'
	| 'quadraticCurveTo'
	| 'arc'
	| 'fill'
	| 'stroke'
	| 'setTransform'
	| 'clearRect'
	| 'save'
	| 'restore'
	| 'scale'
	| 'translate'
	| 'drawImage'
> & {
	lineCap: CanvasLineCap;
	lineJoin: CanvasLineJoin;
	lineWidth: number;
	strokeStyle: any;
	fillStyle: any;
};

export type CanvasLike = {
	width: number;
	height: number;
	getContext(type: '2d'): Ctx2D | null;
	toDataURL(type?: string): string;
};

const mid = (a: SignaturePoint, b: SignaturePoint): SignaturePoint => ({
	x: (a.x + b.x) / 2,
	y: (a.y + b.y) / 2,
});

function prepare(ctx: Ctx2D, stroke: SignatureStroke) {
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.lineWidth = stroke.width;
	ctx.strokeStyle = stroke.color;
	ctx.fillStyle = stroke.color;
}

function drawDot(ctx: Ctx2D, stroke: SignatureStroke, p: SignaturePoint) {
	prepare(ctx, stroke);
	ctx.beginPath();
	ctx.arc(p.x, p.y, Math.max(stroke.width / 2, 0.5), 0, Math.PI * 2);
	ctx.fill();
}

/** Adds a point unless it is too close to the last one. Returns true when it was added. */
export function addPoint(stroke: SignatureStroke, p: SignaturePoint): boolean {
	const last = stroke.points[stroke.points.length - 1];
	if (last && Math.hypot(p.x - last.x, p.y - last.y) < MIN_POINT_DISTANCE) return false;
	stroke.points.push({ x: p.x, y: p.y });
	return true;
}

/** Draws the piece of the curve that point `i` (just added) makes visible. */
export function drawSegment(ctx: Ctx2D, stroke: SignatureStroke, i: number) {
	const pts = stroke.points;
	if (i === 0) {
		drawDot(ctx, stroke, pts[0]);
		return;
	}
	prepare(ctx, stroke);
	ctx.beginPath();
	if (i === 1) {
		ctx.moveTo(pts[0].x, pts[0].y);
		const m = mid(pts[0], pts[1]);
		ctx.lineTo(m.x, m.y);
	} else {
		const from = mid(pts[i - 2], pts[i - 1]);
		const to = mid(pts[i - 1], pts[i]);
		ctx.moveTo(from.x, from.y);
		ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, to.x, to.y);
	}
	ctx.stroke();
}

/** Closes a live stroke: the last half segment up to the final point. */
export function drawStrokeEnd(ctx: Ctx2D, stroke: SignatureStroke) {
	const pts = stroke.points;
	if (pts.length < 2) return;
	const n = pts.length;
	const from = mid(pts[n - 2], pts[n - 1]);
	prepare(ctx, stroke);
	ctx.beginPath();
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(pts[n - 1].x, pts[n - 1].y);
	ctx.stroke();
}

/** Draws a whole stroke, the same curve the live segments draw. */
export function drawStroke(ctx: Ctx2D, stroke: SignatureStroke) {
	const pts = stroke.points;
	if (!pts.length) return;
	if (pts.length === 1) {
		drawDot(ctx, stroke, pts[0]);
		return;
	}
	prepare(ctx, stroke);
	ctx.beginPath();
	ctx.moveTo(pts[0].x, pts[0].y);
	const first = mid(pts[0], pts[1]);
	ctx.lineTo(first.x, first.y);
	for (let i = 1; i < pts.length - 1; i++) {
		const m = mid(pts[i], pts[i + 1]);
		ctx.quadraticCurveTo(pts[i].x, pts[i].y, m.x, m.y);
	}
	ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
	ctx.stroke();
}

export function isSignatureEmpty(strokes: Array<SignatureStroke>): boolean {
	return !strokes.some(s => s.points.length > 0);
}

/** Ink bounds in CSS px, widened by half the pen width so round caps are not cut. */
export function strokesBounds(
	strokes: Array<SignatureStroke>,
): { minX: number; minY: number; maxX: number; maxY: number } | undefined {
	let minX = Infinity,
		minY = Infinity,
		maxX = -Infinity,
		maxY = -Infinity;
	for (const s of strokes) {
		const r = s.width / 2;
		for (const p of s.points) {
			minX = Math.min(minX, p.x - r);
			minY = Math.min(minY, p.y - r);
			maxX = Math.max(maxX, p.x + r);
			maxY = Math.max(maxY, p.y + r);
		}
	}
	if (minX === Infinity) return undefined;
	return { minX, minY, maxX, maxY };
}

export type ExportOptions = {
	/** Crop the image to the ink (plus `margin`); otherwise the whole pad area. */
	trim: boolean;
	/** Pad size in CSS px, used when not trimming. */
	padWidth: number;
	padHeight: number;
	/** Space kept around the ink when trimming, CSS px. */
	margin?: number;
	maxLength?: number;
	scales?: Array<number>;
	createCanvas?: () => CanvasLike;
};

/**
 * The value written to the binding: a PNG data URL with a transparent background, or undefined
 * when nothing is drawn. Tries the scales in order and returns the first image under maxLength
 * (the last one tried if none fits).
 */
export function exportSignature(
	strokes: Array<SignatureStroke>,
	{
		trim,
		padWidth,
		padHeight,
		margin = 4,
		maxLength = MAX_IMAGE_LENGTH,
		scales = EXPORT_SCALES,
		createCanvas = () => document.createElement('canvas') as unknown as CanvasLike,
	}: ExportOptions,
): string | undefined {
	if (isSignatureEmpty(strokes)) return undefined;
	const b = strokesBounds(strokes)!;

	let ox = 0,
		oy = 0,
		w: number,
		h: number;
	if (trim) {
		ox = Math.floor(b.minX - margin);
		oy = Math.floor(b.minY - margin);
		w = Math.ceil(b.maxX + margin) - ox;
		h = Math.ceil(b.maxY + margin) - oy;
	} else {
		w = Math.ceil(Math.max(padWidth, b.maxX));
		h = Math.ceil(Math.max(padHeight, b.maxY));
	}
	w = Math.max(w, 1);
	h = Math.max(h, 1);

	let url: string | undefined;
	for (const scale of scales) {
		const canvas = createCanvas();
		canvas.width = Math.max(1, Math.round(w * scale));
		canvas.height = Math.max(1, Math.round(h * scale));
		const ctx = canvas.getContext('2d');
		if (!ctx) return undefined;
		ctx.setTransform(scale, 0, 0, scale, 0, 0);
		ctx.translate(-ox, -oy);
		for (const s of strokes) drawStroke(ctx, s);
		url = canvas.toDataURL('image/png');
		if (url.length < maxLength) return url;
	}
	return url;
}

/** A bound value the pad can show: a data URL or an http(s) / relative image URL. */
export function isImageValue(v: any): v is string {
	return typeof v === 'string' && v.trim() !== '' && v !== 'data:,';
}
