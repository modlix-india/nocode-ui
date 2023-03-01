import React, { useEffect } from 'react';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { getPathFromLocation, PageStoreExtractor, setData } from '../../context/StoreContext';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './pageEditorProperties';
import GridStyle from './PageEditorStyle';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import PageEditorContext from './context/PageEditorContext';

function PageEditor(props: ComponentProps) {
	const {
		definition,
		definition: { bindingPath, bindingPath2 },
		pageDefinition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: { onSave, onChangePersonalization } = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const defPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const personalizationPath = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
		: undefined;

	const resolvedStyles = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);

	useEffect(() => setData('Store.pageData._global.collapseMenu', true));

	return (
		<PageEditorContext>
			<div className="comp compPageEditor" style={resolvedStyles.comp ?? {}}>
				<HelperComponent key={`${key}_hlp`} definition={definition} />
			</div>
		</PageEditorContext>
	);
}

const component: Component = {
	name: 'PageEditor',
	displayName: 'Page Editor',
	description: 'Page Editor component',
	component: PageEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: GridStyle,
};

export default component;
