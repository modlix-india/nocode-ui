import { Schema, SchemaType, isNullValue } from '@fincity/kirun-js';
import { Editor } from '@monaco-editor/react';
import React, { ReactNode } from 'react';
import { PageStoreExtractor, getDataFromPath, setData } from '../../../context/StoreContext';
import {
	ComponentDefinition,
	LocationHistory,
	PageDefinition,
	RenderContext,
} from '../../../types/common';
import { shortUUID } from '../../../util/shortUUID';
import Portal from '../../Portal';

const closeIcon = (
	<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M12.6449 3.04935C13.1134 2.58082 13.1134 1.81993 12.6449 1.3514C12.1763 0.882867 11.4154 0.882867 10.9469 1.3514L7 5.30205L3.04935 1.35515C2.58082 0.886616 1.81993 0.886616 1.3514 1.35515C0.882867 1.82368 0.882867 2.58457 1.3514 3.0531L5.30205 7L1.35515 10.9506C0.886616 11.4192 0.886616 12.1801 1.35515 12.6486C1.82368 13.1171 2.58457 13.1171 3.0531 12.6486L7 8.69795L10.9506 12.6449C11.4192 13.1134 12.1801 13.1134 12.6486 12.6449C13.1171 12.1763 13.1171 11.4154 12.6486 10.9469L8.69795 7L12.6449 3.04935Z"
			fill="black"
			stroke="#F8FAFB"
			stroke-width="1.5"
		/>
	</svg>
);

const getDefinition = (
	name: string,
	properties: any,
	type: string,
	componentKey: string,
): ComponentDefinition => {
	let key = componentKey;
	return { type, name: name, key: key, properties: properties ? properties : {} };
};

interface IntermediateState {
	[key: string]: {
		name: string;
		bindingPath: string;
		type: string;
		options?: any[] | undefined;
		dataType: string;
		label: string;
		order: number;
		children?: { [key: string]: boolean };
		props?: any;
		componentKey: string;
	};
}

interface SchemaFormEditorProps {
	defPath: string | undefined;
	pageExtractor: PageStoreExtractor;
	locationHistory: Array<LocationHistory>;
	clickedComponent: string;
	setShowSchemaFormEditor: (key: string) => void;
	context: RenderContext;
	hasIntermediateState: boolean;
	intermediateState?: IntermediateState;
}

const getValidation = (type: string, props: any, message: string) => {
	let key = shortUUID();
	let validation: any = {};
	validation[key] = {
		key: key,
		property: { value: { ...props, message: { value: message }, type: type } },
	};
	return validation;
};

