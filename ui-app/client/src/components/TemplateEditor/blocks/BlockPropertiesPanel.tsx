import React, { useState } from 'react';
import { VariableEntry } from '../util/variableUtils';
import { Block, BLOCK_TYPES, BlockPropField, COMMON_STYLE_FIELDS, NO_STYLE_WRAPPER } from './blockTypes';

interface BlockPropertiesPanelProps {
	block: Block;
	variables: VariableEntry[];
	onChange: (props: Record<string, any>) => void;
	onClose: () => void;
}

function Field({
	field,
	value,
	onChange,
}: Readonly<{ field: BlockPropField; value: any; onChange: (v: any) => void }>) {
	switch (field.kind) {
		case 'textarea':
			return (
				<textarea
					className="_bpInput _bpTextarea"
					value={value ?? ''}
					placeholder={field.placeholder}
					onChange={e => onChange(e.target.value)}
				/>
			);
		case 'number':
			return (
				<input
					className="_bpInput"
					type="number"
					value={value ?? ''}
					onChange={e => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
				/>
			);
		case 'color':
			return (
				<div className="_bpColor">
					<input
						type="color"
						value={value ?? '#000000'}
						onChange={e => onChange(e.target.value)}
					/>
					<input
						className="_bpInput"
						value={value ?? ''}
						onChange={e => onChange(e.target.value)}
					/>
				</div>
			);
		case 'select':
			return (
				<select
					className="_bpInput"
					value={value ?? ''}
					onChange={e => onChange(e.target.value)}
				>
					{(field.options ?? []).map(o => (
						<option key={o.value} value={o.value}>
							{o.label}
						</option>
					))}
				</select>
			);
		case 'code':
			return (
				<textarea
					className="_bpInput _bpTextarea _bpCodeArea"
					value={value ?? ''}
					placeholder={field.placeholder}
					spellCheck={false}
					onChange={e => onChange(e.target.value)}
				/>
			);
		default:
			return (
				<input
					className="_bpInput"
					value={value ?? ''}
					placeholder={field.placeholder}
					onChange={e => onChange(e.target.value)}
				/>
			);
	}
}

export default function BlockPropertiesPanel({
	block,
	variables,
	onChange,
	onClose,
}: Readonly<BlockPropertiesPanelProps>) {
	const def = BLOCK_TYPES[block.type];
	const [showVars, setShowVars] = useState(false);
	const [showStyle, setShowStyle] = useState(false);
	const hasStyleWrapper = !NO_STYLE_WRAPPER.has(block.type);

	return (
		<div className="_blockProps">
			<div className="_bpHeader">
				<span>{def.label} block</span>
				<button className="_bpClose" onClick={onClose} title="Deselect">
					<i className="fa fa-solid fa-xmark" />
				</button>
			</div>

			{def.fields.map(f => (
				<label className="_bpField" key={f.key}>
					<span>{f.label}</span>
					<Field field={f} value={block.props?.[f.key]} onChange={v => onChange({ [f.key]: v })} />
				</label>
			))}

			{hasStyleWrapper && (
				<div className="_bpSection">
					<button className="_bpSectionToggle" onClick={() => setShowStyle(s => !s)}>
						Spacing &amp; background {showStyle ? '▴' : '▾'}
					</button>
					{showStyle &&
						COMMON_STYLE_FIELDS.map(f => (
							<label className="_bpField" key={f.key}>
								<span>{f.label}</span>
								<Field
									field={f}
									value={block.props?.[f.key]}
									onChange={v => onChange({ [f.key]: v })}
								/>
							</label>
						))}
				</div>
			)}

			<div className="_bpVars">
				<button className="_bpVarsToggle" onClick={() => setShowVars(s => !s)}>
					Available variables {showVars ? '▴' : '▾'}
				</button>
				{showVars && (
					<div className="_bpVarsList">
						{variables.length === 0 && (
							<div className="_varEmpty">
								Define variables in the Variables panel to see them here.
							</div>
						)}
						{variables.map(v => (
							<button
								key={v.path}
								className="_bpVarItem"
								title="Copy token"
								onClick={() => navigator.clipboard?.writeText(v.token)}
							>
								<span className="_varPath">{v.token}</span>
								{v.type && <span className="_varType">{v.type}</span>}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
