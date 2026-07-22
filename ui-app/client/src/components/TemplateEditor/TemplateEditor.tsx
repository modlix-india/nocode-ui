import { duplicate, isNullValue } from '@fincity/kirun-js';
import React, { Suspense, useCallback, useState } from 'react';
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
import useDefinition from '../util/useDefinition';
import TemplateEditorStyle from './TemplateEditorStyle';
import { styleProperties, styleDefaults } from './TemplateEditorStyleProperties';
import { propertiesDefinition, stylePropertiesDefinition } from './templateEditorProperties';

const LazyTemplateEditor = React.lazy(
	() => import(/* webpackChunkName: "TemplateEditor" */ './LazyTemplateEditor'),
);

function TemplateEditor(props: Readonly<ComponentProps>) {
	const {
		definition,
		definition: { bindingPath },
		pageDefinition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const { properties: { templateType, aiEndpoint } = {}, stylePropertiesWithPseudoStates } =
		useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const resolvedStyles = processComponentStylePseudoClasses(
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
		(next: any) => {
			if (!bindingPathPath) return;
			setData(bindingPathPath, next, context.pageName);
		},
		[bindingPathPath, context.pageName],
	);

	return (
		<div className="comp compTemplateEditor" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			<Suspense fallback={<div className="_templateEditorLoading">Loading editor…</div>}>
				<LazyTemplateEditor
					template={template}
					onChange={onChange}
					lockedType={templateType}
					aiEndpoint={aiEndpoint}
					context={context}
					pageDefinition={pageDefinition}
					locationHistory={locationHistory}
					pageExtractor={pageExtractor}
				/>
			</Suspense>
		</div>
	);
}

const component: Component = {
	name: 'TemplateEditor',
	displayName: 'Template Editor',
	description: 'Drag-and-drop / code editor for email, PDF, in-app and messaging templates',
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