export const generateDefinition = (
	initailKey: string,
	intermediateDefinition: IntermediateState,
): { rootKey: string; defs: ComponentDefinition[] } => {
	const currDef = intermediateDefinition[initailKey];
	if (currDef.type === 'Grid') {
		const defs = [];
		const def = getDefinition(name + ' Grid', undefined, 'Grid', currDef.componentKey);
		defs.push(def);
		def.children = {};
		def.displayOrder = currDef.order;
		const children = Object.keys(currDef.children ?? {}).map(key =>
			generateDefinition(key, intermediateDefinition),
		);

		children.forEach(child => {
			if (!child.rootKey) return;
			def.children![child.rootKey] = true;
			defs.push(...child.defs);
		});
		return { rootKey: def.key, defs };
	} else if (currDef.type === 'Repeater') {
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
			currDef.componentKey,
		);
		def.bindingPath = {
			type: 'VALUE',
			value: currDef.bindingPath,
		};
		def.displayOrder = currDef.order;
		def.children = {};
		let child = generateDefinition(
			Object.keys(currDef.children ?? {})[0],
			intermediateDefinition,
		);
		def.children[child.rootKey!] = true;
		return { rootKey: def.key, defs: [def, ...child.defs] };
	} else if (currDef.type === 'TextBox') {
		const def = getDefinition(
			name + ' TextBox',
			{ ...currDef.props, label: { value: currDef.label } },
			'TextBox',
			currDef.componentKey,
		);
		def.bindingPath = {
			type: 'VALUE',
			value: currDef.bindingPath,
		};
		def.displayOrder = currDef.order;
		return { rootKey: def.key, defs: [def] };
	} else if (currDef.type === 'Dropdown') {
		const def = getDefinition(
			name + ' Dropdown',
			{
				...currDef.props,
				data: { value: currDef.options ?? [] },
				label: { value: currDef.label },
			},
			'Dropdown',
			currDef.componentKey,
		);
		def.displayOrder = currDef.order;
		def.bindingPath = {
			type: 'VALUE',
			value: currDef.bindingPath,
		};
		return { rootKey: def.key, defs: [def] };
	} else if (currDef.type === 'CheckBox') {
		const def = getDefinition(
			`${name} CheckBox`,
			{
				...currDef.props,
				data: { value: currDef.options ?? [] },
				label: { value: currDef.label },
			},
			'CheckBox',
			currDef.componentKey,
		);
		def.bindingPath = {
			type: 'VALUE',
			value: currDef.bindingPath,
		};
		def.displayOrder = currDef.order;
		return { rootKey: def.key, defs: [def] };
	} else if (currDef.type === 'RadioButtonGroup') {
		const def = getDefinition(
			name + ' RadioButton',
			{ ...currDef.props, label: { value: currDef.label } },
			'RadioButton',
			currDef.componentKey,
		);
		def.bindingPath = {
			type: 'VALUE',
			value: currDef.bindingPath,
		};
		def.displayOrder = currDef.order;
		return { rootKey: def.key, defs: [def] };
	} else if (currDef.type === 'FileUpload') {
		const def = getDefinition(
			name + ' FileUpload',
			{
				...currDef.props,
				...{
					uploadViewType: {
						value: '_inline_design1',
					},
					uploadIcon: {
						value: ' fa fa-solid fa-user',
					},
					buttonText: {
						value: 'Upload',
					},
					mainText: {
						value: 'Upload Your File(s).',
					},
					subText: {
						value: 'Upload',
					},
					isMultiple: {
						value: false,
					},
				},
			},
			'FileUpload',
			currDef.componentKey,
		);
		def.bindingPath = {
			type: 'VALUE',
			value: currDef.bindingPath,
		};
		def.displayOrder = currDef.order;
		return { rootKey: def.key, defs: [def] };
	}

	return { rootKey: '', defs: [] };
};

