// ============================================================
// BlockEditor — the main editor component.
// Wires together: document model, input handling, selection,
// history (undo/redo), block rendering, auto-save hooks,
// slash command menu, floating toolbar, and drag handles.
// ============================================================

import React, {
	forwardRef,
	useCallback,
	useEffect,
	useId,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {
	Block,
	BlockProps,
	BlockType,
	EditorDocument,
	Mark,
	MarkType,
	Selection as EditorSelection,
	TextSpan,
	Transaction,
} from './core/types';
import { createBlock, getPlainText, getTextLength, generateId, isInMention } from './core/types';
import {
	findBlock,
	findBlockLocation,
	getBlocksInOrder,
	getContainer,
	insertBlockAfter,
	normalizeDocument,
	updateBlock,
} from './core/document';
import { handleKeyDown, handleBeforeInput } from './core/input';
import { readSelection, writeSelection } from './core/selection';
import { handleCopy, handleCut, handlePaste } from './core/clipboard';
import { History, applyTransactionInverse, applyTransactionForward } from './core/history';
import { fingerprintTransaction } from './core/fingerprint';
import { HeadingRail } from './blocks/BlockRenderer';
import {
	EditorDocContext,
	EditorBlockEnvContext,
	EditorHostCallbacksContext,
	BlockSelectionContext,
	ImageUploadingContext,
	EMPTY_IMAGE_UPLOADING,
	type DropTarget,
	type EditorBlockEnvironment,
	type EditorHostCallbacks,
	type EditorFontOption,
} from './blocks/EditorDocContext';
import { BlockChildrenProvider, renderBlockList } from './blocks/EditorBlockTree';
import type { ApplyResult } from './core/operations';
import {
	setBlockTypeOp,
	moveBlockOp,
	indentBlocksOp,
	toggleMark as toggleMarkOp,
	setMark as setMarkOp,
	replaceContent,
	insertText as insertTextOp,
	deleteText as deleteTextOp,
	insertMention as insertMentionOp,
	deleteBlockOp,
	setColumnWidthsOp,
	setBlockPropsOp,
	setChildrenOp,
	sanitizeWidths,
	addAdjacentColumnOp,
} from './core/operations';
import {
	topLevelBlockIdsInRange,
	deleteBlocksOp,
	turnBlocksIntoOp,
	duplicateBlocksOp,
	moveBlocksOp,
	insertBlocksAfterOp,
	replaceBlocksOp,
	cloneBlockWithFreshIds,
} from './core/block-selection';
import { SlashCommandMenu } from './features/slash-command';
import { EmojiPicker } from './features/emoji-picker';
import { MentionPicker } from './features/mention-picker';
import type { MentionItem, MentionProvider } from './features/mention-types';
import { MentionResolverProvider, type MentionResolver } from './blocks/MentionResolverContext';
import { FloatingToolbar, isToolbarLinkInputActive } from './features/toolbar';
import { CustomColorsProvider, type CustomColorsConfig } from './features/custom-colors';
import { EditorI18nProvider, useT } from './i18n/context';
import { makeStaticT, type EditorTFunction, type EditorTranslations } from './i18n/keys';
import { blocksToMarkdown } from './markdown/serialize';
import { FindReplaceBar } from './features/find-replace';
import { BlockMenu } from './features/block-menu';
import { useIsCoarsePointer } from './hooks/use-is-coarse-pointer';
import { GripVertical, Plus } from 'lucide-react';

// ---- Public API Types ----

export interface BlockEditorProps {
	/** Initial content as a document object */
	initialDocument?: EditorDocument;
	/** Called on every document change */
	onChange?: (doc: EditorDocument) => void;
	/** Called after idleDebounceMs of no changes */
	onIdle?: (doc: EditorDocument) => void;
	/** Called when the editor loses focus */
	onBlur?: (doc: EditorDocument) => void;
	/**
	 * Undo/redo journal hooks. `onCommit` fires once per sealed transaction (one
	 * undo-step, not one keystroke). `onUndo`/`onRedo` fire when a local step is
	 * taken. `onUndoMiss`/`onRedoMiss` fire when the local stack is empty.
	 */
	onCommit?: (tx: Transaction, fingerprint: string) => void;
	onUndo?: (tx: Transaction) => void;
	onRedo?: (tx: Transaction) => void;
	onUndoMiss?: () => void;
	onRedoMiss?: () => void;
	/** Idle debounce in ms (default: 60000 = 1 minute) */
	idleDebounceMs?: number;
	/** Placeholder shown when empty */
	placeholder?: string;
	/** Read-only mode */
	readOnly?: boolean;
	/** Hide the floating right-side heading rail. Defaults to false. */
	hideHeadingRail?: boolean;
	/**
	 * Render for paper (print / PDF export) instead of the screen. Implies
	 * `readOnly`, and makes blocks that conditionally unmount content render all
	 * of it: collapsed toggles open, every tab shown stacked.
	 */
	printMode?: boolean;
	/** Debug mode — shows event log and live markdown output below the editor */
	debugMode?: boolean;
	/** CSS class for the outer container */
	className?: string;
	/**
	 * Block types offered by the slash menu, the "Turn into" menu and the add
	 * buttons. When omitted every supported type is offered. Markdown that
	 * already contains other types still renders them.
	 */
	allowedBlockTypes?: readonly BlockType[];
	/**
	 * Offer only edits that survive a markdown round trip: hides the list
	 * marker style submenu (bullet shapes, marker colours) and "Split into
	 * columns" unless columns are allowed. For hosts that store markdown.
	 */
	markdownSafe?: boolean;
	/**
	 * Called when a user selects an image file for upload.
	 * Should return a Promise resolving to the URL where the image was uploaded.
	 * If not provided, the image is embedded as a base64 data URL.
	 */
	onImageUpload?: (file: File) => Promise<string>;
	/**
	 * Called when the user clicks "Upload" on an image block.
	 * Should return a Promise resolving to the image URL.
	 * If not provided, the default native file input is used.
	 */
	onImageBrowse?: () => Promise<string>;
	/** Fonts offered in the editor's font pickers. */
	fonts?: EditorFontOption[];
	/** Default font family for the whole document. */
	defaultFontFamily?: string;
	/** Optional user-defined swatches for the color pickers. */
	customColors?: CustomColorsConfig;
	/** Translation function. Takes priority over `translations`. */
	t?: EditorTFunction;
	/** Static map of translation overrides. Ignored when `t` is provided. */
	translations?: Partial<EditorTranslations>;
	/**
	 * Pluggable @-mention sources. Typing "@" inside any text block opens a
	 * picker that merges results from every provider. When omitted, "@" is
	 * treated as a literal character.
	 */
	mentionProviders?: readonly MentionProvider[];
	/** Resolver mention pills use to render the current label for a mention. */
	onResolveMention?: MentionResolver;
	/** Scope passed to mention providers' search/resolve calls. */
	workspaceId?: string;
}

export interface BlockEditorRef {
	/**
	 * Focus the editor. With no argument, places the caret at the start of
	 * the first block. Pass a selection to restore the caret at a specific
	 * (blockId, offset) — used by hosts that need to preserve cursor across
	 * remounts (e.g. NewPage → PageView after first save).
	 */
	focus: (selection?: EditorSelection) => void;
	/** Current editor selection, or null when the editor is unfocused. */
	getSelection: () => EditorSelection | null;
	getDocument: () => EditorDocument;
	setDocument: (doc: EditorDocument) => void;
	insertBlock: (type: BlockType, afterBlockId?: string) => void;
	/**
	 * Apply a server-journal command when the local stack is empty (post-reload).
	 * `applyExternalUndo` applies the transaction's inverse; `applyExternalRedo`
	 * re-applies its forward ops. Both write the doc and fire onChange so the
	 * host's normal save path persists the result.
	 */
	applyExternalUndo: (tx: Transaction) => void;
	applyExternalRedo: (tx: Transaction) => void;
}

// ---- Slash Command State ----

interface SlashCommandState {
	active: boolean;
	blockId: string;
	filter: string;
	position: { x: number; y: number };
}

// ---- Emoji Picker State ----

interface EmojiPickerState {
	active: boolean;
	blockId: string;
	filter: string;
	position: { x: number; y: number };
}

// ---- Mention Picker State ----

interface MentionPickerState {
	active: boolean;
	blockId: string;
	/** Text after "@" up to the cursor — drives provider search. */
	filter: string;
	/** Document offset of the "@" character that opened the picker. */
	triggerOffset: number;
	position: { x: number; y: number };
	/** Restrict to a subset of mention kinds. When non-empty only providers
	 *  whose `kind` is in this list contribute results. Set by the page-link
	 *  slash entry (which opens the picker with `["page"]`); unset for normal
	 *  `@`-typing. */
	kinds?: string[];
}

/**
 * Bridge mention state — owned by *external* cells (list items, table
 * cells) that aren't part of the editor's main TextSpan model. They drive
 * the picker via `mde-mention-trigger` / `mde-mention-close` window
 * events; the editor dispatches `mde-mention-fill` back to them on
 * selection. Lets us share one MentionPicker UI across surfaces.
 */
interface BridgeMentionState {
	active: boolean;
	source: string;
	filter: string;
	position: { x: number; y: number };
}

// ---- Floating Toolbar State ----

interface ToolbarState {
	active: boolean;
	position: { x: number; y: number };
	activeMarks: MarkType[];
}

// ---- Drag State ----

interface DragState {
	draggingBlockId: string | null;
	dropTarget: DropTarget | null;
}

// ---- Helpers ----

/** Get marks active at a given offset within a block */
function getActiveMarksAtPosition(
	doc: EditorDocument,
	blockId: string,
	offset: number,
): MarkType[] {
	const block = findBlock(doc, blockId);
	if (!block) return [];
	let pos = 0;
	for (const span of block.content) {
		const end = pos + span.text.length;
		if (offset > pos && offset <= end) {
			return (span.marks ?? []).map(m => m.type);
		}
		pos = end;
	}
	return [];
}

/** Get the bounding rect of the caret (collapsed selection) */
function getCaretRect(): DOMRect | null {
	const sel = window.getSelection();
	if (!sel || sel.rangeCount === 0) return null;
	const range = sel.getRangeAt(0);
	const rect = range.getBoundingClientRect();
	// For collapsed selections, getBoundingClientRect returns empty
	if (rect.width === 0 && rect.height === 0) {
		// Insert a temporary span to measure
		const span = document.createElement('span');
		span.textContent = '\u200b';
		range.insertNode(span);
		const spanRect = span.getBoundingClientRect();
		span.remove();
		// Restore selection
		sel.removeAllRanges();
		sel.addRange(range);
		return spanRect;
	}
	return rect;
}

// ---- Drag Handle & Add Button Icons (Lucide) ----

/** Compute the drop-target index for a given clientY using the same midpoint
 *  algorithm as the HTML5 drag path, so pointer drag and mouse drag behave
 *  identically. (Top-level only — used by the touch-drag fallback.) */
function computeDropTargetIndex(editor: HTMLElement, totalBlocks: number, clientY: number): number {
	const blockEls = editor.querySelectorAll(':scope > [data-block-id], :scope [data-block-id]');
	// For touch fallback we only care about top-level blocks; pick the first
	// [data-block-id] that's a direct child of `.mde-editor`.
	const topLevel = Array.from(blockEls).filter(
		el => (el as HTMLElement).parentElement === editor,
	);
	let targetIdx = totalBlocks - 1;
	for (let i = 0; i < topLevel.length; i++) {
		const rect = topLevel[i]!.getBoundingClientRect();
		if (clientY < rect.top + rect.height / 2) {
			targetIdx = i;
			break;
		}
	}
	return targetIdx;
}

/** Find the deepest [data-block-id] under the cursor that's a valid drop
 *  target — excludes the dragging block and its descendants. Drop edges are
 *  always above/below; side-edge column wrapping is intentionally disabled
 *  so users can't accidentally create new columns by drag-reordering. */
function computeDropTarget(
	editorEl: HTMLElement,
	clientX: number,
	clientY: number,
	draggingBlockId: string,
): DropTarget | null {
	const draggingEl = editorEl.querySelector<HTMLElement>(
		`[data-block-id="${cssEscape(draggingBlockId)}"]`,
	);
	const candidates = Array.from(editorEl.querySelectorAll<HTMLElement>('[data-block-id]'));
	let best: { el: HTMLElement; depth: number } | null = null;
	for (const el of candidates) {
		const id = el.dataset.blockId;
		if (!id || id === draggingBlockId) continue;
		if (draggingEl && draggingEl.contains(el)) continue;
		const rect = el.getBoundingClientRect();
		if (
			clientX < rect.left ||
			clientX > rect.right ||
			clientY < rect.top ||
			clientY > rect.bottom
		)
			continue;
		let depth = 0;
		let p: HTMLElement | null = el.parentElement;
		while (p && p !== editorEl) {
			if (p.dataset && p.dataset.blockId) depth++;
			p = p.parentElement;
		}
		if (!best || depth > best.depth) best = { el, depth };
	}
	if (!best) return null;
	const rect = best.el.getBoundingClientRect();
	const yFrac = rect.height > 0 ? (clientY - rect.top) / rect.height : 0.5;
	const blockId = best.el.dataset.blockId!;
	return { blockId, edge: yFrac < 0.5 ? 'above' : 'below' };
}

/** Build a 2-column container with the given paragraphs as its starting
 *  children. Used by slash command and "Split into columns". */
function makeColumnsBlock(left: Block, right: Block): Block {
	return {
		id: generateId(),
		type: 'columns',
		content: [],
		children: [
			{ id: generateId(), type: 'column', content: [], children: [left], props: {} },
			{ id: generateId(), type: 'column', content: [], children: [right], props: {} },
		],
		props: { widths: [0.5, 0.5] },
	};
}

/** Build a `tabs` container with `count` default tabs ("Tab 1", "Tab 2", …),
 *  each holding one empty paragraph so the user can type immediately. */
function makeTabsBlock(count: number): Block {
	const n = Math.max(1, count);
	const children: Block[] = Array.from({ length: n }, (_, i) => ({
		id: generateId(),
		type: 'tab',
		content: [{ text: `Tab ${i + 1}` }],
		children: [createBlock('paragraph')],
		props: {},
	}));
	return {
		id: generateId(),
		type: 'tabs',
		content: [],
		children,
		props: { tabTheme: 'pill', activeTab: 0 },
	};
}

function cssEscape(value: string): string {
	// Modern browsers expose CSS.escape; fall back to a conservative quoter.
	const g = globalThis as { CSS?: { escape?: (s: string) => string } };
	if (g.CSS?.escape) return g.CSS.escape(value);
	return value.replaceAll(/["'\\\n\r\t]/g, '\\$&');
}

/** Translate a (dragging block, drop target) pair into an ApplyResult. Only
 *  above/below edges are produced now — side-edge wrapping into columns is
 *  intentionally disabled (users create columns via the gutter buttons or
 *  the block-menu split action). */
function resolveDropAction(
	doc: EditorDocument,
	draggingBlockId: string,
	target: DropTarget,
): ApplyResult | null {
	if (target.blockId === draggingBlockId) return null;
	const targetLoc = findBlockLocation(doc, target.blockId);
	const targetBlock = findBlock(doc, target.blockId);
	if (!targetLoc || !targetBlock) return null;

	const parentId = targetLoc.parentId;
	const targetIndex = target.edge === 'above' ? targetLoc.index : targetLoc.index + 1;
	return moveBlockOp(doc, draggingBlockId, { parentId, index: targetIndex });
}

// Module-level clipboard for the block-menu's Copy/Cut/Paste actions.
// Holds a deep snapshot of the last copied/cut block subtree(s) (with their
// original IDs — we re-id on paste). One entry for a single-block copy, many
// for a whole-block multi-selection copy. Survives across editors within the
// same tab/session; doesn't roundtrip through the system clipboard (we
// couldn't reliably stash a full block tree there cross-browser).
let blockMenuClipboard: Block[] | null = null;

// The plain-text (markdown) mirror we last wrote to the system clipboard
// alongside `blockMenuClipboard`. On paste we compare the live system
// clipboard text against this: if they match, the user is pasting OUR block
// copy and we reinsert the full-fidelity in-memory blocks; if they differ, an
// external copy replaced the clipboard, so we fall through to normal paste.
let blockMenuClipboardText: string | null = null;

/** Snapshot `blocks` into the in-memory block clipboard and remember the
 *  markdown mirror handed to the system clipboard. Returns that text so a
 *  ClipboardEvent caller can also `setData` it synchronously. */
function copyBlocksToClipboard(blocks: Block[]): string {
	blockMenuClipboard = blocks.map(cloneBlockWithFreshIds);
	const text = blocksToMarkdown(blocks).replace(/\r\n/g, '\n');
	blockMenuClipboardText = text;
	return text;
}

/** The top-level block that owns `blockId` (itself when already top-level),
 *  or null if not found. Walks up the tree so a selection endpoint inside a
 *  nested item (list child, column cell) resolves to its owning top-level
 *  block. */
function topLevelAncestorId(doc: EditorDocument, blockId: string): string | null {
	let cur = blockId;
	for (let guard = 0; guard < 1000; guard++) {
		const loc = findBlockLocation(doc, cur);
		if (!loc) return null;
		if (loc.parentId === null) return cur;
		cur = loc.parentId;
	}
	return null;
}

/** When a native text selection spans more than one top-level block, the
 *  ordered top-level blocks it covers (each with its nested children);
 *  otherwise null. A within-one-block selection returns null so it stays a
 *  text-range copy — inline formatting (bold, links) still round-trips. */
function multiBlockTextSpan(
	doc: EditorDocument,
	anchorBlockId: string,
	focusBlockId: string,
): Block[] | null {
	const startTop = topLevelAncestorId(doc, anchorBlockId);
	const endTop = topLevelAncestorId(doc, focusBlockId);
	if (!startTop || !endTop || startTop === endTop) return null;
	const ids = topLevelBlockIdsInRange(doc, startTop, endTop);
	if (ids.length < 2) return null;
	const idSet = new Set(ids);
	return doc.blocks.filter(b => idSet.has(b.id));
}

/** Blocks a block-menu action should act on. When `clickedId` is part of an
 *  active multi-block selection, returns every selected top-level block in
 *  document order; otherwise the single clicked block (resolved recursively so
 *  nested blocks still work). */
function blockMenuSources(doc: EditorDocument, selectedIds: string[], clickedId: string): Block[] {
	if (selectedIds.length > 1 && selectedIds.includes(clickedId)) {
		const idSet = new Set(selectedIds);
		return doc.blocks.filter(b => idSet.has(b.id));
	}
	const block = findBlock(doc, clickedId);
	return block ? [block] : [];
}

/** Walk up from a block to find the enclosing column + its columns container.
 *  Returns null when the block isn't inside a columns row. */
function findColumnAncestor(
	doc: EditorDocument,
	blockId: string,
): { columnId: string; columnIndex: number; columnsBlockId: string } | null {
	// Walk up the parent chain. A "column" block is always a direct child of a
	// "columns" container.
	let currentId: string | null = blockId;
	while (currentId) {
		const current: Block | undefined = findBlock(doc, currentId);
		if (!current) return null;
		if (current.type === 'column') {
			const loc = findBlockLocation(doc, current.id);
			if (!loc?.parentId) return null;
			const parent = findBlock(doc, loc.parentId);
			if (parent?.type !== 'columns') return null;
			return {
				columnId: current.id,
				columnIndex: loc.index,
				columnsBlockId: parent.id,
			};
		}
		const loc = findBlockLocation(doc, current.id);
		currentId = loc?.parentId ?? null;
	}
	return null;
}

/** Pick the deepest [data-block-id] whose rect contains (X, Y). Returns null
 *  when the cursor isn't directly over any block (e.g. it's in a gutter). */
function pickDeepHoverBlock(
	editor: HTMLElement,
	clientX: number,
	clientY: number,
): HTMLElement | null {
	const blockEls = editor.querySelectorAll<HTMLElement>('[data-block-id]');
	let best: { el: HTMLElement; depth: number } | null = null;
	for (const el of blockEls) {
		const rect = el.getBoundingClientRect();
		if (clientY < rect.top || clientY > rect.bottom) continue;
		if (clientX < rect.left || clientX > rect.right) continue;
		let depth = 0;
		let p: HTMLElement | null = el.parentElement;
		while (p && p !== editor) {
			if (p.dataset?.blockId) depth++;
			p = p.parentElement;
		}
		if (!best || depth > best.depth) best = { el, depth };
	}
	return best?.el ?? null;
}

/** Walk up from `node` to the TOP-LEVEL block element — the `[data-block-id]`
 *  whose parent is the editor root itself. Returns its block id, or null when
 *  `node` isn't inside a top-level block (e.g. it's nested in a column, or
 *  outside the editor). Used by whole-block selection, which only tracks
 *  top-level blocks. */
function topLevelBlockIdFromNode(root: HTMLElement, node: Node | null): string | null {
	let el: HTMLElement | null = node instanceof HTMLElement ? node : (node?.parentElement ?? null);
	while (el && el !== root) {
		if (el.parentElement === root && el.hasAttribute('data-block-id')) {
			return el.getAttribute('data-block-id');
		}
		el = el.parentElement;
	}
	return null;
}

/** First [data-block-id] whose Y range contains the cursor. Document order
 *  picks the outermost block — used for the left gutter where the cursor
 *  is between blocks horizontally. */
function pickYOnlyHoverBlock(editor: HTMLElement, clientY: number): HTMLElement | null {
	const blockEls = editor.querySelectorAll<HTMLElement>('[data-block-id]');
	for (const el of blockEls) {
		const rect = el.getBoundingClientRect();
		if (clientY >= rect.top && clientY <= rect.bottom) return el;
	}
	return null;
}

// ---- Drag Handle (single handle that tracks hovered/active block) ----

function DragHandle({
	editorRef,
	onDragStart,
	onAddBlock,
	onAddBlockSlash,
	onOpenMenu,
	onPointerDragMove,
	onPointerDragEnd,
	isCoarse,
	selectionBlockId,
}: Readonly<{
	editorRef: React.RefObject<HTMLDivElement | null>;
	onDragStart: (e: React.DragEvent, id: string) => void;
	onAddBlock: (afterBlockId: string) => void;
	onAddBlockSlash: (afterBlockId: string) => void;
	onOpenMenu: (blockId: string, position: { x: number; y: number }) => void;
	onPointerDragMove: (blockId: string, clientY: number) => void;
	onPointerDragEnd: (blockId: string, clientY: number, committed: boolean) => void;
	isCoarse: boolean;
	selectionBlockId: string | null;
}>) {
	const t = useT();
	// Active block: the one the handle is anchored to. Driven by hover on
	// fine pointer, by selection on coarse pointer.
	const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
	const [pos, setPos] = useState<{ left: number; top: number }>({ left: -56, top: 0 });
	const [visible, setVisible] = useState(false);
	// Suppressed while a column gutter's toolbar is open — the handle and
	// toolbar otherwise sit shoulder-to-shoulder and compete visually.
	const [suppressed, setSuppressed] = useState(false);
	const handleRef = useRef<HTMLDivElement>(null);
	const isOverHandle = useRef(false);
	const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	useEffect(() => {
		const handler = (e: Event) => {
			setSuppressed(!!(e as CustomEvent<{ open: boolean }>).detail?.open);
		};
		globalThis.addEventListener('mde-column-toolbar', handler);
		return () => globalThis.removeEventListener('mde-column-toolbar', handler);
	}, []);

	// ---- Fine pointer: hover-based handle ----
	useEffect(() => {
		if (isCoarse) return;
		const editor = editorRef.current;
		if (!editor) return;
		const container = editor.parentElement;
		if (!container) return;

		const onMouseMove = (e: MouseEvent) => {
			clearTimeout(hideTimer.current);

			if (handleRef.current?.contains(e.target as Node)) return;

			const containerRect = container.getBoundingClientRect();
			const anchor = (target: HTMLElement) => {
				const rect = target.getBoundingClientRect();
				const newTop = rect.top - containerRect.top + 7;
				// For nested blocks (inside a column cell) anchor X to the cell's
				// left edge so the handle sits next to its block. Top-level blocks
				// keep the editor's outer left gutter.
				const cell = target.closest<HTMLElement>('[data-column-cell]');
				const newLeft = cell
					? cell.getBoundingClientRect().left - containerRect.left - 50
					: -56;
				setActiveBlockId(target.dataset.blockId!);
				setPos({ left: newLeft, top: newTop });
				setVisible(true);
			};

			// Sticky corridor (checked BEFORE pickDeep so a sibling column's
			// block doesn't steal focus while the user navigates to the handle).
			// When the active block's handle is visible and the cursor sits
			// between the handle and the active block (within the block's Y
			// range) we keep the active block — this is the path the cursor
			// travels when reaching for the handle from inside a non-leftmost
			// column. Without this, hovering across the gutter would land on
			// col 0's block and the handle would jump away from the user.
			if (activeBlockId) {
				const activeEl = editor.querySelector<HTMLElement>(
					`[data-block-id="${cssEscape(activeBlockId)}"]`,
				);
				if (activeEl) {
					const aRect = activeEl.getBoundingClientRect();
					const cell = activeEl.closest<HTMLElement>('[data-column-cell]');
					const handleLeftScreen = cell
						? cell.getBoundingClientRect().left - 50
						: containerRect.left - 56;
					const yIn = e.clientY >= aRect.top && e.clientY <= aRect.bottom;
					const xIn = e.clientX >= handleLeftScreen && e.clientX <= aRect.left;
					if (yIn && xIn) {
						anchor(activeEl);
						return;
					}
				}
			}

			// Prefer the deepest block whose rect contains the cursor (X+Y).
			// Without this, nested blocks inside a column are unreachable because
			// the outer columns wrapper's Y range envelops every inner block.
			const deep = pickDeepHoverBlock(editor, e.clientX, e.clientY);
			if (deep) {
				anchor(deep);
				return;
			}

			// No direct match and not in the corridor — fall back to the first
			// Y-matching block so the columns container is still reachable via
			// its padding strip above/below the row.
			const yMatch = pickYOnlyHoverBlock(editor, e.clientY);
			if (yMatch) {
				anchor(yMatch);
				return;
			}
			// Mouse is between blocks or outside — keep handle at last position but start fade
			if (!isOverHandle.current) {
				hideTimer.current = setTimeout(() => {
					if (!isOverHandle.current) setVisible(false);
				}, 200);
			}
		};

		const onMouseLeave = (e: MouseEvent) => {
			if (handleRef.current?.contains(e.relatedTarget as Node)) return;
			if (isOverHandle.current) return;
			hideTimer.current = setTimeout(() => {
				if (!isOverHandle.current) setVisible(false);
			}, 200);
		};

		// Hide handle when the active block is removed from the DOM
		const observer = new MutationObserver(() => {
			if (activeBlockId && !editor.querySelector(`[data-block-id="${activeBlockId}"]`)) {
				setActiveBlockId(null);
				setVisible(false);
			}
		});
		observer.observe(editor, { childList: true, subtree: true });

		document.addEventListener('mousemove', onMouseMove);
		container.addEventListener('mouseleave', onMouseLeave);
		return () => {
			document.removeEventListener('mousemove', onMouseMove);
			container.removeEventListener('mouseleave', onMouseLeave);
			observer.disconnect();
			clearTimeout(hideTimer.current);
		};
	}, [editorRef, activeBlockId, isCoarse]);

	// ---- Coarse pointer: anchor handle to the focused block, top-right ----
	useEffect(() => {
		if (!isCoarse) return;
		const editor = editorRef.current;
		if (!editor) return;
		const container = editor.parentElement;
		if (!container) return;

		if (!selectionBlockId) {
			setVisible(false);
			setActiveBlockId(null);
			return;
		}

		// Touch handle is wider (36px buttons), so account for that when computing
		// the right-edge offset.
		const HANDLE_W = 36 + 4 + 36;

		const updatePosition = () => {
			const blockEl = editor.querySelector(
				`[data-block-id="${selectionBlockId}"]`,
			) as HTMLElement | null;
			if (!blockEl) {
				setVisible(false);
				return;
			}
			const blockRect = blockEl.getBoundingClientRect();
			const editorRect = editor.getBoundingClientRect();
			const containerRect = container.getBoundingClientRect();
			const left = editorRect.right - containerRect.left - HANDLE_W - 4;
			const top = blockRect.top - containerRect.top + 2;
			setActiveBlockId(selectionBlockId);
			setPos({ left, top });
			setVisible(true);
		};

		updatePosition();

		const onResize = () => updatePosition();
		window.addEventListener('resize', onResize);
		window.addEventListener('scroll', onResize, true);
		const observer = new MutationObserver(() => {
			if (!editor.querySelector(`[data-block-id="${selectionBlockId}"]`)) {
				setVisible(false);
				return;
			}
			updatePosition();
		});
		observer.observe(editor, { childList: true, subtree: true, characterData: true });

		return () => {
			window.removeEventListener('resize', onResize);
			window.removeEventListener('scroll', onResize, true);
			observer.disconnect();
		};
	}, [isCoarse, selectionBlockId, editorRef]);

	// ---- Pointer-based drag (used in coarse mode) ----
	const dragRef = useRef<{
		startX: number;
		startY: number;
		blockId: string | null;
		isDragging: boolean;
		pointerId: number | null;
	}>({ startX: 0, startY: 0, blockId: null, isDragging: false, pointerId: null });

	const onGripPointerDown = useCallback(
		(e: React.PointerEvent) => {
			if (!isCoarse) return; // mouse path uses HTML5 drag
			if (!activeBlockId) return;
			// Suppress the compatibility mouse events for this touch. Without
			// this, the synthetic mousedown that follows the tap fires inside
			// the freshly-opened block menu when the menu's clamp logic flips
			// it above the grip (its bottom edge then overlaps the grip), and
			// triggers whichever item sits at the touch coordinate — typically
			// Delete. Menu items use onMouseDown for activation, so leaking
			// synthetic mousedowns from outside taps would activate them.
			e.preventDefault();
			dragRef.current = {
				startX: e.clientX,
				startY: e.clientY,
				blockId: activeBlockId,
				isDragging: false,
				pointerId: e.pointerId,
			};
			try {
				(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
			} catch {
				// Some browsers throw if the pointer is no longer active. Ignore —
				// we'll just treat the gesture as a tap.
			}
		},
		[isCoarse, activeBlockId],
	);

	const onGripPointerMove = useCallback(
		(e: React.PointerEvent) => {
			if (!isCoarse) return;
			const drag = dragRef.current;
			if (drag.pointerId !== e.pointerId || !drag.blockId) return;
			const dx = e.clientX - drag.startX;
			const dy = e.clientY - drag.startY;
			if (!drag.isDragging) {
				// 8px movement threshold separates a tap (= open menu) from a drag.
				if (Math.hypot(dx, dy) > 8) {
					drag.isDragging = true;
					onPointerDragMove(drag.blockId, e.clientY);
				}
				return;
			}
			e.preventDefault();
			onPointerDragMove(drag.blockId, e.clientY);
		},
		[isCoarse, onPointerDragMove],
	);

	const onGripPointerUp = useCallback(
		(e: React.PointerEvent) => {
			if (!isCoarse) return;
			const drag = dragRef.current;
			if (drag.pointerId !== e.pointerId) return;
			const wasDragging = drag.isDragging;
			const blockId = drag.blockId;
			const clientY = e.clientY;
			try {
				(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
			} catch {
				// Pointer already released — fine.
			}
			dragRef.current = {
				startX: 0,
				startY: 0,
				blockId: null,
				isDragging: false,
				pointerId: null,
			};
			if (wasDragging && blockId) {
				onPointerDragEnd(blockId, clientY, true);
			} else if (blockId) {
				onPointerDragEnd(blockId, clientY, false);
				const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
				onOpenMenu(blockId, { x: rect.left, y: rect.bottom });
			}
		},
		[isCoarse, onOpenMenu, onPointerDragEnd],
	);

	const btnSize = isCoarse ? 36 : 22;
	const iconSize = isCoarse ? 18 : 14;

	const btnStyle: React.CSSProperties = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: btnSize,
		height: btnSize,
		borderRadius: 6,
		border: 'none',
		background: isCoarse ? 'var(--mde-bg-secondary, rgba(0,0,0,0.04))' : 'none',
		color: 'var(--mde-text-muted, #999)',
		cursor: 'pointer',
		padding: 0,
		transition: 'background-color 100ms, color 100ms',
	};

	return (
		<div
			ref={handleRef}
			data-block-handle-root="true"
			data-coarse={isCoarse ? 'true' : undefined}
			onMouseEnter={() => {
				if (isCoarse) return;
				isOverHandle.current = true;
				clearTimeout(hideTimer.current);
			}}
			onMouseLeave={() => {
				if (isCoarse) return;
				isOverHandle.current = false;
				hideTimer.current = setTimeout(() => setVisible(false), 200);
			}}
			style={{
				position: 'absolute',
				left: pos.left,
				top: pos.top,
				display: 'flex',
				alignItems: 'center',
				gap: isCoarse ? 4 : 2,
				zIndex: 10,
				opacity: visible && !suppressed ? 1 : 0,
				transition: 'top 500ms ease-out, opacity 500ms ease',
				pointerEvents: visible && !suppressed ? 'auto' : 'none',
			}}
		>
			{/* Plus button — coarse: open slash palette; fine: insert empty block. */}
			<button
				type="button"
				style={btnStyle}
				title={isCoarse ? t('editor.addBlock.coarse') : t('editor.addBlock.fine')}
				aria-label={isCoarse ? t('editor.addBlock.coarse') : t('editor.addBlock.fine')}
				data-block-handle="add"
				onMouseDown={e => e.preventDefault()}
				onClick={() => {
					if (!activeBlockId) return;
					if (isCoarse) onAddBlockSlash(activeBlockId);
					else onAddBlock(activeBlockId);
				}}
				onMouseEnter={e => {
					e.currentTarget.style.backgroundColor = 'var(--mde-bg-hover, #f0f0f0)';
					e.currentTarget.style.color = 'var(--mde-text-primary, #1a1a1a)';
				}}
				onMouseLeave={e => {
					e.currentTarget.style.backgroundColor = isCoarse
						? 'var(--mde-bg-secondary, rgba(0,0,0,0.04))'
						: 'transparent';
					e.currentTarget.style.color = 'var(--mde-text-muted, #999)';
				}}
			>
				<Plus size={iconSize} />
			</button>

			{/* Grip handle — drag to reorder, click/tap to open menu */}
			<div
				draggable={!isCoarse}
				data-block-handle="grip"
				onDragStart={
					isCoarse
						? undefined
						: e => {
								if (!activeBlockId) return;
								const editor = editorRef.current;
								if (editor) {
									const blockEl = editor.querySelector(
										`[data-block-id="${activeBlockId}"]`,
									);
									if (blockEl) {
										const rect = blockEl.getBoundingClientRect();
										e.dataTransfer.setDragImage(
											blockEl,
											e.clientX - rect.left,
											e.clientY - rect.top,
										);
									}
								}
								onDragStart(e, activeBlockId);
							}
				}
				onClick={
					isCoarse
						? undefined // coarse path opens menu via pointerup
						: e => {
								if (activeBlockId) {
									onOpenMenu(activeBlockId, { x: e.clientX, y: e.clientY });
								}
							}
				}
				onPointerDown={onGripPointerDown}
				onPointerMove={onGripPointerMove}
				onPointerUp={onGripPointerUp}
				onPointerCancel={onGripPointerUp}
				style={{
					...btnStyle,
					cursor: 'grab',
					// Block native scroll/text-select while a touch drag is in flight.
					touchAction: isCoarse ? 'none' : 'auto',
				}}
				onMouseEnter={e => {
					e.currentTarget.style.backgroundColor = 'var(--mde-bg-hover, #f0f0f0)';
					e.currentTarget.style.color = 'var(--mde-text-primary, #1a1a1a)';
				}}
				onMouseLeave={e => {
					e.currentTarget.style.backgroundColor = isCoarse
						? 'var(--mde-bg-secondary, rgba(0,0,0,0.04))'
						: 'transparent';
					e.currentTarget.style.color = 'var(--mde-text-muted, #999)';
				}}
				aria-label={t(isCoarse ? 'editor.blockDrag.coarse' : 'editor.blockDrag')}
			>
				<GripVertical size={iconSize} />
			</div>
		</div>
	);
}

// ---- Component ----

// Which editor instance most recently held focus. Undo/redo is handled by a
// document-level capture listener (see below); when focus has been lost to
// <body> (e.g. after a block menu closes) this lets
// exactly one editor — the last-focused one — respond to Cmd+Z, so multiple
// mounted editors don't all undo at once.
let lastFocusedEditorId: string | null = null;

export const BlockEditor = forwardRef<BlockEditorRef, BlockEditorProps>(function BlockEditor(
	{
		initialDocument,
		onChange,
		onIdle,
		onBlur,
		onCommit,
		onUndo,
		onRedo,
		onUndoMiss,
		onRedoMiss,
		idleDebounceMs = 60_000,
		placeholder,
		readOnly: readOnlyProp = false,
		hideHeadingRail: hideHeadingRailProp = false,
		printMode = false,
		debugMode = false,
		className,
		onImageUpload,
		onImageBrowse,
		allowedBlockTypes,
		markdownSafe = false,
		fonts,
		defaultFontFamily,
		customColors,
		t,
		translations,
		mentionProviders,
		onResolveMention,
		workspaceId,
	},
	ref,
) {
	// ---- i18n ----
	const i18nT = useMemo<EditorTFunction>(() => t ?? makeStaticT(translations), [t, translations]);
	const resolvedPlaceholder = placeholder ?? i18nT('editor.defaultPlaceholder');

	// Printing is inherently a read-only render, and the heading rail portals
	// itself to <body> with position:fixed — on paper that would reprint on
	// every sheet — so `printMode` implies both.
	const readOnly = readOnlyProp || printMode;
	const hideHeadingRail = hideHeadingRailProp || printMode;

	// ---- State ----
	const rootRef = useRef<HTMLDivElement>(null);
	const isCoarse = useIsCoarsePointer();
	const [doc, setDoc] = useState<EditorDocument>(() => normalizeDocument(initialDocument));
	const [selection, setSelection] = useState<EditorSelection | null>(null);
	// Block the user most recently tapped/focused. Drives the coarse-pointer
	// DragHandle anchor so it follows taps on non-editable blocks (images,
	// tables) where text selection doesn't move.
	const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
	// Image block IDs whose host upload is in flight. Transient — never
	// persisted to the document. ImageBlock reads this via context to paint
	// a loading overlay over the local preview while the durable URL resolves.
	const [uploadingImageBlocks, setUploadingImageBlocks] =
		useState<ReadonlySet<string>>(EMPTY_IMAGE_UPLOADING);
	const historyRef = useRef(new History());
	const isComposing = useRef(false);
	const idleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const docRef = useRef(doc);
	docRef.current = doc;

	// Slash command state
	const [slashCommand, setSlashCommand] = useState<SlashCommandState>({
		active: false,
		blockId: '',
		filter: '',
		position: { x: 0, y: 0 },
	});

	// Emoji picker state
	const [emojiPicker, setEmojiPicker] = useState<EmojiPickerState>({
		active: false,
		blockId: '',
		filter: '',
		position: { x: 0, y: 0 },
	});

	// Mention picker state
	const [mentionPicker, setMentionPicker] = useState<MentionPickerState>({
		active: false,
		blockId: '',
		filter: '',
		triggerOffset: -1,
		position: { x: 0, y: 0 },
	});
	const closedMentionAtRef = useRef<{ blockId: string; offset: number } | null>(null);
	// Shared lock between the main mentionPicker and the bridge picker. While
	// the picker has a sub-prompt open (e.g. the calendar from "Pick a
	// date…"), upstream close paths must be ignored — the native date popup
	// is rendered outside the picker DOM and its mouse/focus events would
	// otherwise unmount the picker mid-interaction.
	const pickerPinnedRef = useRef(false);

	// Bridge state — external cells (lists, tables) drive this via events.
	const [bridgeMention, setBridgeMention] = useState<BridgeMentionState>({
		active: false,
		source: '',
		filter: '',
		position: { x: 0, y: 0 },
	});

	// Floating toolbar state
	// Bumped by Cmd+K so the toolbar opens its link field.
	const [linkRequest, setLinkRequest] = useState(0);
	const [toolbar, setToolbar] = useState<ToolbarState>({
		active: false,
		position: { x: 0, y: 0 },
		activeMarks: [],
	});

	// Drag state
	const [dragState, setDragState] = useState<DragState>({
		draggingBlockId: null,
		dropTarget: null,
	});

	// Ref to track selection for toolbar/slash command interactions
	const selectionRef = useRef(selection);
	selectionRef.current = selection;

	// Find & Replace state
	const [findReplace, setFindReplace] = useState<{ open: boolean; showReplace: boolean }>({
		open: false,
		showReplace: false,
	});

	// Block context menu state
	const [blockMenu, setBlockMenu] = useState<{
		open: boolean;
		blockId: string;
		position: { x: number; y: number };
	}>({ open: false, blockId: '', position: { x: 0, y: 0 } });

	// ---- Whole-block selection ----
	// A set of top-level block IDs selected as whole blocks (drag across
	// blocks / shift-click). Non-empty means block-selection mode is active:
	// the text caret is suppressed and bulk delete / turn-into operate on the
	// set. See core/block-selection.ts. Top-level blocks only for now.
	const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
	const selectedBlockIdsRef = useRef<string[]>(selectedBlockIds);
	selectedBlockIdsRef.current = selectedBlockIds;
	const selectedBlockSet = useMemo(() => new Set(selectedBlockIds), [selectedBlockIds]);
	// Anchor for shift-click range extension.
	const blockSelectionAnchorRef = useRef<string | null>(null);
	// Set true on pointerup after a block-drag promoted, so the trailing
	// click doesn't immediately clear the selection we just built.
	const suppressClickClearRef = useRef(false);
	// True while a promoted block-drag is in progress. The browser keeps
	// re-forming a native text range between our removeAllRanges() calls;
	// this lets handleSelectionChange ignore those so they don't clobber the
	// block selection we're building.
	const blockDragActiveRef = useRef(false);

	/** Replace the current whole-block selection. Keeps the ref in sync so
	 *  imperative pointer/key handlers read the latest value synchronously. */
	const setBlockSelection = useCallback((ids: string[]) => {
		selectedBlockIdsRef.current = ids;
		setSelectedBlockIds(ids);
	}, []);

	const clearBlockSelection = useCallback(() => {
		if (selectedBlockIdsRef.current.length === 0) return;
		selectedBlockIdsRef.current = [];
		blockSelectionAnchorRef.current = null;
		setSelectedBlockIds([]);
	}, []);

	// ---- Idle timer ----
	const resetIdleTimer = useCallback(() => {
		if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
		if (onIdle) {
			idleTimerRef.current = setTimeout(() => {
				historyRef.current.flushSeal(); // seal the final edit for the durable journal
				onIdle(docRef.current);
			}, idleDebounceMs);
		}
	}, [onIdle, idleDebounceMs]);

	const flushIdle = useCallback(() => {
		if (idleTimerRef.current) {
			clearTimeout(idleTimerRef.current);
			idleTimerRef.current = undefined;
		}
		historyRef.current.flushSeal();
		onIdle?.(docRef.current);
	}, [onIdle]);

	// ---- Apply a result (doc + ops + selection) ----
	const apply = useCallback(
		(result: ApplyResult, recordHistory = true) => {
			if (!result.doc || result.doc === docRef.current) return;

			if (recordHistory && result.ops.length > 0) {
				historyRef.current.push(result.ops, selectionRef.current, result.selection);
			}

			setDoc(result.doc);
			docRef.current = result.doc;

			if (result.selection) {
				setSelection(result.selection);
				selectionRef.current = result.selection;
				// A result that lands a text caret (e.g. bulk delete, or any text
				// edit) ends block-selection mode. Bulk turn-into returns a null
				// selection precisely so the highlight survives the conversion.
				clearBlockSelection();
			}

			onChange?.(result.doc);
			resetIdleTimer();
		},
		[onChange, resetIdleTimer, clearBlockSelection],
	);

	// Stable per-instance id for the last-focused-editor registry.
	const editorInstanceId = useId();

	// Apply an undo/redo from the history stack. Extracted from onKeyDown so the
	// document-level capture handler (below) can invoke it too — the editor's
	// Cmd+Z must fire even when focus sits in a table cell (which stops keydown
	// propagation) or has been lost to <body> after a menu/modal closed.
	const doUndo = useCallback(() => {
		const result = historyRef.current.undo(docRef.current);
		if (!result) {
			// Local stack exhausted — let the host serve undo from the durable
			// journal (e.g. after a reload).
			onUndoMiss?.();
			return;
		}
		setDoc(result.doc);
		docRef.current = result.doc;
		if (result.selection) {
			setSelection(result.selection);
			selectionRef.current = result.selection;
		}
		onChange?.(result.doc);
		onUndo?.(result.transaction); // mirror the step to the server cursor
	}, [onChange, onUndo, onUndoMiss]);

	const doRedo = useCallback(() => {
		const result = historyRef.current.redo(docRef.current);
		if (!result) {
			onRedoMiss?.();
			return;
		}
		setDoc(result.doc);
		docRef.current = result.doc;
		if (result.selection) {
			setSelection(result.selection);
			selectionRef.current = result.selection;
		}
		onChange?.(result.doc);
		onRedo?.(result.transaction);
	}, [onChange, onRedo, onRedoMiss]);

	// Mirror sealed transactions to the host's durable journal (one command per
	// undo-step), tagging each with a fingerprint of the touched blocks' state.
	// At seal time docRef.current is the post-transaction doc (push seals the
	// previous top before the new op's setDoc; flushSeal runs on the settled
	// doc), so this captures the correct "state after" for the conflict guard.
	useEffect(() => {
		historyRef.current.setSealHandler(
			onCommit ? tx => onCommit(tx, fingerprintTransaction(docRef.current, tx)) : undefined,
		);
		return () => historyRef.current.setSealHandler(undefined);
	}, [onCommit]);

	// ---- Document-level undo/redo (capture phase) ----
	// Undo/redo can't live only on the root's onKeyDown: custom blocks stop
	// keydown propagation (table cells call stopPropagation) or move focus out
	// of the editor entirely (block menus, popovers), so a bubble handler
	// never sees Cmd+Z and the edit "won't undo until refresh". A capture-phase
	// document listener runs before any stopPropagation and regardless of which
	// descendant holds focus. Guards keep us from hijacking unrelated inputs.
	useEffect(() => {
		if (readOnly) return;
		const markFocus = () => {
			if (rootRef.current?.contains(document.activeElement)) {
				lastFocusedEditorId = editorInstanceId;
			}
		};
		const onKey = (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			const mod = e.metaKey || e.ctrlKey;
			if (!mod) return;
			const isUndo = !e.shiftKey && key === 'z';
			const isRedo = (e.shiftKey && key === 'z') || key === 'y';
			if (!isUndo && !isRedo) return;

			const root = rootRef.current;
			if (!root) return;
			const ae = document.activeElement as HTMLElement | null;
			// Leave native undo to real form controls — search boxes, image URL
			// and alt-text inputs.
			// Table cells are contentEditable divs, not form controls, so they
			// still route here.
			if (ae && (ae.tagName === 'TEXTAREA' || ae.tagName === 'INPUT')) return;

			// Defer to a nested surface that manages its own undo — it marks its
			// container `data-mde-nested-undo`, so Cmd+Z there undoes that surface,
			// not the surrounding content.
			if (ae?.closest?.('[data-mde-nested-undo]')) return;

			// Act only when this editor owns the interaction: focus is inside it,
			// or focus was lost to <body>/null after a menu/modal closed AND this
			// was the last-focused editor.
			const focusInside = root.contains(ae);
			const focusLoose = ae === null || ae === document.body;
			const ownsLoose = focusLoose && lastFocusedEditorId === editorInstanceId;
			if (!focusInside && !ownsLoose) return;

			e.preventDefault();
			e.stopPropagation();
			if (isUndo) doUndo();
			else doRedo();
		};
		document.addEventListener('focusin', markFocus);
		document.addEventListener('keydown', onKey, true); // capture — beats stopPropagation
		return () => {
			document.removeEventListener('focusin', markFocus);
			document.removeEventListener('keydown', onKey, true);
		};
	}, [readOnly, doUndo, doRedo, editorInstanceId]);

	useEffect(() => {
		return () => {
			if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
		};
	}, []);

	// ---- Synchronous flush of pending changes ----
	// Hosts that navigate away (e.g. the mention picker's "Add as page"
	// bridge) dispatch `mde-flush-pending-changes` immediately before
	// route changes. Without this the React unmount clears the idle timer
	// before it ever fires onIdle, so the most recent edits in this editor
	// never get persisted. Running onIdle synchronously bypasses the
	// debounce and saves the latest doc reference right now.
	useEffect(() => {
		const onFlush = () => {
			if (idleTimerRef.current) {
				clearTimeout(idleTimerRef.current);
				idleTimerRef.current = undefined;
			}
			if (onIdle) onIdle(docRef.current);
		};
		globalThis.addEventListener('mde-flush-pending-changes', onFlush);
		return () => globalThis.removeEventListener('mde-flush-pending-changes', onFlush);
	}, [onIdle]);

	// ---- Sync selection to DOM after render ----
	// This runs synchronously after React commits to the DOM.
	// No rAF needed — the DOM is already updated at this point.
	// Using rAF would create a race with user-initiated selection changes.
	useEffect(() => {
		if (!rootRef.current || !selection) return;
		// While a whole-block selection is active the text caret is suppressed —
		// writing it back would create a stray native selection alongside the
		// block highlight (and could re-trigger native text selection).
		if (selectedBlockIds.length > 0) return;
		// Don't force the caret back into the content when focus is on a control
		// OUTSIDE this editor's root — e.g. a portaled popover's input. A
		// doc-version bump would otherwise steal focus from the field the user
		// is typing in.
		const active = document.activeElement as HTMLElement | null;
		if (active && active !== document.body && !rootRef.current.contains(active)) return;
		isWritingSelection.current = true;
		writeSelection(rootRef.current, selection);
		isWritingSelection.current = false;
	}, [selection, doc.version, selectedBlockIds.length]);

	// Mirror the selected block into activeBlockId so caret moves track too.
	useEffect(() => {
		const id = selection?.focus.blockId ?? null;
		if (id) setActiveBlockId(id);
	}, [selection?.focus.blockId]);

	// ---- Slash Command Helpers ----

	/** Check if slash command should be active and update state */
	const updateSlashCommandState = useCallback(
		(currentDoc: EditorDocument, sel: EditorSelection | null) => {
			if (!sel) {
				if (slashCommand.active) {
					setSlashCommand(prev => ({ ...prev, active: false }));
				}
				return;
			}

			// Only for collapsed selection
			if (
				sel.anchor.blockId !== sel.focus.blockId ||
				sel.anchor.offset !== sel.focus.offset
			) {
				if (slashCommand.active) {
					setSlashCommand(prev => ({ ...prev, active: false }));
				}
				return;
			}

			const block = findBlock(currentDoc, sel.focus.blockId);
			if (!block) {
				if (slashCommand.active) {
					setSlashCommand(prev => ({ ...prev, active: false }));
				}
				return;
			}

			const text = getPlainText(block.content);
			const offset = sel.focus.offset;

			// Find "/" before the cursor: look backward from cursor for the last "/"
			// The slash must be preceded by a space, newline, or be at position 0
			const textBeforeCursor = text.slice(0, offset);
			const slashIdx = textBeforeCursor.lastIndexOf('/');

			if (slashIdx !== -1 && (slashIdx === 0 || text[slashIdx - 1] === ' ')) {
				const filter = textBeforeCursor.slice(slashIdx + 1);
				// Close if filter is too long (user probably isn't looking for a command)
				if (filter.length <= 20) {
					const caretRect = getCaretRect();
					if (caretRect) {
						setSlashCommand({
							active: true,
							blockId: sel.focus.blockId,
							filter,
							position: { x: caretRect.left, y: caretRect.bottom + 4 },
						});
						return;
					}
				}
			}

			if (slashCommand.active) {
				setSlashCommand(prev => ({ ...prev, active: false }));
			}
		},
		[slashCommand.active],
	);

	/** Handle slash command item selection */
	const handleSlashSelect = useCallback(
		(type: BlockType) => {
			const blockId = slashCommand.blockId;
			const block = findBlock(docRef.current, blockId);
			if (!block) return;

			const text = getPlainText(block.content);
			let currentDoc = docRef.current;

			// Find where the "/" trigger is in the text
			const sel = selectionRef.current;
			const cursorOffset = sel?.focus.blockId === blockId ? sel.focus.offset : text.length;
			const textBeforeCursor = text.slice(0, cursorOffset);
			const slashIdx = textBeforeCursor.lastIndexOf('/');
			const slashEnd = cursorOffset; // cursor is after the filter text

			// Color pseudo-type — `__textColor:<name>` / `__bgColor:<name>`.
			// Strip the "/filter" text, then write the block's color prop. No
			// new block is inserted; the existing block's wrapper paints the
			// color via blockTextColor / blockHighlightColor.
			const typeStr = type as string;
			if (typeStr.startsWith('__textColor:') || typeStr.startsWith('__bgColor:')) {
				const mode = typeStr.startsWith('__textColor:') ? 'text' : 'bg';
				const colorName = typeStr.split(':')[1] ?? '';
				const cssValue = (() => {
					if (mode === 'text') {
						const map: Record<string, string> = {
							default: '',
							gray: '#9ca3af',
							brown: '#a16207',
							orange: '#ea580c',
							yellow: '#ca8a04',
							green: '#16a34a',
							blue: '#2563eb',
							purple: '#7c3aed',
							pink: '#db2777',
							red: '#dc2626',
						};
						return map[colorName] ?? '';
					}
					const map: Record<string, string> = {
						default: '',
						gray: '#f3f4f6',
						brown: '#fef3c7',
						orange: '#ffedd5',
						yellow: '#fef9c3',
						green: '#dcfce7',
						blue: '#dbeafe',
						purple: '#ede9fe',
						pink: '#fce7f3',
						red: '#fee2e2',
					};
					return map[colorName] ?? '';
				})();
				if (slashIdx >= 0) {
					const delResult = deleteTextOp(
						currentDoc,
						blockId,
						slashIdx,
						slashEnd - slashIdx,
					);
					currentDoc = delResult.doc;
					apply(delResult);
				}
				const propKey = mode === 'text' ? 'blockTextColor' : 'blockHighlightColor';
				const newDoc = updateBlock(currentDoc, blockId, b => ({
					...b,
					props: {
						...b.props,
						[propKey]: cssValue || undefined,
					},
				}));
				setDoc(newDoc);
				docRef.current = newDoc;
				onChange?.(newDoc);
				const newSel: EditorSelection = {
					anchor: { blockId, offset: slashIdx >= 0 ? slashIdx : 0 },
					focus: { blockId, offset: slashIdx >= 0 ? slashIdx : 0 },
				};
				setSelection(newSel);
				selectionRef.current = newSel;
				setSlashCommand({
					active: false,
					blockId: '',
					filter: '',
					position: { x: 0, y: 0 },
				});
				return;
			}

			// TOC design pseudo-type — `__toc:<variant>`. Insert (or convert this
			// block into) a Table-of-Contents block with the chosen `tocVariant`.
			// The plain design is the real `toc` block type handled generically
			// below; these pseudo-entries just seed the variant prop on insert.
			if (typeStr.startsWith('__toc:')) {
				const tocVariant = typeStr.slice('__toc:'.length) as BlockProps['tocVariant'];
				if (slashIdx === 0 && slashEnd === text.length) {
					// "/" is the whole block → convert this block in place.
					const clearResult = replaceContent(currentDoc, blockId, []);
					currentDoc = clearResult.doc;
					const result = setBlockTypeOp(currentDoc, blockId, 'toc', { tocVariant });
					apply(result);
					const newSel: EditorSelection = {
						anchor: { blockId, offset: 0 },
						focus: { blockId, offset: 0 },
					};
					setSelection(newSel);
					selectionRef.current = newSel;
				} else if (slashIdx >= 0) {
					// "/" mid-text → strip the filter and insert a new TOC block after.
					const delResult = deleteTextOp(
						currentDoc,
						blockId,
						slashIdx,
						slashEnd - slashIdx,
					);
					currentDoc = delResult.doc;
					const newBlock = createBlock('toc', '', { tocVariant });
					currentDoc = insertBlockAfter(currentDoc, blockId, newBlock);
					setDoc(currentDoc);
					docRef.current = currentDoc;
					const newSel: EditorSelection = {
						anchor: { blockId: newBlock.id, offset: 0 },
						focus: { blockId: newBlock.id, offset: 0 },
					};
					setSelection(newSel);
					selectionRef.current = newSel;
					onChange?.(currentDoc);
				}
				resetIdleTimer();
				setSlashCommand({
					active: false,
					blockId: '',
					filter: '',
					position: { x: 0, y: 0 },
				});
				return;
			}

			if (slashIdx === 0 && slashEnd === text.length) {
				// "/" is the entire block content → clear and convert type
				const clearResult = replaceContent(currentDoc, blockId, []);
				currentDoc = clearResult.doc;
				if (type === 'columns') {
					// Replace this block with a 2-column container; each column starts
					// with an empty paragraph so the user can type immediately.
					const firstParagraph = createBlock('paragraph');
					const secondParagraph = createBlock('paragraph');
					const columnsBlock = makeColumnsBlock(firstParagraph, secondParagraph);
					const replaced = updateBlock(currentDoc, blockId, () => columnsBlock);
					setDoc(replaced);
					docRef.current = replaced;
					const newSel: EditorSelection = {
						anchor: { blockId: firstParagraph.id, offset: 0 },
						focus: { blockId: firstParagraph.id, offset: 0 },
					};
					setSelection(newSel);
					selectionRef.current = newSel;
					onChange?.(replaced);
					resetIdleTimer();
					setSlashCommand({
						active: false,
						blockId: '',
						filter: '',
						position: { x: 0, y: 0 },
					});
					return;
				} else if (type === 'tabs') {
					// Insert a `tabs` container with 3 default `tab` children, each
					// holding one empty paragraph so the user can start typing on
					// any tab. The active tab defaults to 0; tab theme defaults to
					// "pill" (matches the user's screenshot).
					const tabsBlock = makeTabsBlock(3);
					const replaced = updateBlock(currentDoc, blockId, () => tabsBlock);
					setDoc(replaced);
					docRef.current = replaced;
					// Caret lands inside the first paragraph of the first tab.
					const firstTabFirstChild = tabsBlock.children[0]?.children[0];
					if (firstTabFirstChild) {
						const newSel: EditorSelection = {
							anchor: { blockId: firstTabFirstChild.id, offset: 0 },
							focus: { blockId: firstTabFirstChild.id, offset: 0 },
						};
						setSelection(newSel);
						selectionRef.current = newSel;
					}
					onChange?.(replaced);
					resetIdleTimer();
					setSlashCommand({
						active: false,
						blockId: '',
						filter: '',
						position: { x: 0, y: 0 },
					});
					return;
				} else {
					const result = setBlockTypeOp(currentDoc, blockId, type);
					apply(result);
				}
				// Explicitly set cursor to start of the converted block
				const newSel: EditorSelection = {
					anchor: { blockId, offset: 0 },
					focus: { blockId, offset: 0 },
				};
				setSelection(newSel);
				selectionRef.current = newSel;
			} else if (slashIdx >= 0) {
				// "/" is in the middle of text → remove the "/filter" and insert new block after
				const delResult = deleteTextOp(currentDoc, blockId, slashIdx, slashEnd - slashIdx);
				currentDoc = delResult.doc;
				if (type === 'columns') {
					const firstParagraph = createBlock('paragraph');
					const secondParagraph = createBlock('paragraph');
					const columnsBlock = makeColumnsBlock(firstParagraph, secondParagraph);
					currentDoc = insertBlockAfter(currentDoc, blockId, columnsBlock);
					setDoc(currentDoc);
					docRef.current = currentDoc;
					const newSel: EditorSelection = {
						anchor: { blockId: firstParagraph.id, offset: 0 },
						focus: { blockId: firstParagraph.id, offset: 0 },
					};
					setSelection(newSel);
					selectionRef.current = newSel;
					onChange?.(currentDoc);
					resetIdleTimer();
					setSlashCommand({
						active: false,
						blockId: '',
						filter: '',
						position: { x: 0, y: 0 },
					});
					return;
				}
				if (type === 'tabs') {
					const tabsBlock = makeTabsBlock(3);
					currentDoc = insertBlockAfter(currentDoc, blockId, tabsBlock);
					setDoc(currentDoc);
					docRef.current = currentDoc;
					const firstTabFirstChild = tabsBlock.children[0]?.children[0];
					if (firstTabFirstChild) {
						const newSel: EditorSelection = {
							anchor: { blockId: firstTabFirstChild.id, offset: 0 },
							focus: { blockId: firstTabFirstChild.id, offset: 0 },
						};
						setSelection(newSel);
						selectionRef.current = newSel;
					}
					onChange?.(currentDoc);
					resetIdleTimer();
					setSlashCommand({
						active: false,
						blockId: '',
						filter: '',
						position: { x: 0, y: 0 },
					});
					return;
				}
				// Insert a new block of the selected type after this one
				const newBlock = createBlock(type);
				currentDoc = insertBlockAfter(currentDoc, blockId, newBlock);
				setDoc(currentDoc);
				docRef.current = currentDoc;
				const newSel: EditorSelection = {
					anchor: { blockId: newBlock.id, offset: 0 },
					focus: { blockId: newBlock.id, offset: 0 },
				};
				setSelection(newSel);
				selectionRef.current = newSel;
				onChange?.(currentDoc);
				resetIdleTimer();
			}

			// Close the menu
			setSlashCommand({ active: false, blockId: '', filter: '', position: { x: 0, y: 0 } });
		},
		[slashCommand.blockId, onChange, resetIdleTimer, apply],
	);

	/** Close slash command menu */
	const handleSlashClose = useCallback(() => {
		setSlashCommand({ active: false, blockId: '', filter: '', position: { x: 0, y: 0 } });
	}, []);

	// ---- Emoji Picker Helpers ----

	/** Check if emoji picker should be active (triggered by `:`) */
	const updateEmojiPickerState = useCallback(
		(currentDoc: EditorDocument, sel: EditorSelection | null) => {
			if (!sel || slashCommand.active) {
				if (emojiPicker.active) setEmojiPicker(prev => ({ ...prev, active: false }));
				return;
			}
			if (
				sel.anchor.blockId !== sel.focus.blockId ||
				sel.anchor.offset !== sel.focus.offset
			) {
				if (emojiPicker.active) setEmojiPicker(prev => ({ ...prev, active: false }));
				return;
			}
			const block = findBlock(currentDoc, sel.focus.blockId);
			if (!block) {
				if (emojiPicker.active) setEmojiPicker(prev => ({ ...prev, active: false }));
				return;
			}

			const text = getPlainText(block.content);
			const offset = sel.focus.offset;
			const textBeforeCursor = text.slice(0, offset);

			// Find ":" before cursor — must be preceded by space or at position 0
			const colonIdx = textBeforeCursor.lastIndexOf(':');
			if (colonIdx !== -1 && (colonIdx === 0 || /\s/.test(text[colonIdx - 1]))) {
				const filter = textBeforeCursor.slice(colonIdx + 1);
				// No spaces in filter (emoji names don't have spaces), max 30 chars
				if (filter.length <= 30 && !/\s/.test(filter)) {
					const caretRect = getCaretRect();
					if (caretRect) {
						setEmojiPicker({
							active: true,
							blockId: sel.focus.blockId,
							filter,
							position: { x: caretRect.left, y: caretRect.bottom + 4 },
						});
						return;
					}
				}
			}
			if (emojiPicker.active) setEmojiPicker(prev => ({ ...prev, active: false }));
		},
		[emojiPicker.active, slashCommand.active],
	);

	/** Handle emoji selection — replace `:filter` with the emoji character */
	const handleEmojiSelect = useCallback(
		(emoji: string) => {
			const blockId = emojiPicker.blockId;
			const block = findBlock(docRef.current, blockId);
			if (!block) return;

			const text = getPlainText(block.content);
			const sel = selectionRef.current;
			const cursorOffset = sel?.focus.blockId === blockId ? sel.focus.offset : text.length;
			const textBeforeCursor = text.slice(0, cursorOffset);
			const colonIdx = textBeforeCursor.lastIndexOf(':');

			if (colonIdx >= 0) {
				// Delete `:filter` and insert the emoji character
				let currentDoc = docRef.current;
				const delResult = deleteTextOp(
					currentDoc,
					blockId,
					colonIdx,
					cursorOffset - colonIdx,
				);
				currentDoc = delResult.doc;
				const insResult = insertTextOp(currentDoc, blockId, colonIdx, emoji);
				currentDoc = insResult.doc;
				setDoc(currentDoc);
				docRef.current = currentDoc;
				const newSel: EditorSelection = {
					anchor: { blockId, offset: colonIdx + emoji.length },
					focus: { blockId, offset: colonIdx + emoji.length },
				};
				setSelection(newSel);
				selectionRef.current = newSel;
				onChange?.(currentDoc);
				resetIdleTimer();
			}

			setEmojiPicker({ active: false, blockId: '', filter: '', position: { x: 0, y: 0 } });
		},
		[emojiPicker.blockId, onChange, resetIdleTimer],
	);

	/** Close emoji picker */
	const handleEmojiClose = useCallback(() => {
		setEmojiPicker({ active: false, blockId: '', filter: '', position: { x: 0, y: 0 } });
	}, []);

	// ---- Mention Picker Helpers ----

	/** Check if the mention picker should be active (triggered by `@`). */
	const updateMentionPickerState = useCallback(
		(currentDoc: EditorDocument, sel: EditorSelection | null) => {
			// Sub-prompt active (e.g. calendar) — hold the picker open.
			if (pickerPinnedRef.current) return;
			const close = () => {
				if (mentionPicker.active) {
					setMentionPicker(prev => ({ ...prev, active: false }));
				}
			};
			// No providers wired up → @ is just a literal character.
			if (!mentionProviders || mentionProviders.length === 0) {
				close();
				return;
			}
			if (!sel || slashCommand.active || emojiPicker.active) {
				close();
				return;
			}
			if (
				sel.anchor.blockId !== sel.focus.blockId ||
				sel.anchor.offset !== sel.focus.offset
			) {
				close();
				return;
			}
			const block = findBlock(currentDoc, sel.focus.blockId);
			if (!block) {
				close();
				return;
			}

			const text = getPlainText(block.content);
			const offset = sel.focus.offset;
			const textBeforeCursor = text.slice(0, offset);

			// Find the most recent "@" that's at start-of-block or after whitespace.
			const atIdx = textBeforeCursor.lastIndexOf('@');
			if (atIdx === -1) {
				close();
				return;
			}
			if (atIdx !== 0 && !/\s/.test(text[atIdx - 1])) {
				close();
				return;
			}
			// The "@" of a mention already inserted (its pill label) is not a new trigger.
			if (isInMention(block.content, atIdx)) {
				close();
				return;
			}

			// Honor an explicit Escape close until the user moves to a different "@".
			const dismissed = closedMentionAtRef.current;
			if (
				dismissed &&
				dismissed.blockId === sel.focus.blockId &&
				dismissed.offset === atIdx
			) {
				close();
				return;
			}
			const filter = textBeforeCursor.slice(atIdx + 1);
			// Bail if the filter contains a newline or grew unreasonably long.
			if (filter.length > 40 || /\n/.test(filter)) {
				close();
				return;
			}

			const caretRect = getCaretRect();
			if (!caretRect) {
				close();
				return;
			}

			setMentionPicker({
				active: true,
				blockId: sel.focus.blockId,
				filter,
				triggerOffset: atIdx,
				position: { x: caretRect.left, y: caretRect.bottom + 4 },
			});
		},
		[mentionProviders, mentionPicker.active, slashCommand.active, emojiPicker.active],
	);

	/** Handle mention selection — replace `@filter` with the mention pill. */
	const handleMentionSelect = useCallback(
		(item: MentionItem) => {
			const blockId = mentionPicker.blockId;
			const triggerOffset = mentionPicker.triggerOffset;
			const block = findBlock(docRef.current, blockId);
			if (!block || triggerOffset < 0) return;

			const sel = selectionRef.current;
			const cursorOffset =
				sel?.focus.blockId === blockId
					? sel.focus.offset
					: getPlainText(block.content).length;

			// Each provider chooses its display prefix — pages typically don't get
			// an "@" in the label, users do. We treat item.label as authoritative;
			// if the provider didn't prefix users with "@", do it here.
			const label =
				item.kind === 'user' && !item.label.startsWith('@') ? `@${item.label}` : item.label;

			const result = insertMentionOp(
				docRef.current,
				blockId,
				triggerOffset,
				cursorOffset,
				label,
				item.kind,
				item.id,
			);
			if (result.doc !== docRef.current) {
				apply(result);
			}
			// Allow "@" to be retyped immediately after insertion.
			closedMentionAtRef.current = null;
			setMentionPicker({
				active: false,
				blockId: '',
				filter: '',
				triggerOffset: -1,
				position: { x: 0, y: 0 },
			});
		},
		[mentionPicker.blockId, mentionPicker.triggerOffset, apply],
	);

	// ---- Bridge mention (lists, tables) ----
	// The pin/unpin pair is broadcast by the picker itself via window events
	// when its `datePrompt` is open. Both this listener (bridge close path)
	// and updateMentionPickerState (main-editor close path) read the same
	// `pickerPinnedRef` so neither can unmount the picker while a sub-prompt
	// is mid-interaction.
	useEffect(() => {
		if (!mentionProviders || mentionProviders.length === 0) return;
		const onTrigger = (e: Event) => {
			const detail = (e as CustomEvent).detail as {
				source: string;
				filter: string;
				position: { x: number; y: number };
			};
			if (!detail?.source) return;
			setBridgeMention({
				active: true,
				source: detail.source,
				filter: detail.filter ?? '',
				position: detail.position ?? { x: 0, y: 0 },
			});
		};
		const onClose = (e: Event) => {
			if (pickerPinnedRef.current) return;
			const detail = (e as CustomEvent).detail as { source: string } | undefined;
			setBridgeMention(prev =>
				!detail || prev.source === detail.source
					? { active: false, source: '', filter: '', position: { x: 0, y: 0 } }
					: prev,
			);
		};
		const onPin = () => {
			pickerPinnedRef.current = true;
		};
		const onUnpin = () => {
			pickerPinnedRef.current = false;
		};
		globalThis.addEventListener('mde-mention-trigger', onTrigger as EventListener);
		globalThis.addEventListener('mde-mention-close', onClose as EventListener);
		globalThis.addEventListener('mde-mention-pin', onPin as EventListener);
		globalThis.addEventListener('mde-mention-unpin', onUnpin as EventListener);
		return () => {
			globalThis.removeEventListener('mde-mention-trigger', onTrigger as EventListener);
			globalThis.removeEventListener('mde-mention-close', onClose as EventListener);
			globalThis.removeEventListener('mde-mention-pin', onPin as EventListener);
			globalThis.removeEventListener('mde-mention-unpin', onUnpin as EventListener);
		};
	}, [mentionProviders]);

	const handleBridgeSelect = useCallback(
		(item: MentionItem) => {
			const source = bridgeMention.source;
			if (!source) return;
			globalThis.dispatchEvent(
				new CustomEvent('mde-mention-fill', { detail: { source, item } }),
			);
			setBridgeMention({ active: false, source: '', filter: '', position: { x: 0, y: 0 } });
		},
		[bridgeMention.source],
	);

	const handleBridgeClose = useCallback(() => {
		const source = bridgeMention.source;
		if (source) {
			globalThis.dispatchEvent(
				new CustomEvent('mde-mention-dismiss', { detail: { source } }),
			);
		}
		setBridgeMention({ active: false, source: '', filter: '', position: { x: 0, y: 0 } });
	}, [bridgeMention.source]);

	// ---- Chip remove (X-on-hover) ----
	// Every editable surface listens for `mde-mention-remove`. This
	// handler claims chips that live in regular TextSpan-backed blocks —
	// chips inside list cells or table cells are claimed by ListBlock /
	// TableBlock listeners instead.
	useEffect(() => {
		const onRemove = (e: Event) => {
			if (readOnly) return;
			const detail = (e as CustomEvent).detail as { element?: HTMLElement };
			const chip = detail?.element;
			if (!chip) return;
			const root = rootRef.current;
			if (!root || !root.contains(chip)) return;
			// Lists + tables own their own chips.
			if (chip.closest('[data-list-item-id], [data-table-block], [data-mention-input]'))
				return;
			const blockEl = chip.closest('[data-block-id]') as HTMLElement | null;
			const blockId = blockEl?.dataset.blockId;
			if (!blockId) return;
			const block = findBlock(docRef.current, blockId);
			if (!block) return;
			const kind = chip.getAttribute('data-mention-kind');
			const id = chip.getAttribute('data-mention-id');
			if (!kind || id === null) return;
			// Find the offset of the matching mention span. Multiple identical
			// chips in one block resolve to the first match — acceptable for the
			// hover-X UX since visually identical chips are an edge case.
			let pos = 0;
			let found: { from: number; length: number } | null = null;
			for (const span of block.content) {
				const isMention = span.marks?.some(
					m => m.type === 'mention' && m.attrs?.kind === kind && m.attrs?.id === id,
				);
				if (isMention) {
					found = { from: pos, length: span.text.length };
					break;
				}
				pos += span.text.length;
			}
			if (!found) return;
			const result = deleteTextOp(docRef.current, blockId, found.from, found.length);
			if (result.doc !== docRef.current) apply(result);
		};
		globalThis.addEventListener('mde-mention-remove', onRemove as EventListener);
		return () =>
			globalThis.removeEventListener('mde-mention-remove', onRemove as EventListener);
	}, [readOnly, apply]);

	// ---- Chip label auto-sync ----
	// MentionPill dispatches `mde-mention-sync` whenever the resolver
	// produces a label different from the chip's stored TextSpan.text. We
	// update the model so search/serialize/plain-text reads stay in lockstep
	// with the rendered chip — date chips relabel across days, page chips
	// track renames. Skipped for read-only docs and for chips that live in
	// self-managed surfaces (list/table cells, MentionInput) — those have
	// their own storage model.
	useEffect(() => {
		const onSync = (e: Event) => {
			if (readOnly) return;
			const detail = (e as CustomEvent).detail as { element?: HTMLElement; label?: string };
			const chip = detail?.element;
			const newLabel = detail?.label;
			if (!chip || !newLabel) return;
			const root = rootRef.current;
			if (!root || !root.contains(chip)) return;
			if (chip.closest('[data-list-item-id], [data-table-block], [data-mention-input]'))
				return;
			const blockEl = chip.closest('[data-block-id]') as HTMLElement | null;
			const blockId = blockEl?.dataset.blockId;
			if (!blockId) return;
			const block = findBlock(docRef.current, blockId);
			if (!block) return;
			const kind = chip.getAttribute('data-mention-kind');
			const id = chip.getAttribute('data-mention-id');
			if (!kind || id === null) return;

			let touched = false;
			const newContent = block.content.map(span => {
				const isMention = span.marks?.some(
					m => m.type === 'mention' && m.attrs?.kind === kind && m.attrs?.id === id,
				);
				if (!isMention || span.text === newLabel) return span;
				touched = true;
				// Strip the legacy attrs.label snapshot at the same time so old
				// data converges on the label-less shape. New marks only carry
				// kind + id.
				const newMarks = (span.marks ?? []).map(m => {
					if (m.type !== 'mention') return m;
					const attrs = m.attrs ?? {};
					if (!('label' in attrs)) return m;
					const rest = { ...attrs };
					delete rest.label;
					return { ...m, attrs: rest };
				});
				return { ...span, text: newLabel, marks: newMarks };
			});
			if (!touched) return;

			// Don't record in history — this is a derived re-render, not a
			// user edit. recordHistory=false also avoids polluting undo with a
			// step the user never took.
			const result = replaceContent(docRef.current, blockId, newContent);
			if (result.doc !== docRef.current) apply(result, /* recordHistory */ false);
		};
		globalThis.addEventListener('mde-mention-sync', onSync as EventListener);
		return () => globalThis.removeEventListener('mde-mention-sync', onSync as EventListener);
	}, [readOnly, apply]);

	/** Close the mention picker without inserting; remember the "@" so it
	 *  doesn't immediately re-open until the user types past it. */
	const handleMentionClose = useCallback(() => {
		// Sub-prompt active (e.g. calendar) — the user is mid-interaction
		// inside the picker; ignore close requests from outside-click/etc.
		if (pickerPinnedRef.current) return;
		if (mentionPicker.active && mentionPicker.triggerOffset >= 0) {
			closedMentionAtRef.current = {
				blockId: mentionPicker.blockId,
				offset: mentionPicker.triggerOffset,
			};
		}
		setMentionPicker({
			active: false,
			blockId: '',
			filter: '',
			triggerOffset: -1,
			position: { x: 0, y: 0 },
		});
	}, [mentionPicker.active, mentionPicker.blockId, mentionPicker.triggerOffset]);

	// ---- Floating Toolbar Helpers ----

	/** Update toolbar state based on current selection */
	const updateToolbarState = useCallback(
		(currentDoc: EditorDocument, sel: EditorSelection | null) => {
			// Don't close the toolbar while the link URL input is showing
			if (isToolbarLinkInputActive) return;

			if (!sel) {
				if (toolbar.active) {
					setToolbar(prev => ({ ...prev, active: false }));
				}
				return;
			}

			// Check if selection is non-collapsed
			const isCollapsed =
				sel.anchor.blockId === sel.focus.blockId && sel.anchor.offset === sel.focus.offset;

			if (isCollapsed) {
				if (toolbar.active) {
					setToolbar(prev => ({ ...prev, active: false }));
				}
				return;
			}

			// Get the selection rect from the browser
			const domSel = window.getSelection();
			if (!domSel || domSel.rangeCount === 0) {
				if (toolbar.active) {
					setToolbar(prev => ({ ...prev, active: false }));
				}
				return;
			}

			const range = domSel.getRangeAt(0);
			const rect = range.getBoundingClientRect();

			if (rect.width === 0 && rect.height === 0) {
				if (toolbar.active) {
					setToolbar(prev => ({ ...prev, active: false }));
				}
				return;
			}

			// Suppress when the selection is just a mention chip (contenteditable=false
			// atomic span). The formatting buttons don't apply to it, and the toolbar
			// collides with the mention hover card.
			const cloned = range.cloneContents();
			const chip = cloned.querySelector?.("[data-mention='true']");
			if (chip && (cloned.textContent ?? '').trim() === (chip.textContent ?? '').trim()) {
				if (toolbar.active) {
					setToolbar(prev => ({ ...prev, active: false }));
				}
				return;
			}

			// Get active marks at the focus position
			const marks = getActiveMarksAtPosition(currentDoc, sel.focus.blockId, sel.focus.offset);

			setToolbar({
				active: true,
				position: {
					x: rect.left + rect.width / 2,
					y: rect.top - 10,
				},
				activeMarks: marks,
			});
		},
		[toolbar.active],
	);

	/** Handle mark toggle from toolbar */
	const handleToolbarToggleMark = useCallback(
		(mark: Mark) => {
			const sel = selectionRef.current;
			if (!sel) return;

			// For same-block selections
			if (sel.anchor.blockId === sel.focus.blockId) {
				const from = Math.min(sel.anchor.offset, sel.focus.offset);
				const to = Math.max(sel.anchor.offset, sel.focus.offset);
				const result = toggleMarkOp(docRef.current, sel.anchor.blockId, from, to, mark);
				if (result.doc !== docRef.current) {
					apply(result);
				}
			}

			// Update toolbar marks after toggling
			requestAnimationFrame(() => {
				const currentSel = selectionRef.current;
				if (currentSel) {
					const marks = getActiveMarksAtPosition(
						docRef.current,
						currentSel.focus.blockId,
						currentSel.focus.offset,
					);
					setToolbar(prev => ({
						...prev,
						activeMarks: marks,
					}));
				}
			});
		},
		[apply],
	);

	/** Set (or clear, with no `attrs`) a "pick a value" mark like color /
	 *  highlight on the selection. Uses the set-mark op so re-picking a
	 *  DIFFERENT value replaces it instead of toggling the mark off. */
	const handleToolbarSetMark = useCallback(
		(mark: Mark) => {
			const sel = selectionRef.current;
			if (!sel || sel.anchor.blockId !== sel.focus.blockId) return;
			const from = Math.min(sel.anchor.offset, sel.focus.offset);
			const to = Math.max(sel.anchor.offset, sel.focus.offset);
			if (from === to) return;
			const result = setMarkOp(
				docRef.current,
				sel.anchor.blockId,
				from,
				to,
				mark.type,
				mark.attrs,
			);
			if (result.doc !== docRef.current) apply(result);
		},
		[apply],
	);

	/** Set (or clear, with "") an inline font on the selection. Uses the
	 *  set-mark op so re-picking replaces the font instead of toggling off. */
	const handleToolbarSetFont = useCallback(
		(value: string) => {
			const sel = selectionRef.current;
			if (!sel || sel.anchor.blockId !== sel.focus.blockId) return;
			const from = Math.min(sel.anchor.offset, sel.focus.offset);
			const to = Math.max(sel.anchor.offset, sel.focus.offset);
			if (from === to) return;
			const result = setMarkOp(
				docRef.current,
				sel.anchor.blockId,
				from,
				to,
				'fontFamily',
				value ? { fontFamily: value } : undefined,
			);
			if (result.doc !== docRef.current) apply(result);
		},
		[apply],
	);

	/** Close floating toolbar */
	const handleToolbarClose = useCallback(() => {
		setToolbar({ active: false, position: { x: 0, y: 0 }, activeMarks: [] });
	}, []);

	// ---- Drag Handle Callbacks ----

	const handleDragStart = useCallback((e: React.DragEvent, blockId: string) => {
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', blockId);
		setDragState({ draggingBlockId: blockId, dropTarget: null });
	}, []);

	// ---- Event Handlers ----

	// Guard flag to prevent selectionchange → writeSelection → selectionchange loop
	const isWritingSelection = useRef(false);

	const handleSelectionChange = useCallback(() => {
		if (isComposing.current || !rootRef.current || isWritingSelection.current) return;
		// A promoted block-drag suppresses native selection on purpose — ignore
		// the transient ranges the browser fires while we own the gesture.
		if (blockDragActiveRef.current) return;
		// While a whole-block selection is active, block mode owns the editor.
		// Ignore native selection churn entirely — a focused-but-empty
		// contentEditable spontaneously drops a caret (e.g. on hover/refocus)
		// that must not be mistaken for a user action. Exiting block mode is
		// driven explicitly by onClick / onKeyDown.
		if (selectedBlockIdsRef.current.length > 0) return;

		const domSel = window.getSelection();
		if (!domSel || !rootRef.current.contains(domSel.anchorNode)) return;

		// Skip only when the selection is inside a self-managed nested surface
		// (table cells, list cells, MentionInput) — those run their own selection
		// pipeline. Plain mention chips are contentEditable=false but NOT
		// self-managed; we want the regular pipeline to read the selection so
		// writeSelection can bump the caret out of the chip via closestNonEditable
		// in selection.ts. Matching too broadly here (e.g. any contentEditable=false
		// ancestor) traps the caret inside trailing chips and breaks typing past them.
		const anchorEl =
			domSel.anchorNode instanceof HTMLElement
				? domSel.anchorNode
				: domSel.anchorNode?.parentElement;
		if (anchorEl?.closest?.('[data-list-block], [data-table-block], [data-mention-input]'))
			return;

		const sel = readSelection(rootRef.current);
		if (sel) {
			// Skip update if selection hasn't changed (prevents loops)
			const prev = selectionRef.current;
			if (
				prev &&
				prev.anchor.blockId === sel.anchor.blockId &&
				prev.anchor.offset === sel.anchor.offset &&
				prev.focus.blockId === sel.focus.blockId &&
				prev.focus.offset === sel.focus.offset
			) {
				return;
			}

			setSelection(sel);
			selectionRef.current = sel;

			// Update slash command, emoji picker, mention picker, and toolbar states
			requestAnimationFrame(() => {
				updateSlashCommandState(docRef.current, sel);
				updateEmojiPickerState(docRef.current, sel);
				updateMentionPickerState(docRef.current, sel);
				updateToolbarState(docRef.current, sel);
			});
		}
	}, [
		updateSlashCommandState,
		updateEmojiPickerState,
		updateMentionPickerState,
		updateToolbarState,
	]);

	useEffect(() => {
		document.addEventListener('selectionchange', handleSelectionChange);
		return () => document.removeEventListener('selectionchange', handleSelectionChange);
	}, [handleSelectionChange]);

	// ---- Whole-block selection: pointer drag + shift-click ----
	// Native text selection can't cross the separate editing hosts that list /
	// table / tabs blocks render, so dragging across "mixed types" fails. This
	// takes over once a drag leaves its start block: it tracks selected blocks
	// by pointer geometry (immune to editing-host boundaries) and clears the
	// DOM range so the whole-block highlight is the only thing shown. Mouse
	// only for now — touch uses the coarse-pointer handle paradigm.
	useEffect(() => {
		if (readOnly) return;
		const root = rootRef.current;
		if (!root) return;

		let drag: {
			startBlockId: string;
			startX: number;
			startY: number;
			promoted: boolean;
		} | null = null;

		const isInteractiveTarget = (el: HTMLElement | null) =>
			!!el?.closest(
				'button, a, input, textarea, select, [data-block-handle], [data-block-handle-root]',
			);

		const topLevelAtPoint = (x: number, y: number): string | null => {
			const el = document.elementFromPoint(x, y);
			if (!el || !root.contains(el)) return null;
			return topLevelBlockIdFromNode(root, el);
		};

		// Keep native selection suppressed across the trailing mouseup → click →
		// selectionchange that follow a block-drag / shift-click, then restore.
		// Releasing synchronously lets the mouseup drop a spurious caret whose
		// selectionchange would clear the block selection we just built.
		const releaseSoon = () => {
			requestAnimationFrame(() =>
				requestAnimationFrame(() => {
					root.style.userSelect = '';
					blockDragActiveRef.current = false;
					window.getSelection()?.removeAllRanges();
				}),
			);
		};

		const onPointerDown = (e: PointerEvent) => {
			if (e.button !== 0 || e.pointerType !== 'mouse') return;
			suppressClickClearRef.current = false;
			const target = e.target as HTMLElement | null;
			if (isInteractiveTarget(target)) return;
			const blockId = topLevelBlockIdFromNode(root, target);
			if (!blockId) return; // background / nested-only — let click clear it

			// Shift-click extends a whole-block selection from the anchor.
			if (e.shiftKey) {
				const anchor =
					blockSelectionAnchorRef.current ??
					selectionRef.current?.anchor.blockId ??
					blockId;
				const ids = topLevelBlockIdsInRange(docRef.current, anchor, blockId);
				if (ids.length > 1) {
					e.preventDefault();
					window.getSelection()?.removeAllRanges();
					blockSelectionAnchorRef.current = anchor;
					setBlockSelection(ids);
					suppressClickClearRef.current = true;
					blockDragActiveRef.current = true;
					root.style.userSelect = 'none';
					releaseSoon();
					return;
				}
			}

			drag = {
				startBlockId: blockId,
				startX: e.clientX,
				startY: e.clientY,
				promoted: false,
			};
		};

		const onPointerMove = (e: PointerEvent) => {
			if (!drag) return;
			if (!drag.promoted) {
				// Hold off until the pointer has moved a little AND reached a
				// different top-level block — native text selection should still
				// work for a drag that stays within the start block.
				const moved = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 6;
				if (!moved) return;
				const here = topLevelAtPoint(e.clientX, e.clientY);
				if (!here || here === drag.startBlockId) return;
				drag.promoted = true;
				blockDragActiveRef.current = true;
				blockSelectionAnchorRef.current = drag.startBlockId;
				// Stop the browser from re-forming a native text range under the
				// block highlight for the rest of the gesture.
				root.style.userSelect = 'none';
			}
			const here = topLevelAtPoint(e.clientX, e.clientY) ?? drag.startBlockId;
			const ids = topLevelBlockIdsInRange(docRef.current, drag.startBlockId, here);
			if (ids.length > 0) setBlockSelection(ids);
			window.getSelection()?.removeAllRanges();
			e.preventDefault();
		};

		const onPointerUp = () => {
			if (drag?.promoted) {
				suppressClickClearRef.current = true;
				window.getSelection()?.removeAllRanges();
				// Stay suppressed through the trailing mouseup/click/selectionchange.
				releaseSoon();
			}
			drag = null;
		};

		// A plain click (no drag promotion) returns to text editing: clear the
		// block selection and adopt the caret the click just placed (since
		// handleSelectionChange ignores selection changes while block mode is
		// on). The trailing click of a promoted drag / shift-click is skipped
		// via suppressClickClearRef.
		const onClick = () => {
			if (suppressClickClearRef.current) {
				suppressClickClearRef.current = false;
				return;
			}
			if (selectedBlockIdsRef.current.length === 0) return;
			clearBlockSelection();
			const sel = readSelection(root);
			if (sel) {
				setSelection(sel);
				selectionRef.current = sel;
			}
		};

		root.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('pointermove', onPointerMove);
		document.addEventListener('pointerup', onPointerUp);
		root.addEventListener('click', onClick);
		return () => {
			root.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('pointermove', onPointerMove);
			document.removeEventListener('pointerup', onPointerUp);
			root.removeEventListener('click', onClick);
			root.style.userSelect = '';
			blockDragActiveRef.current = false;
		};
	}, [readOnly, setBlockSelection, clearBlockSelection]);

	const onKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (readOnly || isComposing.current) return;

			// Skip if event originates from a self-managed block (list, table)
			// or from a native form input rendered inside a block (e.g. bookmark URL).
			const target = e.target as HTMLElement;
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

			// ---- Whole-block selection commands ----
			// Handled before the list/table guard below so Delete works even when
			// a self-managed block is part of the selection (those swallow their
			// own keys, but a block selection means focus is not inside a cell).
			if (selectedBlockIdsRef.current.length > 0) {
				// A bare modifier keydown (Shift / Alt / Meta / Control / CapsLock)
				// fires as its own event just before a combo's real key. Ignore it —
				// otherwise the "unhandled key" branch below would clear the block
				// selection before the following Shift+Tab / Cmd+C keydown arrived.
				if (
					e.key === 'Shift' ||
					e.key === 'Alt' ||
					e.key === 'Meta' ||
					e.key === 'Control' ||
					e.key === 'CapsLock'
				) {
					return;
				}
				if (e.metaKey || e.ctrlKey) {
					const k = e.key.toLowerCase();
					const ids = selectedBlockIdsRef.current;
					// Copy / cut / paste act on the whole-block selection. The browser
					// doesn't fire native copy/cut/paste events while block-selection
					// mode has no DOM range, so handle them here (preventDefault) using
					// the in-memory block clipboard.
					if (k === 'c' || k === 'x') {
						e.preventDefault();
						const idSet = new Set(ids);
						const sources = docRef.current.blocks.filter(b => idSet.has(b.id));
						if (sources.length > 0) {
							const text = copyBlocksToClipboard(sources);
							// Best-effort mirror to the system clipboard for external paste
							// (and so a later caret Cmd+V can match the marker).
							try {
								void navigator.clipboard?.writeText(text);
							} catch {
								/* denied — in-memory clipboard still works in-app */
							}
							// Copy keeps the highlight; cut removes the blocks (apply lands
							// a caret, which clears the highlight).
							if (k === 'x') apply(deleteBlocksOp(docRef.current, ids));
						}
						return;
					}
					if (k === 'v') {
						e.preventDefault();
						if (blockMenuClipboard && blockMenuClipboard.length > 0) {
							// Replace the selected blocks with the copied ones.
							const clones = blockMenuClipboard.map(cloneBlockWithFreshIds);
							apply(replaceBlocksOp(docRef.current, ids, clones));
						} else {
							clearBlockSelection();
						}
						return;
					}
					// Other modifier shortcuts (undo, select-all, save, find, bold, …)
					// return to text mode first.
					clearBlockSelection();
				} else if (e.key === 'Escape') {
					e.preventDefault();
					clearBlockSelection();
					return;
				} else if (e.key === 'Backspace' || e.key === 'Delete') {
					e.preventDefault();
					apply(deleteBlocksOp(docRef.current, selectedBlockIdsRef.current));
					return;
				} else if (e.key === 'Tab') {
					// Indent / outdent every selected list item as a group. The block
					// highlight is kept (result carries a null selection, so `apply`
					// doesn't collapse it) so the user can Tab repeatedly.
					e.preventDefault();
					const res = indentBlocksOp(
						docRef.current,
						selectedBlockIdsRef.current,
						e.shiftKey ? 'out' : 'in',
					);
					if (res.doc !== docRef.current) apply(res);
					return;
				} else if (e.key.startsWith('Arrow')) {
					// Collapse to a caret at the matching edge of the selection.
					e.preventDefault();
					const ids = selectedBlockIdsRef.current;
					const goStart = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
					const edgeId = goStart ? ids[0]! : ids[ids.length - 1]!;
					const edgeBlock = findBlock(docRef.current, edgeId);
					if (edgeBlock) {
						const offset = goStart ? 0 : getTextLength(edgeBlock.content);
						const caret: EditorSelection = {
							anchor: { blockId: edgeId, offset },
							focus: { blockId: edgeId, offset },
						};
						setSelection(caret);
						selectionRef.current = caret;
					}
					clearBlockSelection();
					return;
				} else if (e.key.length === 1 || e.key === 'Enter') {
					// Printable key / Enter with no caret: drop the selection and
					// swallow the key (avoids inserting at an indeterminate spot).
					e.preventDefault();
					clearBlockSelection();
					return;
				} else {
					clearBlockSelection();
				}
			}

			if (target.closest?.('[data-list-block], [data-table-block]')) return;

			// If slash command is active, let the SlashCommandMenu handle these keys
			if (slashCommand.active) {
				if (
					e.key === 'ArrowDown' ||
					e.key === 'ArrowUp' ||
					e.key === 'Enter' ||
					e.key === 'Escape'
				) {
					e.preventDefault();
					e.stopPropagation(); // Prevent any further handling
					// Don't handle Enter/etc here — the slash menu's capture-phase listener handles it
					return;
				}
			}

			// If emoji picker is active, let it handle navigation keys
			if (emojiPicker.active) {
				if (
					e.key === 'ArrowDown' ||
					e.key === 'ArrowUp' ||
					e.key === 'Enter' ||
					e.key === 'Escape' ||
					e.key === 'Tab'
				) {
					e.preventDefault();
					e.stopPropagation();
					return;
				}
			}

			// If mention picker is active, let it handle navigation keys
			if (mentionPicker.active) {
				if (
					e.key === 'ArrowDown' ||
					e.key === 'ArrowUp' ||
					e.key === 'Enter' ||
					e.key === 'Escape' ||
					e.key === 'Tab'
				) {
					e.preventDefault();
					e.stopPropagation();
					return;
				}
			}

			// Escape closes toolbar
			if (toolbar.active && e.key === 'Escape') {
				e.preventDefault();
				handleToolbarClose();
				return;
			}

			const currentDoc = docRef.current;

			// Save: Cmd+S / Ctrl+S — flush pending autosave immediately
			if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key === 's') {
				e.preventDefault();
				flushIdle();
				return;
			}

			// Select all: Cmd+A / Ctrl+A — set a canonical whole-document model
			// selection. The browser's native select-all often anchors on the
			// editor root (a node with no [data-block-id] ancestor), so
			// readSelection() returns null and the model keeps its previous
			// collapsed selection — which made a follow-up Backspace delete only
			// one character instead of the whole document. Driving the model
			// selection here (and letting the post-render effect mirror it into
			// the DOM) makes select-all → Backspace delete everything.
			if (
				(e.metaKey || e.ctrlKey) &&
				!e.shiftKey &&
				!e.altKey &&
				e.key.toLowerCase() === 'a'
			) {
				const order = getBlocksInOrder(currentDoc);
				const first = order[0];
				const last = order.at(-1);
				if (first && last) {
					e.preventDefault();
					const wholeDoc = {
						anchor: { blockId: first.id, offset: 0 },
						focus: { blockId: last.id, offset: getTextLength(last.content) },
					};
					setSelection(wholeDoc);
					selectionRef.current = wholeDoc;
				}
				return;
			}

			// Link: Cmd+K on a text selection opens the toolbar's link field.
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				const sel = selectionRef.current;
				const collapsed =
					!sel ||
					(sel.anchor.blockId === sel.focus.blockId &&
						sel.anchor.offset === sel.focus.offset);
				if (!collapsed) {
					e.preventDefault();
					setLinkRequest(n => n + 1);
				}
				return;
			}

			// Find: Cmd+F
			if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
				e.preventDefault();
				setFindReplace({ open: true, showReplace: false });
				return;
			}

			// Find & Replace: Cmd+H
			if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
				e.preventDefault();
				setFindReplace({ open: true, showReplace: true });
				return;
			}

			// Undo/redo (Cmd+Z / Cmd+Shift+Z / Cmd+Y) are handled by the
			// document-level capture listener above — it fires even when a table
			// cell stops propagation or focus has left the editor, which this
			// root-bubble handler cannot. Intentionally not handled here.

			// Delete entire block: Ctrl/Cmd+Backspace or Ctrl/Cmd+Delete
			if ((e.metaKey || e.ctrlKey) && (e.key === 'Backspace' || e.key === 'Delete')) {
				e.preventDefault();
				const currentSel = selectionRef.current;
				if (currentSel && currentDoc.blocks.length > 1) {
					const delResult = deleteBlockOp(currentDoc, currentSel.focus.blockId);
					if (delResult.doc !== currentDoc) {
						apply(delResult);
					}
				}
				return;
			}

			const sel = selectionRef.current;
			if (!sel) return;

			const { result, handled } = handleKeyDown(
				{ doc: currentDoc, selection: sel },
				e.nativeEvent,
			);
			if (handled && result.doc) {
				apply(result);
			}
		},
		[
			readOnly,
			apply,
			onChange,
			slashCommand.active,
			emojiPicker.active,
			mentionPicker.active,
			toolbar.active,
			handleToolbarClose,
			flushIdle,
			clearBlockSelection,
		],
	);

	// ---- Native beforeinput listener ----
	// React 19's onBeforeInput is a polyfilled event that does NOT reliably
	// map to the native `beforeinput` event. We must use a native listener
	// to intercept and preventDefault on text input.
	useEffect(() => {
		const root = rootRef.current;
		if (!root || readOnly) return;

		const onNativeBeforeInput = (e: Event) => {
			if (isComposing.current) return;

			// Skip only when the event target is inside a self-managed nested surface
			// (table cells, list cells, MentionInput). Matching any contentEditable=false
			// ancestor here would drop beforeinput events whose anchor ended up inside a
			// plain mention chip — see the matching narrower selector in
			// handleSelectionChange.
			const target = e.target as HTMLElement;
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
			if (
				target !== root &&
				target.closest?.('[data-list-block], [data-table-block], [data-mention-input]')
			)
				return;

			const sel = selectionRef.current;
			if (!sel) return;

			const inputEvent = e as InputEvent;
			const { result, handled } = handleBeforeInput(
				{ doc: docRef.current, selection: sel },
				inputEvent,
			);
			if (handled && result.doc) {
				apply(result);

				// After applying, check for slash / emoji / mention triggers
				requestAnimationFrame(() => {
					const currentSel = selectionRef.current;
					if (currentSel) {
						updateSlashCommandState(docRef.current, currentSel);
						updateEmojiPickerState(docRef.current, currentSel);
						updateMentionPickerState(docRef.current, currentSel);
					}
				});
			}
		};

		root.addEventListener('beforeinput', onNativeBeforeInput);
		return () => root.removeEventListener('beforeinput', onNativeBeforeInput);
	}, [
		readOnly,
		apply,
		updateSlashCommandState,
		updateEmojiPickerState,
		updateMentionPickerState,
	]);

	const onCompositionStart = useCallback(() => {
		isComposing.current = true;
	}, []);

	const onCompositionEnd = useCallback(
		(e: React.CompositionEvent) => {
			isComposing.current = false;

			// After IME composition ends, the browser has already inserted text
			// We need to read it from the DOM and sync back to our model
			if (!rootRef.current || !selection) return;

			const composedText = e.data;
			if (!composedText) return;

			// Read what the DOM now looks like for this block
			const blockEl = rootRef.current.querySelector(
				`[data-block-id="${selection.focus.blockId}"]`,
			);
			if (!blockEl) return;

			const contentEl = blockEl.querySelector('[data-content]') ?? blockEl;
			const domText = contentEl.textContent ?? '';

			// Replace the block's content with what the DOM has
			const block = findBlock(doc, selection.focus.blockId);
			if (!block) return;

			const currentText = getPlainText(block.content);
			if (domText !== currentText) {
				const newContent: TextSpan[] = domText ? [{ text: domText }] : [];
				const newDoc = updateBlock(doc, selection.focus.blockId, b => ({
					...b,
					content: newContent,
				}));
				setDoc({ ...newDoc, version: newDoc.version + 1 });
				docRef.current = newDoc;
				onChange?.(newDoc);
				resetIdleTimer();
			}
		},
		[doc, selection, onChange, resetIdleTimer],
	);

	// Whole-block copy/cut for the rectangle (block-selection) mode is driven
	// from onKeyDown — native clipboard events don't fire there (no DOM range).
	// These handlers cover the text-range selection: a selection that crosses
	// multiple top-level blocks copies the whole blocks (so paste reconstructs
	// them, matching the rectangle selection); a within-one-block selection
	// stays a text copy so inline formatting still round-trips.
	const onCopy = useCallback((e: React.ClipboardEvent) => {
		const sel = selectionRef.current;
		if (!sel) return;
		const span = multiBlockTextSpan(docRef.current, sel.anchor.blockId, sel.focus.blockId);
		if (span) {
			e.preventDefault();
			const text = copyBlocksToClipboard(span);
			e.nativeEvent.clipboardData?.setData('text/plain', text);
			return;
		}
		handleCopy(docRef.current, sel, e.nativeEvent);
	}, []);

	const onCut = useCallback(
		(e: React.ClipboardEvent) => {
			const sel = selectionRef.current;
			if (readOnly || !sel) return;
			const span = multiBlockTextSpan(docRef.current, sel.anchor.blockId, sel.focus.blockId);
			if (span) {
				e.preventDefault();
				const text = copyBlocksToClipboard(span);
				e.nativeEvent.clipboardData?.setData('text/plain', text);
				apply(
					deleteBlocksOp(
						docRef.current,
						span.map(b => b.id),
					),
				);
				return;
			}
			const result = handleCut(docRef.current, sel, e.nativeEvent);
			if (result) apply(result);
		},
		[readOnly, apply],
	);

	const onPaste = useCallback(
		(e: React.ClipboardEvent) => {
			if (readOnly) return;
			// Paste over an active whole-block selection is handled in onKeyDown
			// (no DOM range fires a native paste event in that mode).
			const sel = selectionRef.current;
			if (!sel) return;

			// Whole-block paste at a caret: when the system clipboard still holds
			// exactly what our block copy/cut wrote, reinsert the full-fidelity
			// in-memory snapshot instead of re-parsing markdown — preserves todo
			// state, callouts, tables, images, and nested children. If an external
			// copy has since replaced the clipboard, the text won't match and we
			// fall through to the normal text/markdown paste below.
			// Normalize CRLF — some platforms rewrite newlines on the clipboard
			// roundtrip, which would otherwise defeat the exact-match.
			const plainForBlocks = (e.clipboardData?.getData('text/plain') ?? '').replace(
				/\r\n/g,
				'\n',
			);
			if (
				blockMenuClipboard &&
				blockMenuClipboard.length > 0 &&
				blockMenuClipboardText !== null &&
				plainForBlocks.length > 0 &&
				plainForBlocks === blockMenuClipboardText
			) {
				e.preventDefault();
				const clones = blockMenuClipboard.map(cloneBlockWithFreshIds);
				const span = multiBlockTextSpan(
					docRef.current,
					sel.anchor.blockId,
					sel.focus.blockId,
				);
				if (span) {
					// Pasting over a multi-block text selection replaces those blocks.
					apply(
						replaceBlocksOp(
							docRef.current,
							span.map(b => b.id),
							clones,
						),
					);
				} else {
					apply(insertBlocksAfterOp(docRef.current, sel.focus.blockId, clones));
				}
				return;
			}

			// Check for pasted image files (screenshot paste, copy-paste from other apps)
			const items = e.clipboardData?.items;
			if (items) {
				for (const item of items) {
					if (item.type.startsWith('image/')) {
						e.preventDefault();
						const file = item.getAsFile();
						if (!file) return;

						// Place an image block. If the caret sits in an empty
						// paragraph (e.g. a fresh blank line), replace it in place so
						// we don't leave a stray empty block above the image;
						// otherwise insert after the current block.
						const currentBlockId = sel.focus.blockId;
						const currentBlock = findBlock(docRef.current, currentBlockId);
						const replaceInPlace =
							!!currentBlock &&
							currentBlock.type === 'paragraph' &&
							currentBlock.children.length === 0 &&
							getTextLength(currentBlock.content) === 0;
						const imgBlock = createBlock('image');
						const newDoc = replaceInPlace
							? updateBlock(docRef.current, currentBlockId, () => imgBlock)
							: insertBlockAfter(docRef.current, currentBlockId, imgBlock);
						setDoc(newDoc);
						docRef.current = newDoc;
						onChange?.(newDoc);

						// Read the file and dispatch the upload event
						const reader = new FileReader();
						reader.onload = () => {
							globalThis.dispatchEvent(
								new CustomEvent('mde-image-upload', {
									detail: {
										blockId: imgBlock.id,
										dataUrl: reader.result as string,
										fileName: file.name || 'pasted-image',
										file,
									},
								}),
							);
						};
						reader.readAsDataURL(file);
						return;
					}
				}
			}

			const result = handlePaste(docRef.current, sel, e.nativeEvent);
			if (!result) return;
			apply(result);
		},
		[readOnly, apply, onChange],
	);

	// ---- Image files dropped from the desktop ----
	// Each picture becomes an image block after the block it was dropped on and
	// goes through the same upload as a pasted one. Returns false when the drop
	// carried no picture, so the caller can leave the event alone.
	const dropImageFiles = useCallback(
		(e: React.DragEvent): boolean => {
			if (readOnly) return false;
			const files = Array.from(e.dataTransfer?.files ?? []).filter(f =>
				f.type.startsWith('image/'),
			);
			if (!files.length) return false;
			e.preventDefault();
			let doc = docRef.current;
			const under = (e.target as HTMLElement | null)?.closest?.(
				'[data-block-id]',
			) as HTMLElement | null;
			let anchorId =
				under?.dataset.blockId && findBlock(doc, under.dataset.blockId)
					? under.dataset.blockId
					: doc.blocks[doc.blocks.length - 1]?.id;
			if (!anchorId) return false;
			const placed: { blockId: string; file: File }[] = [];
			for (const file of files) {
				const imgBlock = createBlock('image');
				doc = insertBlockAfter(doc, anchorId, imgBlock);
				anchorId = imgBlock.id;
				placed.push({ blockId: imgBlock.id, file });
			}
			setDoc(doc);
			docRef.current = doc;
			onChange?.(doc);
			for (const { blockId, file } of placed) {
				const reader = new FileReader();
				reader.onload = () => {
					globalThis.dispatchEvent(
						new CustomEvent('mde-image-upload', {
							detail: {
								blockId,
								dataUrl: reader.result as string,
								fileName: file.name || 'dropped-image',
								file,
							},
						}),
					);
				};
				reader.readAsDataURL(file);
			}
			return true;
		},
		[readOnly, onChange],
	);

	const onEditorBlur = useCallback(() => {
		historyRef.current.flushSeal(); // persist the final edit before losing focus
		onBlur?.(docRef.current);
	}, [onBlur]);

	// ---- Checkbox toggle ----
	// Routes through setBlockPropsOp so toggling a todo lands in undo history
	// (previously a direct updateBlock write that Cmd+Z could not reverse).
	const onToggleTodo = useCallback(
		(blockId: string) => {
			const block = findBlock(docRef.current, blockId);
			if (!block) return;
			apply(
				setBlockPropsOp(docRef.current, blockId, {
					...block.props,
					checked: !block.props.checked,
				}),
			);
		},
		[apply],
	);

	// ---- Toggle collapse ----
	const onToggleCollapse = useCallback(
		(blockId: string) => {
			const block = findBlock(docRef.current, blockId);
			if (!block) return;
			apply(
				setBlockPropsOp(docRef.current, blockId, {
					...block.props,
					collapsed: !block.props.collapsed,
				}),
			);
		},
		[apply],
	);

	// ---- Click on editor background → focus last block ----
	const onRootClick = useCallback(
		(e: React.MouseEvent) => {
			if (e.target !== rootRef.current) return;
			const lastBlock = doc.blocks.at(-1);
			if (!lastBlock) return;
			const offset = getTextLength(lastBlock.content);
			setSelection({
				anchor: { blockId: lastBlock.id, offset },
				focus: { blockId: lastBlock.id, offset },
			});
			rootRef.current?.focus();
		},
		[doc],
	);

	// ---- Track tapped block for the coarse-pointer DragHandle ----
	// selectionchange doesn't fire when tapping inside contentEditable=false
	// subtrees (image, table), so the handle would stay on the previous
	// text block. Capture pointerdown anywhere inside the editor and update
	// the active block from the closest [data-block-id] ancestor.
	const onEditorPointerDown = useCallback((e: React.PointerEvent) => {
		const target = e.target as HTMLElement | null;
		const blockEl = target?.closest?.('[data-block-id]') as HTMLElement | null;
		if (!blockEl) return;
		const id = blockEl.dataset.blockId;
		if (id) setActiveBlockId(id);
	}, []);

	// ---- Imperative handle ----
	useImperativeHandle(
		ref,
		() => ({
			focus: (target?: EditorSelection) => {
				// Resolve which selection to apply. If the caller passed a target
				// referencing a block that still exists in the current doc, use it
				// verbatim (preserves cursor across remounts). Otherwise fall back
				// to the start of the first block so the next keystroke is
				// captured by beforeinput (which no-ops without a selection).
				const blocks = docRef.current.blocks;
				const hasBlock = (id: string) =>
					blocks.some(b => b.id === id) ||
					// children may also host the caret (lists, tables); check those.
					blocks.some(b => (b.children ?? []).some(c => c.id === id));
				let sel: EditorSelection | null = null;
				if (target && hasBlock(target.anchor.blockId) && hasBlock(target.focus.blockId)) {
					sel = target;
				} else {
					const first = blocks[0];
					if (first) {
						sel = {
							anchor: { blockId: first.id, offset: 0 },
							focus: { blockId: first.id, offset: 0 },
						};
					}
				}
				if (!rootRef.current) return;
				if (!sel) {
					rootRef.current.focus();
					return;
				}
				setSelection(sel);
				selectionRef.current = sel;
				// Apply the caret synchronously. Without this, the browser's
				// default contentEditable focus parks the caret at offset 0, and
				// the resulting selectionchange clobbers `selection` back to 0,0
				// before the [selection, doc.version] useEffect can run
				// writeSelection. The isWritingSelection guard suppresses the
				// selectionchange handler so it doesn't fight us.
				isWritingSelection.current = true;
				rootRef.current.focus();
				writeSelection(rootRef.current, sel);
				isWritingSelection.current = false;
			},
			getSelection: () => selectionRef.current,
			getDocument: () => docRef.current,
			setDocument: (newDoc: EditorDocument) => {
				const normalized = normalizeDocument(newDoc);
				// Force the version forward relative to the current doc. The caret
				// is re-applied by the `[selection, doc.version]` effect, which only
				// runs when one of those changes — but refetched docs come back with
				// a hardcoded version (blockRowsToDocument uses 1), so a host that
				// replaces the doc on autosave/remote-sync would otherwise leave
				// version unchanged, skip the effect, and drop the caret when the
				// DOM nodes are swapped. The selection state itself is left intact
				// (its block id round-trips), so bumping the version is enough to
				// restore the cursor in place.
				const bumped: EditorDocument = {
					...normalized,
					version: docRef.current.version + 1,
				};
				setDoc(bumped);
				docRef.current = bumped;
				historyRef.current.clear();
			},
			insertBlock: (type: BlockType, afterBlockId?: string) => {
				const block = createBlock(type);
				const afterId = afterBlockId ?? doc.blocks.at(-1)?.id ?? null;
				const newDoc = insertBlockAfter(doc, afterId, block);
				setDoc(newDoc);
				docRef.current = newDoc;
				setSelection({
					anchor: { blockId: block.id, offset: 0 },
					focus: { blockId: block.id, offset: 0 },
				});
			},
			applyExternalUndo: (tx: Transaction) => {
				const { doc: newDoc, selection } = applyTransactionInverse(docRef.current, tx);
				setDoc(newDoc);
				docRef.current = newDoc;
				if (selection) {
					setSelection(selection);
					selectionRef.current = selection;
				}
				onChange?.(newDoc);
			},
			applyExternalRedo: (tx: Transaction) => {
				const { doc: newDoc, selection } = applyTransactionForward(docRef.current, tx);
				setDoc(newDoc);
				docRef.current = newDoc;
				if (selection) {
					setSelection(selection);
					selectionRef.current = selection;
				}
				onChange?.(newDoc);
			},
		}),
		[doc, onChange],
	);

	// ---- Check if document is empty (for placeholder) ----
	const firstBlock = doc.blocks[0];
	const isEmpty =
		doc.blocks.length === 1 &&
		firstBlock?.type === 'paragraph' &&
		getPlainText(firstBlock.content) === '';

	// Toggle data-empty on the editor root for CSS-based placeholder.
	// Using useEffect + DOM attribute so the placeholder hides instantly
	// on browser input, not waiting for React re-render.
	const placeholderRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const root = rootRef.current;
		if (!root || readOnly) return;

		const update = () => {
			const textContent = root.textContent?.replace(/\u200B/g, '').trim() ?? '';
			// Only show placeholder if editor is truly empty (single empty paragraph)
			// Don't show if there are non-paragraph blocks (divider, image, table, etc.)
			const hasNonTextBlocks = docRef.current.blocks.some(b => b.type !== 'paragraph');
			const show = textContent.length === 0 && !hasNonTextBlocks;
			if (placeholderRef.current) {
				placeholderRef.current.style.display = show ? '' : 'none';
			}
		};

		update(); // Initial check

		root.addEventListener('input', update);
		return () => root.removeEventListener('input', update);
	}, [readOnly, doc]);

	// ---- Listen for table cell updates ----
	useEffect(() => {
		const handleTableUpdate = (e: Event) => {
			const detail = (e as CustomEvent).detail;
			const block = findBlock(docRef.current, detail.blockId);
			if (!block) return;
			const props: BlockProps = { ...block.props, tableData: detail.tableData };
			// Persist all table metadata fields
			for (const key of [
				'cellMeta',
				'columnAlignments',
				'columnWidths',
				'merges',
				'showBorders',
				'compact',
				'colorTemplate',
			]) {
				if (detail[key] !== undefined) (props as any)[key] = detail[key];
			}
			apply(setBlockPropsOp(docRef.current, detail.blockId, props));
		};
		globalThis.addEventListener('mde-table-update', handleTableUpdate);
		return () => globalThis.removeEventListener('mde-table-update', handleTableUpdate);
	}, [apply]);

	// ---- Column-gutter drag → write props.widths ----
	// The gutter dispatches a stream of `mde-column-resize-preview` events
	// during the drag and a final `mde-column-resize-commit` on release.
	// We persist the preview into doc so widths are live; the commit triggers
	// a single history transaction via setColumnWidthsOp.
	const previewWidthsRef = useRef<Record<string, number[]>>({});
	useEffect(() => {
		const onPreview = (e: Event) => {
			const { columnsBlockId, widths } = (
				e as CustomEvent<{ columnsBlockId: string; widths: number[] }>
			).detail;
			if (!findBlock(docRef.current, columnsBlockId)) return;
			previewWidthsRef.current[columnsBlockId] = widths;
			const sanitized = sanitizeWidths(widths, widths.length);
			const newDoc = updateBlock(docRef.current, columnsBlockId, b => ({
				...b,
				props: { ...b.props, widths: sanitized },
			}));
			setDoc({ ...newDoc, version: newDoc.version + 1 });
			docRef.current = newDoc;
		};
		const onCommit = (e: Event) => {
			const { columnsBlockId } = (e as CustomEvent<{ columnsBlockId: string }>).detail;
			const widths = previewWidthsRef.current[columnsBlockId];
			delete previewWidthsRef.current[columnsBlockId];
			if (!widths) return;
			const result = setColumnWidthsOp(docRef.current, columnsBlockId, widths);
			if (result.doc !== docRef.current) apply(result);
		};
		globalThis.addEventListener('mde-column-resize-preview', onPreview);
		globalThis.addEventListener('mde-column-resize-commit', onCommit);
		return () => {
			globalThis.removeEventListener('mde-column-resize-preview', onPreview);
			globalThis.removeEventListener('mde-column-resize-commit', onCommit);
		};
	}, [apply]);

	// ---- Column-gutter add/delete buttons ----
	// The hover UI on `ColumnGutter` fires these events. `gutterIndex` is the
	// index of the column to the gutter's left; for delete, `side` picks
	// which adjacent column to remove. Both + buttons insert a new empty
	// column AT the gutter position (between the two adjacent cols) — the
	// left/right pairing is purely visual symmetry with the trash buttons.
	useEffect(() => {
		const onAdd = (e: Event) => {
			const detail = (
				e as CustomEvent<{
					columnsBlockId: string;
					gutterIndex: number;
				}>
			).detail;
			if (!detail) return;
			const empty = createBlock('paragraph');
			const result = addAdjacentColumnOp(
				docRef.current,
				detail.columnsBlockId,
				detail.gutterIndex,
				empty,
				'right',
			);
			if (result.doc !== docRef.current) apply(result);
		};
		const onDelete = (e: Event) => {
			const detail = (
				e as CustomEvent<{
					columnsBlockId: string;
					gutterIndex: number;
					side: 'left' | 'right';
				}>
			).detail;
			if (!detail) return;
			const columnsBlock = findBlock(docRef.current, detail.columnsBlockId);
			if (!columnsBlock || columnsBlock.type !== 'columns') return;
			const targetIndex =
				detail.side === 'left' ? detail.gutterIndex : detail.gutterIndex + 1;
			const targetColumn = columnsBlock.children[targetIndex];
			if (!targetColumn) return;
			const result = deleteBlockOp(docRef.current, targetColumn.id);
			if (result.doc !== docRef.current) apply(result);
		};
		globalThis.addEventListener('mde-column-add', onAdd);
		globalThis.addEventListener('mde-column-delete', onDelete);
		return () => {
			globalThis.removeEventListener('mde-column-add', onAdd);
			globalThis.removeEventListener('mde-column-delete', onDelete);
		};
	}, [apply]);

	// Toggle a block's in-flight upload flag. Stable so the upload effect
	// doesn't re-subscribe; collapses back to the shared empty set so the
	// common nothing-uploading case stays referentially stable.
	const markImageUploading = useCallback((blockId: string, uploading: boolean) => {
		setUploadingImageBlocks(prev => {
			if (uploading === prev.has(blockId)) return prev;
			const next = new Set(prev);
			if (uploading) next.add(blockId);
			else next.delete(blockId);
			return next.size === 0 ? EMPTY_IMAGE_UPLOADING : next;
		});
	}, []);

	// ---- Listen for image upload events ----
	useEffect(() => {
		const writeSrc = (blockId: string, src: string, fileName: string) => {
			const newDoc = updateBlock(docRef.current, blockId, b => ({
				...b,
				props: { ...b.props, src, alt: fileName ?? '' },
			}));
			setDoc(newDoc);
			docRef.current = newDoc;
			return newDoc;
		};

		const handleImageUpload = async (e: Event) => {
			const { blockId, dataUrl, fileName, file } = (e as CustomEvent).detail;
			// The event is window-wide; only the editor holding the block acts.
			if (!findBlock(docRef.current, blockId)) return;

			// URL embed, or a host that doesn't provide an upload handler: the
			// data URL / remote URL is the final src — write and persist it.
			if (!onImageUpload || !file) {
				onChange?.(writeSrc(blockId, dataUrl, fileName));
				return;
			}

			// Host upload in flight. Show the local data-URL preview immediately
			// and flag the block as uploading so ImageBlock paints a loading
			// overlay. Don't call onChange yet — the base64 preview is large and
			// only meant to bridge the upload; just the resolved durable URL
			// gets persisted below.
			markImageUploading(blockId, true);
			writeSrc(blockId, dataUrl, fileName);

			let src: string;
			try {
				src = await onImageUpload(file);
			} catch (err) {
				// Never persist the base64 preview: it would bloat the stored
				// markdown. The block falls back to its empty upload state.
				console.warn('Image upload failed', err);
				src = '';
			} finally {
				markImageUploading(blockId, false);
			}

			onChange?.(writeSrc(blockId, src, fileName));
		};
		globalThis.addEventListener('mde-image-upload', handleImageUpload);
		return () => globalThis.removeEventListener('mde-image-upload', handleImageUpload);
	}, [onChange, onImageUpload, markImageUploading]);

	// ---- Listen for image property updates (resize, alt text, etc.) ----
	useEffect(() => {
		const handleImageUpdate = (e: Event) => {
			const detail = (e as CustomEvent).detail;
			const block = findBlock(docRef.current, detail.blockId);
			if (!block) return;
			const props: BlockProps = { ...block.props };
			for (const key of [
				'width',
				'height',
				'alt',
				'caption',
				'inline',
				'cropX',
				'cropY',
				'cropW',
				'cropH',
				'layout',
			]) {
				if (detail[key] !== undefined) (props as any)[key] = detail[key];
			}
			apply(setBlockPropsOp(docRef.current, detail.blockId, props));
		};
		globalThis.addEventListener('mde-image-update', handleImageUpdate);
		return () => globalThis.removeEventListener('mde-image-update', handleImageUpdate);
	}, [apply]);

	// ---- Listen for block prop updates ----
	// Blocks commit their own props by
	// dispatching a typed window event with `{blockId, ...props}`. The
	// listener writes the named keys into the block's props slot. The
	// allowlist per event is conservative — anything else gets dropped.
	useEffect(() => {
		const allowed: Record<string, readonly string[]> = {
			'mde-tabs-update': ['tabTheme', 'activeTab'],
			// Block-level background — host's bg picker (color swatch or image
			// upload) dispatches this after the user picks. Color clears when
			// explicitly null; image clears the same way.
			'mde-block-bg-update': ['bgColor', 'bgImage', 'bgFit', 'bgPosition'],
			// Per-block text/highlight color from slash-menu color entries.
			'mde-block-color-update': ['blockTextColor', 'blockHighlightColor'],
			// Per-block font family from the block menu's Font submenu.
			'mde-block-font-update': ['fontFamily'],
			// Table-of-contents block: heading depth + visual design, set from the
			// block's hover controls (see TocBlock/TocControls).
			'mde-toc-update': ['tocLevels', 'tocVariant'],
		};
		const handler = (event: string) => (e: Event) => {
			const detail = (e as CustomEvent).detail as Record<string, unknown> | undefined;
			if (!detail || typeof detail.blockId !== 'string') return;
			const keys = allowed[event];
			const blockId = detail.blockId as string;
			const block = findBlock(docRef.current, blockId);
			if (!block) return;
			const props = { ...block.props } as Record<string, unknown>;
			for (const k of keys) {
				if (detail[k] !== undefined) props[k] = detail[k];
			}
			apply(setBlockPropsOp(docRef.current, blockId, props as BlockProps));
		};
		const wired: Array<[string, (e: Event) => void]> = Object.keys(allowed).map(evt => {
			const h = handler(evt);
			globalThis.addEventListener(evt, h);
			return [evt, h];
		});
		return () => {
			for (const [evt, h] of wired) globalThis.removeEventListener(evt, h);
		};
	}, [apply]);

	// ---- Toggle heading empty-state "add child" click ----
	// Empty toggle headings render a clickable hint; clicking it appends
	// an empty paragraph child and (lazily, via the focus effect that
	// already exists for new blocks) puts the caret there.
	useEffect(() => {
		const handler = (e: Event) => {
			const detail = (e as CustomEvent).detail as { blockId?: string } | undefined;
			if (!detail || typeof detail.blockId !== 'string') return;
			const targetId = detail.blockId;
			const block = findBlock(docRef.current, targetId);
			if (!block || block.children.length > 0) return;
			const child = createBlock('paragraph');
			apply(setChildrenOp(docRef.current, targetId, [...block.children, child]));
			setSelection({
				anchor: { blockId: child.id, offset: 0 },
				focus: { blockId: child.id, offset: 0 },
			});
		};
		globalThis.addEventListener('mde-toggle-add-child', handler);
		return () => globalThis.removeEventListener('mde-toggle-add-child', handler);
	}, [apply]);

	// ---- Tab strip actions (add / delete / rename) ----
	// The TabsBlock renderer fires `mde-tab-action` events because it
	// doesn't own the doc tree. We mutate children here so the active
	// index, child list, and tab labels round-trip through the editor's
	// normal change pipeline.
	useEffect(() => {
		const handler = (e: Event) => {
			const detail = (e as CustomEvent).detail as
				| { tabsBlockId?: string; action?: string; tabId?: string; label?: string }
				| undefined;
			if (!detail || typeof detail.tabsBlockId !== 'string') return;
			const tabsId = detail.tabsBlockId;
			const tabsBlock = findBlock(docRef.current, tabsId);
			if (!tabsBlock) return;
			let newChildren: Block[] | null = null;
			if (detail.action === 'add') {
				const idx = tabsBlock.children.length + 1;
				const newTab: Block = {
					id: generateId(),
					type: 'tab',
					content: [{ text: `Tab ${idx}` }],
					children: [createBlock('paragraph')],
					props: {},
				};
				newChildren = [...tabsBlock.children, newTab];
			} else if (detail.action === 'delete' && detail.tabId) {
				if (tabsBlock.children.length <= 1) return;
				newChildren = tabsBlock.children.filter(c => c.id !== detail.tabId);
			} else if (
				detail.action === 'rename' &&
				detail.tabId &&
				typeof detail.label === 'string'
			) {
				const label = detail.label;
				newChildren = tabsBlock.children.map(c =>
					c.id === detail.tabId
						? {
								...c,
								content: [{ text: label }],
								props: { ...c.props, tabLabel: label },
							}
						: c,
				);
			}
			if (!newChildren) return;
			apply(setChildrenOp(docRef.current, tabsId, newChildren));
		};
		globalThis.addEventListener('mde-tab-action', handler);
		return () => globalThis.removeEventListener('mde-tab-action', handler);
	}, [apply]);

	// ---- Listen for custom image browse events ----
	useEffect(() => {
		if (!onImageBrowse) return;
		const handleBrowse = async (e: Event) => {
			e.preventDefault(); // Signal to ImageBlock that we handled it
			const { blockId } = (e as CustomEvent).detail;
			try {
				const url = await onImageBrowse();
				if (url) {
					const block = findBlock(docRef.current, blockId);
					if (!block) return;
					apply(setBlockPropsOp(docRef.current, blockId, { ...block.props, src: url }));
				}
			} catch {
				// User cancelled or browse failed — do nothing
			}
		};
		globalThis.addEventListener('mde-image-browse', handleBrowse);
		return () => globalThis.removeEventListener('mde-image-browse', handleBrowse);
	}, [apply, onImageBrowse]);

	// ---- Block environment (shared with nested column children) ----
	const blockEnv = useMemo<EditorBlockEnvironment>(
		() => ({
			readOnly,
			printMode,
			draggingBlockId: dragState.draggingBlockId,
			dropTarget: dragState.dropTarget,
			onToggleTodo,
			onToggleCollapse,
			onDragStart: handleDragStart,
		}),
		[
			readOnly,
			printMode,
			dragState.draggingBlockId,
			dragState.dropTarget,
			onToggleTodo,
			onToggleCollapse,
			handleDragStart,
		],
	);

	// ---- Host-provided callbacks surfaced to specific block types ----
	const hostCallbacks = useMemo<EditorHostCallbacks>(
		() => ({ fonts, onImageUpload }),
		[fonts, onImageUpload],
	);

	// ---- Render ----
	const tree = (
		<CustomColorsProvider value={customColors}>
			<div
				className={`mde-editor-container${printMode ? ' mde-print' : ''} ${className ?? ''}`}
				style={{ position: 'relative' }}
				onDragOver={e => {
					const draggingId = dragState.draggingBlockId;
					if (!draggingId) {
						// A file from the desktop: allow the drop so pictures can land.
						if (!readOnly && Array.from(e.dataTransfer.types ?? []).includes('Files')) {
							e.preventDefault();
							e.dataTransfer.dropEffect = 'copy';
						}
						return;
					}
					e.preventDefault();
					e.dataTransfer.dropEffect = 'move';
					const editorEl = rootRef.current;
					if (!editorEl) return;
					const target = computeDropTarget(editorEl, e.clientX, e.clientY, draggingId);
					if (!target) {
						if (dragState.dropTarget)
							setDragState(prev => ({ ...prev, dropTarget: null }));
						return;
					}
					const cur = dragState.dropTarget;
					if (!cur || cur.blockId !== target.blockId || cur.edge !== target.edge) {
						setDragState(prev => ({ ...prev, dropTarget: target }));
					}
				}}
				onDrop={e => {
					const draggingId = dragState.draggingBlockId;
					if (!draggingId) {
						dropImageFiles(e);
						return;
					}
					e.preventDefault();
					const target = dragState.dropTarget;
					if (target) {
						const result = resolveDropAction(docRef.current, draggingId, target);
						if (result && result.doc !== docRef.current) apply(result);
					}
					setDragState({ draggingBlockId: null, dropTarget: null });
				}}
				onDragEnd={() => setDragState({ draggingBlockId: null, dropTarget: null })}
			>
				{/* The contentEditable editor area */}
				<div
					ref={rootRef}
					className="mde-editor"
					style={{
						position: 'relative',
						minHeight: 200,
						outline: 'none',
						fontFamily: defaultFontFamily || undefined,
					}}
					contentEditable={!readOnly}
					suppressContentEditableWarning
					tabIndex={0}
					role="textbox"
					aria-multiline="true"
					aria-placeholder={resolvedPlaceholder}
					onKeyDown={onKeyDown}
					onCompositionStart={onCompositionStart}
					onCompositionEnd={onCompositionEnd}
					onCopy={onCopy}
					onCut={onCut}
					onPaste={onPaste}
					onBlur={onEditorBlur}
					onClick={onRootClick}
					onPointerDown={onEditorPointerDown}
					spellCheck
				>
					<EditorDocContext.Provider value={doc}>
						<BlockSelectionContext.Provider value={selectedBlockSet}>
							<ImageUploadingContext.Provider value={uploadingImageBlocks}>
								<EditorHostCallbacksContext.Provider value={hostCallbacks}>
									<EditorBlockEnvContext.Provider value={blockEnv}>
										<BlockChildrenProvider>
											{!hideHeadingRail && <HeadingRail />}
											{renderBlockList(doc.blocks)}
										</BlockChildrenProvider>
									</EditorBlockEnvContext.Provider>
								</EditorHostCallbacksContext.Provider>
							</ImageUploadingContext.Provider>
						</BlockSelectionContext.Provider>
					</EditorDocContext.Provider>
					{/* Trailing click-to-add affordance. Always shown (when not readOnly)
              so the user can start a new paragraph at the end without reaching
              for the "+" button — especially after non-text blocks like image,
              table, divider, etc. */}
					{!readOnly &&
						!isEmpty &&
						(() => {
							const last = doc.blocks.at(-1);
							if (!last) return null;
							return (
								<div
									contentEditable={false}
									suppressContentEditableWarning
									className="mde-trailing-placeholder"
									aria-hidden="true"
									onMouseDown={e => {
										e.preventDefault();
										const block = createBlock('paragraph');
										const newDoc = insertBlockAfter(
											docRef.current,
											last.id,
											block,
										);
										setDoc(newDoc);
										docRef.current = newDoc;
										const newSel: EditorSelection = {
											anchor: { blockId: block.id, offset: 0 },
											focus: { blockId: block.id, offset: 0 },
										};
										setSelection(newSel);
										selectionRef.current = newSel;
										onChange?.(newDoc);
										requestAnimationFrame(() => rootRef.current?.focus());
									}}
								/>
							);
						})()}
				</div>

				{/* Placeholder — outside contentEditable, visibility toggled via DOM input event */}
				{!readOnly && (
					<div
						ref={placeholderRef}
						className="mde-placeholder"
						style={{ display: isEmpty ? '' : 'none' }}
						aria-hidden="true"
					>
						{resolvedPlaceholder}
					</div>
				)}

				{/* Drag handle — plus button + grip (click for menu, drag to reorder).
            Coarse pointer (touch) anchors to the focused block instead of hover,
            uses pointer-based drag, and opens the slash palette on "+" tap. */}
				{!readOnly && (
					<DragHandle
						editorRef={rootRef}
						isCoarse={isCoarse}
						selectionBlockId={activeBlockId ?? selection?.focus.blockId ?? null}
						onDragStart={handleDragStart}
						onAddBlock={afterBlockId => {
							const block = createBlock('paragraph');
							const newDoc = insertBlockAfter(docRef.current, afterBlockId, block);
							setDoc(newDoc);
							docRef.current = newDoc;
							setSelection({
								anchor: { blockId: block.id, offset: 0 },
								focus: { blockId: block.id, offset: 0 },
							});
							selectionRef.current = {
								anchor: { blockId: block.id, offset: 0 },
								focus: { blockId: block.id, offset: 0 },
							};
							onChange?.(newDoc);
							requestAnimationFrame(() => rootRef.current?.focus());
						}}
						onAddBlockSlash={afterBlockId => {
							// Insert empty paragraph, then open the slash palette anchored to
							// it so the user can pick a block type without typing "/".
							const block = createBlock('paragraph');
							const newDoc = insertBlockAfter(docRef.current, afterBlockId, block);
							setDoc(newDoc);
							docRef.current = newDoc;
							const newSel: EditorSelection = {
								anchor: { blockId: block.id, offset: 0 },
								focus: { blockId: block.id, offset: 0 },
							};
							setSelection(newSel);
							selectionRef.current = newSel;
							onChange?.(newDoc);
							requestAnimationFrame(() => {
								rootRef.current?.focus();
								const blockEl = rootRef.current?.querySelector(
									`[data-block-id="${block.id}"]`,
								) as HTMLElement | null;
								if (blockEl) {
									const rect = blockEl.getBoundingClientRect();
									setSlashCommand({
										active: true,
										blockId: block.id,
										filter: '',
										position: { x: rect.left, y: rect.bottom + 4 },
									});
								}
							});
						}}
						onPointerDragMove={(blockId, clientY) => {
							if (!rootRef.current) return;
							// Touch drag uses the same Y-only midpoint heuristic but renders
							// an "above" drop indicator on the nearest top-level block.
							const targetIdx = computeDropTargetIndex(
								rootRef.current,
								docRef.current.blocks.length,
								clientY,
							);
							const targetBlock = docRef.current.blocks[targetIdx];
							if (!targetBlock || targetBlock.id === blockId) {
								setDragState({ draggingBlockId: blockId, dropTarget: null });
								return;
							}
							setDragState({
								draggingBlockId: blockId,
								dropTarget: { blockId: targetBlock.id, edge: 'above' },
							});
						}}
						onPointerDragEnd={(blockId, clientY, committed) => {
							if (!committed) {
								setDragState({ draggingBlockId: null, dropTarget: null });
								return;
							}
							if (rootRef.current) {
								const targetIdx = computeDropTargetIndex(
									rootRef.current,
									docRef.current.blocks.length,
									clientY,
								);
								const targetBlock = docRef.current.blocks[targetIdx];
								if (targetBlock && targetBlock.id !== blockId) {
									const result = resolveDropAction(docRef.current, blockId, {
										blockId: targetBlock.id,
										edge: 'above',
									});
									if (result && result.doc !== docRef.current) apply(result);
								}
							}
							setDragState({ draggingBlockId: null, dropTarget: null });
						}}
						onOpenMenu={(blockId, position) => {
							setBlockMenu({ open: true, blockId, position });
						}}
					/>
				)}

				{/* Block context menu */}
				{blockMenu.open && (
					<BlockMenu
						position={blockMenu.position}
						blockId={blockMenu.blockId}
						blockType={
							(findBlock(docRef.current, blockMenu.blockId)?.type ??
								'paragraph') as any
						}
						allowedTypes={allowedBlockTypes}
						onClose={() =>
							setBlockMenu({ open: false, blockId: '', position: { x: 0, y: 0 } })
						}
						onDelete={id => {
							const ids = selectedBlockIdsRef.current;
							if (ids.length > 1 && ids.includes(id)) {
								// Bulk delete the whole block selection in one undo step.
								apply(deleteBlocksOp(docRef.current, ids));
							} else if (docRef.current.blocks.length > 1) {
								const result = deleteBlockOp(docRef.current, id);
								if (result.doc !== docRef.current) apply(result);
							}
							setBlockMenu({ open: false, blockId: '', position: { x: 0, y: 0 } });
						}}
						onDuplicate={id => {
							const ids = selectedBlockIdsRef.current;
							if (ids.length > 1 && ids.includes(id)) {
								// Duplicate the whole block selection (clones inserted after
								// the last selected block) in one undo step.
								apply(duplicateBlocksOp(docRef.current, ids));
							} else {
								const block = findBlock(docRef.current, id);
								if (block) {
									// Deep-clone with fresh IDs all the way down — the shallow
									// children copy would otherwise leave duplicate IDs in the
									// tree (catastrophic for columns: edits/deletes hit both
									// copies). Single path keeps nested-block support that the
									// top-level-only bulk op doesn't cover.
									const dup = cloneBlockWithFreshIds(block);
									const newDoc = insertBlockAfter(docRef.current, id, dup);
									setDoc(newDoc);
									docRef.current = newDoc;
									onChange?.(newDoc);
								}
							}
							setBlockMenu({ open: false, blockId: '', position: { x: 0, y: 0 } });
						}}
						onCopy={id => {
							// Deep-snapshot now (not by reference) so future edits to the
							// source don't mutate the clipboard. A multi-block selection
							// copies every selected top-level block in document order. Also
							// mirrors a markdown rendering to the system clipboard (and sets
							// the paste marker so a later Cmd+V reinserts the full-fidelity
							// blocks).
							const sources = blockMenuSources(
								docRef.current,
								selectedBlockIdsRef.current,
								id,
							);
							if (sources.length > 0) {
								const text = copyBlocksToClipboard(sources);
								try {
									void navigator.clipboard?.writeText(text);
								} catch {
									/* denied — ignore */
								}
							}
							setBlockMenu({ open: false, blockId: '', position: { x: 0, y: 0 } });
						}}
						onCut={id => {
							const ids = selectedBlockIdsRef.current;
							const isBulk = ids.length > 1 && ids.includes(id);
							const sources = blockMenuSources(docRef.current, ids, id);
							if (sources.length > 0) {
								const text = copyBlocksToClipboard(sources);
								try {
									void navigator.clipboard?.writeText(text);
								} catch {
									/* denied — ignore */
								}
								if (isBulk) {
									apply(deleteBlocksOp(docRef.current, ids));
								} else {
									const result = deleteBlockOp(docRef.current, id);
									if (result.doc !== docRef.current) apply(result);
								}
							}
							setBlockMenu({ open: false, blockId: '', position: { x: 0, y: 0 } });
						}}
						onPaste={id => {
							if (blockMenuClipboard && blockMenuClipboard.length > 0) {
								// Re-id on paste so repeated pastes don't share ids; insert the
								// run after the clicked block in one reversible (undoable) op.
								const clones = blockMenuClipboard.map(cloneBlockWithFreshIds);
								apply(insertBlocksAfterOp(docRef.current, id, clones));
							}
							setBlockMenu({ open: false, blockId: '', position: { x: 0, y: 0 } });
						}}
						onTurnInto={(id, newType) => {
							const ids = selectedBlockIdsRef.current;
							if (ids.length > 1 && ids.includes(id)) {
								// Convert every selected block; the highlight survives so the
								// user can keep acting on the same set.
								const result = turnBlocksIntoOp(docRef.current, ids, newType);
								if (result.doc !== docRef.current) apply(result);
							} else {
								const result = setBlockTypeOp(docRef.current, id, newType);
								if (result.doc !== docRef.current) apply(result);
							}
							setBlockMenu({ open: false, blockId: '', position: { x: 0, y: 0 } });
						}}
						onSplitIntoColumns={
							markdownSafe && !allowedBlockTypes?.includes('columns')
								? undefined
								: id => {
										// Wrap the current block as the left column; an empty paragraph
										// becomes the right column. Cursor moves into the new paragraph.
										const original = findBlock(docRef.current, id);
										if (!original) {
											setBlockMenu({
												open: false,
												blockId: '',
												position: { x: 0, y: 0 },
											});
											return;
										}
										const empty = createBlock('paragraph');
										const columnsBlock = makeColumnsBlock(
											{ ...original },
											empty,
										);
										const newDoc = updateBlock(
											docRef.current,
											id,
											() => columnsBlock,
										);
										setDoc(newDoc);
										docRef.current = newDoc;
										const newSel: EditorSelection = {
											anchor: { blockId: empty.id, offset: 0 },
											focus: { blockId: empty.id, offset: 0 },
										};
										setSelection(newSel);
										selectionRef.current = newSel;
										onChange?.(newDoc);
										resetIdleTimer();
										setBlockMenu({
											open: false,
											blockId: '',
											position: { x: 0, y: 0 },
										});
									}
						}
						columnState={(() => {
							const ctx = findColumnAncestor(docRef.current, blockMenu.blockId);
							if (!ctx) return undefined;
							const blk = findBlock(docRef.current, blockMenu.blockId);
							return { isColumnBlock: blk?.type === 'column' };
						})()}
						onAddColumnLeft={id => {
							const ctx = findColumnAncestor(docRef.current, id);
							if (ctx) {
								const empty = createBlock('paragraph');
								const result = addAdjacentColumnOp(
									docRef.current,
									ctx.columnsBlockId,
									ctx.columnIndex,
									empty,
									'left',
								);
								if (result.doc !== docRef.current) apply(result);
							}
							setBlockMenu({ open: false, blockId: '', position: { x: 0, y: 0 } });
						}}
						onAddColumnRight={id => {
							const ctx = findColumnAncestor(docRef.current, id);
							if (ctx) {
								const empty = createBlock('paragraph');
								const result = addAdjacentColumnOp(
									docRef.current,
									ctx.columnsBlockId,
									ctx.columnIndex,
									empty,
									'right',
								);
								if (result.doc !== docRef.current) apply(result);
							}
							setBlockMenu({ open: false, blockId: '', position: { x: 0, y: 0 } });
						}}
						onDeleteColumn={id => {
							const ctx = findColumnAncestor(docRef.current, id);
							if (ctx) {
								// deleteBlockOp prunes the columns container down to a single
								// remaining column or splices it out entirely.
								const result = deleteBlockOp(docRef.current, ctx.columnId);
								if (result.doc !== docRef.current) apply(result);
							}
							setBlockMenu({ open: false, blockId: '', position: { x: 0, y: 0 } });
						}}
						onMoveUp={id => {
							const ids = selectedBlockIdsRef.current;
							if (ids.length > 1 && ids.includes(id)) {
								// Shift the whole selection up by one; highlight survives.
								const result = moveBlocksOp(docRef.current, ids, 'up');
								if (result.doc !== docRef.current) apply(result);
								setBlockMenu({
									open: false,
									blockId: '',
									position: { x: 0, y: 0 },
								});
								return;
							}
							const loc = findBlockLocation(docRef.current, id);
							if (loc && loc.index > 0) {
								const result = moveBlockOp(docRef.current, id, {
									parentId: loc.parentId,
									index: loc.index - 1,
								});
								if (result.doc !== docRef.current) apply(result);
							}
							setBlockMenu({ open: false, blockId: '', position: { x: 0, y: 0 } });
						}}
						onMoveDown={id => {
							const ids = selectedBlockIdsRef.current;
							if (ids.length > 1 && ids.includes(id)) {
								// Shift the whole selection down by one; highlight survives.
								const result = moveBlocksOp(docRef.current, ids, 'down');
								if (result.doc !== docRef.current) apply(result);
								setBlockMenu({
									open: false,
									blockId: '',
									position: { x: 0, y: 0 },
								});
								return;
							}
							const loc = findBlockLocation(docRef.current, id);
							if (!loc) {
								setBlockMenu({
									open: false,
									blockId: '',
									position: { x: 0, y: 0 },
								});
								return;
							}
							const container = getContainer(docRef.current, loc.parentId);
							if (container && loc.index < container.length - 1) {
								const result = moveBlockOp(docRef.current, id, {
									parentId: loc.parentId,
									index: loc.index + 2,
								});
								if (result.doc !== docRef.current) apply(result);
							}
							setBlockMenu({ open: false, blockId: '', position: { x: 0, y: 0 } });
						}}
						// ---- List-item style props (bulletItem/numberItem/todoItem) ----
						listItemState={
							markdownSafe
								? undefined
								: (() => {
										const blk = findBlock(docRef.current, blockMenu.blockId);
										if (!blk) return undefined;
										if (
											blk.type !== 'bulletItem' &&
											blk.type !== 'numberItem' &&
											blk.type !== 'todoItem'
										) {
											return undefined;
										}
										return {
											style: (blk.props.style ?? {}) as any,
											indexHint: blk.props.indexHint,
										};
									})()
						}
						onChangeListItemStyle={(id, patch) => {
							const target = findBlock(docRef.current, id);
							if (!target) return;
							const loc = findBlockLocation(docRef.current, id);
							if (!loc) return;
							const siblings = getContainer(docRef.current, loc.parentId);
							if (!siblings) return;

							// Walk outward from the target to find every contiguous sibling
							// of the same block type. Style fields (color/bulletStyle/
							// numberStyle/size) cascade to the whole run; per-item fields
							// (indexHint) apply only to the target.
							let runStart = loc.index;
							while (runStart > 0 && siblings[runStart - 1]!.type === target.type) {
								runStart -= 1;
							}
							let runEnd = loc.index;
							while (
								runEnd < siblings.length - 1 &&
								siblings[runEnd + 1]!.type === target.type
							) {
								runEnd += 1;
							}

							const runFields: Partial<{
								bulletStyle: string;
								numberStyle: string;
								color: string;
								size: string;
							}> = {};
							if (patch.bulletStyle !== undefined)
								runFields.bulletStyle = patch.bulletStyle;
							if (patch.numberStyle !== undefined)
								runFields.numberStyle = patch.numberStyle;
							if (patch.color !== undefined) runFields.color = patch.color;
							if (patch.size !== undefined) runFields.size = patch.size;
							const hasRunFields = Object.keys(runFields).length > 0;
							const hasIndexHint = patch.indexHint !== undefined;

							let newDoc = docRef.current;
							if (hasRunFields) {
								// `ListLevelStyle.kind` is required by the legacy type; for
								// new items the kind is implicit in the block type, so we
								// synthesise it on every write to keep the type happy.
								const kindForType =
									target.type === 'numberItem' ? 'number' : 'bullet';
								for (let i = runStart; i <= runEnd; i += 1) {
									const sibId = siblings[i]!.id;
									newDoc = updateBlock(newDoc, sibId, b => {
										const prevStyle = (b.props.style ?? {
											kind: kindForType,
										}) as Record<string, unknown>;
										const nextStyle: Record<string, unknown> = {
											...prevStyle,
											...runFields,
											kind: kindForType,
										};
										// Clearing a color means writing an empty string; drop the
										// key so the renderer falls back to the default token.
										if (runFields.color === '') delete nextStyle.color;
										return {
											...b,
											props: { ...b.props, style: nextStyle as any },
										};
									});
								}
							}
							if (hasIndexHint) {
								newDoc = updateBlock(newDoc, id, b => {
									const nextProps = { ...b.props };
									if (patch.indexHint === null) {
										delete nextProps.indexHint;
									} else {
										nextProps.indexHint = patch.indexHint;
									}
									return { ...b, props: nextProps };
								});
							}

							if (newDoc !== docRef.current) {
								apply({ doc: newDoc, ops: [], selection: null });
							}
						}}
						// ---- Table-specific props ----
						tableState={(() => {
							const blk = findBlock(docRef.current, blockMenu.blockId);
							if (blk?.type !== 'table') return undefined;
							return {
								showBorders: (blk.props.showBorders as boolean) ?? true,
								compact: (blk.props.compact as boolean) ?? false,
							};
						})()}
						onToggleBorders={id => {
							const blk = findBlock(docRef.current, id);
							if (!blk) return;
							const next = !((blk.props.showBorders as boolean) ?? true);
							globalThis.dispatchEvent(
								new CustomEvent('mde-table-update', {
									detail: {
										blockId: id,
										tableData: blk.props.tableData,
										showBorders: next,
									},
								}),
							);
						}}
						onToggleCompact={id => {
							const blk = findBlock(docRef.current, id);
							if (!blk) return;
							const next = !((blk.props.compact as boolean) ?? false);
							globalThis.dispatchEvent(
								new CustomEvent('mde-table-update', {
									detail: {
										blockId: id,
										tableData: blk.props.tableData,
										compact: next,
									},
								}),
							);
						}}
						onApplyColorTemplate={(id, template) => {
							const blk = findBlock(docRef.current, id);
							if (!blk) return;
							const tableData = blk.props.tableData as string[][] | undefined;
							const rows = tableData?.length ?? 0;
							const cols = tableData?.[0]?.length ?? 0;
							const cellMeta = template.apply(rows, cols);
							// Store template name so row/col changes can reapply the pattern
							const colorTemplate = template.name === 'Default' ? '' : template.name;
							globalThis.dispatchEvent(
								new CustomEvent('mde-table-update', {
									detail: {
										blockId: id,
										tableData: tableData,
										cellMeta,
										colorTemplate,
									},
								}),
							);
						}}
						// ---- Table-of-contents props (design + heading depth) ----
						tocState={(() => {
							const blk = findBlock(docRef.current, blockMenu.blockId);
							if (blk?.type !== 'toc') return undefined;
							const levels =
								typeof blk.props.tocLevels === 'number' ? blk.props.tocLevels : 3;
							const variant = (blk.props.tocVariant ?? 'plain') as
								'plain' | 'bulleted' | 'numbered' | 'card' | 'accent';
							return { variant, levels };
						})()}
					/>
				)}

				{/* Slash Command Menu — rendered outside the contentEditable div */}
				{slashCommand.active && (
					<SlashCommandMenu
						position={slashCommand.position}
						filter={slashCommand.filter}
						onSelect={handleSlashSelect}
						onClose={handleSlashClose}
						allowedTypes={allowedBlockTypes}
					/>
				)}

				{/* Mention Picker — triggered by "@" */}
				{mentionPicker.active && mentionProviders && (
					<MentionPicker
						position={mentionPicker.position}
						filter={mentionPicker.filter}
						providers={mentionProviders}
						workspaceId={workspaceId}
						blockId={mentionPicker.blockId}
						onSelect={handleMentionSelect}
						onClose={handleMentionClose}
						kinds={mentionPicker.kinds}
					/>
				)}

				{/* Mention Picker — bridge mode for list / table cells */}
				{bridgeMention.active && mentionProviders && (
					<MentionPicker
						position={bridgeMention.position}
						filter={bridgeMention.filter}
						providers={mentionProviders}
						workspaceId={workspaceId}
						onSelect={handleBridgeSelect}
						onClose={handleBridgeClose}
					/>
				)}

				{/* Emoji Picker — triggered by ":" */}
				{emojiPicker.active && (
					<EmojiPicker
						position={emojiPicker.position}
						filter={emojiPicker.filter}
						onSelect={handleEmojiSelect}
						onClose={handleEmojiClose}
					/>
				)}

				{/* Floating Toolbar — rendered outside the contentEditable div */}
				{toolbar.active && (
					<FloatingToolbar
						position={toolbar.position}
						activeMarks={toolbar.activeMarks}
						onToggleMark={handleToolbarToggleMark}
						onSetMark={handleToolbarSetMark}
						onSetFont={handleToolbarSetFont}
						fonts={fonts}
						onClose={handleToolbarClose}
						linkRequest={linkRequest}
					/>
				)}

				{/* Find & Replace bar */}
				{findReplace.open && (
					<FindReplaceBar
						doc={doc}
						showReplace={findReplace.showReplace}
						onHighlight={() => {
							/* Highlighting is now CSS-based inside FindReplaceBar */
						}}
						onNavigate={() => {
							// Navigation/scrolling is handled by CSS highlights inside FindReplaceBar.
							// We intentionally do NOT set the editor selection here so the
							// find input keeps focus and the user can keep typing.
						}}
						onReplace={(match, replacement) => {
							const del = deleteTextOp(
								docRef.current,
								match.blockId,
								match.offset,
								match.length,
							);
							const ins = insertTextOp(
								del.doc,
								match.blockId,
								match.offset,
								replacement,
							);
							apply(ins);
						}}
						onReplaceAll={(matches, replacement) => {
							// Process in reverse order to maintain offsets
							let currentDoc = docRef.current;
							const sorted = [...matches].sort((a, b) =>
								a.blockIndex !== b.blockIndex
									? b.blockIndex - a.blockIndex
									: b.offset - a.offset,
							);
							for (const m of sorted) {
								const del = deleteTextOp(currentDoc, m.blockId, m.offset, m.length);
								const ins = insertTextOp(del.doc, m.blockId, m.offset, replacement);
								currentDoc = ins.doc;
							}
							setDoc(currentDoc);
							docRef.current = currentDoc;
							onChange?.(currentDoc);
						}}
						onClose={() => setFindReplace({ open: false, showReplace: false })}
					/>
				)}

				{/* Debug panel — shows live markdown output, document JSON, and event log */}
				{debugMode && <DebugPanel doc={doc} selection={selection} />}
			</div>
		</CustomColorsProvider>
	);

	const wrapped = onResolveMention ? (
		<MentionResolverProvider value={onResolveMention}>{tree}</MentionResolverProvider>
	) : (
		tree
	);

	return <EditorI18nProvider t={i18nT}>{wrapped}</EditorI18nProvider>;
});

