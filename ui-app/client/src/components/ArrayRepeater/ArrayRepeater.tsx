import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import {
	addListener,
	getData,
	getDataFromLocation,
	getPathFromLocation,
	PageStoreExtractor,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import {
	ComponentPropertyDefinition,
	ComponentProps,
	DataLocation,
	RenderContext,
} from '../../types/common';
import { renderChildren } from '../util/renderChildren';
import { updateLocationForChild } from '../util/updateLoactionForChild';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './ArrayRepeaterProperties';
import ArrayRepeaterStyle from './ArrayRepeaterStyle';
import useDefinition from '../util/useDefinition';

function ArrayRepeaterComponent(props: ComponentProps) {
	const [value, setValue] = React.useState([]);
	const {
		definition: { children, bindingPath },
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: { isItemDraggable, showMove, showDelete, showAdd } = {},
		styleProperties,
		key,
	} = useDefinition(definition, propertiesDefinition, locationHistory, pageExtractor);
	if (!bindingPath) throw new Error('Definition requires bindingpath');
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory, pageExtractor);
	React.useEffect(() => {
		addListener(
			(_, value) => {
				setValue(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);
	if (!Array.isArray(value)) return <></>;
	const firstchild = {
		[Object.entries(children)[0][0]]: Object.entries(children)[0][1],
	};
	return (
		<div className="comp compArrayRepeater">
			<HelperComponent definition={definition} />
			{value.map((_, index) =>
				renderChildren(pageDefinition, firstchild, context, [
					...locationHistory,
					updateLocationForChild(bindingPath!, index, locationHistory),
				]),
			)}
		</div>
	);
}

const component: Component = {
	name: 'ArrayRepeater',
	displayName: 'Array Repeater',
	description: 'Array Repeater component',
	component: ArrayRepeaterComponent,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: ArrayRepeaterStyle,
};

export default component;