const getIntermediateDefinition = (
	schema: Schema,
	bindingPath: string,
	name: string,
	order: number = 1,
	isRequired?: boolean,
): IntermediateState => {
	if (schema.getType()?.contains(SchemaType.OBJECT)) {
		let result = {};
		let required: { [key: string]: boolean } =
			schema.getRequired()?.reduce((a, c) => {
				a = { ...a, c: true };
				return a;
			}, {} as { [key: string]: boolean }) ?? {};
		let grid: IntermediateState = {
			[name]: {
				name,
				bindingPath,
				type: 'Grid',
				dataType: 'Object',
				options: [],
				label: name,
				order,
				componentKey: shortUUID(),
			},
		};
		order += 1;
		let childs: { [key: string]: boolean } = {};
		Array.from(schema.getProperties()?.entries() ?? []).forEach(([k, v], i) => {
			result = {
				...result,
				...getIntermediateDefinition(v, `${bindingPath}.${k}`, k, i + 1, required[k]),
			};
			childs[k] = true;
		});
		order += 1;
		grid[name].children = {
			...childs,
		};
		result = { ...result, ...grid };
		return result;
	}
	if (schema.getType()?.contains(SchemaType.ARRAY)) {
		let result = {};
		if (schema.getItems()?.isSingleType()) {
			let s = schema.getItems()?.getSingleSchema();
			if (!s) return result;
			let repeater: IntermediateState = {
				[name]: {
					name,
					bindingPath,
					type: 'Repeater',
					dataType: 'Array',
					options: [],
					label: name,
					children: { [`${name}_singleschema`]: true },
					order,
					componentKey: shortUUID(),
				},
			};
			order += 1;
			result = {
				...result,
				...getIntermediateDefinition(s, 'Parent', `${name}_singleschema`, 1),
				...repeater,
			};
			return result;
		}
		let grid: IntermediateState = {
			[name]: {
				name,
				bindingPath,
				type: 'Grid',
				dataType: 'Array',
				options: [],
				label: name,
				order,
				componentKey: shortUUID(),
			},
		};
		let childs: { [key: string]: boolean } = {};
		(schema.getItems()?.getTupleSchema() ?? []).forEach((e, i) => {
			result = {
				...result,
				...getIntermediateDefinition(e, `${bindingPath}[${i}]`, `${name}_${i}`, i + 1),
			};
			order += 1;
			childs[`${name}_${i}`] = true;
		});
		grid[name].children = { ...childs };
		result = { ...result, ...grid };
		return result;
	}
	if (schema.getType()?.contains(SchemaType.STRING) || schema.getType() === undefined) {
		if (schema.getEnums()) {
			return {
				[name]: {
					name,
					bindingPath,
					type: 'Dropdown',
					dataType: 'String',
					options: schema.getEnums(),
					label: schema.getDescription() ?? name,
					order: order,
					componentKey: shortUUID(),
					props: {
						...(isRequired && {
							validation: {
								...getValidation(
									'MANDATORY',
									{
										value: {
											message: {
												value: 'Field is mandatory.',
											},
										},
									},
									'Mandatory field.',
								),
							},
						}),
					},
				},
			};
		}
		return {
			[name]: {
				name,
				bindingPath,
				dataType: 'String',
				type: 'TextBox',
				label: schema.getDescription() ?? name,
				order: order,
				componentKey: shortUUID(),
				props: {
					...(!isNullValue(schema.getMaxLength()) && {
						maxChars: { value: schema.getMaxLength() },
					}),
					...((isRequired ||
						schema.getPattern() ||
						!isNullValue(schema.getMinLength())) && {
						validation: {
							...(isRequired && {
								...getValidation(
									'MANDATORY',
									{
										value: {
											message: {
												value: 'Mandatory field',
											},
										},
									},
									'Mandatory field.',
								),
							}),
							...(schema.getPattern() && {
								...getValidation(
									'REGEX',
									{
										value: {
											pattern: {
												value: schema.getPattern(),
											},
										},
									},
									'Invalid format',
								),
							}),
							...(!isNullValue(schema.getMinLength()) && {
								...getValidation(
									'STRING_LENGTH',
									{
										value: {
											minLength: {
												value: schema.getMinLength(),
											},
										},
									},
									'Invalid length',
								),
							}),
						},
					}),
				},
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
				dataType: 'Number',
				type: 'TextBox',
				label: schema.getDescription() ?? name,
				order: order,
				componentKey: shortUUID(),
				props: {
					...((isRequired ||
						!isNullValue(schema.getMinimum()) ||
						!isNullValue(schema.getMaximum()) ||
						!isNullValue(schema.getExclusiveMaximum()) ||
						!isNullValue(schema.getExclusiveMinimum())) && {
						validation: {
							...(isRequired && {
								...getValidation(
									'MANDATORY',
									{
										value: {
											message: {
												value: 'Mandatory field.',
											},
										},
									},
									'Mandatory field.',
								),
							}),
							...(!isNullValue(schema.getMinimum()) && {
								...getValidation(
									'NUMBER_VALUE',
									{ minValue: { value: schema.getMinimum() } },
									'Less than minimum value.',
								),
							}),
							...(!isNullValue(schema.getMaximum()) && {
								...getValidation(
									'NUMBER_VALUE',
									{ minValue: { value: schema.getMaximum() } },
									'Greater than maximum value.',
								),
							}),
							...((!isNullValue(schema.getExclusiveMaximum()) ||
								!isNullValue(schema.getExclusiveMinimum())) && {
								...getValidation(
									'SCHEMA_TYPE',
									{
										type: schema.getType(),
										...(!isNullValue(schema.getExclusiveMinimum()) && {
											exclusiveMinimum: schema.getExclusiveMinimum(),
										}),
										...(!isNullValue(schema.getExclusiveMaximum()) && {
											exclusiveMaximum: schema.getExclusiveMaximum(),
										}),
									},
									'Invalid exclusive min or max value,.',
								),
							}),
						},
					}),
				},
			},
		};
	}
	if (schema.getType()?.contains(SchemaType.BOOLEAN)) {
		return {
			[name]: {
				name,
				bindingPath,
				type: 'CheckBox',
				dataType: 'Boolean',
				label: schema.getDescription() ?? name,
				order: order,
				componentKey: shortUUID(),
				props: {
					...(isRequired && {
						validation: {
							...(isRequired && {
								...getValidation(
									'MANDATORY',
									{
										value: {
											message: {
												value: 'Mandatory field.',
											},
										},
									},
									'Mandatory field.',
								),
							}),
						},
					}),
				},
			},
		};
	}

	return {};
};

