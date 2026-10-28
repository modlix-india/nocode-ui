import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import {
	Trash2,
	Copy,
	ArrowUp,
	ArrowDown,
	Type,
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Heading5,
	Heading6,
	List,
	ListOrdered,
	ListCollapse,
	CheckSquare,
	Code,
	Quote,
	Lightbulb,
	ChevronRight,
	Columns2,
	BetweenVerticalStart,
	BetweenVerticalEnd,
	Palette,
	SquareDashedBottom,
	Maximize2,
	Minimize2,
	ClipboardCopy,
	ClipboardPaste,
	Scissors,
	Plus,
	TableOfContents,
	Type as TypeIcon,
} from 'lucide-react';
import { BlockType } from '../core/types';
import type { ListLevelStyle } from '../core/types';
import { useEditorHostCallbacks } from '../blocks/EditorDocContext';
import {
	COLOR_TEMPLATES,
	customTemplateToColorTemplate,
	type ColorTemplate,
} from '../blocks/TableBlock';
import { useCustomColors } from './custom-colors';
import { useIsCoarsePointer } from '../hooks/use-is-coarse-pointer';
import { useT } from '../i18n/context';
import {
	fixedContainingBlockOffset,
	followAnchor,
	placeInViewport,
	toFixedCoords,
} from './fixed-position';
import type { EditorTranslationKey } from '../i18n/keys';
import { consumeEscape } from './escape-guard';

export interface TableMenuState {
	showBorders: boolean;
	compact: boolean;
}

/** State for the new first-class list-item types (bulletItem / numberItem /
 *  todoItem). Each block owns a single style; no per-level concept. */
export interface ListItemMenuState {
	/** The block's `props.style` (may be empty when the block has no overrides). */
	style: ListLevelStyle;
	/** Custom starting number for numberItem (block.props.indexHint). */
	indexHint?: number;
}

/** Patch shape for the new-item style callback. `indexHint: null` clears
 *  the custom start; absent fields leave the block as-is. */
export interface ListItemStylePatch {
	bulletStyle?: string;
	numberStyle?: string;
	color?: string;
	size?: string;
	indexHint?: number | null;
}

// ---- Bullet & number style options ----

export type BulletStyle = 'disc' | 'circle' | 'square' | 'dash' | 'arrow' | 'star' | 'checkmark';
export type NumberStyle = 'decimal' | 'alpha-lower' | 'alpha-upper' | 'roman-lower' | 'roman-upper';

const BULLET_STYLES: { value: BulletStyle; labelKey: EditorTranslationKey; char: string }[] = [
	{ value: 'disc', labelKey: 'blockMenu.listStyle.bullet.disc', char: '•' },
	{ value: 'circle', labelKey: 'blockMenu.listStyle.bullet.circle', char: '◦' },
	{ value: 'square', labelKey: 'blockMenu.listStyle.bullet.square', char: '▪' },
	{ value: 'dash', labelKey: 'blockMenu.listStyle.bullet.dash', char: '–' },
	{ value: 'arrow', labelKey: 'blockMenu.listStyle.bullet.arrow', char: '→' },
	{ value: 'star', labelKey: 'blockMenu.listStyle.bullet.star', char: '★' },
	{ value: 'checkmark', labelKey: 'blockMenu.listStyle.bullet.checkmark', char: '✓' },
];

const NUMBER_STYLES: { value: NumberStyle; labelKey: EditorTranslationKey; example: string }[] = [
	{ value: 'decimal', labelKey: 'blockMenu.listStyle.number.decimal', example: '1, 2, 3' },
	{ value: 'alpha-lower', labelKey: 'blockMenu.listStyle.number.lowerAlpha', example: 'a, b, c' },
	{ value: 'alpha-upper', labelKey: 'blockMenu.listStyle.number.upperAlpha', example: 'A, B, C' },
	{
		value: 'roman-lower',
		labelKey: 'blockMenu.listStyle.number.lowerRoman',
		example: 'i, ii, iii',
	},
	{
		value: 'roman-upper',
		labelKey: 'blockMenu.listStyle.number.upperRoman',
		example: 'I, II, III',
	},
];

const MARKER_SIZES: { value: string; labelKey: EditorTranslationKey; preview: number }[] = [
	{ value: 'small', labelKey: 'blockMenu.listStyle.size.small', preview: 10 },
	{ value: 'medium', labelKey: 'blockMenu.listStyle.size.medium', preview: 13 },
	{ value: 'large', labelKey: 'blockMenu.listStyle.size.large', preview: 17 },
];

const MARKER_COLORS: { value: string; labelKey: EditorTranslationKey }[] = [
	{ value: '', labelKey: 'blockMenu.listStyle.color.default' },
	{ value: '#37352f', labelKey: 'blockMenu.listStyle.color.black' },
	{ value: '#787774', labelKey: 'blockMenu.listStyle.color.gray' },
	{ value: '#d44c47', labelKey: 'blockMenu.listStyle.color.red' },
	{ value: '#cb912f', labelKey: 'blockMenu.listStyle.color.orange' },
	{ value: '#dfab01', labelKey: 'blockMenu.listStyle.color.yellow' },
	{ value: '#448361', labelKey: 'blockMenu.listStyle.color.green' },
	{ value: '#337ea9', labelKey: 'blockMenu.listStyle.color.blue' },
	{ value: '#9065b0', labelKey: 'blockMenu.listStyle.color.purple' },
	{ value: '#c14c8a', labelKey: 'blockMenu.listStyle.color.pink' },
];

// ---- Table-of-contents design + depth options ----

export type TocVariant = 'plain' | 'bulleted' | 'numbered' | 'card' | 'accent';

/** Current TOC block settings, so the menu can show the active row. */
export interface TocMenuState {
	variant: TocVariant;
	levels: number;
}

const TOC_STYLE_OPTIONS: { value: TocVariant; labelKey: EditorTranslationKey }[] = [
	{ value: 'plain', labelKey: 'block.toc.style.plain' },
	{ value: 'bulleted', labelKey: 'block.toc.style.bulleted' },
	{ value: 'numbered', labelKey: 'block.toc.style.numbered' },
	{ value: 'card', labelKey: 'block.toc.style.card' },
	{ value: 'accent', labelKey: 'block.toc.style.accent' },
];

const TOC_LEVEL_OPTIONS: { value: number; labelKey: EditorTranslationKey }[] = [
	{ value: 1, labelKey: 'block.toc.levels.one' },
	{ value: 2, labelKey: 'block.toc.levels.two' },
	{ value: 3, labelKey: 'block.toc.levels.three' },
	{ value: 4, labelKey: 'block.toc.levels.four' },
	{ value: 5, labelKey: 'block.toc.levels.five' },
	{ value: 6, labelKey: 'block.toc.levels.six' },
];

const sectionLabel: React.CSSProperties = {
	padding: '6px 12px 4px',
	fontSize: 10,
	fontWeight: 500,
	textTransform: 'uppercase',
	letterSpacing: '0.05em',
	color: 'var(--mde-text-muted, #999)',
};

