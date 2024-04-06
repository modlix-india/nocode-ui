import { Schema, SchemaType, isNullValue } from '@fincity/kirun-js';
import { Editor } from '@monaco-editor/react';
import React from 'react';
import { PageStoreExtractor } from '../../../context/StoreContext';
import {
	ComponentDefinition,
	ComponentPropertyDefinition,
	LocationHistory,
} from '../../../types/common';
import { shortUUID } from '../../../util/shortUUID';
import Portal from '../../Portal';

const getDefinition = (name: string, properties: any, type: string): ComponentDefinition => {
	let key = shortUUID();
	return { type, name: name, key: key, properties: properties ? properties : {} };
};

interface SchemaFormEditorProps {
	defPath: string | undefined;
	pageExtractor: PageStoreExtractor;
	locationHistory: Array<LocationHistory>;
	clickedComponent: string;
	setShowSchemaFormEditor: (key: string) => void;
}

const getValidation = (type: string, props: any, message: string) => {
	let key = shortUUID();
	let validation: any = {};
	validation[key] = { key: key, property: { ...props, message: { value: message }, type: type } };
	return validation;
};

export const gd2 = (
	name: string,
	binding: string,
	schema: Schema,
): { rootKey: string; defs: ComponentDefinition[] } => {
	if (schema.getType()?.contains(SchemaType.OBJECT)) {
		const defs = [];
		const def = getDefinition(name + ' Grid', undefined, 'Grid');
		defs.push(def);
		def.children = {};
		if (schema.getDescription()) {
			const heading = getDefinition(
				'Heading',
				{
					text: {
						value: schema.getDescription(),
					},
					textContainer: {
						value: 'H3',
					},
				},
				'Text',
			);
			def.children[heading.key] = true;
			defs.push(heading);
		}
		const children = Array.from(schema.getProperties()?.entries() ?? []).map(
			([k, v]: [string, Schema]) => gd2(k, `${binding}.${k}`, v),
		);
		children.forEach(child => {
			if (!child.rootKey) return;
			def.children![child.rootKey] = true;
			defs.push(...child.defs);
		});
		return { rootKey: def.key, defs };
	} else if (schema.getType()?.contains(SchemaType.ARRAY)) {
		if (schema.getItems()?.isSingleType()) {
			const def = getDefinition(
				name + 'repeater',
				{
					showAdd: {
						value: true,
					},
					showDelete: {
						value: true,
					},
					showMove: {
						value: true,
					},
				},
				'ArrayRepeater',
			);
			def.bindingPath = {
				type: 'VALUE',
				value: binding,
			};
			def.children = {};
			let singleSchema = schema.getItems()?.getSingleSchema();
			let child = gd2(`Repeater${binding}`, 'Parent', singleSchema!);
			def.children![child.rootKey] = true;
			return { rootKey: def.key, defs: [def, ...child.defs] };
		}
		let defs = [];
		let tupleItems = schema.getItems()?.getTupleSchema() ?? [];
		const children = tupleItems.map((e, i) => gd2(`${name}_${i}`, `${binding}[${i}]`, e));
		const def = getDefinition(name + ' Grid', undefined, 'Grid');
		defs.push(def);
		def.children = {};
		children.forEach(child => {
			if (!child.rootKey) return;
			def.children![child.rootKey] = true;
			defs.push(...child.defs);
		});
		return { rootKey: def.key, defs };
	} else if (schema.getType()?.contains(SchemaType.STRING)) {
		if (schema.getEnums()) {
			let enums: string[] = schema.getEnums()?.map(e => e + '') ?? [];
			const def = getDefinition(
				name + ' Dropdown',
				{
					label: {
						value: schema.getDescription(),
					},
					data: {
						value: enums,
					},
				},
				'Dropdown',
			);
			def.bindingPath = {
				type: 'VALUE',
				value: binding,
			};
			return { rootKey: def.key, defs: [def] };
		}
		const def = getDefinition(
			name + ' TextBox',
			{ ...(schema.getMaxLength() && { maxChars: { value: schema.getMaxLength() } }) },
			'TextBox',
		);
		def.bindingPath = {
			type: 'VALUE',
			value: binding,
		};
		let patternValidation;
		if (schema.getPattern()) {
			patternValidation = {
				value: {
					pattern: {
						value: schema.getPattern(),
					},
				},
			};
		}
		if (patternValidation) {
			def.properties!.validation = getValidation(
				'REGEX',
				patternValidation,
				'Invalid  input',
			);
		}
		let minLengthValidation;
		if (schema.getMinLength()) {
			minLengthValidation = {
				value: {
					minLength: {
						value: schema.getMinLength(),
					},
				},
			};
		}
		if (minLengthValidation) {
			def.properties!.validation = getValidation(
				'STRING_LENGTH',
				minLengthValidation,
				'Invalid  length',
			);
		}
		if (schema.getDescription()) {
			def.properties!.label = { value: schema.getDescription() };
		}
		return { rootKey: def.key, defs: [def] };
	} else if (
		schema.getType()?.contains(SchemaType.INTEGER) ||
		schema.getType()?.contains(SchemaType.LONG) ||
		schema.getType()?.contains(SchemaType.FLOAT) ||
		schema.getType()?.contains(SchemaType.DOUBLE)
	) {
		let props = {
			label: {
				value: name + ' TextBox',
			},
			valueType: {
				value: 'number',
			},
			numberType: {
				value: 'INTEGER',
			},
		};
		let minValue, maxValue, minValueDef, maxValueDef;
		minValue = schema.getMinimum();
		maxValue = schema.getMaximum();

		if (minValue)
			minValueDef = {
				minValue: {
					value: minValue,
				},
			};
		if (maxValue)
			maxValueDef = {
				maxValue: {
					value: maxValue,
				},
			};
		let schemaValidation;
		if (schema.getExclusiveMinimum() || schema.getExclusiveMaximum()) {
			let schemaValue = {
				type: schema.getType(),
				...(schema.getExclusiveMinimum() && {
					exclusiveMinimum: schema.getExclusiveMinimum(),
				}),
				...(schema.getExclusiveMaximum() && {
					exclusiveMaximum: schema.getExclusiveMaximum(),
				}),
			};

			schemaValidation = {
				value: {
					schema: {
						value: schemaValue,
					},
				},
			};
		}
		let minMaxValidation;
		if (minValue || maxValue) {
			minMaxValidation = {
				value: {
					...(minValue && { minValue: { value: minValue } }),
					...(maxValue && { maxValue: { value: maxValue } }),
				},
			};
		}

		const def = getDefinition(
			name + ' Number Box',
			{
				label: {
					value: 'NumberBox',
				},
				valueType: {
					value: 'number',
				},
				numberType: {
					value:
						schema.getType()?.contains(SchemaType.INTEGER) ||
						schema.getType()?.contains(SchemaType.LONG)
							? 'INTEGER'
							: 'DECIMAL',
				},
				validation: {
					...(schemaValidation && {
						...getValidation('SCHEMA_TYPE', schemaValidation, 'Invalid inputs'),
					}),
					...(minMaxValidation && {
						...getValidation('NUMBER_VALUE', minMaxValidation, 'Check range'),
					}),
				},
			},
			'TextBox',
		);
		def.bindingPath = {
			type: 'VALUE',
			value: binding,
		};
		if (schema.getDescription()) {
			def.properties!.label = { value: schema.getDescription() };
		}
		return { rootKey: def.key, defs: [def] };
	} else if (schema.getType()?.contains(SchemaType.BOOLEAN)) {
		let def = getDefinition(name + ' Checkbox', { label: { value: 'CheckBox' } }, 'CheckBox');
		def.bindingPath = { type: 'VALUE', value: binding };
		if (schema.getDescription()) {
			def.properties!.label = { value: schema.getDescription() };
		}
		return { rootKey: def.key, defs: [def] };
	}

	return { rootKey: '', defs: [] };
};

