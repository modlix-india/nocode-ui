// ============================================================
// Input handling — processes keyboard events, beforeinput
// events, and IME composition events. Translates user input
// into document operations.
// ============================================================

import type {
	Block,
	EditorDocument,
	Mark,
	MarkType,
	Operation,
	Selection,
	BlockType,
	TextSpan,
} from './types';
import { isCollapsed, getTextLength, getPlainText, createBlock } from './types';
import {
	findBlock,
	findBlockLocation,
	getBlocksInOrder,
	getContainer,
	setContainer,
	splitContent,
	mergeAdjacentSpans,
	updateBlock,
} from './document';
import {
	insertText,
	deleteText,
	splitBlock,
	mergeBlock,
	toggleMark,
	setMark,
	setBlockTypeOp,
	insertBlockOp,
	moveBlockOp,
	indentBlocksOp,
	selectionTextRanges,
	toggleMarkInRanges,
	type ApplyResult,
} from './operations';
import { getOrderedSelection } from './selection';

export interface InputContext {
	doc: EditorDocument;
	selection: Selection;
}

export interface InputResult {
	result: ApplyResult;
	handled: boolean;
}

const NOOP: InputResult = {
	result: { doc: null as any, ops: [], selection: null },
	handled: false,
};

/**
 * Locate a mention span by its boundary relative to a cursor offset.
 *
 * - direction "backward": returns the mention span whose end is at `offset`
 *   (i.e. the char immediately to the left of the cursor is inside it).
 * - direction "forward":  returns the mention span whose start is at `offset`
 *   (i.e. the char immediately to the right of the cursor is inside it).
 *
 * Returns null when no adjacent mention is found. Used by Backspace/Delete to
 * delete the whole chip in one keystroke instead of nibbling characters.
 */
function findAdjacentMention(
	content: TextSpan[],
	offset: number,
	direction: 'backward' | 'forward',
): { start: number; end: number } | null {
	let pos = 0;
	for (const span of content) {
		const start = pos;
		const end = pos + span.text.length;
		const isMention = span.marks?.some(m => m.type === 'mention');
		if (isMention) {
			if (direction === 'backward' && end === offset && start < end) {
				return { start, end };
			}
			if (direction === 'forward' && start === offset && end > start) {
				return { start, end };
			}
		}
		pos = end;
	}
	return null;
}

const LIST_ITEM_TYPES: BlockType[] = ['bulletItem', 'numberItem', 'todoItem'];

/**
 * If `blockId` is a list item nested inside another list item, outdent it one
 * level — move it out to become a sibling immediately after its parent —
 * preserving the caret at `offset`. Returns null when the item isn't a nested
 * list item, so callers fall back to their default (exit-to-paragraph / merge).
 *
 * This is the Notion convention: empty-Enter and Backspace-at-start promote a
 * nested item one level at a time instead of collapsing it straight to a
 * top-level paragraph.
 */
function outdentNestedListItem(
	doc: EditorDocument,
	blockId: string,
	offset: number,
): ApplyResult | null {
	const loc = findBlockLocation(doc, blockId);
	if (!loc || loc.parentId === null) return null;
	const parent = findBlock(doc, loc.parentId);
	if (!parent || !LIST_ITEM_TYPES.includes(parent.type)) return null;
	const parentLoc = findBlockLocation(doc, loc.parentId);
	if (!parentLoc) return null;
	const result = moveBlockOp(doc, blockId, {
		parentId: parentLoc.parentId,
		index: parentLoc.index + 1,
	});
	const sel: Selection = {
		anchor: { blockId, offset },
		focus: { blockId, offset },
	};
	return { ...result, selection: sel };
}

// ---- Keyboard shortcut handling (keydown) ----

/** Toggle a mark over the whole selection, across blocks, keeping the
 *  selection so the same shortcut toggles it back off. */
function toggleMarkOnSelection(doc: EditorDocument, selection: Selection, mark: Mark): InputResult {
	const result = toggleMarkInRanges(doc, selectionTextRanges(doc, selection), mark);
	return { result: { ...result, selection }, handled: true };
}