export interface BlockMenuProps {
	position: { x: number; y: number };
	blockId: string;
	blockType: BlockType;
	onClose: () => void;
	onDelete: (blockId: string) => void;
	onDuplicate: (blockId: string) => void;
	/** Copy the whole block subtree to the in-memory clipboard, plus the
	 *  block's plain text to the system clipboard as a fallback. */
	onCopy?: (blockId: string) => void;
	/** Copy + delete in one step. */
	onCut?: (blockId: string) => void;
	/** Insert whatever's in the in-memory clipboard after the current block.
	 *  No-op if the clipboard is empty. */
	onPaste?: (blockId: string) => void;
	onTurnInto: (blockId: string, newType: BlockType) => void;
	onMoveUp: (blockId: string) => void;
	onMoveDown: (blockId: string) => void;
	/** Table-specific state — only present when blockType === "table" */
	tableState?: TableMenuState;
	onToggleBorders?: (blockId: string) => void;
	onToggleCompact?: (blockId: string) => void;
	onApplyColorTemplate?: (blockId: string, template: ColorTemplate) => void;
	/** New-item-style state — present when blockType is one of the new
	 *  first-class list items (bulletItem / numberItem / todoItem). */
	listItemState?: ListItemMenuState;
	/** Apply a style patch to the target item. Implementations may cascade
	 *  style fields to the contiguous same-type sibling run while keeping
	 *  per-item fields (e.g. indexHint) on the target alone. */
	onChangeListItemStyle?: (blockId: string, patch: ListItemStylePatch) => void;
	/** "Split into columns" — wraps the current block as the left column with
	 *  an empty paragraph on the right. Hidden for `columns`/`column` and other
	 *  structural blocks that can't be split. */
	onSplitIntoColumns?: (blockId: string) => void;
	/** Present when the active block lives inside a columns container (or is a
	 *  column itself). Drives the "Add column left/right" + "Delete column"
	 *  controls so users can grow/shrink a columns row without dragging. */
	columnState?: ColumnMenuState;
	/** Insert a new empty column to the left of the column containing `blockId`. */
	onAddColumnLeft?: (blockId: string) => void;
	/** Insert a new empty column to the right of the column containing `blockId`. */
	onAddColumnRight?: (blockId: string) => void;
	/** Remove the entire column that contains `blockId`. Collapses the columns
	 *  container if only one column would remain. */
	onDeleteColumn?: (blockId: string) => void;
	/** Table-of-contents state — only present when blockType === "toc". Drives
	 *  the Style (design) + "Show headings up to" (depth) submenu. Picks
	 *  dispatch `mde-toc-update` directly (allowlisted in BlockEditor). */
	tocState?: TocMenuState;
	/** Block types offered by "Turn into". When omitted every type is offered. */
	allowedTypes?: readonly BlockType[];
}

/** Columns context for the active block. Present when the block lives inside
 *  a `columns` container (or is a `column` itself) so the menu can offer the
 *  add/remove-column actions. */
export interface ColumnMenuState {
	/** True when the active block is a `column` (handle hovered the column
	 *  directly via the columns wrapper's gutter). Hides "Delete block" since
	 *  deleting a column has dedicated semantics. */
	isColumnBlock: boolean;
}

interface TurnIntoOption {
	type: BlockType;
	labelKey: EditorTranslationKey;
	icon: React.ReactNode;
}

const TURN_INTO_OPTIONS: TurnIntoOption[] = [
	{ type: 'paragraph', labelKey: 'blockMenu.turnInto.paragraph', icon: <Type size={15} /> },
	{ type: 'heading1', labelKey: 'blockMenu.turnInto.heading1', icon: <Heading1 size={15} /> },
	{ type: 'heading2', labelKey: 'blockMenu.turnInto.heading2', icon: <Heading2 size={15} /> },
	{ type: 'heading3', labelKey: 'blockMenu.turnInto.heading3', icon: <Heading3 size={15} /> },
	{ type: 'heading4', labelKey: 'block.heading4.label', icon: <Heading4 size={15} /> },
	{ type: 'heading5', labelKey: 'block.heading5.label', icon: <Heading5 size={15} /> },
	{ type: 'heading6', labelKey: 'block.heading6.label', icon: <Heading6 size={15} /> },
	{
		type: 'toggleHeading1',
		labelKey: 'block.toggleHeading1.label',
		icon: <Heading1 size={15} />,
	},
	{
		type: 'toggleHeading2',
		labelKey: 'block.toggleHeading2.label',
		icon: <Heading2 size={15} />,
	},
	{
		type: 'toggleHeading3',
		labelKey: 'block.toggleHeading3.label',
		icon: <Heading3 size={15} />,
	},
	{ type: 'bulletItem', labelKey: 'blockMenu.turnInto.bulletItem', icon: <List size={15} /> },
	{
		type: 'numberItem',
		labelKey: 'blockMenu.turnInto.numberItem',
		icon: <ListOrdered size={15} />,
	},
	{ type: 'todoItem', labelKey: 'blockMenu.turnInto.todoItem', icon: <CheckSquare size={15} /> },
	{ type: 'toggle', labelKey: 'blockMenu.turnInto.toggle', icon: <ListCollapse size={15} /> },
	{ type: 'codeBlock', labelKey: 'blockMenu.turnInto.code', icon: <Code size={15} /> },
	{ type: 'quote', labelKey: 'blockMenu.turnInto.quote', icon: <Quote size={15} /> },
	{ type: 'callout', labelKey: 'blockMenu.turnInto.callout', icon: <Lightbulb size={15} /> },
];

const styles = {
	overlay: {
		position: 'fixed' as const,
		inset: 0,
		zIndex: 999,
	},
	menu: {
		position: 'fixed' as const,
		zIndex: 1000,
		width: 200,
		backgroundColor: 'var(--mde-block-menu-bg, #ffffff)',
		border: '1px solid var(--mde-block-menu-border, #e2e2e2)',
		borderRadius: 8,
		boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',
		padding: '4px 0',
		fontFamily:
			"var(--mde-block-menu-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
		userSelect: 'none' as const,
	},
	divider: {
		height: 1,
		backgroundColor: 'var(--mde-block-menu-divider, #ebebeb)',
		margin: '4px 0',
	},
	item: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		padding: '6px 12px',
		cursor: 'pointer',
		fontSize: 13,
		color: 'var(--mde-block-menu-text, #37352f)',
		backgroundColor: 'transparent',
		border: 'none',
		width: '100%',
		textAlign: 'left' as const,
		lineHeight: 1.4,
		borderRadius: 0,
		position: 'relative' as const,
	},
	itemHover: {
		backgroundColor: 'var(--mde-block-menu-hover, #f1f1f0)',
	},
	itemDelete: {
		color: 'var(--mde-block-menu-danger, #eb5757)',
	},
	submenuTrigger: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
	},
	submenuTriggerLeft: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
	},
	submenu: {
		position: 'absolute' as const,
		left: 'calc(100% - 4px)',
		top: -4,
		zIndex: 1001,
		width: 180,
		backgroundColor: 'var(--mde-block-menu-bg, #ffffff)',
		border: '1px solid var(--mde-block-menu-border, #e2e2e2)',
		borderRadius: 8,
		boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',
		padding: '4px 0',
	},
	activeIndicator: {
		width: 6,
		height: 6,
		borderRadius: '50%',
		backgroundColor: 'var(--mde-block-menu-active, #2383e2)',
		marginLeft: 'auto',
		flexShrink: 0,
	},
};

// ---- Color Template Preview Swatch ----

