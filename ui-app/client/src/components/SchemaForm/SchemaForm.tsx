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
import { propertiesDefinition, stylePropertiesDefinition } from './schemaFormProperties';
import SchemaFormStyle from './SchemaFormStyle';
import {
	deepEqual,
	isNullValue,
	Repository,
	Schema,
	SchemaType,
	SchemaUtil,
	TypeUtil,
} from '@fincity/kirun-js';
import { AnyValueEditor } from '../PageEditor/editors/propertyValueEditors/AnyValueEditor';
import { UISchemaRepository } from '../../schemas/common';
import SingleSchema from './components/SingleSchemaForm';

function SchemaForm(
	props: ComponentProps & {
		schema?: Schema;
		schemaRepository?: Repository<Schema>;
		onChange?: (value: any) => void;
		value?: any;
	},
) {
	const {
		definition,
		definition: { bindingPath },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: { schema: jsonSchema, design, readOnly, showJSONEditorButton } = {},
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

	const [value, setValue] = React.useState<any>(null);
	useEffect(() => {
		if (!bindingPathPath) {
			setValue(props.value);
			return;
		}
		return addListenerAndCallImmediately((_, v) => setValue(v), pageExtractor, bindingPathPath);
	}, [bindingPathPath, props.value]);

	const isReadonly = readOnly || (!bindingPathPath && !props.onChange);

	const schema = React.useMemo(() => props.schema ?? Schema.from(jsonSchema), [jsonSchema]);

	const resolvedStyles = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);
	const schemaRepository = props.schemaRepository ?? UISchemaRepository;

	return (
		<div className="comp compSchemaForm" style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={definition} />
			{showJSONEditorButton && (
				<AnyValueEditor
					value={value === undefined ? null : value}
					onChange={v => {
						if (isReadonly || deepEqual(v, value)) return;
						if (bindingPathPath)
							setData(bindingPathPath, v, pageExtractor.getPageName());
						else if (props.onChange) props.onChange(v);
					}}
				/>
			)}
			<SingleSchema
				schema={schema}
				path=""
				value={value}
				schemaRepository={schemaRepository}
				onChange={(path, v) => {
					console.log(path, v);
				}}
			/>
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-highlighter',
	name: 'SchemaForm',
	displayName: 'Schema Form',
	description: 'Schema Form component',
	component: SchemaForm,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: SchemaFormStyle,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		type: 'SchemaForm',
		name: 'SchemaForm',
		properties: {},
	},
	bindingPaths: {
		bindingPath: { name: 'Schema value binding' },
	},
};

export default component;
