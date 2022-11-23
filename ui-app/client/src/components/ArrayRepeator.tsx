import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { getData, getDataFromLocation, PageStoreExtractor } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { DataLocation, RenderContext } from './types';
import { renderChildren } from './util/renderChildren';
import { updateLocationForChild } from './util/updateLoactionForChild';

interface ArrayRepeatorProps {
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

function ArrayRepeatorComponent(props: ArrayRepeatorProps) {
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
		<div className="comp compArrayRepeator">
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

ArrayRepeatorComponent.propertiesSchema = Schema.ofObject('ArrayRepeator')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(new Map([['bindingPath', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)]]));

export default ArrayRepeatorComponent;
