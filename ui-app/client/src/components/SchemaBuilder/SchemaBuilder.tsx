import React, { useEffect } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './schemaBuilderProperties';
import SchemaFormStyle from './SchemaBuilderStyle';
import SingleSchema from './components/SingleSchema';
import { UISchemaRepository } from '../../schemas/common';
import { isNullValue } from '@fincity/kirun-js';
import { styleDefaults } from './schemaBuilderStyleProperies';

function SchemaBuilder(props: ComponentProps) {
	const {
		definition,
		definition: { bindingPath },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: { readOnly, rootSchemaType } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const [value, setValue] = React.useState<any>();
	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately((_, v) => setValue(v), pageExtractor, bindingPathPath);
	}, [bindingPathPath]);

	const isReadonly = readOnly || !bindingPathPath;

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	return (
		<div className="comp compSchemaBuilder" style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={definition} />
			<SingleSchema
				schema={value}
				type={rootSchemaType}
				onChange={v => {
					if (isReadonly) return;
					if (rootSchemaType) {
						v.type = rootSchemaType;
					}
					if (isNullValue(v.version)) {
						v.version = 1;
					}
					setData(bindingPathPath!, v, pageExtractor.getPageName());
				}}
				schemaRepository={UISchemaRepository}
				shouldShowNameNamespace={true}
			/>
		</div>
	);
}

const component: Component = {
	name: 'SchemaBuilder',
	displayName: 'Schema Builder',
	description: 'Schema Builder component',
	component: SchemaBuilder,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: SchemaFormStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		type: 'SchemaBuilder',
		name: 'SchemaBuilder',
		properties: {},
	},
	bindingPaths: {
		bindingPath: { name: 'Schema binding' },
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: 'fa-solid fa-shapes',
		},
	],
};

export default component;