export function handleKeyDown(ctx: InputContext, e: KeyboardEvent): InputResult {
	const { doc, selection } = ctx;
	const mod = e.metaKey || e.ctrlKey;

	// ---- Formatting shortcuts ----
	if (mod && !e.shiftKey) {
		const markMap: Record<string, Mark> = {
			b: { type: 'bold' },
			i: { type: 'italic' },
			u: { type: 'underline' },
		};
		const mark = markMap[e.key.toLowerCase()];
		if (mark && !isCollapsed(selection)) {
			e.preventDefault();
			return toggleMarkOnSelection(doc, selection, mark);
		}

		// Strikethrough: Cmd+Shift+S handled below
	}

	if (mod && e.shiftKey && e.key.toLowerCase() === 's') {
		e.preventDefault();
		if (!isCollapsed(selection)) {
			return toggleMarkOnSelection(doc, selection, { type: 'strikethrough' });
		}
		return { result: { doc, ops: [], selection }, handled: true };
	}

	// Inline code: Cmd+E
	if (mod && e.key.toLowerCase() === 'e') {
		e.preventDefault();
		if (!isCollapsed(selection)) {
			return toggleMarkOnSelection(doc, selection, { type: 'code' });
		}
		return { result: { doc, ops: [], selection }, handled: true };
	}

	// ---- Enter key ----
	if (e.key === 'Enter') {
		e.preventDefault();

		const block = findBlock(doc, selection.focus.blockId);
		if (!block) return NOOP;

		// Code blocks: Enter inserts a newline within the block (not a split)
		// Two consecutive enters at the end (trailing \n) exits the code block
		if (block.type === 'codeBlock') {
			const text = getPlainText(block.content);
			const offset = selection.focus.offset;

			// If the text ends with \n and cursor is at the end, exit code block
			// by removing the trailing newline and creating a new paragraph
			if (text.endsWith('\n') && offset === text.length && !e.shiftKey) {
				// Remove trailing newline
				const trimResult = deleteText(doc, block.id, text.length - 1, 1);
				// Insert new paragraph after
				const newResult = insertBlockOp(trimResult.doc, block.id, 'paragraph');
				return {
					result: {
						doc: newResult.doc,
						ops: [...trimResult.ops, ...newResult.ops],
						selection: newResult.selection,
					},
					handled: true,
				};
			}

			// Otherwise, insert a newline character
			const result = insertText(doc, selection.focus.blockId, offset, '\n');
			return { result, handled: true };
		}

		// Enter on an empty single-line/list block exits to paragraph. Includes
		// the new list-item types so pressing Enter twice ends the list — same
		// muscle memory users have from Notion / Google Docs.
		if (!e.shiftKey) {
			const text = getPlainText(block.content);
			const convertableTypes: BlockType[] = [
				'todo',
				'quote',
				'bulletItem',
				'numberItem',
				'todoItem',
				// Empty toggle on Enter exits to a paragraph — same muscle memory
				// as ending a list.
				'toggle',
			];
			if (text === '' && convertableTypes.includes(block.type)) {
				// A nested list item promotes one level first (Notion convention);
				// only a top-level list item / empty toggle exits to a paragraph.
				if (LIST_ITEM_TYPES.includes(block.type)) {
					const outdented = outdentNestedListItem(doc, block.id, 0);
					if (outdented) return { result: outdented, handled: true };
				}
				const result = setBlockTypeOp(doc, block.id, 'paragraph');
				return {
					result: {
						...result,
						selection: { anchor: selection.focus, focus: selection.focus },
					},
					handled: true,
				};
			}
		}

		// Delete selected text first, then split. Carry the deletion's ops so the
		// delete + split land in history as one undo step.
		let currentDoc = doc;
		let currentSel = selection;
		let delOps: Operation[] = [];

		if (!isCollapsed(selection)) {
			const delResult = deleteSelectedText(doc, selection);
			currentDoc = delResult.doc;
			currentSel = delResult.selection ?? selection;
			delOps = delResult.ops;
		}

		const result = splitBlock(currentDoc, currentSel.focus.blockId, currentSel.focus.offset);
		return { result: { ...result, ops: [...delOps, ...result.ops] }, handled: true };
	}

	// ---- Backspace ----
	if (e.key === 'Backspace') {
		e.preventDefault();

		// Delete selection if expanded
		if (!isCollapsed(selection)) {
			const result = deleteSelectedText(doc, selection);
			return { result, handled: true };
		}

		const block = findBlock(doc, selection.focus.blockId);
		if (!block) return NOOP;

		if (selection.focus.offset === 0) {
			// At the start of a list item, promote it one level (Notion convention)
			// instead of collapsing a nested item straight to a paragraph. Top-level
			// items fall through to the normal merge-backward / convert behaviour.
			if (LIST_ITEM_TYPES.includes(block.type)) {
				const outdented = outdentNestedListItem(doc, block.id, 0);
				if (outdented) return { result: outdented, handled: true };
				// A top-level list item at the very start of the document has nothing
				// to merge backward into, so it exits the list by converting to a
				// paragraph — mirrors empty-Enter and matches pre-migration behaviour.
				const loc = findBlockLocation(doc, block.id);
				if (loc && loc.parentId === null && loc.index === 0) {
					const result = setBlockTypeOp(doc, block.id, 'paragraph');
					return {
						result: {
							...result,
							selection: { anchor: selection.focus, focus: selection.focus },
						},
						handled: true,
					};
				}
			}
			// At the start of a block — merge backward or convert type
			const result = mergeBlock(doc, selection.focus.blockId, 'backward');
			return { result, handled: true };
		}

		// If the char to the left is inside a mention chip, delete the whole chip.
		const mention = findAdjacentMention(block.content, selection.focus.offset, 'backward');
		if (mention) {
			const result = deleteText(doc, block.id, mention.start, mention.end - mention.start);
			return { result, handled: true };
		}

		// Delete one character backward
		const result = deleteText(doc, selection.focus.blockId, selection.focus.offset - 1, 1);
		return { result, handled: true };
	}

	// ---- Delete ----
	if (e.key === 'Delete') {
		e.preventDefault();

		if (!isCollapsed(selection)) {
			const result = deleteSelectedText(doc, selection);
			return { result, handled: true };
		}

		const block = findBlock(doc, selection.focus.blockId);
		if (!block) return NOOP;

		const textLen = getTextLength(block.content);
		if (selection.focus.offset >= textLen) {
			// At the end — merge forward
			const result = mergeBlock(doc, selection.focus.blockId, 'forward');
			return { result, handled: true };
		}

		// If the char to the right is inside a mention chip, delete the whole chip.
		const mention = findAdjacentMention(block.content, selection.focus.offset, 'forward');
		if (mention) {
			const result = deleteText(doc, block.id, mention.start, mention.end - mention.start);
			return { result, handled: true };
		}

		const result = deleteText(doc, selection.focus.blockId, selection.focus.offset, 1);
		return { result, handled: true };
	}

	// ---- Tab ----
	if (e.key === 'Tab') {
		e.preventDefault();

		// ---- Multi-item indent / outdent ----
		// When the selection spans more than one block and at least one of them is
		// a list item, Tab / Shift+Tab indents / outdents every selected list item
		// as a group in one undoable step. Without this the single-focus-block
		// path below would only move (or, worse, insert literal spaces into) the
		// one focus block.
		if (!isCollapsed(selection)) {
			const { start, end } = getOrderedSelection(doc, selection);
			const order = getBlocksInOrder(doc);
			const startIdx = order.findIndex(b => b.id === start.blockId);
			const endIdx = order.findIndex(b => b.id === end.blockId);
			if (startIdx >= 0 && endIdx > startIdx) {
				const rangeBlocks = order.slice(startIdx, endIdx + 1);
				const hasListItem = rangeBlocks.some(
					b =>
						b.type === 'bulletItem' || b.type === 'numberItem' || b.type === 'todoItem',
				);
				if (hasListItem) {
					const res = indentBlocksOp(
						doc,
						rangeBlocks.map(b => b.id),
						e.shiftKey ? 'out' : 'in',
					);
					// Keep the text selection so repeated Tab presses keep working; the
					// moved blocks keep their IDs and offsets so the range stays valid.
					return {
						result: { ...res, selection: res.ops.length > 0 ? selection : null },
						handled: true,
					};
				}
			}
		}

		// Tab nesting:
		//   • List items (bulletItem/numberItem/todoItem): Tab indents into the
		//     previous sibling's children when that sibling is also a list item;
		//     Shift+Tab outdents into the grandparent.
		//   • Any other block kind: Tab nests under the previous sibling when
		//     that sibling is a "container" type (toggle, toggleHeading1/2/3).
		//     This lets the user fold paragraphs / images / etc. under a toggle
		//     heading by pressing Tab. Shift+Tab on a child of a container moves
		//     it out as a sibling of the parent.
		const focusBlock = findBlock(doc, selection.focus.blockId);
		const isListItem =
			!!focusBlock &&
			(focusBlock.type === 'bulletItem' ||
				focusBlock.type === 'numberItem' ||
				focusBlock.type === 'todoItem');
		const isContainerType = (t: BlockType): boolean =>
			t === 'bulletItem' ||
			t === 'numberItem' ||
			t === 'todoItem' ||
			t === 'toggle' ||
			t === 'toggleHeading1' ||
			t === 'toggleHeading2' ||
			t === 'toggleHeading3';

		if (focusBlock) {
			const loc = findBlockLocation(doc, focusBlock.id);
			if (!loc) {
				// fall through to default Tab handler
			} else if (e.shiftKey) {
				// Outdent path — same rule for list items and content nested under
				// a container. We outdent whenever the block has a parent and that
				// parent is one of the container types (so we don't accidentally
				// outdent normal-block-with-children into a sibling, which would
				// surprise the user).
				if (loc.parentId === null) return NOOP;
				const parent = findBlock(doc, loc.parentId);
				if (!parent || !isContainerType(parent.type)) {
					// Not nested under a container — preserve default Tab insert
				} else {
					const parentLoc = findBlockLocation(doc, loc.parentId);
					if (!parentLoc) return NOOP;
					const result = moveBlockOp(doc, focusBlock.id, {
						parentId: parentLoc.parentId,
						index: parentLoc.index + 1,
					});
					const newSel: Selection = {
						anchor: { blockId: focusBlock.id, offset: selection.focus.offset },
						focus: { blockId: focusBlock.id, offset: selection.focus.offset },
					};
					return { result: { ...result, selection: newSel }, handled: true };
				}
			} else {
				// Indent path
				if (loc.index > 0) {
					const siblings = getContainer(doc, loc.parentId);
					const prev = siblings?.[loc.index - 1];
					if (prev) {
						const canNest = isListItem
							? prev.type === 'bulletItem' ||
								prev.type === 'numberItem' ||
								prev.type === 'todoItem'
							: isContainerType(prev.type);
						if (canNest) {
							const result = moveBlockOp(doc, focusBlock.id, {
								parentId: prev.id,
								index: prev.children.length,
							});
							const newSel: Selection = {
								anchor: { blockId: focusBlock.id, offset: selection.focus.offset },
								focus: { blockId: focusBlock.id, offset: selection.focus.offset },
							};
							return { result: { ...result, selection: newSel }, handled: true };
						}
					}
				}
			}
		}

		// Default — insert two spaces.
		const result = insertText(doc, selection.focus.blockId, selection.focus.offset, '  ');
		return { result, handled: true };
	}

	// Not handled — let beforeinput take care of text input
	return NOOP;
}