export default function SchemaFormEditor({
	setShowSchemaFormEditor,
	clickedComponent,
	defPath,
	locationHistory,
	pageExtractor,
	context,
	hasIntermediateState,
	intermediateState: prevIntermediateState,
}: SchemaFormEditorProps) {
	const [schemaValue, setSchemaValue] = React.useState('');
	const [localSchema, setLocalSchema] = React.useState<Schema>();
	const [editorValue, setEditorValue] = React.useState('');
	const [editedStates, setEditedStates] = React.useState<Array<string>>([]);
	const [localOptionsState, setLocalOptionsState] = React.useState<{ [key: string]: string }>({});
	const [intermediateState, setIntermediateState] = React.useState<IntermediateState>(
		prevIntermediateState ?? ({} as IntermediateState),
	);
	const [enableNext, setEnableNext] = React.useState(hasIntermediateState);
	const [showNextScreen, setShowNextScreen] = React.useState(hasIntermediateState);
	const [givenBindingPath, setGivenBindingPath] = React.useState('');

	const handleClose = () => {
		setShowSchemaFormEditor('');
	};
	console.log(hasIntermediateState, intermediateState, enableNext);
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
			setLocalSchema(schema);
		} catch (error) {
			console.log(error);
		}
		if (!schema) return;
		let interState = getIntermediateDefinition(
			schema,
			givenBindingPath,
			`${clickedComponent}_start`,
		);
		if (interState) {
			let localOptions = Object.entries(interState).reduce<{ [key: string]: string }>(
				(a, [k, v]) => {
					a[k] = v.options?.join(',') ?? '';
					return a;
				},
				{},
			);
			setLocalOptionsState(localOptions);
			setIntermediateState(interState);
			console.log(interState, schema);
		}
	};

	const handleFinish = () => {
		if (!intermediateState) return;
		console.log(defPath, editedStates, 'edited states', intermediateState);
		console.log(getDataFromPath(defPath, locationHistory, pageExtractor), 'getdata');
		const pageDef = getDataFromPath(defPath, locationHistory, pageExtractor) as PageDefinition;
		if (!pageDef?.componentDefinition?.[clickedComponent]) return;
		if (
			pageDef?.componentDefinition?.[clickedComponent].properties?._intermediateDefinition
				?.value
		) {
			if (!editedStates.length) {
				handleClose();
				return;
			}
			editedStates.forEach(e => {
				const compKey = intermediateState[e].componentKey;
				if (!compKey) return;
				if (pageDef.componentDefinition[compKey]) {
					const { rootKey, defs } = generateDefinition(e, intermediateState);
					console.log(
						rootKey,
						defs,
						'new defs',
						e,
						JSON.parse(JSON.stringify(intermediateState[e])),
					);
					let currDef = defs.find(e => e.key === rootKey);
					currDef = {
						...currDef!,
						properties: {
							...(pageDef.componentDefinition[rootKey]?.properties ?? {}),
							...currDef!.properties,
						},
						styleProperties: pageDef.componentDefinition[rootKey].styleProperties,
					};
					pageDef.componentDefinition = {
						...pageDef.componentDefinition,
						[rootKey]: currDef,
					};
				}
			});
			console.log(JSON.parse(JSON.stringify(pageDef)), 'picard');
			setData(defPath!, pageDef, pageExtractor.getPageName());
			handleClose();
			return;
		}
		if (!pageDef.componentDefinition[clickedComponent].children)
			pageDef.componentDefinition[clickedComponent].children = {};

		const formDef = generateDefinition(`${clickedComponent}_start`, intermediateState);
		pageDef.componentDefinition[clickedComponent].children = {
			...pageDef.componentDefinition[clickedComponent].children,
			[formDef.rootKey]: true,
		};
		console.log(formDef);
		formDef.defs.forEach(e => {
			pageDef.componentDefinition[e.key] = e;
		});

		pageDef.componentDefinition[clickedComponent].properties = {
			_intermediateDefinition: { value: intermediateState },
		};

		console.log(pageDef);
		setData(defPath!, pageDef, pageExtractor.getPageName());
		handleClose();
	};

	const handleBindingPathChange = (event: React.ChangeEvent<HTMLInputElement>, key: string) => {
		let newBP = event.target.value;
		setIntermediateState({
			...intermediateState,
			...{
				[key]: {
					...intermediateState![key],
					bindingPath: newBP,
				},
			},
		});

		if (editedStates.indexOf(key) === -1) {
			setEditedStates([...editedStates, key]);
		}
	};

	const handleOptionsChange = (event: React.ChangeEvent<HTMLInputElement>, key: string) => {
		let options = event.target.value
			.trim()
			.split(',')
			.map(e => e.trim())
			.filter(e => !!e);
		setLocalOptionsState({ ...localOptionsState, ...{ [key]: event.target.value } });
		setIntermediateState({
			...intermediateState,
			...{
				[key]: {
					...intermediateState![key],
					options,
				},
			},
		});

		if (editedStates.indexOf(key) === -1) {
			setEditedStates([...editedStates, key]);
		}
	};

	const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>, key: string) => {
		let newLabel = event.target.value;
		setIntermediateState({
			...intermediateState,
			...{
				[key]: {
					...intermediateState![key],
					label: newLabel,
				},
			},
		});
		if (editedStates.indexOf(key) === -1) {
			setEditedStates([...editedStates, key]);
		}
	};

	const handleTypeChange = (
		event: React.ChangeEvent<HTMLSelectElement>,
		value: {
			name: string;
			bindingPath: string;
			type: string;
			options?: any[] | undefined;
			dataType: string;
			componentKey: string;
		},
		key: string,
	) => {
		if (event.target.value == 'Dropdown' || event.target.value === 'RadioButtonGroup') {
			setIntermediateState({
				...intermediateState,
				...{
					[key]: {
						...intermediateState![key],
						type: event.target.value,
						options: value.options || [],
					},
				},
			});
			if (editedStates.indexOf(key) === -1) {
				setEditedStates([...editedStates, key]);
			}
			return;
		}
		setIntermediateState({
			...intermediateState,
			...{
				[key]: {
					...intermediateState![key],
					type: event.target.value,
				},
			},
		});
		if (editedStates.indexOf(key) === -1) {
			setEditedStates([...editedStates, key]);
		}
	};

	const editorList = (key: string, intermediateState: IntermediateState) => {
		const value = intermediateState[key];
		const row = (
			<tr key={`${value.bindingPath}_${value.name}`}>
				<td title={key}>{key}</td>
				<td>
					<input
						type="text"
						className="_peInput"
						value={value.label}
						onChange={evnt => handleLabelChange(evnt, key)}
					/>
				</td>
				<td>{value.dataType}</td>
				<td>
					{value.dataType === 'String' ? (
						<select
							className="_peInput"
							value={value.type}
							onChange={e => handleTypeChange(e, value, key)}
						>
							<option value="TextBox">TextBox</option>
							<option value="Dropdown">Dropdown</option>
							<option value="RadioButtonGroup">RadioButtonGroup</option>
							<option value="FileUpload">File Upload</option>
						</select>
					) : (
						value.type
					)}
				</td>
				<td>
					<input
						className="_peInput"
						type="text"
						value={value.bindingPath}
						onChange={evnt => handleBindingPathChange(evnt, key)}
					/>
				</td>
				<td>
					{value.options ||
					value.type === 'Dropdown' ||
					value.type === 'RadioButtonGroup' ? (
						<input
							type="text"
							className="_peInput"
							value={localOptionsState[key]}
							onChange={evnt => handleOptionsChange(evnt, key)}
						/>
					) : null}
				</td>
			</tr>
		);

		const rows: ReactNode[] = [];

		rows.push(row);

		if (value.children) {
			Object.keys(value.children).forEach((childKey: string) => {
				rows.push(...editorList(childKey, intermediateState));
			});
		}

		return rows;
	};

	return (
		<Portal>
			<div className={`_popupBackground`} onClick={handleClose}>
				<div
					className="_popupContainer _schemaFormEditor"
					onClick={e => e.stopPropagation()}
				>
					<div className="_header">
						Schema Form{' '}
						<span onClick={handleClose} className="_close_btn">
							{closeIcon}
						</span>
					</div>
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
							<div className="_nextScreen">
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
										Change binding path
									</button>
								</div>
								<div className="_tableContainer">
									<table>
										<thead>
											<tr>
												<th>Name</th>
												<th>Label</th>
												<th>Data Type</th>
												<th>Type</th>
												<th>Binding Path</th>
												<th>Options</th>
											</tr>
										</thead>
										<tbody>
											{intermediateState[`${clickedComponent}_start`] ? (
												editorList(
													`${clickedComponent}_start`,
													intermediateState,
												)
											) : (
												<tr>
													<td>No data available.</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</div>
						)}
						<div className="_popupButtons">
							<button
								className="_textButton"
								onClick={() => {
									setShowSchemaFormEditor('');
								}}
							>
								Cancel
							</button>
							{
								<button
									className="_button"
									disabled={!enableNext}
									onClick={showNextScreen ? () => handleFinish() : handleNext}
								>
									Save Schema
								</button>
							}
						</div>
					</div>
				</div>
			</div>
		</Portal>
	);
}
