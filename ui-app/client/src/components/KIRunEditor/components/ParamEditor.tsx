import {
	Parameter,
	ParameterType,
	Repository,
	Schema,
	SchemaUtil,
	isNullValue,
} from '@fincity/kirun-js';
import React, { useCallback, useEffect } from 'react';
import { shortUUID } from '../../../util/shortUUID';
import duplicate from '../../../util/duplicate';
import SchemaForm from '../../SchemaForm/SchemaForm';
import { PageDefinition, LocationHistory, RenderContext } from '../../../types/common';
import { AnyValueEditor } from '../../PageEditor/editors/propertyValueEditors/AnyValueEditor';

interface ParamEditorProps {
	parameter: Parameter;
	schemaRepository: Repository<Schema>;
	value: any;
	onChange: (newValue: any) => void;
	pageDefinition: PageDefinition;
	locationHistory: Array<LocationHistory>;
	context: RenderContext;
}

export default function ParamEditor({
	parameter,
	schemaRepository,
	value,
	onChange,
	pageDefinition,
	locationHistory,
	context,
}: ParamEditorProps) {
	const onlyValue = parameter.getType() === ParameterType.CONSTANT;
	const isArray = parameter.isVariableArgument();
	const [values, setValues] = React.useState<any[]>([]);

	useEffect(() => {
		let inValue = value;
		let arr = [];
		if (isNullValue(inValue)) {
			if (!isArray) {
				const defaultValue = SchemaUtil.getDefaultValue(
					parameter.getSchema(),
					schemaRepository,
				);
				if (!isNullValue(defaultValue)) {
					arr.push({
						key: shortUUID(),
						type: 'VALUE',
						isNew: true,
						expression: '',
						value: defaultValue,
					});
				}
			}
		} else {
			arr = duplicate(Array.from(Object.values(inValue ?? {})));
		}

		if (arr.length === 0 || isArray) {
			arr.push({
				key: shortUUID(),
				type: onlyValue ? 'VALUE' : 'EXPRESSION',
				isNew: true,
				expression: '',
			});
		}
		setValues(arr);
	}, [value, isArray]);

	const updateValue = useCallback(
		(key: string, prop: any, value: any) => {
			const obj = values.reduce((a: any, c: any) => {
				a[c.key] = c;
				return a;
			}, {});
			obj[key] = {
				...obj[key],
				[prop]: value,
			};
			if (obj[key].isNew) delete obj[key].isNew;
			onChange(obj);
		},
		[values, onChange],
	);

	let schema = parameter.getSchema();
	if (!isNullValue(schema.getRef())) {
		schema =
			SchemaUtil.getSchemaFromRef(schema, schemaRepository, schema.getRef()) ??
			parameter.getSchema();
	}

	return (
		<div className="_paramEditor">
			{values.map(eachValue => {
				const key = eachValue.key;
				const valueEditor =
					eachValue.type === 'EXPRESSION' ? (
						<div className="_paramExpression">
							<input
								value={eachValue.expression ?? ''}
								onChange={e => updateValue(key, 'expression', e.target.value)}
							/>
						</div>
					) : (
						<SchemaForm.component
							context={context}
							pageDefinition={pageDefinition}
							locationHistory={locationHistory}
							schemaRepository={schemaRepository}
							schema={schema}
							value={eachValue.value}
							definition={{
								key: eachValue.key,
								name: 'SchemaForm',
								type: 'SchemaForm',
								properties: {
									showJSONEditorButton: { value: false },
								},
							}}
							onChange={(v: any) => {
								updateValue(key, 'value', v);
							}}
						/>
					);
				const paramToggle = onlyValue ? (
					<></>
				) : (
					<div className="_paramToggleContainer">
						<div
							className={`_paramEditorToggle ${
								eachValue.type === 'EXPRESSION' ? '' : '_value'
							}`}
							title={
								eachValue.type === 'EXPRESSION'
									? 'Change to Value'
									: 'Change to Expression'
							}
							onClick={e =>
								updateValue(
									key,
									'type',
									eachValue.type === 'EXPRESSION' ? 'VALUE' : 'EXPRESSION',
								)
							}
						>
							{eachValue.type === 'EXPRESSION' ? 'Expr' : 'Value'}
						</div>
					</div>
				);
				const fullValueEditor =
					eachValue.type === 'VALUE' ? (
						<AnyValueEditor
							value={eachValue.value === undefined ? null : eachValue.value}
							onChange={v => {
								updateValue(key, 'value', v);
							}}
							isIconButton={true}
						/>
					) : (
						<></>
					);
				return (
					<div className="_paramEditorRow" key={key}>
						<div className="_paramToggleValueGrid">
							{paramToggle}
							{fullValueEditor}
						</div>
						{valueEditor}
					</div>
				);
			})}
		</div>
	);
}
