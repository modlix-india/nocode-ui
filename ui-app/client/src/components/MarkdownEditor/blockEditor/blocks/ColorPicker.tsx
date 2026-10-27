// ColorPicker — the color chooser used by the formatting toolbar (text +
// highlight) and table cells. One popover offers:
//   • In use  — colors already used in the document
//   • Presets — a curated palette
//   • Custom  — shared custom swatches (add / remove)
//   • a free hex field + native OS picker
//
// Colors already used are supplied through PaletteContext; everything else is
// local.

import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { createPortal } from 'react-dom';
import { X, Plus } from 'lucide-react';
import { useCustomColors, type CustomSwatchKind } from '../features/custom-colors';
import { normHex } from './color-utils';

export interface ColorPreset {
	label: string;
	value: string;
}

/** Text-color presets, ordered by hue. */
export const TEXT_COLOR_PRESETS: ColorPreset[] = [
	{ label: 'Gray', value: '#9ca3af' },
	{ label: 'Brown', value: '#a16207' },
	{ label: 'Orange', value: '#ea580c' },
	{ label: 'Yellow', value: '#ca8a04' },
	{ label: 'Lime', value: '#65a30d' },
	{ label: 'Green', value: '#16a34a' },
	{ label: 'Teal', value: '#0d9488' },
	{ label: 'Sky', value: '#0284c7' },
	{ label: 'Blue', value: '#2563eb' },
	{ label: 'Purple', value: '#7c3aed' },
	{ label: 'Pink', value: '#db2777' },
	{ label: 'Wine', value: '#9f1239' },
	{ label: 'Red', value: '#dc2626' },
];

/** Highlight (text background) presets — soft tints. */
export const HIGHLIGHT_COLOR_PRESETS: ColorPreset[] = [
	{ label: 'Gray', value: '#f3f4f6' },
	{ label: 'Brown', value: '#fef3c7' },
	{ label: 'Orange', value: '#ffedd5' },
	{ label: 'Yellow', value: '#fef9c3' },
	{ label: 'Green', value: '#dcfce7' },
	{ label: 'Blue', value: '#dbeafe' },
	{ label: 'Purple', value: '#ede9fe' },
	{ label: 'Pink', value: '#fce7f3' },
	{ label: 'Red', value: '#fee2e2' },
];

/** General fill / border / background presets — a broad, saturated palette. */
export const FILL_COLOR_PRESETS: ColorPreset[] = [
	{ label: 'Black', value: '#000000' },
	{ label: 'White', value: '#ffffff' },
	{ label: 'Slate', value: '#64748b' },
	{ label: 'Red', value: '#ef4444' },
	{ label: 'Orange', value: '#f97316' },
	{ label: 'Amber', value: '#f59e0b' },
	{ label: 'Yellow', value: '#eab308' },
	{ label: 'Green', value: '#22c55e' },
	{ label: 'Emerald', value: '#10b981' },
	{ label: 'Cyan', value: '#06b6d4' },
	{ label: 'Blue', value: '#3b82f6' },
	{ label: 'Indigo', value: '#6366f1' },
	{ label: 'Violet', value: '#8b5cf6' },
	{ label: 'Purple', value: '#a855f7' },
	{ label: 'Pink', value: '#ec4899' },
];

// ---- In-use palette context ------------------------------------------------

const PaletteContext = createContext<string[]>([]);

/** Provide the document "in use" colors to every descendant picker. */
export function PaletteProvider({
	colors,
	children,
}: Readonly<{ colors: string[]; children: React.ReactNode }>) {
	const memo = useMemo(() => colors, [colors.join('|')]);
	return <PaletteContext.Provider value={memo}>{children}</PaletteContext.Provider>;
}

/** In-use colors for the current document (empty outside a provider). */
export function usePalette(): string[] {
	return useContext(PaletteContext);
}

// ---- The picker ------------------------------------------------------------

export interface ColorPickerProps {
	/** Currently applied value — the matching swatch shows a selection ring. */
	value?: string | null;
	/** Apply a chosen value (a hex, or the `none` sentinel). */
	onPick: (value: string) => void;
	/** Preset swatches to offer. */
	presets: ColorPreset[];
	/** A "no color" option (e.g. inherit / transparent) rendered as a leading chip. */
	none?: ColorPreset;
	/** Which workspace custom-swatch bucket to read + write. */
	swatchKind: CustomSwatchKind;
	/** Tighter spacing for the inline text bar. */
	compact?: boolean;
	/** Text-selection context (inline bar): keep the live contentEditable
	 *  selection alive across a color pick, and drop the focus-stealing hex
	 *  field (the swatches + native picker cover custom colors). */
	preserveSelection?: boolean;
}

const eqColor = (a: string, b: string | null | undefined): boolean => {
	if (b == null) return false;
	if (a === b) return true;
	const na = normHex(a);
	const nb = normHex(b);
	return !!na && na === nb;
};

