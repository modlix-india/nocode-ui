import { Repository, Schema } from '@fincity/kirun-js';
import React, { useCallback, useMemo, useState } from 'react';
import JsonView from './JsonView';
import SampleImport from './SampleImport';
import SchemaTree from './SchemaTree';
import Toolbar from './Toolbar';
import { applySchemaChange } from './schemaUtils';
import { buildSearchIndex, emptyIndex, SearchMode } from './searchUtils';
import { SchemaEditorMode, TreeContext, TreeNodeProps } from './types';

export interface SchemaEditorProps {
	value: any;
	onChange: (v: any) => void;
	schemaRepository: Repository<Schema>;
	readOnly?: boolean;
	defaultMode?: SchemaEditorMode;
	rootType?: string;
	showNameNamespace?: boolean;
}

export default function SchemaEditor({
	value,
	onChange,
	schemaRepository,
	readOnly = false,
	defaultMode = 'COMPACT',
	rootType,
	showNameNamespace = false,
}: Readonly<SchemaEditorProps>) {
	const [mode, setMode] = useState<SchemaEditorMode>(defaultMode);
	const [toggledExpands, setToggledExpands] = useState<Set<string>>(new Set());
	const [openDetails, setOpenDetails] = useState<Set<string>>(new Set());
	const [search, setSearch] = useState('');
	const [searchMode, setSearchMode] = useState<SearchMode>('REVEAL');
	// Tri-state: true expands everything, false collapses everything, undefined leaves the
	// depth-based default in charge. "Collapse all" and "back to normal" are different states.
	const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);
	const [showSampleImport, setShowSampleImport] = useState(false);

	const updateAt = useCallback(
		(path: string, v: any) => {
			if (readOnly) return;
			onChange(path === '' ? (v ?? {}) : applySchemaChange(value, path, v));
		},
		[value, onChange, readOnly],
	);

	const changeMode = (m: SchemaEditorMode) => {
		setMode(m);
		setToggledExpands(new Set());
		setOpenDetails(new Set());
		setExpandAll(undefined);
	};

	const treeMode = mode === 'EXTENDED' ? 'EXTENDED' : 'COMPACT';

	const searchIndex = useMemo(
		() =>
			mode === 'JSON' ? emptyIndex(searchMode) : buildSearchIndex(value, search, searchMode),
		[value, search, searchMode, mode],
	);

	const ctx: TreeContext = useMemo(() => {
		const defaultExpanded = (depth: number) => {
			if (expandAll !== undefined) return expandAll;
			return treeMode === 'EXTENDED' ? true : depth < 2;
		};
		const context: TreeContext = {
			mode: treeMode,
			readOnly,
			schemaRepository,
			search: searchIndex,
			searchQuery: search,
			updateAt,
			isExpanded: (path, depth) => {
				// A match's ancestors open regardless, and nothing is written to the toggle set,
				// so clearing the search restores the user's own expansion exactly.
				if (searchIndex.active && searchIndex.forceExpand.has(path)) return true;
				return toggledExpands.has(path) ? !defaultExpanded(depth) : defaultExpanded(depth);
			},
			toggleExpand: path =>
				setToggledExpands(prev => {
					const next = new Set(prev);
					if (next.has(path)) next.delete(path);
					else next.add(path);
					return next;
				}),
			isDetailsOpen: path => openDetails.has(path),
			toggleDetails: path =>
				setOpenDetails(prev => {
					const next = new Set(prev);
					if (next.has(path)) next.delete(path);
					else next.add(path);
					return next;
				}),
			renderTree: () => null,
		};
		context.renderTree = (props: TreeNodeProps) => (
			<SchemaTree key={props.path} {...props} ctx={context} />
		);
		return context;
	}, [
		treeMode,
		readOnly,
		schemaRepository,
		updateAt,
		toggledExpands,
		openDetails,
		searchIndex,
		search,
		expandAll,
	]);

	const setAllExpanded = (v: boolean | undefined) => {
		setExpandAll(v);
		// Without this, previously toggled nodes invert against the new baseline and the tree
		// comes back randomly half open.
		setToggledExpands(new Set());
	};

	return (
		<div className="_schemaEditor">
			<Toolbar
				mode={mode}
				onMode={changeMode}
				readOnly={readOnly}
				search={search}
				onSearch={setSearch}
				searchMode={searchMode}
				onSearchMode={setSearchMode}
				matchCount={searchIndex.count}
				expandAll={expandAll}
				onExpandAll={setAllExpanded}
				onSampleImport={() => setShowSampleImport(true)}
			/>
			{mode === 'JSON' ? (
				<JsonView value={value} onChange={v => updateAt('', v)} readOnly={readOnly} />
			) : (
				<div className="_schemaTree">
					{ctx.renderTree({
						schema: value,
						path: '',
						depth: 0,
						kind: 'root',
						lockedType: rootType,
						showNameNamespace,
						filterable: true,
					})}
				</div>
			)}
			{showSampleImport && (
				<SampleImport
					current={value}
					rootType={rootType}
					onApply={v => {
						updateAt('', v);
						setShowSampleImport(false);
					}}
					onClose={() => setShowSampleImport(false)}
				/>
			)}
		</div>
	);
}