function TemplatePreview({ template }: { template: ColorTemplate }) {
	const { header, evenRow, oddRow } = template.preview;
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				width: 28,
				height: 20,
				borderRadius: 3,
				overflow: 'hidden',
				border: '1px solid var(--mde-border-primary, #e5e5e5)',
				flexShrink: 0,
			}}
		>
			<div style={{ flex: 1, backgroundColor: header || 'var(--mde-bg-primary, #fff)' }} />
			<div style={{ flex: 1, backgroundColor: oddRow || 'var(--mde-bg-primary, #fff)' }} />
			<div style={{ flex: 1, backgroundColor: evenRow || 'var(--mde-bg-primary, #fff)' }} />
		</div>
	);
}

/** Submenu wrapper that keeps the panel inside the viewport.
 *  Measures its own rect on mount and shifts the panel up if it would overflow
 *  the bottom edge, or flips it to the left side of the trigger if it would
 *  overflow the right edge. Default position matches the original CSS:
 *  `top: -4, left: calc(100% - 4px)` relative to the trigger item. */
function Submenu({
	style,
	children,
}: Readonly<{
	style?: React.CSSProperties;
	children: React.ReactNode;
}>) {
	const ref = useRef<HTMLDivElement>(null);
	const [adjust, setAdjust] = useState<{ topOffset: number; flipLeft: boolean }>({
		topOffset: 0,
		flipLeft: false,
	});

	useLayoutEffect(() => {
		if (!ref.current) return;
		const rect = ref.current.getBoundingClientRect();
		const margin = 8;
		const vw = window.innerWidth;
		const vh = window.innerHeight;

		let topOffset = 0;
		if (rect.bottom > vh - margin) {
			topOffset = -(rect.bottom - (vh - margin));
		}
		if (rect.top + topOffset < margin) {
			topOffset = margin - rect.top;
		}

		const flipLeft = rect.right > vw - margin;

		if (topOffset !== 0 || flipLeft) {
			setAdjust({ topOffset, flipLeft });
		}
	}, []);

	const positionStyle: React.CSSProperties = adjust.flipLeft
		? { left: 'auto', right: 'calc(100% - 4px)', top: -4 + adjust.topOffset }
		: { right: 'auto', left: 'calc(100% - 4px)', top: -4 + adjust.topOffset };

	return (
		<div
			ref={ref}
			style={{
				...styles.submenu,
				...positionStyle,
				...(style || {}),
			}}
		>
			{children}
		</div>
	);
}

