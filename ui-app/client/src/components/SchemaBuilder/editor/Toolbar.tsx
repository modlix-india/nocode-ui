import React from 'react';
import { SearchMode } from './searchUtils';
import { SchemaEditorMode } from './types';

const MODES: Array<[SchemaEditorMode, string, string]> = [
	['COMPACT', 'Compact', 'Tree with one row per field; open a row for all settings'],
	['EXTENDED', 'Extended', 'Tree with every setting visible inline'],
	['JSON', 'JSON', 'Edit the raw schema JSON'],
];

export default function Toolbar({
	mode,
	onMode,
	readOnly,
	search,
	onSearch,
	searchMode,
	onSearchMode,
	matchCount,
	expandAll,
	onExpandAll,
	onSampleImport,
}: Readonly<{
	mode: SchemaEditorMode;
	onMode: (m: SchemaEditorMode) => void;
	readOnly: boolean;
	search: string;
	onSearch: (v: string) => void;
	searchMode: SearchMode;
	onSearchMode: (m: SearchMode) => void;
	matchCount: number;
	expandAll: boolean | undefined;
	onExpandAll: (v: boolean | undefined) => void;
	onSampleImport: () => void;
}>) {
	// Search and expand-all are navigation, not mutation, so they stay available when readOnly.
	const filterBar = mode !== 'JSON' && (
		<div className="_filterBar">
			<input
				type="text"
				className="_searchInput"
				placeholder="Find a field, or type:long"
				value={search}
				onChange={e => onSearch(e.target.value)}
				onKeyDown={e => {
					if (e.key === 'Escape') onSearch('');
				}}
			/>
			{search ? (
				<>
					<span className="_matchCount">
						{matchCount} match{matchCount === 1 ? '' : 'es'}
					</span>
					<i
						className="fa fa-solid fa-xmark _rowAction"
						title="Clear search"
						onClick={() => onSearch('')}
					/>
					<i
						className={`fa fa-solid fa-filter _rowAction ${
							searchMode === 'NARROW' ? '_active' : ''
						}`}
						title={
							searchMode === 'NARROW'
								? 'Showing only matches. Click to show the whole tree again'
								: 'Showing the whole tree. Click to hide everything but the matches'
						}
						onClick={() => onSearchMode(searchMode === 'NARROW' ? 'REVEAL' : 'NARROW')}
					/>
				</>
			) : undefined}
			<i
				className={`fa fa-solid ${
					expandAll === true ? 'fa-circle-minus' : 'fa-circle-plus'
				} _rowAction`}
				title={expandAll === true ? 'Collapse all' : 'Expand all'}
				onClick={() => onExpandAll(expandAll === true ? false : true)}
			/>
		</div>
	);

	return (
		<div className="_toolbar">
			<div className="_segmented">
				{MODES.map(([m, label, title]) => (
					<button
						type="button"
						key={m}
						className={mode === m ? '_on' : ''}
						title={title}
						onClick={() => onMode(m)}
					>
						{label}
					</button>
				))}
			</div>
			{filterBar}
			<span className="_toolbarSpacer" />
			{!readOnly && (
				<button
					type="button"
					className="_smallButton"
					title="Paste a sample payload and build the schema from it"
					onClick={onSampleImport}
				>
					<i className="fa fa-solid fa-wand-magic-sparkles" /> From sample
				</button>
			)}
		</div>
	);
}
