import React, { useState } from 'react';
import NumberField from '../../components/NumberField';
import SelectField from '../../components/SelectField';
import { joinPath } from '../schemaUtils';
import { relChange, TreeContext } from '../types';
import Row from './Row';

export default function ObjectSection({
	schema,
	path,
	ctx,
}: Readonly<{ schema: any; path: string; ctx: TreeContext }>) {
	const fieldChange = relChange(path, ctx);

	const additionalIsBoolean = typeof schema?.additionalProperties === 'boolean';
	const additionalSchema = !additionalIsBoolean ? (
		<Row label="Additional Properties Schema" hint="Schema for properties not listed above">
			{ctx.renderTree({
				schema: schema?.additionalProperties,
				path: path ? `${path}.additionalProperties` : 'additionalProperties',
				depth: 0,
				kind: 'sub',
				label: 'additionalProperties',
				onDelete:
					schema?.additionalProperties !== undefined
						? () => fieldChange('additionalProperties', undefined)
						: undefined,
			})}
		</Row>
	) : undefined;

	return (
		<>
			<NumberField
				label="Min Properties"
				value={schema?.minProperties}
				propPath="minProperties"
				onChange={fieldChange}
			/>
			<NumberField
				label="Max Properties"
				value={schema?.maxProperties}
				propPath="maxProperties"
				onChange={fieldChange}
			/>
			<SelectField
				label="Additional Properties"
				value={additionalIsBoolean ? '' + schema.additionalProperties : ''}
				helpText="Whether properties not listed above are allowed, or a schema they must match"
				onChange={(p, v) => {
					if (v === 'true') fieldChange(p, true);
					else if (v === 'false') fieldChange(p, false);
					else fieldChange(p, undefined);
				}}
				propPath="additionalProperties"
				options={[
					{ label: 'Schema', value: '' },
					{ label: 'True', value: true },
					{ label: 'False', value: false },
				]}
			/>
			{additionalSchema}
			<Row label="Property Names" hint="A string schema every property name must match">
				{ctx.renderTree({
					schema: schema?.propertyNames,
					path: path ? `${path}.propertyNames` : 'propertyNames',
					depth: 0,
					kind: 'sub',
					label: 'propertyNames',
					lockedType: 'STRING',
					onDelete:
						schema?.propertyNames !== undefined
							? () => fieldChange('propertyNames', undefined)
							: undefined,
				})}
			</Row>
			<Row
				label="Pattern Properties"
				hint="Schemas applied to properties whose names match a regex"
			>
				<PatternProperties schema={schema} path={path} ctx={ctx} />
			</Row>
		</>
	);
}

function PatternProperties({
	schema,
	path,
	ctx,
}: Readonly<{ schema: any; path: string; ctx: TreeContext }>) {
	const [draftKey, setDraftKey] = useState<string | undefined>();
	const map: Record<string, any> = schema?.patternProperties ?? {};
	const mapPath = path ? `${path}.patternProperties` : 'patternProperties';

	const rebuild = (mutate: (m: Record<string, any>) => void) => {
		const next: Record<string, any> = { ...map };
		mutate(next);
		ctx.updateAt(mapPath, Object.keys(next).length ? next : undefined);
	};

	const rename = (oldKey: string, newKey: string) => {
		if (!newKey || oldKey === newKey || map[newKey] !== undefined) return;
		const next: Record<string, any> = {};
		for (const [k, v] of Object.entries(map)) next[k === oldKey ? newKey : k] = v;
		ctx.updateAt(mapPath, next);
	};

	return (
		<div className="_patternProperties">
			{Object.entries(map).map(([key, valueSchema]) => (
				<div className="_patternEntry" key={key}>
					<div className="_patternKeyRow">
						<PatternKeyInput value={key} readOnly={ctx.readOnly} onRename={rename} />
						{!ctx.readOnly && (
							<i
								className="fa fa-regular fa-trash-can _rowAction"
								title="Remove pattern"
								onClick={() => rebuild(m => delete m[key])}
							/>
						)}
					</div>
					{ctx.renderTree({
						schema: valueSchema,
						path: joinPath(mapPath, key),
						depth: 1,
						kind: 'sub',
						label: key,
					})}
				</div>
			))}
			{!ctx.readOnly && draftKey === undefined && (
				<button className="_smallButton" onClick={() => setDraftKey('')}>
					<i className="fa fa-solid fa-plus" /> Add pattern
				</button>
			)}
			{draftKey !== undefined && (
				<div className="_patternKeyRow">
					<input
						type="text"
						value={draftKey}
						placeholder="regex, e.g. ^x-"
						autoFocus
						onChange={e => setDraftKey(e.target.value)}
						onKeyDown={e => {
							if (e.key === 'Escape') setDraftKey(undefined);
							else if (e.key === 'Enter') {
								const k = draftKey.trim();
								if (k && map[k] === undefined) {
									rebuild(m => (m[k] = { type: 'STRING' }));
									setDraftKey(undefined);
								}
							}
						}}
						onBlur={() => {
							const k = draftKey.trim();
							if (k && map[k] === undefined)
								rebuild(m => (m[k] = { type: 'STRING' }));
							setDraftKey(undefined);
						}}
					/>
					<span className="_hint">Press Enter to add</span>
				</div>
			)}
		</div>
	);
}

function PatternKeyInput({
	value,
	readOnly,
	onRename,
}: Readonly<{ value: string; readOnly: boolean; onRename: (o: string, n: string) => void }>) {
	const [inValue, setInValue] = useState(value);

	const commit = () => {
		const trimmed = inValue.trim();
		if (!trimmed || trimmed === value) {
			setInValue(value);
			return;
		}
		onRename(value, trimmed);
	};

	return (
		<input
			type="text"
			value={inValue}
			disabled={readOnly}
			onChange={e => setInValue(e.target.value)}
			onKeyDown={e => {
				if (e.key === 'Escape') setInValue(value);
				else if (e.key === 'Enter') commit();
			}}
			onBlur={commit}
		/>
	);
}
