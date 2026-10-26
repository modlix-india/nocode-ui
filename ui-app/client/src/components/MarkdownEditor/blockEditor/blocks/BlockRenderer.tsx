// ============================================================
// BlockRenderer — renders a single block based on its type.
// Each block is a contentEditable container identified by
// data-block-id. The content area is marked with data-content.
// All colors use CSS variables for theme compatibility.
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Crop,
	Loader2,
	Lock,
	Maximize2,
	MoreHorizontal,
	Plus,
	Trash2,
	Unlock,
} from 'lucide-react';
import type { Block } from '../core/types';
import { TextContent } from './TextContent';
import { getRegisteredComponent } from './component-registry';
import { TableBlock } from './TableBlock';
import { ListItemBlock } from './ListItemBlock';
import {
	useEditorDoc,
	useImageUploading,
	useIsPrintMode,
	useRenderBlockList,
} from './EditorDocContext';
import { useT } from '../i18n/context';

interface BlockRendererProps {
	block: Block;
	readOnly?: boolean;
	onToggleTodo?: (blockId: string) => void;
	onToggleCollapse?: (blockId: string) => void;
	/** Position among the block's siblings — used by `numberItem` marker numbering. */
	index?: number;
	/** Nesting depth from document root — used by list-item markers to rotate
	 *  bullet glyphs and switch numbering style with depth. */
	depth?: number;
}

export function BlockRenderer({
	block,
	readOnly = false,
	onToggleTodo,
	onToggleCollapse,
	index = 0,
	depth = 0,
}: BlockRendererProps) {
	switch (block.type) {
		case 'paragraph':
			return <ParagraphBlock block={block} />;
		case 'heading1':
			return <HeadingBlock block={block} level={1} />;
		case 'heading2':
			return <HeadingBlock block={block} level={2} />;
		case 'heading3':
			return <HeadingBlock block={block} level={3} />;
		case 'heading4':
			return <HeadingBlock block={block} level={4} />;
		case 'heading5':
			return <HeadingBlock block={block} level={5} />;
		case 'heading6':
			return <HeadingBlock block={block} level={6} />;
		case 'toggleHeading1':
			return <ToggleHeadingBlock block={block} level={1} onToggle={onToggleCollapse} />;
		case 'toggleHeading2':
			return <ToggleHeadingBlock block={block} level={2} onToggle={onToggleCollapse} />;
		case 'toggleHeading3':
			return <ToggleHeadingBlock block={block} level={3} onToggle={onToggleCollapse} />;
		case 'todo':
			return <TodoBlock block={block} readOnly={readOnly} onToggle={onToggleTodo} />;
		case 'bulletItem':
		case 'numberItem':
		case 'todoItem':
			return (
				<ListItemBlock
					block={block}
					index={index}
					depth={depth}
					onToggleTodo={onToggleTodo}
				/>
			);
		case 'codeBlock':
			return <CodeBlock block={block} />;
		case 'quote':
			return <QuoteBlock block={block} />;
		case 'callout':
			return <CalloutBlock block={block} />;
		case 'toggle':
			return <ToggleBlock block={block} onToggle={onToggleCollapse} />;
		case 'divider':
			return <DividerBlock />;
		case 'image':
			return <ImageBlock block={block} readOnly={readOnly} />;
		case 'table':
			return <TableBlock block={block} readOnly={readOnly} />;
		case 'toc':
			return <TocBlock block={block} />;
		case 'columns':
			return <ColumnsBlock block={block} />;
		case 'column':
			return <ColumnBlock block={block} />;
		case 'tabs':
			return <TabsBlock block={block} />;
		case 'tab':
			return <TabBlock block={block} />;
		case 'customComponent':
			return <CustomComponentBlock block={block} />;
		default:
			return <ParagraphBlock block={block} />;
	}
}

// ---- Columns container ----

/** A horizontal row of `column` children. Widths come from props.widths
 *  (fractions of the row); fallback to equal split when missing/mismatched. */
function ColumnsBlock({ block }: { block: Block }) {
	const renderChildren = useRenderBlockList();
	const columnCount = block.children.length;
	const widths = (() => {
		const raw = (block.props.widths as number[] | undefined) ?? [];
		if (raw.length !== columnCount || columnCount === 0) {
			return Array.from({ length: columnCount }, () => 1 / Math.max(1, columnCount));
		}
		const total = raw.reduce((a, b) => a + b, 0);
		return total > 0 ? raw.map(w => w / total) : raw;
	})();

	return (
		<div
			className="mde-columns"
			data-columns-block={block.id}
			style={{
				display: 'flex',
				gap: 0,
				alignItems: 'stretch',
				width: '100%',
			}}
		>
			{block.children.map((column, idx) => {
				const isLast = idx === columnCount - 1;
				const width = widths[idx] ?? 1 / Math.max(1, columnCount);
				return (
					<React.Fragment key={column.id}>
						<div
							className="mde-column-cell"
							data-column-cell={column.id}
							data-column-index={idx}
							style={{
								flex: `${width} 0 0`,
								minWidth: 0,
								paddingLeft: idx === 0 ? 0 : 12,
								paddingRight: isLast ? 0 : 12,
							}}
						>
							{renderChildren ? (
								<BlockRenderer block={column} />
							) : (
								<ColumnFallback block={column} />
							)}
						</div>
						{!isLast && (
							<ColumnGutter
								columnsBlockId={block.id}
								leftColumnIndex={idx}
								widths={widths}
							/>
						)}
					</React.Fragment>
				);
			})}
		</div>
	);
}

/** Drag handle between two columns. Emits a `mde-column-resize` event
 *  on pointerup so the editor can apply a setBlockProps op (and history
 *  it). Drag is preview-only until commit. */
function ColumnGutter({
	columnsBlockId,
	leftColumnIndex,
	widths,
}: {
	columnsBlockId: string;
	leftColumnIndex: number;
	widths: number[];
}) {
	const startRef = useRef<{
		pointerId: number;
		startX: number;
		rowRect: DOMRect | null;
		initialWidths: number[];
		dragged: boolean;
	} | null>(null);
	const draggedRef = useRef(false);
	const [hovered, setHovered] = useState(false);
	const [open, setOpen] = useState(false);
	const gutterRef = useRef<HTMLDivElement>(null);

	const onPointerDown = (e: React.PointerEvent) => {
		const row = (e.currentTarget as HTMLElement).parentElement;
		if (!row) return;
		e.preventDefault();
		e.stopPropagation();
		draggedRef.current = false;
		startRef.current = {
			pointerId: e.pointerId,
			startX: e.clientX,
			rowRect: row.getBoundingClientRect(),
			initialWidths: [...widths],
			dragged: false,
		};
		try {
			(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		} catch {
			// Pointer no longer active; ignore.
		}
		document.body.style.cursor = 'col-resize';
	};

	const onPointerMove = (e: React.PointerEvent) => {
		const drag = startRef.current;
		if (!drag || drag.pointerId !== e.pointerId || !drag.rowRect) return;
		const dx = e.clientX - drag.startX;
		// 3px threshold separates a tap (= open toolbar) from a resize drag.
		if (!drag.dragged && Math.abs(dx) > 3) {
			drag.dragged = true;
			draggedRef.current = true;
		}
		if (!drag.dragged) return;
		const totalW = drag.rowRect.width;
		if (totalW <= 0) return;
		const deltaFrac = dx / totalW;
		const i = leftColumnIndex;
		const next = [...drag.initialWidths];
		const minFrac = 0.08;
		const leftCap = drag.initialWidths[i]! + drag.initialWidths[i + 1]! - minFrac;
		const rightCap = drag.initialWidths[i + 1]! + drag.initialWidths[i]! - minFrac;
		const newLeft = Math.max(minFrac, Math.min(leftCap, drag.initialWidths[i]! + deltaFrac));
		const newRight = drag.initialWidths[i]! + drag.initialWidths[i + 1]! - newLeft;
		next[i] = newLeft;
		next[i + 1] = Math.max(minFrac, Math.min(rightCap, newRight));
		globalThis.dispatchEvent(
			new CustomEvent('mde-column-resize-preview', {
				detail: { columnsBlockId, widths: next },
			}),
		);
	};

	const finishDrag = (e: React.PointerEvent) => {
		const drag = startRef.current;
		if (!drag || drag.pointerId !== e.pointerId) return;
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			// Pointer already released.
		}
		document.body.style.cursor = '';
		const wasDragged = drag.dragged;
		startRef.current = null;
		if (wasDragged) {
			globalThis.dispatchEvent(
				new CustomEvent('mde-column-resize-commit', {
					detail: { columnsBlockId },
				}),
			);
		}
	};

	const onClick = (e: React.MouseEvent) => {
		// Skip the click that follows a resize drag.
		if (draggedRef.current) {
			draggedRef.current = false;
			return;
		}
		e.stopPropagation();
		setOpen(prev => !prev);
	};

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			e.stopPropagation();
			setOpen(prev => !prev);
		} else if (e.key === 'Escape' && open) {
			setOpen(false);
		}
	};

	// Close the toolbar when the user clicks outside the gutter (preserving
	// the click on the underlying element so a click on another block can
	// still focus it).
	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (!gutterRef.current?.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener('click', handler);
		return () => document.removeEventListener('click', handler);
	}, [open]);

	// Let the DragHandle know when this gutter's toolbar is open so it can
	// suppress itself — otherwise the block handle's `+`/grip sit right next
	// to the toolbar and compete for attention.
	useEffect(() => {
		globalThis.dispatchEvent(new CustomEvent('mde-column-toolbar', { detail: { open } }));
		return () => {
			if (open) {
				globalThis.dispatchEvent(
					new CustomEvent('mde-column-toolbar', { detail: { open: false } }),
				);
			}
		};
	}, [open]);

	const dispatchAdd = () => {
		globalThis.dispatchEvent(
			new CustomEvent('mde-column-add', {
				detail: { columnsBlockId, gutterIndex: leftColumnIndex },
			}),
		);
		setOpen(false);
	};
	const dispatchDelete = (side: 'left' | 'right') => {
		globalThis.dispatchEvent(
			new CustomEvent('mde-column-delete', {
				detail: { columnsBlockId, gutterIndex: leftColumnIndex, side },
			}),
		);
		setOpen(false);
	};

	const accent = hovered || open;

	return (
		<div
			ref={gutterRef}
			className="mde-column-gutter"
			contentEditable={false}
			role="separator"
			aria-orientation="vertical"
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={finishDrag}
			onPointerCancel={finishDrag}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onClick={onClick}
			onKeyDown={onKeyDown}
			tabIndex={0}
			title="Click to add or remove columns"
			style={{
				flex: '0 0 12px',
				cursor: 'col-resize',
				position: 'relative',
				userSelect: 'none',
				touchAction: 'none',
			}}
		>
			<div
				className="mde-column-gutter-line"
				style={{
					position: 'absolute',
					left: '50%',
					top: 0,
					bottom: 0,
					width: accent ? 2 : 1,
					marginLeft: accent ? -1 : -0.5,
					backgroundColor: accent
						? 'var(--mde-accent, #2563eb)'
						: 'var(--mde-border-primary, #e5e5e5)',
					opacity: accent ? 0.6 : 0.55,
					transition: 'opacity 150ms, background-color 150ms, width 150ms',
					pointerEvents: 'none',
				}}
			/>

			{open && <GutterToolbar onAdd={dispatchAdd} onDelete={dispatchDelete} />}
		</div>
	);
}

