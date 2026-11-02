// ============================================================
// Core type definitions for the block editor engine.
// These types form the canonical document model — all editing
// operations, rendering, and serialization work with these.
// ============================================================

/** All supported block types. List-item kinds (bulletItem/numberItem/todoItem)
 *  are first-class blocks nested via children; `list` is legacy, kept only for
 *  the read-time migration in core/migrate.ts. */
export type BlockType =
	| 'paragraph'
	| 'heading1'
	| 'heading2'
	| 'heading3'
	| 'heading4'
	| 'heading5'
	| 'heading6'
	| 'toggleHeading1'
	| 'toggleHeading2'
	| 'toggleHeading3'
	| 'list'
	| 'todo'
	| 'bulletItem'
	| 'numberItem'
	| 'todoItem'
	| 'codeBlock'
	| 'quote'
	| 'callout'
	| 'toggle'
	| 'image'
	| 'embed'
	| 'divider'
	| 'table'
	| 'toc'
	| 'columns'
	| 'column'
	| 'tabs'
	| 'tab'
	| 'customComponent';

/** Inline formatting marks */
export type MarkType =
	| 'bold'
	| 'italic'
	| 'underline'
	| 'strikethrough'
	| 'code'
	| 'link'
	| 'superscript'
	| 'subscript'
	| 'color'
	| 'highlight'
	| 'fontFamily'
	| 'mention';

/** Kinds of things a mention can point at. String-typed so providers can extend. */
export type MentionKind = 'page' | 'user' | 'date' | 'record' | 'contact' | (string & {});

/**
 * A mark applied to inline text.
 *
 * For "mention" marks, attrs carries:
 *   - kind: MentionKind (e.g. "page", "user", "date", "record")
 *   - id:   stable target id — page UUID, user UUID, ISO date string, or
 *           "<databaseId>:<rowId>" for records
 *
 * The mention's display label lives in the host TextSpan.text and is kept
 * in lockstep with the live MentionResolver output by MentionPill's auto-sync
 * effect (see blocks/TextContent.tsx). That means date chips re-label across
 * days ("Today" → "Yesterday") and page chips auto-update on rename without
 * any stored snapshot to maintain. Plain-text reads, search indexing, and
 * markdown serialization all use TextSpan.text directly.
 *
 * Legacy data may still carry an `attrs.label` snapshot from before the
 * auto-sync design — readers ignore it (TextSpan.text wins) and the sync
 * effect strips it whenever it touches the mark.
 */
export interface Mark {
	type: MarkType;
	attrs?: Record<string, string>; // e.g. { href: "..." } for links
}

/**
 * A span of text with formatting.
 * Consecutive spans with different marks form rich text.
 * Example: "Hello **world**" → [{ text: "Hello " }, { text: "world", marks: [{ type: "bold" }] }]
 */
export interface TextSpan {
	text: string;
	marks?: Mark[];
}

/** A single item within a list block */
export interface ListItem {
	id: string;
	content: TextSpan[];
	indent: number; // 0 = top-level, 1+ = nested
	/** Per-item kind override — when items at the same indent have different kinds */
	kind?: 'bullet' | 'number';
}

/** Style for a specific indent level in a list */
export interface ListLevelStyle {
	kind: 'bullet' | 'number';
	bulletStyle?: string; // disc, circle, square, dash, arrow, star, checkmark
	numberStyle?: string; // decimal, alpha-lower, alpha-upper, roman-lower, roman-upper
	startFrom?: number;
	/** Marker size: "small" | "medium" | "large" — defaults to "medium" */
	size?: string;
	/** Marker color as CSS value — defaults to theme muted text */
	color?: string;
}