// ---- beforeinput event handling ----

export function handleBeforeInput(ctx: InputContext, e: InputEvent): InputResult {
	const { doc, selection } = ctx;

	switch (e.inputType) {
		case 'insertText':
		case 'insertReplacementText': {
			const text = e.data;
			if (!text) return NOOP;

			e.preventDefault();

			// Delete selection first if expanded. Carry the deletion's ops so the
			// delete + insert land in history as one undo step (e.g. select-all then
			// type immediately replaces the document in a single Cmd+Z).
			let currentDoc = doc;
			let currentSel = selection;
			let delOps: Operation[] = [];
			if (!isCollapsed(selection)) {
				const delResult = deleteSelectedText(doc, selection);
				currentDoc = delResult.doc;
				currentSel = delResult.selection ?? selection;
				delOps = delResult.ops;
			}

			const blockId = currentSel.focus.blockId;
			const offset = currentSel.focus.offset;
			let result = insertText(currentDoc, blockId, offset, text);

			// Text typed straight after an inline shortcut starts outside its mark
			// ("**bold**" then " more" is not bold), as in Notion.
			const exit = pendingMarkExit;
			pendingMarkExit = null;
			if (exit && exit.blockId === blockId && exit.offset === offset) {
				for (const type of exit.marks) {
					const cleared = setMark(
						result.doc,
						blockId,
						offset,
						offset + text.length,
						type,
					);
					result = {
						doc: cleared.doc,
						ops: [...result.ops, ...cleared.ops],
						selection: result.selection,
					};
				}
			}

			// Check for markdown shortcuts after inserting
			const shortcut = checkMarkdownShortcuts(result.doc, blockId);
			if (shortcut) {
				return {
					result: { ...shortcut, ops: [...delOps, ...result.ops, ...shortcut.ops] },
					handled: true,
				};
			}

			const inline = checkInlineShortcuts(result.doc, blockId, offset + text.length);
			if (inline) {
				return {
					result: { ...inline, ops: [...delOps, ...result.ops, ...inline.ops] },
					handled: true,
				};
			}

			return { result: { ...result, ops: [...delOps, ...result.ops] }, handled: true };
		}

		case 'insertParagraph': {
			// Handled by keydown Enter
			return NOOP;
		}

		case 'deleteContentBackward': {
			// Handled by keydown Backspace
			return NOOP;
		}

		case 'deleteContentForward': {
			// Handled by keydown Delete
			return NOOP;
		}

		case 'insertFromPaste': {
			// Handled by clipboard.ts paste handler
			return NOOP;
		}

		default:
			return NOOP;
	}
}

