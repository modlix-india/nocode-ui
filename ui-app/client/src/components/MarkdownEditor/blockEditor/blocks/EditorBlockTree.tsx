// ============================================================
// BlockWrapper + BlockTree — the recursive renderer the editor
// uses for both top-level blocks and nested column children.
// Reads drag state from `EditorBlockEnvContext` so each layer
// in the tree shows the right drop indicators without prop
// drilling.
// ============================================================

import React from 'react';
import type { Block } from '../core/types';
import { BlockRenderer } from './BlockRenderer';
import {
	BlockChildrenRendererContext,
	useBlockSelection,
	useEditorBlockEnv,
	type DropEdge,
	type RenderBlockList,
} from './EditorDocContext';

const SIDE_BAR_THICKNESS = 3;
const TOP_BAR_THICKNESS = 2;

/** Text-bearing block types that get a little horizontal breathing room so
 *  their text isn't flush against the block edge (and the block-selection /
 *  background highlight has padding around the text). Non-text blocks
 *  (image, divider, table, columns, embeds, …) stay full-bleed. */
const TEXT_BLOCK_TYPES = new Set<string>([
	'paragraph',
	'heading1',
	'heading2',
	'heading3',
	'heading4',
	'heading5',
	'heading6',
	'toggleHeading1',
	'toggleHeading2',
	'toggleHeading3',
	'list',
	'todo',
	'bulletItem',
	'numberItem',
	'todoItem',
	'quote',
	'callout',
	'toggle',
	'codeBlock',
]);

/** Horizontal padding (px) applied to text blocks. */
const TEXT_BLOCK_PADDING_X = 6;

function dropIndicatorStyle(edge: DropEdge): React.CSSProperties {
	const base: React.CSSProperties = {
		position: 'absolute',
		backgroundColor: 'var(--mde-accent, #2563eb)',
		borderRadius: 2,
		pointerEvents: 'none',
		zIndex: 5,
	};
	switch (edge) {
		case 'above':
			return { ...base, top: -1, left: 0, right: 0, height: TOP_BAR_THICKNESS };
		case 'below':
			return { ...base, bottom: -1, left: 0, right: 0, height: TOP_BAR_THICKNESS };
		case 'left':
			return {
				...base,
				left: -SIDE_BAR_THICKNESS,
				top: 0,
				bottom: 0,
				width: SIDE_BAR_THICKNESS,
			};
		case 'right':
			return {
				...base,
				right: -SIDE_BAR_THICKNESS,
				top: 0,
				bottom: 0,
				width: SIDE_BAR_THICKNESS,
			};
	}
}

interface BlockWrapperProps {
	block: Block;
	isFirstInList: boolean;
	prevSiblingType?: string;
	index: number;
	depth: number;
}