/** Floating panel of add/delete buttons shown when the gutter is hovered.
 *  Pulled out as its own component so the hover state on each button can
 *  drive its own styling without re-renders bleeding into the gutter. */
function GutterToolbar({
	onAdd,
	onDelete,
}: Readonly<{
	onAdd: () => void;
	onDelete: (side: 'left' | 'right') => void;
}>) {
	return (
		<div
			style={{
				position: 'absolute',
				left: '50%',
				top: 6,
				transform: 'translateX(-50%)',
				display: 'flex',
				flexDirection: 'column',
				gap: 4,
				padding: 4,
				borderRadius: 8,
				background: 'var(--mde-bg-primary, #ffffff)',
				border: '1px solid var(--mde-border-primary, #e5e5e5)',
				boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
				// Sit above the DragHandle (z-index 10) so the gutter toolbar is the
				// foreground UI when it's open — the block handle dims into the
				// background instead of overlapping the buttons.
				zIndex: 20,
			}}
		>
			<div style={{ display: 'flex', gap: 4 }}>
				<GutterIconButton kind="add" label="Add column here" onClick={onAdd} />
				<GutterIconButton kind="add" label="Add column here" onClick={onAdd} />
			</div>
			<div style={{ display: 'flex', gap: 4 }}>
				<GutterIconButton
					kind="delete"
					label="Delete left column"
					onClick={() => onDelete('left')}
				/>
				<GutterIconButton
					kind="delete"
					label="Delete right column"
					onClick={() => onDelete('right')}
				/>
			</div>
		</div>
	);
}

function GutterIconButton({
	kind,
	label,
	onClick,
}: Readonly<{
	kind: 'add' | 'delete';
	label: string;
	onClick: () => void;
}>) {
	const [hovered, setHovered] = useState(false);
	const isDelete = kind === 'delete';
	// Both kinds get a vivid hover colour so the highlight reads consistently
	// across the row — add picks the brand accent, delete the destructive red.
	const hoverColor = isDelete ? '#dc2626' : 'var(--mde-accent, #2563eb)';
	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			onPointerDown={e => e.stopPropagation()}
			onMouseDown={e => e.preventDefault()}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onClick={e => {
				e.stopPropagation();
				onClick();
			}}
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: 26,
				height: 26,
				border: 'none',
				borderRadius: 5,
				background: hovered ? 'var(--mde-bg-hover, #ececec)' : 'transparent',
				color: hovered ? hoverColor : 'var(--mde-text-muted, #666)',
				cursor: 'pointer',
				padding: 0,
				transition: 'background-color 100ms, color 100ms',
			}}
		>
			{isDelete ? <Trash2 size={14} /> : <Plus size={14} />}
		</button>
	);
}

/** A single column inside a columns row. Its children are rendered via the
 *  context-provided list renderer so each child gets the same wrapper used
 *  at the document root. */
function ColumnBlock({ block }: { block: Block }) {
	const renderChildren = useRenderBlockList();
	return (
		<div className="mde-column" data-column-block={block.id} style={{ minWidth: 0 }}>
			{renderChildren ? renderChildren(block.children) : <ColumnFallback block={block} />}
		</div>
	);
}

/** Fallback when rendered outside the editor (no context provider). */
function ColumnFallback({ block }: { block: Block }) {
	return (
		<div>
			{block.children.map(child => (
				<div key={child.id} data-block-id={child.id}>
					<BlockRenderer block={child} />
				</div>
			))}
		</div>
	);
}

// ---- Tabs ----

const TAB_LSKEY = (blockId: string) => `mde:tabs:active:${blockId}`;

function readPersistedActiveTab(blockId: string): number | null {
	try {
		const raw = globalThis.localStorage?.getItem(TAB_LSKEY(blockId));
		if (!raw) return null;
		const n = parseInt(raw, 10);
		return Number.isFinite(n) ? n : null;
	} catch {
		return null;
	}
}

function writePersistedActiveTab(blockId: string, index: number) {
	try {
		globalThis.localStorage?.setItem(TAB_LSKEY(blockId), String(index));
	} catch {
		/* localStorage disabled (e.g. private mode) — silently no-op */
	}
}

function TabsBlock({ block }: { block: Block }) {
	const renderChildren = useRenderBlockList();
	const printMode = useIsPrintMode();
	const tabs = block.children;
	const fallbackActive = (block.props.activeTab as number | undefined) ?? 0;
	const theme = (block.props.tabTheme as string | undefined) ?? 'pill';

	const [active, setActiveState] = useState<number>(() => {
		const persisted = readPersistedActiveTab(block.id);
		if (persisted !== null && persisted >= 0 && persisted < tabs.length) {
			return persisted;
		}
		return Math.min(fallbackActive, Math.max(0, tabs.length - 1));
	});

	// Clamp active when the number of tabs shrinks (delete tab, etc.)
	useEffect(() => {
		if (active >= tabs.length && tabs.length > 0) setActiveState(tabs.length - 1);
	}, [tabs.length, active]);

	const setActive = useCallback(
		(idx: number) => {
			setActiveState(idx);
			writePersistedActiveTab(block.id, idx);
		},
		[block.id],
	);

	const dispatch = useCallback(
		(action: 'add' | 'delete' | 'rename', extra: Record<string, unknown> = {}) => {
			globalThis.dispatchEvent(
				new CustomEvent('mde-tab-action', {
					detail: { tabsBlockId: block.id, action, ...extra },
				}),
			);
		},
		[block.id],
	);

	const onRename = useCallback(
		(tabId: string, currentLabel: string) => {
			const next = globalThis.prompt('Rename tab', currentLabel);
			if (next === null) return;
			const trimmed = next.trim();
			if (!trimmed || trimmed === currentLabel) return;
			dispatch('rename', { tabId, label: trimmed });
		},
		[dispatch],
	);

	const activeChild = tabs[active] ?? tabs[0];
	const themeStyles = TAB_THEMES[theme] ?? TAB_THEMES.pill;

	// On paper there is nothing to click, and only the active tab is ever in the
	// DOM — so printing the interactive form would silently drop every other
	// tab's content. Print the strip as stacked sections instead, each headed by
	// its own tab label, so the whole block survives the export.
	if (printMode) {
		return (
			<div
				className="mde-tabs mde-tabs-print"
				data-tabs-block={block.id}
				contentEditable={false}
			>
				{tabs.map((tab, idx) => {
					const label =
						(tab.props.tabLabel as string | undefined) ??
						(tab.content.length > 0
							? tab.content.map(s => s.text).join('')
							: `Tab ${idx + 1}`);
					return (
						<section
							key={tab.id}
							className="mde-tabs-print-section"
							data-tab-id={tab.id}
						>
							<div className="mde-tabs-print-label">{label}</div>
							{renderChildren && renderChildren(tab.children)}
						</section>
					);
				})}
			</div>
		);
	}

	return (
		<div className="mde-tabs" data-tabs-block={block.id} contentEditable={false}>
			<div className="mde-tabs-strip" style={themeStyles.strip}>
				{tabs.map((tab, idx) => {
					const isActive = idx === active;
					const label =
						(tab.props.tabLabel as string | undefined) ??
						(tab.content.length > 0
							? tab.content.map(s => s.text).join('')
							: `Tab ${idx + 1}`);
					return (
						<div
							key={tab.id}
							className="mde-tabs-tab"
							data-tab-id={tab.id}
							data-tab-active={isActive ? 'true' : 'false'}
							style={{
								...themeStyles.tab,
								...(isActive ? themeStyles.activeTab : {}),
								display: 'inline-flex',
								alignItems: 'center',
								gap: 4,
							}}
						>
							<button
								type="button"
								onClick={() => setActive(idx)}
								onDoubleClick={e => {
									e.stopPropagation();
									onRename(tab.id, label);
								}}
								onContextMenu={e => {
									e.preventDefault();
									onRename(tab.id, label);
								}}
								title="Click to select. Double-click or right-click to rename."
								style={{
									background: 'none',
									border: 'none',
									cursor: 'pointer',
									font: 'inherit',
									color: 'currentColor',
									padding: 0,
								}}
							>
								{label}
							</button>
							{tabs.length > 1 && (
								<button
									type="button"
									className="mde-tabs-tab-close"
									onClick={e => {
										e.stopPropagation();
										dispatch('delete', { tabId: tab.id });
									}}
									aria-label={`Delete ${label}`}
									title="Delete tab"
									style={{
										background: 'none',
										border: 'none',
										color: 'currentColor',
										cursor: 'pointer',
										padding: '0 2px',
										opacity: isActive ? 0.7 : 0,
										fontSize: '0.85em',
										lineHeight: 1,
									}}
								>
									×
								</button>
							)}
						</div>
					);
				})}
				<button
					type="button"
					className="mde-tabs-add"
					onClick={() => dispatch('add')}
					aria-label="Add tab"
					title="Add tab"
					style={{
						...themeStyles.tab,
						background: 'none',
						border: 'none',
						cursor: 'pointer',
						color: 'var(--mde-text-muted, #888)',
						font: 'inherit',
						padding: '6px 8px',
					}}
				>
					+
				</button>
			</div>
			{activeChild && renderChildren && (
				<div
					className="mde-tabs-panel"
					style={themeStyles.panel}
					data-tab-panel-for={activeChild.id}
					contentEditable={true}
					suppressContentEditableWarning
				>
					{renderChildren(activeChild.children)}
				</div>
			)}
		</div>
	);
}

/**
 * Tab block — single tab inside a `tabs` container. Rendered only when its
 * parent is showing this tab; otherwise hidden. The tab's own content
 * (text spans) is the tab label; its children are the body shown when
 * active. Doesn't render anything itself — the parent TabsBlock owns the
 * layout. This stub exists so BlockRenderer can dispatch without crashing
 * if a `tab` block somehow appears outside a `tabs` parent.
 */
function TabBlock({ block }: { block: Block }) {
	const renderChildren = useRenderBlockList();
	return (
		<div
			data-orphan-tab={block.id}
			style={{ padding: 8, border: '1px dashed var(--mde-text-muted, #aaa)' }}
		>
			<div style={{ fontWeight: 600, marginBottom: 4 }}>
				{block.content.map(s => s.text).join('') || 'Tab'}
			</div>
			{renderChildren && renderChildren(block.children)}
		</div>
	);
}

/**
 * Visual themes for the tab strip. Each theme defines style snippets for:
 *   strip      — the horizontal bar that holds tab buttons
 *   tab        — every tab button (idle state)
 *   activeTab  — overrides for the selected tab
 *   panel      — the content panel beneath the strip
 *
 * The "pill" theme matches the screenshot: light gray rounded pill on the
 * active tab, plain text on inactive. Other themes give the user options
 * via the block menu's "Tab theme" submenu (added separately).
 */
