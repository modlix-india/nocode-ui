import {
	isNullValue,
	Repository,
	Schema,
	SchemaType,
	SchemaUtil,
	duplicate,
} from '@fincity/kirun-js';
import { useEffect, useMemo, useState } from 'react';
import { PREVIEW_COMP_DEFINITION_MAP } from '../../FormStorageEditor/components/formCommons';
import { ComponentDefinition, ComponentProperty } from '../../../types/common';
import TextBoxPropertyGenerator from './textBoxProperties';
import CheckBoxPropertyGenerator from './checkBoxProperties';
import DropdownPropertyGenerator from './dropDownProperties';
import arrayRepeatorGenerator from './arrayRepeatorProperties';
import ArrayRepeatorGenerator from './arrayRepeatorProperties';
import { setData } from '../../../context/StoreContext';

const NUMBER_TYPES = new Set([
	SchemaType.INTEGER,
	SchemaType.LONG,
	SchemaType.FLOAT,
	SchemaType.DOUBLE,
]);

const ALL_SET = Schema.ofAny('Any').getType()?.getAllowedSchemaTypes()!;

export default function generateChildren({
	schema: actualSchema = Schema.ofAny('Any'),
	schemaRepository,
	bindingPathPath,
}: {
	schema?: Schema;
	schemaRepository: Repository<Schema>;
	bindingPathPath?: string;
}) {
	const [schema, setSchema] = useState(actualSchema);

	useEffect(() => {
		if (isNullValue(actualSchema.getRef())) {
			setSchema(actualSchema);

			return;
		}
		const resolveSchema = async () => {
			const resolvedSchema = await SchemaUtil.getSchemaFromRef(
				actualSchema,
				schemaRepository,
				actualSchema.getRef(),
			);
			setSchema(resolvedSchema ?? actualSchema);
		};

		resolveSchema();
	}, [actualSchema, schemaRepository]);

	const formData = useMemo(
		() => generateSchemaForm(schema, bindingPathPath),
		[schema, bindingPathPath],
	);

	return formData;
}

function generateSchemaForm(
	schema: Schema,
	bindingPathPath?: string,
	order: { currentOrder: number } = { currentOrder: 0 },
) {
	let componentDefinitions: { [key: string]: ComponentDefinition } = {};
	let children: { [key: string]: boolean } = {};

	let types: Set<SchemaType> = schema.getType()?.getAllowedSchemaTypes() ?? ALL_SET;

	const required: string[] = schema.getRequired() || [];

	if (types.has(SchemaType.OBJECT)) {
		processObjectSchema(schema, bindingPathPath, order, componentDefinitions, children);
	} else if (types.has(SchemaType.ARRAY)) {
		processArraySchema(schema, bindingPathPath, order, componentDefinitions, children);
	} else {
		const label = schema.getTitle() || 'defaultLabel';
		const compDef = compDefinitionGenerator(
			label,
			schema,
			bindingPathPath,
			order.currentOrder,
			required,
		);
		if (compDef) {
			componentDefinitions[compDef.key] = compDef;
			children[compDef.key] = true;
		}
	}

	return {
		children,
		pageDef: {
			name: 'SchemaFormV2',
			baseClientCode: '',
			permission: '',
			isFromUndoRedoStack: false,
			eventFunctions: {},
			clientCode: '',
			appCode: '',
			version: 0,
			translations: {},
			properties: {},
			rootComponent: '',
			componentDefinition: componentDefinitions,
		},
	};
}

function processObjectSchema(
	schema: Schema,
	bindingPathPath: string | undefined,
	order: { currentOrder: number },
	componentDefinitions: { [key: string]: ComponentDefinition },
	children: { [key: string]: boolean },
	required: string[] = [],
) {
	const properties = schema.getProperties() || {};

	if (properties instanceof Map) {
		const gridKey = `objGrid_${order.currentOrder}`;
		const gridCompDef: ComponentDefinition = {
			key: gridKey,
			name: 'Grid',
			displayOrder: order.currentOrder,
			type: 'Grid',
			children: {},
		};

		for (const [propName, subSchema] of properties.entries()) {
			const propBindingPath = bindingPathPath
				? `${bindingPathPath}.${propName}`
				: bindingPathPath;

			const compDef = compDefinitionGenerator(
				propName,
				subSchema as Schema,
				propBindingPath,
				order.currentOrder,
				required,
			);
			if (compDef) {
				componentDefinitions[compDef.key] = compDef;
				gridCompDef.children![compDef.key] = true;
				order.currentOrder++;
			}

			if (
				subSchema.getType()?.getAllowedSchemaTypes()?.has(SchemaType.OBJECT) ||
				subSchema.getType()?.getAllowedSchemaTypes()?.has(SchemaType.ARRAY)
			) {
				const nestedSchema = generateSchemaForm(subSchema, propBindingPath, order);
				Object.assign(componentDefinitions, nestedSchema.pageDef.componentDefinition);
				Object.assign(children, nestedSchema.children);
			}
		}
		componentDefinitions[gridKey] = gridCompDef;
		children[gridKey] = true;
	}
}

