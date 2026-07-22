import React, { useState } from 'react';
import { Block, BlockType, TEMPLATE_BLOCK_DRAG } from './blockTypes';
import {
	createBlock,
	duplicateBlock,
	insertBlock,
	moveBlock,
	removeBlock,
} from './blockOperations';
import { renderBlock } from './compileBlocksToHtml';

const MOVE = 'TEMPLATE_BLOCK_MOVE_';

interface BlockCanvasProps {
	blocks: Block[];
	selectedId?: string;
	onSelect: (id: string | undefined) => void;
	onChange: (blocks: Block[]) => void;
	// True when the part already has HTML authored in Code mode but no block design yet.
	htmlWithoutDesign?: boolean;
	// Import the part's existing HTML into editable blocks (shown only when htmlWithoutDesign).
	onImportHtml?: () => void;
}

// Drag-and-drop canvas. Drop targets are the thin gaps between blocks so the insertion point is
// always unambiguous. Palette items create new blocks; dragging an existing block reorders it.
export default function BlockCanvas({
	blocks,
	selectedId,
	onSelect,
	onChange,
	htmlWithoutDesign,
	onImportHtml,
}: Readonly<BlockCanvasProps>) {
	const [overGap, setOverGap] = useState<number | null>(null);

	const list = blocks ?? [];

	const handleDrop = (index: number, e: React.DragEvent) => {
		e.preventDefault();
		setOverGap(null);
		const data = e.dataTransfer.getData('text/plain');
		if (data.startsWith(TEMPLATE_BLOCK_DRAG)) {
			// The first block on a part that holds hand-authored HTML replaces that HTML on save.
			// Confirm before discarding custom markup the visual editor can't reconstruct.
			if (
				htmlWithoutDesign &&
				list.length === 0 &&
				!window.confirm(
					'This part has custom HTML. Building it visually will replace that HTML. Continue?',
				)
			)
				return;
			const type = data.substring(TEMPLATE_BLOCK_DRAG.length) as BlockType;
			const nb = createBlock(type);
			onChange(insertBlock(list, nb, index));
			onSelect(nb.id);
		} else if (data.startsWith(MOVE)) {
			onChange(moveBlock(list, data.substring(MOVE.length), index));
		}
	};

	const gap = (index: number) => (
		<div
			key={`gap-${index}`}
			className={`_dropGap ${overGap === index ? '_active' : ''}`}
			onDragOver={e => {
				e.preventDefault();
				if (overGap !== index) setOverGap(index);
			}}
			onDragLeave={() => setOverGap(g => (g === index ? null : g))}
			onDrop={e => handleDrop(index, e)}
		/>
	);

	return (
		<div className="_blockCanvas" onClick={() => onSelect(undefined)}>
			{htmlWithoutDesign && list.length === 0 && (
				<div className="_canvasNote">
					<p>
						This part is authored as HTML. Import it into editable blocks (custom layout is
						simplified; your content is kept), keep editing in <strong>Code</strong>, or drop
						a block below to start fresh.
					</p>
					{onImportHtml && (
						<button type="button" className="_importBtn" onClick={onImportHtml}>
							<i className="fa fa-solid fa-wand-magic-sparkles" /> Import HTML into blocks
						</button>
					)}
				</div>
			)}
			{list.length === 0 && !htmlWithoutDesign && (
				<div className="_canvasEmpty">Drag blocks here to start building.</div>
			)}

			{gap(0)}
			{list.map((b, i) => (
				<React.Fragment key={b.id}>
					<div
						className={`_blockRow ${selectedId === b.id ? '_selected' : ''}`}
						draggable
						onDragStart={e => {
							e.dataTransfer.setData('text/plain', MOVE + b.id);
							e.dataTransfer.effectAllowed = 'move';
						}}
						onClick={e => {
							e.stopPropagation();
							onSelect(b.id);
						}}
					>
						<div
							className="_blockPreview"
							dangerouslySetInnerHTML={{ __html: renderBlock(b) }}
						/>
						<div className="_blockActions" onClick={e => e.stopPropagation()}>
							<span className="_blockTypeTag">{b.type}</span>
							<button
								title="Duplicate"
								onClick={() => onChange(duplicateBlock(list, b.id))}
							>
								<i className="fa fa-regular fa-clone" />
							</button>
							<button
								title="Delete"
								onClick={() => {
									onChange(removeBlock(list, b.id));
									if (selectedId === b.id) onSelect(undefined);
								}}
							>
								<i className="fa fa-regular fa-trash-can" />
							</button>
						</div>
					</div>
					{gap(i + 1)}
				</React.Fragment>
			))}
		</div>
	);
}
