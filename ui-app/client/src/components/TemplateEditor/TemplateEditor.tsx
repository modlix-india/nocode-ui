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
				<IconHelper viewBox="0 0 24 24">
					<rect
						x="1"
						y="1"
						width="22"
						height="22"
						rx="2"
						fillOpacity="0.2"
						fill="currentColor"
					/>
					<path
						d="M17.0938 6.40625V9.27344H16.8125C16.6458 8.61198 16.4609 8.13802 16.2578 7.85156C16.0547 7.5599 15.776 7.32812 15.4219 7.15625C15.224 7.0625 14.8776 7.01562 14.3828 7.01562H13.5938V15.1875C13.5938 15.7292 13.6224 16.0677 13.6797 16.2031C13.7422 16.3385 13.8594 16.4583 14.0312 16.5625C14.2083 16.6615 14.4479 16.7109 14.75 16.7109H15.1016V17H9.55469V16.7109H9.90625C10.2135 16.7109 10.4609 16.6562 10.6484 16.5469C10.7839 16.474 10.8906 16.349 10.9688 16.1719C11.026 16.0469 11.0547 15.7188 11.0547 15.1875V7.01562H10.2891C9.57552 7.01562 9.05729 7.16667 8.73438 7.46875C8.28125 7.89062 7.99479 8.49219 7.875 9.27344H7.57812V6.40625H17.0938Z"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
