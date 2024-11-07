import { deepEqual, duplicate, Repository, Schema } from '@fincity/kirun-js';
import { setStoreData, StoreExtractor } from '@fincity/path-reactive-state-management';
import React, { useEffect } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { UISchemaRepository } from '../../schemas/common';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { AnyValueEditor } from '../PageEditor/editors/propertyValueEditors/AnyValueEditor';
import useDefinition from '../util/useDefinition';
import SingleSchema from './components/SingleSchemaForm';
import { propertiesDefinition, stylePropertiesDefinition } from './schemaFormProperties';
import SchemaFormStyle from './SchemaFormStyle';
import { styleDefaults } from './schemaFormStyleProperies';
import { IconHelper } from '../util/IconHelper';

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

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);
	const schemaRepository = props.schemaRepository ?? UISchemaRepository;

	return (
		<div className="comp compSchemaForm" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			{showJSONEditorButton && (
				<AnyValueEditor
					value={value === undefined ? null : value}
					onChange={v => {
						if (isReadonly || deepEqual(v, value)) return;
						if (bindingPathPath)
							setData(bindingPathPath, v, pageExtractor.getPageName());
						else if (props.onChange) props.onChange(v);
					}}
					isIconButton={true}
				/>
			)}
			<SingleSchema
				schema={schema}
				path=""
				value={value}
				schemaRepository={schemaRepository}
				onChange={(path, v) => {
					const internal = { value: duplicate(value) };

					const map = new Map([['Internal.', new StoreExtractor(internal, 'Internal.')]]);

					setStoreData(
						'Internal.value' + (path ? '.' + path : ''),
						internal,
						v,
						'Internal',
						map,
					);

					if (bindingPathPath) {
						setData(bindingPathPath, internal.value, pageExtractor.getPageName());
					}
					props.onChange?.(internal.value);
				}}
			/>
		</div>
	);
}

const component: Component = {
	name: 'SchemaForm',
	displayName: 'Schema Form',
	description: 'Schema Form component',
	component: SchemaForm,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: SchemaFormStyle,
	styleDefaults: styleDefaults,
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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 24">
					<path
						d="M0 9.75C0 7.67812 1.67812 6 3.75 6H12.75C13.5797 6 14.25 6.67031 14.25 7.5C14.25 8.32969 13.5797 9 12.75 9H3.75C3.3375 9 3 9.3375 3 9.75V20.25C3 20.6625 3.3375 21 3.75 21H23.25C23.6625 21 24 20.6625 24 20.25V14.25C24 13.4203 24.6703 12.75 25.5 12.75C26.3297 12.75 27 13.4203 27 14.25V20.25C27 22.3219 25.3219 24 23.25 24H3.75C1.67812 24 0 22.3219 0 20.25V9.75Z"
						fill="url(#paint0_linear_3214_9594)"
					/>
					<path
						className="_SchemaFormPen"
						d="M25.0739 0.671437L23.1901 2.56698L27.4275 6.83074L29.316 4.9734C30.2223 4.08054 30.2271 2.61472 29.335 1.71709L28.2911 0.671437C27.399 -0.226198 25.9565 -0.221424 25.0692 0.671437H25.0739ZM22.113 3.65082L15.318 10.4977C14.9858 10.8319 14.7343 11.2425 14.5872 11.6913L13.4579 15.0957C13.3203 15.5063 13.4294 15.9599 13.7331 16.2702C14.0368 16.5806 14.4876 16.6856 14.9004 16.5472L18.2932 15.406C18.7297 15.258 19.1283 15.0145 19.4557 14.6898L26.3408 7.90504L22.113 3.65082ZM7.3225 15.1864C7.3225 14.7812 7.16253 14.3925 6.87777 14.106C6.59301 13.8195 6.20679 13.6585 5.80407 13.6585C5.40136 13.6585 5.01514 13.8195 4.73038 14.106C4.44562 14.3925 4.28564 14.7812 4.28564 15.1864C4.28564 15.5916 4.44562 15.9802 4.73038 16.2668C5.01514 16.5533 5.40136 16.7143 5.80407 16.7143C6.20679 16.7143 6.59301 16.5533 6.87777 16.2668C7.16253 15.9802 7.3225 15.5916 7.3225 15.1864ZM10.3594 16.7143C10.7621 16.7143 11.1483 16.5533 11.4331 16.2668C11.7178 15.9802 11.8778 15.5916 11.8778 15.1864C11.8778 14.7812 11.7178 14.3925 11.4331 14.106C11.1483 13.8195 10.7621 13.6585 10.3594 13.6585C9.95665 13.6585 9.57043 13.8195 9.28567 14.106C9.00091 14.3925 8.84093 14.7812 8.84093 15.1864C8.84093 15.5916 9.00091 15.9802 9.28567 16.2668C9.57043 16.5533 9.95665 16.7143 10.3594 16.7143Z"
						fill="url(#paint1_linear_3214_9594)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9594"
							x1="13.5"
							y1="6"
							x2="13.5"
							y2="24"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9594"
							x1="17.1428"
							y1="0"
							x2="17.1428"
							y2="16.7143"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#F29754" />
							<stop offset="1" stopColor="#CD5C08" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
	],
};

export default component;
