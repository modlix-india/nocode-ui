import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { getData } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { Location } from './types';
import { renderChildren } from './util/renderChildren';
import { updateLocationForChild } from './util/updateLoactionForChild';

export interface ArrayRepeatorProps {
	definition: {
		key: string;
		children: any;
		properties: {
			bindingPath: Location;
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
	locationHistory?: Array<Location | string>;
}

function ArrayRepeatorComponent(props: ArrayRepeatorProps) {
	const {
		definition: {
			children,
			properties: { bindingPath },
		},
		pageDefinition,
		locationHistory = [],
	} = props;
	const bindingPathData = getData({ location: bindingPath }, locationHistory);
	if (!Array.isArray(bindingPathData)) return <></>;
	const firstchild = {
		[Object.entries(children)[0][0]]: Object.entries(children)[0][1],
	};
	return (
		<div className="comp compArrayRepeator">
			<HelperComponent />
			{bindingPathData.map((_, index) =>
				renderChildren(pageDefinition, firstchild, [
					...locationHistory,
					updateLocationForChild(bindingPath, index, locationHistory),
				]),
			)}
		</div>
	);
}

ArrayRepeatorComponent.propertiesSchema = Schema.ofObject('ArrayRepeator')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['bindingPath', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export const ArrayRepeator = ArrayRepeatorComponent;
