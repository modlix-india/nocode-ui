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
import { duplicate } from '@fincity/kirun-js';
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

		arr.sort((a: any, b: any) => {
			let v = a.order ?? 0 - b.order ?? 0;
			if (v === 0) v = a.key.localeCompare(b.key);
			return v;
		});

		if (arr.length === 0 || (isArray && !arr.some((e: any) => e.isNew))) {
			const order =
				(arr
					.map((e: any) => e.order)
					.reduce((a: number | undefined, c: number | undefined) => {
						if (isNullValue(a)) return c;
						if (isNullValue(c)) return a;
						return a! > c! ? a : c;
					}, undefined) ?? 0) + 1;

			arr.push({
				key: shortUUID(),
				type: onlyValue ? 'VALUE' : 'EXPRESSION',
				isNew: true,
				expression: '',
				order,
			});
		}

		setValues(arr);
	}, [value, isArray]);

	const updateValue = useCallback(
		(key: string, prop: any, value: any, removeProp: boolean = false) => {
			let obj = values.reduce((a: any, c: any) => {
				a[c.key] = c;
				return a;
			}, {});
			if (isNullValue(value) && removeProp && !obj[key].expression) {
				if (values.length === 1) obj = undefined;
				else delete obj[key];
			} else {
				obj[key] = {
					...obj[key],
					[prop]: value,
				};
				if (obj[key].isNew) delete obj[key].isNew;
			}
			const delKey = Object.values(obj ?? {})
				.filter((e: any) => e.isNew && !e.expression && isNullValue(e.value))
				.map((e: any) => e.key as string);
			if (delKey.length) {
				delKey.forEach((e: string) => delete obj[e]);
			}

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

	const moveUpDown = useCallback(
		(key: string, direction: number) => {
			if (values.length < 2) return;
			const ov = duplicate(values);
			ov.forEach((e: any, i: number) => (e.order = i));
			const index = ov.findIndex((e: any) => e.key === key);
			if (index === -1) return;
			if (index === 0 && direction === -1) {
				ov[0].order = ov[ov.length - 1].order + 1;
			} else if (index === ov.length - 2 && direction === 1) {
				ov[ov.length - 2].order = ov[0].order - 1;
			} else {
				const temp = ov[index].order;
				ov[index].order = ov[index + direction].order;
				ov[index + direction].order = temp;
			}
			ov.sort((a: any, b: any) => a.order - b.order).forEach(
				(e: any, i: number) => (e.order = i),
			);

			let obj = ov.reduce((a: any, c: any) => {
				a[c.key] = c;
				return a;
			}, {});
			const delKey = Object.values(obj)
				.filter((e: any) => e.isNew && !e.expression && isNullValue(e.value))
				.map((e: any) => e.key as string);
			if (delKey.length) {
				delKey.forEach((e: string) => delete obj[e]);
			}
			onChange(obj);
		},
		[values, onChange],
	);

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
								updateValue(key, 'value', v, true);
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
				let upDown = <></>;
				if (isArray && !eachValue.isNew && values.length > 2) {
					upDown = (
						<>
							<i
								className="fa fa-arrow-up"
								onClick={() => moveUpDown(eachValue.key, -1)}
							/>
							<i
								className="fa fa-arrow-down"
								onClick={() => moveUpDown(eachValue.key, 1)}
							/>
						</>
					);
				}
				return (
					<div className="_paramEditorRow" key={key}>
						<div className="_paramToggleValueGrid">
							{paramToggle}
							{upDown}
							{fullValueEditor}
						</div>
						{valueEditor}
					</div>
				);
			})}
		</div>
	);
}
