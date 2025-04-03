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

	console.log('comp', componentDefinitions);

	return {
		children,
		pageDef: {
			name: 'SchemaForm2',
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
	const maxItems = schema.getMaxItems();
	const minItems = schema.getMinItems();

	const isTupleSchema = Array.isArray(tupleSchema);
	const arrKey = `arrayRepeator${order.currentOrder}`;
	const gridKey = `grid_${arrKey}`;

	const showAdd: ComponentProperty<any> =
		maxItems && !tupleSchema
			? {
					value: true,
					location: {
						type: 'EXPRESSION',
						expression: `{{${bindingPathPath}.length?? 0}} < ${maxItems} ? true : false`,
					},
				}
			: { value: !isTupleSchema };
	const arrayRepeatorComp: ComponentDefinition = {
		key: arrKey,
		name: 'Repeator',
		displayOrder: order.currentOrder,
		type: 'ArrayRepeater',
		bindingPath: bindingPathPath ? { type: 'VALUE', value: `${bindingPathPath}` } : undefined,
		properties: {
			showAdd: showAdd,
			showDelete: { value: !isTupleSchema },
			dataType: { value: 'array' },
		},
		children: {},
	};
	componentDefinitions[arrayRepeatorComp.key] = arrayRepeatorComp;
	children[arrayRepeatorComp.key] = true;
	order.currentOrder++;

	// const gridCompDef: ComponentDefinition = {
	// 	key: gridKey,
	// 	name: 'Grid',
	// 	displayOrder: order.currentOrder,
	// 	type: 'Grid',
	// 	children: {},
	// };

	// componentDefinitions[gridCompDef.key] = gridCompDef;
	// order.currentOrder++;
	const schemaFinal = isTupleSchema ? tupleSchema : [singleSchema];

	schemaFinal.forEach((subSchema, index) => {
		const eachBindingPath = isTupleSchema ? `${bindingPathPath}[${index}]` : 'Parent';

		if (schema instanceof Schema) {
			if (subSchema!.getType()?.getAllowedSchemaTypes()?.has(SchemaType.OBJECT)) {
				const nestedSchema = generateSchemaForm(
					subSchema as Schema,
					eachBindingPath,
					order,
				);
				Object.assign(componentDefinitions, nestedSchema.pageDef.componentDefinition);
				Object.assign(
					!isTupleSchema ? arrayRepeatorComp.children! : children,
					nestedSchema.children,
				);
			} else {
				const eachCompDef = compDefinitionGenerator(
					`Item ${index}`,
					subSchema as Schema,
					eachBindingPath,
					order.currentOrder++,
					[],
					minItems,
					bindingPathPath,
				);
				if (eachCompDef) {
					componentDefinitions[eachCompDef.key] = eachCompDef;
					!isTupleSchema
						? (arrayRepeatorComp.children![eachCompDef.key] = true)
						: (children[eachCompDef.key] = true);
					order.currentOrder++;
				}
			}
		}
	});
}

function compDefinitionGenerator(
	label: string,
	schema: Schema,
	bindingPathPath?: string,
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
		bindingPath: bindingPathPath ? { type: 'VALUE', value: `${bindingPathPath}` } : undefined,
	};

	return compDef;
}

function getComponentName(schema: Schema, types: Set<SchemaType>) {
	if (!types || types.size === ALL_SET.size) return null;

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
	): {
		[key: string]: ComponentProperty<any>;
	};
}

const componentPropertyMap: { [key: string]: ComponentPropertyGenerator } = {
	TextBox: TextBoxPropertyGenerator,

	CheckBox: CheckBoxPropertyGenerator,

	Dropdown: DropdownPropertyGenerator,
};
