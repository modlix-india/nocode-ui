import React from 'react';
import { ShapeKind } from './common';

const SHAPES: Array<{ kind: ShapeKind; label: string; icon: string }> = [
	{ kind: 'rect', label: 'Rectangle', icon: 'fa-square' },
	{ kind: 'circle', label: 'Circle', icon: 'fa-circle' },
	{ kind: 'ellipse', label: 'Ellipse', icon: 'fa-circle-notch' },
	{ kind: 'line', label: 'Line', icon: 'fa-slash' },
	{ kind: 'path', label: 'Path', icon: 'fa-bezier-curve' },
	{ kind: 'text', label: 'Text', icon: 'fa-font' },
];

export function AddShapeToolbar({ onAdd }: Readonly<{ onAdd: (kind: ShapeKind) => void }>) {
	return (
		<div className="_svgEditorShapes">
			<span className="_groupLabel">Add</span>
			{SHAPES.map(s => (
				<button
					key={s.kind}
					type="button"
					className="_svgToolButton"
					title={`Add ${s.label}`}
					onClick={() => onAdd(s.kind)}
				>
					<i className={`fa fa-solid ${s.icon}`} />
				</button>
			))}
		</div>
	);
}