function BlockWrapperImpl({
	block,
	isFirstInList,
	prevSiblingType,
	index,
	depth,
}: BlockWrapperProps) {
	const env = useEditorBlockEnv();
	const blockSelection = useBlockSelection();
	const isBlockSelected = blockSelection.has(block.id);
	const isTextBlock = TEXT_BLOCK_TYPES.has(block.type);
	const isContinuation = block.type === 'todo' && prevSiblingType === 'todo';
	const isInlineImage = block.type === 'image' && block.props.inline === true;
	const isDragging = env?.draggingBlockId === block.id;
	const matchingEdge =
		env?.dropTarget && env.dropTarget.blockId === block.id && env.draggingBlockId !== block.id
			? env.dropTarget.edge
			: null;

	// Block-level background (color + image with position/fit). Color and
	// image are independent — either may be set. Image renders behind the
	// block; if `bgFit` is "tile" we repeat; otherwise we use `cover` /
	// `contain` per the prop. Default position is "center".
	const bgColor = block.props.bgColor as string | undefined;
	const bgImage = block.props.bgImage as string | undefined;
	const bgFit = (block.props.bgFit as string | undefined) ?? 'cover';
	const bgPosition = (block.props.bgPosition as string | undefined) ?? 'center';
	const hasBg = Boolean(bgColor || bgImage);
	const blockTextColor = block.props.blockTextColor as string | undefined;
	const blockHighlightColor = block.props.blockHighlightColor as string | undefined;
	// Per-block font cascades to the block's text (and children).
	const blockFont = block.props.fontFamily as string | undefined;
	const wrapperColor = blockTextColor;
	// Effective background = explicit bgColor takes precedence over highlight color.
	const effectiveBg = hasBg ? (bgColor ?? blockHighlightColor) : blockHighlightColor;
	const bgStyle: React.CSSProperties =
		hasBg || blockHighlightColor || blockTextColor
			? {
					backgroundColor: effectiveBg,
					color: wrapperColor,
					backgroundImage: bgImage ? `url("${bgImage}")` : undefined,
					backgroundSize: bgImage ? (bgFit === 'tile' ? 'auto' : bgFit) : undefined,
					backgroundRepeat: bgImage
						? bgFit === 'tile'
							? 'repeat'
							: 'no-repeat'
						: undefined,
					backgroundPosition: bgImage ? bgPosition : undefined,
					borderRadius: effectiveBg || bgImage ? 6 : undefined,
				}
			: {};

	return (
		<div
			data-block-id={block.id}
			data-block-type={block.type}
			data-block-selected={isBlockSelected || undefined}
			className={
				isBlockSelected ? 'mde-block-wrapper mde-block-selected' : 'mde-block-wrapper'
			}
			style={{
				position: 'relative',
				paddingTop: isContinuation ? 1 : 4,
				paddingBottom: isContinuation ? 1 : 4,
				paddingLeft: isTextBlock ? TEXT_BLOCK_PADDING_X : 0,
				paddingRight: isTextBlock ? TEXT_BLOCK_PADDING_X : 0,
				marginTop: isFirstInList ? 0 : undefined,
				opacity: isDragging ? 0.5 : 1,
				display: isInlineImage ? 'inline-block' : undefined,
				verticalAlign: isInlineImage ? 'top' : undefined,
				maxWidth: isInlineImage ? '48%' : undefined,
				fontFamily: blockFont || undefined,
				...bgStyle,
			}}
		>
			{matchingEdge && (
				<div
					contentEditable={false}
					data-drop-indicator={matchingEdge}
					style={dropIndicatorStyle(matchingEdge)}
				/>
			)}

			<BlockRenderer
				block={block}
				readOnly={env?.readOnly ?? false}
				onToggleTodo={env?.onToggleTodo}
				onToggleCollapse={env?.onToggleCollapse}
				index={index}
				depth={depth}
			/>
		</div>
	);
}

export const BlockWrapper = React.memo(BlockWrapperImpl);

/** Render a list of blocks with the shared wrapper. Used at the document
 *  root and as the children renderer inside columns. Depth tracks nesting
 *  level for list-item marker rotation. */
export function renderBlockListAtDepth(blocks: Block[], depth: number): React.ReactNode {
	// Numbered list runs restart at 1 whenever the consecutive run of
	// numberItem siblings breaks (interrupted by any non-numberItem block).
	// A numberItem with `props.indexHint` jumps the counter to that value at
	// that item; subsequent siblings in the same run continue from there.
	// So [num, num{hint=21}, num] renders 1, 21, 22.
	const numberIndex: Record<string, number> = {};
	let run = 0;
	for (const b of blocks) {
		if (b.type === 'numberItem') {
			const hint = b.props.indexHint;
			if (typeof hint === 'number' && Number.isFinite(hint) && hint >= 1) {
				run = Math.floor(hint) - 1;
			}
			numberIndex[b.id] = run;
			run += 1;
		} else {
			run = 0;
		}
	}
	return (
		<>
			{blocks.map((block, idx) => (
				<BlockWrapper
					key={block.id}
					block={block}
					isFirstInList={idx === 0}
					prevSiblingType={idx > 0 ? blocks[idx - 1]!.type : undefined}
					index={block.type === 'numberItem' ? numberIndex[block.id] : idx}
					depth={depth}
				/>
			))}
		</>
	);
}

/** Default RenderBlockList entry. Depth defaults to 0 (document root); nested
 *  containers pass an explicit depth so list-item markers rotate as list
 *  nesting deepens (e.g. ListItemBlock renders its children at depth + 1). */
export const renderBlockList: RenderBlockList = (blocks, depth = 0) =>
	renderBlockListAtDepth(blocks, depth);

/** Children renderer for nested calls: bumps depth by 1 so list-item
 *  markers can rotate (• → ◦ → ▪) as nesting deepens. */
export function makeNestedRenderer(depth: number): RenderBlockList {
	return blocks => renderBlockListAtDepth(blocks, depth);
}

/** Provider that exposes `renderBlockList` via context so nested container
 *  blocks can recurse without importing the function directly. */
export function BlockChildrenProvider({ children }: { children: React.ReactNode }) {
	return (
		<BlockChildrenRendererContext.Provider value={renderBlockList}>
			{children}
		</BlockChildrenRendererContext.Provider>
	);
}
