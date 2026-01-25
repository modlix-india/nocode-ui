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
			pageExtractor.getPageName(),
			(_, value) => {
				if (isNullValue(value)) {
					setTemplate(undefined);
					return;
				}
				setTemplate(duplicate(value));
			},
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
		stylePropertiesForTheme: styleProperties,
};

export default component;
