import { isNullValue } from '@fincity/kirun-js';
import React from 'react';
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
			<StringField label="Name" value={schema?.name} propPath="name" onChange={fieldChange} />
			<StringField
				label="Namespace"
				value={schema?.namespace}
				propPath="namespace"
				onChange={fieldChange}
			/>
			<NumberField
				label="Version"
				value={schema?.version ?? 1}
				propPath="version"
				onChange={fieldChange}
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
			/>
			<StringField
				label="Comment"
				value={schema?.comment}
				propPath="comment"
				onChange={fieldChange}
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
			{!readOnly && (
				<div className="_enumValue _enumDraft">
					<ValueEditor
						value={undefined}
						types={types}
						readOnly={false}
						onChange={nv => {
							if (!isNullValue(nv)) onChange([...list, nv]);
						}}
					/>
					<span className="_hint">Type a value and press Enter to add</span>
				</div>
			)}
		</div>
	);
}
