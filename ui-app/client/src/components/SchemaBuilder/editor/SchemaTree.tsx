import { isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import NodeDetailsEditor from './NodeDetailsEditor';
import TypeSelector from './TypeSelector';
import {
	addProperty,
	childNodesOf,
	getEffectiveTypes,
	removeProperty,
	renameProperty,
	toggleRequired,
} from './schemaUtils';
import { TreeContext, TreeNodeProps } from './types';

export default function SchemaTree(props: Readonly<TreeNodeProps & { ctx: TreeContext }>) {
	const {
		schema,
		path,
		depth,
		kind,
		propName,
		parentSchema,
		parentPath,
		label,
		lockedType,
		showNameNamespace,
		onDelete,
		onMoveUp,
		onMoveDown,
		ctx,
	} = props;

	const [draftName, setDraftName] = useState<string | undefined>();

	const types = getEffectiveTypes(schema);
	const children = childNodesOf(schema, path);
	const isObjectish = types.includes('OBJECT') || !isNullValue(schema?.properties);
	const isArrayish = types.includes('ARRAY');
	const canExpand = children.length > 0 || draftName !== undefined;
	const expanded = canExpand && ctx.isExpanded(path, depth);
	// Extended mode force-opens details only for nodes present in the data; empty sub-schema
	// slots (not/additionalProperties/contains/...) stay closed or the recursion never ends.
	const detailsOpen =
		ctx.isDetailsOpen(path) ||
		(ctx.mode === 'EXTENDED' && (kind !== 'sub' || !isNullValue(schema)));

	const typePath = path ? `${path}.type` : 'type';

	const caret = (
		<i
			className={`fa fa-solid fa-caret-right _caret ${expanded ? '_open' : ''} ${
				canExpand ? '' : '_hidden'
			}`}
			onClick={() => canExpand && ctx.toggleExpand(path)}
		/>
	);

	let nameComp;
	if (kind === 'property') {
		nameComp = (
			<PropertyName
				name={propName!}
				readOnly={ctx.readOnly}
				onRename={newName =>
					ctx.updateAt(parentPath ?? '', renameProperty(parentSchema, propName!, newName))
				}
			/>
		);
	} else {
		let text = label;
		if (!text) {
			if (kind === 'root') text = schema?.name ?? 'root';
			else text = 'items';
		}
		nameComp = <span className="_nodeName _fixed">{text}</span>;
	}

	let requiredComp;
	if (kind === 'property') {
		const required =
			Array.isArray(parentSchema?.required) && parentSchema.required.includes(propName);
		requiredComp = (
			<label className="_requiredCheck" title="Required in the parent object">
				<input
					type="checkbox"
					checked={required}
					disabled={ctx.readOnly}
					onChange={e =>
						ctx.updateAt(
							parentPath ?? '',
							toggleRequired(parentSchema, propName!, e.target.checked),
						)
					}
				/>
				required
			</label>
		);
	}

	const badges = [];
	if (schema?.ref)
		badges.push(
			<span key="ref" className="_badge" title={schema.ref}>
				ref
			</span>,
		);
	if (!isNullValue(schema?.constant))
		badges.push(
			<span key="const" className="_badge">
				const
			</span>,
		);
	if (schema?.enums?.length)
		badges.push(
			<span key="enum" className="_badge">
				enum
			</span>,
		);

	let addComp;
	if (isObjectish && !ctx.readOnly) {
		addComp = (
			<i
				className="fa fa-solid fa-plus _rowAction"
				title="Add property"
				onClick={() => {
					setDraftName('');
					if (!expanded && canExpand) ctx.toggleExpand(path);
				}}
			/>
		);
	} else if (isArrayish && isNullValue(schema?.items) && !ctx.readOnly) {
		addComp = (
			<i
				className="fa fa-solid fa-plus _rowAction"
				title="Add item schema"
				onClick={() => ctx.updateAt(path ? `${path}.items` : 'items', { type: 'STRING' })}
			/>
		);
	}

	const detailsToggle = ctx.mode === 'COMPACT' && (
		<i
			className={`fa fa-solid fa-gear _rowAction ${detailsOpen ? '_active' : ''}`}
			title="All settings for this field"
			onClick={() => ctx.toggleDetails(path)}
		/>
	);

	let deleteComp;
	if (!ctx.readOnly) {
		if (onDelete) {
			deleteComp = (
				<i
					className="fa fa-regular fa-trash-can _rowAction"
					title="Remove"
					onClick={onDelete}
				/>
			);
		} else if (kind === 'property') {
			deleteComp = (
				<i
					className="fa fa-regular fa-trash-can _rowAction"
					title="Remove property"
					onClick={() =>
						ctx.updateAt(parentPath ?? '', removeProperty(parentSchema, propName!))
					}
				/>
			);
		}
	}

	const row = (
		<div className={`_nodeRow ${kind === 'root' ? '_rootRow' : ''}`}>
			{caret}
			{nameComp}
			<TypeSelector
				types={types}
				lockedType={lockedType}
				readOnly={ctx.readOnly}
				disabledReason={
					schema?.ref ? 'A reference replaces this node’s own type' : undefined
				}
				onChange={t => {
					let v: any;
					if (t.length === 1) v = t[0];
					else if (t.length > 1) v = t;
					ctx.updateAt(typePath, v);
				}}
			/>
			{requiredComp}
			{badges}
			<span className="_rowSpacer" />
			{onMoveUp && !ctx.readOnly && (
				<i
					className="fa fa-solid fa-arrow-up _rowAction"
					title="Move up"
					onClick={onMoveUp}
				/>
			)}
			{onMoveDown && !ctx.readOnly && (
				<i
					className="fa fa-solid fa-arrow-down _rowAction"
					title="Move down"
					onClick={onMoveDown}
				/>
			)}
			{addComp}
			{detailsToggle}
			{deleteComp}
		</div>
	);

	const details = detailsOpen ? (
		<NodeDetailsEditor
			schema={schema}
			path={path}
			kind={kind}
			lockedType={lockedType}
			showNameNamespace={showNameNamespace}
			ctx={ctx}
		/>
	) : undefined;

	function childDelete(child: { kind: string; path: string; index?: number }) {
		if (child.kind === 'tupleItem')
			return () => {
				const items = [...schema.items];
				items.splice(child.index!, 1);
				ctx.updateAt(path ? `${path}.items` : 'items', items.length ? items : undefined);
			};
		if (child.kind === 'item') return () => ctx.updateAt(child.path, undefined);
		return undefined;
	}

	function moveTupleItem(index: number, delta: number) {
		const items = [...schema.items];
		const [moved] = items.splice(index, 1);
		items.splice(index + delta, 0, moved);
		ctx.updateAt(path ? `${path}.items` : 'items', items);
	}

	let childComps: React.ReactNode[] | undefined = undefined;
	if (expanded) {
		childComps = children.map(child =>
			ctx.renderTree({
				schema: child.schema,
				path: child.path,
				depth: depth + 1,
				kind: child.kind,
				propName: child.kind === 'property' ? child.key : undefined,
				parentSchema: schema,
				parentPath: path,
				label: child.kind === 'property' ? undefined : child.key,
				onDelete: childDelete(child),
				onMoveUp:
					child.kind === 'tupleItem' && child.index! > 0
						? () => moveTupleItem(child.index!, -1)
						: undefined,
				onMoveDown:
					child.kind === 'tupleItem' && child.index! < schema.items.length - 1
						? () => moveTupleItem(child.index!, 1)
						: undefined,
			}),
		);
	}

	const draftRow =
		draftName !== undefined ? (
			<div className="_nodeRow _draftRow" style={{ marginLeft: 20 }}>
				<i className="fa fa-solid fa-caret-right _caret _hidden" />
				<DraftNameInput
					value={draftName}
					invalid={!!draftName && schema?.properties?.[draftName] !== undefined}
					onChange={setDraftName}
					onCommit={name => {
						const trimmed = name.trim();
						if (trimmed && schema?.properties?.[trimmed] === undefined) {
							ctx.updateAt(path, addProperty(schema, trimmed));
							setDraftName(undefined);
						} else if (!trimmed) setDraftName(undefined);
					}}
					onCancel={() => setDraftName(undefined)}
				/>
				<span className="_hint">Press Enter to add</span>
			</div>
		) : undefined;

	return (
		<div className="_schemaNode">
			{row}
			{details}
			{!!(childComps?.length || draftRow) && (
				<div className="_nodeChildren">
					{childComps}
					{draftRow}
				</div>
			)}
		</div>
	);
}

function PropertyName({
	name,
	readOnly,
	onRename,
}: Readonly<{ name: string; readOnly: boolean; onRename: (newName: string) => void }>) {
	const [inValue, setInValue] = useState(name);
	useEffect(() => setInValue(name), [name]);

	const commit = () => {
		const trimmed = inValue.trim();
		if (!trimmed || trimmed === name) {
			setInValue(name);
			return;
		}
		onRename(trimmed);
	};

	return (
		<input
			className="_nodeName"
			type="text"
			value={inValue}
			disabled={readOnly}
			onChange={e => setInValue(e.target.value)}
			onKeyDown={e => {
				if (e.key === 'Escape') setInValue(name);
				else if (e.key === 'Enter') commit();
			}}
			onBlur={commit}
		/>
	);
}

function DraftNameInput({
	value,
	invalid,
	onChange,
	onCommit,
	onCancel,
}: Readonly<{
	value: string;
	invalid: boolean;
	onChange: (v: string) => void;
	onCommit: (v: string) => void;
	onCancel: () => void;
}>) {
	return (
		<input
			className={`_nodeName ${invalid ? '_invalid' : ''}`}
			type="text"
			value={value}
			placeholder="property name"
			autoFocus
			onChange={e => onChange(e.target.value)}
			onKeyDown={e => {
				if (e.key === 'Escape') onCancel();
				else if (e.key === 'Enter') onCommit(value);
			}}
			onBlur={() => onCommit(value)}
		/>
	);
}
