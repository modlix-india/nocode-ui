import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import { getData, getDataFromLocation, PageStoreExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { DataLocation, RenderContext } from '../../types/common';
import { renderChildren } from '../util/renderChildren';
import { updateLocationForChild } from '../util/updateLoactionForChild';
import { Component } from '../../types/common';
import properties from './ArrayRepeaterProperties';
import ArrayRepeaterStyle from './ArrayRepeaterStyle';

interface ArrayRepeaterProps {
	definition: {
		key: string;
		children: any;
		properties: {
			bindingPath: DataLocation;
		};
	};
	pageDefinition: {
		eventFunctions: {
			[key: string]: any;
		};
		translations: {
			[key: string]: {
				[key: string]: string;
			};
		};
	};
	locationHistory: Array<DataLocation | string>;
	context: RenderContext;
}

function ArrayRepeaterComponent(props: ArrayRepeaterProps) {
	const {
		definition: {
			children,
			properties: { bindingPath },
		},
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const bindingPathData = getDataFromLocation(bindingPath, locationHistory, pageExtractor);
	if (!Array.isArray(bindingPathData)) return <></>;
	const firstchild = {
		[Object.entries(children)[0][0]]: Object.entries(children)[0][1],
	};
	return (
		<div className="comp compArrayRepeater">
			<HelperComponent definition={definition} />
			{bindingPathData.map((_, index) =>
				renderChildren(pageDefinition, firstchild, context, [
					...locationHistory,
					updateLocationForChild(bindingPath, index, locationHistory),
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
	propertyValidation: (props: ArrayRepeaterProps): Array<string> => [],
	properties,
	styleComponent: ArrayRepeaterStyle,
};

export default component;