const getIntermediateDefinition = (schema: Schema, bindingPath: string, name: string) => {
	if (schema.getType()?.contains(SchemaType.OBJECT)) {
		let result = {};
		Array.from(schema.getProperties()?.entries() ?? []).forEach(([k, v]) => {
			result = { ...result, ...getIntermediateDefinition(v, `${bindingPath}.${k}`, k) };
		});
		return result;
	}
	if (schema.getType()?.contains(SchemaType.ARRAY)) {
		let result = {};
		if (schema.getItems()?.isSingleType()) {
			let s = schema.getItems()?.getSingleSchema();
			if (!s) return result;
			result = { ...result, ...getIntermediateDefinition(s, bindingPath, name) };
			return result;
		}
		(schema.getItems()?.getTupleSchema() ?? []).forEach((e, i) => {
			result = {
				...result,
				...getIntermediateDefinition(e, `${bindingPath}[${i}]`, `${name}_${i}`),
			};
			return result;
		});
	}
	if (schema.getType()?.contains(SchemaType.STRING)) {
		if (schema.getEnums()) {
			return {
				[name]: {
					name,
					bindingPath,
					type: 'Dropdown',
					options: schema.getEnums(),
				},
			};
		}
		return {
			[name]: {
				name,
				bindingPath,
				type: 'TextBox',
			},
		};
	}
	if (
		schema.getType()?.contains(SchemaType.INTEGER) ||
		schema.getType()?.contains(SchemaType.LONG) ||
		schema.getType()?.contains(SchemaType.FLOAT) ||
		schema.getType()?.contains(SchemaType.DOUBLE)
	) {
		return {
			[name]: {
				name,
				bindingPath,
				type: 'TextBox',
			},
		};
	}
	if (schema.getType()?.contains(SchemaType.BOOLEAN)) {
		return {
			[name]: {
				name,
				bindingPath,
				type: 'Checkbox',
			},
		};
	}

	return {};
};

