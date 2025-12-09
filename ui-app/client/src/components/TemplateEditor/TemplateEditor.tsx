import { duplicate, isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import useDefinition from '../util/useDefinition';
import TemplateEditorStyle from './TemplateEditorStyle';
import { styleProperties, styleDefaults } from './TemplateEditorStyleProperties';
import EmailEditor from './editors/EmailEditor';
import { propertiesDefinition, stylePropertiesDefinition } from './templateEditorProperties';
import InAppEditor from './editors/InAppEditor';

function TemplateEditor(props: Readonly<ComponentProps>) {
	const {
		pageDefinition: { translations },
		definition,
		definition: { bindingPath },
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const { properties: { templateType } = {}, stylePropertiesWithPseudoStates } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
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
	} else if (templateType === 'whatsapp') {
		editorComponent = <></>;
	} else if (templateType === 'inapp') {
		editorComponent = <InAppEditor template={template} onChange={onChange}></InAppEditor>;
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
					<rect
						x="0.5"
						y="0.5"
						width="29"
						height="29"
						rx="1.5"
						fill="white"
						stroke="#EDEAEA"
					/>
					<path
						d="M5.1197 17.1237L11.2011 11.0423C12.2288 10.0146 13.3661 10.0146 14.3939 11.0423C15.4216 12.07 15.4216 13.2073 14.3939 14.235L8.31244 20.3164L5.1197 17.1237ZM7.49592 20.777L4.86547 21.0693C4.57789 21.1012 4.33489 20.8582 4.36685 20.5707L4.65912 17.9402L7.49592 20.777Z"
						fill="#F94566"
						className="_TEIcon"
					/>
					<path
						d="M4 25C3.44772 25 3 24.5523 3 24C3 23.4477 3.44772 23 4 23H25C25.5523 23 26 23.4477 26 24C26 24.5523 25.5523 25 25 25H4Z"
						fill="#EDEAEA"
					/>
					<path
						d="M1 2C1 1.44772 1.44772 1 2 1H28C28.5523 1 29 1.44772 29 2V5H1V2Z"
						fill="#F94566"
					/>
					<rect x="3" y="2.5" width="4" height="1" rx="0.5" fill="white" />
				</IconHelper>
			),
		},
	],
	stylePropertiesForTheme: styleProperties,
};

export default component;
