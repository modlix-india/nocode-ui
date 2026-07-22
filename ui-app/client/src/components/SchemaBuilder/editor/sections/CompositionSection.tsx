import React from 'react';
import ArrayField from '../../components/ArrayField';
import { relChange, TreeContext } from '../types';
import Row from './Row';

const COMPOSITION_KEYWORDS: Array<[string, string, string]> = [
	['anyOf', 'Any of (anyOf)', 'Value must match at least one of these schemas'],
	['oneOf', 'One of (oneOf)', 'Value must match exactly one of these schemas'],
	['allOf', 'All of (allOf)', 'Value must match every one of these schemas'],
];

export default function CompositionSection({
	schema,
	path,
	ctx,
}: Readonly<{ schema: any; path: string; ctx: TreeContext }>) {
	const fieldChange = relChange(path, ctx);

	return (
		<>
			{COMPOSITION_KEYWORDS.map(([keyword, label, hint]) => (
				<Row key={keyword} label={label} hint={hint}>
					<SchemaList
						list={schema?.[keyword]}
						path={path ? `${path}.${keyword}` : keyword}
						ctx={ctx}
					/>
				</Row>
			))}
			<Row label="Not (not)" hint="Value must NOT match this schema">
				{ctx.renderTree({
					schema: schema?.not,
					path: path ? `${path}.not` : 'not',
					depth: 0,
					kind: 'sub',
					label: 'not',
					onDelete:
						schema?.not !== undefined ? () => fieldChange('not', undefined) : undefined,
				})}
			</Row>
			<ArrayField
				label="Examples"
				value={schema?.examples}
				propPath="examples"
				onChange={fieldChange}
				type="ANY"
				schemaRepository={ctx.schemaRepository}
			/>
		</>
	);
}

function SchemaList({
	list,
	path,
	ctx,
}: Readonly<{ list: any[] | undefined; path: string; ctx: TreeContext }>) {
	const schemas = Array.isArray(list) ? list : [];

	const move = (index: number, delta: number) => {
		const next = [...schemas];
		const [moved] = next.splice(index, 1);
		next.splice(index + delta, 0, moved);
		ctx.updateAt(path, next);
	};

	return (
		<div className="_schemaList">
			{schemas.map((s, i) => (
				<div className="_schemaListEntry" key={`${path}[${i}]`}>
					{ctx.renderTree({
						schema: s,
						path: `${path}[${i}]`,
						depth: 1,
						kind: 'sub',
						label: `#${i + 1}`,
						onDelete: () => {
							const next = schemas.filter((_, j) => j !== i);
							ctx.updateAt(path, next.length ? next : undefined);
						},
						onMoveUp: i > 0 ? () => move(i, -1) : undefined,
						onMoveDown: i < schemas.length - 1 ? () => move(i, 1) : undefined,
					})}
				</div>
			))}
			{!ctx.readOnly && (
				<button
					className="_smallButton"
					onClick={() => ctx.updateAt(path, [...schemas, {}])}
				>
					<i className="fa fa-solid fa-plus" /> Add schema
				</button>
			)}
		</div>
	);
}
