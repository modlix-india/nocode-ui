import React from 'react';
import { SCHEMA_BOOL_COMP_PROP } from '../../../../constants';
import { VALIDATION_FUNCTIONS } from '../../../../util/validationProcessor';
import PropertyValueEditor from './PropertyValueEditor';

interface ValidationEditorProps {
	value?: any;
	onChange: (v: any) => void;
}

export function ValidationEditor({ value, onChange }: ValidationEditorProps) {
	return (
		<div className="_validationEditor">
			<div className="_eachProp">
				<div className="_propLabel">Validation Type:</div>
				{
					<select
						value={value?.type ?? 'MANDATORY'}
						onChange={e => onChange({ ...value, type: e.target.value })}
					>
						{Object.entries(VALIDATION_FUNCTIONS)
							.sort()
							.map(e => (
								<option key={e[0]} value={e[0]}>
									{e[1].displayName}
								</option>
							))}
					</select>
				}
			</div>
			<div className="_eachProp">
				<div className="_propLabel">Condition:</div>
				<PropertyValueEditor
					propDef={{
						name: 'condition',
						displayName: 'Condition',
						description: 'Truthy condition to execute validation',
						schema: SCHEMA_BOOL_COMP_PROP,
					}}
					value={value?.condition}
					onChange={v => onChange({ ...value, condition: v })}
				/>
			</div>
			{(VALIDATION_FUNCTIONS[value?.type ?? 'MANDATORY'].fields ?? []).map(propDef => (
				<div className="_eachProp">
					<div className="_propLabel">{propDef.displayName}</div>
					<PropertyValueEditor
						key={propDef.name}
						propDef={propDef}
						value={value?.[propDef.name]}
						onChange={v => onChange({ ...value, [propDef.name]: v })}
					/>
				</div>
			))}
		</div>
	);
}