// ---- Inline markdown shortcuts ----
// Typing the closing delimiter of **bold**, *italic*, _italic_, ~~strike~~ or
// `code` removes both delimiters and applies the mark.

const INLINE_RULES: { delim: string; mark: MarkType }[] = [
	{ delim: '**', mark: 'bold' },
	{ delim: '__', mark: 'bold' },
	{ delim: '~~', mark: 'strikethrough' },
	{ delim: '`', mark: 'code' },
	{ delim: '*', mark: 'italic' },
	{ delim: '_', mark: 'italic' },
];

/** After an inline shortcut, the next character typed at this spot drops the
 *  shortcut's mark. Cleared by any other insertion. */
let pendingMarkExit: { blockId: string; offset: number; marks: MarkType[] } | null = null;

const WORD_CHAR = /[\p{L}\p{N}]/u;

function checkInlineShortcuts(
	doc: EditorDocument,
	blockId: string,
	caret: number,
): ApplyResult | null {
	const block = findBlock(doc, blockId);
	if (!block || block.type === 'codeBlock') return null;
	const text = getPlainText(block.content);

	for (const { delim, mark } of INLINE_RULES) {
		const closeStart = caret - delim.length;
		if (closeStart < 1 || text.slice(closeStart, caret) !== delim) continue;
		// A single * or _ next to another one belongs to a ** / __ pair.
		if (delim.length === 1 && (text[closeStart - 1] === delim || text[caret] === delim))
			continue;

		// The opener ends at least one character before the closer.
		const openStart = text.lastIndexOf(delim, closeStart - delim.length - 1);
		if (openStart < 0) continue;
		const innerStart = openStart + delim.length;
		if (innerStart >= closeStart) continue;
		if (delim.length === 1 && (text[openStart - 1] === delim || text[innerStart] === delim))
			continue;

		const inner = text.slice(innerStart, closeStart);
		// No space just inside the delimiters, and the opener starts a word.
		if (inner !== inner.trim()) continue;
		if (WORD_CHAR.test(text[openStart - 1] ?? '')) continue;
		if (mark === 'code' && inner.includes('`')) continue;
		// Leave text that is already code alone.
		if (rangeHasMark(block.content, openStart, caret, 'code')) continue;

		const removeClose = deleteText(doc, blockId, closeStart, delim.length);
		const removeOpen = deleteText(removeClose.doc, blockId, openStart, delim.length);
		const marked = toggleMark(removeOpen.doc, blockId, openStart, openStart + inner.length, {
			type: mark,
		});
		const end = openStart + inner.length;
		pendingMarkExit = { blockId, offset: end, marks: [mark] };
		return {
			doc: marked.doc,
			ops: [...removeClose.ops, ...removeOpen.ops, ...marked.ops],
			selection: { anchor: { blockId, offset: end }, focus: { blockId, offset: end } },
		};
	}
	return null;
}

