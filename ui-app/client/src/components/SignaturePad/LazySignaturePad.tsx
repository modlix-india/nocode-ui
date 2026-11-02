import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import {
	addPoint,
	DEFAULT_PAD_HEIGHT,
	DEFAULT_PEN_COLOR,
	DEFAULT_PEN_WIDTH,
	drawSegment,
	drawStroke,
	drawStrokeEnd,
	exportSignature,
	isImageValue,
	SignatureStroke,
} from './signaturePadCore';
import { propertiesDefinition, stylePropertiesDefinition } from './signaturePadProperties';

type Live = { stroke: SignatureStroke; pointerId: number };

/**
 * Draw a signature on a canvas with a mouse, finger or pen. Every finished stroke (and every
 * undo) writes a PNG data URL with a transparent background to the binding path; Clear removes
 * the key, so a page can enable its Sign button on the bound value being set. A value put in the
 * store by the page (an earlier signature) is shown as an image; drawing again starts over.
 */
function SignaturePad(props: Readonly<ComponentProps>) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(props.context.pageName);
	const { definition, locationHistory, context, pageDefinition } = props;
	const { bindingPath, key } = definition;
	const {
		properties: {
			penColor,
			penWidth,
			padHeight,
			padBackground,
			placeholder,
			clearLabel,
			showUndo,
			undoLabel,
			trimImage,
			readOnly,
			onChange,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);
	const resolvedStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);
	const path = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const [bound, setBound] = useState<any>(undefined);
	const [strokeCount, setStrokeCount] = useState(0);
	const [drawing, setDrawing] = useState(false);
	const [external, setExternal] = useState<string | undefined>(undefined);

	const padRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const strokesRef = useRef<Array<SignatureStroke>>([]);
	const liveRef = useRef<Live | undefined>(undefined);
	const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
	const lastWrittenRef = useRef<{ set: boolean; value: any }>({ set: false, value: undefined });
	const latestRef = useRef<{
		path?: string;
		trim: boolean;
		readOnly?: boolean;
		onChange?: string;
	}>({ trim: true });
	latestRef.current = { path, trim: trimImage !== false, readOnly, onChange };

	useEffect(() => {
		if (!path) return;
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, v) => setBound(v),
			path,
		);
	}, [path]);

	const context2d = useCallback(() => {
		const ctx = canvasRef.current?.getContext('2d') ?? null;
		if (ctx) ctx.setTransform(sizeRef.current.dpr, 0, 0, sizeRef.current.dpr, 0, 0);
		return ctx;
	}, []);

	const redraw = useCallback(() => {
		const canvas = canvasRef.current;
		const ctx = context2d();
		if (!canvas || !ctx) return;
		ctx.clearRect(0, 0, sizeRef.current.w || canvas.width, sizeRef.current.h || canvas.height);
		for (const s of strokesRef.current) drawStroke(ctx, s);
		if (liveRef.current) drawStroke(ctx, liveRef.current.stroke);
	}, [context2d]);

	// Canvas backing store = CSS size x devicePixelRatio, refit whenever the pad changes size
	// (container width, pad height, phone rotation). Points are in CSS px, so a refit only redraws.
	useEffect(() => {
		const pad = padRef.current;
		if (!pad) return;
		const fit = () => {
			const canvas = canvasRef.current;
			if (!canvas) return;
			const w = pad.clientWidth;
			const h = pad.clientHeight;
			const dpr = globalThis.devicePixelRatio || 1;
			sizeRef.current = { w, h, dpr };
			const cw = Math.max(1, Math.round(w * dpr));
			const ch = Math.max(1, Math.round(h * dpr));
			if (canvas.width !== cw) canvas.width = cw;
			if (canvas.height !== ch) canvas.height = ch;
			redraw();
		};
		fit();
		if (typeof ResizeObserver === 'undefined') {
			globalThis.addEventListener?.('resize', fit);
			return () => globalThis.removeEventListener?.('resize', fit);
		}
		const ro = new ResizeObserver(() => fit());
		ro.observe(pad);
		return () => ro.disconnect();
	}, [redraw]);

	// A value set from outside (the page cleared it, or loaded an earlier signature).
	useEffect(() => {
		if (lastWrittenRef.current.set && bound === lastWrittenRef.current.value) return;
		lastWrittenRef.current = { set: true, value: bound };
		strokesRef.current = [];
		liveRef.current = undefined;
		setDrawing(false);
		setStrokeCount(0);
		setExternal(isImageValue(bound) ? bound : undefined);
		redraw();
	}, [bound, redraw]);

	function write(value: string | undefined) {
		lastWrittenRef.current = { set: true, value };
		const p = latestRef.current.path;
		if (p) {
			if (value) setData(p, value, context.pageName);
			else setData(p, undefined, context.pageName, true);
		}
		const ev = latestRef.current.onChange;
		if (ev && pageDefinition.eventFunctions?.[ev])
			(async () =>
				await runEvent(
					pageDefinition.eventFunctions[ev],
					key,
					context.pageName,
					locationHistory,
					pageDefinition,
				))();
	}

	function commit() {
		write(
			exportSignature(strokesRef.current, {
				trim: latestRef.current.trim,
				padWidth: sizeRef.current.w,
				padHeight: sizeRef.current.h,
			}),
		);
	}

	function pointOf(e: { clientX: number; clientY: number }) {
		const r = canvasRef.current!.getBoundingClientRect();
		return { x: e.clientX - r.left, y: e.clientY - r.top };
	}

	function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
		if (latestRef.current.readOnly || liveRef.current) return;
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		e.preventDefault();
		try {
			canvasRef.current?.setPointerCapture?.(e.pointerId);
		} catch {
			// Capture is a nicety (strokes that leave the pad); drawing works without it.
		}
		if (external) setExternal(undefined);
		const stroke: SignatureStroke = {
			color: penColor || DEFAULT_PEN_COLOR,
			width: Number(penWidth) > 0 ? Number(penWidth) : DEFAULT_PEN_WIDTH,
			points: [],
		};
		addPoint(stroke, pointOf(e));
		liveRef.current = { stroke, pointerId: e.pointerId };
		setDrawing(true);
		const ctx = context2d();
		if (ctx) drawSegment(ctx, stroke, 0);
	}

	function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
		const cur = liveRef.current;
		if (!cur || cur.pointerId !== e.pointerId) return;
		e.preventDefault();
		const native: any = e.nativeEvent;
		const coalesced: Array<PointerEvent> | undefined = native?.getCoalescedEvents?.();
		const events = coalesced?.length ? coalesced : [e];
		const ctx = context2d();
		for (const ev of events) {
			if (addPoint(cur.stroke, pointOf(ev)) && ctx)
				drawSegment(ctx, cur.stroke, cur.stroke.points.length - 1);
		}
	}

	function finish(e: React.PointerEvent<HTMLCanvasElement>) {
		const cur = liveRef.current;
		if (!cur || cur.pointerId !== e.pointerId) return;
		liveRef.current = undefined;
		const ctx = context2d();
		if (ctx) drawStrokeEnd(ctx, cur.stroke);
		strokesRef.current.push(cur.stroke);
		setDrawing(false);
		setStrokeCount(strokesRef.current.length);
		commit();
	}

	function clear() {
		strokesRef.current = [];
		liveRef.current = undefined;
		setDrawing(false);
		setExternal(undefined);
		setStrokeCount(0);
		redraw();
		write(undefined);
	}

	function undo() {
		if (!strokesRef.current.length) return;
		strokesRef.current.pop();
		setStrokeCount(strokesRef.current.length);
		redraw();
		commit();
	}

	const empty = strokeCount === 0 && !drawing && !external;
	const height = Number(padHeight) > 0 ? Number(padHeight) : DEFAULT_PAD_HEIGHT;
	const hint = placeholder ?? 'Sign here';

	return (
		<div
			className={`comp compSignaturePad${readOnly ? ' _readOnly' : ''}${empty ? ' _empty' : ''}`}
			style={resolvedStyles.comp ?? {}}
		>
			<HelperComponent context={props.context} definition={definition} />
			<div
				className="_pad"
				ref={padRef}
				style={{
					...(resolvedStyles.pad ?? {}),
					height: `${height}px`,
					...(padBackground ? { background: padBackground } : {}),
				}}
			>
				<div className="_line" />
				{empty && hint ? (
					<div className="_hint" style={resolvedStyles.hint ?? {}}>
						{hint}
					</div>
				) : null}
				{external ? <img className="_image" src={external} alt="" /> : null}
				<canvas
					className="_canvas"
					ref={canvasRef}
					role="img"
					aria-label={hint || 'Signature'}
					aria-disabled={readOnly ? true : undefined}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={finish}
					onPointerCancel={finish}
					onLostPointerCapture={finish}
				/>
			</div>
			{readOnly ? null : (
				<div className="_actions">
					{showUndo === false ? null : (
						<button
							type="button"
							className="_button _undo"
							style={resolvedStyles.button ?? {}}
							disabled={strokeCount === 0}
							onClick={undo}
						>
							{undoLabel ?? 'Undo'}
						</button>
					)}
					<button
						type="button"
						className="_button _clear"
						style={resolvedStyles.button ?? {}}
						disabled={empty}
						onClick={clear}
					>
						{clearLabel ?? 'Clear'}
					</button>
				</div>
			)}
		</div>
	);
}

export default SignaturePad;
