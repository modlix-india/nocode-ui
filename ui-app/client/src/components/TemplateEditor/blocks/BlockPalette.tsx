import React from 'react';
import { BLOCK_TYPE_LIST, TEMPLATE_BLOCK_DRAG } from './blockTypes';

// Draggable source of block types. Uses native HTML5 drag with a typed payload token.
export default function BlockPalette() {
	return (
		<div className="_blockPalette">
			<div className="_paletteTitle">Blocks</div>
			{BLOCK_TYPE_LIST.map(b => (
				<div
					key={b.type}
					className="_paletteItem"
					draggable
					onDragStart={e => {
						e.dataTransfer.setData('text/plain', TEMPLATE_BLOCK_DRAG + b.type);
						e.dataTransfer.effectAllowed = 'copy';
					}}
					title={`Drag ${b.label} onto the canvas`}
				>
					<i className={`fa fa-solid ${b.icon}`} />
					<span>{b.label}</span>
				</div>
			))}
		</div>
	);
}