type TabThemeStyles = {
	strip: React.CSSProperties;
	tab: React.CSSProperties;
	activeTab: React.CSSProperties;
	panel: React.CSSProperties;
};

const TAB_THEMES: Record<string, TabThemeStyles> = {
	pill: {
		strip: {
			display: 'flex',
			gap: 4,
			marginBottom: 12,
			paddingBottom: 8,
			borderBottom: '1px solid var(--mde-border, var(--mde-border-primary, #e6e6e6))',
		},
		tab: {
			padding: '6px 12px',
			borderRadius: 999,
			color: 'var(--mde-text-muted, #666)',
			fontSize: 14,
		},
		activeTab: {
			backgroundColor: 'var(--mde-surface-sidebar, rgba(0,0,0,0.06))',
			color: 'var(--mde-text-primary, #111)',
			fontWeight: 500,
		},
		panel: { padding: '4px 0' },
	},
	underline: {
		strip: {
			display: 'flex',
			gap: 16,
			borderBottom: '1px solid var(--mde-border, #e6e6e6)',
			marginBottom: 12,
		},
		tab: {
			padding: '6px 0',
			borderBottom: '2px solid transparent',
			color: 'var(--mde-text-muted, #666)',
			fontSize: 14,
		},
		activeTab: {
			borderBottom: '2px solid var(--mde-accent, #2563eb)',
			color: 'var(--mde-text-primary, #111)',
			fontWeight: 500,
		},
		panel: { padding: '4px 0' },
	},
	card: {
		strip: {
			display: 'flex',
			gap: 0,
			marginBottom: 0,
		},
		tab: {
			padding: '8px 14px',
			borderRadius: '8px 8px 0 0',
			border: '1px solid var(--mde-border, #e6e6e6)',
			borderBottom: 'none',
			marginRight: -1,
			background: 'var(--mde-surface-sidebar, #f4f4f5)',
			color: 'var(--mde-text-muted, #666)',
			fontSize: 14,
		},
		activeTab: {
			background: 'var(--mde-surface-elevated, #fff)',
			color: 'var(--mde-text-primary, #111)',
			fontWeight: 500,
		},
		panel: {
			border: '1px solid var(--mde-border, #e6e6e6)',
			borderRadius: '0 8px 8px 8px',
			padding: 16,
		},
	},
	minimal: {
		strip: { display: 'flex', gap: 16, marginBottom: 8 },
		tab: { padding: 0, color: 'var(--mde-text-muted, #888)', fontSize: 14 },
		activeTab: { color: 'var(--mde-text-primary, #111)', fontWeight: 600 },
		panel: { padding: 0 },
	},
};

function ParagraphBlock({ block }: { block: Block }) {
	return (
		<div data-content style={{ minHeight: '1.5em', lineHeight: 1.625, padding: '1px 0' }}>
			<TextContent content={block.content} />
		</div>
	);
}

function HeadingBlock({ block, level }: { block: Block; level: 1 | 2 | 3 | 4 | 5 | 6 }) {
	const styles: Record<1 | 2 | 3 | 4 | 5 | 6, React.CSSProperties> = {
		1: {
			fontSize: '1.875rem',
			fontWeight: 700,
			lineHeight: 1.25,
			marginTop: 4,
			marginBottom: 4,
		},
		2: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.25, marginTop: 4, marginBottom: 4 },
		3: {
			fontSize: '1.25rem',
			fontWeight: 600,
			lineHeight: 1.375,
			marginTop: 4,
			marginBottom: 4,
		},
		4: {
			fontSize: '1.125rem',
			fontWeight: 600,
			lineHeight: 1.375,
			marginTop: 2,
			marginBottom: 2,
		},
		5: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5, marginTop: 2, marginBottom: 2 },
		6: {
			fontSize: '0.875rem',
			fontWeight: 600,
			lineHeight: 1.5,
			marginTop: 2,
			marginBottom: 2,
			textTransform: 'uppercase',
			letterSpacing: '0.05em',
		},
	};

	return (
		<div data-content style={{ minHeight: '1.2em', ...styles[level] }}>
			<TextContent content={block.content} />
		</div>
	);
}

/**
 * ToggleHeadingBlock — heading with a fold arrow that hides/shows children.
 * Shape is identical to a regular heading + the toggle-block pattern:
 *   props.collapsed?: boolean   (defaults to false / expanded)
 *   block.children: Block[]     (rendered indented when expanded)
 * Children are added the same way as for `toggle` — Tab on a paragraph
 * directly under the toggle heading moves it into children. (The Tab
 * indent logic in `core/input.ts` doesn't gate on type; it nests into the
 * previous sibling when the sibling supports children.)
 */
function ToggleHeadingBlock({
	block,
	level,
	onToggle,
}: {
	block: Block;
	level: 1 | 2 | 3;
	onToggle?: (id: string) => void;
}) {
	// On paper a collapsed heading would drop its whole section silently, so
	// print always renders folded content. Render-only — props.collapsed is
	// untouched, so the on-screen fold state survives the print run.
	const printMode = useIsPrintMode();
	const collapsed = printMode ? false : ((block.props.collapsed as boolean | undefined) ?? false);
	const renderChildren = useRenderBlockList();
	const fontSize = level === 1 ? '1.875rem' : level === 2 ? '1.5rem' : '1.25rem';
	const fontWeight = level === 1 ? 700 : 600;
	// Caret size scales with heading level so it doesn't look like a tiny
	// afterthought on an h1 or a big arrow on an h3.
	const caretButtonSize = level === 1 ? 26 : level === 2 ? 22 : 18;
	const caretGlyphSize = level === 1 ? 20 : level === 2 ? 16 : 14;
	// Indent the children container to align under the heading text — same
	// offset as the caret button so the cascade reads as "this is inside
	// the heading".
	const childIndent = caretButtonSize + 8;

	const handleFold = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			onToggle?.(block.id);
		},
		[block.id, onToggle],
	);

	const addChild = useCallback(() => {
		// Fires the same action the Tab indent uses — host editor catches
		// and appends an empty paragraph into block.children.
		globalThis.dispatchEvent(
			new CustomEvent('mde-toggle-add-child', { detail: { blockId: block.id } }),
		);
	}, [block.id]);

	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			<div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
				<button
					type="button"
					onClick={handleFold}
					contentEditable={false}
					aria-label={collapsed ? 'Expand' : 'Collapse'}
					aria-expanded={!collapsed}
					style={{
						marginTop: '0.35em',
						width: caretButtonSize,
						height: caretButtonSize,
						flexShrink: 0,
						background: 'none',
						border: 'none',
						padding: 0,
						cursor: 'pointer',
						color: 'var(--mde-text-muted, #888)',
						transition: 'transform 120ms',
						transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)',
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<svg
						viewBox="0 0 16 16"
						width={caretGlyphSize}
						height={caretGlyphSize}
						fill="currentColor"
					>
						<path d="M6 4l4 4-4 4V4z" />
					</svg>
				</button>
				<div
					data-content
					style={{
						flex: 1,
						minHeight: '1.2em',
						fontSize,
						fontWeight,
						lineHeight: 1.25,
						marginTop: 4,
						marginBottom: 4,
					}}
				>
					<TextContent content={block.content} />
				</div>
			</div>
			{!collapsed && renderChildren && (
				<div style={{ marginLeft: childIndent, marginTop: 2 }}>
					{block.children.length > 0 ? (
						renderChildren(block.children)
					) : (
						<button
							type="button"
							onClick={addChild}
							contentEditable={false}
							className="mde-toggle-empty-hint"
							style={{
								background: 'none',
								border: 'none',
								padding: '2px 0',
								cursor: 'text',
								color: 'var(--mde-text-muted, #9ca3af)',
								fontSize: '0.95em',
								textAlign: 'left',
							}}
						>
							Empty toggle. Click to add content.
						</button>
					)}
				</div>
			)}
		</div>
	);
}

function TodoBlock({
	block,
	readOnly,
	onToggle,
}: {
	block: Block;
	readOnly?: boolean;
	onToggle?: (id: string) => void;
}) {
	const checked = block.props.checked ?? false;

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			if (readOnly) return;
			e.preventDefault();
			e.stopPropagation();
			onToggle?.(block.id);
		},
		[block.id, onToggle, readOnly],
	);

	return (
		<div style={{ display: 'flex', gap: 8, paddingLeft: 6 }}>
			<button
				type="button"
				style={{
					marginTop: '0.2em',
					height: 18,
					width: 18,
					flexShrink: 0,
					borderRadius: 3,
					border: '1px solid',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					transition: 'all 150ms',
					borderColor: checked ? 'var(--mde-accent)' : 'var(--mde-border-secondary)',
					backgroundColor: checked ? 'var(--mde-accent)' : 'transparent',
					padding: 0,
					cursor: 'pointer',
				}}
				contentEditable={false}
				onClick={handleClick}
				aria-checked={checked}
				role="checkbox"
			>
				{checked && (
					<svg style={{ height: 12, width: 12 }} viewBox="0 0 16 16" fill="white">
						<path d="M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0z" />
					</svg>
				)}
			</button>
			<div
				data-content
				style={{
					minHeight: '1.5em',
					flex: 1,
					lineHeight: 1.625,
					transition: 'color 150ms, background-color 150ms',
					...(checked
						? { textDecoration: 'line-through', color: 'var(--mde-text-muted)' }
						: {}),
				}}
			>
				<TextContent content={block.content} />
			</div>
		</div>
	);
}

function CodeBlock({ block }: { block: Block }) {
	const language = block.props.language ?? '';
	return (
		<div
			style={{
				margin: '8px 0',
				borderRadius: 8,
				border: '1px solid',
				backgroundColor: 'var(--mde-bg-secondary)',
				borderColor: 'var(--mde-border-primary)',
			}}
		>
			{language && (
				<div
					style={{
						paddingLeft: 16,
						paddingRight: 16,
						paddingTop: 4,
						paddingBottom: 4,
						fontSize: '0.75rem',
						borderBottom: '1px solid',
						userSelect: 'none',
						color: 'var(--mde-text-muted)',
						borderColor: 'var(--mde-border-primary)',
					}}
					contentEditable={false}
				>
					{language}
				</div>
			)}
			<pre style={{ padding: 16, overflowX: 'auto' }}>
				<code
					data-content
					style={{
						fontFamily: "'SF Mono', 'Fira Code', Menlo, monospace",
						fontSize: '0.875rem',
						lineHeight: 1.625,
						color: 'var(--mde-text-primary)',
					}}
				>
					<TextContent content={block.content} />
				</code>
			</pre>
		</div>
	);
}