function Swatch({
	color,
	label,
	selected,
	onSelect,
	onRemove,
}: Readonly<{
	color: string;
	label: string;
	selected: boolean;
	onSelect: () => void;
	onRemove?: () => void;
}>) {
	const none = color === 'inherit' || color === 'transparent';
	// Apply on pointerdown — it fires synchronously (while the live text selection
	// is still intact, exactly like the old mousedown path) AND uniformly for
	// mouse, stylus, and touch, so stylus / finger taps work. preventDefault on
	// BOTH pointerdown and the compat mousedown stops the button from stealing
	// focus and collapsing a contentEditable selection before the color applies.
	// click/mouseup carry no apply, so there is exactly one apply per tap.
	return (
		<span className="mde-cp-swatch-wrap">
			<button
				type="button"
				title={label}
				aria-label={label}
				className={`mde-cp-swatch${selected ? ' is-selected' : ''}${none ? ' mde-cp-swatch--none' : ''}`}
				style={{ background: none ? undefined : color }}
				onMouseDown={e => e.preventDefault()}
				onPointerDown={e => {
					e.preventDefault();
					onSelect();
				}}
			>
				{none && <X size={11} />}
			</button>
			{onRemove && (
				<button
					type="button"
					className="mde-cp-swatch-x"
					title="Remove custom color"
					aria-label="Remove custom color"
					onMouseDown={e => {
						e.preventDefault();
						e.stopPropagation();
					}}
					onPointerDown={e => {
						e.preventDefault();
						e.stopPropagation();
						onRemove();
					}}
				>
					<X size={9} />
				</button>
			)}
		</span>
	);
}

export function ColorPicker({
	value,
	onPick,
	presets,
	none,
	swatchKind,
	compact,
	preserveSelection,
}: Readonly<ColorPickerProps>) {
	const inUse = usePalette();
	const custom = useCustomColors();
	const customValues = (custom[swatchKind] ?? []) as string[];
	const canAdd = !!custom.onAddCustom;
	const canRemove = !!custom.onRemoveCustom;

	// In-use colors that aren't already a preset or workspace custom (avoid dupes).
	const presetSet = useMemo(
		() => new Set(presets.map(p => normHex(p.value) ?? p.value)),
		[presets],
	);
	const customSet = useMemo(
		() => new Set(customValues.map(c => normHex(c) ?? c)),
		[customValues],
	);
	const inUseUnique = useMemo(
		() =>
			inUse
				.filter(c => {
					const n = normHex(c) ?? c;
					return !presetSet.has(n) && !customSet.has(n);
				})
				.slice(0, 12),
		[inUse, presetSet, customSet],
	);

	const currentHex = normHex(value) ?? '#000000';
	const [hexDraft, setHexDraft] = useState<string | null>(null);
	const hexShown = hexDraft ?? normHex(value) ?? '';

	// In a text-selection context the native OS picker steals focus, collapsing
	// the contentEditable selection that execCommand needs. Snapshot the range on
	// mousedown (before focus moves) and restore + re-focus the editable before
	// applying.
	const savedRange = useRef<Range | null>(null);
	const snapshotSelection = () => {
		const sel = document.getSelection();
		savedRange.current = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
	};
	const applyNative = (raw: string) => {
		const n = normHex(raw);
		if (!n) return;
		if (preserveSelection && savedRange.current) {
			const r = savedRange.current;
			let node: Node | null = r.startContainer;
			while (node && !(node instanceof HTMLElement && node.isContentEditable))
				node = node.parentNode;
			if (node instanceof HTMLElement) node.focus();
			const sel = document.getSelection();
			if (sel) {
				sel.removeAllRanges();
				sel.addRange(r);
			}
		}
		onPick(n);
	};
	const applyHex = (raw: string) => {
		setHexDraft(raw);
		const n = normHex(raw.startsWith('#') ? raw : `#${raw}`);
		if (n) onPick(n);
	};

	return (
		<div className={`mde-cp${compact ? ' mde-cp--compact' : ''}`}>
			{none && (
				<div className="mde-cp-row">
					<Swatch
						color={none.value}
						label={none.label}
						selected={eqColor(none.value, value)}
						onSelect={() => onPick(none.value)}
					/>
				</div>
			)}
			{inUseUnique.length > 0 && (
				<div className="mde-cp-section">
					<div className="mde-cp-label">In use</div>
					<div className="mde-cp-row">
						{inUseUnique.map(c => (
							<Swatch
								key={`u-${c}`}
								color={c}
								label={c}
								selected={eqColor(c, value)}
								onSelect={() => onPick(c)}
							/>
						))}
					</div>
				</div>
			)}
			<div className="mde-cp-section">
				<div className="mde-cp-label">Presets</div>
				<div className="mde-cp-row">
					{presets.map(p => (
						<Swatch
							key={p.value}
							color={p.value}
							label={p.label}
							selected={eqColor(p.value, value)}
							onSelect={() => onPick(p.value)}
						/>
					))}
				</div>
			</div>
			{(customValues.length > 0 || canAdd) && (
				<div className="mde-cp-section">
					<div className="mde-cp-label">Custom</div>
					<div className="mde-cp-row">
						{customValues.map(c => (
							<Swatch
								key={`c-${c}`}
								color={c}
								label={c}
								selected={eqColor(c, value)}
								onSelect={() => onPick(c)}
								onRemove={
									canRemove
										? () => custom.onRemoveCustom?.(swatchKind, c)
										: undefined
								}
							/>
						))}
						{canAdd && (
							<button
								type="button"
								className="mde-cp-swatch mde-cp-swatch--add"
								title="Save current color to your workspace"
								aria-label="Save current color to your workspace"
								onMouseDown={e => e.preventDefault()}
								onPointerDown={e => {
									e.preventDefault();
									custom.onAddCustom?.(swatchKind, currentHex);
								}}
							>
								<Plus size={11} />
							</button>
						)}
					</div>
				</div>
			)}
			<div className="mde-cp-custom-row">
				<input
					type="color"
					className="mde-cp-native"
					aria-label="Pick a custom color"
					value={currentHex}
					onMouseDown={snapshotSelection}
					onChange={e => applyNative(e.target.value)}
				/>
				{!preserveSelection && (
					<input
						type="text"
						className="mde-cp-hex"
						spellCheck={false}
						placeholder="#rrggbb"
						value={hexShown}
						onChange={e => applyHex(e.target.value)}
						onBlur={() => setHexDraft(null)}
					/>
				)}
			</div>
		</div>
	);
}