function rangeHasMark(content: TextSpan[], from: number, to: number, type: MarkType): boolean {
	let pos = 0;
	for (const span of content) {
		const end = pos + span.text.length;
		if (end > from && pos < to && span.marks?.some(m => m.type === type)) return true;
		pos = end;
	}
	return false;
}

// ---- Markdown shortcuts ----
// Triggered after text insertion to auto-convert patterns like "## " or "- "

function checkMarkdownShortcuts(doc: EditorDocument, blockId: string): ApplyResult | null {
	const block = findBlock(doc, blockId);
	if (!block || block.type !== 'paragraph') return null;

	const text = getPlainText(block.content);

	// Heading shortcuts: "# ", "## ", "### "
	const headingMatch = text.match(/^(#{1,3})\s$/);
	if (headingMatch) {
		const level = headingMatch[1]!.length;
		const type = `heading${level}` as BlockType;
		return {
			...setBlockTypeOp(doc, blockId, type),
			...clearBlockText(doc, blockId, type),
		};
	}

	// Bullet list: "- " or "* " → first-class bulletItem (same block type the
	// slash menu creates and migrate.ts upgrades legacy `list` blocks to). This
	// keeps every editing path on the core operations + history pipeline rather
	// than the legacy local-state ListBlock.
	if (text === '- ' || text === '* ') {
		return clearBlockText(doc, blockId, 'bulletItem');
	}

	// Numbered list: any "N. " (1. , 2. , 4. , 12. …) → first-class numberItem.
	// Matching any leading number — not just "1." — means typing the next number
	// on the line below an existing numbered list assimilates into it: the marker
	// renders by the item's position in the consecutive run, so it shows the real
	// next number regardless of which digit was typed.
	if (/^\d+\.\s$/.test(text)) {
		return clearBlockText(doc, blockId, 'numberItem');
	}

	// Todo: "[] " or "[ ] " → first-class todoItem
	if (text === '[] ' || text === '[ ] ') {
		return clearBlockText(doc, blockId, 'todoItem', { checked: false });
	}

	// Checked todo: "[x] " → first-class todoItem
	if (text === '[x] ' || text === '[X] ') {
		return clearBlockText(doc, blockId, 'todoItem', { checked: true });
	}

	// Quote: "> "
	if (text === '> ') {
		return clearBlockText(doc, blockId, 'quote');
	}

	// Divider: "---" or "***"
	if (text === '---' || text === '***' || text === '---\n') {
		const dividerResult = setBlockTypeOp(doc, blockId, 'divider');
		const newDoc = updateBlock(dividerResult.doc, blockId, b => ({ ...b, content: [] }));
		const insertResult = insertBlockOp(newDoc, blockId, 'paragraph');
		return {
			doc: insertResult.doc,
			ops: [...dividerResult.ops, ...insertResult.ops],
			selection: insertResult.selection,
		};
	}

	// Code block: "```"
	if (text === '```' || text === '``` ') {
		return clearBlockText(doc, blockId, 'codeBlock');
	}

	return null;
}

/** Helper: convert block type and clear its text */
function clearBlockText(
	doc: EditorDocument,
	blockId: string,
	newType: BlockType,
	props: Record<string, any> = {},
): ApplyResult {
	const typeResult = setBlockTypeOp(doc, blockId, newType, props);
	const newDoc = updateBlock(typeResult.doc, blockId, b => ({ ...b, content: [] }));
	return {
		doc: newDoc,
		ops: typeResult.ops,
		selection: { anchor: { blockId, offset: 0 }, focus: { blockId, offset: 0 } },
	};
}

// ---- Multi-block selection deletion ----

function deleteSelectedText(doc: EditorDocument, sel: Selection): ApplyResult {
	const { start, end } = getOrderedSelection(doc, sel);

	if (start.blockId === end.blockId) {
		// Same block — just delete the range (already op-recorded + undoable).
		return deleteText(doc, start.blockId, start.offset, end.offset - start.offset);
	}

	const startLoc = findBlockLocation(doc, start.blockId);
	const endLoc = findBlockLocation(doc, end.blockId);
	const startBlock = findBlock(doc, start.blockId);
	const endBlock = findBlock(doc, end.blockId);
	if (!startLoc || !endLoc || !startBlock || !endBlock) {
		return { doc, ops: [], selection: null };
	}

	// Whole-document selection (e.g. Cmd/Ctrl+A then Backspace): collapse the
	// entire doc down to a single empty paragraph. Recorded as one reversible
	// `replaceBlocks` op so a single Cmd+Z brings the whole document back.
	const order = getBlocksInOrder(doc);
	const first = order[0];
	const last = order.at(-1);
	if (
		first &&
		last &&
		start.blockId === first.id &&
		start.offset === 0 &&
		end.blockId === last.id &&
		end.offset === getTextLength(last.content)
	) {
		const empty = createBlock('paragraph');
		const op: Operation = {
			type: 'replaceBlocks',
			parentId: null,
			oldBlocks: doc.blocks,
			newBlocks: [empty],
		};
		const newDoc = setContainer(doc, null, [empty]);
		const selection: Selection = {
			anchor: { blockId: empty.id, offset: 0 },
			focus: { blockId: empty.id, offset: 0 },
		};
		return { doc: newDoc, ops: [op], selection };
	}

	// Cross-parent selection (e.g. spanning columns): clear text inside each
	// endpoint without restructuring the tree. The middle blocks remain — this
	// matches Notion's behavior for column-spanning selections. Recorded as two
	// `replaceContent` ops so the trim is undoable.
	if (startLoc.parentId !== endLoc.parentId) {
		const startKept = splitContent(startBlock.content, start.offset)[0];
		const endKept = splitContent(endBlock.content, end.offset)[1];
		const ops: Operation[] = [
			{
				type: 'replaceContent',
				blockId: start.blockId,
				oldContent: startBlock.content,
				newContent: startKept,
			},
			{
				type: 'replaceContent',
				blockId: end.blockId,
				oldContent: endBlock.content,
				newContent: endKept,
			},
		];
		let working = updateBlock(doc, start.blockId, b => ({ ...b, content: startKept }));
		working = updateBlock(working, end.blockId, b => ({ ...b, content: endKept }));
		const selection: Selection = {
			anchor: { blockId: start.blockId, offset: start.offset },
			focus: { blockId: start.blockId, offset: start.offset },
		};
		return { doc: working, ops, selection };
	}

	// Same parent — merge start + end into one block, drop middles. Recorded as
	// one `replaceBlocks` op on the affected container so it undoes in a single
	// step (previously this returned no ops, so Cmd+Z couldn't restore it).
	const container = getContainer(doc, startLoc.parentId);
	if (!container) return { doc, ops: [], selection: null };

	const [keepBefore] = splitContent(startBlock.content, start.offset);
	const [, keepAfter] = splitContent(endBlock.content, end.offset);
	const mergedContent = mergeAdjacentSpans([...keepBefore, ...keepAfter]);

	const nextContainer: Block[] = container
		.map((b, i) => {
			if (i === startLoc.index) return { ...b, content: mergedContent };
			if (i > startLoc.index && i <= endLoc.index) return null;
			return b;
		})
		.filter((b): b is Block => b !== null);

	const op: Operation = {
		type: 'replaceBlocks',
		parentId: startLoc.parentId,
		oldBlocks: container,
		newBlocks: nextContainer,
	};
	const newDoc = setContainer(doc, startLoc.parentId, nextContainer);
	const selection: Selection = {
		anchor: { blockId: start.blockId, offset: start.offset },
		focus: { blockId: start.blockId, offset: start.offset },
	};

	return { doc: newDoc, ops: [op], selection };
}
