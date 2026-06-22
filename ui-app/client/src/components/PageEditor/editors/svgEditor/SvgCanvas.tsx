import React, { useRef } from 'react';
import { PathPointOverlay } from './PathPointOverlay';
import { EDIT_ID_ATTR } from './svgDocument';
import { PathPoint } from './svgPath';

// Live preview of the working markup. Clicking an element selects it (mapped via
// its data-svgedit-id); the selected element gets a non-persisted outline. When
// a <path> is selected, draggable point handles are overlaid on top.
export function SvgCanvas({
	markup,
	selectedId,
	onSelect,
	pathEditId,
	pathD,
	onMovePathPoint,
}: Readonly<{
	markup: string;
	selectedId: string;
	onSelect: (id: string) => void;
	pathEditId?: string;
	pathD?: string;
	onMovePathPoint?: (pt: PathPoint, x: number, y: number, phase: 'move' | 'end') => void;
}>) {
	const canvasRef = useRef<HTMLDivElement>(null);

	const onClick = (e: React.MouseEvent) => {
		const target = (e.target as Element)?.closest?.(`[${EDIT_ID_ATTR}]`);
		const id = target?.getAttribute(EDIT_ID_ATTR);
		if (id) onSelect(id);
	};

	return (
		<div className="_svgEditorCanvas" ref={canvasRef}>
			{selectedId ? (
				<style>{`._svgEditorCanvas [${EDIT_ID_ATTR}="${selectedId}"]{outline:2px solid #3b82f6;outline-offset:1px;}`}</style>
			) : null}
			<div
				className="_svgEditorCanvasInner"
				role="presentation"
				onClick={onClick}
				dangerouslySetInnerHTML={{ __html: markup }}
			/>
			{pathEditId && pathD && onMovePathPoint ? (
				<PathPointOverlay
					canvasRef={canvasRef}
					editId={pathEditId}
					d={pathD}
					onMove={onMovePathPoint}
				/>
			) : null}
		</div>
	);
}
