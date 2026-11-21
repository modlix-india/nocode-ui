import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Drawers, modals, backdrops, full screen and popover menus of the report components render
 * through a portal to document.body. Inside the page they were `position: fixed` under a tile:
 * a transformed or stacking-context ancestor (a tile being dragged, the page grid) made them
 * fixed to the tile and lower than the app's top bar, so a drawer's head (and its Close) sat
 * behind the bar.
 *
 * The scoped CSS and the theme variables (`--rp-*`) are set on the component's root classes
 * (`.comp.compReportWidget`, `.comp.compDashboard`, ...): the portal content is wrapped in an
 * element carrying the same classes plus `_rpPortal` (`display: contents`, so it adds no box but
 * the variables still inherit).
 */

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** The root component classes (`comp`, `compReportWidget`) of the report component around `el`. */
export function scopeClasses(el: Element | null | undefined): string {
	const root = el?.closest?.('.comp');
	if (!root) return '';
	return String(root.className ?? '')
		.split(/\s+/)
		.filter(c => c === 'comp' || /^comp[A-Z]/.test(c))
		.join(' ');
}

export function RpPortal({ children }: Readonly<{ children: React.ReactNode }>) {
	const probe = useRef<HTMLSpanElement>(null);
	const [scope, setScope] = useState('');
	useIsoLayoutEffect(() => setScope(scopeClasses(probe.current)), []);
	if (typeof document === 'undefined') return null;
	return (
		<>
			<span ref={probe} hidden />
			{createPortal(
				<div className={`${scope ? scope + ' ' : ''}_rpPortal`} data-rp-portal="">
					{children}
				</div>,
				document.body,
			)}
		</>
	);
}

/**
 * Escape runs `fn` while `open`, unless something nearer already used the key (an open popover
 * menu closes first: useDismiss handles Escape in the capture phase and marks it handled).
 */
export function useEscape(open: boolean, fn: () => void) {
	const ref = useRef(fn);
	ref.current = fn;
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== 'Escape' || e.defaultPrevented) return;
			e.preventDefault();
			ref.current();
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [open]);
}

/**
 * A drawer (right side; bottom sheet on a phone) or a centred modal with its backdrop, in a
 * portal. Escape and a click on the backdrop close it; focus moves into it on open and back to
 * what had it on close.
 */
export function Dialog({
	kind,
	label,
	onClose,
	children,
}: Readonly<{
	kind: 'drawer' | 'modal';
	label: string;
	onClose: () => void;
	children: React.ReactNode;
}>) {
	const panel = useRef<HTMLDivElement>(null);
	useEscape(true, onClose);
	useEffect(() => {
		const before =
			typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
		const el = panel.current;
		const first = el?.querySelector<HTMLElement>(
			'[data-autofocus], button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
		);
		(first ?? el)?.focus?.();
		return () => {
			if (before && typeof before.focus === 'function' && document.contains(before))
				before.focus();
		};
	}, []);
	return (
		<RpPortal>
			<div className="_rpBackdrop" onClick={onClose} aria-hidden="true" />
			<div
				ref={panel}
				className={kind === 'drawer' ? '_rpDrawer' : '_rpModal'}
				role="dialog"
				aria-modal="true"
				aria-label={label}
				tabIndex={-1}
			>
				{children}
			</div>
		</RpPortal>
	);
}

export interface PopPosition {
	top: number;
	left?: number;
	right?: number;
	maxHeight: number;
}

/** Where a popover goes: under its anchor (above when there is no room), inside the window. */
export function popPosition(
	box: { top: number; bottom: number; left: number; right: number },
	align: 'left' | 'right',
	vw: number,
	vh: number,
): PopPosition {
	const gap = 4;
	const below = vh - box.bottom - gap - 8;
	const above = box.top - gap - 8;
	const down = below >= 220 || below >= above;
	const maxHeight = Math.max(120, Math.min(520, down ? below : above));
	const top = down ? box.bottom + gap : Math.max(8, box.top - gap - maxHeight);
	if (align === 'right') return { top, right: Math.max(8, vw - box.right), maxHeight };
	return { top, left: Math.max(8, Math.min(box.left, vw - 200)), maxHeight };
}

/**
 * A popover menu in a portal, placed by its anchor element (or a point), following scroll and
 * resize. `popRef` is the popover element (give it to useDismiss as the inside).
 */
export function Pop({
	anchor,
	at,
	align = 'left',
	popRef,
	className,
	role,
	label,
	style,
	children,
}: Readonly<{
	anchor?: HTMLElement | null;
	/** A point in the window (a click on a chart mark). */
	at?: { x: number; y: number };
	align?: 'left' | 'right';
	popRef?: React.Ref<HTMLDivElement>;
	className?: string;
	role?: string;
	label?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
}>) {
	const [pos, setPos] = useState<PopPosition | undefined>(undefined);
	useIsoLayoutEffect(() => {
		const place = () => {
			const vw = window.innerWidth || document.documentElement.clientWidth || 1024;
			const vh = window.innerHeight || document.documentElement.clientHeight || 768;
			const box = at
				? { top: at.y, bottom: at.y, left: at.x, right: at.x }
				: anchor?.getBoundingClientRect();
			if (!box) return;
			setPos(popPosition(box, align, vw, vh));
		};
		place();
		window.addEventListener('resize', place);
		window.addEventListener('scroll', place, true);
		return () => {
			window.removeEventListener('resize', place);
			window.removeEventListener('scroll', place, true);
		};
	}, [anchor, at?.x, at?.y, align]);
	return (
		<RpPortal>
			<div
				ref={popRef}
				className={`_rpPop _rpPopFixed${className ? ' ' + className : ''}`}
				role={role}
				aria-label={label}
				style={{
					...style,
					top: pos?.top ?? -9999,
					left: pos?.left,
					right: pos?.right,
					maxHeight: pos?.maxHeight,
					visibility: pos ? undefined : 'hidden',
				}}
			>
				{children}
			</div>
		</RpPortal>
	);
}
