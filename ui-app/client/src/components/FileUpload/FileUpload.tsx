import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './fileUploadProperties';
import FileUploadStyles from './FileUploadStyles';
import { styleProperties, styleDefaults } from './fileUploadStyleProperties';
import { IconHelper } from '../util/IconHelper';

const LazyFileUpload = React.lazy(
	() => import(/* webpackChunkName: "FileUpload" */ './LazyFileUpload'),
);
function LoadLazyFileUpload(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyFileUpload {...props} />
		</Suspense>
	);
}

const component: Component = {
	order: 25,
	name: 'FileUpload',
	displayName: 'File Upload',
	description: 'FileUpload Component',
	component: LoadLazyFileUpload,
	styleComponent: FileUploadStyles,
	styleDefaults: styleDefaults,
	propertyValidation: (_props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover', 'disabled'],
	bindingPaths: {
		bindingPath: { name: 'File binding' },
		bindingPath2: { name: 'File full name binding' },
		bindingPath3: { name: 'File name binding' },
		bindingPath4: { name: 'File extension binding' },
		bindingPath5: { name: 'File size binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'FileUpload',
		type: 'FileUpload',
		properties: {},
	},
	sections: [{ name: 'File Upload', pageName: 'fileupload' }],
		stylePropertiesForTheme: styleProperties,
	externalStylePropsForThemeJson: true,
};

export default component;
