import { duplicate, isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import useDefinition from '../util/useDefinition';
import TemplateEditorStyle from './TemplateEditorStyle';
import { styleDefaults } from './TemplateEditorStyleProperties';
import EmailEditor from './email/EmailEditor';
import { propertiesDefinition, stylePropertiesDefinition } from './templateEditorProperties';

function TemplateEditor(props: ComponentProps) {
	const {
		pageDefinition: { translations },
		definition,
		definition: { bindingPath },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { properties: { templateType } = {}, stylePropertiesWithPseudoStates } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const [template, setTemplate] = useState<any>(undefined);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				if (isNullValue(value)) {
					setTemplate(undefined);
					return;
				}
				setTemplate(duplicate(value));
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const onChange = useCallback(
		(template: any) => {
			if (!bindingPathPath) return;
			setData(bindingPathPath, template, context.pageName);
		},
		[bindingPathPath],
	);

	let editorComponent: React.JSX.Element | undefined = undefined;
	if (templateType === 'email') {
		editorComponent = <EmailEditor template={template} onChange={onChange}></EmailEditor>;
	}

	return (
		<div className={`comp compTemplateEditor`} style={styleProperties.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			{editorComponent}
		</div>
	);
}

const component: Component = {
	name: 'TemplateEditor',
	displayName: 'Template Editor',
	description: 'Template Editor',
	component: TemplateEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TemplateEditorStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Template' },
	},
	defaultTemplate: {
		key: '',
		type: 'TemplateEditor',
		name: 'Template Editor',
		properties: {},
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" rx="2" fill="white" />
					<rect
						x="0.5"
						y="0.5"
						width="29"
						height="29"
						rx="1.5"
						stroke="black"
						fillOpacity={0}
						strokeOpacity="0.3"
					/>
					<rect
						className="_TEWindow"
						x="3"
						y="10"
						width="10"
						height="8"
						rx="1"
						fill="url(#paint0_linear_3818_9747)"
					/>
					<path
						className="_TEfirstline"
						d="M17 12C16.4477 12 16 11.5523 16 11C16 10.4477 16.4477 10 17 10H25C25.5523 10 26 10.4477 26 11C26 11.5523 25.5523 12 25 12H17Z"
						fill="url(#paint1_linear_3818_9747)"
					/>
					<path
						className="_TEsecondline"
						d="M17 18C16.4477 18 16 17.5523 16 17C16 16.4477 16.4477 16 17 16H25C25.5523 16 26 16.4477 26 17C26 17.5523 25.5523 18 25 18H17Z"
						fill="url(#paint2_linear_3818_9747)"
					/>
					<path
						className="_TEthirdline"
						d="M4 24C3.44772 24 3 23.5523 3 23C3 22.4477 3.44772 22 4 22H25C25.5523 22 26 22.4477 26 23C26 23.5523 25.5523 24 25 24H4Z"
						fill="url(#paint3_linear_3818_9747)"
					/>
					<path
						d="M1 2C1 1.44772 1.44772 1 2 1H28C28.5523 1 29 1.44772 29 2V5H1V2Z"
						fill="url(#paint4_linear_3818_9747)"
					/>
					<rect
						className="_TEHeaderline"
						x="3"
						y="2.5"
						width="4"
						height="1"
						rx="0.5"
						fill="white"
					/>
					<path d="M1 5.5H29" stroke="black" strokeOpacity="0.3" />
					<defs>
						<linearGradient
							id="paint0_linear_3818_9747"
							x1="3"
							y1="14"
							x2="13"
							y2="14"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#FBDAC5" />
							<stop offset="1" stopColor="#FAAB78" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3818_9747"
							x1="16"
							y1="11"
							x2="26"
							y2="11"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3818_9747"
							x1="16"
							y1="17"
							x2="26"
							y2="17"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint3_linear_3818_9747"
							x1="3"
							y1="23"
							x2="26"
							y2="23"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint4_linear_3818_9747"
							x1="1"
							y1="3"
							x2="29"
							y2="3"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#FBDAC5" />
							<stop offset="1" stopColor="#FAAB78" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
	],
};

export default component;
