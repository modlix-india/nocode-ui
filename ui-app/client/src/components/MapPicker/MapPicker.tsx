import React, { Suspense } from 'react';
import { Component, ComponentProps } from '../../types/common';
import MapPickerStyle from './MapPickerStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './mapPickerProperties';
import { styleDefaults, styleProperties } from './mapPickerStyleProperties';

const LazyMapPicker = React.lazy(
	() => import(/* webpackChunkName: "MapPicker" */ './LazyMapPicker'),
);

function LoadLazyMapPicker(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyMapPicker {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'MapPicker',
	displayName: 'Map Picker',
	description:
		'Pick one point on a Google map (click or drag the marker); writes {lat, lng} to the binding path, with an optional radius circle.',
	component: LoadLazyMapPicker,
	styleComponent: MapPickerStyle,
	styleDefaults,
	propertyValidation: () => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: [],
	bindingPaths: { bindingPath: { name: 'Point (lat, lng)' } },
	defaultTemplate: {
		key: '',
		type: 'MapPicker',
		name: 'MapPicker',
		properties: {},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;
