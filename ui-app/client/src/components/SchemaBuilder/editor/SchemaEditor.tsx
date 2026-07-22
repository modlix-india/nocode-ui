import { Repository, Schema } from '@fincity/kirun-js';
import React, { useCallback, useMemo, useState } from 'react';
import JsonView from './JsonView';
import SchemaTree from './SchemaTree';
import Toolbar from './Toolbar';
import { applySchemaChange } from './schemaUtils';
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
	};

	const treeMode = mode === 'EXTENDED' ? 'EXTENDED' : 'COMPACT';

	const ctx: TreeContext = useMemo(() => {
		const defaultExpanded = (depth: number) => (treeMode === 'EXTENDED' ? true : depth < 2);
		const context: TreeContext = {
			mode: treeMode,
			readOnly,
			schemaRepository,
			updateAt,
			isExpanded: (path, depth) =>
				toggledExpands.has(path) ? !defaultExpanded(depth) : defaultExpanded(depth),
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
	}, [treeMode, readOnly, schemaRepository, updateAt, toggledExpands, openDetails]);

	return (
		<div className="_schemaEditor">
			<Toolbar mode={mode} onMode={changeMode} />
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
					})}
				</div>
			)}
		</div>
	);
}
