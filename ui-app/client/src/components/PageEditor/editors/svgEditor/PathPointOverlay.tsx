import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { EDIT_ID_ATTR } from './svgDocument';
import { parsePath, PathPoint, pathPoints } from './svgPath';

type DragPhase = 'move' | 'end';

interface Handle {
	left: number;
	top: number;
	pt: PathPoint;
}

// Draggable anchor/control handles for the selected <path>, overlaid on the
// live preview. Positions come from the rendered path's getScreenCTM(), so
// viewBox + ancestor transforms are handled with no manual math.
export function PathPointOverlay({
	canvasRef,
	editId,
	d,
	onMove,
}: Readonly<{
	canvasRef: React.RefObject<HTMLDivElement>;
	editId: string;
	d: string;
	onMove: (pt: PathPoint, x: number, y: number, phase: DragPhase) => void;
}>) {
	const [handles, setHandles] = useState<Handle[]>([]);
	const ctmRef = useRef<DOMMatrix | null>(null);

	const findPath = useCallback((): SVGGraphicsElement | null => {
		const el = canvasRef.current?.querySelector(`[${EDIT_ID_ATTR}="${editId}"]`);
		return el && 'getScreenCTM' in el ? (el as SVGGraphicsElement) : null;
	}, [canvasRef, editId]);

	const recompute = useCallback(() => {
		const canvas = canvasRef.current;
		const pathEl = findPath();
		const ctm = pathEl?.getScreenCTM();
		if (!canvas || !ctm) {
			setHandles([]);
			return;
		}
		ctmRef.current = ctm;
		const rect = canvas.getBoundingClientRect();
		setHandles(
			pathPoints(parsePath(d)).map(pt => {
				const p = new DOMPoint(pt.x, pt.y).matrixTransform(ctm);
				return { left: p.x - rect.left, top: p.y - rect.top, pt };
			}),
		);
	}, [canvasRef, findPath, d]);

	useLayoutEffect(() => recompute(), [recompute]);

	useEffect(() => {
		const canvas = canvasRef.current;
		window.addEventListener('resize', recompute);
		canvas?.addEventListener('scroll', recompute);
		return () => {
			window.removeEventListener('resize', recompute);
			canvas?.removeEventListener('scroll', recompute);
		};
	}, [canvasRef, recompute]);

	const startDrag = (e: React.PointerEvent, pt: PathPoint) => {
		e.preventDefault();
		e.stopPropagation();
		const ctm = ctmRef.current;
		if (!ctm) return;
		const inverse = ctm.inverse();
		let frame = 0;
		let last = { x: pt.x, y: pt.y };

		const toUser = (ev: PointerEvent) =>
			new DOMPoint(ev.clientX, ev.clientY).matrixTransform(inverse);

		const move = (ev: PointerEvent) => {
			const u = toUser(ev);
			last = { x: u.x, y: u.y };
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				onMove(pt, last.x, last.y, 'move');
			});
		};
		const up = () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
			onMove(pt, last.x, last.y, 'end');
		};
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
	};

	return (
		<div className="_svgPathHandles">
			{handles.map((h, i) => (
				<div
					key={i}
					role="presentation"
					className={`_svgPathHandle ${h.pt.kind === 'control' ? '_control' : '_anchor'}`}
					style={{ left: h.left, top: h.top }}
					onPointerDown={e => startDrag(e, h.pt)}
				/>
			))}
		</div>
	);
}
