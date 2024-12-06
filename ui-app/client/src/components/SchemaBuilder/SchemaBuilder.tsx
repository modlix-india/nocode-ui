import React, { useEffect } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
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
			<HelperComponent context={props.context} definition={definition} />
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
				<IconHelper viewBox="0 0 30 30">
					<path
						className="_SchemaBuilderDBTop"
						d="M25.9965 4.24528C25.9965 5.22035 24.6698 6.27991 22.448 7.0825C19.9361 7.99069 16.5786 8.49055 12.9982 8.49055C9.41788 8.49055 6.06042 7.99069 3.54851 7.0825C1.32671 6.27991 0 5.22035 0 4.24528C0 3.2702 1.32671 2.21064 3.54851 1.40805C6.06042 0.499858 9.41788 0 12.9982 0C16.5786 0 19.9361 0.499858 22.448 1.40805C24.6698 2.21064 25.9965 3.2702 25.9965 4.24528Z"
						fill="#EDEAEA"
					/>
					<path
						className="_SchemaBuilderDB1"
						d="M25.9965 6.77832V11.4108C25.9965 12.3859 24.6698 13.4454 22.448 14.248C19.9361 15.1562 16.5786 15.6561 12.9982 15.6561C9.41788 15.6561 6.06042 15.1562 3.54851 14.248C1.32671 13.4454 0 12.3859 0 11.4108V6.77832C0.137978 6.89448 0.290108 7.00361 0.449313 7.11273C0.502381 7.15145 0.558988 7.18666 0.615594 7.22538C0.675738 7.2641 0.739421 7.30634 0.803103 7.34506C0.831406 7.36266 0.859709 7.38026 0.888012 7.39786C0.941081 7.42954 0.997687 7.46122 1.05076 7.49291C1.07198 7.50699 1.09675 7.51755 1.11798 7.53163C1.15689 7.55275 1.19581 7.57387 1.23473 7.59499C1.25949 7.60907 1.28779 7.62315 1.31256 7.63723C1.35148 7.65835 1.39039 7.67947 1.42931 7.69707C1.46115 7.71467 1.49299 7.72875 1.5213 7.74636C1.54252 7.75692 1.56729 7.771 1.58852 7.78156C1.61328 7.79212 1.63451 7.80268 1.65927 7.81676C1.75833 7.86604 1.86093 7.9118 1.96353 7.95756C1.9883 7.96812 2.01306 7.97868 2.03429 7.98924C2.09444 8.01741 2.15812 8.04557 2.2218 8.07021C2.26072 8.08781 2.29963 8.10189 2.33501 8.11949C2.37393 8.13709 2.41285 8.15117 2.45176 8.16877C2.49068 8.18637 2.5296 8.20045 2.56851 8.21805C2.60389 8.23213 2.64281 8.24621 2.67819 8.26029C2.72064 8.2779 2.76664 8.2955 2.80909 8.30958C2.89046 8.34126 2.97183 8.37294 3.05674 8.4011C5.72786 9.36561 9.25868 9.89363 12.9982 9.89363C16.7378 9.89363 20.2686 9.36561 22.9327 8.4011C23.0176 8.36942 23.0989 8.34126 23.1803 8.30958C23.2263 8.29198 23.2688 8.2779 23.3112 8.26029C23.3466 8.24621 23.3855 8.23213 23.4209 8.21805C23.4598 8.20045 23.4987 8.18637 23.5376 8.16877C23.5766 8.15117 23.6155 8.13709 23.6544 8.11949C23.6933 8.10189 23.7322 8.08781 23.7676 8.07021C23.8313 8.04205 23.8914 8.01741 23.9551 7.98924C23.9799 7.97868 24.0046 7.96812 24.0259 7.95756C24.1285 7.9118 24.2311 7.86252 24.3301 7.81676C24.3549 7.8062 24.3761 7.79564 24.4009 7.78156C24.4221 7.771 24.4469 7.76044 24.4681 7.74636C24.4999 7.72875 24.5318 7.71467 24.5601 7.69707C24.599 7.67595 24.6379 7.65483 24.6768 7.63723C24.7051 7.62315 24.7299 7.60907 24.7547 7.59499C24.7936 7.57387 24.8325 7.55275 24.8714 7.53163C24.8962 7.51755 24.9174 7.50699 24.9386 7.49291C24.9952 7.46122 25.0483 7.42954 25.1014 7.39786C25.1297 7.38026 25.158 7.36266 25.1863 7.34506C25.25 7.30634 25.3137 7.26762 25.3738 7.22538C25.4304 7.19018 25.4835 7.15145 25.5401 7.11273C25.7064 7.00713 25.8585 6.89448 25.9965 6.77832Z"
						fill="#EDEAEA"
					/>
					<path
						className="_SchemaBuilderDB2"
						d="M25.9965 13.951V18.5835C25.9965 19.5586 24.6698 20.6182 22.448 21.4208C19.9361 22.329 16.5786 22.8288 12.9982 22.8288C9.41788 22.8288 6.06042 22.329 3.54851 21.4208C1.32671 20.6182 0 19.5586 0 18.5835V13.951C0.750034 14.5636 1.77956 15.1092 3.06382 15.5738C5.72786 16.5348 9.25514 17.0628 12.9982 17.0628C16.7413 17.0628 20.2686 16.5348 22.9327 15.5738C24.2169 15.1092 25.25 14.5636 25.9965 13.951Z"
						fill="#EDEAEA"
					/>
					<path
						className="_SchemaBuilderDB3"
						d="M0 25.7544V21.1219C0.750034 21.7345 1.77956 22.2801 3.06382 22.7447C5.72786 23.7057 9.25514 24.2373 12.9982 24.2373C16.7413 24.2373 20.2686 23.7092 22.9327 22.7447C24.2204 22.2801 25.25 21.7345 25.9965 21.1219V25.7544C25.9965 26.7295 24.6698 27.7891 22.448 28.5917C19.9361 29.4999 16.5786 29.9997 12.9982 29.9997C9.41788 29.9997 6.06042 29.4999 3.54851 28.5917C1.32671 27.7891 0 26.7295 0 25.7544Z"
						fill="#EDEAEA"
					/>
					<path
						className="_SchemaBuilderPen"
						d="M16.0484 20.5984L15.9772 20.6692L16.0484 20.7401L20.4604 25.1299L20.5309 25.2001L20.6015 25.1299L29.0052 16.7684C29.728 16.0492 30.0998 15.281 30.0998 14.5026C30.0998 13.7243 29.728 12.956 29.0052 12.2368C28.2823 11.5176 27.5104 11.1479 26.7287 11.1479C25.9469 11.1479 25.175 11.5176 24.4522 12.2368L16.0484 20.5984ZM19.4136 25.7917L19.6212 25.7688L19.4731 25.6214L15.553 21.721L15.4061 21.5748L15.3831 21.7808L14.9792 25.3975C14.9279 25.8572 15.3182 26.2445 15.7786 26.1936L19.4136 25.7917Z"
						fill="#F94A29"
						stroke="white"
						strokeWidth="0.2"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
