import { isNullValue, Schema, SchemaType } from '@fincity/kirun-js';
import { ComponentDefinition, PageDefinition } from '../../../types/common';
import { shortUUID } from '../../../util/shortUUID';
import { useEffect } from 'react';

function getComponentType(typeSet: Set<string>): string {
    if (typeSet == null) return "";
	if (typeSet instanceof Set) {
		if (typeSet.has('Boolean')) return 'CheckBox';
		if (typeSet.has('String')) return 'TextBox';
	}
	return 'TextBox';
}

export function generateSchemaForm2(schema: any) {
	let pageDef: PageDefinition = {
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
		componentDefinition: {},
	};

	let children: { [key: string]: boolean } = {};
	const ALL_SET = Schema.ofAny('Any').getType()?.getAllowedSchemaTypes()!;

	let types: Set<SchemaType> = schema.getType()?.getAllowedSchemaTypes() ?? ALL_SET;

	const uuid = shortUUID();

	console.log('types', types);
	console.log('schema', schema);

	let tempCompDef: ComponentDefinition = {
		key: uuid,
		displayOrder: 0,
		name: getComponentType(types),
		type: getComponentType(types),
		bindingPath: {
			value: `Page.form`,
			type: 'EXPRESSION',
		},
	};
	pageDef.componentDefinition[uuid] = tempCompDef;
	children[uuid] = true;
	console.log('pageDef5', pageDef);
	console.log('children5', children);

	return { children, pageDef };
}