function QuoteBlock({ block }: { block: Block }) {
	return (
		<div style={{ display: 'flex' }}>
			<div
				style={{
					marginRight: 12,
					width: 4,
					flexShrink: 0,
					borderRadius: '9999px',
					backgroundColor: 'var(--mde-accent)',
				}}
				contentEditable={false}
			/>
			<div
				data-content
				style={{
					minHeight: '1.5em',
					flex: 1,
					fontStyle: 'italic',
					lineHeight: 1.625,
					color: 'var(--mde-text-secondary)',
				}}
			>
				<TextContent content={block.content} />
			</div>
		</div>
	);
}

function CalloutBlock({ block }: { block: Block }) {
	const emoji = block.props.emoji ?? '💡';

	return (
		<div
			style={{
				display: 'flex',
				gap: 12,
				borderRadius: 8,
				padding: 16,
				backgroundColor: 'var(--mde-surface-sidebar, var(--mde-bg-secondary, #f4f4f5))',
			}}
		>
			<span style={{ fontSize: '1.125rem', userSelect: 'none' }} contentEditable={false}>
				{emoji}
			</span>
			<div data-content style={{ minHeight: '1.5em', flex: 1, lineHeight: 1.625 }}>
				<TextContent content={block.content} />
			</div>
		</div>
	);
}

function ToggleBlock({ block, onToggle }: { block: Block; onToggle?: (id: string) => void }) {
	// See ToggleHeadingBlock — print expands folded content rather than losing it.
	const printMode = useIsPrintMode();
	const collapsed = printMode ? false : (block.props.collapsed ?? false);
	const renderChildren = useRenderBlockList();

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			onToggle?.(block.id);
		},
		[block.id, onToggle],
	);

	const addChild = useCallback(() => {
		globalThis.dispatchEvent(
			new CustomEvent('mde-toggle-add-child', { detail: { blockId: block.id } }),
		);
	}, [block.id]);

	return (
		<div>
			<div style={{ display: 'flex', gap: 4 }}>
				<button
					type="button"
					style={{
						marginTop: '0.25em',
						height: 20,
						width: 20,
						flexShrink: 0,
						transition: 'transform 150ms',
						color: 'var(--mde-text-muted)',
						transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)',
						background: 'none',
						border: 'none',
						padding: 0,
						cursor: 'pointer',
					}}
					contentEditable={false}
					onClick={handleClick}
				>
					<svg
						viewBox="0 0 16 16"
						fill="currentColor"
						style={{ height: '100%', width: '100%' }}
					>
						<path d="M6 4l4 4-4 4V4z" />
					</svg>
				</button>
				<div
					data-content
					style={{ minHeight: '1.5em', flex: 1, fontWeight: 500, lineHeight: 1.625 }}
				>
					<TextContent content={block.content} />
				</div>
			</div>
			{!collapsed && renderChildren && (
				<div
					className="mde-toggle-children"
					style={{
						marginLeft: 24,
						marginTop: 4,
						paddingLeft: 16,
					}}
				>
					{block.children.length > 0 ? (
						renderChildren(block.children)
					) : (
						<button
							type="button"
							onClick={addChild}
							contentEditable={false}
							className="mde-toggle-empty-hint"
							style={{
								background: 'none',
								border: 'none',
								padding: '2px 0',
								cursor: 'text',
								color: 'var(--mde-text-muted, #9ca3af)',
								fontSize: '0.95em',
								textAlign: 'left',
							}}
						>
							Empty toggle. Click to add content.
						</button>
					)}
				</div>
			)}
		</div>
	);
}

function DividerBlock() {
	return (
		<div style={{ paddingTop: 12, paddingBottom: 12 }} contentEditable={false}>
			<hr style={{ borderColor: 'var(--mde-border-primary)' }} />
		</div>
	);
}

// `text-align` on the outer container is what anchors the inline-block
// inner wrapper to the chosen edge. margin-auto wouldn't work here —
// the inner wrapper sizes to its content, not 100% of the outer div,
// so an `auto` margin has nothing to centre against.
function layoutTextAlign(
	layout: 'left' | 'center' | 'right' | 'full',
): 'left' | 'center' | 'right' {
	if (layout === 'center') return 'center';
	if (layout === 'right') return 'right';
	return 'left';
}

// Image element height. Full-width: `auto` so aspect ratio is
// preserved against the column-derived width. Otherwise honour the
// user's H input only when aspect lock is off (lock=on means W
// alone drives height via natural ratio).
function imgRenderHeight(
	isInline: boolean,
	isFullWidth: boolean,
	lockAspect: boolean,
	imgH: number,
): number | string | undefined {
	if (!isInline && isFullWidth) return 'auto';
	if (lockAspect) return 'auto';
	return imgH || undefined;
}

