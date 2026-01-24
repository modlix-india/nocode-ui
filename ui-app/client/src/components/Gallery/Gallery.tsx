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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 23">
					<path
						d="M29.8059 19.9991L29.8059 14.7734C29.8059 13.6689 28.9105 12.7734 27.8059 12.7734L2 12.7734C0.895433 12.7734 3.77556e-06 13.6689 3.72727e-06 14.7734L3.49885e-06 19.9991C3.45057e-06 21.1036 0.895431 21.9991 2 21.9991L27.8059 21.9991C28.9105 21.9991 29.8059 21.1036 29.8059 19.9991Z"
						fill="#AC94FF"
						className="_gallerymainframe"
					/>
					<path
						d="M27.6769 8.64471L27.6769 8.38672C27.6769 7.28215 26.7814 6.38672 25.6769 6.38672L4.12896 6.38672C3.02439 6.38672 2.12896 7.28215 2.12896 8.38672L2.12896 8.64471C2.12896 9.74927 3.02439 10.6447 4.12896 10.6447L25.6769 10.6447C26.7814 10.6447 27.6769 9.74928 27.6769 8.64471Z"
						fill="#AC94FF40"
						className="_gallerysecondframe"
					/>
					<path
						d="M24.1285 2.25799L24.1285 2C24.1285 0.89543 23.2331 -3.91404e-08 22.1285 -8.74227e-08L7.67727 -7.19108e-07C6.5727 -7.6739e-07 5.67727 0.895429 5.67727 2L5.67727 2.25799C5.67727 3.36256 6.5727 4.25799 7.67726 4.25799L22.1285 4.25799C23.2331 4.25799 24.1285 3.36256 24.1285 2.25799Z"
						fill="#AC94FF40"
						className="_galleryfirstframe"
					/>
				</IconHelper>
			),
		},
		{
			name: 'toolbarLeftColumn',
			displayName: 'Toolbar Left Column',
			description: 'Toolbar Left Column',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'toolbarRightColumn',
			displayName: 'Toolbar Right Column',
			description: 'Toolbar Right Column',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'toolbarButton',
			displayName: 'Toolbar Button',
			description: 'Toolbar Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'arrowButtons',
			displayName: 'Arrow Buttons',
			description: 'Arrow Buttons',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'slideImage',
			displayName: 'Slide Image',
			description: 'Slide Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumbnailContainer',
			displayName: 'Thumbnail Container',
			description: 'Thumbnail Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumbnailImageDiv',
			displayName: 'Thumbnail Image Div',
			description: 'Thumbnail Image Div',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'thumbnailImage',
			displayName: 'Thumbnail Image',
			description: 'Thumbnail Image',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previewContainer',
			displayName: 'Preview Container',
			description: 'Preview Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previewCloseButton',
			displayName: 'Preview Close Button',
			description: 'Preview Close Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previewList',
			displayName: 'Preview List',
			description: 'Preview List',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previewImageDiv',
			displayName: 'Preview Image Div',
			description: 'Preview Image Div',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'previewImage',
			displayName: 'Preview Image',
			description: 'Preview Image',
			icon: 'fa-solid fa-box',
		},
	],
	stylePropertiesForTheme: styleProperties,
};

export default component;