/** Properties specific to certain block types */
export interface BlockProps {
	checked?: boolean;
	language?: string;
	// image
	src?: string;
	alt?: string;
	caption?: string;
	// image crop (position of visible area within the full image)
	cropX?: number;
	cropY?: number;
	cropW?: number;
	cropH?: number;
	// embed
	url?: string;
	// callout
	emoji?: string;
	color?: string;
	// toggle
	collapsed?: boolean;
	// table
	rows?: number;
	cols?: number;
	tableData?: string[][]; // 2D array of cell contents
	tableHeader?: boolean; // first row is header
	// table of contents
	tocLevels?: number; // max heading depth: 1-6 (default 3 = h1-h3)
	// TOC visual design. "plain" = indented text list (default). "bulleted" =
	// level-varying bullet markers. "numbered" = hierarchical numbering (1, 1.1).
	// "card" = bordered/tinted panel with a heading label. "accent" = left
	// accent bar per item. Undefined is treated as "plain".
	tocVariant?: 'plain' | 'bulleted' | 'numbered' | 'card' | 'accent';
	// columns container: column widths as fractions of the row, indexed by
	// column position. Length must match children.length when set; defaults
	// to equal widths when unset or mismatched.
	widths?: number[];
	// custom component
	componentName?: string;
	componentProps?: Record<string, unknown>;
	// list items (bulletItem / numberItem / todoItem)
	// `style` lets each item override its kind-default marker/numbering style.
	// `collapsed` hides the block's children when true (collapsible list).
	// `indexHint` is an optional starting number for numberItem when the user
	// wants a chain to restart counting (e.g. 1, 2, 3, then 1, 2 again).
	style?: ListLevelStyle;
	indexHint?: number;
	// tabs container — children are `tab` blocks. `tabTheme` selects one of
	// 4 visual variants ("pill" | "underline" | "card" | "minimal"). The
	// currently-selected tab is per-user state (persisted by the host via the
	// onBlockStateGet/Set callbacks); `activeTab` is only the *initial* index
	// for users who have no stored preference yet.
	tabTheme?: string;
	activeTab?: number;
	// tab label override — when set, the tab header renders this string
	// instead of the tab block's text content. Used by hosts that want
	// emoji-prefixed labels or i18n-keyed labels per tab.
	tabLabel?: string;
	// block-level background — applies a CSS background fill or image to the
	// block wrapper. Set via the block menu's Background submenu.
	// `bgColor` is a CSS color (e.g. "var(--mde-accent)" or "#fef3c7").
	// `bgImage` is a URL (pageassets/ public for safety).
	// `bgFit` is "cover" | "contain" | "tile" — defaults to "cover".
	// `bgPosition` is a `background-position` value ("center", "top", etc.)
	bgColor?: string;
	bgImage?: string;
	bgFit?: string;
	bgPosition?: string;
	// text color / highlight color applied at block level (in addition to
	// any inline color marks). Useful for the slash-menu color entries.
	blockTextColor?: string;
	blockHighlightColor?: string;
	// generic extension point
	[key: string]: unknown;
}

/**
 * A block is the fundamental unit of the editor.
 * Each block has a unique ID, a type, inline content (text spans),
 * optional children (for nesting: lists, toggles), and type-specific props.
 */
export interface Block {
	id: string;
	type: BlockType;
	content: TextSpan[];
	children: Block[];
	props: BlockProps;
}

/** The root document model */
export interface EditorDocument {
	blocks: Block[];
	version: number; // Incremented on every change
}

/** A position within the document: which block, which offset in its text */
export interface Position {
	blockId: string;
	offset: number;
}

/** A selection range within the document */
export interface Selection {
	anchor: Position; // Where the selection started
	focus: Position; // Where the selection ended (cursor is here)
}

/** Whether the selection is collapsed (cursor) or expanded (range) */
export function isCollapsed(sel: Selection): boolean {
	return sel.anchor.blockId === sel.focus.blockId && sel.anchor.offset === sel.focus.offset;
}

/** Direction for merge operations */
export type Direction = 'forward' | 'backward';

/** Location of a block in the tree: which container holds it, and at what index. */
export interface BlockLocation {
	/** null = top-level (doc.blocks); otherwise the parent block's id */
	parentId: string | null;
	/** Index within the parent container */
	index: number;
}