export default function SchemaFormEditor({
	setShowSchemaFormEditor,
	clickedComponent,
}: SchemaFormEditorProps) {
	const [schemaValue, setSchemaValue] = React.useState('');
	const [editorValue, setEditorValue] = React.useState('');
	const [enableNext, setEnableNext] = React.useState(false);
	const [showNextScreen, setShowNextScreen] = React.useState(false);
	const [givenBindingPath, setGivenBindingPath] = React.useState('');

	const handleClose = () => {
		setShowSchemaFormEditor('');
	};

	React.useEffect(() => {
		setEditorValue(schemaValue);
	}, [schemaValue]);

	const handleNext = () => {
		try {
			const v = JSON.parse(editorValue);
			if (Object.keys(v).length === 0) return;
			setSchemaValue(editorValue);
			setShowNextScreen(true);
		} catch (error) {
			setEnableNext(false);
		}
	};

	const handleCreateForm = () => {
		let schema;
		try {
			schema = Schema.from(JSON.parse(schemaValue));
		} catch (error) {
			console.log(error);
		}
		if (!schema) return;
		console.log(schema);
		console.log(getIntermediateDefinition(schema, givenBindingPath, clickedComponent));
		console.log(gd2(clickedComponent, givenBindingPath, schema));
	};

	return (
		<Portal>
			<div className={`_popupBackground`} onClick={handleClose}>
				<div
					className="_popupContainer _schemaFormEditor"
					onClick={e => e.stopPropagation()}
				>
					Schema Form Editor
					<div className="_schemaFormEditorContainer">
						{!showNextScreen && (
							<div className="_jsonEditorContainer">
								<Editor
									language="json"
									height="100%"
									value={editorValue}
									defaultValue="{}"
									onChange={value => {
										setEditorValue(value ?? '');
										try {
											if (value !== 'undefined' && value !== 'null' && value)
												JSON.parse(value);
											setEnableNext(true);
										} catch (err) {
											setEnableNext(false);
										}
									}}
								/>
							</div>
						)}
						{showNextScreen && (
							<div className="_bindPathContainer">
								<input
									className="_peInput"
									type="text"
									name="bindingPath"
									value={givenBindingPath}
									onChange={e => setGivenBindingPath(e.target.value)}
									placeholder="Please enter the binding path for the form values to be stored."
								/>
								<button
									onClick={handleCreateForm}
									disabled={!givenBindingPath.length}
									className="_button"
								>
									Generate form
								</button>
							</div>
						)}
						<div className="_popupButtons">
							{showNextScreen && (
								<button
									onClick={() => {
										setShowNextScreen(false);
									}}
								>
									Back
								</button>
							)}
							{!showNextScreen && (
								<button disabled={!enableNext} onClick={handleNext}>
									Next
								</button>
							)}

							<button
								onClick={() => {
									setShowSchemaFormEditor('');
								}}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>
		</Portal>
	);
}
