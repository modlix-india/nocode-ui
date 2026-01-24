import React, { Suspense } from 'react';
import { ComponentProps, ComponentPropertyDefinition } from '../../types/common';
import { Component } from '../../types/common';
import GalleryStyle from './GalleryStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './galleryProperties';
import { styleProperties, styleDefaults } from './galleryStyleProperties';
import { IconHelper } from '../util/IconHelper';

const LazyGallery = React.lazy(() => import(/* webpackChunkName: "Gallery" */ './LazyGallery'));
function LoadLazyGallery(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyGallery {...props} />
		</Suspense>
	);
}

const component: Component = {
	order: 12,
	name: 'Gallery',
	displayName: 'Gallery',
	description: 'Gallery component',
	component: LoadLazyGallery,
	propertyValidation: (_props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: GalleryStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	allowedChildrenType: new Map<string, number>([['', -1]]),
	bindingPaths: {
		bindingPath: { name: 'Toggle Binding' },
		bindingPath2: { name: 'Starting Image Source Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'Gallery',
		name: 'Gallery',
	},
	needShowInDesginMode: true,
		stylePropertiesForTheme: styleProperties,
};

export default component;