// ---- Trigger + popover (element panel / background editor) ------------------

export interface ColorButtonProps extends Omit<ColorPickerProps, 'compact'> {
	/** Small label shown before the trigger (e.g. "Border"). */
	label?: string;
}

/** A compact swatch button that opens the picker in a click-away popover. Used
 *  where a bare `<input type="color">` used to sit (element panel, background
 *  editor).
 *
 *  The popover is portaled to <body> and positioned in fixed/viewport coords
 *  anchored to the trigger: the element panel that hosts these buttons scrolls
 *  (`overflow-y: auto`, which the spec promotes to overflow on both axes), so an
 *  absolutely-positioned popover would be clipped by the panel's box. Portaling
 *  + clamping to the viewport lets it overflow the panel and never clips. */
export function ColorButton({ label, value, ...pickerProps }: Readonly<ColorButtonProps>) {
	const [open, setOpen] = useState(false);
	const wrapRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const popRef = useRef<HTMLDivElement>(null);
	const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

	// Anchor the popover below the trigger, clamped so it stays fully on-screen
	// (flip above the trigger if there's no room below).
	const reposition = useCallback(() => {
		const t = triggerRef.current;
		const pop = popRef.current;
		if (!t || !pop) return;
		const tr = t.getBoundingClientRect();
		const pw = pop.offsetWidth;
		const ph = pop.offsetHeight;
		const margin = 8;
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		let left = tr.left;
		if (left + pw > vw - margin) left = vw - margin - pw;
		if (left < margin) left = margin;
		let top = tr.bottom + 6;
		if (top + ph > vh - margin) {
			const above = tr.top - 6 - ph;
			top = above >= margin ? above : Math.max(margin, vh - margin - ph);
		}
		setPos({ top, left });
	}, []);

	// Measure + place before paint, then keep it pinned to the trigger as the
	// panel (or window) scrolls/resizes while the popover is open.
	useLayoutEffect(() => {
		if (!open) {
			setPos(null);
			return;
		}
		reposition();
		const onMove = () => reposition();
		window.addEventListener('scroll', onMove, true);
		window.addEventListener('resize', onMove);
		return () => {
			window.removeEventListener('scroll', onMove, true);
			window.removeEventListener('resize', onMove);
		};
	}, [open, reposition]);

	useEffect(() => {
		if (!open) return;
		const onDown = (e: MouseEvent) => {
			const target = e.target as Node;
			if (wrapRef.current?.contains(target) || popRef.current?.contains(target)) return;
			setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		document.addEventListener('mousedown', onDown);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDown);
			document.removeEventListener('keydown', onKey);
		};
	}, [open]);

	const swatchBg =
		value && value !== 'inherit' && value !== 'transparent'
			? (normHex(value) ?? value)
			: undefined;
	return (
		<div className="mde-cp-btn-wrap" ref={wrapRef}>
			{label && <span className="mde-cp-btn-label">{label}</span>}
			<button
				type="button"
				ref={triggerRef}
				className={`mde-cp-trigger${swatchBg ? '' : ' mde-cp-trigger--none'}`}
				style={{ background: swatchBg }}
				aria-label={label ? `${label} color` : 'Color'}
				aria-expanded={open}
				onClick={() => setOpen(o => !o)}
			>
				{!swatchBg && <X size={12} />}
			</button>
			{open &&
				createPortal(
					<div
						ref={popRef}
						className="mde-cp-pop mde-cp-pop--portal"
						style={{
							position: 'fixed',
							top: pos?.top ?? -9999,
							left: pos?.left ?? -9999,
							right: 'auto',
							zIndex: 1200,
							visibility: pos ? 'visible' : 'hidden',
						}}
					>
						<ColorPicker value={value} {...pickerProps} />
					</div>,
					document.body,
				)}
		</div>
	);
}
