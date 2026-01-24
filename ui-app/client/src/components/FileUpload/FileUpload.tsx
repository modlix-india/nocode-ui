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
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 24 30">
					<path
						className="_fileUploadBG"
						d="M14.2958 6.09627V0H2.11268C0.947746 0 0 0.947747 0 2.11268V27.8873C0 29.0523 0.947746 30 2.11268 30H21.0963C22.2612 30 23.2089 29.0523 23.2089 27.8873V8.91317H17.1127C15.5594 8.91317 14.2958 7.64951 14.2958 6.09627Z"
						fill="#43B2FF"
					/>
					<path
						className="_fileUploadRC"
						d="M15.707 6.08405C15.707 6.86067 16.3389 7.4925 17.1155 7.4925H22.1675L15.707 1.0625V6.08405Z"
						fill="#43B2FF"
					/>
					<path
						className="_fileUploadAT"
						d="M5.88372 19.0316C5.54285 19.0316 5.35818 18.6325 5.57882 18.3727L10.724 12.3136C10.8827 12.1268 11.1705 12.1253 11.3311 12.3104L16.5866 18.3695C16.8112 18.6285 16.6273 19.0316 16.2844 19.0316L5.88372 19.0316Z"
						fill="white"
					/>
					<path
						className="_fileUploadAB"
						d="M13.5039 23.2891C13.5039 23.8413 13.0562 24.2891 12.5039 24.2891L9.38435 24.2891C8.83207 24.2891 8.38435 23.8413 8.38435 23.2891L8.38435 18.4381L13.5039 18.4381L13.5039 23.2891Z"
						fill="white"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'uploadButton',
			displayName: 'Upload Button',
			description: 'Uplaod Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedFiles',
			displayName: 'Selected Files',
			description: 'Selected Files',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'icon',
			displayName: 'Icon',
			description: 'Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'closeIcon',
			displayName: 'Close Icon',
			description: 'Close Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'validationMessagesContainer',
			displayName: 'Validation Messages Container',
			description: 'Validation Messages Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'validationMessage',
			displayName: 'Validation Message',
			description: 'Validation Message',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'supportText',
			displayName: 'Support Text',
			description: 'Support Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'subText',
			displayName: 'Sub Text',
			description: 'Sub Text',
			icon: 'fa-solid fa-box',
		},
	],
	stylePropertiesForTheme: styleProperties,
	externalStylePropsForThemeJson: true,
};

export default component;