function ImageBlock({ block }: { block: Block; readOnly?: boolean }) {
	const t = useT();
	const src = block.props.src;
	const alt = block.props.alt ?? '';
	const caption = block.props.caption;
	// True while the host upload for this block is in flight — `src` holds a
	// local data-URL preview that swaps to the durable URL once it resolves.
	const isUploading = useImageUploading().has(block.id);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [mode, setMode] = useState<'upload' | 'url'>('upload');
	const [urlInput, setUrlInput] = useState('');
	const handleFileSelect = useCallback(
		(file: File) => {
			if (!file.type.startsWith('image/')) return;
			const reader = new FileReader();
			reader.onload = () => {
				const dataUrl = reader.result as string;
				globalThis.dispatchEvent(
					new CustomEvent('mde-image-upload', {
						detail: { blockId: block.id, dataUrl, fileName: file.name, file },
					}),
				);
			};
			reader.readAsDataURL(file);
		},
		[block.id],
	);

	const handleUrlSubmit = useCallback(() => {
		const url = urlInput.trim();
		if (!url) return;
		globalThis.dispatchEvent(
			new CustomEvent('mde-image-upload', {
				detail: { blockId: block.id, dataUrl: url, fileName: '' },
			}),
		);
		setUrlInput('');
	}, [block.id, urlInput]);

	const handleClick = useCallback(() => {
		// Dispatch event to check if a custom browse handler is registered
		const event = new CustomEvent('mde-image-browse', {
			detail: { blockId: block.id },
			cancelable: true,
		});
		const handled = !globalThis.dispatchEvent(event);
		// If the event was not preventDefault()'d, fall back to native file input
		if (!handled) {
			fileInputRef.current?.click();
		}
	}, [block.id]);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) handleFileSelect(file);
		},
		[handleFileSelect],
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			const file = e.dataTransfer.files?.[0];
			if (file) handleFileSelect(file);
		},
		[handleFileSelect],
	);

	// --- Image selection, resize, crop, and toolbar state ---
	const isInline = block.props.inline === true;
	const [selected, setSelected] = useState(false);
	const [imgW, setImgW] = useState<number>((block.props.width as number) || 0);
	const [imgH, setImgH] = useState<number>((block.props.height as number) || 0);
	const [naturalW, setNaturalW] = useState(0);
	const [naturalH, setNaturalH] = useState(0);
	const [editingAlt, setEditingAlt] = useState(false);
	const [altText, setAltText] = useState(alt as string);
	const [lockAspect, setLockAspect] = useState(true);
	const [cropMode, setCropMode] = useState(false);
	// Layout: how the image positions itself within the page column.
	// Mutually exclusive — full takes the column width, the others
	// anchor the (sized) image left/center/right. Defaults to "center"
	// for new and legacy blocks (legacy blocks have no `layout` prop;
	// re-rendering them with center matches the user-facing rollout).
	// Inline images skip layout entirely — they live in text flow.
	type ImageLayout = 'left' | 'center' | 'right' | 'full';
	const layout: ImageLayout = (block.props.layout as ImageLayout | undefined) ?? 'center';
	const isFullWidth = layout === 'full';
	// Crop state: position and size of the visible window within the full image
	const [cropX, setCropX] = useState<number>((block.props.cropX as number) || 0);
	const [cropY, setCropY] = useState<number>((block.props.cropY as number) || 0);
	const [cropW, setCropW] = useState<number>((block.props.cropW as number) || 0);
	const [cropH, setCropH] = useState<number>((block.props.cropH as number) || 0);
	const isCropped = cropW > 0 && cropH > 0;
	const imgRef = useRef<HTMLImageElement>(null);
	const cropRef = useRef<HTMLDivElement>(null);

	// Adopt external document changes (undo/redo, remote sync) back into local
	// state. Resize/crop mutate these via `useState` and only echo to props on
	// commit, so without this an undo reverts the doc but the image keeps its
	// stale size/crop until a refresh remounts the block. During a drag the
	// props haven't changed yet, so these effects don't fire and can't fight the
	// in-flight gesture. Width/height only adopt explicit positive values so an
	// auto-sized (unmeasured) image isn't forced to 0; crop adopts 0 too since
	// 0 is the meaningful "uncropped" value.
	useEffect(() => {
		const w = block.props.width as number | undefined;
		const h = block.props.height as number | undefined;
		if (typeof w === 'number' && w > 0) setImgW(w);
		if (typeof h === 'number' && h > 0) setImgH(h);
	}, [block.props.width, block.props.height]);

	useEffect(() => {
		setCropX((block.props.cropX as number) || 0);
		setCropY((block.props.cropY as number) || 0);
		setCropW((block.props.cropW as number) || 0);
		setCropH((block.props.cropH as number) || 0);
	}, [block.props.cropX, block.props.cropY, block.props.cropW, block.props.cropH]);

	useEffect(() => {
		if (!editingAlt) setAltText((block.props.alt as string) ?? '');
	}, [block.props.alt, editingAlt]);

	const ratio = naturalW && naturalH ? naturalW / naturalH : 1;

	const handleImgLoad = useCallback(() => {
		const img = imgRef.current;
		if (!img) return;
		setNaturalW(img.naturalWidth);
		setNaturalH(img.naturalHeight);
		// Use the actual rendered size (respecting maxWidth) not the natural size
		if (!imgW) {
			// Wait a frame for layout to settle, then read the actual rendered width
			requestAnimationFrame(() => {
				if (img.offsetWidth) {
					setImgW(img.offsetWidth);
					setImgH(img.offsetHeight);
				}
			});
		}
	}, [imgW]);

	const dispatchImageUpdate = useCallback(
		(props: Record<string, unknown>) => {
			globalThis.dispatchEvent(
				new CustomEvent('mde-image-update', { detail: { blockId: block.id, ...props } }),
			);
		},
		[block.id],
	);

	// Refs for drag closures
	const wRef = useRef(imgW);
	wRef.current = imgW;
	const hRef = useRef(imgH);
	hRef.current = imgH;
	const lockRef = useRef(lockAspect);
	lockRef.current = lockAspect;
	const ratioRef = useRef(ratio);
	ratioRef.current = ratio;
	const cropXRef = useRef(cropX);
	cropXRef.current = cropX;
	const cropYRef = useRef(cropY);
	cropYRef.current = cropY;
	const cropWRef = useRef(cropW);
	cropWRef.current = cropW;
	const cropHRef = useRef(cropH);
	cropHRef.current = cropH;

	// Resize: drag bottom-right handle.
	//   • Uncropped, locked aspect: width drives height via natural ratio.
	//   • Uncropped, free aspect:  width and height move independently.
	//   • Cropped: scale crop window + full-image backing + crop offset
	//     all proportionally. The visible content stays the same; the
	//     whole picture just gets bigger or smaller. (Without this branch,
	//     resize updates imgW/imgH but the rendered element is sized by
	//     cropW/cropH and never changes — which is the symptom we hit.)
	const handleResizeStart = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			const startX = e.clientX;
			const startY = e.clientY;
			// Snapshot every state value that participates in the math so
			// the move handler doesn't drift across re-renders.
			const wasCropped = !!(cropWRef.current && cropHRef.current);
			const startImgW = wRef.current;
			const startImgH = hRef.current;
			const startCropX = cropXRef.current;
			const startCropY = cropYRef.current;
			// No `startCropW` snapshot — when cropped, the rendered
			// element's width *is* cropW, so `startW` already encodes it
			// and the scale factor is `newW / startW`.
			const startCropH = cropHRef.current;
			// Read the start size from whichever element is actually rendered.
			// When cropped, that's the cropRef'd background-image div; when
			// not cropped, the <img>. Falling back to imgRef (only) like the
			// old code did meant cropped resizes always started from 300/200.
			const renderEl: HTMLElement | null = wasCropped ? cropRef.current : imgRef.current;
			const startW = renderEl?.offsetWidth || startImgW || 300;
			const startH = renderEl?.offsetHeight || startImgH || 200;

			const onMouseMove = (ev: MouseEvent) => {
				const dx = ev.clientX - startX;
				const dy = ev.clientY - startY;
				const newW = Math.max(50, Math.round(startW + dx));

				if (wasCropped) {
					const scale = newW / startW;
					setCropW(newW);
					setCropH(Math.max(50, Math.round(startCropH * scale)));
					setImgW(Math.max(1, Math.round(startImgW * scale)));
					setImgH(Math.max(1, Math.round(startImgH * scale)));
					setCropX(Math.max(0, Math.round(startCropX * scale)));
					setCropY(Math.max(0, Math.round(startCropY * scale)));
				} else if (lockRef.current) {
					setImgW(newW);
					setImgH(Math.round(newW / ratioRef.current));
				} else {
					const newH = Math.max(50, Math.round(startH + dy));
					setImgW(newW);
					setImgH(newH);
				}
			};
			const onMouseUp = () => {
				// Persist everything that moved. For uncropped resizes only
				// width/height change; for cropped resizes the crop fields
				// moved too and need to land in the doc as a single update so
				// the next render computes the right backing dimensions.
				const update: Record<string, unknown> = {
					width: wRef.current,
					height: hRef.current,
				};
				if (cropWRef.current && cropHRef.current) {
					update.cropX = cropXRef.current;
					update.cropY = cropYRef.current;
					update.cropW = cropWRef.current;
					update.cropH = cropHRef.current;
				}
				dispatchImageUpdate(update);
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mouseup', onMouseUp);
			};
			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);
		},
		[dispatchImageUpdate],
	);

	// Crop: drag edges to adjust the visible crop window within the full image
	// cropX/cropY = offset of visible area from top-left of image
	// cropW/cropH = size of the visible crop window
	const handleCropStart = useCallback(
		(e: React.MouseEvent, edge: 'right' | 'bottom' | 'left' | 'top') => {
			e.preventDefault();
			e.stopPropagation();
			const startX = e.clientX;
			const startY = e.clientY;
			const startCropX = cropXRef.current;
			const startCropY = cropYRef.current;
			const startCropW = cropWRef.current || wRef.current;
			const startCropH = cropHRef.current || hRef.current;
			const fullW = wRef.current;
			const fullH = hRef.current;

			// Initialize crop if first time
			if (!cropWRef.current) {
				setCropW(fullW);
				setCropH(fullH);
			}

			const onMouseMove = (ev: MouseEvent) => {
				const dx = ev.clientX - startX;
				const dy = ev.clientY - startY;
				if (edge === 'right') {
					// Shrink/grow from the right: change cropW
					setCropW(
						Math.max(50, Math.min(fullW - startCropX, Math.round(startCropW + dx))),
					);
				} else if (edge === 'left') {
					// Shrink/grow from the left: change cropX and cropW
					const newX = Math.max(
						0,
						Math.min(startCropX + startCropW - 50, Math.round(startCropX + dx)),
					);
					setCropX(newX);
					setCropW(startCropW + (startCropX - newX));
				} else if (edge === 'bottom') {
					setCropH(
						Math.max(50, Math.min(fullH - startCropY, Math.round(startCropH + dy))),
					);
				} else if (edge === 'top') {
					const newY = Math.max(
						0,
						Math.min(startCropY + startCropH - 50, Math.round(startCropY + dy)),
					);
					setCropY(newY);
					setCropH(startCropH + (startCropY - newY));
				}
			};
			const onMouseUp = () => {
				dispatchImageUpdate({
					cropX: cropXRef.current,
					cropY: cropYRef.current,
					cropW: cropWRef.current,
					cropH: cropHRef.current,
				});
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mouseup', onMouseUp);
			};
			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);
		},
		[dispatchImageUpdate],
	);

	// Sync W/H state from actual DOM size when selected (fixes maxWidth mismatch)
	React.useEffect(() => {
		if (!selected) return;
		const el = imgRef.current || cropRef.current;
		if (el) {
			const renderedW = el.offsetWidth;
			const renderedH = el.offsetHeight;
			if (!isCropped && renderedW && renderedW !== imgW) setImgW(renderedW);
			if (!isCropped && renderedH && renderedH !== imgH) setImgH(renderedH);
		}
	}, [selected]); // eslint-disable-line @eslint-react/exhaustive-deps

	// Deselect on click outside
	const containerRef = useRef<HTMLDivElement>(null);
	React.useEffect(() => {
		if (!selected) return;
		const onClick = (e: MouseEvent) => {
			const wrapper = containerRef.current;
			if (wrapper && !wrapper.contains(e.target as Node)) {
				setSelected(false);
				setCropMode(false);
				dispatchImageUpdate({
					width: wRef.current,
					height: hRef.current,
					cropX: cropXRef.current,
					cropY: cropYRef.current,
					cropW: cropWRef.current,
					cropH: cropHRef.current,
				});
			}
		};
		document.addEventListener('mousedown', onClick);
		return () => document.removeEventListener('mousedown', onClick);
	}, [selected, dispatchImageUpdate]);

	// Resize pip (blue, bottom-right only)
	const resizePipStyle: React.CSSProperties = {
		position: 'absolute',
		width: 12,
		height: 12,
		backgroundColor: 'white',
		border: '2px solid rgba(37, 99, 235, 0.7)',
		borderRadius: 2,
		cursor: 'nwse-resize',
		zIndex: 10,
		bottom: -6,
		right: -6,
	};

	// Crop edge handles (dark red bars on each side)
	const cropEdgeBase: React.CSSProperties = {
		position: 'absolute',
		backgroundColor: '#991b1b',
		borderRadius: 3,
		zIndex: 10,
		opacity: 0.8,
	};
	const cropEdges = {
		right: {
			...cropEdgeBase,
			top: '20%',
			right: -4,
			width: 6,
			height: '60%',
			cursor: 'ew-resize',
		} as React.CSSProperties,
		left: {
			...cropEdgeBase,
			top: '20%',
			left: -4,
			width: 6,
			height: '60%',
			cursor: 'ew-resize',
		} as React.CSSProperties,
		bottom: {
			...cropEdgeBase,
			left: '20%',
			bottom: -4,
			height: 6,
			width: '60%',
			cursor: 'ns-resize',
		} as React.CSSProperties,
		top: {
			...cropEdgeBase,
			left: '20%',
			top: -4,
			height: 6,
			width: '60%',
			cursor: 'ns-resize',
		} as React.CSSProperties,
	};

	if (!src) {
		const tabStyle = (active: boolean): React.CSSProperties => ({
			padding: '4px 12px',
			fontSize: 12,
			fontWeight: active ? 600 : 400,
			border: 'none',
			borderBottom: active ? '2px solid var(--mde-accent, #2563eb)' : '2px solid transparent',
			background: 'none',
			cursor: 'pointer',
			color: active ? 'var(--mde-text-primary, #333)' : 'var(--mde-text-muted, #999)',
		});

		return (
			<div
				contentEditable={false}
				style={{
					borderRadius: 8,
					border: '1px dashed var(--mde-border-secondary, #ddd)',
					overflow: 'hidden',
				}}
			>
				{/* Tab switcher */}
				<div
					style={{
						display: 'flex',
						borderBottom: '1px solid var(--mde-border-primary, #eee)',
						padding: '0 8px',
					}}
				>
					<button
						type="button"
						style={tabStyle(mode === 'upload')}
						onClick={() => setMode('upload')}
					>
						Upload
					</button>
					<button
						type="button"
						style={tabStyle(mode === 'url')}
						onClick={() => setMode('url')}
					>
						Embed link
					</button>
				</div>

				{mode === 'upload' ? (
					<button
						type="button"
						style={{
							display: 'flex',
							height: 160,
							width: '100%',
							cursor: 'pointer',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 8,
							border: 'none',
							backgroundColor: 'transparent',
							color: 'var(--mde-text-muted)',
						}}
						onClick={handleClick}
						onDragOver={handleDragOver}
						onDrop={handleDrop}
					>
						<svg
							style={{ height: 32, width: 32 }}
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth={1.5}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
							/>
						</svg>
						<span style={{ fontSize: 13 }}>Click to upload or drag an image</span>
						<span style={{ fontSize: 11, color: 'var(--mde-text-muted, #bbb)' }}>
							PNG, JPG, GIF, SVG, WEBP
						</span>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							style={{ display: 'none' }}
							onChange={handleInputChange}
						/>
					</button>
				) : (
					<div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
						<div style={{ display: 'flex', gap: 8 }}>
							<input
								type="text"
								value={urlInput}
								onChange={e => setUrlInput(e.target.value)}
								onKeyDown={e => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleUrlSubmit();
									}
									e.stopPropagation();
								}}
								placeholder={t('image.urlPlaceholder')}
								style={{
									flex: 1,
									padding: '6px 10px',
									fontSize: 13,
									border: '1px solid var(--mde-border-primary, #ddd)',
									borderRadius: 6,
									outline: 'none',
									fontFamily: 'inherit',
								}}
							/>
							<button
								type="button"
								onClick={handleUrlSubmit}
								style={{
									padding: '6px 14px',
									fontSize: 13,
									fontWeight: 500,
									border: 'none',
									borderRadius: 6,
									backgroundColor: urlInput.trim()
										? 'var(--mde-accent, #2563eb)'
										: 'var(--mde-bg-tertiary, #eee)',
									color: urlInput.trim() ? '#fff' : 'var(--mde-text-muted, #999)',
									cursor: urlInput.trim() ? 'pointer' : 'default',
								}}
							>
								Embed
							</button>
						</div>
						<span style={{ fontSize: 11, color: 'var(--mde-text-muted, #bbb)' }}>
							Works with any image URL (jpg, png, gif, svg)
						</span>
					</div>
				)}
			</div>
		);
	}

	// In crop mode, compute the active crop region for overlay positioning
	const activeCropX = cropW ? cropX : 0;
	const activeCropY = cropW ? cropY : 0;
	const activeCropW = cropW || imgW;
	const activeCropH = cropH || imgH;

	// Cropped + full-width: switch the cropped div from fixed-pixel
	// sizing to percentage-based sizing so it scales with the column
	// width while still showing the same crop region.
	//
	//   width:               100%
	//   aspect-ratio:        cropW/cropH (preserves visible shape)
	//   background-size:     bg is (imgW/cropW)x larger than the visible
	//                        area, computed as a percentage of the
	//                        container so it scales together.
	//   background-position: percentage formula uses CSS's
	//                        `(container - bg) * pct` rule. The result
	//                        for our case is `cropOffset / (img - crop)`
	//                        — clamped to 0 when no axis crop happened.
	const isCroppedFullWidth = !isInline && isFullWidth && isCropped;
	const bgSizeWPct = cropW ? (imgW / cropW) * 100 : 100;
	const bgSizeHPct = cropH ? (imgH / cropH) * 100 : 100;
	const bgPosXPct = imgW > cropW && cropW ? (cropX / (imgW - cropW)) * 100 : 0;
	const bgPosYPct = imgH > cropH && cropH ? (cropY / (imgH - cropH)) * 100 : 0;

	return (
		<div
			ref={containerRef}
			style={{
				position: 'relative',
				margin: isInline ? '4px 4px 4px 0' : '8px 0',
				display: isInline ? 'inline-block' : 'block',
				verticalAlign: 'top',
				maxWidth: isInline ? '48%' : undefined,
				// Full-width images stretch the wrapper to the column width;
				// the inner img element follows via maxWidth: 100%.
				width: !isInline && isFullWidth ? '100%' : undefined,
				// Per-alignment text-align is enough to anchor the
				// inline-block image wrapper inside the block-level outer
				// container — margin-auto wouldn't work because the inner
				// wrapper sizes to its content, not to 100% of this div.
				textAlign: !isInline && !isFullWidth ? layoutTextAlign(layout) : undefined,
			}}
			contentEditable={false}
		>
			{/* Image container with selection + resize/crop */}
			<div
				style={{
					position: 'relative',
					// Full-width: this wrapper becomes block-level and stretches
					// the column. Aligned modes keep `inline-block` so the W/H
					// sizing the user picked still applies and the outer
					// container's `text-align` anchors it.
					display: !isInline && isFullWidth ? 'block' : 'inline-block',
					// text-align reset so an inherited center on the outer
					// container doesn't push the cropped/uncropped image off
					// its top-left in nested cases.
					textAlign: 'left',
					width: !isInline && isFullWidth ? '100%' : undefined,
					maxWidth: '100%',
					cursor: 'pointer',
					outline: selected && !cropMode ? '2px solid rgba(37, 99, 235, 0.5)' : undefined,
					outlineOffset: 2,
					borderRadius: 8,
				}}
				onClick={() => setSelected(!selected)}
			>
				{/* Normal view when cropped: div with background-image showing only crop region.
            When full-width is on, switch from fixed-pixel sizing to percentages so the
            cropped element stretches with the column instead of staying at cropW px. */}
				{isCropped && !cropMode ? (
					<div
						ref={cropRef}
						style={
							isCroppedFullWidth
								? {
										width: '100%',
										aspectRatio: `${cropW} / ${cropH}`,
										backgroundImage: `url(${src})`,
										backgroundSize: `${bgSizeWPct}% ${bgSizeHPct}%`,
										backgroundPosition: `${bgPosXPct}% ${bgPosYPct}%`,
										backgroundRepeat: 'no-repeat',
										borderRadius: 8,
										display: 'block',
									}
								: {
										width: cropW,
										height: cropH,
										backgroundImage: `url(${src})`,
										backgroundSize: `${imgW}px ${imgH}px`,
										backgroundPosition: `-${cropX}px -${cropY}px`,
										backgroundRepeat: 'no-repeat',
										borderRadius: 8,
										display: 'block',
									}
						}
					/>
				) : !cropMode ? (
					/* Normal view, not cropped: plain img.
             Full-width overrides the manual W/H — the image follows
             the column. Otherwise honour imgW (and imgH when aspect
             lock is off). */
					<img
						ref={imgRef}
						src={src as string}
						alt={alt as string}
						onLoad={handleImgLoad}
						style={{
							width: !isInline && isFullWidth ? '100%' : imgW || undefined,
							height: imgRenderHeight(isInline, isFullWidth, lockAspect, imgH),
							maxWidth: '100%',
							borderRadius: 8,
							display: 'block',
						}}
					/>
				) : (
					/* Crop mode: full image with darkened overlay outside crop region */
					<div
						style={{ position: 'relative', display: 'inline-block' }}
						onClick={e => e.stopPropagation()}
					>
						{/* Full image (dimmed) */}
						<img
							ref={imgRef}
							src={src as string}
							alt={alt as string}
							onLoad={handleImgLoad}
							style={{
								width: imgW || undefined,
								height: !lockAspect ? imgH || undefined : 'auto',
								maxWidth: 'none',
								display: 'block',
								opacity: 0.4,
							}}
						/>
						{/* Bright crop region overlay */}
						<div
							style={{
								position: 'absolute',
								left: activeCropX,
								top: activeCropY,
								width: activeCropW,
								height: activeCropH,
								backgroundImage: `url(${src})`,
								backgroundSize: `${imgW}px ${imgH}px`,
								backgroundPosition: `-${activeCropX}px -${activeCropY}px`,
								backgroundRepeat: 'no-repeat',
								border: '2px solid #991b1b',
								boxSizing: 'border-box',
							}}
						>
							{/* Crop edge handles inside the crop region */}
							<div
								onMouseDown={e => handleCropStart(e, 'right')}
								style={cropEdges.right}
							/>
							<div
								onMouseDown={e => handleCropStart(e, 'left')}
								style={cropEdges.left}
							/>
							<div
								onMouseDown={e => handleCropStart(e, 'bottom')}
								style={cropEdges.bottom}
							/>
							<div
								onMouseDown={e => handleCropStart(e, 'top')}
								style={cropEdges.top}
							/>
						</div>
					</div>
				)}

				{/* Resize mode: single bottom-right handle */}
				{selected && !cropMode && (
					<div onMouseDown={handleResizeStart} style={resizePipStyle} />
				)}

				{/* Uploading overlay — dims the local preview and shows a spinner
            while the host upload is in flight. pointer-events:none so it's
            purely visual and doesn't swallow clicks on the image. */}
				{isUploading && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 8,
							borderRadius: 8,
							backgroundColor: 'rgba(255, 255, 255, 0.55)',
							color: 'var(--mde-text-secondary, #555)',
							fontSize: 13,
							fontWeight: 500,
							pointerEvents: 'none',
							zIndex: 15,
						}}
					>
						<Loader2 size={18} className="mde-spin" />
						<span>{t('image.uploading')}</span>
					</div>
				)}
			</div>

			{/* Toolbar — shown when selected, floats above content */}
			{selected && (
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: '100%',
						marginTop: 6,
						display: 'flex',
						flexDirection: 'column',
						gap: 6,
						padding: '8px 12px',
						borderRadius: 8,
						backgroundColor: 'var(--mde-bg-secondary, #f5f5f5)',
						border: '1px solid var(--mde-border-primary, #e5e5e5)',
						fontSize: 13,
						maxWidth: 340,
						zIndex: 20,
						boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
					}}
					onMouseDown={e => e.stopPropagation()}
				>
					{/* Row 0: layout — left/center/right/full. Hidden for
              inline images (they live in text flow, no anchor to
              choose). Mutually exclusive: picking any one clears the
              others. */}
					{!isInline && (
						<div
							role="radiogroup"
							aria-label={t('image.layoutGroup')}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 2,
								padding: 2,
								border: '1px solid var(--mde-border-primary, #ddd)',
								borderRadius: 6,
								width: 'fit-content',
							}}
						>
							{(
								[
									{
										value: 'left',
										icon: <AlignLeft size={16} />,
										labelKey: 'image.layoutLeft',
									},
									{
										value: 'center',
										icon: <AlignCenter size={16} />,
										labelKey: 'image.layoutCenter',
									},
									{
										value: 'right',
										icon: <AlignRight size={16} />,
										labelKey: 'image.layoutRight',
									},
									{
										value: 'full',
										icon: <Maximize2 size={16} />,
										labelKey: 'image.layoutFull',
									},
								] as const
							).map(opt => {
								const active = layout === opt.value;
								return (
									<button
										key={opt.value}
										type="button"
										role="radio"
										aria-checked={active}
										onClick={() => dispatchImageUpdate({ layout: opt.value })}
										title={t(opt.labelKey)}
										style={{
											background: active ? 'rgba(37, 99, 235, 0.1)' : 'none',
											border: 'none',
											borderRadius: 4,
											cursor: 'pointer',
											color: active
												? 'rgba(37, 99, 235, 0.9)'
												: 'var(--mde-text-muted, #888)',
											padding: '4px 6px',
											display: 'flex',
											alignItems: 'center',
										}}
									>
										{opt.icon}
									</button>
								);
							})}
						</div>
					)}
					{/* Row 1: W × H + lock + crop */}
					<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
						<label
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 4,
								color: 'var(--mde-text-secondary, #666)',
							}}
						>
							W
							<input
								type="number"
								value={imgW || ''}
								onChange={e => {
									const w = parseInt(e.target.value) || 0;
									setImgW(w);
									if (lockAspect && ratio && w) setImgH(Math.round(w / ratio));
								}}
								onBlur={() => dispatchImageUpdate({ width: imgW, height: imgH })}
								onKeyDown={e => e.stopPropagation()}
								style={{
									width: 70,
									padding: '4px 6px',
									border: '1px solid var(--mde-border-primary, #ddd)',
									borderRadius: 6,
									fontSize: 13,
									textAlign: 'center',
								}}
							/>
						</label>
						<span style={{ color: 'var(--mde-text-muted, #bbb)', fontSize: 14 }}>
							×
						</span>
						<label
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 4,
								color: 'var(--mde-text-secondary, #666)',
							}}
						>
							H
							<input
								type="number"
								value={imgH || ''}
								onChange={e => {
									const h = parseInt(e.target.value) || 0;
									setImgH(h);
									if (lockAspect && ratio && h) setImgW(Math.round(h * ratio));
								}}
								onBlur={() => dispatchImageUpdate({ width: imgW, height: imgH })}
								onKeyDown={e => e.stopPropagation()}
								style={{
									width: 70,
									padding: '4px 6px',
									border: '1px solid var(--mde-border-primary, #ddd)',
									borderRadius: 6,
									fontSize: 13,
									textAlign: 'center',
								}}
							/>
						</label>
						<button
							type="button"
							onClick={() => setLockAspect(!lockAspect)}
							title={lockAspect ? t('image.unlockAspect') : t('image.lockAspect')}
							style={{
								background: 'none',
								border: 'none',
								cursor: 'pointer',
								color: lockAspect
									? 'rgba(37, 99, 235, 0.8)'
									: 'var(--mde-text-muted, #bbb)',
								padding: '2px 4px',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							{lockAspect ? <Lock size={16} /> : <Unlock size={16} />}
						</button>
						<button
							type="button"
							onClick={() => {
								if (!cropMode && imgW && imgH) {
									// Entering crop mode: initialize crop to full image if not already set
									if (!cropW || !cropH) {
										setCropX(0);
										setCropY(0);
										setCropW(imgW);
										setCropH(imgH);
									}
								}
								setCropMode(!cropMode);
							}}
							title={cropMode ? t('image.exitCropMode') : t('image.enterCropMode')}
							style={{
								background: cropMode ? 'rgba(37, 99, 235, 0.1)' : 'none',
								border: cropMode ? '1px solid rgba(37, 99, 235, 0.3)' : 'none',
								borderRadius: 4,
								cursor: 'pointer',
								color: cropMode
									? 'rgba(37, 99, 235, 0.8)'
									: 'var(--mde-text-muted, #bbb)',
								padding: '2px 4px',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							<Crop size={16} />
						</button>
					</div>

					{/* Row 2: Alt text — full width */}
					{editingAlt ? (
						<input
							type="text"
							value={altText}
							onChange={e => setAltText(e.target.value)}
							onBlur={() => {
								dispatchImageUpdate({ alt: altText });
								setEditingAlt(false);
							}}
							onKeyDown={e => {
								e.stopPropagation();
								if (e.key === 'Enter') {
									dispatchImageUpdate({ alt: altText });
									setEditingAlt(false);
								}
								if (e.key === 'Escape') setEditingAlt(false);
							}}
							autoFocus
							placeholder={t('image.altPlaceholder')}
							style={{
								width: '100%',
								padding: '4px 8px',
								border: '1px solid var(--mde-border-primary, #ddd)',
								borderRadius: 6,
								fontSize: 13,
								boxSizing: 'border-box',
							}}
						/>
					) : (
						<button
							type="button"
							onClick={() => setEditingAlt(true)}
							style={{
								background: 'none',
								border: '1px solid var(--mde-border-primary, #ddd)',
								borderRadius: 6,
								cursor: 'pointer',
								padding: '4px 8px',
								fontSize: 13,
								color: altText
									? 'var(--mde-text-secondary, #666)'
									: 'var(--mde-text-muted, #bbb)',
								textAlign: 'left',
								width: '100%',
							}}
						>
							{altText || 'Add alt text'}
						</button>
					)}
				</div>
			)}

			{/* Caption */}
			{caption && (
				<p
					style={{
						marginTop: 4,
						textAlign: 'center',
						fontSize: '0.875rem',
						color: 'var(--mde-text-muted)',
					}}
				>
					{caption}
				</p>
			)}
		</div>
	);
}

