import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import ColorPickerStyle from './ColorPickerStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './colorPickerProperties';
import { styleDefaults, stylePropertiesForTheme } from './colorPickerStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { findPropertyDefinitions } from '../util/lazyStylePropertyUtil';

const LazyColorPicker = React.lazy(
	() => import(/* webpackChunkName: "ColorPicker" */ './LazyColorPicker'),
);
function LoadLazyColorPicker(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyColorPicker {...props} />
		</Suspense>
	);
}

const { designType, colorScheme } = findPropertyDefinitions(
	propertiesDefinition,
	'designType',
	'colorScheme',
);

const component: Component = {
	name: 'ColorPicker',
	displayName: 'Color Picker',
	description: 'ColorPicker component',
	component: LoadLazyColorPicker,
	styleComponent: ColorPickerStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (_props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['hover', 'disabled', 'focus'],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Data Binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'ColorPicker',
		type: 'ColorPicker',
		properties: {},
	},
	sections: [{ name: 'ColorPicker', pageName: 'colorPicker' }],
		propertiesForTheme: [designType, colorScheme],
	stylePropertiesForTheme: stylePropertiesForTheme,
	externalStylePropsForThemeJson: true,
};

export default component;