function processArraySchema(
	schema: Schema,
	bindingPathPath: string | undefined,
	order: { currentOrder: number },
	componentDefinitions: { [key: string]: ComponentDefinition },
	children: { [key: string]: boolean },
) {
	const itemSchemas = schema.getItems();
	if (!itemSchemas) return;

	const singleSchema = itemSchemas.getSingleSchema();
	const tupleSchema = itemSchemas.getTupleSchema();
	const minItems = schema.getMinItems();

	if (tupleSchema)
		tupleSchema.forEach((subSchema, index) => {
			const eachBindingPath = `${bindingPathPath}[${index}]`;
			if (schema instanceof Schema) {
				if (
					subSchema!.getType()?.getAllowedSchemaTypes()?.has(SchemaType.OBJECT) ||
					subSchema!.getType()?.getAllowedSchemaTypes()?.has(SchemaType.ARRAY)
				) {
					const nestedSchema = generateSchemaForm(
						subSchema as Schema,
						eachBindingPath,
						order,
					);
					Object.assign(componentDefinitions, nestedSchema.pageDef.componentDefinition);
					Object.assign(children, nestedSchema.children);
				} else {
					const eachCompDef = compDefinitionGenerator(
						`Item_${index}`,
						subSchema as Schema,
						eachBindingPath,
						order.currentOrder++,
						[],
						minItems,
						bindingPathPath,
					);
					if (eachCompDef) {
						componentDefinitions[eachCompDef.key] = eachCompDef;
						children[eachCompDef.key] = true;
						order.currentOrder++;
					}
				}
			}
		});

	if (singleSchema) {
		const arrcompDef = compDefinitionGenerator(
			order.currentOrder.toString(),
			schema as Schema,
			bindingPathPath,
			order.currentOrder,
			[],
			minItems,
			bindingPathPath,
		);

		if (arrcompDef) {
			componentDefinitions[arrcompDef.key] = arrcompDef;
			children[arrcompDef.key] = true;
			order.currentOrder++;
		}

		const compDef = compDefinitionGenerator(
			`Item_0`,
			
			singleSchema as Schema,
			'Parent',
			order.currentOrder,
			[],
			minItems,
			bindingPathPath,
		);
		console.log('hh', singleSchema, compDef, bindingPathPath, order.currentOrder, minItems);
		if (compDef) {
			componentDefinitions[compDef.key] = compDef;
			arrcompDef!.children![compDef.key] = true;
			order.currentOrder++;
		}
	}
}

function compDefinitionGenerator(
	label: string,
	schema: Schema,
	bindingPathPath: string | undefined,
	displayOrder: number = 0,
	required: string[] = [],
	minItems?: number,
	arrbindingPathPath?: string,
) {
	let types: Set<SchemaType> = schema.getType()?.getAllowedSchemaTypes() ?? ALL_SET;

	const compName = getComponentName(schema, types);
	if (!compName) return null;
	const isMandatory = required.includes(label);

	const compKey = `${compName}_${label.trim().replace(/\s+/g, '_')}`.toLowerCase();
	const properties = componentPropertyMap[compName]
		? componentPropertyMap[compName](schema, types, isMandatory, arrbindingPathPath, minItems)
		: {};

	const compDef: ComponentDefinition = {
		...(duplicate(PREVIEW_COMP_DEFINITION_MAP.get(compName)) as ComponentDefinition),
		key: compKey,
		name: compName,
		displayOrder: displayOrder,
		type: compName,
		properties: properties,
		children: {},
		bindingPath: bindingPathPath ? { type: 'VALUE', value: `${bindingPathPath}` } : undefined,
	};

	return compDef;
}

function getComponentName(schema: Schema, types: Set<SchemaType>) {
	if (!types || types.size === ALL_SET.size) return null;

	if (types.has(SchemaType.ARRAY) && schema.getItems()?.getSingleSchema()) return 'ArrayRepeater';

	if (schema.getEnums()?.length) return 'Dropdown';

	const hasBoolean = types.has(SchemaType.BOOLEAN);
	if (hasBoolean) return 'CheckBox';

	const hasString = types.has(SchemaType.STRING);
	const hasNumber = [...types].some(type => NUMBER_TYPES.has(type));
	if (hasString || hasNumber) return 'TextBox';

	return null;
}

interface ComponentPropertyGenerator {
	(
		schema: Schema,
		types: Set<SchemaType>,
		isMandatory: boolean,
		arrbindingPathPath?: string,
		minItems?: number,
		bindingPathPath?: string,
	): {
		[key: string]: ComponentProperty<any>;
	};
}

const componentPropertyMap: { [key: string]: ComponentPropertyGenerator } = {
	ArrayRepeater: ArrayRepeatorGenerator,

	TextBox: TextBoxPropertyGenerator,

	CheckBox: CheckBoxPropertyGenerator,

	Dropdown: DropdownPropertyGenerator,
};
