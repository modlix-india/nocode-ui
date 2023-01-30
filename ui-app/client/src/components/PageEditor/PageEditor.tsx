import React, { useEffect, useState } from 'react';
import { HelperComponent } from '../HelperComponent';
import {
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentProps,
	DataLocation,
	RenderContext,
} from '../../types/common';
import {
	addListener,
	getData,
	getDataFromPath,
	PageStoreExtractor,
} from '../../context/StoreContext';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './pageProperties';
import GridStyle from './PageStyle';
import useDefinition from '../util/useDefinition';
import { Link } from 'react-router-dom';
import Children from '../Children';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import { runEvent } from '../util/runEvent';
import { flattenUUID } from '../util/uuid';

function PageEditor(props: ComponentProps) {
	const { definition, pageDefinition, locationHistory, context } = props;
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

	const resolvedStyles = processComponentStylePseudoClasses({}, stylePropertiesWithPseudoStates);

	return (
		<div className="comp compPageEditor" style={resolvedStyles.comp ?? {}}>
			<HelperComponent key={`${key}_hlp`} definition={definition} />
		</div>
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