const LEVEL_LABEL_KEYS = {
	1: 'block.toc.levels.one',
	2: 'block.toc.levels.two',
	3: 'block.toc.levels.three',
	4: 'block.toc.levels.four',
	5: 'block.toc.levels.five',
	6: 'block.toc.levels.six',
} as const;

type TocLevel = 1 | 2 | 3 | 4 | 5 | 6;
const TOC_LEVELS: readonly TocLevel[] = [1, 2, 3, 4, 5, 6];

export type TocVariant = 'plain' | 'bulleted' | 'numbered' | 'card' | 'accent';

// Level-varying bullet glyphs for the "bulleted" TOC design, indexed by
// depth below the shallowest heading. Cycles for very deep nesting.
const TOC_BULLETS = ['•', '◦', '▪', '‣', '·', '–'] as const;

/**
 * Compute hierarchical section numbers ("1", "1.1", "1.1.1") for the
 * "numbered" TOC design. Levels are treated by their depth relative to the
 * shallowest heading present, so a doc that starts at h2 still numbers from 1.
 */
function computeTocNumbers(headings: { level: number }[], minLevel: number): string[] {
	const counters: number[] = [];
	return headings.map(h => {
		const depth = h.level - minLevel; // 0-based
		counters[depth] = (counters[depth] ?? 0) + 1;
		counters.length = depth + 1; // drop deeper counters when we climb back up
		return counters.slice(0, depth + 1).join('.');
	});
}

