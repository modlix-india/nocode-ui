import React from 'react';
import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../../../constants';
import { VALIDATION_FUNCTIONS } from '../../../../util/validationProcessor';
import PropertyValueEditor from './PropertyValueEditor';
import { PageOperations } from '../../functions/PageOperations';
import { Dropdown } from '../stylePropertyValueEditors/simpleEditors/Dropdown';
import { ComponentPropertyDefinition } from '../../../../types/common';

interface ValidationEditorProps {
	value?: any;
	onChange: (v: any) => void;
	storePaths: Set<string>;
	onShowCodeEditor?: (eventName: string) => void;
	slaveStore: any;
	editPageName: string | undefined;
	pageOperations: PageOperations;
	validationTypes:any;
}

export function ValidationEditor({
	value,
	onChange,
	storePaths,
	onShowCodeEditor,
	slaveStore,
	editPageName,
	pageOperations,
	validationTypes,
}: ValidationEditorProps) {
    

	const FILTERED_VALIDATION_FUNCTIONS = validationTypes && validationTypes.length > 0
    ? Object.keys(VALIDATION_FUNCTIONS)
        .filter(name => validationTypes.includes(name))
        .reduce((acc, name) => {
            acc[name] = VALIDATION_FUNCTIONS[name];
            return acc;
        }, {} as { [key: string]: any })
    : VALIDATION_FUNCTIONS;

	return (
		<div className="_validationEditor">
			<div className="_eachProp">
				<div className="_propLabel">Validation Type:</div>

				<Dropdown
					value={value?.type ?? 'MANDATORY'}
					showNoneLabel={false}
					onChange={v => {
						onChange({ ...value, type: v === '' || !v ? 'MANDATORY' : v });
					}}
					options={Object.entries(FILTERED_VALIDATION_FUNCTIONS).map(e => ({
						name: e[0],
						displayName: e[1].displayName,
					}))}
				/>
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

			{(FILTERED_VALIDATION_FUNCTIONS[value?.type ?? 'MANDATORY'].fields ?? []).map((propDef: ComponentPropertyDefinition) => (
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
