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
import { IconHelper } from '../util/IconHelper';

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
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M19.3217 4.76593C19.3217 5.42186 18.4337 6.13462 16.9467 6.67452C15.2654 7.28545 13.0182 7.6217 10.6218 7.6217C8.22541 7.6217 5.97821 7.28545 4.29695 6.67452C2.80986 6.13462 1.92188 5.42186 1.92188 4.76593C1.92188 4.11 2.80986 3.39724 4.29695 2.85734C5.97821 2.24641 8.22541 1.91016 10.6218 1.91016C13.0182 1.91016 15.2654 2.24641 16.9467 2.85734C18.4337 3.39724 19.3217 4.11 19.3217 4.76593Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M19.3217 6.47119V9.58744C19.3217 10.2434 18.4337 10.9561 16.9467 11.496C15.2654 12.107 13.0182 12.4432 10.6218 12.4432C8.22541 12.4432 5.97821 12.107 4.29695 11.496C2.80986 10.9561 1.92188 10.2434 1.92188 9.58744V6.47119C2.01423 6.54933 2.11605 6.62274 2.22261 6.69615C2.25813 6.7222 2.29601 6.74588 2.3339 6.77192C2.37416 6.79797 2.41678 6.82639 2.4594 6.85243C2.47835 6.86427 2.49729 6.87611 2.51624 6.88795C2.55176 6.90927 2.58964 6.93058 2.62516 6.95189C2.63937 6.96136 2.65595 6.96847 2.67015 6.97794C2.6962 6.99215 2.72225 7.00635 2.7483 7.02056C2.76487 7.03003 2.78382 7.0395 2.80039 7.04898C2.82644 7.06318 2.85249 7.07739 2.87854 7.08923C2.89985 7.10107 2.92116 7.11054 2.9401 7.12238C2.95431 7.12949 2.97089 7.13896 2.98509 7.14606C3.00167 7.15317 3.01588 7.16027 3.03245 7.16974C3.09876 7.20289 3.16743 7.23368 3.2361 7.26446C3.25267 7.27157 3.26925 7.27867 3.28346 7.28577C3.32371 7.30472 3.36634 7.32366 3.40896 7.34024C3.43501 7.35208 3.46106 7.36155 3.48474 7.37339C3.51078 7.38523 3.53683 7.3947 3.56288 7.40654C3.58893 7.41838 3.61497 7.42785 3.64102 7.43969C3.6647 7.44916 3.69075 7.45864 3.71443 7.46811C3.74284 7.47995 3.77363 7.49179 3.80204 7.50126C3.85651 7.52257 3.91097 7.54388 3.9678 7.56283C5.75562 8.21165 8.11886 8.56685 10.6218 8.56685C13.1247 8.56685 15.488 8.21165 17.2711 7.56283C17.3279 7.54151 17.3824 7.52257 17.4368 7.50126C17.4676 7.48942 17.496 7.47995 17.5244 7.46811C17.5481 7.45864 17.5742 7.44916 17.5978 7.43969C17.6239 7.42785 17.6499 7.41838 17.676 7.40654C17.702 7.3947 17.7281 7.38523 17.7541 7.37339C17.7802 7.36155 17.8062 7.35208 17.8299 7.34024C17.8725 7.32129 17.9128 7.30472 17.9554 7.28577C17.972 7.27867 17.9886 7.27157 18.0028 7.26446C18.0714 7.23368 18.1401 7.20053 18.2064 7.16974C18.223 7.16264 18.2372 7.15554 18.2538 7.14606C18.268 7.13896 18.2846 7.13186 18.2988 7.12238C18.3201 7.11054 18.3414 7.10107 18.3603 7.08923C18.3864 7.07502 18.4124 7.06082 18.4385 7.04898C18.4574 7.0395 18.474 7.03003 18.4906 7.02056C18.5166 7.00635 18.5427 6.99215 18.5687 6.97794C18.5853 6.96847 18.5995 6.96136 18.6137 6.95189C18.6516 6.93058 18.6871 6.90927 18.7226 6.88795C18.7416 6.87611 18.7605 6.86427 18.7795 6.85243C18.8221 6.82639 18.8647 6.80034 18.905 6.77192C18.9429 6.74824 18.9784 6.7222 19.0163 6.69615C19.1276 6.62511 19.2294 6.54933 19.3217 6.47119Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M19.3217 11.2944V14.4107C19.3217 15.0666 18.4337 15.7794 16.9467 16.3193C15.2654 16.9302 13.0182 17.2665 10.6218 17.2665C8.22541 17.2665 5.97821 16.9302 4.29695 16.3193C2.80986 15.7794 1.92188 15.0666 1.92188 14.4107V11.2944C2.42388 11.7065 3.11296 12.0735 3.97254 12.3861C5.75562 13.0325 8.11649 13.3877 10.6218 13.3877C13.1271 13.3877 15.488 13.0325 17.2711 12.3861C18.1306 12.0735 18.8221 11.7065 19.3217 11.2944Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M1.92188 19.2344V16.1182C2.42388 16.5302 3.11296 16.8972 3.97254 17.2098C5.75562 17.8563 8.11649 18.2138 10.6218 18.2138C13.1271 18.2138 15.488 17.8586 17.2711 17.2098C18.133 16.8972 18.8221 16.5302 19.3217 16.1182V19.2344C19.3217 19.8903 18.4337 20.6031 16.9467 21.143C15.2654 21.7539 13.0182 22.0902 10.6218 22.0902C8.22541 22.0902 5.97821 21.7539 4.29695 21.143C2.80986 20.6031 1.92188 19.8903 1.92188 19.2344Z"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<path
						d="M12.5339 15.6384L12.3571 15.8152L12.5339 15.992L15.4869 18.945L15.6637 19.1218L15.8404 18.945L21.4652 13.3202C21.9723 12.8132 22.2513 12.2525 22.2513 11.667C22.2513 11.0814 21.9723 10.5208 21.4652 10.0137C20.9581 9.50661 20.3975 9.22754 19.8119 9.22754C19.2263 9.22754 18.6657 9.50661 18.1586 10.0137L12.5339 15.6384ZM14.9361 19.4427L15.453 19.3852L15.0852 19.0174L12.4614 16.3936L12.0936 16.0258L12.0362 16.5428L11.7659 18.9757C11.7186 19.401 12.0779 19.7602 12.5031 19.713L14.9361 19.4427Z"
						fill="currentColor"
						stroke="white"
						strokeWidth="0.5"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