/**
 * Table of Contents block — renders an inline list of the document's headings
 * (up to `block.props.tocLevels`, default 3) in one of five designs
 * (`block.props.tocVariant`, default "plain"): plain indented text, bulleted,
 * hierarchically numbered, a bordered card, or a left accent-bar list. Design
 * + depth are changed from the block's drag-handle menu (see the TOC section
 * in `block-menu.tsx`). This is a pure in-document block; the floating
 * right-rail nav is handled separately by `HeadingRail` (always-on, doc-level)
 * and is independent of this block.
 */
function TocBlock({ block }: { block: Block }) {
	const t = useT();
	const doc = useEditorDoc();
	const rawLevel = (block.props.tocLevels as number) ?? 3;
	const maxLevel = Math.min(6, Math.max(1, Math.round(rawLevel))) as TocLevel;
	const variant: TocVariant = (block.props.tocVariant as TocVariant) ?? 'plain';
	const [hoveredId, setHoveredId] = useState<string | null>(null);

	const headings = React.useMemo(() => {
		if (!doc) return [] as { id: string; text: string; level: number }[];
		const headingLevels: Record<string, number> = {
			heading1: 1,
			heading2: 2,
			heading3: 3,
			heading4: 4,
			heading5: 5,
			heading6: 6,
			// Collapsible toggle headings count toward the outline at their
			// equivalent depth — same as Notion treats them.
			toggleHeading1: 1,
			toggleHeading2: 2,
			toggleHeading3: 3,
		};
		const out: { id: string; text: string; level: number }[] = [];
		for (const b of doc.blocks) {
			const level = headingLevels[b.type];
			if (!level || level > maxLevel) continue;
			const text = b.content
				.map(s => s.text)
				.join('')
				.trim();
			if (!text) continue;
			out.push({ id: b.id, text, level });
		}
		return out;
	}, [doc, maxLevel]);

	const minLevel = headings.length > 0 ? Math.min(...headings.map(h => h.level)) : 1;
	const numbers = React.useMemo(
		() => (variant === 'numbered' ? computeTocNumbers(headings, minLevel) : []),
		[variant, headings, minLevel],
	);

	const handleClick = useCallback((blockId: string) => {
		const el = document.querySelector(`[data-block-id="${blockId}"]`);
		el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}, []);

	const isAccent = variant === 'accent';

	const renderList = () => (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			{headings.map((h, i) => {
				const depth = h.level - minLevel;
				const indent = depth * (isAccent ? 14 : 20);
				const isHover = h.id === hoveredId;
				const color = isHover
					? 'var(--mde-accent, #2563eb)'
					: 'var(--mde-text-secondary, #555)';
				return (
					<button
						key={h.id}
						type="button"
						onClick={() => handleClick(h.id)}
						onMouseEnter={() => setHoveredId(h.id)}
						onMouseLeave={() => setHoveredId(null)}
						style={{
							display: 'flex',
							alignItems: 'baseline',
							gap: variant === 'bulleted' || variant === 'numbered' ? 8 : 0,
							width: '100%',
							background: 'none',
							border: 'none',
							borderLeft: isAccent
								? `2px solid ${isHover ? 'var(--mde-accent, #2563eb)' : 'var(--mde-border-primary, #e5e5e5)'}`
								: undefined,
							cursor: 'pointer',
							textAlign: 'left',
							padding: '4px 0',
							paddingLeft: isAccent ? indent + 12 : indent,
							fontSize: 14,
							lineHeight: 1.6,
							color,
							fontFamily: 'inherit',
							transition: 'color 120ms ease, border-color 120ms ease',
						}}
					>
						{variant === 'bulleted' && (
							<span
								aria-hidden
								style={{
									flexShrink: 0,
									width: '1em',
									textAlign: 'center',
									color: isHover
										? 'var(--mde-accent, #2563eb)'
										: 'var(--mde-text-muted, #999)',
								}}
							>
								{TOC_BULLETS[depth % TOC_BULLETS.length]}
							</span>
						)}
						{variant === 'numbered' && (
							<span
								aria-hidden
								style={{
									flexShrink: 0,
									fontSize: 13,
									fontVariantNumeric: 'tabular-nums',
									color: isHover
										? 'var(--mde-accent, #2563eb)'
										: 'var(--mde-text-muted, #999)',
								}}
							>
								{numbers[i]}
							</span>
						)}
						<span
							style={{
								flex: '1 1 auto',
								minWidth: 0,
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
							}}
						>
							{h.text}
						</span>
					</button>
				);
			})}
		</div>
	);

	if (headings.length === 0) {
		return (
			<div
				contentEditable={false}
				style={{
					fontSize: 14,
					color: 'var(--mde-text-muted, #999)',
					fontStyle: 'italic',
					padding: '8px 0',
					lineHeight: 1.5,
				}}
			>
				{t('block.toc.empty')}
			</div>
		);
	}

	return (
		<nav
			contentEditable={false}
			aria-label={t('block.toc.label')}
			style={{ margin: '4px 0', padding: '4px 0' }}
		>
			{variant === 'card' ? (
				<div
					style={{
						border: '1px solid var(--mde-border-primary, #e5e5e5)',
						background: 'var(--mde-bg-secondary, #f8f8f8)',
						borderRadius: 10,
						padding: '12px 16px',
					}}
				>
					<div
						style={{
							fontSize: 11,
							fontWeight: 600,
							textTransform: 'uppercase',
							letterSpacing: '0.05em',
							color: 'var(--mde-text-muted, #999)',
							marginBottom: 6,
						}}
					>
						{t('block.toc.heading')}
					</div>
					{renderList()}
				</div>
			) : (
				renderList()
			)}
		</nav>
	);
}

/**
 * HeadingRail — always-on floating right-rail nav, independent of the TOC
 * block. Subscribes to the doc, derives headings, and portals a fixed-position
 * rail to <body>:
 *   • collapsed:  vertical column of short lines, indented by heading level,
 *     active heading rendered as a longer/darker bar.
 *   • on hover:   the rail expands into a card listing every heading by text,
 *     with the active heading highlighted and hover state in accent color.
 *
 * Desktop only (≥960px). Below that, the rail does not render at all — the
 * inline TOC block is the only navigation surface on narrow viewports.
 */
