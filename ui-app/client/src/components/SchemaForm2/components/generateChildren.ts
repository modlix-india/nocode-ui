import {
	isNullValue,
	Repository,
	Schema,
	SchemaType,
	SchemaUtil,
	duplicate,
	SchemaValidator,
} from '@fincity/kirun-js';
import { useEffect, useState } from 'react';
import { PREVIEW_COMP_DEFINITION_MAP } from '../../FormStorageEditor/components/formCommons';
import { ComponentDefinition, ComponentProperty, RenderContext } from '../../../types/common';
import TextBoxPropertyGenerator from './TextBox';
import CheckBoxPropertyGenerator from './CheckBox';
import DropdownPropertyGenerator from './DropDown';

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

	return generateSchemaForm(schema, bindingPathPath);
}

function compDefinitionGenerator(
	label: string,
	schema: Schema,
	bindingPathPath?: string,
	displayOrder: number = 0,
) {
	let types: Set<SchemaType> = schema.getType()?.getAllowedSchemaTypes() ?? ALL_SET;

	const compName = getComponentName(schema, types);
	if (!compName) return null;

	const compKey = `${compName}_${label.trim().replace(/\s+/g, '_')}`.toLowerCase();
	const properties = componentPropertyMap[compName]
		? componentPropertyMap[compName](schema, types)
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

function generateSchemaForm(
	schema: Schema,
	bindingPathPath?: string,
	order: { currentOrder: number } = { currentOrder: 0 },
) {
	let componentDefinitions: { [key: string]: ComponentDefinition } = {};
	let children: { [key: string]: boolean } = {};

	let types: Set<SchemaType> = schema.getType()?.getAllowedSchemaTypes() ?? ALL_SET;

	if (types.has(SchemaType.OBJECT)) {
		const properties = schema.getProperties() || {};

		if (properties instanceof Map) {
			const propertiesArray = Array.from(properties.entries());

			propertiesArray.forEach(([propName, subSchema]) => {
				const propBindingPath = bindingPathPath
					? `${bindingPathPath}.${propName}`
					: bindingPathPath;

				const compDef = compDefinitionGenerator(
					propName,
					subSchema as Schema,
					propBindingPath,
					order.currentOrder,
				);
				if (compDef) {
					componentDefinitions[compDef.key] = compDef;
					children[compDef.key] = true;
					order.currentOrder++;
				}

				if (subSchema.getType()?.getAllowedSchemaTypes()?.has(SchemaType.OBJECT)) {
					const nestedSchema = generateSchemaForm(subSchema, propBindingPath, order);
					Object.assign(componentDefinitions, nestedSchema.pageDef.componentDefinition);
					Object.assign(children, nestedSchema.children);
				}
			});
		}
	} else {
		const label = schema.getTitle() || 'defaultLabel';
		const compDef = compDefinitionGenerator(label, schema, bindingPathPath, order.currentOrder);
		if (compDef) {
			componentDefinitions[compDef.key] = compDef;
			children[compDef.key] = true;
		}
	}

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

function getComponentName(schema: Schema, types: Set<SchemaType>) {
	if (!types || types.size === ALL_SET.size) return null;

	if (schema.getEnums()?.length) return 'Dropdown';

	const hasBoolean = types.has(SchemaType.BOOLEAN);
	if (hasBoolean) return 'CheckBox';

	const hasArray = types.has(SchemaType.ARRAY);
	if (hasArray) return 'Dropdown';

	const hasString = types.has(SchemaType.STRING);
	const hasNumber = [...types].some(type => NUMBER_TYPES.has(type));
	if (hasString || hasNumber) return 'TextBox';

	return null;
}

interface ComponentPropertyGenerator {
	(
		schema: Schema,
		types: Set<SchemaType>,
		bindingPathPath?: string,
	): {
		[key: string]: ComponentProperty<any>;
	};
}

const componentPropertyMap: { [key: string]: ComponentPropertyGenerator } = {
	TextBox: TextBoxPropertyGenerator,

	CheckBox: CheckBoxPropertyGenerator,

	Dropdown: DropdownPropertyGenerator,
};
