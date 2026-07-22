import React from 'react';
import { SchemaEditorMode } from './types';

const MODES: Array<[SchemaEditorMode, string, string]> = [
	['COMPACT', 'Compact', 'Tree with one row per field; open a row for all settings'],
	['EXTENDED', 'Extended', 'Tree with every setting visible inline'],
	['JSON', 'JSON', 'Edit the raw schema JSON'],
];

export default function Toolbar({
	mode,
	onMode,
}: Readonly<{ mode: SchemaEditorMode; onMode: (m: SchemaEditorMode) => void }>) {
	return (
		<div className="_toolbar">
			<div className="_segmented">
				{MODES.map(([m, label, title]) => (
					<button
						key={m}
						className={mode === m ? '_on' : ''}
						title={title}
						onClick={() => onMode(m)}
					>
						{label}
					</button>
				))}
			</div>
		</div>
	);
}