export function HeadingRail() {
	const t = useT();
	const doc = useEditorDoc();
	const [maxLevel, setMaxLevel] = useState<TocLevel>(3);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [expanded, setExpanded] = useState(false);
	const [filterOpen, setFilterOpen] = useState(false);
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);
	const [isWide, setIsWide] = useState(true);
	// Vertical anchor (px from viewport top) for the floating rail. Tracks the
	// page title so the rail sits next to it regardless of cover-image height.
	const [anchorTop, setAnchorTop] = useState<number>(120);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Resolve the rail's top anchor: prefer `[data-page-title]` (host opt-in),
	// fall back to the editor's top edge. We store the title's *absolute* doc
	// position (rect.top + scrollY) so position:fixed pins the rail to that
	// viewport y forever — it should not follow the title off-screen on scroll.
	// Only recomputes on layout changes (cover loads, resize), not on scroll.
	useEffect(() => {
		if (typeof globalThis.ResizeObserver !== 'function') return;
		const recompute = () => {
			const titleEl = document.querySelector('[data-page-title]');
			const editorEl = document.querySelector('.mde-editor');
			const target = titleEl ?? editorEl;
			if (!target) return;
			const rect = target.getBoundingClientRect();
			setAnchorTop(rect.top + globalThis.scrollY);
		};
		recompute();
		const ro = new ResizeObserver(recompute);
		ro.observe(document.body);
		globalThis.addEventListener('resize', recompute);
		return () => {
			ro.disconnect();
			globalThis.removeEventListener('resize', recompute);
		};
	}, []);

	// Desktop-only. Below 960px (phones, narrow tablets, mobile Capacitor
	// shells) the rail does not render at all.
	useEffect(() => {
		if (typeof globalThis.matchMedia !== 'function') return;
		const mq = globalThis.matchMedia('(min-width: 960px)');
		setIsWide(mq.matches);
		const handler = (e: MediaQueryListEvent) => setIsWide(e.matches);
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	}, []);

	const headings = React.useMemo(() => {
		if (!doc) return [] as { id: string; text: string; level: number }[];
		const headingLevels: Record<string, number> = {
			heading1: 1,
			heading2: 2,
			heading3: 3,
			heading4: 4,
			heading5: 5,
			heading6: 6,
			// Collapsible toggle headings count toward the outline at their
			// equivalent depth — same as Notion treats them.
			toggleHeading1: 1,
			toggleHeading2: 2,
			toggleHeading3: 3,
		};
		const out: { id: string; text: string; level: number }[] = [];
		for (const b of doc.blocks) {
			const level = headingLevels[b.type];
			if (!level || level > maxLevel) continue;
			const text = b.content
				.map(s => s.text)
				.join('')
				.trim();
			if (!text) continue;
			out.push({ id: b.id, text, level });
		}
		return out;
	}, [doc, maxLevel]);

	const minLevel = headings.length > 0 ? Math.min(...headings.map(h => h.level)) : 1;

	// Track which heading is currently visible near the top of the viewport.
	useEffect(() => {
		if (headings.length === 0) {
			setActiveId(null);
			return;
		}
		const elements: Element[] = [];
		for (const h of headings) {
			const el = document.querySelector(`[data-block-id="${h.id}"]`);
			if (el) elements.push(el);
		}
		if (elements.length === 0) return;

		const visible = new Set<string>();
		const observer = new IntersectionObserver(
			entries => {
				for (const entry of entries) {
					const id = (entry.target as HTMLElement).dataset.blockId;
					if (!id) continue;
					if (entry.isIntersecting) visible.add(id);
					else visible.delete(id);
				}
				let pick: { id: string; top: number } | null = null;
				for (const id of visible) {
					const el = document.querySelector(`[data-block-id="${id}"]`);
					if (!el) continue;
					const top = el.getBoundingClientRect().top;
					if (pick === null || top < pick.top) pick = { id, top };
				}
				if (pick) setActiveId(pick.id);
			},
			{ rootMargin: '-20% 0px -70% 0px', threshold: [0, 1] },
		);
		elements.forEach(el => observer.observe(el));
		return () => observer.disconnect();
	}, [headings]);

	const handleClick = useCallback((blockId: string) => {
		const el = document.querySelector(`[data-block-id="${blockId}"]`);
		el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}, []);

	const setLevel = useCallback((level: TocLevel) => {
		setFilterOpen(false);
		setMaxLevel(level);
	}, []);

	if (!mounted || !isWide || headings.length === 0) return null;

	// The rail is fixed at `top: anchorTop` (the page title's viewport y, which
	// sits well below the top edge when there's a cover image). A flat `70vh`
	// cap would therefore push the card's bottom past the viewport and clip it.
	// Cap the height to whatever space is actually left below the anchor (minus
	// a small gutter) so the card always fits on screen and scrolls internally.
	const availableMaxHeight = `min(80vh, max(200px, calc(100vh - ${anchorTop}px - 24px)))`;

	const rail = (
		<nav
			// Portaled to <body>, so it sits outside #root and escapes any
			// print-root swap. The class is how print.css reaches it.
			className="mde-heading-rail"
			aria-label={t('block.toc.label')}
			onMouseEnter={() => setExpanded(true)}
			onMouseLeave={() => {
				setExpanded(false);
				setFilterOpen(false);
			}}
			style={{
				position: 'fixed',
				right: 32,
				top: anchorTop,
				// Below the app header/menus (host header is z-20). Portaled to <body>,
				// so a higher value would float the rail on top of page chrome like the
				// page-settings menu that opens from the top-right.
				zIndex: 10,
				maxHeight: availableMaxHeight,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'flex-end',
				opacity: expanded ? 1 : 0.7,
				transition: 'opacity 160ms ease',
			}}
		>
			{expanded ? (
				<div
					style={{
						position: 'relative',
						background: 'var(--mde-bg-primary, #fff)',
						border: '1px solid var(--mde-border-primary, #e5e5e5)',
						borderRadius: 12,
						boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
						padding: '10px 6px',
						minWidth: 200,
						maxWidth: 320,
						maxHeight: availableMaxHeight,
						display: 'flex',
						flexDirection: 'column',
						fontFamily: 'inherit',
					}}
				>
					{/* Scrollable heading list. Overflow lives on this inner wrapper —
              NOT the card — so the level-filter popup below can overflow the
              card's bounds without being clipped. (overflow:auto on one axis
              forces the cross axis to clip too, which otherwise hides the
              upward-opening menu.) The bottom padding reserves room for the
              absolutely-positioned level-filter button so the last heading
              never scrolls underneath it. */}
					<div
						style={{
							flex: '1 1 auto',
							minHeight: 0,
							overflowY: 'auto',
							paddingBottom: 24,
						}}
					>
						{headings.map(h => {
							const isActive = h.id === activeId;
							const isHover = h.id === hoveredId;
							const indent = (h.level - minLevel) * 18;
							let color = 'var(--mde-text-secondary, #555)';
							if (isHover) color = 'var(--mde-accent, #2563eb)';
							else if (isActive) color = 'var(--mde-text-primary, #111)';
							return (
								<button
									key={h.id}
									type="button"
									onClick={() => handleClick(h.id)}
									onMouseEnter={() => setHoveredId(h.id)}
									onMouseLeave={() => setHoveredId(null)}
									style={{
										display: 'block',
										width: '100%',
										background: isActive
											? 'var(--mde-bg-secondary, #f3f3f3)'
											: 'none',
										border: 'none',
										borderRadius: 6,
										cursor: 'pointer',
										textAlign: 'left',
										padding: '6px 10px',
										paddingLeft: 10 + indent,
										fontSize: 14,
										lineHeight: 1.4,
										color,
										fontFamily: 'inherit',
										fontWeight: isActive ? 500 : 400,
										whiteSpace: 'nowrap',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										transition: 'color 120ms ease, background 120ms ease',
									}}
								>
									{h.text}
								</button>
							);
						})}
					</div>

					{/* Level filter — bottom-right of the card */}
					<div style={{ position: 'absolute', bottom: 6, right: 8 }}>
						<button
							type="button"
							aria-label={t('block.toc.levels.menu')}
							onClick={() => setFilterOpen(v => !v)}
							style={{
								background: 'none',
								border: 'none',
								cursor: 'pointer',
								padding: 4,
								borderRadius: 4,
								color: 'var(--mde-text-muted, #999)',
								display: 'inline-flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<MoreHorizontal size={14} />
						</button>
						{filterOpen && (
							<div
								role="menu"
								style={{
									position: 'absolute',
									bottom: '100%',
									right: 0,
									marginBottom: 4,
									background: 'var(--mde-bg-primary, #fff)',
									border: '1px solid var(--mde-border-primary, #e5e5e5)',
									borderRadius: 6,
									boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
									padding: 4,
									minWidth: 140,
								}}
							>
								{TOC_LEVELS.map(lvl => {
									const labelKey = LEVEL_LABEL_KEYS[lvl];
									return (
										<button
											key={lvl}
											type="button"
											role="menuitemradio"
											aria-checked={maxLevel === lvl}
											onClick={() => setLevel(lvl)}
											style={{
												display: 'block',
												width: '100%',
												textAlign: 'left',
												background:
													maxLevel === lvl
														? 'var(--mde-bg-secondary, #f5f5f5)'
														: 'none',
												border: 'none',
												padding: '6px 10px',
												borderRadius: 4,
												cursor: 'pointer',
												fontSize: 13,
												color: 'var(--mde-text-primary, #333)',
												fontFamily: 'inherit',
											}}
										>
											{t(labelKey)}
										</button>
									);
								})}
							</div>
						)}
					</div>
				</div>
			) : (
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-end',
						gap: 10,
						padding: '6px 2px',
					}}
				>
					{headings.map(h => {
						const isActive = h.id === activeId;
						const baseWidth = Math.max(6, 16 - (h.level - minLevel) * 3);
						const width = isActive ? baseWidth + 4 : baseWidth;
						const color = isActive
							? 'var(--mde-text-secondary, #777)'
							: 'var(--mde-border-primary, #d4d4d4)';
						return (
							<button
								key={h.id}
								type="button"
								aria-label={h.text}
								onClick={() => handleClick(h.id)}
								style={{
									background: 'none',
									border: 'none',
									cursor: 'pointer',
									padding: 0,
									margin: 0,
									display: 'block',
									width,
									height: 2,
									borderRadius: 2,
									backgroundColor: color,
									transition: 'width 160ms ease, background-color 160ms ease',
								}}
							/>
						);
					})}
				</div>
			)}
		</nav>
	);

	return createPortal(rail, document.body);
}

function CustomComponentBlock({ block }: { block: Block }) {
	const componentName = (block.props.componentName ?? '') as string;
	const def = getRegisteredComponent(componentName);

	if (!def) {
		return (
			<div
				style={{
					margin: '8px 0',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					borderRadius: 8,
					border: '1px dashed var(--mde-border-secondary, #d4d4d4)',
					padding: 24,
					color: 'var(--mde-text-muted, #999)',
					fontSize: 13,
				}}
				contentEditable={false}
			>
				Custom component:{' '}
				<strong style={{ marginLeft: 4 }}>{componentName || 'unnamed'}</strong>&nbsp;(not
				registered)
			</div>
		);
	}

	const Comp = def.component;

	return (
		<div style={{ margin: '8px 0' }} contentEditable={false}>
			<Comp props={block.props} readOnly={false} />
		</div>
	);
}
