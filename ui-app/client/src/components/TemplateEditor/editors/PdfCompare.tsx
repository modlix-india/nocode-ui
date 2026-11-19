import React, { useEffect, useRef, useState } from 'react';
import { diffPage, PageDiff, RenderedPage, renderPdf } from '../util/pdfRender';
import { fetchPdfPreview, PreviewHeaders } from '../util/previewApi';

interface PdfCompareProps {
	before: any;
	after: any;
	data: any;
	headers: PreviewHeaders;
	mode: 'pages' | 'diff';
	beforeLabel: string;
	afterLabel: string;
}

function CanvasHost({
	canvas,
	label,
}: Readonly<{ canvas: HTMLCanvasElement | undefined; label?: string }>) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const host = ref.current;
		if (!host) return;
		host.innerHTML = '';
		if (!canvas) return;
		// draw a copy so the same page can show in two views
		const c = document.createElement('canvas');
		c.width = canvas.width;
		c.height = canvas.height;
		c.getContext('2d')!.drawImage(canvas, 0, 0);
		c.style.width = '100%';
		c.style.height = 'auto';
		c.style.display = 'block';
		host.appendChild(c);
	}, [canvas]);
	return (
		<div className="_pcPage">
			{label && <div className="_pcPageLabel">{label}</div>}
			<div ref={ref} className="_pcCanvas" />
			{!canvas && <div className="_pcNoPage">No page</div>}
		</div>
	);
}

// The PDF the template made when it was opened next to the PDF it makes now (the same sample data for both), page by
// page in one scrolling list so they move together; or the new pages with every changed pixel in red.
export default function PdfCompare({
	before,
	after,
	data,
	headers,
	mode,
	beforeLabel,
	afterLabel,
}: Readonly<PdfCompareProps>) {
	const [state, setState] = useState<{
		loading: boolean;
		error?: string;
		was: RenderedPage[];
		now: RenderedPage[];
		diffs: PageDiff[];
	}>({ loading: true, was: [], now: [], diffs: [] });

	useEffect(() => {
		let dead = false;
		const urls: string[] = [];
		(async () => {
			try {
				const [u1, u2] = await Promise.all([
					fetchPdfPreview(before, data, headers),
					fetchPdfPreview(after, data, headers),
				]);
				urls.push(u1, u2);
				const [was, now] = await Promise.all([renderPdf(u1), renderPdf(u2)]);
				const diffs = Array.from({ length: Math.max(was.length, now.length) }, (_, i) =>
					diffPage(was[i], now[i]),
				);
				if (!dead) setState({ loading: false, was, now, diffs });
			} catch (e: any) {
				if (!dead)
					setState({
						loading: false,
						error: e?.response?.status
							? `Could not make the PDF (HTTP ${e.response.status})`
							: (e?.message ?? 'Could not make the PDF'),
						was: [],
						now: [],
						diffs: [],
					});
			}
		})();
		return () => {
			dead = true;
			urls.forEach(u => URL.revokeObjectURL(u));
		};
	}, [before, after, data, headers]);

	if (state.loading) return <div className="_pcNote">Making the two PDFs…</div>;
	if (state.error) return <div className="_pcNote _pcError">{state.error}</div>;
	const changedPages = state.diffs.filter(d => d.changed > 0).length;

	return (
		<div className="_pcView">
			<div className="_pcSummary">
				{changedPages === 0
					? 'The two PDFs look the same.'
					: `${changedPages} of ${state.diffs.length} page${state.diffs.length === 1 ? '' : 's'} changed.`}
				{mode === 'diff' && changedPages > 0 && ' Red marks what is different.'}
			</div>
			{mode === 'pages' && (
				<div className="_pcColHead">
					<span>{beforeLabel}</span>
					<span>{afterLabel}</span>
				</div>
			)}
			<div className="_pcScroll">
				{state.diffs.map((d, i) =>
					mode === 'pages' ? (
						<div className="_pcRow" key={i}>
							<CanvasHost canvas={state.was[i]?.canvas} label={`Page ${i + 1}`} />
							<CanvasHost
								canvas={state.now[i]?.canvas}
								label={d.changed > 0 ? `Page ${i + 1} (changed)` : `Page ${i + 1}`}
							/>
						</div>
					) : (
						<div className="_pcRow _pcOne" key={i}>
							<CanvasHost
								canvas={d.canvas}
								label={`Page ${i + 1}${d.changed > 0 ? ` (${(d.changed * 100).toFixed(1)}% changed)` : ' (no change)'}`}
							/>
						</div>
					),
				)}
			</div>
		</div>
	);
}
