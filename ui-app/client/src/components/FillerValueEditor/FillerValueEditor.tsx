import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import FillerValueEditorStyle from './FillerValueEditorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './fillerValueEditorProperties';
import { styleDefaults } from './fillerValueEditorStyleProperties';

const LazyFillerValueEditor = React.lazy(
	() => import(/* webpackChunkName: "FillerValueEditor" */ './LazyFillerValueEditor'),
);
function LoadLazyFillerValueEditor(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyFillerValueEditor {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'FillerValueEditor',
	displayName: 'Filler Value Editor',
	description: 'Filler Value Editor Component',
	component: LazyFillerValueEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: FillerValueEditorStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: [],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'UI Filler' },
		bindingPath2: { name: 'Server Filler' },
		bindingPath3: { name: 'Personalization' },
		bindingPath4: { name: 'Application' },
	},
	defaultTemplate: {
		key: '',
		name: 'Fillter Value Editor',
		type: 'FillerValueEditor',
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect width="30" height="30" fill="#F9F9F9" />
					<path
						d="M1 10.6875V21.25C1 23.0426 2.45742 24.5 4.25 24.5H23.75C25.5426 24.5 27 23.0426 27 21.25V10.6875L15.95 18.975C14.7922 19.8434 13.2078 19.8434 12.05 18.975L1 10.6875Z"
						fill="#EDEAEA"
						opacity="0.8"
					/>
					<path
						className="_FVEMailCloser"
						d="M1 7.4375C1 6.0918 2.0918 5 3.4375 5H24.5625C25.9082 5 27 6.0918 27 7.4375C27 8.2043 26.6395 8.92539 26.025 9.3875L14.975 17.675C14.3961 18.1066 13.6039 18.1066 13.025 17.675L1.975 9.3875C1.36055 8.92539 1 8.2043 1 7.4375Z"
						fill="#8267BE"
					/>
					<path
						className="_FVEMailPencil"
						d="M19.7557 18.8522L25.8371 12.7708C26.8648 11.7431 28.0021 11.7431 29.0298 12.7708C30.0576 13.7985 30.0576 14.9358 29.0298 15.9635L22.9484 22.045L19.7557 18.8522ZM22.1319 22.5055L19.5015 22.7978C19.2139 22.8298 18.9709 22.5868 19.0028 22.2992L19.2951 19.6687L22.1319 22.5055Z"
						fill="#8267BE"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9528"
							x1="14"
							y1="5"
							x2="14"
							y2="24.5"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EAEAEA" stopOpacity="0.8" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9528"
							x1="14"
							y1="5"
							x2="14"
							y2="24.5"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#B8A6DF" />
							<stop offset="1" stopColor="#8267BE" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3214_9528"
							x1="24.4003"
							y1="12"
							x2="24.4003"
							y2="22.8006"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#B8A6DF" />
							<stop offset="1" stopColor="#8267BE" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
	],
};

export default component;