// ---- Helpers ----

/** Debug panel — shows live markdown, document model, and selection state */
function DebugPanel({
	doc,
	selection,
}: {
	doc: EditorDocument;
	selection: EditorSelection | null;
}) {
	const t = useT();
	const [tab, setTab] = useState<'markdown' | 'json' | 'selection'>('markdown');

	const markdown = blocksToMarkdown(doc.blocks);

	const tabs = [
		{ id: 'markdown' as const, label: t('editor.debug.markdown') },
		{ id: 'json' as const, label: t('editor.debug.json') },
		{ id: 'selection' as const, label: t('editor.debug.selection') },
	];

	return (
		<div
			style={{
				marginTop: 16,
				border: '1px solid var(--mde-border-primary, #e5e5e5)',
				borderRadius: 8,
				overflow: 'hidden',
				fontSize: 12,
				fontFamily: "'SF Mono', 'Fira Code', Menlo, Consolas, monospace",
			}}
		>
			{/* Tab bar */}
			<div
				style={{
					display: 'flex',
					gap: 0,
					borderBottom: '1px solid var(--mde-border-primary, #e5e5e5)',
					backgroundColor: 'var(--mde-bg-secondary, #f5f5f5)',
				}}
			>
				{tabs.map(t => (
					<button
						key={t.id}
						type="button"
						onClick={() => setTab(t.id)}
						style={{
							padding: '6px 12px',
							border: 'none',
							background:
								tab === t.id ? 'var(--mde-bg-primary, #fff)' : 'transparent',
							color:
								tab === t.id
									? 'var(--mde-text-primary, #1a1a1a)'
									: 'var(--mde-text-muted, #999)',
							cursor: 'pointer',
							fontFamily: 'inherit',
							fontSize: 11,
							fontWeight: tab === t.id ? 600 : 400,
							borderBottom:
								tab === t.id
									? '2px solid var(--mde-accent, #2563eb)'
									: '2px solid transparent',
						}}
					>
						{t.label}
					</button>
				))}
				<div style={{ flex: 1 }} />
				<span
					style={{
						padding: '6px 12px',
						color: 'var(--mde-text-muted, #999)',
						fontSize: 10,
					}}
				>
					{doc.blocks.length} blocks &middot; v{doc.version}
				</span>
			</div>
			{/* Content */}
			<pre
				style={{
					margin: 0,
					padding: 12,
					maxHeight: 240,
					overflow: 'auto',
					whiteSpace: 'pre-wrap',
					wordBreak: 'break-word',
					backgroundColor: 'var(--mde-bg-primary, #fff)',
					color: 'var(--mde-text-secondary, #4a4a4a)',
					lineHeight: 1.5,
				}}
			>
				{tab === 'markdown' && (markdown || '(empty document)')}
				{tab === 'json' && JSON.stringify(doc, null, 2)}
				{tab === 'selection' &&
					(selection ? JSON.stringify(selection, null, 2) : '(no selection)')}
			</pre>
		</div>
	);
}
