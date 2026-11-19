// The legacy build runs on browsers without the newest JavaScript (Map.getOrInsertComputed).
// Renders a PDF (a blob URL) to canvases with pdf.js, for the editor's PDF compare. pdf.js is big, so it is
// imported here, on first use, and this module is only imported from the lazily loaded PdfCompare.

type PdfJs = typeof import('pdfjs-dist/legacy/build/pdf.mjs');
let lib: Promise<PdfJs> | undefined;

function loadPdfJs(): Promise<PdfJs> {
	if (!lib) {
		lib = import('pdfjs-dist/legacy/build/pdf.mjs').then(m => {
			m.GlobalWorkerOptions.workerSrc = new URL(
				'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
				import.meta.url,
			).toString();
			return m;
		});
	}
	return lib;
}

export interface RenderedPage {
	canvas: HTMLCanvasElement;
	width: number;
	height: number;
}

// Every page of the PDF at `scale` (1 = 96 dpi), white background.
export async function renderPdf(url: string, scale = 1.25): Promise<RenderedPage[]> {
	const pdfjs = await loadPdfJs();
	const data = await (await fetch(url)).arrayBuffer();
	const task = pdfjs.getDocument({ data });
	const doc = await task.promise;
	const pages: RenderedPage[] = [];
	try {
		for (let n = 1; n <= doc.numPages; n++) {
			const page = await doc.getPage(n);
			const viewport = page.getViewport({ scale });
			const canvas = document.createElement('canvas');
			canvas.width = Math.ceil(viewport.width);
			canvas.height = Math.ceil(viewport.height);
			const ctx = canvas.getContext('2d')!;
			ctx.fillStyle = '#fff';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			await page.render({ canvasContext: ctx, viewport, canvas }).promise;
			pages.push({ canvas, width: canvas.width, height: canvas.height });
		}
	} finally {
		await task.destroy();
	}
	return pages;
}

export interface PageDiff {
	canvas: HTMLCanvasElement;
	// share of the page's area that differs (0 to 1)
	changed: number;
}

const CELL = 8;

// The new page as it is, with a translucent red wash over every 8 px square where it differs from the old page, so
// the text stays readable under the marks. A page that exists on one side only is washed all over.
export function diffPage(
	before: RenderedPage | undefined,
	after: RenderedPage | undefined,
): PageDiff {
	const w = Math.max(before?.width ?? 0, after?.width ?? 0);
	const h = Math.max(before?.height ?? 0, after?.height ?? 0);
	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d')!;
	ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, w, h);
	const shown = after ?? before;
	if (shown) ctx.drawImage(shown.canvas, 0, 0);
	const get = (p?: RenderedPage) => {
		const c = document.createElement('canvas');
		c.width = w;
		c.height = h;
		const x = c.getContext('2d')!;
		x.fillStyle = '#fff';
		x.fillRect(0, 0, w, h);
		if (p) x.drawImage(p.canvas, 0, 0);
		return x.getImageData(0, 0, w, h).data;
	};
	const a = get(before);
	const b = get(after);
	const cols = Math.ceil(w / CELL);
	const rows = Math.ceil(h / CELL);
	const hit = new Uint8Array(cols * rows);
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const i = (y * w + x) * 4;
			const d =
				Math.abs(a[i] - b[i]) +
				Math.abs(a[i + 1] - b[i + 1]) +
				Math.abs(a[i + 2] - b[i + 2]);
			if (d > 60) hit[Math.floor(y / CELL) * cols + Math.floor(x / CELL)] = 1;
		}
	}
	ctx.fillStyle = 'rgba(220, 38, 38, 0.28)';
	let cells = 0;
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			if (!hit[r * cols + c]) continue;
			cells++;
			ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
		}
	}
	return { canvas, changed: cells / (cols * rows || 1) };
}
