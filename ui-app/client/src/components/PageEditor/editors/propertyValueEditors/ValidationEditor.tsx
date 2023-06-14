import React from 'react';
import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../../../constants';
import { VALIDATION_FUNCTIONS } from '../../../../util/validationProcessor';
import PropertyValueEditor from './PropertyValueEditor';
import PageOperations from '../../functions/PageOperations';

interface ValidationEditorProps {
	value?: any;
	onChange: (v: any) => void;
	storePaths: Set<string>;
	onShowCodeEditor?: (eventName: string) => void;
	slaveStore: any;
	editPageName: string | undefined;
	pageOperations: PageOperations;
}

export function ValidationEditor({
	value,
	onChange,
	storePaths,
	onShowCodeEditor,
	slaveStore,
	editPageName,
	pageOperations,
}: ValidationEditorProps) {
	return (
		<div className="_validationEditor">
			<div className="_eachProp">
				<div className="_propLabel">Validation Type:</div>
				{
					<select
						value={value?.type ?? 'MANDATORY'}
						onChange={e => onChange({ ...value, type: e.target.value })}
						className="_peSelect"
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
					storePaths={storePaths}
					onShowCodeEditor={onShowCodeEditor}
					editPageName={editPageName}
					slaveStore={slaveStore}
					pageOperations={pageOperations}
				/>
			</div>
			{(VALIDATION_FUNCTIONS[value?.type ?? 'MANDATORY'].fields ?? []).map(propDef => (
				<div className="_eachProp" key={propDef.name}>
					<div className="_propLabel">{propDef.displayName}</div>
					<PropertyValueEditor
						propDef={propDef}
						value={value?.[propDef.name]}
						onChange={v => onChange({ ...value, [propDef.name]: v })}
						storePaths={storePaths}
						onShowCodeEditor={onShowCodeEditor}
						editPageName={editPageName}
						slaveStore={slaveStore}
						pageOperations={pageOperations}
					/>
				</div>
			))}
			<div className="_eachProp">
				<div className="_propLabel">Message:</div>
				<PropertyValueEditor
					propDef={{
						name: 'message',
						displayName: 'Message',
						description: 'Message to display when validation fails',
						schema: SCHEMA_STRING_COMP_PROP,
						translatable: true,
					}}
					value={value?.message}
					onChange={v => onChange({ ...value, message: v })}
					storePaths={storePaths}
					onShowCodeEditor={onShowCodeEditor}
					editPageName={editPageName}
					slaveStore={slaveStore}
					pageOperations={pageOperations}
				/>
			</div>
		</div>
	);
}