export function BlockMenu({
	position,
	blockId,
	blockType,
	onClose,
	onDelete,
	onDuplicate,
	onCopy,
	onCut,
	onPaste,
	onTurnInto,
	onMoveUp,
	onMoveDown,
	tableState,
	onToggleBorders,
	onToggleCompact,
	onApplyColorTemplate,
	listItemState,
	onChangeListItemStyle,
	onSplitIntoColumns,
	columnState,
	onAddColumnLeft,
	onAddColumnRight,
	onDeleteColumn,
	tocState,
	allowedTypes,
}: BlockMenuProps) {
	const t = useT();
	const menuRef = useRef<HTMLDivElement>(null);
	const [adjustedPos, setAdjustedPos] = useState<{ x: number; y: number }>(position);
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);
	const [showTurnInto, setShowTurnInto] = useState(false);
	const [showColorTemplates, setShowColorTemplates] = useState(false);
	const [showListItemStyles, setShowListItemStyles] = useState(false);
	const [showFonts, setShowFonts] = useState(false);
	const [showToc, setShowToc] = useState(false);
	const [, setExpandedLevel] = useState<number | null>(null);
	// Fonts the host offers (curated stacks + workspace custom uploads).
	const hostFonts = useEditorHostCallbacks().fonts ?? [];
	const [hoveredSubItem, setHoveredSubItem] = useState<string | null>(null);
	// The OS-level colour dialog moves the mouse outside the React tree, so we
	// keep the submenu open while it's active.
	const listItemPickerActiveRef = useRef(false);
	const [showTemplateForm, setShowTemplateForm] = useState(false);
	const customColors = useCustomColors();
	const isCoarse = useIsCoarsePointer();

	// On coarse pointers, submenus open/close on tap instead of hover.
	// `toggleSubmenu` ensures only one submenu is open at a time.
	const toggleSubmenu = useCallback(
		(which: 'turn-into' | 'color' | 'listitem' | 'level' | 'fonts' | 'toc', level?: number) => {
			if (which === 'turn-into') {
				setShowTurnInto(prev => !prev);
				setShowColorTemplates(false);
				setShowListItemStyles(false);
				setExpandedLevel(null);
			} else if (which === 'color') {
				setShowColorTemplates(prev => !prev);
				setShowTurnInto(false);
				setShowListItemStyles(false);
			} else if (which === 'listitem') {
				setShowListItemStyles(prev => !prev);
				setShowTurnInto(false);
				setShowColorTemplates(false);
			} else if (which === 'fonts') {
				setShowFonts(prev => !prev);
				setShowTurnInto(false);
				setShowColorTemplates(false);
				setShowListItemStyles(false);
				setShowToc(false);
			} else if (which === 'toc') {
				setShowToc(prev => !prev);
				setShowTurnInto(false);
				setShowColorTemplates(false);
				setShowListItemStyles(false);
				setShowFonts(false);
			} else if (which === 'level') {
				setExpandedLevel(prev => (prev === level ? null : (level ?? null)));
			}
		},
		[],
	);

	const isTable = blockType === 'table';
	const isListItem =
		blockType === 'bulletItem' || blockType === 'numberItem' || blockType === 'todoItem';
	const isToc = blockType === 'toc';
	const isColumnsStructural = blockType === 'columns' || blockType === 'column';
	const canSplitIntoColumns = !!onSplitIntoColumns && !isColumnsStructural;

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				// Close only this menu: the popup around the editor (LoopZump's
				// New item dialog) must not see this Escape, or the draft is lost.
				e.stopImmediatePropagation();
				consumeEscape(e);
				onClose();
			}
		},
		[onClose],
	);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown, true);
		return () => document.removeEventListener('keydown', handleKeyDown, true);
	}, [handleKeyDown]);

	// Place the menu beside the block whose handle was clicked, inside the
	// viewport (flips above near the bottom; the grip on coarse pointers sits
	// near the right edge, so a 200px menu is pulled back on screen). The
	// position is converted for the real containing block of `fixed`: inside
	// a popup with a blurred backdrop (LoopZump's item editor) `fixed` is
	// measured from the scrolled backdrop, which put the menu at the top of
	// the ticket. On scroll / resize it follows its block, and closes once
	// the block has left the screen.
	const blockAtOpenRef = useRef<{ key: string; x: number; y: number } | null>(null);
	const [fixedOffset, setFixedOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;
	useLayoutEffect(() => {
		const menu = menuRef.current;
		if (!menu) return;
		const anchorKey = `${blockId}:${position.x}:${position.y}`;
		const findBlockEl = () => {
			const sel = `[data-block-id="${CSS.escape(blockId)}"]`;
			return menu.parentElement?.querySelector(sel) ?? document.querySelector(sel);
		};
		const place = () => {
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			let anchor = { x: position.x, y: position.y };
			const blockRect = findBlockEl()?.getBoundingClientRect();
			if (blockRect) {
				const now = { x: blockRect.left, y: blockRect.top };
				if (blockAtOpenRef.current?.key !== anchorKey) {
					blockAtOpenRef.current = { key: anchorKey, ...now };
				} else if (blockRect.bottom < 0 || blockRect.top > vh) {
					onCloseRef.current();
					return;
				}
				anchor = followAnchor(anchor, blockAtOpenRef.current, now);
			}
			const rect = menu.getBoundingClientRect();
			const viewportPos = placeInViewport(
				anchor,
				{ width: rect.width, height: rect.height },
				{ width: vw, height: vh },
			);
			const offset = fixedContainingBlockOffset(menu.parentElement);
			const next = toFixedCoords(viewportPos, offset);
			setAdjustedPos(prev => (prev.x === next.x && prev.y === next.y ? prev : next));
			setFixedOffset(prev => (prev.x === offset.x && prev.y === offset.y ? prev : offset));
		};
		place();
		const onScroll = (e: Event) => {
			// Scrolling inside the menu (a long submenu) is not a reason to move.
			if (e.target instanceof Node && menu.contains(e.target)) return;
			place();
		};
		window.addEventListener('scroll', onScroll, true);
		window.addEventListener('resize', place);
		return () => {
			window.removeEventListener('scroll', onScroll, true);
			window.removeEventListener('resize', place);
		};
	}, [blockId, position.x, position.y]);

	// Close the menu when the user clicks/taps outside it.
	// Using pointerdown (not mousedown) avoids the iOS quirk where the synthetic
	// mousedown emitted ~300ms after the tap that opened the menu lands on this
	// overlay (z=999) and closes the menu before it ever appears.
	const handleOverlayPointerDown = (e: React.PointerEvent) => {
		e.preventDefault();
		onClose();
	};

	const closeSubmenus = () => {
		setShowTurnInto(false);
		setShowColorTemplates(false);
		setShowFonts(false);
		setShowToc(false);
		setExpandedLevel(null);
	};

	// Set the TOC block's design / heading depth. Same event-based prop write
	// as block colors + fonts (allowlisted in BlockEditor). Kept open on pick
	// so the user can set both the style and the depth in one visit.
	const applyTocUpdate = (patch: { tocVariant?: TocVariant; tocLevels?: number }) => {
		globalThis.dispatchEvent(
			new CustomEvent('mde-toc-update', { detail: { blockId, ...patch } }),
		);
	};

	// Set (or clear, with "") the target block's font family. Uses the same
	// event-based prop write as block colors (allowlisted in BlockEditor).
	const applyBlockFont = (value: string) => {
		globalThis.dispatchEvent(
			new CustomEvent('mde-block-font-update', { detail: { blockId, fontFamily: value } }),
		);
		onClose();
	};

	const itemStyle = (id: string, extra?: React.CSSProperties): React.CSSProperties => ({
		...styles.item,
		...(hoveredItem === id ? styles.itemHover : {}),
		...(extra || {}),
	});

	return (
		<>
			{/* Invisible overlay to catch outside clicks */}
			{/* Covers the viewport even when `fixed` is measured from a scrolled
			    ancestor (see the placement effect). */}
			<div
				style={{
					...styles.overlay,
					inset: undefined,
					left: -fixedOffset.x,
					top: -fixedOffset.y,
					width: '100vw',
					height: '100vh',
				}}
				onPointerDown={handleOverlayPointerDown}
			/>

			<div
				ref={menuRef}
				style={{
					...styles.menu,
					left: adjustedPos.x,
					top: adjustedPos.y,
				}}
			>
				{/* Section 1: Move */}
				<div
					style={itemStyle('move-up')}
					onMouseEnter={() => {
						setHoveredItem('move-up');
						closeSubmenus();
					}}
					onMouseLeave={() => setHoveredItem(null)}
					onMouseDown={e => {
						e.preventDefault();
						onMoveUp(blockId);
						onClose();
					}}
				>
					<ArrowUp size={15} />
					<span>{t('blockMenu.moveUp')}</span>
				</div>

				<div
					style={itemStyle('move-down')}
					onMouseEnter={() => {
						setHoveredItem('move-down');
						closeSubmenus();
					}}
					onMouseLeave={() => setHoveredItem(null)}
					onMouseDown={e => {
						e.preventDefault();
						onMoveDown(blockId);
						onClose();
					}}
				>
					<ArrowDown size={15} />
					<span>{t('blockMenu.moveDown')}</span>
				</div>

				<div style={styles.divider} />

				{/* Table-specific section */}
				{isTable && tableState && (
					<>
						{/* Toggle Borders */}
						<div
							style={itemStyle('toggle-borders')}
							onMouseEnter={() => {
								setHoveredItem('toggle-borders');
								closeSubmenus();
							}}
							onMouseLeave={() => setHoveredItem(null)}
							onMouseDown={e => {
								e.preventDefault();
								onToggleBorders?.(blockId);
								onClose();
							}}
						>
							<SquareDashedBottom size={15} />
							<span>
								{tableState.showBorders
									? t('blockMenu.table.hideBorders')
									: t('blockMenu.table.showBorders')}
							</span>
							{!tableState.showBorders && <div style={styles.activeIndicator} />}
						</div>

						{/* Toggle Full Width / Compact */}
						<div
							style={itemStyle('toggle-compact')}
							onMouseEnter={() => {
								setHoveredItem('toggle-compact');
								closeSubmenus();
							}}
							onMouseLeave={() => setHoveredItem(null)}
							onMouseDown={e => {
								e.preventDefault();
								onToggleCompact?.(blockId);
								onClose();
							}}
						>
							{tableState.compact ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
							<span>
								{tableState.compact
									? t('blockMenu.table.fullWidth')
									: t('blockMenu.table.compact')}
							</span>
						</div>

						{/* Color Template submenu */}
						<div
							style={{
								...itemStyle('color-template'),
								position: 'relative' as const,
								paddingRight: showColorTemplates ? 20 : 12,
							}}
							onMouseEnter={() => {
								if (isCoarse) return;
								setHoveredItem('color-template');
								setShowTurnInto(false);
								setShowColorTemplates(true);
							}}
							onMouseLeave={() => {
								if (isCoarse) return;
								setHoveredItem(null);
								setShowColorTemplates(false);
							}}
						>
							<div
								style={styles.submenuTrigger}
								onPointerDown={e => {
									if (!isCoarse) return;
									e.preventDefault();
									e.stopPropagation();
									toggleSubmenu('color');
								}}
							>
								<div style={styles.submenuTriggerLeft}>
									<Palette size={15} />
									<span>{t('blockMenu.colorTheme.label')}</span>
								</div>
								<ChevronRight size={14} />
							</div>

							{showColorTemplates && (
								<Submenu style={{ width: 240 }}>
									{showTemplateForm ? (
										<TemplateCreatorForm
											onCancel={() => setShowTemplateForm(false)}
											onSave={template => {
												customColors.onAddTemplate?.(template);
												setShowTemplateForm(false);
											}}
										/>
									) : (
										<>
											{COLOR_TEMPLATES.map(tmpl => (
												<TemplateRow
													key={tmpl.name}
													template={tmpl}
													hovered={hoveredSubItem === tmpl.name}
													onHoverChange={v =>
														setHoveredSubItem(v ? tmpl.name : null)
													}
													onApply={() => {
														onApplyColorTemplate?.(blockId, tmpl);
														onClose();
													}}
												/>
											))}
											{(customColors.tableTemplates ?? []).map(ct => {
												const tmpl = customTemplateToColorTemplate(ct);
												const key = `custom-${ct.name}`;
												return (
													<TemplateRow
														key={key}
														template={tmpl}
														hovered={hoveredSubItem === key}
														onHoverChange={v =>
															setHoveredSubItem(v ? key : null)
														}
														onApply={() => {
															onApplyColorTemplate?.(blockId, tmpl);
															onClose();
														}}
														onRemove={
															customColors.onRemoveTemplate
																? () =>
																		customColors.onRemoveTemplate?.(
																			ct.name,
																		)
																: undefined
														}
													/>
												);
											})}
											{customColors.onAddTemplate && (
												<button
													type="button"
													onMouseDown={e => {
														e.preventDefault();
														e.stopPropagation();
														setShowTemplateForm(true);
													}}
													style={{
														...styles.item,
														...(hoveredSubItem === '__add'
															? styles.itemHover
															: {}),
														gap: 8,
														width: '100%',
														background: 'none',
														border: 'none',
														textAlign: 'left',
														cursor: 'pointer',
														color: 'var(--mde-text-muted, #888)',
													}}
													onMouseEnter={() => setHoveredSubItem('__add')}
													onMouseLeave={() => setHoveredSubItem(null)}
												>
													<div
														style={{
															width: 36,
															height: 26,
															borderRadius: 4,
															border: '1px dashed var(--mde-border-primary, #ccc)',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
														}}
													>
														+
													</div>
													<span style={{ fontSize: 13 }}>
														{t('blockMenu.colorTheme.newTemplate')}
													</span>
												</button>
											)}
										</>
									)}
								</Submenu>
							)}
						</div>

						<div style={styles.divider} />
					</>
				)}

				{/* New-item list section: flat per-block style + start-at-N. The
				 *  legacy `list` block uses the per-level panel below; this is the
				 *  simplified version for first-class bulletItem/numberItem/todoItem. */}
				{isListItem && listItemState && onChangeListItemStyle && (
					<>
						<div
							style={{
								...itemStyle('list-item-styles'),
								position: 'relative' as const,
							}}
							onMouseEnter={() => {
								if (isCoarse) return;
								setHoveredItem('list-item-styles');
								setShowTurnInto(false);
								setShowColorTemplates(false);
								setShowListItemStyles(true);
							}}
							onMouseLeave={() => {
								if (isCoarse) return;
								// The OS colour dialog moves the cursor outside this wrapper,
								// which would otherwise close the submenu mid-pick. Skip the
								// close while the picker session is active.
								if (listItemPickerActiveRef.current) return;
								setHoveredItem(null);
								setShowListItemStyles(false);
							}}
						>
							<div
								style={styles.submenuTrigger}
								onPointerDown={e => {
									if (!isCoarse) return;
									e.preventDefault();
									e.stopPropagation();
									toggleSubmenu('listitem');
								}}
							>
								<div style={styles.submenuTriggerLeft}>
									<List size={15} />
									<span>{t('blockMenu.listStyle.label')}</span>
								</div>
								<ChevronRight size={14} />
							</div>

							{showListItemStyles && (
								<Submenu style={{ width: 220, maxHeight: 460, overflowY: 'auto' }}>
									{/* Bullet style — only for bulletItem */}
									{blockType === 'bulletItem' && (
										<>
											<div style={sectionLabel}>
												{t('blockMenu.listStyle.styleSection')}
											</div>
											{BULLET_STYLES.map(opt => {
												const current =
													(listItemState.style.bulletStyle as
														BulletStyle | undefined) ?? 'disc';
												const active = current === opt.value;
												return (
													<div
														key={opt.value}
														style={{
															...styles.item,
															...(hoveredSubItem ===
															`li-bs-${opt.value}`
																? styles.itemHover
																: {}),
															...(active
																? {
																		backgroundColor:
																			'var(--mde-block-menu-active-bg, #e8f0fe)',
																	}
																: {}),
														}}
														onMouseEnter={() =>
															setHoveredSubItem(`li-bs-${opt.value}`)
														}
														onMouseLeave={() => setHoveredSubItem(null)}
														onMouseDown={e => {
															e.preventDefault();
															e.stopPropagation();
															onChangeListItemStyle(blockId, {
																bulletStyle: opt.value,
															});
															onClose();
														}}
													>
														<span
															style={{
																width: 18,
																textAlign: 'center',
																fontSize: 14,
															}}
														>
															{opt.char}
														</span>
														<span>{t(opt.labelKey)}</span>
														{active && (
															<div style={styles.activeIndicator} />
														)}
													</div>
												);
											})}
											<div style={styles.divider} />
										</>
									)}

									{/* Number format — only for numberItem */}
									{blockType === 'numberItem' && (
										<>
											<div style={sectionLabel}>
												{t('blockMenu.listStyle.formatSection')}
											</div>
											{NUMBER_STYLES.map(opt => {
												const current =
													(listItemState.style.numberStyle as
														NumberStyle | undefined) ?? 'decimal';
												const active = current === opt.value;
												return (
													<div
														key={opt.value}
														style={{
															...styles.item,
															...(hoveredSubItem ===
															`li-ns-${opt.value}`
																? styles.itemHover
																: {}),
															...(active
																? {
																		backgroundColor:
																			'var(--mde-block-menu-active-bg, #e8f0fe)',
																	}
																: {}),
														}}
														onMouseEnter={() =>
															setHoveredSubItem(`li-ns-${opt.value}`)
														}
														onMouseLeave={() => setHoveredSubItem(null)}
														onMouseDown={e => {
															e.preventDefault();
															e.stopPropagation();
															onChangeListItemStyle(blockId, {
																numberStyle: opt.value,
															});
															onClose();
														}}
													>
														<span style={{ flex: 1 }}>
															{t(opt.labelKey)}
														</span>
														<span
															style={{
																fontSize: 11,
																color: 'var(--mde-text-muted, #888)',
															}}
														>
															{opt.example}
														</span>
														{active && (
															<div style={styles.activeIndicator} />
														)}
													</div>
												);
											})}
											<div style={styles.divider} />

											{/* Start at N — uncontrolled input keyed by blockId so it
											 *  re-mounts when the menu opens on a different item.
											 *  Commits on Enter / blur. Empty input clears the
											 *  override (sends indexHint: null). */}
											<div style={sectionLabel}>
												{t('blockMenu.listStyle.startAt')}
											</div>
											<div style={{ padding: '4px 10px 8px' }}>
												<input
													key={blockId}
													type="number"
													min={1}
													defaultValue={listItemState.indexHint ?? ''}
													onMouseDown={e => e.stopPropagation()}
													onClick={e => e.stopPropagation()}
													onKeyDown={e => {
														if (e.key === 'Enter') {
															e.preventDefault();
															const raw = (
																e.target as HTMLInputElement
															).value.trim();
															if (raw === '') {
																onChangeListItemStyle(blockId, {
																	indexHint: null,
																});
																onClose();
																return;
															}
															const n = Math.max(
																1,
																Math.floor(Number(raw)),
															);
															if (Number.isFinite(n)) {
																onChangeListItemStyle(blockId, {
																	indexHint: n,
																});
																onClose();
															}
														}
													}}
													onBlur={e => {
														const raw = e.target.value.trim();
														if (raw === '') {
															if (listItemState.indexHint != null) {
																onChangeListItemStyle(blockId, {
																	indexHint: null,
																});
															}
															return;
														}
														const n = Math.max(
															1,
															Math.floor(Number(raw)),
														);
														if (
															Number.isFinite(n) &&
															n !== listItemState.indexHint
														) {
															onChangeListItemStyle(blockId, {
																indexHint: n,
															});
														}
													}}
													placeholder="1"
													style={{
														width: '100%',
														padding: '4px 8px',
														fontSize: 13,
														borderRadius: 4,
														border: '1px solid var(--mde-block-menu-border, #e2e2e2)',
														backgroundColor:
															'var(--mde-bg-primary, #fff)',
														color: 'var(--mde-text-primary, #1a1a1a)',
													}}
												/>
											</div>
											<div style={styles.divider} />
										</>
									)}

									{/* Size — all new item types */}
									<div style={sectionLabel}>
										{t('blockMenu.listStyle.sizeSection')}
									</div>
									{MARKER_SIZES.map(sz => {
										const current = listItemState.style.size ?? 'medium';
										const active = current === sz.value;
										const sizePreviewChar = (() => {
											if (blockType === 'numberItem') return '1.';
											if (blockType === 'todoItem') return '☐';
											const bs = listItemState.style.bulletStyle ?? 'disc';
											return (
												BULLET_STYLES.find(s => s.value === bs)?.char ?? '•'
											);
										})();
										return (
											<div
												key={sz.value}
												style={{
													...styles.item,
													...(hoveredSubItem === `li-sz-${sz.value}`
														? styles.itemHover
														: {}),
													...(active
														? {
																backgroundColor:
																	'var(--mde-block-menu-active-bg, #e8f0fe)',
															}
														: {}),
												}}
												onMouseEnter={() =>
													setHoveredSubItem(`li-sz-${sz.value}`)
												}
												onMouseLeave={() => setHoveredSubItem(null)}
												onMouseDown={e => {
													e.preventDefault();
													e.stopPropagation();
													onChangeListItemStyle(blockId, {
														size: sz.value,
													});
													onClose();
												}}
											>
												<span style={{ fontSize: sz.preview }}>
													{sizePreviewChar}
												</span>
												<span>{t(sz.labelKey)}</span>
												{active && <div style={styles.activeIndicator} />}
											</div>
										);
									})}

									<div style={styles.divider} />

									{/* Color — all new item types */}
									<div style={sectionLabel}>
										{t('blockMenu.listStyle.colorSection')}
									</div>
									<div
										style={{
											display: 'flex',
											flexWrap: 'wrap',
											gap: 4,
											padding: '4px 10px 8px',
										}}
									>
										{MARKER_COLORS.map(mc => {
											const currentColor =
												(listItemState.style.color as string | undefined) ??
												'';
											const active =
												currentColor === mc.value ||
												(!currentColor && mc.value === '');
											return (
												<div
													key={mc.value || 'default'}
													title={t(mc.labelKey)}
													style={{
														width: 22,
														height: 22,
														borderRadius: '50%',
														backgroundColor:
															mc.value ||
															'var(--mde-text-muted, #999)',
														cursor: 'pointer',
														border: active
															? '2px solid var(--mde-block-menu-active, #2383e2)'
															: '2px solid var(--mde-block-menu-border, #e2e2e2)',
														boxSizing: 'border-box',
														transition: 'border-color 80ms',
													}}
													onMouseDown={e => {
														e.preventDefault();
														e.stopPropagation();
														onChangeListItemStyle(blockId, {
															color: mc.value || '',
														});
														onClose();
													}}
												/>
											);
										})}
										{/* Custom color picker — clicking opens the native colour
										 *  dialog. The current colour (if a non-preset one) shows
										 *  as the swatch fill; otherwise a "+" indicates "pick". */}
										{(() => {
											const currentColor =
												(listItemState.style.color as string | undefined) ??
												'';
											const isCustom =
												currentColor !== '' &&
												!MARKER_COLORS.some(
													mc => mc.value === currentColor,
												);
											return (
												<label
													title={t('blockMenu.listStyle.color.default')}
													style={{
														position: 'relative',
														width: 22,
														height: 22,
														borderRadius: '50%',
														backgroundColor: isCustom
															? currentColor
															: 'transparent',
														border: isCustom
															? '2px solid var(--mde-block-menu-active, #2383e2)'
															: '2px dashed var(--mde-block-menu-border, #c2c2c2)',
														boxSizing: 'border-box',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														cursor: 'pointer',
														color: 'var(--mde-text-muted, #999)',
													}}
													onMouseDown={e => {
														e.stopPropagation();
														listItemPickerActiveRef.current = true;
													}}
												>
													{!isCustom && (
														<Plus size={12} strokeWidth={2.5} />
													)}
													<input
														type="color"
														value={isCustom ? currentColor : '#000000'}
														onFocus={() => {
															listItemPickerActiveRef.current = true;
														}}
														onChange={e => {
															onChangeListItemStyle(blockId, {
																color: e.target.value,
															});
														}}
														onBlur={() => {
															listItemPickerActiveRef.current = false;
														}}
														style={{
															position: 'absolute',
															inset: 0,
															opacity: 0,
															cursor: 'pointer',
														}}
													/>
												</label>
											);
										})()}
									</div>
								</Submenu>
							)}
						</div>

						<div style={styles.divider} />
					</>
				)}

				{/* Table-of-contents section: pick the design (Style) + how deep to
            list headings ("Show headings up to"). Both dispatch
            `mde-toc-update`; the submenu stays open so the user can set
            both without reopening. */}
				{isToc && tocState && (
					<>
						<div
							style={{
								...itemStyle('toc-options'),
								position: 'relative' as const,
								paddingRight: showToc ? 20 : 12,
							}}
							onMouseEnter={() => {
								if (isCoarse) return;
								setHoveredItem('toc-options');
								closeSubmenus();
								setShowToc(true);
							}}
							onMouseLeave={() => {
								if (isCoarse) return;
								setHoveredItem(null);
								setShowToc(false);
							}}
						>
							<div
								style={styles.submenuTrigger}
								onPointerDown={e => {
									if (!isCoarse) return;
									e.preventDefault();
									e.stopPropagation();
									toggleSubmenu('toc');
								}}
							>
								<div style={styles.submenuTriggerLeft}>
									<TableOfContents size={15} />
									<span>{t('block.toc.label')}</span>
								</div>
								<ChevronRight size={14} />
							</div>

							{showToc && (
								<Submenu style={{ width: 220, maxHeight: 460, overflowY: 'auto' }}>
									{/* Style / design */}
									<div style={sectionLabel}>{t('block.toc.style.label')}</div>
									{TOC_STYLE_OPTIONS.map(opt => {
										const active = (tocState.variant ?? 'plain') === opt.value;
										return (
											<div
												key={opt.value}
												style={{
													...styles.item,
													...(hoveredSubItem === `toc-st-${opt.value}`
														? styles.itemHover
														: {}),
													...(active
														? {
																backgroundColor:
																	'var(--mde-block-menu-active-bg, #e8f0fe)',
															}
														: {}),
												}}
												onMouseEnter={() =>
													setHoveredSubItem(`toc-st-${opt.value}`)
												}
												onMouseLeave={() => setHoveredSubItem(null)}
												onMouseDown={e => {
													e.preventDefault();
													e.stopPropagation();
													applyTocUpdate({ tocVariant: opt.value });
												}}
											>
												<span style={{ flex: 1 }}>{t(opt.labelKey)}</span>
												{active && <div style={styles.activeIndicator} />}
											</div>
										);
									})}

									<div style={styles.divider} />

									{/* Heading depth */}
									<div style={sectionLabel}>{t('block.toc.levels.label')}</div>
									{TOC_LEVEL_OPTIONS.map(opt => {
										const active = (tocState.levels ?? 3) === opt.value;
										return (
											<div
												key={opt.value}
												style={{
													...styles.item,
													...(hoveredSubItem === `toc-lv-${opt.value}`
														? styles.itemHover
														: {}),
													...(active
														? {
																backgroundColor:
																	'var(--mde-block-menu-active-bg, #e8f0fe)',
															}
														: {}),
												}}
												onMouseEnter={() =>
													setHoveredSubItem(`toc-lv-${opt.value}`)
												}
												onMouseLeave={() => setHoveredSubItem(null)}
												onMouseDown={e => {
													e.preventDefault();
													e.stopPropagation();
													applyTocUpdate({ tocLevels: opt.value });
												}}
											>
												<span style={{ flex: 1 }}>{t(opt.labelKey)}</span>
												{active && <div style={styles.activeIndicator} />}
											</div>
										);
									})}
								</Submenu>
							)}
						</div>

						<div style={styles.divider} />
					</>
				)}

				{/* Split into columns — wraps the current block as the left column. */}
				{canSplitIntoColumns && (
					<>
						<div
							style={itemStyle('split-columns')}
							onMouseEnter={() => {
								setHoveredItem('split-columns');
								closeSubmenus();
							}}
							onMouseLeave={() => setHoveredItem(null)}
							onMouseDown={e => {
								e.preventDefault();
								onSplitIntoColumns?.(blockId);
								onClose();
							}}
						>
							<Columns2 size={15} />
							<span>{t('blockMenu.columns.splitInto')}</span>
						</div>

						<div style={styles.divider} />
					</>
				)}

				{/* Column manipulation — shown when the active block lives inside a
            columns row. Lets the user grow/shrink the row without dragging. */}
				{columnState && (
					<>
						<div
							style={itemStyle('add-column-left')}
							onMouseEnter={() => {
								setHoveredItem('add-column-left');
								closeSubmenus();
							}}
							onMouseLeave={() => setHoveredItem(null)}
							onMouseDown={e => {
								e.preventDefault();
								onAddColumnLeft?.(blockId);
								onClose();
							}}
						>
							<BetweenVerticalStart size={15} />
							<span>{t('blockMenu.columns.addColumnLeft')}</span>
						</div>

						<div
							style={itemStyle('add-column-right')}
							onMouseEnter={() => {
								setHoveredItem('add-column-right');
								closeSubmenus();
							}}
							onMouseLeave={() => setHoveredItem(null)}
							onMouseDown={e => {
								e.preventDefault();
								onAddColumnRight?.(blockId);
								onClose();
							}}
						>
							<BetweenVerticalEnd size={15} />
							<span>{t('blockMenu.columns.addColumnRight')}</span>
						</div>

						<div
							style={itemStyle('delete-column', styles.itemDelete)}
							onMouseEnter={() => {
								setHoveredItem('delete-column');
								closeSubmenus();
							}}
							onMouseLeave={() => setHoveredItem(null)}
							onMouseDown={e => {
								e.preventDefault();
								onDeleteColumn?.(blockId);
								onClose();
							}}
						>
							<Trash2 size={15} />
							<span>{t('blockMenu.columns.removeColumn')}</span>
						</div>

						<div style={styles.divider} />
					</>
				)}

				{/* Turn into (submenu) — hide for tables and column containers
            since they can't sensibly convert into another block type. */}
				{!isTable && !isColumnsStructural && (
					<>
						<div
							style={{
								...itemStyle('turn-into'),
								position: 'relative' as const,
								paddingRight: showTurnInto ? 20 : 12,
							}}
							onMouseEnter={() => {
								if (isCoarse) return;
								setHoveredItem('turn-into');
								setShowTurnInto(true);
								setShowColorTemplates(false);
							}}
							onMouseLeave={() => {
								if (isCoarse) return;
								setHoveredItem(null);
								setShowTurnInto(false);
							}}
						>
							<div
								style={styles.submenuTrigger}
								onPointerDown={e => {
									if (!isCoarse) return;
									e.preventDefault();
									e.stopPropagation();
									toggleSubmenu('turn-into');
								}}
							>
								<div style={styles.submenuTriggerLeft}>
									<Palette size={15} />
									<span>{t('blockMenu.turnInto.label')}</span>
								</div>
								<ChevronRight size={14} />
							</div>

							{showTurnInto && (
								<Submenu>
									{TURN_INTO_OPTIONS.filter(
										option =>
											option.type !== blockType &&
											(!allowedTypes || allowedTypes.includes(option.type)),
									).map(option => (
										<div
											key={option.type}
											style={{
												...styles.item,
												...(hoveredSubItem === option.type
													? styles.itemHover
													: {}),
											}}
											onMouseEnter={() => setHoveredSubItem(option.type)}
											onMouseLeave={() => setHoveredSubItem(null)}
											onMouseDown={e => {
												e.preventDefault();
												e.stopPropagation();
												onTurnInto(blockId, option.type);
												onClose();
											}}
										>
											{option.icon}
											<span>{t(option.labelKey)}</span>
										</div>
									))}
								</Submenu>
							)}
						</div>

						<div style={styles.divider} />
					</>
				)}

				{/* Actions */}
				<div
					style={itemStyle('duplicate')}
					onMouseEnter={() => {
						setHoveredItem('duplicate');
						closeSubmenus();
					}}
					onMouseLeave={() => setHoveredItem(null)}
					onMouseDown={e => {
						e.preventDefault();
						onDuplicate(blockId);
						onClose();
					}}
				>
					<Copy size={15} />
					<span>{t('blockMenu.duplicate')}</span>
				</div>

				{hostFonts.length > 0 && (
					<div
						style={{ position: 'relative' }}
						onMouseEnter={() => {
							if (isCoarse) return;
							setHoveredItem('font');
							setShowTurnInto(false);
							setShowColorTemplates(false);
							setShowListItemStyles(false);
							setShowFonts(true);
						}}
						onMouseLeave={() => {
							if (isCoarse) return;
							setHoveredItem(null);
							setShowFonts(false);
						}}
					>
						<div
							style={styles.submenuTrigger}
							onPointerDown={e => {
								if (!isCoarse) return;
								e.preventDefault();
								e.stopPropagation();
								toggleSubmenu('fonts');
							}}
						>
							<div style={styles.submenuTriggerLeft}>
								<TypeIcon size={15} />
								<span>{t('blockMenu.font')}</span>
							</div>
							<ChevronRight size={14} />
						</div>
						{showFonts && (
							<Submenu style={{ width: 220, maxHeight: 460, overflowY: 'auto' }}>
								{hostFonts.map(f => (
									<div
										key={f.label}
										style={{
											...styles.item,
											...(hoveredSubItem === `font-${f.label}`
												? styles.itemHover
												: {}),
										}}
										onMouseEnter={() => setHoveredSubItem(`font-${f.label}`)}
										onMouseLeave={() => setHoveredSubItem(null)}
										onMouseDown={e => {
											e.preventDefault();
											e.stopPropagation();
											applyBlockFont(f.value);
										}}
									>
										<span style={{ fontFamily: f.value || undefined }}>
											{f.label}
										</span>
									</div>
								))}
							</Submenu>
						)}
					</div>
				)}

				{onCopy && (
					<div
						style={itemStyle('copy')}
						onMouseEnter={() => {
							setHoveredItem('copy');
							closeSubmenus();
						}}
						onMouseLeave={() => setHoveredItem(null)}
						onMouseDown={e => {
							e.preventDefault();
							onCopy(blockId);
							onClose();
						}}
					>
						<ClipboardCopy size={15} />
						<span>{t('blockMenu.copy')}</span>
					</div>
				)}

				{onCut && (
					<div
						style={itemStyle('cut')}
						onMouseEnter={() => {
							setHoveredItem('cut');
							closeSubmenus();
						}}
						onMouseLeave={() => setHoveredItem(null)}
						onMouseDown={e => {
							e.preventDefault();
							onCut(blockId);
							onClose();
						}}
					>
						<Scissors size={15} />
						<span>{t('blockMenu.cut')}</span>
					</div>
				)}

				{onPaste && (
					<div
						style={itemStyle('paste')}
						onMouseEnter={() => {
							setHoveredItem('paste');
							closeSubmenus();
						}}
						onMouseLeave={() => setHoveredItem(null)}
						onMouseDown={e => {
							e.preventDefault();
							onPaste(blockId);
							onClose();
						}}
					>
						<ClipboardPaste size={15} />
						<span>{t('blockMenu.paste')}</span>
					</div>
				)}

				<div
					style={itemStyle('delete', styles.itemDelete)}
					onMouseEnter={() => {
						setHoveredItem('delete');
						closeSubmenus();
					}}
					onMouseLeave={() => setHoveredItem(null)}
					onMouseDown={e => {
						e.preventDefault();
						onDelete(blockId);
						onClose();
					}}
				>
					<Trash2 size={15} />
					<span>{t('blockMenu.delete')}</span>
				</div>
			</div>
		</>
	);
}

// ---- Color template helpers ----

/** Single row in the Color Theme submenu. When `onRemove` is supplied, a
 *  small × appears on hover so users can drop their custom templates. */
function TemplateRow({
	template,
	hovered,
	onHoverChange,
	onApply,
	onRemove,
}: Readonly<{
	template: ColorTemplate;
	hovered: boolean;
	onHoverChange: (hovered: boolean) => void;
	onApply: () => void;
	onRemove?: () => void;
}>) {
	const t = useT();
	const name = template.nameKey ? t(template.nameKey) : template.name;
	const description = template.descriptionKey ? t(template.descriptionKey) : template.description;
	return (
		<div
			style={{
				...styles.item,
				...(hovered ? styles.itemHover : {}),
				gap: 8,
				position: 'relative',
			}}
			onMouseEnter={() => onHoverChange(true)}
			onMouseLeave={() => onHoverChange(false)}
			onMouseDown={e => {
				e.preventDefault();
				e.stopPropagation();
				onApply();
			}}
		>
			<TemplatePreview template={template} />
			<div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
				<span style={{ fontSize: 13, fontWeight: 500 }}>{name}</span>
				<span style={{ fontSize: 11, color: 'var(--mde-text-muted, #888)' }}>
					{description}
				</span>
			</div>
			{onRemove && hovered && (
				<button
					type="button"
					title={t('blockMenu.colorTheme.remove')}
					aria-label={t('blockMenu.colorTheme.removeAria')}
					onMouseDown={e => {
						e.preventDefault();
						e.stopPropagation();
					}}
					onClick={e => {
						e.stopPropagation();
						onRemove();
					}}
					style={{
						position: 'absolute',
						top: 4,
						right: 4,
						width: 18,
						height: 18,
						borderRadius: '50%',
						border: '1px solid var(--mde-border-primary, #e5e5e5)',
						backgroundColor: 'var(--mde-bg-primary, #fff)',
						color: 'var(--mde-text-muted, #666)',
						fontSize: 11,
						lineHeight: 1,
						padding: 0,
						cursor: 'pointer',
					}}
				>
					✕
				</button>
			)}
		</div>
	);
}

/** Inline form that replaces the submenu while the user names a new template
 *  and picks header + row colors. Commits via onSave; no validation beyond
 *  requiring a name. */
function TemplateCreatorForm({
	onCancel,
	onSave,
}: Readonly<{
	onCancel: () => void;
	onSave: (template: { name: string; header: string; row: string }) => void;
}>) {
	const t = useT();
	const [name, setName] = useState('');
	const [header, setHeader] = useState('#f3f4f6');
	const [row, setRow] = useState('#f9fafb');
	const canSave = name.trim().length > 0;
	return (
		<div
			style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 10 }}
			onMouseDown={e => e.stopPropagation()}
		>
			<label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
				<span style={{ fontSize: 11, color: 'var(--mde-text-muted, #888)' }}>
					{t('blockMenu.colorTheme.templateNameLabel')}
				</span>
				<input
					type="text"
					autoFocus
					value={name}
					onChange={e => setName(e.target.value)}
					placeholder={t('blockMenu.colorTheme.templateNamePlaceholder')}
					style={{
						padding: '6px 8px',
						borderRadius: 4,
						border: '1px solid var(--mde-border-primary, #e5e5e5)',
						background: 'var(--mde-bg-primary, #fff)',
						fontSize: 13,
					}}
				/>
			</label>
			<label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
				<input
					type="color"
					value={header}
					onChange={e => setHeader(e.target.value)}
					style={{
						width: 28,
						height: 28,
						border: 'none',
						background: 'none',
						padding: 0,
					}}
				/>
				<span style={{ fontSize: 12 }}>{t('blockMenu.colorTheme.headerColorLabel')}</span>
			</label>
			<label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
				<input
					type="color"
					value={row}
					onChange={e => setRow(e.target.value)}
					style={{
						width: 28,
						height: 28,
						border: 'none',
						background: 'none',
						padding: 0,
					}}
				/>
				<span style={{ fontSize: 12 }}>{t('blockMenu.colorTheme.rowColorLabel')}</span>
			</label>
			<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
				<button
					type="button"
					onMouseDown={e => {
						e.preventDefault();
						e.stopPropagation();
						onCancel();
					}}
					style={{
						padding: '4px 10px',
						borderRadius: 4,
						border: '1px solid var(--mde-border-primary, #e5e5e5)',
						background: 'none',
						fontSize: 12,
						cursor: 'pointer',
					}}
				>
					{t('blockMenu.colorTheme.cancel')}
				</button>
				<button
					type="button"
					disabled={!canSave}
					onMouseDown={e => {
						e.preventDefault();
						e.stopPropagation();
						if (canSave) onSave({ name: name.trim(), header, row });
					}}
					style={{
						padding: '4px 10px',
						borderRadius: 4,
						border: 'none',
						background: canSave
							? 'var(--mde-accent, #2563eb)'
							: 'var(--mde-bg-hover, #eee)',
						color: canSave ? '#fff' : 'var(--mde-text-muted, #999)',
						fontSize: 12,
						cursor: canSave ? 'pointer' : 'default',
					}}
				>
					{t('blockMenu.colorTheme.save')}
				</button>
			</div>
		</div>
	);
}
