import React, { useState } from 'react';
import { SvgNode } from './common';

function TreeRow({
	node,
	depth,
	selectedId,
	onSelect,
}: Readonly<{
	node: SvgNode;
	depth: number;
	selectedId: string;
	onSelect: (id: string) => void;
}>) {
	const [open, setOpen] = useState(true);
	const hasChildren = node.children.length > 0;

	return (
		<div className="_svgTreeNode">
			<button
				type="button"
				className={`_svgTreeRow ${node.editId === selectedId ? '_selected' : ''}`}
				style={{ paddingLeft: depth * 12 + 4 }}
				onClick={() => onSelect(node.editId)}
			>
				{hasChildren ? (
					<i
						role="presentation"
						className={`_caret fa fa-solid fa-caret-${open ? 'down' : 'right'}`}
						onClick={e => {
							e.stopPropagation();
							setOpen(o => !o);
						}}
					/>
				) : (
					<span className="_caretSpacer" />
				)}
				<span className="_label">{node.label}</span>
			</button>
			{open &&
				node.children.map(c => (
					<TreeRow
						key={c.editId}
						node={c}
						depth={depth + 1}
						selectedId={selectedId}
						onSelect={onSelect}
					/>
				))}
		</div>
	);
}

export function ElementTree({
	tree,
	selectedId,
	onSelect,
}: Readonly<{ tree: SvgNode | null; selectedId: string; onSelect: (id: string) => void }>) {
	if (!tree) return <div className="_svgEditorEmpty">No valid SVG</div>;
	return (
		<div className="_svgEditorTree">
			<TreeRow node={tree} depth={0} selectedId={selectedId} onSelect={onSelect} />
		</div>
	);
}
