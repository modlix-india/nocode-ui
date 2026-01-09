import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { IconHelper } from '../util/IconHelper';
import ThemeEditorStyle from './ThemeEditorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './themeEditorProperties';
import { styleDefaults, styleProperties } from './themeEditorStyleProperties';

const LazyThemeEditor = React.lazy(
	() => import(/* webpackChunkName: "ThemeEditor" */ './LazyThemeEditor'),
);
function LoadLazyThemeEditor(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyThemeEditor {...props} />
		</Suspense>
	);
}

const component: Component = {
	name: 'ThemeEditor',
	displayName: 'Theme Editor',
	description: 'Theme component',
	styleComponent: ThemeEditorStyle,
	styleDefaults: styleDefaults,
	component: LoadLazyThemeEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Theme Binding' },
	},
	stylePseudoStates: [],
	defaultTemplate: {
		key: '',
		name: 'Theme Editor',
		type: 'ThemeEditor',
		properties: {},
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 32 32">
					<style type="text/css">
						{`.cubies_zesentwintig{fill:#65C3AB;}
	.cubies_acht{fill:#8E7866;}
	.cubies_zeven{fill:#725A48;}
	.cubies_eenentwintig{fill:#C9483A;}
	.cubies_zevenentwintig{fill:#98D3BC;}
	.cubies_tweeentwintig{fill:#D97360;}
	.cubies_vijf{fill:#C9C6C0;}
	.cubies_zes{fill:#EDEAE5;}
	.st0{fill:#F2C99E;}
	.st1{fill:#F9E0BD;}
	.st2{fill:#725A48;}
	.st3{fill:#CCE2CD;}
	.st4{fill:#EDB57E;}
	.st5{fill:#EC9B5A;}
	.st6{fill:#4C4842;}
	.st7{fill:#67625D;}
	.st8{fill:#FFF2DF;}
	.st9{fill:#A4C83F;}
	.st10{fill:#BCD269;}
	.st11{fill:#D1DE8B;}
	.st12{fill:#E69D8A;}
	.st13{fill:#E3D4C0;}
	.st14{fill:#C6B5A2;}
	.st15{fill:#837F79;}
	.st16{fill:#A5A29C;}
	.st17{fill:#2EB39A;}
	.st18{fill:#AB9784;}`}
					</style>
					<g>
						<path
							className="cubies_vijf"
							d="M1.244,21c1.125,0,2.203,0.447,2.998,1.242l1.76,1.76c1.656,1.656,4.34,1.656,5.996,0l0.004-0.004   c1.656-1.656,4.34-1.656,5.996,0l0.004,0.004c1.656,1.656,4.34,1.656,5.996,0l1.76-1.76C26.553,21.447,27.632,21,28.756,21H32v-3H0   v3H1.244z"
						/>
						<path
							className="cubies_eenentwintig"
							d="M28.756,21c-1.125,0-2.203,0.447-2.998,1.242l-1.76,1.76c-1.656,1.656-4.344,1.652-6-0.004   s-4.34-1.656-5.996,0s-4.344,1.66-6,0.004l-1.76-1.76C3.447,21.447,2.368,21,1.244,21H0v8c0,1.657,1.343,3,3,3h26   c1.657,0,3-1.343,3-3v-8H28.756z"
						/>
						<rect x="0" y="14" className="cubies_zesentwintig" width="32" height="4" />
						<path
							className="cubies_zeven"
							d="M29,6h-8V3c0-1.657-1.343-3-3-3h-4c-1.657,0-3,1.343-3,3v3H3C1.343,6,0,7.343,0,9v5h32V9   C32,7.343,30.657,6,29,6z"
						/>
						<path
							className="cubies_acht"
							d="M27,6h-8V3c0-1.657-1.343-3-3-3h-2c-1.657,0-3,1.343-3,3v3H3C1.343,6,0,7.343,0,9v5h30V9   C30,7.343,28.657,6,27,6z"
						/>
						<rect
							x="0"
							y="14"
							className="cubies_zevenentwintig"
							width="30"
							height="4"
						/>
						<path
							className="cubies_tweeentwintig"
							d="M28.756,21c-1.125,0-2.203,0.447-2.998,1.242l-1.76,1.76c-1.656,1.656-4.344,1.652-6-0.004   s-4.34-1.656-5.996,0s-4.344,1.66-6,0.004l-1.76-1.76C3.447,21.447,2.368,21,1.244,21H0v8c0,1.657,1.343,3,3,3h24   c1.657,0,3-1.343,3-3v-8H28.756z"
						/>
						<path
							className="cubies_zes"
							d="M1.244,21c1.125,0,2.203,0.447,2.998,1.242l1.76,1.76c1.656,1.656,4.34,1.656,5.996,0l0.004-0.004   c1.656-1.656,4.34-1.656,5.996,0l0.004,0.004c1.656,1.656,4.34,1.656,5.996,0l1.76-1.76C26.553,21.447,27.632,21,28.756,21H30v-3H0   v3H1.244z"
						/>
						<circle className="cubies_zeven" cx="15" cy="3" r="1" />
					</g>
				</IconHelper>
			),
			mainComponent: true,
		},
	],
	stylePropertiesForTheme: styleProperties,
};

export default component;
