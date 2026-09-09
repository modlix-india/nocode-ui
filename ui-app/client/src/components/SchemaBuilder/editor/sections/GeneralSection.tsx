import { isNullValue } from '@fincity/kirun-js';
import React, { useState } from 'react';
import NumberField from '../../components/NumberField';
import StringField from '../../components/StringField';
import RefPicker from '../RefPicker';
import ValueEditor from '../ValueEditor';
import { relChange, TreeContext } from '../types';
import Row from './Row';

export default function GeneralSection({
	schema,
	path,
	types,
	showNameNamespace,
	ctx,
}: Readonly<{
	schema: any;
	path: string;
	types: string[];
	showNameNamespace?: boolean;
	ctx: TreeContext;
}>) {
	const fieldChange = relChange(path, ctx);

	const nameNamespace = showNameNamespace ? (
		<>
			<StringField
				label="Name"
				value={schema?.name}
				propPath="name"
				onChange={fieldChange}
				readOnly={ctx.readOnly}
			/>
			<StringField
				label="Namespace"
				value={schema?.namespace}
				propPath="namespace"
				onChange={fieldChange}
				readOnly={ctx.readOnly}
			/>
			<NumberField
				label="Version"
				value={schema?.version ?? 1}
				propPath="version"
				onChange={fieldChange}
				readOnly={ctx.readOnly}
			/>
		</>
	) : undefined;

	return (
		<>
			{nameNamespace}
			<Row label="Default Value" hint="Used when a null value is provided">
				<ValueEditor
					value={schema?.defaultValue}
					types={types}
					readOnly={ctx.readOnly}
					onChange={v => fieldChange('defaultValue', v)}
				/>
			</Row>
			<Row
				label="Reference (ref)"
				hint="A reference replaces this node's own type and constraints"
			>
				<RefPicker
					value={schema?.ref}
					onChange={v => fieldChange('ref', v)}
					schemaRepository={ctx.schemaRepository}
					readOnly={ctx.readOnly}
				/>
			</Row>
			<Row label="Allowed Values (enum)" hint="Only these exact values validate">
				<EnumEditor
					enums={schema?.enums}
					types={types}
					readOnly={ctx.readOnly}
					onChange={v => fieldChange('enums', v)}
				/>
			</Row>
			<Row
				label="Constant"
				hint="This value is used irrespective of the value provided; all other fields are ignored"
			>
				<ValueEditor
					value={schema?.constant}
					types={types}
					readOnly={ctx.readOnly}
					onChange={v => fieldChange('constant', v)}
				/>
			</Row>
			<StringField
				label="Description"
				value={schema?.description}
				textArea={true}
				propPath="description"
				onChange={fieldChange}
				readOnly={ctx.readOnly}
			/>
			<StringField
				label="Comment"
				value={schema?.comment}
				propPath="comment"
				onChange={fieldChange}
				readOnly={ctx.readOnly}
			/>
		</>
	);
}

function EnumEditor({
	enums,
	types,
	readOnly,
	onChange,
}: Readonly<{
	enums: any[] | undefined;
	types: string[];
	readOnly: boolean;
	onChange: (v: any[] | undefined) => void;
}>) {
	const list = Array.isArray(enums) ? enums : [];

	const move = (index: number, delta: number) => {
		const next = [...list];
		const [moved] = next.splice(index, 1);
		next.splice(index + delta, 0, moved);
		onChange(next);
	};

	return (
		<div className="_enumEditor">
			{list.map((v, i) => (
				<div className="_enumValue" key={`${i}-${JSON.stringify(v) ?? ''}`}>
					<ValueEditor
						value={v}
						types={types}
						readOnly={readOnly}
						onChange={nv => {
							const next = [...list];
							next[i] = nv;
							onChange(next);
						}}
					/>
					{!readOnly && (
						<>
							{i > 0 && (
								<i
									className="fa fa-solid fa-arrow-up _rowAction"
									title="Move up"
									onClick={() => move(i, -1)}
								/>
							)}
							{i < list.length - 1 && (
								<i
									className="fa fa-solid fa-arrow-down _rowAction"
									title="Move down"
									onClick={() => move(i, 1)}
								/>
							)}
							<i
								className="fa fa-regular fa-trash-can _rowAction"
								title="Remove value"
								onClick={() => {
									const next = list.filter((_, j) => j !== i);
									onChange(next.length ? next : undefined);
								}}
							/>
						</>
					)}
				</div>
			))}
			{!readOnly && <EnumDraft types={types} onAdd={nv => onChange([...list, nv])} />}
		</div>
	);
}

/**
 * The draft row for a new enum value.
 *
 * ValueEditor's text inputs keep their own state and resync only when the `value` prop changes.
 * The draft's value is permanently undefined, so committing never cleared the box, and the blur
 * that followed an Enter committed the same text a second time. Remounting on each commit is
 * what resets it; the counter lives here so EnumEditor keeps one job.
 */
function EnumDraft({ types, onAdd }: Readonly<{ types: string[]; onAdd: (v: any) => void }>) {
	const [seq, setSeq] = useState(0);

	return (
		<div className="_enumValue _enumDraft">
			<ValueEditor
				key={seq}
				value={undefined}
				types={types}
				autoFocus={seq > 0}
				readOnly={false}
				onChange={nv => {
					if (isNullValue(nv)) return;
					onAdd(nv);
					setSeq(s => s + 1);
				}}
			/>
			<span className="_hint">Type a value and press Enter to add</span>
		</div>
	);
}
