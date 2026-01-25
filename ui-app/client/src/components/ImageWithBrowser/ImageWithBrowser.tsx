import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './imageWithBrowserProperties';
import ImageStyle from './ImageWithBrowserStyles';
import { styleProperties, styleDefaults } from './imageWithBrowserStyleProperties';
import { IconHelper } from '../util/IconHelper';

const LazyImageWithBrowser = React.lazy(
	() => import(/* webpackChunkName: "ImageWithBrowser" */ './LazyImageWithBrowser'),
);
function LoadLazyImageWithBrowser(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyImageWithBrowser {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'ImageWithBrowser',
	displayName: 'Image With Browser',
	description: 'Image With Browser Component',
	component: LoadLazyImageWithBrowser,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: ImageStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover'],
	defaultTemplate: {
		key: '',
		name: 'imageWithBrowser',
		type: 'ImageWithBrowser',
		properties: {
			src: { value: 'api/files/static/file/SYSTEM/appbuilder/Placeholder_view_vector.svg' },
			alt: { value: 'Placeholder image' },
		},
	},
	bindingPaths: {
		bindingPath: { name: 'Source Path' },
		bindingPath2: { name: 'Source Path for Tablet landscape screen' },
		bindingPath3: { name: 'Source Path for Tablet portrait screen' },
		bindingPath4: { name: 'Source Path for Mobile landscape screen' },
		bindingPath5: { name: 'Source Path for Mobile portrait screen' },
		bindingPath6: { name: 'FallBack Image' },
		bindingPath7: { name: 'Alt text' },
	},
		stylePropertiesForTheme: styleProperties,
};

export default component;