/** An operation that can be applied to the document */
export type Operation =
	| { type: 'insertText'; blockId: string; offset: number; text: string }
	| { type: 'deleteText'; blockId: string; offset: number; length: number; deleted: string }
	| { type: 'splitBlock'; blockId: string; offset: number; newBlockId: string }
	| {
			type: 'mergeBlock';
			blockId: string;
			direction: Direction;
			mergedContent: TextSpan[];
			mergedChildren: Block[];
			prevBlockId: string;
			blockType?: BlockType;
			blockProps?: BlockProps;
	  }
	| { type: 'insertBlock'; parentId: string | null; index: number; block: Block }
	| { type: 'deleteBlock'; blockId: string; block: Block; parentId: string | null; index: number }
	| { type: 'moveBlock'; blockId: string; from: BlockLocation; to: BlockLocation }
	| {
			type: 'setBlockType';
			blockId: string;
			oldType: BlockType;
			newType: BlockType;
			oldProps: BlockProps;
			newProps: BlockProps;
	  }
	| { type: 'setBlockProps'; blockId: string; oldProps: BlockProps; newProps: BlockProps }
	| { type: 'toggleMark'; blockId: string; from: number; to: number; mark: Mark }
	| { type: 'replaceContent'; blockId: string; oldContent: TextSpan[]; newContent: TextSpan[] }
	// Wholesale replacement of a container's block list (parentId null = root).
	// Used for multi-block range deletions (incl. select-all) so they are a
	// single, trivially-reversible undo step. Mirrors `replaceContent` at the
	// structural level: keep old + new, swap them to undo/redo.
	| { type: 'replaceBlocks'; parentId: string | null; oldBlocks: Block[]; newBlocks: Block[] }
	| {
			type: 'wrapInColumns';
			columnsBlockId: string;
			firstColumnId: string;
			secondColumnId: string;
			targetBlockId: string;
			targetLocation: BlockLocation;
			movedBlock: Block;
			movedFrom: BlockLocation;
			side: 'left' | 'right';
	  }
	| {
			type: 'unwrapColumns';
			columnsBlockId: string;
			location: BlockLocation;
			columnsBlock: Block;
	  }
	| {
			type: 'removeColumn';
			columnsBlockId: string;
			columnIndex: number;
			column: Block;
			oldWidths?: number[];
			newWidths?: number[];
	  };

/** A batch of operations that form a single undo step */
export interface Transaction {
	operations: Operation[];
	selectionBefore: Selection | null;
	selectionAfter: Selection | null;
	timestamp: number;
}

// ---- Helpers ----

/** Get the plain text length of a block's content */
export function getTextLength(content: TextSpan[]): number {
	let len = 0;
	for (const span of content) {
		len += span.text.length;
	}
	return len;
}

/** Get plain text from content spans */
export function getPlainText(content: TextSpan[]): string {
	let text = '';
	for (const span of content) {
		text += span.text;
	}
	return text;
}

/** Whether the character at `offset` of the plain text belongs to a mention pill. */
export function isInMention(content: TextSpan[], offset: number): boolean {
	let pos = 0;
	for (const span of content) {
		const end = pos + span.text.length;
		if (offset >= pos && offset < end) return !!span.marks?.some(m => m.type === 'mention');
		pos = end;
	}
	return false;
}

/** Create a new block with defaults */
export function createBlock(type: BlockType, text: string = '', props: BlockProps = {}): Block {
	return {
		id: generateId(),
		type,
		content: text ? [{ text }] : [],
		children: [],
		props,
	};
}

/** Generate a unique block ID */
export function generateId(): string {
	// randomUUID exists only in secure contexts (https / localhost).
	const c = globalThis.crypto;
	if (c && typeof c.randomUUID === 'function') return c.randomUUID();
	return `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}${(idCounter++).toString(36)}`;
}

let idCounter = 0;
