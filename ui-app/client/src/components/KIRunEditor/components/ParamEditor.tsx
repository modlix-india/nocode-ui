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

interface ParamEditorProps {
	parameter: Parameter;
	schemaRepository: Repository<Schema>;
	value: any;
	onChange: (newValue: any) => void;
}

export default function ParamEditor({
	parameter,
	schemaRepository,
	value,
	onChange,
}: ParamEditorProps) {
	console.log(parameter, value);
	if (parameter.getType() === ParameterType.CONSTANT) {
		return <></>;
	}

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
				type: 'EXPRESSION',
				isNew: true,
				expression: '',
				value: '',
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
							schemaRepository={schemaRepository}
							schema={schema}
							definition={{
								key: eachValue.key,
								name: 'SchemaForm',
								type: 'SchemaForm',
								properties: {},
							}}
							onChange={(v: any) => {
								console.log(v);
							}}
						/>
					);
				return (
					<div className="_paramEditorRow" key={key}>
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
						{valueEditor}
					</div>
				);
			})}
		</div>
	);
}
